"""
Retraining script for sklearn models with proper cross-validation and feature engineering
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import Ridge, Lasso
from sklearn.svm import SVR
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
import os
from pathlib import Path
import json
import joblib
from sklearn.feature_selection import SelectKBest, f_regression
import warnings
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)

# Create models directory
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def load_and_preprocess_data(csv_path: str = None):
    """Load and preprocess the mobile phones dataset with correct column names"""
    if csv_path is None:
        # Try multiple possible paths
        possible_paths = [
            "../data/Mobiles Dataset (2025).csv",
            "data/Mobiles Dataset (2025).csv",
            "../Mobiles Dataset (2025).csv",
            "Mobiles Dataset (2025).csv"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                break
        if csv_path is None:
            raise FileNotFoundError("Could not find CSV file. Please specify the path.")

    print(f"Loading dataset from: {csv_path}")

    # Load CSV with encoding handling
    encodings_to_try = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252', 'utf-16']
    df = None
    for encoding in encodings_to_try:
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            print(f"✓ Successfully loaded with encoding: {encoding}")
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Error with encoding {encoding}: {e}")
            continue

    if df is None:
        raise ValueError(f"Could not load CSV file with any of the attempted encodings: {encodings_to_try}")
    print(f"✓ Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    print("Columns:", list(df.columns))

    # Parse numerical features with correct column names
    def extract_number(value, pattern=r'(\d+\.?\d*)'):
        import re
        if pd.isna(value):
            return np.nan
        value_str = str(value)
        match = re.search(pattern, value_str.replace(',', ''))
        return float(match.group(1)) if match else np.nan

    # Parse RAM
    df['ram_parsed'] = df['RAM'].apply(lambda x: extract_number(str(x), r'(\d+)'))

    # Parse Battery with correct column name
    df['battery_parsed'] = df['Battery Capacity'].apply(lambda x: extract_number(str(x), r'([\d,]+)'))

    # Parse Screen Size with correct column name
    df['screen_parsed'] = df['Screen Size'].apply(lambda x: extract_number(str(x), r'(\d+\.?\d*)'))

    # Parse Weight with correct column name
    df['weight_parsed'] = df['Mobile Weight'].apply(lambda x: extract_number(str(x), r'(\d+)'))

    # Parse Price (USD) with correct column name
    df['price_parsed'] = df['Launched Price (USA)'].apply(lambda x: extract_number(str(x), r'([\d,]+)'))

    # Parse Year with correct column name
    df['year_parsed'] = df['Launched Year'].apply(lambda x: extract_number(str(x), r'(\d{4})'))

    # Get company name
    df['company_parsed'] = df['Company Name']

    # Clean data - remove rows with missing critical values
    required_cols = ['ram_parsed', 'battery_parsed', 'screen_parsed', 'weight_parsed', 'price_parsed', 'year_parsed', 'company_parsed']
    df_clean = df[required_cols].dropna()

    # Remove extreme outliers (prices > $2000 or < $100)
    df_clean = df_clean[(df_clean['price_parsed'] >= 100) & (df_clean['price_parsed'] <= 2000)]

    print(f"✓ Cleaned data: {len(df_clean)} samples")
    print(f"  RAM range: {df_clean['ram_parsed'].min():.0f} - {df_clean['ram_parsed'].max():.0f} GB")
    print(f"  Battery range: {df_clean['battery_parsed'].min():.0f} - {df_clean['battery_parsed'].max():.0f} mAh")
    print(f"  Price range: ${df_clean['price_parsed'].min():.0f} - ${df_clean['price_parsed'].max():.0f}")

    return df_clean


def create_enhanced_features(df, target_col):
    """Create enhanced features for better model performance"""
    df_features = df.copy()

    # Basic features
    features = ['ram_parsed', 'battery_parsed', 'screen_parsed', 'weight_parsed', 'year_parsed']

    # Add company encoding
    companies = df['company_parsed'].values
    unique_companies = sorted(list(set(companies)))
    company_to_idx = {company: idx for idx, company in enumerate(unique_companies)}

    # One-hot encode companies
    for company in unique_companies:
        df_features[f'company_{company.lower()}'] = (df['company_parsed'] == company).astype(int)

    # Add polynomial features for key specs
    poly_features = ['ram_parsed', 'battery_parsed', 'screen_parsed']
    poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
    poly_cols = poly.fit_transform(df[poly_features])
    poly_feature_names = poly.get_feature_names_out(poly_features)

    for i, col_name in enumerate(poly_feature_names):
        if col_name not in ['ram_parsed', 'battery_parsed', 'screen_parsed']:
            df_features[f'poly_{col_name}'] = poly_cols[:, i]

    # Add ratio features
    df_features['ram_per_dollar'] = df['ram_parsed'] / df['price_parsed']
    df_features['battery_per_dollar'] = df['battery_parsed'] / df['price_parsed']
    df_features['screen_per_dollar'] = df['screen_parsed'] / df['price_parsed']
    df_features['battery_efficiency'] = df['battery_parsed'] / df['weight_parsed']
    df_features['screen_density'] = df['screen_parsed'] / df['weight_parsed']

    # Add year-based features
    df_features['years_since_2020'] = df['year_parsed'] - 2020
    df_features['is_recent'] = (df['year_parsed'] >= 2023).astype(int)
    df_features['is_premium_year'] = (df['year_parsed'] >= 2022).astype(int)

    # Price-based segmentation for RAM model
    if target_col == 'ram_parsed':
        df_features['price_segment'] = pd.cut(df['price_parsed'],
                                            bins=[0, 200, 400, 600, 1000, float('inf')],
                                            labels=['budget', 'entry_mid', 'mid', 'premium', 'flagship'])

        # One-hot encode price segments
        for segment in ['budget', 'entry_mid', 'mid', 'premium', 'flagship']:
            df_features[f'price_{segment}'] = (df_features['price_segment'] == segment).astype(int)

        df_features = df_features.drop('price_segment', axis=1)

    # Battery-based features for battery model
    if target_col == 'battery_parsed':
        df_features['ram_efficiency'] = df['battery_parsed'] / (df['ram_parsed'] + 1)
        df_features['screen_battery_ratio'] = df['battery_parsed'] / (df['screen_parsed'] + 1)

    return df_features, unique_companies


def train_with_cross_validation(X, y, model_name, model_type='regression'):
    """Train model with proper cross-validation and hyperparameter tuning"""
    print(f"\n=== Training {model_name} with Cross-Validation ===")

    # Define parameter grids for different model types
    param_grids = {
        'rf': {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        },
        'gb': {
            'n_estimators': [50, 100, 200],
            'learning_rate': [0.01, 0.1, 0.2],
            'max_depth': [3, 5, 7],
            'subsample': [0.8, 0.9, 1.0]
        },
        'ridge': {
            'alpha': [0.1, 1.0, 10.0, 100.0]
        },
        'svr': {
            'C': [0.1, 1.0, 10.0],
            'gamma': ['scale', 'auto'],
            'kernel': ['rbf', 'linear']
        }
    }

    # Initialize models
    models = {
        'rf': RandomForestRegressor(random_state=42),
        'gb': GradientBoostingRegressor(random_state=42),
        'ridge': Ridge(random_state=42),
        'svr': SVR()
    }

    best_model = None
    best_score = float('-inf') if model_type == 'classification' else float('inf')
    best_params = None

    # Try different models with grid search
    for model_name_short, base_model in models.items():
        if model_name_short not in param_grids:
            continue

        print(f"  Testing {model_name_short}...")

        try:
            # Create pipeline
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('model', base_model)
            ])

            # Update parameter grid for pipeline
            pipeline_params = {f'model__{k}': v for k, v in param_grids[model_name_short].items()}

            # Grid search with cross-validation
            grid_search = GridSearchCV(
                pipeline,
                pipeline_params,
                cv=5,
                scoring='neg_mean_squared_error' if model_type == 'regression' else 'accuracy',
                n_jobs=-1,
                verbose=0
            )

            grid_search.fit(X, y)

            # Evaluate best model from grid search
            cv_scores = cross_val_score(
                grid_search.best_estimator_,
                X, y,
                cv=KFold(n_splits=5, shuffle=True, random_state=42),
                scoring='neg_mean_squared_error' if model_type == 'regression' else 'accuracy'
            )

            mean_score = -cv_scores.mean() if model_type == 'regression' else cv_scores.mean()

            print(f"    CV Score: {mean_score:.4f}")

            # Keep best model
            if model_type == 'regression':
                if mean_score < best_score:
                    best_score = mean_score
                    best_model = grid_search.best_estimator_
                    best_params = grid_search.best_params_
            else:
                if mean_score > best_score:
                    best_score = mean_score
                    best_model = grid_search.best_estimator_
                    best_params = grid_search.best_params_

        except Exception as e:
            print(f"    Error with {model_name_short}: {e}")
            continue

    if best_model is None:
        print("  No suitable model found, using default")
        best_model = Pipeline([
            ('scaler', StandardScaler()),
            ('model', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        best_model.fit(X, y)

    return best_model, best_score, best_params


def train_price_model(df_clean):
    """Train price prediction model with enhanced features and cross-validation"""
    print("\n🎯 Training Price Prediction Model")

    # Create enhanced features
    df_features, unique_companies = create_enhanced_features(df_clean, 'price_parsed')

    # Select features (exclude target and non-numeric)
    exclude_cols = ['price_parsed', 'company_parsed']
    feature_cols = [col for col in df_features.columns if col not in exclude_cols]

    X = df_features[feature_cols].values
    y = df_features['price_parsed'].values

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"Price range: ${y.min():.0f} - ${y.max():.0f}")

    # Feature selection
    selector = SelectKBest(score_func=f_regression, k=min(50, X.shape[1]))
    X_selected = selector.fit_transform(X, y)
    selected_features = [feature_cols[i] for i in selector.get_support(indices=True)]

    print(f"Selected {len(selected_features)} best features")

    # Train with cross-validation
    model, cv_score, best_params = train_with_cross_validation(X_selected, y, "Price Predictor")

    # Final evaluation
    X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)

    print("\n✓ Final Performance:")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: ${rmse:.2f}")
    print(f"  MAE: ${mae:.2f}")
    # Save model and scalers in the format expected by predictions_sklearn.py
    # Extract the actual model and scaler from pipeline
    actual_model = model.named_steps['model']
    scaler = model.named_steps['scaler']

    # Create scaler dict in expected format
    scaler_dict = {
        'X_scaler': scaler,
        'y_scaler': scaler,  # Use same scaler for both (simplified)
        'use_log': False
    }

    joblib.dump(actual_model, MODELS_DIR / "price_predictor_sklearn_optimized.joblib")
    joblib.dump(scaler_dict, MODELS_DIR / "price_predictor_scalers_optimized.pkl")

    metadata = {
        'model_type': 'sklearn_ensemble',
        'selected_features': selected_features,
        'unique_companies': unique_companies,
        'cv_score': float(cv_score),
        'r2': float(r2),
        'rmse': float(rmse),
        'mae': float(mae),
        'best_params': str(best_params) if best_params else None,
        'feature_count': len(selected_features)
    }

    with open(MODELS_DIR / "price_predictor_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    print("✓ Price model saved")
    return r2, rmse


def train_ram_model(df_clean):
    """Train RAM prediction model"""
    print("\n🧠 Training RAM Prediction Model")

    df_features, unique_companies = create_enhanced_features(df_clean, 'ram_parsed')

    exclude_cols = ['ram_parsed', 'company_parsed']
    feature_cols = [col for col in df_features.columns if col not in exclude_cols]

    X = df_features[feature_cols].values
    y = df_features['ram_parsed'].values

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"RAM range: {y.min():.0f} - {y.max():.0f} GB")

    # Feature selection
    selector = SelectKBest(score_func=f_regression, k=min(30, X.shape[1]))
    X_selected = selector.fit_transform(X, y)
    selected_features = [feature_cols[i] for i in selector.get_support(indices=True)]

    # Train model
    model, cv_score, best_params = train_with_cross_validation(X_selected, y, "RAM Predictor")

    # Final evaluation
    X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("\n✓ Final Performance:")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: {rmse:.2f}")

    # Save model and scalers in the format expected by predictions_sklearn.py
    actual_model = model.named_steps['model']
    scaler = model.named_steps['scaler']
    scaler_dict = {
        'X_scaler': scaler,
        'y_scaler': scaler,
        'use_log': False
    }

    joblib.dump(actual_model, MODELS_DIR / "ram_predictor_sklearn_optimized.joblib")
    joblib.dump(scaler_dict, MODELS_DIR / "ram_predictor_scalers_optimized.pkl")

    metadata = {
        'model_type': 'sklearn_ensemble',
        'selected_features': selected_features,
        'unique_companies': unique_companies,
        'cv_score': float(cv_score),
        'r2': float(r2),
        'rmse': float(rmse)
    }

    with open(MODELS_DIR / "ram_predictor_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    print("✓ RAM model saved")
    return r2, rmse


def train_battery_model(df_clean):
    """Train battery prediction model"""
    print("\n🔋 Training Battery Prediction Model")

    df_features, unique_companies = create_enhanced_features(df_clean, 'battery_parsed')

    exclude_cols = ['battery_parsed', 'company_parsed']
    feature_cols = [col for col in df_features.columns if col not in exclude_cols]

    X = df_features[feature_cols].values
    y = df_features['battery_parsed'].values

    print(f"Features: {X.shape[0]} samples × {X.shape[1]} features")
    print(f"Battery range: {y.min():.0f} - {y.max():.0f} mAh")

    # Feature selection
    selector = SelectKBest(score_func=f_regression, k=min(30, X.shape[1]))
    X_selected = selector.fit_transform(X, y)
    selected_features = [feature_cols[i] for i in selector.get_support(indices=True)]

    # Train model
    model, cv_score, best_params = train_with_cross_validation(X_selected, y, "Battery Predictor")

    # Final evaluation
    X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("\n✓ Final Performance:")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: {rmse:.2f}")

    # Save model and scalers in the format expected by predictions_sklearn.py
    actual_model = model.named_steps['model']
    scaler = model.named_steps['scaler']
    scaler_dict = {
        'X_scaler': scaler,
        'y_scaler': scaler,
        'use_log': False
    }

    joblib.dump(actual_model, MODELS_DIR / "battery_predictor_sklearn_optimized.joblib")
    joblib.dump(scaler_dict, MODELS_DIR / "battery_predictor_scalers_optimized.pkl")

    metadata = {
        'model_type': 'sklearn_ensemble',
        'selected_features': selected_features,
        'unique_companies': unique_companies,
        'cv_score': float(cv_score),
        'r2': float(r2),
        'rmse': float(rmse)
    }

    with open(MODELS_DIR / "battery_predictor_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    print("✓ Battery model saved")
    return r2, rmse


if __name__ == "__main__":
    print("=" * 70)
    print("🔄 Retraining sklearn Models with Cross-Validation")
    print("=" * 70)

    # Load data
    df_clean = load_and_preprocess_data()

    print("\n📊 Dataset Summary:")
    print(f"  Samples: {len(df_clean)}")
    print(f"  Price range: ${df_clean['price_parsed'].min():.0f} - ${df_clean['price_parsed'].max():.0f}")
    print(f"  Companies: {len(df_clean['company_parsed'].unique())}")

    # Train models
    print("\n" + "=" * 70)
    price_r2, price_rmse = train_price_model(df_clean)
    ram_r2, ram_rmse = train_ram_model(df_clean)
    battery_r2, battery_rmse = train_battery_model(df_clean)

    print("\n" + "=" * 70)
    print("✅ Model Retraining Complete!")
    print("\n📈 Performance Summary:")
    print(f"  Price Model R²: {price_r2:.4f} (RMSE: ${price_rmse:.2f})")
    print(f"  RAM Model R²: {ram_r2:.4f} (RMSE: {ram_rmse:.2f} GB)")
    print(f"  Battery Model R²: {battery_r2:.4f} (RMSE: {battery_rmse:.2f} mAh)")
    print(f"\n💾 Models saved in: {MODELS_DIR}")
    print("=" * 70)
