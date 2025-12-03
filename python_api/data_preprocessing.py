#!/usr/bin/env python3
"""
Data Preprocessing Module for Mobile Phone Dataset
Handles cleaning, validation, transformation, and feature engineering
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
from PIL import Image

# Add the current directory to Python path for imports
sys.path.append(str(Path(__file__).parent))

logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Comprehensive data preprocessor for mobile phone datasets"""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the data preprocessor

        Args:
            config: Configuration dictionary for preprocessing rules
        """
        self.config = config or self._get_default_config()
        self.preprocessing_stats = {
            "rows_processed": 0,
            "rows_cleaned": 0,
            "duplicates_removed": 0,
            "missing_values_filled": 0,
            "invalid_values_corrected": 0,
            "features_engineered": 0,
        }

    def _get_default_config(self) -> Dict[str, Any]:
        """Get default preprocessing configuration"""
        return {
            "text_normalization": {
                "lowercase_columns": ["Company Name", "Model Name", "Operating System"],
                "strip_whitespace": True,
                "remove_special_chars": False,
            },
            "numeric_validation": {
                "price_columns": ["Price", "Original Price", "Discounted Price"],
                "storage_columns": ["Storage"],
                "rating_columns": ["Rating", "User Rating"],
                "valid_ranges": {
                    "Rating": (0, 5),
                    "User Rating": (0, 5),
                    "Price": (0, 10000),  # Max reasonable price
                    "Storage": (1, 10000),  # GB
                },
            },
            "categorical_standardization": {
                "company_name_mappings": {
                    "apple": "Apple",
                    "samsung": "Samsung",
                    "google": "Google",
                    "oneplus": "OnePlus",
                    "xiaomi": "Xiaomi",
                    "huawei": "Huawei",
                    "oppo": "Oppo",
                    "vivo": "Vivo",
                    "motorola": "Motorola",
                    "nokia": "Nokia",
                    "sony": "Sony",
                    "lg": "LG",
                    "htc": "HTC",
                    "blackberry": "BlackBerry",
                    "asus": "ASUS",
                    "lenovo": "Lenovo",
                },
                "os_mappings": {"android": "Android", "ios": "iOS", "harmonyos": "HarmonyOS", "tizen": "Tizen"},
            },
            "duplicate_handling": {
                "duplicate_columns": ["Company Name", "Model Name", "Storage", "RAM"],
                "keep_strategy": "first",  # 'first', 'last', or 'none'
            },
            "missing_value_handling": {
                "fill_strategies": {
                    "Rating": "mean",
                    "User Rating": "mean",
                    "Price": "median",
                    "Storage": "mode",
                    "RAM": "mode",
                },
                "default_fill_values": {"str": "Unknown", "numeric": 0},
            },
            "feature_engineering": {
                "create_price_category": True,
                "create_storage_category": True,
                "create_performance_score": True,
                "extract_brand_from_model": True,
            },
            "image_preprocessing": {"max_size": (800, 800), "quality": 85, "format": "JPEG", "convert_to_rgb": True},
        }

    def preprocess_csv_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Comprehensive preprocessing of CSV data

        Args:
            df: Input DataFrame

        Returns:
            Preprocessed DataFrame
        """
        logger.info(f"Starting preprocessing of {len(df)} rows")

        # Make a copy to avoid modifying original
        df_processed = df.copy()
        self.preprocessing_stats["rows_processed"] = len(df_processed)

        try:
            # Step 1: Handle duplicates
            df_processed = self._remove_duplicates(df_processed)

            # Step 2: Clean column names
            df_processed = self._clean_column_names(df_processed)

            # Step 3: Handle missing values
            df_processed = self._handle_missing_values(df_processed)

            # Step 4: Validate and clean data types
            df_processed = self._validate_data_types(df_processed)

            # Step 5: Normalize text data
            df_processed = self._normalize_text(df_processed)

            # Step 6: Standardize categorical values
            df_processed = self._standardize_categories(df_processed)

            # Step 7: Validate numeric ranges
            df_processed = self._validate_numeric_ranges(df_processed)

            # Step 8: Feature engineering
            df_processed = self._engineer_features(df_processed)

            # Step 9: Final validation
            df_processed = self._final_validation(df_processed)

            logger.info(f"Preprocessing completed successfully. Final dataset: {len(df_processed)} rows")
            self.preprocessing_stats["rows_cleaned"] = len(df_processed)

        except Exception as e:
            logger.error(f"Error during preprocessing: {e}")
            logger.warning("Returning partially processed data")
            self.preprocessing_stats["rows_cleaned"] = len(df_processed)

        return df_processed

    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate records"""
        duplicate_cols = self.config["duplicate_handling"]["duplicate_columns"]
        keep_strategy = self.config["duplicate_handling"]["keep_strategy"]

        # Check if duplicate columns exist in the dataframe
        existing_cols = [col for col in duplicate_cols if col in df.columns]

        if existing_cols:
            initial_count = len(df)
            if keep_strategy == "none":
                df = df.drop_duplicates(subset=existing_cols, keep=False)
            else:
                df = df.drop_duplicates(subset=existing_cols, keep=keep_strategy)

            duplicates_removed = initial_count - len(df)
            self.preprocessing_stats["duplicates_removed"] = duplicates_removed
            logger.info(f"Removed {duplicates_removed} duplicate records")
        else:
            logger.warning(f"Duplicate check columns {duplicate_cols} not found in dataset")

        return df

    def _clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize column names"""
        df.columns = df.columns.str.strip()
        df.columns = df.columns.str.replace(r"\s+", " ", regex=True)
        return df

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values according to configuration"""
        fill_strategies = self.config["missing_value_handling"]["fill_strategies"]
        default_fills = self.config["missing_value_handling"]["default_fill_values"]

        for col in df.columns:
            missing_count = df[col].isnull().sum()
            if missing_count > 0:
                if col in fill_strategies:
                    strategy = fill_strategies[col]
                    if strategy == "mean" and pd.api.types.is_numeric_dtype(df[col]):
                        fill_value = df[col].mean()
                    elif strategy == "median" and pd.api.types.is_numeric_dtype(df[col]):
                        fill_value = df[col].median()
                    elif strategy == "mode":
                        fill_value = (
                            df[col].mode().iloc[0]
                            if not df[col].mode().empty
                            else default_fills.get(
                                "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "str", "Unknown"
                            )
                        )
                    else:
                        fill_value = default_fills.get(
                            "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "str", "Unknown"
                        )

                    df[col] = df[col].fillna(fill_value)
                    self.preprocessing_stats["missing_values_filled"] += missing_count
                    logger.info(f"Filled {missing_count} missing values in {col} using {strategy}")
                else:
                    # Use default fill value
                    fill_value = default_fills.get(
                        "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "str", "Unknown"
                    )
                    df[col] = df[col].fillna(fill_value)
                    self.preprocessing_stats["missing_values_filled"] += missing_count

        return df

    def _validate_data_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate and convert data types"""
        # Convert numeric columns
        numeric_cols = (
            self.config["numeric_validation"]["price_columns"]
            + self.config["numeric_validation"]["storage_columns"]
            + self.config["numeric_validation"]["rating_columns"]
        )

        for col in numeric_cols:
            if col in df.columns:
                # Remove non-numeric characters and convert
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(r"[^\d.]", "", regex=True), errors="coerce")

        return df

    def _normalize_text(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize text data"""
        text_config = self.config["text_normalization"]

        # Strip whitespace from all string columns
        if text_config["strip_whitespace"]:
            for col in df.select_dtypes(include=["object"]).columns:
                df[col] = df[col].astype(str).str.strip()

        # Convert to lowercase for specified columns
        lowercase_cols = text_config["lowercase_columns"]
        for col in lowercase_cols:
            if col in df.columns:
                df[col] = df[col].str.lower()

        # Remove special characters if configured
        if text_config["remove_special_chars"]:
            for col in df.select_dtypes(include=["object"]).columns:
                df[col] = df[col].str.replace(r"[^\w\s]", "", regex=True)

        return df

    def _standardize_categories(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize categorical values"""
        cat_config = self.config["categorical_standardization"]

        # Standardize company names
        if "Company Name" in df.columns:
            company_mappings = cat_config["company_name_mappings"]
            df["Company Name"] = df["Company Name"].map(company_mappings).fillna(df["Company Name"])

        # Standardize operating systems
        if "Operating System" in df.columns:
            os_mappings = cat_config["os_mappings"]
            df["Operating System"] = df["Operating System"].map(os_mappings).fillna(df["Operating System"])

        return df

    def _validate_numeric_ranges(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate numeric values are within reasonable ranges"""
        valid_ranges = self.config["numeric_validation"]["valid_ranges"]

        for col, (min_val, max_val) in valid_ranges.items():
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                invalid_count = ((df[col] < min_val) | (df[col] > max_val)).sum()
                if invalid_count > 0:
                    # Replace invalid values with NaN, then they'll be handled by missing value logic
                    df.loc[(df[col] < min_val) | (df[col] > max_val), col] = np.nan
                    self.preprocessing_stats["invalid_values_corrected"] += invalid_count
                    logger.info(f"Corrected {invalid_count} invalid values in {col}")

        return df

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create new features from existing data"""
        feature_config = self.config["feature_engineering"]

        # Create price categories
        if feature_config["create_price_category"] and "Price" in df.columns:
            df["Price Category"] = pd.cut(
                df["Price"],
                bins=[0, 200, 500, 1000, float("inf")],
                labels=["Budget", "Mid-Range", "Premium", "Flagship"],
            )

        # Create storage categories
        if feature_config["create_storage_category"] and "Storage" in df.columns:
            df["Storage Category"] = pd.cut(
                df["Storage"], bins=[0, 64, 128, 256, float("inf")], labels=["Basic", "Standard", "High", "Ultra"]
            )

        # Create performance score (if RAM and Storage available)
        if feature_config["create_performance_score"] and "RAM" in df.columns and "Storage" in df.columns:
            # Normalize RAM and Storage to 0-1 scale
            ram_norm = (df["RAM"] - df["RAM"].min()) / (df["RAM"].max() - df["RAM"].min())
            storage_norm = (df["Storage"] - df["Storage"].min()) / (df["Storage"].max() - df["Storage"].min())

            df["Performance Score"] = (ram_norm + storage_norm) / 2

        # Extract brand from model name
        if feature_config["extract_brand_from_model"] and "Model Name" in df.columns and "Company Name" in df.columns:
            # For rows where Company Name is missing or generic, try to extract from model
            mask = df["Company Name"].isnull() | (df["Company Name"] == "unknown")
            if mask.any():
                # Simple extraction - take first word of model name
                df.loc[mask, "Company Name"] = df.loc[mask, "Model Name"].str.split().str[0]

        self.preprocessing_stats["features_engineered"] = len([k for k, v in feature_config.items() if v])
        return df

    def _final_validation(self, df: pd.DataFrame) -> pd.DataFrame:
        """Final validation and cleanup"""
        # Remove any remaining rows with all NaN values
        df = df.dropna(how="all")

        # Reset index
        df = df.reset_index(drop=True)

        return df

    def preprocess_image(self, image_path: str, output_path: Optional[str] = None) -> Optional[str]:
        """
        Preprocess a single image

        Args:
            image_path: Path to input image
            output_path: Path to save processed image (optional)

        Returns:
            Path to processed image
        """
        try:
            img_config = self.config["image_preprocessing"]

            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img_config["convert_to_rgb"] and img.mode != "RGB":
                    img = img.convert("RGB")

                # Resize if larger than max_size
                if img.size[0] > img_config["max_size"][0] or img.size[1] > img_config["max_size"][1]:
                    img.thumbnail(img_config["max_size"], Image.Resampling.LANCZOS)

                # Save processed image
                if output_path:
                    save_path = output_path
                else:
                    # Create processed version in same directory
                    path_obj = Path(image_path)
                    save_path = path_obj.parent / f"processed_{path_obj.name}"

                img.save(save_path, img_config["format"], quality=img_config["quality"])
                return str(save_path)

        except Exception as e:
            logger.error(f"Failed to preprocess image {image_path}: {e}")
            return None

    def get_preprocessing_stats(self) -> Dict[str, Any]:
        """Get preprocessing statistics"""
        return self.preprocessing_stats.copy()

    def validate_dataset_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate overall dataset quality

        Args:
            df: Processed DataFrame

        Returns:
            Quality metrics
        """
        quality_report = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "missing_values": df.isnull().sum().sum(),
            "duplicate_rows": df.duplicated().sum(),
            "column_completeness": {},
            "data_types": {},
        }

        # Column completeness
        for col in df.columns:
            completeness = (1 - df[col].isnull().sum() / len(df)) * 100
            quality_report["column_completeness"][col] = f"{completeness:.1f}%"

        # Data types
        for col in df.columns:
            quality_report["data_types"][col] = str(df[col].dtype)

        return quality_report
