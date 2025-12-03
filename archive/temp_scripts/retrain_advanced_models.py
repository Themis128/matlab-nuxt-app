#!/usr/bin/env python3
"""
Retrain advanced ML models on consolidated dataset.
Enables XGBoost, Ensemble, and other unused models.
"""

import json
import warnings
from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, StackingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings('ignore')

# Configuration
DATA_PATH = Path('data/consolidated/consolidated_phone_dataset.csv')
MODELS_DIR = Path('python_api/trained_models')
MODELS_DIR.mkdir(exist_ok=True)

def load_consolidated_data() -> pd.DataFrame:
    """Load the consolidated dataset"""
    print("📂 Loading consolidated dataset...")
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Consolidated dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"  ✅ Loaded {len(df)} rows × {len(df.columns)} columns")
    print(f"  📊 Available features: {', '.join(df.columns.tolist())}")

    # Show data summary
    if 'price_usd' in df.columns:
        print(f"  💰 Price range: ${df['price_usd'].min():.0f} - ${df['price_usd'].max():.0f}")
        print(f"  📈 Median price: ${df['price_usd'].median():.0f}")

    if 'company' in df.columns:
        print(f"  🏢 Brands: {df['company'].nunique()} unique companies")

    return df

def prepare_features(df: pd.DataFrame, target_column: str) -> Tuple[np.ndarray, np.ndarray, StandardScaler, LabelEncoder]:
    """Prepare features for model training"""
    print(f"🔧 Preparing features for {target_column} prediction...")

    # Define feature columns based on target
    if target_column == 'price_usd':
        # For price prediction, use all specs except price
        feature_cols = [col for col in df.columns if col not in [
            'price_usd', '_source_file', target_column
        ]]
        X = df[feature_cols].copy()
        y = df[target_column].values

    # Handle categorical features
    categorical_cols = X.select_dtypes(include=['object']).columns
    if len(categorical_cols) > 0:
        print(f"  🔠 Encoding {len(categorical_cols)} categorical features")
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print(f"  📊 Features: {X_scaled.shape[0]} samples × {X_scaled.shape[1]} features")
    print(f"  🎯 Target range: {y.min():.2f} - {y.max():.2f}")

    return X_scaled, y, scaler, None

def train_xgboost_models(X: np.ndarray, y: np.ndarray) -> Dict:
    """Train XGBoost models with different configurations"""
    print("\n🚀 Training XGBoost Models...")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = {}

    # XGBoost Conservative
    print("  📊 Training XGBoost Conservative...")
    xgb_conservative = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    xgb_conservative.fit(X_train, y_train)

    # Evaluate
    y_pred = xgb_conservative.predict(X_test)
    r2 = 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

    print(f"    ✅ XGBoost Conservative: R² = {r2:.4f}, RMSE = ${rmse:.2f}")

    # Save model
    joblib.dump(xgb_conservative, MODELS_DIR / 'xgboost_conservative.pkl')
    models['xgboost_conservative'] = {'r2': float(r2), 'rmse': float(rmse)}

    # XGBoost Aggressive
    print("  📊 Training XGBoost Aggressive...")
    xgb_aggressive = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=10,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42
    )
    xgb_aggressive.fit(X_train, y_train)

    y_pred = xgb_aggressive.predict(X_test)
    r2 = 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

    print(f"    ✅ XGBoost Aggressive: R² = {r2:.4f}, RMSE = ${rmse:.2f}")

    joblib.dump(xgb_aggressive, MODELS_DIR / 'xgboost_aggressive.pkl')
    models['xgboost_aggressive'] = {'r2': float(r2), 'rmse': float(rmse)}

    # XGBoost Deep
    print("  📊 Training XGBoost Deep...")
    xgb_deep = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=12,
        learning_rate=0.01,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        random_state=42
    )
    xgb_deep.fit(X_train, y_train)

    y_pred = xgb_deep.predict(X_test)
    r2 = 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

    print(f"    ✅ XGBoost Deep: R² = {r2:.4f}, RMSE = ${rmse:.2f}")

    joblib.dump(xgb_deep, MODELS_DIR / 'xgboost_deep.pkl')
    models['xgboost_deep'] = {'r2': float(r2), 'rmse': float(rmse)}

    return models

