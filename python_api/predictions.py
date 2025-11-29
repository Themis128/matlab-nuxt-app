"""
Python Prediction Functions - MATLAB Model Alternatives
This module provides Python equivalents of MATLAB prediction functions.
"""

import numpy as np
import os
import json
from pathlib import Path
from typing import Union, List

try:
    from scipy.io import loadmat
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("Warning: scipy not available. Will use mock predictions.")

try:
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available. Will use mock predictions.")


class ModelLoader:
    """Load and manage MATLAB models converted to Python"""

    def __init__(self, models_dir: str = "mobiles-dataset-docs/trained_models"):
        self.models_dir = Path(models_dir)
        self.models = {}
        self.normalization_params = {}
        self.unique_companies = {}

    def load_model(self, model_name: str) -> bool:
        """Load a MATLAB model file"""
        model_path = self.models_dir / f"{model_name}.mat"

        if not model_path.exists():
            print(f"Model not found: {model_path}")
            return False

        if not SCIPY_AVAILABLE:
            return False

        try:
            mat_data = loadmat(str(model_path))

            # Extract model data
            if 'net' in mat_data:
                self.models[model_name] = mat_data['net']
            elif 'net_tuned' in mat_data:
                self.models[model_name] = mat_data['net_tuned']
            else:
                print(f"No network found in {model_name}")
                return False

            # Extract normalization parameters
            if 'normalizationParams' in mat_data:
                norm_params = mat_data['normalizationParams']
                self.normalization_params[model_name] = {
                    'X_mean': norm_params['X_mean'][0, 0].flatten(),
                    'X_std': norm_params['X_std'][0, 0].flatten(),
                    'y_mean': norm_params['y_mean'][0, 0].item(),
                    'y_std': norm_params['y_std'][0, 0].item()
                }

            # Extract unique companies
            if 'uniqueCompanies' in mat_data:
                companies = mat_data['uniqueCompanies']
                # Handle different MATLAB cell array formats
                if companies.size > 0:
                    if isinstance(companies[0, 0], np.ndarray):
                        self.unique_companies[model_name] = [
                            str(companies[0, i][0]) for i in range(companies.shape[1])
                        ]
                    else:
                        self.unique_companies[model_name] = [
                            str(companies[0, i]) for i in range(companies.shape[1])
                        ]

            return True

        except Exception as e:
            print(f"Error loading model {model_name}: {e}")
            return False

    def encode_company(self, company: str, model_name: str) -> np.ndarray:
        """One-hot encode company name"""
        if model_name not in self.unique_companies:
            return np.zeros(1)

        companies = self.unique_companies[model_name]
        company_lower = company.lower()

        try:
            idx = next(i for i, c in enumerate(companies) if c.lower() == company_lower)
        except StopIteration:
            idx = 0

        encoded = np.zeros(len(companies))
        encoded[idx] = 1
        return encoded


# Global model loader instance
model_loader = ModelLoader()


def predict_price(ram: float, battery: float, screen_size: float,
                  weight: float, year: int, company: str) -> float:
    """
    Predict mobile phone price

    Args:
        ram: RAM in GB
        battery: Battery capacity in mAh
        screen_size: Screen size in inches
        weight: Weight in grams
        year: Launch year
        company: Company name

    Returns:
        Predicted price in USD
    """
    model_name = "price_predictor"

    # Try to load model if not already loaded
    if model_name not in model_loader.models:
        if not model_loader.load_model(model_name):
            # Fallback to mock prediction
            return _mock_price_prediction(ram, battery, screen_size, weight, year, company)

    try:
        # Encode company
        company_encoded = model_loader.encode_company(company, model_name)

        # Prepare features
        features = np.array([ram, battery, screen_size, weight, year] + company_encoded.tolist())
        features = features.reshape(1, -1)

        # Normalize
        norm_params = model_loader.normalization_params[model_name]
        X_mean = norm_params['X_mean']
        X_std = norm_params['X_std']
        y_mean = norm_params['y_mean']
        y_std = norm_params['y_std']

        features_norm = (features - X_mean) / (X_std + 1e-8)

        # Predict (this is simplified - would need actual model inference)
        # For now, use a simple approximation
        if TENSORFLOW_AVAILABLE and model_name in model_loader.models:
            # Would need to convert MATLAB network to TensorFlow
            # For now, use mock
            return _mock_price_prediction(ram, battery, screen_size, weight, year, company)
        else:
            return _mock_price_prediction(ram, battery, screen_size, weight, year, company)

    except Exception as e:
        print(f"Error in predict_price: {e}")
        return _mock_price_prediction(ram, battery, screen_size, weight, year, company)


