"""
TensorFlow-based Prediction Functions
Uses trained TensorFlow/Keras models for accurate predictions
"""

import numpy as np
import os
import json
from pathlib import Path
from typing import Union

try:
    import tensorflow as tf
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available. Install with: pip install tensorflow")

# Models directory
MODELS_DIR = Path(__file__).parent / "trained_models"


class TensorFlowPredictor:
    """Load and use TensorFlow models for predictions"""

    def __init__(self):
        self.models = {}
        self.metadata = {}
        self._load_models()

    def _load_models(self):
        """Load all trained models"""
        if not TENSORFLOW_AVAILABLE:
            return

        model_files = {
            'price': 'price_predictor.h5',
            'ram': 'ram_predictor.h5',
            'battery': 'battery_predictor.h5',
            'brand': 'brand_classifier.h5'
        }

        for model_name, model_file in model_files.items():
            model_path = MODELS_DIR / model_file
            metadata_path = MODELS_DIR / model_file.replace('.h5', '_metadata.json')

            if model_path.exists() and metadata_path.exists():
                try:
                    self.models[model_name] = keras.models.load_model(str(model_path))
                    with open(metadata_path, 'r') as f:
                        self.metadata[model_name] = json.load(f)
                    print(f"✓ Loaded {model_name} model")
                except Exception as e:
                    print(f"[ERROR] Error loading {model_name} model: {e}")

    def encode_company(self, company: str, model_name: str) -> np.ndarray:
        """One-hot encode company name"""
        if model_name not in self.metadata:
            return np.zeros(1)

        companies = self.metadata[model_name].get('unique_companies', [])
        if not companies:
            return np.zeros(1)

        company_lower = company.lower()
        try:
            idx = next(i for i, c in enumerate(companies) if c.lower() == company_lower)
        except StopIteration:
            idx = 0

        encoded = np.zeros(len(companies))
        encoded[idx] = 1
        return encoded

    def predict_price(self, ram: float, battery: float, screen_size: float,
                     weight: float, year: int, company: str) -> float:
        """Predict price using TensorFlow model"""
        if 'price' not in self.models:
            return _mock_price_prediction(ram, battery, screen_size, weight, year, company)

        try:
            # Encode company
            company_encoded = self.encode_company(company, 'price')

            # Prepare features
            features = np.array([ram, battery, screen_size, weight, year] + company_encoded.tolist())
            features = features.reshape(1, -1)

            # Normalize
            meta = self.metadata['price']
            X_mean = np.array(meta['X_mean'])
            X_std = np.array(meta['X_std'])
            y_mean = meta['y_mean']
            y_std = meta['y_std']

            features_norm = (features - X_mean) / (X_std + 1e-8)

            # Predict
            pred_norm = self.models['price'].predict(features_norm, verbose=0)
            price = pred_norm[0, 0] * y_std + y_mean

            return max(100, round(price))
        except Exception as e:
            print(f"Error in TensorFlow price prediction: {e}")
            return _mock_price_prediction(ram, battery, screen_size, weight, year, company)

    def predict_ram(self, battery: float, screen_size: float, weight: float,
                   year: int, price: float, company: str) -> float:
        """Predict RAM using TensorFlow model"""
        if 'ram' not in self.models:
            return _mock_ram_prediction(battery, screen_size, weight, year, price, company)

        try:
            company_encoded = self.encode_company(company, 'ram')
            features = np.array([battery, screen_size, weight, year, price] + company_encoded.tolist())
            features = features.reshape(1, -1)

            meta = self.metadata['ram']
            features_norm = (features - np.array(meta['X_mean'])) / (np.array(meta['X_std']) + 1e-8)

            pred_norm = self.models['ram'].predict(features_norm, verbose=0)
            ram = pred_norm[0, 0] * meta['y_std'] + meta['y_mean']

            return max(2, round(ram * 10) / 10)
        except Exception as e:
            print(f"Error in TensorFlow RAM prediction: {e}")
            return _mock_ram_prediction(battery, screen_size, weight, year, price, company)

    def predict_battery(self, ram: float, screen_size: float, weight: float,
                       year: int, price: float, company: str) -> float:
        """Predict battery using TensorFlow model"""
        if 'battery' not in self.models:
            return _mock_battery_prediction(ram, screen_size, weight, year, price, company)

        try:
            company_encoded = self.encode_company(company, 'battery')
            features = np.array([ram, screen_size, weight, year, price] + company_encoded.tolist())
            features = features.reshape(1, -1)

            meta = self.metadata['battery']
            features_norm = (features - np.array(meta['X_mean'])) / (np.array(meta['X_std']) + 1e-8)

            pred_norm = self.models['battery'].predict(features_norm, verbose=0)
            battery = pred_norm[0, 0] * meta['y_std'] + meta['y_mean']

            return max(2000, round(battery))
        except Exception as e:
            print(f"Error in TensorFlow battery prediction: {e}")
            return _mock_battery_prediction(ram, screen_size, weight, year, price, company)

    def predict_brand(self, ram: float, battery: float, screen_size: float,
                     weight: float, year: int, price: float) -> str:
        """Predict brand using TensorFlow model"""
        if 'brand' not in self.models:
            return _mock_brand_prediction(ram, battery, screen_size, weight, year, price)

        try:
            features = np.array([ram, battery, screen_size, weight, year, price])
            features = features.reshape(1, -1)

            meta = self.metadata['brand']
            features_norm = (features - np.array(meta['X_mean'])) / (np.array(meta['X_std']) + 1e-8)

            pred_probs = self.models['brand'].predict(features_norm, verbose=0)
            pred_idx = np.argmax(pred_probs[0])

            brands = meta['unique_brands']
            return brands[pred_idx]
        except Exception as e:
            print(f"Error in TensorFlow brand prediction: {e}")
            return _mock_brand_prediction(ram, battery, screen_size, weight, year, price)