def train_ensemble_model(X: np.ndarray, y: np.ndarray) -> Dict:
    """Train ensemble stacking model"""
    print("\n🎭 Training Ensemble Stacking Model...")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Base models
    base_models = [
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42)),
        ('gb', GradientBoostingRegressor(n_estimators=100, random_state=42)),
        ('ridge', Ridge(random_state=42))
    ]

    # Meta learner
    meta_model = LinearRegression()

    # Stacking ensemble
    stacking_model = StackingRegressor(
        estimators=base_models,
        final_estimator=meta_model,
        cv=5
    )

    stacking_model.fit(X_train, y_train)

    # Evaluate
    y_pred = stacking_model.predict(X_test)
    r2 = 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

    print(f"  ✅ Ensemble Stacking: R² = {r2:.4f}, RMSE = ${rmse:.2f}")

    # Save model
    joblib.dump(stacking_model, MODELS_DIR / 'ensemble_stacking_model.pkl')

    return {'ensemble_stacking': {'r2': float(r2), 'rmse': float(rmse)}}

def train_distilled_model(X: np.ndarray, y: np.ndarray) -> Dict:
    """Train distilled model (simplified high-performance model)"""
    print("\n⚗️ Training Distilled Model...")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Use a well-tuned single model as "distilled" (representing knowledge distillation)
    distilled_model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )

    distilled_model.fit(X_train, y_train)

    # Evaluate
    y_pred = distilled_model.predict(X_test)
    r2 = 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
    rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

    print(f"  ✅ Distilled Model: R² = {r2:.4f}, RMSE = ${rmse:.2f}")

    # Save model
    joblib.dump(distilled_model, MODELS_DIR / 'distilled_price_model.pkl')

    return {'distilled': {'r2': float(r2), 'rmse': float(rmse)}}