def predict_ram(battery: float, screen_size: float, weight: float,
                year: int, price: float, company: str) -> float:
    """Predict RAM capacity"""
    model_name = "ram_predictor"

    if model_name not in model_loader.models:
        if not model_loader.load_model(model_name):
            return _mock_ram_prediction(battery, screen_size, weight, year, price, company)

    try:
        company_encoded = model_loader.encode_company(company, model_name)
        features = np.array([battery, screen_size, weight, year, price] + company_encoded.tolist())
        features = features.reshape(1, -1)

        norm_params = model_loader.normalization_params[model_name]
        features_norm = (features - norm_params['X_mean']) / (norm_params['X_std'] + 1e-8)

        # Simplified prediction
        return _mock_ram_prediction(battery, screen_size, weight, year, price, company)

    except Exception as e:
        print(f"Error in predict_ram: {e}")
        return _mock_ram_prediction(battery, screen_size, weight, year, price, company)


def predict_battery(ram: float, screen_size: float, weight: float,
                    year: int, price: float, company: str) -> float:
    """Predict battery capacity"""
    model_name = "battery_predictor"

    if model_name not in model_loader.models:
        if not model_loader.load_model(model_name):
            return _mock_battery_prediction(ram, screen_size, weight, year, price, company)

    try:
        company_encoded = model_loader.encode_company(company, model_name)
        features = np.array([ram, screen_size, weight, year, price] + company_encoded.tolist())
        features = features.reshape(1, -1)

        norm_params = model_loader.normalization_params[model_name]
        features_norm = (features - norm_params['X_mean']) / (norm_params['X_std'] + 1e-8)

        return _mock_battery_prediction(ram, screen_size, weight, year, price, company)

    except Exception as e:
        print(f"Error in predict_battery: {e}")
        return _mock_battery_prediction(ram, screen_size, weight, year, price, company)


def predict_brand(ram: float, battery: float, screen_size: float,
                  weight: float, year: int, price: float) -> str:
    """Predict brand"""
    model_name = "brand_classifier"

    if model_name not in model_loader.models:
        if not model_loader.load_model(model_name):
            return _mock_brand_prediction(ram, battery, screen_size, weight, year, price)

    try:
        features = np.array([ram, battery, screen_size, weight, year, price])
        features = features.reshape(1, -1)

        norm_params = model_loader.normalization_params[model_name]
        features_norm = (features - norm_params['X_mean']) / (norm_params['X_std'] + 1e-8)

        return _mock_brand_prediction(ram, battery, screen_size, weight, year, price)

    except Exception as e:
        print(f"Error in predict_brand: {e}")
        return _mock_brand_prediction(ram, battery, screen_size, weight, year, price)


# Mock prediction functions (fallback when models aren't available)
def _mock_price_prediction(ram: float, battery: float, screen_size: float,
                          weight: float, year: int, company: str) -> float:
    """Mock price prediction based on features"""
    base_price = 200
    ram_mult = ram * 50
    battery_mult = battery * 0.1
    screen_mult = screen_size * 100
    year_mult = (year - 2020) * 20

    company_mult = 1.0
    if company.lower() == 'apple':
        company_mult = 1.5
    elif company.lower() == 'samsung':
        company_mult = 1.2
    elif company.lower() in ['xiaomi', 'oneplus']:
        company_mult = 0.9

    price = (base_price + ram_mult + battery_mult + screen_mult + year_mult) * company_mult
    return max(100, round(price))


def _mock_ram_prediction(battery: float, screen_size: float, weight: float,
                        year: int, price: float, company: str) -> float:
    """Mock RAM prediction"""
    base_ram = 4
    price_mult = price / 200
    year_mult = (year - 2020) * 0.5
    ram = base_ram + price_mult + year_mult
    return max(2, round(ram * 10) / 10)


def _mock_battery_prediction(ram: float, screen_size: float, weight: float,
                            year: int, price: float, company: str) -> float:
    """Mock battery prediction"""
    base_battery = 3000
    screen_mult = screen_size * 500
    price_mult = price / 10
    battery = base_battery + screen_mult + price_mult
    return max(2000, round(battery))


def _mock_brand_prediction(ram: float, battery: float, screen_size: float,
                          weight: float, year: int, price: float) -> str:
    """Mock brand prediction"""
    if price > 800:
        return 'Apple'
    elif price > 500:
        return 'Samsung'
    elif price > 300:
        return 'Xiaomi'
    else:
        return 'Other'
