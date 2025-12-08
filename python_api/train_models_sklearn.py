"""
scikit-learn Model Training Scripts
Alternative to TensorFlow - works with Python 3.14
Uses scikit-learn for model training (lighter, faster, works everywhere)
"""

import json
import os
import pickle
import re
import warnings
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import (
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.metrics import accuracy_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

# Try to import XGBoost for better performance
try:
    import xgboost as xgb

    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# Set random seed for reproducibility
np.random.seed(42)

# Create models directory
MODELS_DIR = Path(__file__).parent / "trained_models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def load_and_preprocess_data(csv_path: str = None):
    """Load and preprocess the mobile phones dataset"""
    print("Loading dataset...")

    if csv_path is None:
        # Try multiple possible paths
        possible_paths = [
            "../Mobiles Dataset (2025).csv",
            "Mobiles Dataset (2025).csv",
            "../mobiles-dataset-docs/Mobiles Dataset (2025).csv",
        ]
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                break
        if csv_path is None:
            raise FileNotFoundError("Could not find CSV file. Please specify the path.")

    # Load CSV - try different encodings
    encodings = ["utf-8", "latin-1", "iso-8859-1", "cp1252"]
    df = None
    for encoding in encodings:
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            print(f"Dataset loaded with {encoding} encoding: {len(df)} rows, {len(df.columns)} columns")
            break
        except UnicodeDecodeError:
            continue

    if df is None:
        raise ValueError(f"Could not read CSV file with any encoding. Tried: {encodings}")

    # Parse numerical features
    def extract_number(value, pattern=r"(\d+\.?\d*)"):
        import re

        if pd.isna(value):
            return np.nan
        value_str = str(value)
        match = re.search(pattern, value_str.replace(",", ""))
        return float(match.group(1)) if match else np.nan

    # Parse RAM
    df["ram_parsed"] = df["RAM"].apply(lambda x: extract_number(str(x), r"(\d+)"))

    # Parse Battery - actual column is "Battery Capacity"
    if "Battery Capacity" in df.columns:
        df["battery_parsed"] = df["Battery Capacity"].apply(lambda x: extract_number(str(x), r"([\d,]+)"))
    else:
        df["battery_parsed"] = np.nan

    # Parse Screen Size - actual column is "Screen Size"
    if "Screen Size" in df.columns:
        df["screen_parsed"] = df["Screen Size"].apply(lambda x: extract_number(str(x), r"(\d+\.?\d*)"))
    else:
        df["screen_parsed"] = np.nan

    # Parse Weight - actual column is "Mobile Weight"
    if "Mobile Weight" in df.columns:
        df["weight_parsed"] = df["Mobile Weight"].apply(lambda x: extract_number(str(x), r"(\d+)"))
    else:
        df["weight_parsed"] = np.nan

    # Parse Price (USD) - actual column is "Launched Price (USA)"
    if "Launched Price (USA)" in df.columns:
        df["price_parsed"] = df["Launched Price (USA)"].apply(lambda x: extract_number(str(x), r"([\d,]+)"))
    else:
        df["price_parsed"] = np.nan

    # Parse Year - actual column is "Launched Year"
    if "Launched Year" in df.columns:
        df["year_parsed"] = df["Launched Year"].apply(lambda x: extract_number(str(x), r"(\d{4})"))
    else:
        df["year_parsed"] = np.nan

    # Parse Front Camera - extract MP (megapixels)
    if "Front Camera" in df.columns:
        df["front_camera_parsed"] = df["Front Camera"].apply(lambda x: extract_number(str(x), r"(\d+\.?\d*)"))
    else:
        df["front_camera_parsed"] = np.nan

    # Parse Back Camera - extract MP (megapixels)
    if "Back Camera" in df.columns:
        df["back_camera_parsed"] = df["Back Camera"].apply(lambda x: extract_number(str(x), r"(\d+\.?\d*)"))
    else:
        df["back_camera_parsed"] = np.nan

    # Parse Processor - encode processor names (will be handled separately)
    processor_col = "Processor" if "Processor" in df.columns else None

    # Extract Storage from Model Name (e.g., "iPhone 15 Pro 512GB" -> 512)
    if "Model Name" in df.columns:

        def extract_storage(model_name):
            if pd.isna(model_name):
                return np.nan
            model_str = str(model_name).upper()
            # Look for patterns like "128GB", "256GB", "512GB", "1TB" (1024GB)
            storage_match = re.search(r"(\d+)\s*(?:GB|TB)", model_str)
            if storage_match:
                storage = float(storage_match.group(1))
                # Convert TB to GB
                if "TB" in model_str[storage_match.start():storage_match.end()]:
                    storage *= 1024
                return storage
            return np.nan

        df["storage_parsed"] = df["Model Name"].apply(extract_storage)
    else:
        df["storage_parsed"] = np.nan

    # Parse Regional Prices
    regional_prices = {}
    for region in ["Pakistan", "India", "China", "Dubai"]:
        col_name = f"Launched Price ({region})"
        if col_name in df.columns:
            df[f"price_{region.lower()}_parsed"] = df[col_name].apply(lambda x: extract_number(str(x), r"([\d,]+)"))
            regional_prices[region.lower()] = f"price_{region.lower()}_parsed"
        else:
            df[f"price_{region.lower()}_parsed"] = np.nan

    # Get company name - actual column is "Company Name"
    company_col = "Company Name" if "Company Name" in df.columns else None

    # Clean data - keep rows with at least core features
    required_cols = ["ram_parsed", "battery_parsed", "screen_parsed", "weight_parsed", "price_parsed", "year_parsed"]
    optional_cols = ["front_camera_parsed", "back_camera_parsed", "storage_parsed"] + [
        f"price_{r}_parsed" for r in regional_prices.keys()
    ]

    # Keep rows where required columns are not null
    df_clean = df[
        required_cols
        + optional_cols
        + ([company_col] if company_col else [])
        + ([processor_col] if processor_col else [])
    ].copy()
    df_clean = df_clean.dropna(subset=required_cols)  # Only drop if required cols are missing

    # Convert to numpy arrays
    ram_clean = df_clean["ram_parsed"].values
    battery_clean = df_clean["battery_parsed"].values
    screen_clean = df_clean["screen_parsed"].values
    weight_clean = df_clean["weight_parsed"].values
    price_clean = df_clean["price_parsed"].values
    year_clean = df_clean["year_parsed"].values.astype(int)
    companies_clean = df_clean[company_col].values if company_col else ["Unknown"] * len(df_clean)

    # New features (fill NaN with median for missing values)
    front_camera_clean = (
        df_clean["front_camera_parsed"].fillna(df_clean["front_camera_parsed"].median()).values
        if "front_camera_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    back_camera_clean = (
        df_clean["back_camera_parsed"].fillna(df_clean["back_camera_parsed"].median()).values
        if "back_camera_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    storage_clean = (
        df_clean["storage_parsed"].fillna(df_clean["storage_parsed"].median()).values
        if "storage_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    processors_clean = df_clean[processor_col].values if processor_col else ["Unknown"] * len(df_clean)

    # Regional prices
    price_pakistan_clean = (
        df_clean["price_pakistan_parsed"].fillna(df_clean["price_pakistan_parsed"].median()).values
        if "price_pakistan_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    price_india_clean = (
        df_clean["price_india_parsed"].fillna(df_clean["price_india_parsed"].median()).values
        if "price_india_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    price_china_clean = (
        df_clean["price_china_parsed"].fillna(df_clean["price_china_parsed"].median()).values
        if "price_china_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )
    price_dubai_clean = (
        df_clean["price_dubai_parsed"].fillna(df_clean["price_dubai_parsed"].median()).values
        if "price_dubai_parsed" in df_clean.columns
        else np.zeros(len(df_clean))
    )

    print(f"Cleaned data: {len(df_clean)} samples")
    print(f"  RAM range: {ram_clean.min():.0f} - {ram_clean.max():.0f} GB")
    print(f"  Battery range: {battery_clean.min():.0f} - {battery_clean.max():.0f} mAh")
    print(f"  Price range: ${price_clean.min():.0f} - ${price_clean.max():.0f}")
    if "front_camera_parsed" in df_clean.columns:
        print(f"  Front Camera range: {front_camera_clean.min():.0f} - {front_camera_clean.max():.0f} MP")
    if "back_camera_parsed" in df_clean.columns:
        print(f"  Back Camera range: {back_camera_clean.min():.0f} - {back_camera_clean.max():.0f} MP")
    if "storage_parsed" in df_clean.columns:
        print(f"  Storage range: {storage_clean.min():.0f} - {storage_clean.max():.0f} GB")

    return {
        "ram": ram_clean,
        "battery": battery_clean,
        "screen": screen_clean,
        "weight": weight_clean,
        "price": price_clean,
        "year": year_clean,
        "companies": companies_clean,
        "front_camera": front_camera_clean,
        "back_camera": back_camera_clean,
        "storage": storage_clean,
        "processors": processors_clean,
        "price_pakistan": price_pakistan_clean,
        "price_india": price_india_clean,
        "price_china": price_china_clean,
        "price_dubai": price_dubai_clean,
    }


def encode_companies(companies):
    """One-hot encode company names"""
    unique_companies = sorted(list(set(companies)))
    company_encoded = np.zeros((len(companies), len(unique_companies)))

    for i, company in enumerate(companies):
        idx = unique_companies.index(company)
        company_encoded[i, idx] = 1

    return company_encoded, unique_companies


def encode_processors(processors):
    """Encode processor names - extract brand and tier information"""
    processor_encoded = np.zeros((len(processors), 3))  # [brand_tier, is_high_end, is_apple]

    for i, proc in enumerate(processors):
        if pd.isna(proc):
            continue
        proc_str = str(proc).upper()

        # Brand encoding (0=Other, 1=Apple, 2=Snapdragon, 3=MediaTek, 4=Exynos)
        if "A" in proc_str and any(
            x in proc_str
            for x in [
                "BIONIC",
                "CHIP",
                "A1",
                "A2",
                "A3",
                "A4",
                "A5",
                "A6",
                "A7",
                "A8",
                "A9",
                "A10",
                "A11",
                "A12",
                "A13",
                "A14",
                "A15",
                "A16",
                "A17",
                "A18",
            ]
        ):
            processor_encoded[i, 0] = 1  # Apple
            processor_encoded[i, 2] = 1  # is_apple
        elif "SNAPDRAGON" in proc_str or "SD" in proc_str:
            processor_encoded[i, 0] = 2  # Snapdragon
        elif "MEDIATEK" in proc_str or "MT" in proc_str or "DIMENSITY" in proc_str:
            processor_encoded[i, 0] = 3  # MediaTek
        elif "EXYNOS" in proc_str:
            processor_encoded[i, 0] = 4  # Exynos

        # High-end indicator (8-series Snapdragon, A15+, etc.)
        if any(x in proc_str for x in ["8 GEN", "888", "8+", "A15", "A16", "A17", "A18", "M1", "M2", "M3"]):
            processor_encoded[i, 1] = 1  # is_high_end

    return processor_encoded


def create_engineered_features(data, company_encoded, processor_encoded=None):
    """Create advanced feature engineering: interactions, ratios, polynomial features with enhanced features"""
    ram = data["ram"]
    battery = data["battery"]
    screen = data["screen"]
    weight = data["weight"]
    year = data["year"]
    price = data["price"]

    # New features (with fallback to zeros if not available)
    front_camera = data.get("front_camera", np.zeros(len(ram)))
    back_camera = data.get("back_camera", np.zeros(len(ram)))
    storage = data.get("storage", np.zeros(len(ram)))
    price_pakistan = data.get("price_pakistan", np.zeros(len(ram)))
    price_india = data.get("price_india", np.zeros(len(ram)))
    price_china = data.get("price_china", np.zeros(len(ram)))
    # price_dubai currently unused

    if processor_encoded is None:
        processor_encoded = np.zeros((len(ram), 3))

    # Base features (now includes cameras, storage, processor)
    base_features = np.column_stack(
        [ram, battery, screen, weight, year, front_camera, back_camera, storage, company_encoded, processor_encoded]
    )

    # Interaction features (multiplicative) - enhanced with new features
    interactions = np.column_stack(
        [
            ram * battery,  # RAM-Battery interaction
            ram * screen,  # RAM-Screen interaction
            battery * screen,  # Battery-Screen interaction
            ram * year,  # RAM-Year (tech evolution)
            battery * year,  # Battery-Year (capacity growth)
            screen * weight,  # Screen-Weight (form factor)
            front_camera * back_camera,  # Camera quality interaction
            ram * storage,  # RAM-Storage (premium indicator)
            back_camera * price,  # Camera-Price (premium phones)
            processor_encoded[:, 1] * price,  # High-end processor * price
        ]
    )

    # Ratio features (value indicators) - enhanced with regional prices
    ratios = np.column_stack(
        [
            price / (ram + 1),  # Price per GB RAM
            price / (battery + 1),  # Price per mAh
            price / (screen + 0.1),  # Price per inch
            price / (storage + 1),  # Price per GB storage
            ram / (battery + 1),  # RAM-Battery ratio
            screen / (weight + 1),  # Screen-Weight ratio (compactness)
            battery / (weight + 1),  # Battery-Weight ratio (efficiency)
            back_camera / (price + 1),  # Camera per dollar
        ]
    )

    # Regional price ratios (market indicators) - only include if prices are available
    regional_ratios = []
    if np.any(price_india > 0):
        regional_ratios.append(price / (price_india + 1))  # USA/India ratio
    if np.any(price_china > 0):
        regional_ratios.append(price / (price_china + 1))  # USA/China ratio
    if np.any(price_pakistan > 0):
        regional_ratios.append(price / (price_pakistan + 1))  # USA/Pakistan ratio

    if regional_ratios:
        ratios = np.column_stack([ratios] + regional_ratios)

    # Temporal features
    years_since_2020 = year - 2020
    is_recent = (year >= 2023).astype(float)

    temporal = np.column_stack(
        [
            years_since_2020,
            is_recent,
            years_since_2020**2,  # Quadratic trend
        ]
    )

    # Polynomial features for key predictors (squared terms)
    polynomials = np.column_stack(
        [
            ram**2,
            battery**2,
            screen**2,
            np.sqrt(ram),  # Square root for diminishing returns
            np.sqrt(battery),
            np.sqrt(back_camera + 1),  # Camera quality (diminishing returns)
        ]
    )

    # Combine all features
    engineered = np.column_stack([base_features, interactions, ratios, temporal, polynomials])

    return engineered


def train_price_model(data, max_iter=1000):
    """Train price prediction model using scikit-learn with improved accuracy"""
    print("\n=== Training Price Prediction Model (scikit-learn) ===")

    # Prepare features with advanced engineering
    company_encoded, unique_companies = encode_companies(data["companies"])
    processor_encoded = encode_processors(data.get("processors", ["Unknown"] * len(data["companies"])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data["price"]

    print(f"Features: {X.shape[0]} samples x {X.shape[1]} features (with engineering)")
    print(f"Price range: ${y.min():.0f} - ${y.max():.0f}")

    # Use log transformation for price (huge range, better for regression)
    y_log = np.log1p(y)  # log(1+x) to handle zeros

    # Normalize
    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y_log.reshape(-1, 1)).flatten()

    # Split data (70/15/15)
    X_train, X_temp, y_train, y_temp = train_test_split(X_normalized, y_normalized, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Try multiple models and pick the best
    models_to_try = {}

    # XGBoost (best for tabular data)
    if XGBOOST_AVAILABLE:
        models_to_try["XGBoost"] = xgb.XGBRegressor(
            n_estimators=300,
            learning_rate=0.03,
            max_depth=7,
            min_child_weight=3,
            subsample=0.8,
            colsample_bytree=0.8,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )

    models_to_try.update(
        {
            "GradientBoosting": GradientBoostingRegressor(
                n_estimators=300,
                learning_rate=0.03,
                max_depth=7,
                min_samples_split=5,
                min_samples_leaf=2,
                subsample=0.8,
                random_state=42,
                verbose=0,
            ),
            "RandomForest": RandomForestRegressor(
                n_estimators=300,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            ),
            "MLP": MLPRegressor(
                hidden_layer_sizes=(256, 128, 64, 32),
                activation="relu",
                solver="adam",
                alpha=0.01,
                learning_rate="adaptive",
                learning_rate_init=0.001,
                max_iter=max_iter,
                early_stopping=True,
                validation_fraction=0.15,
                n_iter_no_change=20,
                random_state=42,
                verbose=False,
            ),
        }
    )

    best_model = None
    best_r2 = -np.inf
    best_name = None

    print("\nTrying multiple models to find the best one...")
    for name, model in models_to_try.items():
        print(f"\n  Training {name}...")
        model.fit(X_train, y_train)

        # Evaluate on validation set
        y_pred_val_norm = model.predict(X_val)
        y_pred_val = np.expm1(y_scaler.inverse_transform(y_pred_val_norm.reshape(-1, 1)).flatten())
        y_val_orig = np.expm1(y_scaler.inverse_transform(y_val.reshape(-1, 1)).flatten())

        r2_val = r2_score(y_val_orig, y_pred_val)
        print(f"    Validation R²: {r2_val:.4f}")

        if r2_val > best_r2:
            best_r2 = r2_val
            best_model = model
            best_name = name

    print(f"\n[Best] {best_name} (Validation R²: {best_r2:.4f})")

    # Evaluate best model on test set
    y_pred_norm = best_model.predict(X_test)
    y_pred_log = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_pred = np.expm1(y_pred_log)
    y_test_orig = np.expm1(y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten())

    r2 = r2_score(y_test_orig, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))
    mae = mean_absolute_error(y_test_orig, y_pred)

    print("\nTest Performance:")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: ${rmse:.2f}")
    print(f"  MAE: ${mae:.2f}")

    # Save model
    model_path = MODELS_DIR / "price_predictor_sklearn.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(best_model, f)
    print(f"Model saved: {model_path}")

    # Save scalers and metadata
    scalers_path = MODELS_DIR / "price_predictor_scalers.pkl"
    with open(scalers_path, "wb") as f:
        pickle.dump({"X_scaler": X_scaler, "y_scaler": y_scaler, "use_log": True}, f)

    metadata = {
        "unique_companies": unique_companies,
        "r2": float(r2),
        "rmse": float(rmse),
        "mae": float(mae),
        "model_type": f"sklearn_{best_name.lower()}",
        "use_log_transform": True,
    }

    metadata_path = MODELS_DIR / "price_predictor_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved: {metadata_path}")

    return best_model, metadata


def train_ram_model(data, max_iter=1000):
    """Train RAM prediction model with improved accuracy"""
    print("\n=== Training RAM Prediction Model (scikit-learn) ===")

    company_encoded, unique_companies = encode_companies(data["companies"])
    processor_encoded = encode_processors(data.get("processors", ["Unknown"] * len(data["companies"])))

    # Use enhanced feature engineering
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data["ram"]

    print(f"Features: {X.shape[0]} samples x {X.shape[1]} features (with engineering)")
    print(f"RAM range: {y.min():.0f} - {y.max():.0f} GB")

    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    X_train, X_temp, y_train, y_temp = train_test_split(X_normalized, y_normalized, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Try multiple models with better hyperparameters
    models_to_try = {}

    if XGBOOST_AVAILABLE:
        models_to_try["XGBoost"] = xgb.XGBRegressor(
            n_estimators=300,
            learning_rate=0.02,
            max_depth=7,
            min_child_weight=3,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )

    models_to_try.update(
        {
            "GradientBoosting": GradientBoostingRegressor(
                n_estimators=300,
                learning_rate=0.02,
                max_depth=7,
                min_samples_split=5,
                min_samples_leaf=2,
                subsample=0.8,
                random_state=42,
                verbose=0,
            ),
            "RandomForest": RandomForestRegressor(
                n_estimators=300,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            ),
            "MLP": MLPRegressor(
                hidden_layer_sizes=(256, 128, 64),
                activation="relu",
                solver="adam",
                alpha=0.01,
                learning_rate="adaptive",
                learning_rate_init=0.001,
                max_iter=max_iter,
                early_stopping=True,
                validation_fraction=0.15,
                n_iter_no_change=20,
                random_state=42,
                verbose=False,
            ),
        }
    )

    best_model = None
    best_r2 = -np.inf
    best_name = None

    print("\nTrying multiple models...")
    trained_models = {}
    for name, model in models_to_try.items():
        print(f"  Training {name}...", end=" ")
        model.fit(X_train, y_train)
        trained_models[name] = model
        y_pred_val = model.predict(X_val)
        r2_val = r2_score(y_val, y_pred_val)
        print(f"R²: {r2_val:.4f}")
        if r2_val > best_r2:
            best_r2 = r2_val
            best_model = model
            best_name = name

    print(f"[Best] {best_name}")

    y_pred_norm = best_model.predict(X_test)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_test_orig = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test_orig, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))

    print(f"\nTest Performance: R² = {r2:.4f}, RMSE = {rmse:.2f} GB")

    with open(MODELS_DIR / "ram_predictor_sklearn.pkl", "wb") as f:
        pickle.dump(best_model, f)
    with open(MODELS_DIR / "ram_predictor_scalers.pkl", "wb") as f:
        pickle.dump({"X_scaler": X_scaler, "y_scaler": y_scaler}, f)

    metadata = {
        "unique_companies": unique_companies,
        "r2": float(r2),
        "rmse": float(rmse),
        "model_type": f"sklearn_{best_name.lower()}",
    }
    with open(MODELS_DIR / "ram_predictor_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return best_model, metadata


def train_battery_model(data, max_iter=1000):
    """Train battery prediction model with improved accuracy"""
    print("\n=== Training Battery Prediction Model (scikit-learn) ===")

    company_encoded, unique_companies = encode_companies(data["companies"])
    processor_encoded = encode_processors(data.get("processors", ["Unknown"] * len(data["companies"])))

    # Use enhanced feature engineering
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data["battery"]

    print(f"Features: {X.shape[0]} samples x {X.shape[1]} features")
    print(f"Battery range: {y.min():.0f} - {y.max():.0f} mAh")

    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    X_train, X_temp, y_train, y_temp = train_test_split(X_normalized, y_normalized, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Try multiple models
    models_to_try = {}

    if XGBOOST_AVAILABLE:
        models_to_try["XGBoost"] = xgb.XGBRegressor(
            n_estimators=250,
            learning_rate=0.03,
            max_depth=6,
            min_child_weight=3,
            subsample=0.8,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )

    models_to_try.update(
        {
            "GradientBoosting": GradientBoostingRegressor(
                n_estimators=250, learning_rate=0.03, max_depth=6, min_samples_split=5, random_state=42, verbose=0
            ),
            "RandomForest": RandomForestRegressor(
                n_estimators=250, max_depth=12, min_samples_split=5, random_state=42, n_jobs=-1
            ),
            "MLP": MLPRegressor(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu",
                solver="adam",
                alpha=0.01,
                learning_rate="adaptive",
                learning_rate_init=0.001,
                max_iter=max_iter,
                early_stopping=True,
                validation_fraction=0.15,
                n_iter_no_change=20,
                random_state=42,
                verbose=False,
            ),
        }
    )

    best_model = None
    best_r2 = -np.inf
    best_name = None

    print("\nTrying multiple models...")
    for name, model in models_to_try.items():
        print(f"  Training {name}...", end=" ")
        model.fit(X_train, y_train)
        y_pred_val = model.predict(X_val)
        r2_val = r2_score(y_val, y_pred_val)
        print(f"R²: {r2_val:.4f}")
        if r2_val > best_r2:
            best_r2 = r2_val
            best_model = model
            best_name = name

    print(f"[Best] {best_name}")

    y_pred_norm = best_model.predict(X_test)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_test_orig = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test_orig, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))

    print(f"\nTest Performance: R² = {r2:.4f}, RMSE = {rmse:.2f} mAh")

    with open(MODELS_DIR / "battery_predictor_sklearn.pkl", "wb") as f:
        pickle.dump(best_model, f)
    with open(MODELS_DIR / "battery_predictor_scalers.pkl", "wb") as f:
        pickle.dump({"X_scaler": X_scaler, "y_scaler": y_scaler}, f)

    metadata = {
        "unique_companies": unique_companies,
        "r2": float(r2),
        "rmse": float(rmse),
        "model_type": f"sklearn_{best_name.lower()}",
    }
    with open(MODELS_DIR / "battery_predictor_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return best_model, metadata


def train_brand_model(data, max_iter=1000):
    """Train brand classification model with improved accuracy"""
    print("\n=== Training Brand Classification Model (scikit-learn) ===")

    company_encoded, unique_companies = encode_companies(data["companies"])
    processor_encoded = encode_processors(data.get("processors", ["Unknown"] * len(data["companies"])))

    # Use enhanced feature engineering
    X = create_engineered_features(data, company_encoded, processor_encoded)

    # Check class distribution
    brand_counts = Counter(data["companies"])
    print(f"Original brand distribution: {len(brand_counts)} brands")

    # Filter out brands with less than 4 samples
    # Need at least 4 samples to ensure proper train/val/test splits:
    # - 70% train = ~3 samples, 30% temp = ~1 sample
    # - Then 50/50 split of temp needs at least 2 samples in temp
    # So minimum 4 samples per brand for safe stratification
    min_samples_per_class = 4
    valid_brands = [brand for brand, count in brand_counts.items() if count >= min_samples_per_class]
    excluded_brands = [brand for brand, count in brand_counts.items() if count < min_samples_per_class]

    if excluded_brands:
        print(f"WARNING: Excluding {len(excluded_brands)} brands with < {min_samples_per_class} samples:")
        for brand in excluded_brands:
            print(f"  - {brand}: {brand_counts[brand]} sample(s)")

    # Filter data to only include valid brands
    valid_mask = np.array([brand in valid_brands for brand in data["companies"]])
    X_filtered = X[valid_mask]
    brands_filtered = [data["companies"][i] for i in range(len(data["companies"])) if valid_mask[i]]

    unique_brands = sorted(valid_brands)
    brand_to_idx = {brand: idx for idx, brand in enumerate(unique_brands)}
    y = np.array([brand_to_idx[brand] for brand in brands_filtered])
    num_classes = len(unique_brands)

    print(f"Features: {X_filtered.shape[0]} samples x {X_filtered.shape[1]} features")
    print(f"Classes: {num_classes} brands (after filtering)")

    X_scaler = StandardScaler()
    X_normalized = X_scaler.fit_transform(X_filtered)

    # Check if we can use stratification (all classes need at least 2 samples)
    class_counts = Counter(y)
    can_stratify_first = all(count >= 2 for count in class_counts.values())

    if can_stratify_first:
        print("Using stratified train/test split")
        X_train, X_temp, y_train, y_temp = train_test_split(X_normalized, y, test_size=0.3, random_state=42, stratify=y)
        # Check if we can stratify the second split (after first split, some classes might have < 2 samples)
        temp_class_counts = Counter(y_temp)
        can_stratify_second = all(count >= 2 for count in temp_class_counts.values())

        if can_stratify_second:
            X_val, X_test, y_val, y_test = train_test_split(
                X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
            )
        else:
            print(
                "WARNING: Cannot use stratification for val/test split "
                "(some classes have < 2 samples in validation set)"
            )
            X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    else:
        print("WARNING: Cannot use stratification (some classes have < 2 samples)")
        print("Using non-stratified train/test split")
        X_train, X_temp, y_train, y_temp = train_test_split(X_normalized, y, test_size=0.3, random_state=42)
        X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Try multiple models for better accuracy
    models_to_try = {}

    if XGBOOST_AVAILABLE:
        models_to_try["XGBoost"] = xgb.XGBClassifier(
            n_estimators=300,
            learning_rate=0.03,
            max_depth=7,
            min_child_weight=3,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
            eval_metric="mlogloss",
        )

    models_to_try.update(
        {
            "RandomForest": RandomForestClassifier(
                n_estimators=400,
                max_depth=20,
                min_samples_split=3,
                min_samples_leaf=1,
                class_weight="balanced",
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            ),
            "GradientBoosting": GradientBoostingClassifier(
                n_estimators=300,
                learning_rate=0.02,
                max_depth=8,
                min_samples_split=5,
                min_samples_leaf=2,
                subsample=0.8,
                random_state=42,
                verbose=0,
            ),
            "MLP": MLPClassifier(
                hidden_layer_sizes=(256, 128, 64),
                activation="relu",
                solver="adam",
                alpha=0.01,
                learning_rate="adaptive",
                learning_rate_init=0.001,
                max_iter=max_iter,
                early_stopping=True,
                validation_fraction=0.15,
                n_iter_no_change=20,
                random_state=42,
                verbose=False,
            ),
        }
    )

    best_model = None
    best_accuracy = -np.inf
    best_name = None

    print("\nTrying multiple models...")
    for name, model in models_to_try.items():
        print(f"  Training {name}...", end=" ")
        model.fit(X_train, y_train)
        y_pred_val = model.predict(X_val)
        acc_val = accuracy_score(y_val, y_pred_val)
        print(f"Accuracy: {acc_val:.4f}")
        if acc_val > best_accuracy:
            best_accuracy = acc_val
            best_model = model
            best_name = name

    print(f"[Best] {best_name}")

    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nTest Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

    # SECURITY NOTE: pickle.dump() is used here for serialization (saving models).
    # These files should ONLY be loaded using safe_load_pickle() from pickle_security module
    # to prevent arbitrary code execution during deserialization.
    with open(MODELS_DIR / "brand_classifier_sklearn.pkl", "wb") as f:
        pickle.dump(best_model, f)
    with open(MODELS_DIR / "brand_classifier_scalers.pkl", "wb") as f:
        pickle.dump({"X_scaler": X_scaler}, f)

    metadata = {
        "unique_brands": unique_brands,
        "excluded_brands": excluded_brands if excluded_brands else [],
        "accuracy": float(accuracy),
        "model_type": f"sklearn_{best_name.lower()}",
        "total_samples": int(X_filtered.shape[0]),
        "num_classes": num_classes,
    }
    with open(MODELS_DIR / "brand_classifier_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return best_model, metadata


if __name__ == "__main__":
    print("=" * 60)
    print("scikit-learn Model Training (Python 3.14 Compatible)")
    print("=" * 60)

    # Load data
    data = load_and_preprocess_data()

    # Train all models with improved parameters
    print("\n" + "=" * 60)
    train_price_model(data, max_iter=1000)
    train_ram_model(data, max_iter=1000)
    train_battery_model(data, max_iter=1000)
    train_brand_model(data, max_iter=1000)

    print("\n" + "=" * 60)
    print("All models trained and saved!")
    print(f"Models saved in: {MODELS_DIR}")
    print("=" * 60)
