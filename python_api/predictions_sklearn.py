#!/usr/bin/env python3
"""
Scikit-learn model predictions
Uses the newly trained sklearn models for accurate predictions
"""

import numpy as np
import pandas as pd
import pickle
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Model directory
MODELS_DIR = Path(__file__).parent / "trained_models"

# Global model cache
_models_cache = {}
_scalers_cache = {}

def load_model(model_name: str):
    """Load a trained sklearn model and its scaler with file existence checks"""
    if model_name in _models_cache:
        return _models_cache[model_name], _scalers_cache[model_name]

    try:
        # Load model
        model_path = MODELS_DIR / f"{model_name}_sklearn.pkl"
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Load scaler
        scaler_path = MODELS_DIR / f"{model_name}_scalers.pkl"
        if not scaler_path.exists():
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)

        # Cache models
        _models_cache[model_name] = model
        _scalers_cache[model_name] = scaler

        logger.info(f"Loaded {model_name} model")
        return model, scaler

    except Exception as e:
        logger.error(f"Failed to load {model_name} model: {e}")
        raise

def encode_company(company: str, unique_companies: list) -> np.ndarray:
    """One-hot encode company name"""
    if not unique_companies:
        return np.zeros(1)

    company_lower = company.lower()
    try:
        idx = next(i for i, c in enumerate(unique_companies) if c.lower() == company_lower)
    except StopIteration:
        idx = 0  # Default to first company if not found

    encoded = np.zeros(len(unique_companies))
    encoded[idx] = 1
    return encoded