# Global predictor instance
_predictor = None

def get_predictor():
    """Get or create global predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = TensorFlowPredictor()
    return _predictor


# Public prediction functions
def predict_price(ram: float, battery: float, screen_size: float,
                 weight: float, year: int, company: str) -> float:
    """Predict price - uses TensorFlow if available, else mock"""
    predictor = get_predictor()
    return predictor.predict_price(ram, battery, screen_size, weight, year, company)


def predict_ram(battery: float, screen_size: float, weight: float,
               year: int, price: float, company: str) -> float:
    """Predict RAM - uses TensorFlow if available, else mock"""
    predictor = get_predictor()
    return predictor.predict_ram(battery, screen_size, weight, year, price, company)


def predict_battery(ram: float, screen_size: float, weight: float,
                   year: int, price: float, company: str) -> float:
    """Predict battery - uses TensorFlow if available, else mock"""
    predictor = get_predictor()
    return predictor.predict_battery(ram, screen_size, weight, year, price, company)


def predict_brand(ram: float, battery: float, screen_size: float,
                 weight: float, year: int, price: float) -> str:
    """Predict brand - uses TensorFlow if available, else mock"""
    predictor = get_predictor()
    return predictor.predict_brand(ram, battery, screen_size, weight, year, price)


# Mock prediction functions (fallback)
def _mock_price_prediction(ram: float, battery: float, screen_size: float,
                          weight: float, year: int, company: str) -> float:
    base_price = 200
    ram_mult = ram * 50
    battery_mult = battery * 0.1
    screen_mult = screen_size * 100
    year_mult = (year - 2020) * 20
    company_mult = 1.5 if company.lower() == 'apple' else 1.2 if company.lower() == 'samsung' else 1.0
    price = (base_price + ram_mult + battery_mult + screen_mult + year_mult) * company_mult
    return max(100, round(price))


def _mock_ram_prediction(battery: float, screen_size: float, weight: float,
                         year: int, price: float, company: str) -> float:
    base_ram = 4
    price_mult = price / 200
    year_mult = (year - 2020) * 0.5
    ram = base_ram + price_mult + year_mult
    return max(2, round(ram * 10) / 10)


def _mock_battery_prediction(ram: float, screen_size: float, weight: float,
                            year: int, price: float, company: str) -> float:
    base_battery = 3000
    screen_mult = screen_size * 500
    price_mult = price / 10
    battery = base_battery + screen_mult + price_mult
    return max(2000, round(battery))


def _mock_brand_prediction(ram: float, battery: float, screen_size: float,
                          weight: float, year: int, price: float) -> str:
    if price > 800:
        return 'Apple'
    elif price > 500:
        return 'Samsung'
    elif price > 300:
        return 'Xiaomi'
    else:
        return 'Other'
