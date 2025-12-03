"""
FastAPI endpoints for dataset operations
Provides endpoints to query and filter the mobile phones dataset
"""

import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

# Dataset cache
_dataset_cache = None
_dataset_path = None


def extract_numeric_value(value: Any) -> Optional[float]:
    """
    Extract numeric value from strings with units (e.g., '6.1 inches', '5000 mAh', '128 GB')
    Returns None if extraction fails or value is invalid
    """
    if pd.isna(value):
        return None

    # If already a number, return it
    if isinstance(value, (int, float)):
        return float(value)

    # Convert to string and extract first numeric value
    value_str = str(value).strip()

    # Use regex to find first numeric value (including decimals)
    match = re.search(r"(\d+\.?\d*)", value_str)
    if match:
        try:
            return float(match.group(1))
        except (ValueError, AttributeError):
            return None

    return None


def clear_dataset_cache():
    """Clear the dataset cache - useful for debugging"""
    global _dataset_cache, _dataset_path
    _dataset_cache = None
    _dataset_path = None


def find_dataset_file() -> Optional[Path]:
    """Find the dataset CSV file"""
    project_root = Path(__file__).parent.parent
    logging.getLogger("python_api").debug("Looking for dataset file, project root: %s", project_root)

    # Try different possible locations (prefer cleaned/final datasets)
    possible_paths = [
        project_root / "data" / "Mobiles_Dataset_Final.csv",  # Production-ready dataset
        project_root / "data" / "Mobiles_Dataset_Cleaned.csv",  # Cleaned dataset
        project_root / "data" / "Mobiles Dataset (2025).csv",  # Original dataset
        project_root / "Mobiles Dataset (2025).csv",
        project_root / "mobiles-dataset-docs" / "Mobiles Dataset (2025).csv",
        project_root / "public" / "dataset_with_images.csv",
        project_root / "data" / "dataset_with_images.csv",
    ]

    for path in possible_paths:
        logging.getLogger("python_api").debug("Checking path: %s - exists: %s", path, path.exists())
        if path.exists():
            logging.getLogger("python_api").info("Found dataset file: %s", path)
            return path

    logging.getLogger("python_api").warning("No dataset file found in any location")
    return None


def load_dataset() -> Optional[pd.DataFrame]:
    """Load and cache the dataset"""
    global _dataset_cache, _dataset_path

    # Return cached dataset if available
    if _dataset_cache is not None:
        return _dataset_cache

    dataset_path = find_dataset_file()
    if not dataset_path:
        return None

    try:
        # Try different encodings
        encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
        df = None

        for encoding in encodings:
            try:
                df = pd.read_csv(dataset_path, encoding=encoding, low_memory=False, on_bad_lines="skip")
                print(f"[DEBUG] Successfully loaded dataset with encoding: {encoding}, shape: {df.shape}")
                break
            except UnicodeDecodeError:
                print(f"[DEBUG] Failed to load with encoding {encoding}, trying next...")
                continue
            except Exception as e:
                print(f"[DEBUG] Error loading dataset with {encoding}: {e}")
                continue

        if df is None:
            print("[DEBUG] Failed to load dataset with any encoding")
            return None

        # Cache the dataset
        _dataset_cache = df
        _dataset_path = dataset_path

        return df

    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None


class ModelResponse(BaseModel):
    """Response model for a mobile phone model"""

    model_name: Optional[str] = Field(None, description="Model name")
    company: Optional[str] = Field(None, description="Company/brand")
    price: Optional[float] = Field(None, description="Price")
    ram: Optional[float] = Field(None, description="RAM in GB")
    battery: Optional[float] = Field(None, description="Battery capacity in mAh")
    screen_size: Optional[float] = Field(None, description="Screen size in inches")
    storage: Optional[float] = Field(None, description="Storage capacity in GB")
    camera: Optional[str] = Field(None, description="Camera specifications")
    processor: Optional[str] = Field(None, description="Processor")
    image_path: Optional[str] = Field(None, description="Path to model image")
    weight: Optional[float] = Field(None, description="Weight in grams")
    year: Optional[int] = Field(None, description="Launch year")