def encode_processor(processor: Optional[str]) -> np.ndarray:
    """Encode processor information"""
    if not processor:
        return np.zeros(3)

    processor_encoded = np.zeros(3)  # [brand_tier, is_high_end, is_apple]
    proc_str = str(processor).upper()

    # Brand encoding (0=Other, 1=Apple, 2=Snapdragon, 3=MediaTek, 4=Exynos)
    if 'A' in proc_str and any(x in proc_str for x in ['BIONIC', 'CHIP', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18']):
        processor_encoded[0] = 1  # Apple
        processor_encoded[2] = 1  # is_apple
    elif 'SNAPDRAGON' in proc_str or 'SD' in proc_str:
        processor_encoded[0] = 2  # Snapdragon
    elif 'MEDIATEK' in proc_str or 'MT' in proc_str or 'DIMENSITY' in proc_str:
        processor_encoded[0] = 3  # MediaTek
    elif 'EXYNOS' in proc_str:
        processor_encoded[0] = 4  # Exynos

    # High-end indicator
    if any(x in proc_str for x in ['8 GEN', '888', '8+', 'A15', 'A16', 'A17', 'A18', 'M1', 'M2', 'M3']):
        processor_encoded[1] = 1  # is_high_end

    return processor_encoded

def create_features(ram: float, battery: float, screen: float, weight: float,
                   year: int, company: str, front_camera: Optional[float] = None,
                   back_camera: Optional[float] = None, processor: Optional[str] = None,
                   storage: Optional[float] = None, unique_companies: Optional[list] = None) -> np.ndarray:
    """Create feature vector matching training data"""

    # Handle missing values (fill with medians from training data)
    front_camera = front_camera if front_camera is not None else 16.0
    back_camera = back_camera if back_camera is not None else 50.0
    storage = storage if storage is not None else 128.0

    # Base features (must match training order)
    base_features = [
        ram, battery, screen, weight, year,
        front_camera, back_camera, storage
    ]

    # Company encoding
    if unique_companies:
        company_encoded = encode_company(company, unique_companies)
        base_features.extend(company_encoded)
    else:
        base_features.append(0.0)  # Default if no companies available

    # Processor encoding
    processor_encoded = encode_processor(processor)
    base_features.extend(processor_encoded)

    # Convert to numpy array
    X = np.array(base_features)

    # Create interaction features (must match training)
    interactions = np.array([
        ram * battery,           # RAM-Battery interaction
        ram * screen,            # RAM-Screen interaction
        battery * screen,         # Battery-Screen interaction
        ram * year,              # RAM-Year (tech evolution)
        battery * year,          # Battery-Year (capacity growth)
        screen * weight,         # Screen-Weight (form factor)
        front_camera * back_camera,  # Camera quality interaction
        ram * storage,           # RAM-Storage (premium indicator)
        back_camera * 500,       # Camera-Price (premium phones) - using avg price
        processor_encoded[1] * 500,  # High-end processor * price
    ])

    # Ratio features
    ratios = np.array([
        500 / (ram + 1),         # Price per GB RAM
        500 / (battery + 1),     # Price per mAh
        500 / (screen + 0.1),    # Price per inch
        500 / (storage + 1),     # Price per GB storage
        ram / (battery + 1),    # RAM-Battery ratio
        screen / (weight + 1),  # Screen-Weight ratio
        battery / (weight + 1), # Battery-Weight ratio
        back_camera / (500 + 1),  # Camera per dollar
    ])

    # Regional price ratios (set to neutral since we don't have regional data)
    regional_ratios = np.array([1.0, 1.0, 1.0])  # USA/India, USA/China, USA/Pakistan ratios
    ratios = np.concatenate([ratios, regional_ratios])

    # Temporal features
    years_since_2020 = year - 2020
    is_recent = 1.0 if year >= 2023 else 0.0
    temporal = np.array([
        years_since_2020,
        is_recent,
        years_since_2020 ** 2,  # Quadratic trend
    ])

    # Polynomial features
    polynomials = np.array([
        ram ** 2,
        battery ** 2,
        screen ** 2,
        np.sqrt(ram),      # Square root for diminishing returns
        np.sqrt(battery),
        np.sqrt(back_camera + 1),  # Camera quality
    ])

    # Combine all features in correct order
    features = np.concatenate([
        base_features,
        interactions,
        ratios,
        temporal,
        polynomials
    ])

    return features.reshape(1, -1)  # Return as row vector

def predict_price(ram: float, battery: float, screen: float, weight: float,
                 year: int, company: str, front_camera: Optional[float] = None,
                 back_camera: Optional[float] = None, processor: Optional[str] = None,
                 storage: Optional[float] = None) -> float:
    """
    Predict mobile phone price using trained sklearn model
    """
    try:
        model, scaler = load_model('price_predictor')

        # Get unique companies from metadata
        metadata_path = MODELS_DIR / "price_predictor_metadata.json"
        with open(metadata_path, 'r') as f:
            metadata = pd.read_json(f)
            unique_companies = metadata.get('unique_companies', [])

        # Create features
        X = create_features(ram, battery, screen, weight, year, company,
                          front_camera, back_camera, processor, storage, unique_companies)

        # Scale features
        X_scaled = scaler['X_scaler'].transform(X)

        # Make prediction
        y_pred_norm = model.predict(X_scaled)
        y_pred_log = scaler['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()

        # Reverse log transformation
        price = np.expm1(y_pred_log[0])

        return max(50, float(price))  # Ensure positive price

    except Exception as e:
        logger.error(f"Price prediction failed: {e}")
        # Fallback to basic prediction
        return _fallback_price_prediction(ram, battery, screen, weight, year, company)

def predict_ram(battery: float, screen: float, weight: float, year: int,
               price: float, company: str, front_camera: Optional[float] = None,
               back_camera: Optional[float] = None, processor: Optional[str] = None,
               storage: Optional[float] = None) -> float:
    """
    Predict RAM capacity using trained sklearn model
    """
    try:
        model, scaler = load_model('ram_predictor')

        # For RAM prediction, we need to create features but adjust for the different input order
        # RAM is the target, so we don't include it in features
        front_camera = front_camera if front_camera is not None else 16.0
        back_camera = back_camera if back_camera is not None else 50.0
        storage = storage if storage is not None else 128.0

        # Get unique companies
        metadata_path = MODELS_DIR / "ram_predictor_metadata.json"
        with open(metadata_path, 'r') as f:
            metadata = pd.read_json(f)
            unique_companies = metadata.get('unique_companies', [])

        # Create features (without RAM)
        base_features = [
            battery, screen, weight, year, price,  # Different order for RAM prediction
            front_camera, back_camera, storage
        ]

        # Company encoding
        company_encoded = encode_company(company, unique_companies)
        base_features.extend(company_encoded)

        # Processor encoding
        processor_encoded = encode_processor(processor)
        base_features.extend(processor_encoded)

        X = np.array(base_features)

        # Scale and predict
        X_scaled = scaler['X_scaler'].transform(X.reshape(1, -1))
        y_pred_norm = model.predict(X_scaled)
        ram = scaler['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()[0]

        return max(2, float(ram))

    except Exception as e:
        logger.error(f"RAM prediction failed: {e}")
        return _fallback_ram_prediction(battery, screen, weight, year, price, company)

def predict_battery(ram: float, screen: float, weight: float, year: int,
                   price: float, company: str, front_camera: Optional[float] = None,
                   back_camera: Optional[float] = None, processor: Optional[str] = None,
                   storage: Optional[float] = None) -> float:
    """
    Predict battery capacity using trained sklearn model
    """
    try:
        model, scaler = load_model('battery_predictor')

        front_camera = front_camera if front_camera is not None else 16.0
        back_camera = back_camera if back_camera is not None else 50.0
        storage = storage if storage is not None else 128.0

        # Get unique companies
        metadata_path = MODELS_DIR / "battery_predictor_metadata.json"
        with open(metadata_path, 'r') as f:
            metadata = pd.read_json(f)
            unique_companies = metadata.get('unique_companies', [])

        # Create features (without battery)
        base_features = [
            ram, screen, weight, year, price,  # Different order for battery prediction
            front_camera, back_camera, storage
        ]

        # Company encoding
        company_encoded = encode_company(company, unique_companies)
        base_features.extend(company_encoded)

        # Processor encoding
        processor_encoded = encode_processor(processor)
        base_features.extend(processor_encoded)

        X = np.array(base_features)

        # Scale and predict
        X_scaled = scaler['X_scaler'].transform(X.reshape(1, -1))
        y_pred_norm = model.predict(X_scaled)
        battery = scaler['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()[0]

        return max(2000, float(battery))

    except Exception as e:
        logger.error(f"Battery prediction failed: {e}")
        return _fallback_battery_prediction(ram, screen, weight, year, price, company)

def predict_brand(ram: float, battery: float, screen: float, weight: float,
                 year: int, price: float, front_camera: Optional[float] = None,
                 back_camera: Optional[float] = None, processor: Optional[str] = None,
                 storage: Optional[float] = None) -> str:
    """
    Predict brand using trained sklearn model
    """
    try:
        model, scaler = load_model('brand_classifier')

        front_camera = front_camera if front_camera is not None else 16.0
        back_camera = back_camera if back_camera is not None else 50.0
        storage = storage if storage is not None else 128.0

        # Get unique brands from metadata
        metadata_path = MODELS_DIR / "brand_classifier_metadata.json"
        with open(metadata_path, 'r') as f:
            metadata = pd.read_json(f)
            unique_brands = metadata.get('unique_brands', ['Apple', 'Samsung', 'Xiaomi'])

        # Create features (without company)
        base_features = [
            ram, battery, screen, weight, year, price,
            front_camera, back_camera, storage
        ]

        # Add dummy company encoding (will be ignored by the model)
        dummy_company = np.zeros(len(unique_brands))
        base_features.extend(dummy_company)

        # Processor encoding
        processor_encoded = encode_processor(processor)
        base_features.extend(processor_encoded)

        X = np.array(base_features)

        # Scale and predict
        X_scaled = scaler['X_scaler'].transform(X.reshape(1, -1))
        y_pred = model.predict(X_scaled)

        # Convert prediction back to brand name
        predicted_brand = unique_brands[y_pred[0]] if y_pred[0] < len(unique_brands) else 'Unknown'

        return predicted_brand

    except Exception as e:
        logger.error(f"Brand prediction failed: {e}")
        return _fallback_brand_prediction(ram, battery, screen, weight, year, price)

# Fallback functions for when models fail
def _fallback_price_prediction(ram, battery, screen, weight, year, company, **kwargs):
    """Fallback price prediction"""
    base_price = 200
    ram_mult = ram * 50
    battery_mult = battery * 0.1
    screen_mult = screen * 100
    year_mult = (year - 2020) * 20

    company_mult = 1.0
    if company.lower() == 'apple':
        company_mult = 1.5
    elif company.lower() == 'samsung':
        company_mult = 1.2

    price = (base_price + ram_mult + battery_mult + screen_mult + year_mult) * company_mult
    return max(100, round(price))

def _fallback_ram_prediction(battery, screen, weight, year, price, company, **kwargs):
    """Fallback RAM prediction"""
    base_ram = 4
    price_mult = price / 200
    year_mult = (year - 2020) * 0.5
    ram = base_ram + price_mult + year_mult
    return max(2, round(ram * 10) / 10)

def _fallback_battery_prediction(ram, screen, weight, year, price, company, **kwargs):
    """Fallback battery prediction"""
    base_battery = 3000
    screen_mult = screen * 500
    price_mult = price / 10
    battery = base_battery + screen_mult + price_mult
    return max(2000, round(battery))

def _fallback_brand_prediction(ram, battery, screen, weight, year, price, **kwargs):
    """Fallback brand prediction"""
    if price > 800:
        return 'Apple'
    elif price > 500:
        return 'Samsung'
    elif price > 300:
        return 'Xiaomi'
    else:
        return 'Other'
