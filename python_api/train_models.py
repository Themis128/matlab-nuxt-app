"""
TensorFlow/Keras Model Training Scripts
Replicates MATLAB training process for better accuracy
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import os
from pathlib import Path
import json

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Create models directory
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def load_and_preprocess_data(csv_path: str = None):
    """Load and preprocess the mobile phones dataset"""
    if csv_path is None:
        # Try multiple possible paths
        possible_paths = [
            "../Mobiles Dataset (2025).csv",
            "Mobiles Dataset (2025).csv",
            "../mobiles-dataset-docs/Mobiles Dataset (2025).csv"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                break
        if csv_path is None:
            raise FileNotFoundError("Could not find CSV file. Please specify the path.")
    """Load and preprocess the mobile phones dataset"""
    print("Loading dataset...")

    # Load CSV
    df = pd.read_csv(csv_path)
    print(f"✓ Dataset loaded: {len(df)} rows, {len(df.columns)} columns")

    # Parse numerical features
    def extract_number(value, pattern=r'(\d+\.?\d*)'):
        import re
        if pd.isna(value):
            return np.nan
        value_str = str(value)
        match = re.search(pattern, value_str.replace(',', ''))
        return float(match.group(1)) if match else np.nan

    # Parse RAM
    df['ram_parsed'] = df['RAM'].apply(lambda x: extract_number(str(x), r'(\d+)'))

    # Parse Battery
    battery_col = None
    for col in ['BatteryCapacity', 'Battery_Capacity', 'Battery']:
        if col in df.columns:
            battery_col = col
            break
    if battery_col:
        df['battery_parsed'] = df[battery_col].apply(lambda x: extract_number(str(x), r'([\d,]+)'))

    # Parse Screen Size
    screen_col = None
    for col in ['ScreenSize', 'Screen_Size', 'Screen', 'Display_Size']:
        if col in df.columns:
            screen_col = col
            break
    if screen_col:
        df['screen_parsed'] = df[screen_col].apply(lambda x: extract_number(str(x), r'(\d+\.?\d*)'))

    # Parse Weight
    weight_col = None
    for col in ['Mobile_Weight', 'MobileWeight', 'Weight', 'Phone_Weight']:
        if col in df.columns:
            weight_col = col
            break
    if weight_col:
        df['weight_parsed'] = df[weight_col].apply(lambda x: extract_number(str(x), r'(\d+)'))

    # Parse Price (USD)
    price_col = None
    for col in ['Price_USD', 'Price', 'USD_Price', 'Price (USD)']:
        if col in df.columns:
            price_col = col
            break
    if price_col:
        df['price_parsed'] = df[price_col].apply(lambda x: extract_number(str(x), r'([\d,]+)'))

    # Parse Year
    year_col = None
    for col in ['Launched_Year', 'Year', 'Launch_Year', 'Launched Year']:
        if col in df.columns:
            year_col = col
            break
    if year_col:
        df['year_parsed'] = df[year_col].apply(lambda x: extract_number(str(x), r'(\d{4})'))

    # Get company name
    company_col = None
    for col in ['Company Name', 'Company', 'Brand', 'Company_Name']:
        if col in df.columns:
            company_col = col
            break

    # Clean data - remove rows with missing critical values
    required_cols = ['ram_parsed', 'battery_parsed', 'screen_parsed', 'weight_parsed', 'price_parsed', 'year_parsed']
    df_clean = df[required_cols + [company_col]].dropna()

    # Convert to numpy arrays
    ram_clean = df_clean['ram_parsed'].values
    battery_clean = df_clean['battery_parsed'].values
    screen_clean = df_clean['screen_parsed'].values
    weight_clean = df_clean['weight_parsed'].values
    price_clean = df_clean['price_parsed'].values
    year_clean = df_clean['year_parsed'].values.astype(int)
    companies_clean = df_clean[company_col].values if company_col else ['Unknown'] * len(df_clean)

    print(f"✓ Cleaned data: {len(df_clean)} samples")
    print(f"  RAM range: {ram_clean.min():.0f} - {ram_clean.max():.0f} GB")
    print(f"  Battery range: {battery_clean.min():.0f} - {battery_clean.max():.0f} mAh")
    print(f"  Price range: ${price_clean.min():.0f} - ${price_clean.max():.0f}")

    return {
        'ram': ram_clean,
        'battery': battery_clean,
        'screen': screen_clean,
        'weight': weight_clean,
        'price': price_clean,
        'year': year_clean,
        'companies': companies_clean
    }


def encode_companies(companies):
    """One-hot encode company names"""
    unique_companies = sorted(list(set(companies)))
    company_encoded = np.zeros((len(companies), len(unique_companies)))

    for i, company in enumerate(companies):
        idx = unique_companies.index(company)
        company_encoded[i, idx] = 1

    return company_encoded, unique_companies


def train_price_model(data, epochs=100, batch_size=64):
    """Train price prediction model"""
    print("\n=== Training Price Prediction Model ===")

    # Prepare features
    company_encoded, unique_companies = encode_companies(data['companies'])
    X = np.column_stack([
        data['ram'],
        data['battery'],
        data['screen'],
        data['weight'],
        data['year'],
        company_encoded
    ])
    y = data['price']

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"Price range: ${y.min():.0f} - ${y.max():.0f}")

    # Normalize
    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    # Split data (70/15/15)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_normalized, y_normalized, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    # Build model (matching MATLAB architecture)
    num_features = X.shape[1]
    model = models.Sequential([
        layers.Dense(128, activation='relu', input_shape=(num_features,)),
        layers.Dropout(0.3),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(32, activation='relu'),
        layers.Dense(1)  # Regression output
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    # Train
    print("\nTraining model...")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(patience=5, factor=0.5)
        ]
    )

    # Evaluate
    y_pred_norm = model.predict(X_test)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_test_orig = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    mse = np.mean((y_pred - y_test_orig) ** 2)
    mae = np.mean(np.abs(y_pred - y_test_orig))
    rmse = np.sqrt(mse)

    ss_res = np.sum((y_test_orig - y_pred) ** 2)
    ss_tot = np.sum((y_test_orig - np.mean(y_test_orig)) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    print("\n✓ Test Performance:")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: ${rmse:.2f}")
    print(f"  MAE: ${mae:.2f}")

    # Save model
    model_path = MODELS_DIR / "price_predictor.h5"
    model.save(str(model_path))
    print(f"✓ Model saved: {model_path}")

    # Save normalization and metadata
    metadata = {
        'X_mean': X_scaler.mean_.tolist(),
        'X_std': X_scaler.scale_.tolist(),
        'y_mean': float(y_scaler.mean_[0]),
        'y_std': float(y_scaler.scale_[0]),
        'unique_companies': unique_companies,
        'r2': float(r2),
        'rmse': float(rmse),
        'mae': float(mae)
    }

    metadata_path = MODELS_DIR / "price_predictor_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✓ Metadata saved: {metadata_path}")

    return model, metadata


def train_ram_model(data, epochs=100, batch_size=64):
    """Train RAM prediction model"""
    print("\n=== Training RAM Prediction Model ===")

    # Features: Battery, Screen, Weight, Year, Price, Company
    company_encoded, unique_companies = encode_companies(data['companies'])
    X = np.column_stack([
        data['battery'],
        data['screen'],
        data['weight'],
        data['year'],
        data['price'],
        company_encoded
    ])
    y = data['ram']

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"RAM range: {y.min():.0f} - {y.max():.0f} GB")

    # Normalize
    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    # Split
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_normalized, y_normalized, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    # Build model
    model = models.Sequential([
        layers.Dense(64, activation='relu', input_shape=(X.shape[1],)),
        layers.Dropout(0.3),
        layers.Dense(32, activation='relu'),
        layers.Dense(1)
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    # Train
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)
        ]
    )

    # Evaluate
    y_pred_norm = model.predict(X_test)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_test_orig = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    r2 = 1 - (np.sum((y_test_orig - y_pred) ** 2) / np.sum((y_test_orig - np.mean(y_test_orig)) ** 2))
    rmse = np.sqrt(np.mean((y_pred - y_test_orig) ** 2))

    print(f"\n✓ Test Performance: R² = {r2:.4f}, RMSE = {rmse:.2f} GB")

    # Save
    model.save(str(MODELS_DIR / "ram_predictor.h5"))
    metadata = {
        'X_mean': X_scaler.mean_.tolist(),
        'X_std': X_scaler.scale_.tolist(),
        'y_mean': float(y_scaler.mean_[0]),
        'y_std': float(y_scaler.scale_[0]),
        'unique_companies': unique_companies,
        'r2': float(r2),
        'rmse': float(rmse)
    }
    with open(MODELS_DIR / "ram_predictor_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    return model, metadata


def train_battery_model(data, epochs=100, batch_size=64):
    """Train battery prediction model"""
    print("\n=== Training Battery Prediction Model ===")

    # Features: RAM, Screen, Weight, Year, Price, Company
    company_encoded, unique_companies = encode_companies(data['companies'])
    X = np.column_stack([
        data['ram'],
        data['screen'],
        data['weight'],
        data['year'],
        data['price'],
        company_encoded
    ])
    y = data['battery']

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"Battery range: {y.min():.0f} - {y.max():.0f} mAh")

    # Normalize
    X_scaler = StandardScaler()
    y_scaler = StandardScaler()

    X_normalized = X_scaler.fit_transform(X)
    y_normalized = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    # Split
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_normalized, y_normalized, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    # Build model
    model = models.Sequential([
        layers.Dense(64, activation='relu', input_shape=(X.shape[1],)),
        layers.Dropout(0.3),
        layers.Dense(32, activation='relu'),
        layers.Dense(1)
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    # Train
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)
        ]
    )

    # Evaluate
    y_pred_norm = model.predict(X_test)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
    y_test_orig = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    r2 = 1 - (np.sum((y_test_orig - y_pred) ** 2) / np.sum((y_test_orig - np.mean(y_test_orig)) ** 2))
    rmse = np.sqrt(np.mean((y_pred - y_test_orig) ** 2))

    print(f"\n✓ Test Performance: R² = {r2:.4f}, RMSE = {rmse:.2f} mAh")

    # Save
    model.save(str(MODELS_DIR / "battery_predictor.h5"))
    metadata = {
        'X_mean': X_scaler.mean_.tolist(),
        'X_std': X_scaler.scale_.tolist(),
        'y_mean': float(y_scaler.mean_[0]),
        'y_std': float(y_scaler.scale_[0]),
        'unique_companies': unique_companies,
        'r2': float(r2),
        'rmse': float(rmse)
    }
    with open(MODELS_DIR / "battery_predictor_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    return model, metadata


def train_brand_model(data, epochs=100, batch_size=64):
    """Train brand classification model"""
    print("\n=== Training Brand Classification Model ===")

    # Features: RAM, Battery, Screen, Weight, Year, Price
    X = np.column_stack([
        data['ram'],
        data['battery'],
        data['screen'],
        data['weight'],
        data['year'],
        data['price']
    ])

    # Encode brands as integers
    unique_brands = sorted(list(set(data['companies'])))
    brand_to_idx = {brand: idx for idx, brand in enumerate(unique_brands)}
    y = np.array([brand_to_idx[brand] for brand in data['companies']])
    num_classes = len(unique_brands)

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"Classes: {num_classes} brands")

    # Normalize
    X_scaler = StandardScaler()
    X_normalized = X_scaler.fit_transform(X)

    # Split
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_normalized, y, test_size=0.3, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )

    # Build model
    model = models.Sequential([
        layers.Dense(64, activation='relu', input_shape=(X.shape[1],)),
        layers.Dropout(0.3),
        layers.Dense(32, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # Train
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)
        ]
    )

    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    accuracy = np.mean(y_pred_classes == y_test)

    print(f"\n✓ Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

    # Save
    model.save(str(MODELS_DIR / "brand_classifier.h5"))
    metadata = {
        'X_mean': X_scaler.mean_.tolist(),
        'X_std': X_scaler.scale_.tolist(),
        'unique_brands': unique_brands,
        'accuracy': float(accuracy)
    }
    with open(MODELS_DIR / "brand_classifier_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    return model, metadata


if __name__ == "__main__":
    print("=" * 60)
    print("TensorFlow Model Training")
    print("=" * 60)

    # Load data
    data = load_and_preprocess_data()

    # Train all models
    print("\n" + "=" * 60)
    train_price_model(data, epochs=100)
    train_ram_model(data, epochs=100)
    train_battery_model(data, epochs=100)
    train_brand_model(data, epochs=100)

    print("\n" + "=" * 60)
    print("✓ All models trained and saved!")
    print(f"Models saved in: {MODELS_DIR}")
    print("=" * 60)