ConfigDict(from_attributes=True)


class DatasetStatsResponse(BaseModel):
    """Response model for dataset statistics"""

    total_models: int
    total_companies: int
    price_range: Dict[str, float]
    avg_specs: Dict[str, float]


@router.get("/models-by-price")
async def get_models_by_price(
    price: float = Query(..., description="Target price in USD", ge=0),
    tolerance: float = Query(0.2, description="Price tolerance (0.2 = ±20%)", ge=0, le=1),
    maxResults: int = Query(100, description="Maximum number of results", ge=1, le=1000),
) -> List[ModelResponse]:
    """
    Get mobile phone models within a price range

    Example:
        GET /api/dataset/models-by-price?price=500&tolerance=0.2&maxResults=50
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        # Calculate price range
        min_price = price * (1 - tolerance)
        max_price = price * (1 + tolerance)

        # Use the cleaned dataset columns - prefer price_usd
        price_col = None
        price_columns = [
            "price_usd",
            "price_eur",
            "price_inr",
            "price_cny",
            "price_aed",
            "price_pkr",
            "Current Price (Greece)",
            "Current Price (USA)",
            "Current Price (Europe)",
            "Price",
            "Current Price",
            "price",
        ]

        for col in price_columns:
            if col in df.columns and df[col].notna().any():
                price_col = col
                break

        if price_col is None:
            raise HTTPException(status_code=500, detail="No price column found in dataset")

        # Filter by price range
        price_mask = df[price_col].between(min_price, max_price)
        filtered_df = df[price_mask].head(maxResults)

        # Convert to response format
        results = []
        for _, row in filtered_df.iterrows():
            # Use cleaned dataset columns (lowercase names)
            model_name = str(row.get("model", "")) if pd.notna(row.get("model")) else None
            company = str(row.get("company", "")) if pd.notna(row.get("company")) else None

            # Get price directly (already numeric in cleaned dataset)
            parsed_price = float(row.get(price_col)) if pd.notna(row.get(price_col)) else None

            # Get specs directly (already numeric in cleaned dataset)
            parsed_ram = float(row.get("ram")) if pd.notna(row.get("ram")) else None
            parsed_battery = float(row.get("battery")) if pd.notna(row.get("battery")) else None
            parsed_screen = float(row.get("screen")) if pd.notna(row.get("screen")) else None
            parsed_storage = float(row.get("storage")) if pd.notna(row.get("storage")) else None

            # Get camera data
            front_cam = row.get("front_camera")
            back_cam = row.get("back_camera")
            camera_str = None
            if pd.notna(front_cam) and pd.notna(back_cam):
                camera_str = f"{int(front_cam)}MP + {int(back_cam)}MP"

            # Get processor
            processor = str(row.get("processor", "")) if pd.notna(row.get("processor")) else None

            model = ModelResponse(
                model_name=model_name,
                company=company,
                price=parsed_price,
                ram=parsed_ram,
                battery=parsed_battery,
                screen_size=parsed_screen,
                storage=parsed_storage,
                camera=camera_str,
                processor=processor,
                image_path=None,
            )
            results.append(model)

        return results

    except Exception as e:
        import traceback

        print(f"[ERROR] Models by price failed: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error filtering models by price: {str(e)}")


@router.get("/stats")
async def get_dataset_stats() -> DatasetStatsResponse:
    """
    Get basic statistics about the dataset

    Example:
        GET /api/dataset/stats
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        # Find price column - check various possible price column names
        price_columns = [
            "Current Price (Greece)",
            "Current Price (USA)",
            "Current Price (Europe)",
            "Launched Price (USA)",
            "Launched Price (Europe)",
            "Launched Price (India)",
            "Launched Price (China)",
            "Launched Price (Pakistan)",
            "Launched Price (Dubai)",
            "Price",
            "Current Price",
            "Launched Price",
            "price",
            "Price_USD",
        ]
        price_col = None
        for col in price_columns:
            if col in df.columns:
                price_col = col
                break

        # Calculate stats
        total_models = len(df)

        # Get unique companies
        company_columns = ["Company Name", "Company", "Brand", "company", "brand"]
        companies = set()
        for col in company_columns:
            if col in df.columns:
                companies.update(df[col].dropna().unique())
        total_companies = len(companies)

        # Price range - handle currency strings
        price_range = {"min": 0, "max": 0}
        if price_col:

            def extract_price(value):
                if pd.isna(value):
                    return None
                str_val = str(value).strip()
                if str_val.startswith("EUR"):
                    str_val = str_val[3:].strip()
                elif str_val.startswith("$"):
                    str_val = str_val[1:].strip()
                elif str_val.startswith("USD"):
                    str_val = str_val[3:].strip()
                try:
                    return float(str_val.replace(",", ""))
                except (ValueError, AttributeError):
                    return None

            prices = df[price_col].apply(extract_price).dropna()
            if not prices.empty:
                price_range = {"min": float(prices.min()), "max": float(prices.max())}

        # Average specs
        avg_specs = {}
        spec_columns = {
            "ram": ["RAM", "Ram"],
            "battery": ["Battery", "battery"],
            "screen_size": ["Screen Size", "screen_size"],
            "storage": ["Storage", "storage"],
        }

        for spec_name, columns in spec_columns.items():
            for col in columns:
                if col in df.columns:
                    values = pd.to_numeric(df[col], errors="coerce").dropna()
                    if not values.empty:
                        avg_specs[spec_name] = float(values.mean())
                    break

        return DatasetStatsResponse(
            total_models=total_models, total_companies=total_companies, price_range=price_range, avg_specs=avg_specs
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")


@router.get("/companies")
async def get_companies() -> List[str]:
    """
    Get list of all companies/brands in the dataset

    Example:
        GET /api/dataset/companies
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        company_columns = ["Company Name", "Company", "Brand", "company", "brand"]
        companies = set()

        for col in company_columns:
            if col in df.columns:
                companies.update(df[col].dropna().unique())

        return sorted(list(companies))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting companies: {str(e)}")


@router.get("/models-by-company")
async def get_models_by_company(
    brands: Optional[List[str]] = Query(None, description="Filter by brand names")
) -> List[str]:
    """
    Get list of model names for specific companies/brands

    Example:
        GET /api/dataset/models-by-company?brands=Apple&brands=Samsung
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        # Filter by brands if specified
        filtered_df = df.copy()
        if brands:
            company_columns = ["Company Name", "Company", "Brand", "company", "brand"]
            brand_filter = pd.Series([False] * len(filtered_df), index=filtered_df.index)

            for col in company_columns:
                if col in filtered_df.columns:
                    brand_filter |= filtered_df[col].isin(brands)

            filtered_df = filtered_df[brand_filter]

        # Get unique model names
        model_names = set()
        model_columns = ["Model Name", "ModelName", "Model_Name", "model", "Model"]

        for col in model_columns:
            if col in filtered_df.columns:
                model_names.update(filtered_df[col].dropna().unique())

        return sorted(list(model_names))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting models by company: {str(e)}")


@router.get("/search")
async def search_models(
    # Filtering parameters
    brand: Optional[List[str]] = Query(None, description="Filter by brand(s)"),
    minPrice: Optional[float] = Query(None, description="Minimum price"),
    maxPrice: Optional[float] = Query(None, description="Maximum price"),
    minRam: Optional[float] = Query(None, description="Minimum RAM in GB"),
    maxRam: Optional[float] = Query(None, description="Maximum RAM in GB"),
    minBattery: Optional[float] = Query(None, description="Minimum battery in mAh"),
    maxBattery: Optional[float] = Query(None, description="Maximum battery in mAh"),
    minScreen: Optional[float] = Query(None, description="Minimum screen size in inches"),
    maxScreen: Optional[float] = Query(None, description="Maximum screen size in inches"),
    year: Optional[List[int]] = Query(None, description="Filter by year(s)"),
    minStorage: Optional[float] = Query(None, description="Minimum storage in GB"),
    maxStorage: Optional[float] = Query(None, description="Maximum storage in GB"),
    processor: Optional[str] = Query(None, description="Filter by processor"),
    modelName: Optional[str] = Query(None, description="Search by model name (partial match)"),
    # Sorting and pagination
    sortBy: str = Query("price", description="Sort field: price, ram, battery, screen, year"),
    sortOrder: str = Query("asc", description="Sort order: asc or desc"),
    limit: int = Query(20, description="Number of results per page", ge=1, le=100),
    offset: int = Query(0, description="Pagination offset", ge=0),
):
    """
    Advanced search endpoint for filtering mobile phones by multiple criteria

    Example:
        GET /api/dataset/search?brand=Samsung&minPrice=500&maxPrice=1000&sortBy=price&limit=10
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        # Find price column for sorting
        price_columns = [
            "Current Price (Greece)",
            "Current Price (USA)",
            "Current Price (Europe)",
            "Launched Price (USA)",
            "Launched Price (Europe)",
            "Launched Price (India)",
            "Launched Price (China)",
            "Launched Price (Pakistan)",
            "Launched Price (Dubai)",
            "Price",
            "Current Price",
            "Launched Price",
            "price",
            "Price_USD",
        ]
        price_col = None
        for col in price_columns:
            if col in df.columns:
                price_col = col
                break

        # If no price column found, add a synthetic one
        if price_col is None:
            print("[WARNING] No price column found in dataset, creating synthetic prices")
            df["Price"] = 500.0  # Default synthetic price
            price_col = "Price"

        # Start with all data
        filtered_df = df.copy()

        # Model name filter (partial match, case-insensitive) - robust across column variants
        if modelName:
            model_columns = ["Model Name", "ModelName", "Model_Name", "model", "Model"]
            name_mask = pd.Series([False] * len(filtered_df), index=filtered_df.index)
            for col in model_columns:
                if col in filtered_df.columns:
                    name_mask |= filtered_df[col].astype(str).str.lower().str.contains(modelName.lower(), na=False)
            filtered_df = filtered_df[name_mask]

        # Apply filters
        if brand:
            company_columns = ["Company Name", "Company", "Brand", "company", "brand"]
            brand_filter = pd.Series([False] * len(filtered_df), index=filtered_df.index)

            for col in company_columns:
                if col in filtered_df.columns:
                    brand_filter |= filtered_df[col].isin(brand)

            filtered_df = filtered_df[brand_filter]

        # Helper: Price parsing function available for filters and sorting
        def extract_price(value):
            if pd.isna(value):
                return None
            str_val = str(value).strip()
            if str_val.startswith("EUR"):
                str_val = str_val[3:].strip()
            elif str_val.startswith("$"):
                str_val = str_val[1:].strip()
            elif str_val.startswith("USD"):
                str_val = str_val[3:].strip()
            try:
                return float(str_val.replace(",", ""))
            except (ValueError, AttributeError):
                return None

        # Price filter (handle currency strings)
        if minPrice is not None or maxPrice is not None:
            price_series = filtered_df[price_col].apply(extract_price)
            if minPrice is not None:
                min_mask = price_series.ge(minPrice).reindex(filtered_df.index).fillna(False)
                filtered_df = filtered_df[min_mask]
            if maxPrice is not None:
                max_mask = price_series.le(maxPrice).reindex(filtered_df.index).fillna(False)
                filtered_df = filtered_df[max_mask]

        # RAM filter - handle GB suffix
        if minRam is not None:
            ram_col = "RAM" if "RAM" in filtered_df.columns else None
            if ram_col:

                def extract_ram(value):
                    if pd.isna(value):
                        return None
                    str_val = str(value).strip()
                    if str_val.endswith("GB"):
                        str_val = str_val[:-2].strip()
                    try:
                        return float(str_val)
                    except (ValueError, AttributeError):
                        return None

                ram_series = filtered_df[ram_col].apply(extract_ram)
                filtered_df = filtered_df[ram_series >= minRam]

        if maxRam is not None:
            ram_col = "RAM" if "RAM" in filtered_df.columns else None
            if ram_col:

                def extract_ram(value):
                    if pd.isna(value):
                        return None
                    str_val = str(value).strip()
                    if str_val.endswith("GB"):
                        str_val = str_val[:-2].strip()
                    try:
                        return float(str_val)
                    except (ValueError, AttributeError):
                        return None

                ram_series = filtered_df[ram_col].apply(extract_ram)
                filtered_df = filtered_df[ram_series <= maxRam]

        # Battery filter - handle mAh format
        if minBattery is not None:
            battery_col = "Battery Capacity" if "Battery Capacity" in filtered_df.columns else "Battery"
            if battery_col in filtered_df.columns:

                def extract_battery(value):
                    if pd.isna(value):
                        return None
                    str_val = str(value).strip()
                    if str_val.endswith("mAh"):
                        str_val = str_val[:-3].strip()
                    # Remove commas
                    str_val = str_val.replace(",", "")
                    try:
                        return float(str_val)
                    except (ValueError, AttributeError):
                        return None

                battery_series = filtered_df[battery_col].apply(extract_battery)
                filtered_df = filtered_df[battery_series >= minBattery]

        if maxBattery is not None:
            battery_col = "Battery Capacity" if "Battery Capacity" in filtered_df.columns else "Battery"
            if battery_col in filtered_df.columns:

                def extract_battery(value):
                    if pd.isna(value):
                        return None
                    str_val = str(value).strip()
                    if str_val.endswith("mAh"):
                        str_val = str_val[:-3].strip()
                    # Remove commas
                    str_val = str_val.replace(",", "")
                    try:
                        return float(str_val)
                    except (ValueError, AttributeError):
                        return None

                battery_series = filtered_df[battery_col].apply(extract_battery)
                filtered_df = filtered_df[battery_series <= maxBattery]

        # Screen size filter
        if minScreen is not None:
            screen_col = "Screen Size" if "Screen Size" in filtered_df.columns else None
            if screen_col:
                filtered_df = filtered_df[pd.to_numeric(filtered_df[screen_col], errors="coerce") >= minScreen]

        if maxScreen is not None:
            screen_col = "Screen Size" if "Screen Size" in filtered_df.columns else None
            if screen_col:
                filtered_df = filtered_df[pd.to_numeric(filtered_df[screen_col], errors="coerce") <= maxScreen]

        # Year filter
        if year:
            year_col = "Launched Year" if "Launched Year" in filtered_df.columns else None
            if year_col:
                filtered_df = filtered_df[filtered_df[year_col].isin(year)]

        # Storage filter
        if minStorage is not None or maxStorage is not None:
            storage_col = "Storage" if "Storage" in filtered_df.columns else None
            if storage_col:
                storage_series = pd.to_numeric(filtered_df[storage_col], errors="coerce")
                if minStorage is not None:
                    filtered_df = filtered_df[storage_series >= minStorage]
                if maxStorage is not None:
                    filtered_df = filtered_df[storage_series <= maxStorage]

        # Processor filter
        if processor:
            processor_col = "Processor" if "Processor" in filtered_df.columns else None
            if processor_col:
                filtered_df = filtered_df[filtered_df[processor_col].str.contains(processor, case=False, na=False)]

        # Apply sorting
        if sortBy == "price":
            # Special handling for price sorting
            price_sort_series = filtered_df[price_col].apply(extract_price)
            filtered_df = filtered_df.iloc[price_sort_series.argsort()]
            if sortOrder == "desc":
                filtered_df = filtered_df.iloc[::-1]
        elif sortBy in ["ram", "battery", "screen", "year"]:
            sort_col = {
                "ram": "RAM",
                "battery": "Battery Capacity" if "Battery Capacity" in filtered_df.columns else "Battery",
                "screen": "Screen Size",
                "year": "Launched Year",
            }.get(sortBy)

            if sort_col and sort_col in filtered_df.columns:
                filtered_df = filtered_df.sort_values(sort_col, ascending=(sortOrder == "asc"))

        # Apply pagination
        total_count = len(filtered_df)
        filtered_count = total_count

        # Ensure we don't go past the end
        if offset >= total_count and total_count > 0:
            offset = max(0, total_count - limit)

        paginated_df = filtered_df.iloc[offset : offset + limit] if total_count > 0 else pd.DataFrame()

        # Convert to response format
        models = []
        for _, row in paginated_df.iterrows():
            # Extract model name
            model_name = None
            model_columns = ["Model Name", "ModelName", "Model_Name", "model", "Model"]
            for col in model_columns:
                if col in filtered_df.columns and pd.notna(row.get(col)):
                    model_name = str(row[col])
                    break

            # Extract company
            company = None
            company_columns = ["Company Name", "Company", "Brand", "company", "brand"]
            for col in company_columns:
                if col in filtered_df.columns and pd.notna(row.get(col)):
                    company = str(row[col])
                    break

            # Extract price
            raw_price = row.get(price_col)
            parsed_price = None
            if pd.notna(raw_price):
                str_val = str(raw_price).strip()
                if str_val.startswith("EUR"):
                    str_val = str_val[3:].strip()
                elif str_val.startswith("$"):
                    str_val = str_val[1:].strip()
                elif str_val.startswith("USD"):
                    str_val = str_val[3:].strip()
                try:
                    parsed_price = float(str_val.replace(",", ""))
                except (ValueError, AttributeError):
                    parsed_price = None

            # Extract RAM with proper parsing
            raw_ram = row.get("RAM")
            parsed_ram = None
            if pd.notna(raw_ram):
                str_val = str(raw_ram).strip()
                if str_val.endswith("GB"):
                    str_val = str_val[:-2].strip()
                try:
                    parsed_ram = float(str_val)
                except (ValueError, AttributeError):
                    parsed_ram = None

            # Extract battery with proper parsing
            battery_col = "Battery Capacity" if "Battery Capacity" in filtered_df.columns else "Battery"
            raw_battery = row.get(battery_col)
            parsed_battery = None
            if pd.notna(raw_battery):
                str_val = str(raw_battery).strip()
                if str_val.endswith("mAh"):
                    str_val = str_val[:-3].strip()
                str_val = str_val.replace(",", "")
                try:
                    parsed_battery = float(str_val)
                except (ValueError, AttributeError):
                    parsed_battery = None

            model = ModelResponse(
                model_name=model_name,
                company=company,
                price=parsed_price,
                ram=parsed_ram,
                battery=parsed_battery,
                screen_size=extract_numeric_value(row.get("Screen Size")),
                storage=extract_numeric_value(row.get("Storage")),
                camera=(
                    str(row.get("Front Camera") + " + " + row.get("Back Camera"))
                    if pd.notna(row.get("Front Camera")) and pd.notna(row.get("Back Camera"))
                    else None
                ),
                processor=str(row.get("Processor")) if pd.notna(row.get("Processor")) else None,
                image_path=str(row.get("Image Path")) if pd.notna(row.get("Image Path")) else None,
            )
            models.append(model)

        return {
            "models": models,
            "totalCount": total_count,
            "filteredCount": filtered_count,
            "pagination": {"offset": offset, "limit": limit, "hasMore": (offset + limit) < total_count},
        }

    except Exception as e:
        import traceback

        print(f"[ERROR] Dataset search failed: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error searching models: {str(e)}")


@router.post("/compare")
async def compare_models(request: dict) -> Dict[str, Any]:
    """
    Compare multiple models side by side

    Example:
        POST /api/dataset/compare
        {
          "modelNames": ["iPhone 16 128GB", "Samsung Galaxy S24"]
        }
    """
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        model_names = request.get("modelNames", [])
        if not model_names or len(model_names) < 2:
            raise HTTPException(status_code=400, detail="At least 2 model names required")

        if len(model_names) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 models can be compared")

        # Find price column
        price_columns = [
            "Current Price (Greece)",
            "Current Price (USA)",
            "Current Price (Europe)",
            "Launched Price (USA)",
            "Launched Price (Europe)",
            "Launched Price (India)",
            "Launched Price (China)",
            "Launched Price (Pakistan)",
            "Launched Price (Dubai)",
            "Price",
            "Current Price",
            "Launched Price",
            "price",
            "Price_USD",
        ]
        price_col = None
        for col in price_columns:
            if col in df.columns:
                price_col = col
                break

        if not price_col:
            raise HTTPException(status_code=500, detail="No price column found in dataset")

        # Find models by name (case-insensitive partial match)
        models_data = []
        for model_name in model_names:
            # Try exact match first
            mask = df["Model Name"].str.lower() == model_name.lower()
            if not mask.any():
                # Try partial match
                mask = df["Model Name"].str.lower().str.contains(model_name.lower(), na=False)

            if mask.any():
                row = df[mask].iloc[0]  # Take first match
                models_data.append(row)
            else:
                raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")

        # Convert to response format
        models = []
        for row in models_data:
            # Extract price
            raw_price = row.get(price_col)
            parsed_price = None
            if pd.notna(raw_price):
                str_val = str(raw_price).strip()
                if str_val.startswith("EUR"):
                    str_val = str_val[3:].strip()
                elif str_val.startswith("$"):
                    str_val = str_val[1:].strip()
                elif str_val.startswith("USD"):
                    str_val = str_val[3:].strip()
                try:
                    parsed_price = float(str_val.replace(",", ""))
                except (ValueError, AttributeError):
                    parsed_price = None

            # Extract RAM
            raw_ram = row.get("RAM")
            parsed_ram = None
            if pd.notna(raw_ram):
                str_val = str(raw_ram).strip()
                if str_val.endswith("GB"):
                    str_val = str_val[:-2].strip()
                try:
                    parsed_ram = float(str_val)
                except (ValueError, AttributeError):
                    parsed_ram = None

            # Extract battery
            battery_col = "Battery Capacity" if "Battery Capacity" in df.columns else "Battery"
            raw_battery = row.get(battery_col)
            parsed_battery = None
            if pd.notna(raw_battery):
                str_val = str(raw_battery).strip()
                if str_val.endswith("mAh"):
                    str_val = str_val[:-3].strip()
                str_val = str_val.replace(",", "")
                try:
                    parsed_battery = float(str_val)
                except (ValueError, AttributeError):
                    parsed_battery = None

            # Extract screen size
            raw_screen = row.get("Screen Size")
            parsed_screen = None
            if pd.notna(raw_screen):
                str_val = str(raw_screen).strip()
                if str_val.endswith("inches") or str_val.endswith("inch"):
                    str_val = str_val.replace("inches", "").replace("inch", "").strip()
                try:
                    parsed_screen = float(str_val)
                except (ValueError, AttributeError):
                    parsed_screen = None

            # Extract storage
            storage_col = None
            storage_columns = ["Storage", "Internal Storage", "Memory"]
            for col in storage_columns:
                if col in df.columns:
                    storage_col = col
                    break

            parsed_storage = None
            if storage_col and pd.notna(row.get(storage_col)):
                str_val = str(row[storage_col]).strip()
                if str_val.endswith("GB"):
                    str_val = str_val[:-2].strip()
                elif str_val.endswith("TB"):
                    str_val = str_val[:-2].strip()
                    try:
                        val = float(str_val)
                        str_val = str(val * 1024)
                    except (ValueError, TypeError):
                        pass
                try:
                    parsed_storage = float(str_val)
                except (ValueError, AttributeError):
                    parsed_storage = None

            # Extract weight
            raw_weight = row.get("Mobile Weight")
            parsed_weight = None
            if pd.notna(raw_weight):
                str_val = str(raw_weight).strip()
                if str_val.endswith("g"):
                    str_val = str_val[:-1].strip()
                try:
                    parsed_weight = float(str_val)
                except (ValueError, AttributeError):
                    parsed_weight = None

            # Extract year
            parsed_year = None
            if pd.notna(row.get("Launched Year")):
                try:
                    parsed_year = int(row.get("Launched Year"))
                except (ValueError, TypeError):
                    parsed_year = None

            model = ModelResponse(
                model_name=str(row.get("Model Name", "")),
                company=str(row.get("Company Name", "")),
                price=parsed_price,
                ram=parsed_ram,
                battery=parsed_battery,
                screen_size=parsed_screen,
                storage=parsed_storage,
                camera=(
                    str(row.get("Front Camera") + " + " + row.get("Back Camera"))
                    if pd.notna(row.get("Front Camera")) and pd.notna(row.get("Back Camera"))
                    else None
                ),
                processor=str(row.get("Processor")) if pd.notna(row.get("Processor")) else None,
                image_path=str(row.get("Image Path")) if pd.notna(row.get("Image Path")) else None,
                weight=parsed_weight,
                year=parsed_year,
            )
            models.append(model)

        # Calculate comparison statistics
        prices = [m.price for m in models if m.price is not None]
        rams = [m.ram for m in models if m.ram is not None]
        batteries = [m.battery for m in models if m.battery is not None]
        screen_sizes = [m.screen_size for m in models if m.screen_size is not None]
        weights = [m.weight for m in models if m.weight is not None]
        years = [m.year for m in models if m.year is not None]

        def calc_stats(values):
            if not values:
                return {"min": 0, "max": 0, "avg": 0, "diff": 0}
            return {
                "min": min(values),
                "max": max(values),
                "avg": sum(values) / len(values),
                "diff": max(values) - min(values),
            }

        comparison_stats = {
            "price": calc_stats(prices),
            "ram": calc_stats(rams),
            "battery": calc_stats(batteries),
            "screenSize": calc_stats(screen_sizes),
            "weight": calc_stats(weights),
            "year": calc_stats(years),
        }

        # Calculate differences for display
        differences = []
        if prices:
            min_price_idx = prices.index(min(prices))
            max_price_idx = prices.index(max(prices))
            differences.append(
                {
                    "field": "Price",
                    "best": f"${prices[min_price_idx]:.0f}",
                    "worst": f"${prices[max_price_idx]:.0f}",
                    "difference": f"${prices[max_price_idx] - prices[min_price_idx]:.0f}",
                }
            )

        if rams:
            max_ram_idx = rams.index(max(rams))
            min_ram_idx = rams.index(min(rams))
            differences.append(
                {
                    "field": "RAM",
                    "best": f"{rams[max_ram_idx]}GB",
                    "worst": f"{rams[min_ram_idx]}GB",
                    "difference": f"{rams[max_ram_idx] - rams[min_ram_idx]}GB",
                }
            )

        if batteries:
            max_battery_idx = batteries.index(max(batteries))
            min_battery_idx = batteries.index(min(batteries))
            differences.append(
                {
                    "field": "Battery",
                    "best": f"{batteries[max_battery_idx]:.0f}mAh",
                    "worst": f"{batteries[min_battery_idx]:.0f}mAh",
                    "difference": f"{batteries[max_battery_idx] - batteries[min_battery_idx]:.0f}mAh",
                }
            )

        return {"models": models, "comparison": comparison_stats, "differences": differences}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing models: {str(e)}")
