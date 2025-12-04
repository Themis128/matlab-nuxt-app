#!/usr/bin/env python3
"""
Mock predictions for Python 3.14 compatibility
Provides basic prediction functions when trained models can't be loaded
"""

import logging
import random
from typing import Dict, List

logger = logging.getLogger(__name__)

# Mock prediction data based on typical mobile phone specs
BRANDS = ["Samsung", "Apple", "Xiaomi", "OnePlus", "Google", "Huawei", "Sony", "LG", "Motorola", "Nokia"]

def predict_price(ram: float, battery: float, screen_size: float, weight: float, year: int, company: str) -> float:
    """Mock price prediction based on specs"""
    try:
        # Simple linear model approximation
        base_price = 200  # Base price in USD

        # RAM factor (more RAM = higher price)
        ram_factor = ram * 15

        # Battery factor (larger battery = slightly higher price)
        battery_factor = (battery / 1000) * 20

        # Screen size factor (larger screen = higher price)
        screen_factor = screen_size * 50

        # Weight factor (lighter = premium = higher price)
        weight_factor = max(0, (200 - weight) * 2)

        # Year factor (newer = higher price)
        year_factor = (year - 2015) * 10

        # Brand premium
        brand_premium = 0
        premium_brands = ["Apple", "Samsung", "Google", "OnePlus"]
        if company in premium_brands:
            brand_premium = 100

        predicted_price = base_price + ram_factor + battery_factor + screen_factor + weight_factor + year_factor + brand_premium

        # Add some randomness
        predicted_price *= (0.8 + random.random() * 0.4)  # ±20% variation

        return round(max(50, min(predicted_price, 2000)), 2)  # Clamp between 50-2000 USD

    except Exception as e:
        logger.error(f"Error in mock predict_price: {e}")
        return 299.99  # Default fallback price


def predict_ram(battery: float, screen_size: float, weight: float, year: int, price: float, company: str) -> float:
    """Mock RAM prediction"""
    try:
        # RAM typically correlates with price and year
        base_ram = 4

        # Price factor (higher price = more RAM)
        price_factor = min(price / 200, 4)  # Max 4GB from price

        # Year factor (newer phones have more RAM)
        year_factor = max(0, (year - 2018) * 0.5)

        # Battery factor (larger batteries often in phones with more RAM)
        battery_factor = min(battery / 5000, 2)

        predicted_ram = base_ram + price_factor + year_factor + battery_factor

        # Add some randomness
        predicted_ram *= (0.9 + random.random() * 0.2)  # ±10% variation

        return round(max(2, min(predicted_ram, 16)), 1)  # Clamp between 2-16 GB

    except Exception as e:
        logger.error(f"Error in mock predict_ram: {e}")
        return 8.0  # Default fallback RAM


def predict_battery(ram: float, screen_size: float, weight: float, year: int, price: float, company: str) -> float:
    """Mock battery prediction"""
    try:
        # Battery capacity typically 3000-5000 mAh
        base_battery = 3500

        # Screen size factor (larger screens need more battery)
        screen_factor = screen_size * 200

        # RAM factor (more RAM might correlate with better battery optimization)
        ram_factor = ram * 50

        # Year factor (newer phones have better battery tech)
        year_factor = (year - 2015) * 20

        # Weight factor (heavier phones might have larger batteries)
        weight_factor = (weight - 150) * 5

        predicted_battery = base_battery + screen_factor + ram_factor + year_factor + weight_factor

        # Add some randomness
        predicted_battery *= (0.9 + random.random() * 0.2)  # ±10% variation

        return round(max(2000, min(predicted_battery, 7000)), 0)  # Clamp between 2000-7000 mAh

    except Exception as e:
        logger.error(f"Error in mock predict_battery: {e}")
        return 4000.0  # Default fallback battery


def predict_brand(ram: float, battery: float, screen_size: float, weight: float, year: int, price: float) -> str:
    """Mock brand prediction based on specs"""
    try:
        # Simple brand prediction based on price ranges and specs
        if price > 800:
            brand_weights = {"Apple": 0.4, "Samsung": 0.3, "Google": 0.2, "OnePlus": 0.1}
        elif price > 400:
            brand_weights = {"Samsung": 0.3, "Xiaomi": 0.25, "OnePlus": 0.2, "Huawei": 0.15, "Apple": 0.1}
        else:
            brand_weights = {"Xiaomi": 0.3, "Samsung": 0.25, "Motorola": 0.15, "Nokia": 0.15, "Sony": 0.1, "LG": 0.05}

        # Adjust weights based on specs
        if ram >= 8:
            brand_weights["Samsung"] = brand_weights.get("Samsung", 0) + 0.1
            brand_weights["OnePlus"] = brand_weights.get("OnePlus", 0) + 0.1

        if battery > 4500:
            brand_weights["Xiaomi"] = brand_weights.get("Xiaomi", 0) + 0.1

        if screen_size > 6.5:
            brand_weights["Samsung"] = brand_weights.get("Samsung", 0) + 0.1

        # Normalize weights
        total_weight = sum(brand_weights.values())
        if total_weight > 0:
            brand_weights = {k: v/total_weight for k, v in brand_weights.items()}

        # Select brand based on weights
        brands = list(brand_weights.keys())
        weights = list(brand_weights.values())
        selected_brand = random.choices(brands, weights=weights, k=1)[0]

        return selected_brand

    except Exception as e:
        logger.error(f"Error in mock predict_brand: {e}")
        return "Samsung"  # Default fallback brand