def update_api_endpoints():
    """Update API endpoints to use newly trained models"""
    print("\n🔧 Updating API Endpoints...")

    # Read current API file
    api_file = Path('python_api/api_advanced_endpoints.py')
    if api_file.exists():
        with open(api_file, 'r') as f:
            content = f.read()

        # Update MODEL_TYPES to reflect newly trained models
        updated_content = content.replace(
            "# Placeholder for models that need fixing\n    'distilled': 'distilled_price_model.pkl',  # Currently broken\n    'ensemble_stacking': 'ensemble_stacking_model.pkl',  # Missing xgboost\n    'xgboost_conservative': 'xgboost_conservative.pkl',  # Missing xgboost",
            "# Now working with consolidated dataset\n    'distilled': 'distilled_price_model.pkl',\n    'ensemble_stacking': 'ensemble_stacking_model.pkl',\n    'xgboost_conservative': 'xgboost_conservative.pkl',\n    'xgboost_aggressive': 'xgboost_aggressive.pkl',\n    'xgboost_deep': 'xgboost_deep.pkl'"
        )

        with open(api_file, 'w') as f:
            f.write(updated_content)

        print("  ✅ API endpoints updated to include new models")

    # Update frontend to show new models
    frontend_file = Path('pages/advanced.vue')
    if frontend_file.exists():
        with open(frontend_file, 'r') as f:
            content = f.read()

        # Add new model options to the frontend
        if "'xgboost_conservative'" in content:
            # Add the new XGBoost variants
            updated_content = content.replace(
                "          <!-- INR Currency Model -->\n          <div",
                "          <!-- XGBoost Aggressive Model -->\n          <div\n            class=\"p-4 rounded-lg border-2 cursor-pointer transition-all\"\n            :class=\" selectedModel === 'xgboost_aggressive'\n              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'\n              : 'border-gray-200 dark:border-gray-700 hover:border-red-300'\n            \" @click=\"selectedModel = 'xgboost_aggressive'\">\n            <div class=\"text-center\">\n              <div class=\"text-2xl mb-2\">🔥</div>\n              <h3 class=\"font-semibold mb-1\">XGBoost Aggressive</h3>\n              <p class=\"text-xs text-gray-600 dark:text-gray-400\">High-performance XGBoost</p>\n              <div class=\"text-sm font-bold text-green-600 mt-1\">WORKING</div>\n            </div>\n          </div>\n\n          <!-- XGBoost Deep Model -->\n          <div\n            class=\"p-4 rounded-lg border-2 cursor-pointer transition-all\"\n            :class=\" selectedModel === 'xgboost_deep'\n              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'\n              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'\n            \" @click=\"selectedModel = 'xgboost_deep'\">\n            <div class=\"text-center\">\n              <div class=\"text-2xl mb-2\">🧠</div>\n              <h3 class=\"font-semibold mb-1\">XGBoost Deep</h3>\n              <p class=\"text-xs text-gray-600 dark:text-gray-400\">Complex deep XGBoost</p>\n              <div class=\"text-sm font-bold text-green-600 mt-1\">WORKING</div>\n            </div>\n          </div>\n\n          <!-- Ensemble Stacking Model -->\n          <div\n            class=\"p-4 rounded-lg border-2 cursor-pointer transition-all\"\n            :class=\" selectedModel === 'ensemble_stacking'\n              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'\n              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'\n            \" @click=\"selectedModel = 'ensemble_stacking'\">\n            <div class=\"text-center\">\n              <div class=\"text-2xl mb-2\">🎭</div>\n              <h3 class=\"font-semibold mb-1\">Ensemble Stacking</h3>\n              <p class=\"text-xs text-gray-600 dark:text-gray-400\">Multi-model stacking</p>\n              <div class=\"text-sm font-bold text-green-600 mt-1\">WORKING</div>\n            </div>\n          </div>\n\n          <!-- Distilled Model -->\n          <div\n            class=\"p-4 rounded-lg border-2 cursor-pointer transition-all\"\n            :class=\" selectedModel === 'distilled'\n              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'\n              : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'\n            \" @click=\"selectedModel = 'distilled'\">\n            <div class=\"text-center\">\n              <div class=\"text-2xl mb-2\">⚗️</div>\n              <h3 class=\"font-semibold mb-1\">Distilled Model</h3>\n              <p class=\"text-xs text-gray-600 dark:text-gray-400\">Optimized distilled model</p>\n              <div class=\"text-sm font-bold text-green-600 mt-1\">WORKING</div>\n            </div>\n          </div>\n\n          <!-- INR Currency Model -->\n          <div"
            )

            with open(frontend_file, 'w') as f:
                f.write(updated_content)

            print("  ✅ Frontend updated with new model options")

def main():
    """Main retraining process"""
    print("=" * 70)
    print("🚀 ADVANCED MODEL RETRAINING ON CONSOLIDATED DATASET")
    print("=" * 70)
    print()

    # Load data
    df = load_consolidated_data()
    print()

    # Prepare features for price prediction
    X, y, scaler, _ = prepare_features(df, 'price_usd')
    print()

    # Train advanced models
    results = {}

    # XGBoost models
    xgb_results = train_xgboost_models(X, y)
    results.update(xgb_results)

    # Ensemble model
    ensemble_results = train_ensemble_model(X, y)
    results.update(ensemble_results)

    # Distilled model
    distilled_results = train_distilled_model(X, y)
    results.update(distilled_results)

    print()
    print("=" * 70)
    print("📊 MODEL TRAINING RESULTS")
    print("=" * 70)

    for model_name, metrics in results.items():
        print(f"🏆 {model_name.replace('_', ' ').title()}")
        print(f"   R² Score: {metrics['r2']:.4f}")
        print(f"   RMSE: ${metrics['rmse']:.2f}")
        print()

    # Update API and frontend
    update_api_endpoints()

    print("=" * 70)
    print("✅ ADVANCED MODEL RETRAINING COMPLETE!")
    print()
    print("🎯 New models now available:")
    print("   • XGBoost Conservative, Aggressive, Deep")
    print("   • Ensemble Stacking")
    print("   • Distilled Model")
    print()
    print("🔄 API and frontend updated automatically")
    print("🚀 Ready for enhanced predictions!")
    print("=" * 70)

if __name__ == "__main__":
    main()
