"""
Improved Stacking Ensemble with Proper Cross-Validation
Uses out-of-fold predictions to prevent overfitting
"""

import json
import os
import pickle

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import AdaBoostRegressor, ExtraTreesRegressor, GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Lasso, Ridge
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeRegressor

print("=" * 80)
print("IMPROVED STACKING ENSEMBLE")
print("=" * 80)

# Load dataset
df = pd.read_csv('data/Mobiles_Dataset_Feature_Engineered.csv')
print(f"\nDataset: {len(df)} samples")

# Features
feature_cols = [
    'RAM', 'Battery Capacity', 'Screen Size', 'Mobile Weight', 'Launched Year',
    'spec_density', 'temporal_decay', 'battery_weight_ratio', 
    'screen_weight_ratio', 'ram_weight_ratio', 'ram_battery_interaction_v2',
    'price_percentile_global', 'ram_percentile_global', 'battery_percentile_global'
]

available_features = [f for f in feature_cols if f in df.columns]
print(f"Features: {len(available_features)}")

# Prepare data
X = df[available_features].apply(pd.to_numeric, errors='coerce').fillna(0)
y = pd.to_numeric(df['Launched Price (USA)'], errors='coerce')

# Remove invalid rows
mask = X.notna().all(axis=1) & y.notna() & (y > 0)
X = X[mask]
y = y[mask]

print(f"Valid samples: {len(X)}")
print(f"Price range: ${y.min():.2f} - ${y.max():.2f}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\n[1/3] Training base learners with cross-validation...")

# Base models with robust parameters (reduced complexity to prevent overfitting)
base_models = {
    'gradient_boosting': GradientBoostingRegressor(
        n_estimators=50, learning_rate=0.1, max_depth=4, 
        min_samples_split=20, min_samples_leaf=10, subsample=0.8,
        random_state=42
    ),
    'xgboost': xgb.XGBRegressor(
        n_estimators=50, learning_rate=0.1, max_depth=4,
        min_child_weight=10, subsample=0.8, colsample_bytree=0.8,
        random_state=42, verbosity=0
    ),
    'random_forest': RandomForestRegressor(
        n_estimators=50, max_depth=8, min_samples_split=20,
        min_samples_leaf=10, max_features='sqrt',
        random_state=42, n_jobs=-1
    ),
    'extra_trees': ExtraTreesRegressor(
        n_estimators=50, max_depth=8, min_samples_split=20,
        min_samples_leaf=10, max_features='sqrt',
        random_state=42, n_jobs=-1
    ),
    'ridge': Ridge(alpha=100.0, random_state=42)
}

# Generate out-of-fold predictions for training
cv = KFold(n_splits=5, shuffle=True, random_state=42)
train_meta_features = np.zeros((len(X_train), len(base_models)))
test_meta_features = np.zeros((len(X_test), len(base_models)))

base_cv_scores = {}
trained_models = {}

for idx, (name, model) in enumerate(base_models.items()):
    print(f"  Training {name}...")
    
    # Cross-validated predictions on training set
    train_preds = cross_val_predict(
        model, X_train_scaled, y_train, 
        cv=cv, n_jobs=-1
    )
    train_meta_features[:, idx] = train_preds
    
    # Train on full training set for test predictions
    model.fit(X_train_scaled, y_train)
    test_preds = model.predict(X_test_scaled)
    test_meta_features[:, idx] = test_preds
    
    # Store model and scores
    trained_models[name] = model
    cv_rmse = np.sqrt(mean_squared_error(y_train, train_preds))
    test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
    
    base_cv_scores[name] = {
        'cv_rmse': float(cv_rmse),
        'test_rmse': float(test_rmse),
        'r2': float(r2_score(y_test, test_preds))
    }
    
    print(f"    CV RMSE: ${cv_rmse:.2f}, Test RMSE: ${test_rmse:.2f}")

print("\n[2/3] Training meta-learner...")

# Train meta-learner on out-of-fold predictions
meta_learner = Ridge(alpha=1.0, random_state=42)
meta_learner.fit(train_meta_features, y_train)

# Final predictions
ensemble_train_pred = meta_learner.predict(train_meta_features)
ensemble_test_pred = meta_learner.predict(test_meta_features)

# Metrics
ensemble_train_rmse = np.sqrt(mean_squared_error(y_train, ensemble_train_pred))
ensemble_test_rmse = np.sqrt(mean_squared_error(y_test, ensemble_test_pred))
ensemble_r2 = r2_score(y_test, ensemble_test_pred)

print(f"\nEnsemble performance:")
print(f"  Train RMSE: ${ensemble_train_rmse:.2f}")
print(f"  Test RMSE:  ${ensemble_test_rmse:.2f}")
print(f"  R²:         {ensemble_r2:.4f}")

print("\n[3/3] Comparing with best base model...")

# Find best base model
best_base_name = min(base_cv_scores.items(), key=lambda x: x[1]['test_rmse'])[0]
best_base_rmse = base_cv_scores[best_base_name]['test_rmse']

improvement = (best_base_rmse - ensemble_test_rmse) / best_base_rmse * 100

print(f"\nBest base learner: {best_base_name}")
print(f"  Test RMSE: ${best_base_rmse:.2f}")
print(f"\nEnsemble:")
print(f"  Test RMSE: ${ensemble_test_rmse:.2f}")
print(f"  Improvement: {improvement:+.2f}%")

if improvement > 0:
    print(f"\n✓ IMPROVEMENT: Ensemble outperforms best base by {improvement:.2f}%")
else:
    print(f"\n✗ NO IMPROVEMENT: Ensemble underperforms by {abs(improvement):.2f}%")

# Save models
os.makedirs('python_api/trained_models', exist_ok=True)

ensemble_pkg = {
    'base_models': trained_models,
    'meta_learner': meta_learner,
    'scaler': scaler,
    'feature_names': available_features
}

model_path = 'python_api/trained_models/ensemble_stacking_model.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(ensemble_pkg, f)
print(f"\n✓ Ensemble saved: {model_path}")

# Save metrics
metrics = {
    'ensemble': {
        'train_rmse': float(ensemble_train_rmse),
        'test_rmse': float(ensemble_test_rmse),
        'r2': float(ensemble_r2)
    },
    'base_models': base_cv_scores,
    'best_base_model': best_base_name,
    'improvement_pct': float(improvement),
    'meta_learner_weights': dict(zip(
        base_models.keys(),
        meta_learner.coef_.tolist()
    ))
}

metrics_path = 'data/ensemble_stacking_metrics.json'
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)
print(f"✓ Metrics saved: {metrics_path}")

print("\n" + "=" * 80)
print("STACKING ENSEMBLE COMPLETE")
print("=" * 80)
