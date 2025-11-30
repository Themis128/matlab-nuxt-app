"""
Price Prediction Models
Multiple ML models for predicting mobile phone prices in EUR and USD
"""

import json
import pickle
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Lasso, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


class PricePredictionModels:
    def __init__(self, data_path='data/Mobiles_Dataset_Final.csv'):
        """Initialize Price Prediction Models"""
        self.data_path = data_path
        self.df = None
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.results = {}

    def load_and_prepare_data(self):
        """Load and prepare data for modeling"""
        print("="*80)
        print("LOADING AND PREPARING DATA")
        print("="*80)

        self.df = pd.read_csv(self.data_path)
        print(f"✓ Loaded {len(self.df)} phones")

        # Fill missing values
        numeric_cols = ['storage', 'ram', 'battery', 'screen', 'weight', 'front_camera', 'back_camera']
        for col in numeric_cols:
            if col in self.df.columns:
                self.df[col] = self.df[col].fillna(self.df[col].median())

        print("✓ Filled missing values")

        # Feature engineering
        self.df['phone_age'] = 2025 - self.df['year']
        self.df['ram_battery_ratio'] = self.df['ram'] / (self.df['battery'] / 1000)
        self.df['screen_weight_ratio'] = self.df['screen'] / (self.df['weight'] / 100)
        self.df['total_camera'] = self.df['front_camera'] + self.df['back_camera']

        print("✓ Created derived features")

        return self

    def prepare_features(self, target='price_eur'):
        """Prepare features for modeling"""
        print(f"\nPreparing features for {target} prediction...")

        # Select numeric features
        numeric_features = [
            'storage', 'ram', 'battery', 'screen', 'weight',
            'front_camera', 'back_camera', 'phone_age',
            'ram_battery_ratio', 'screen_weight_ratio', 'total_camera'
        ]

        # Encode categorical features
        categorical_features = ['company']

        X = self.df[numeric_features].copy()

        # Encode company
        if 'company' not in self.encoders:
            self.encoders['company'] = LabelEncoder()
            self.encoders['company'].fit(self.df['company'])

        X['company_encoded'] = self.encoders['company'].transform(self.df['company'])

        # Get target variable
        y = self.df[target].copy()

        # Remove rows with missing target
        mask = y.notna()
        X = X[mask]
        y = y[mask]

        print(f"✓ Features shape: {X.shape}")
        print(f"✓ Target ({target}) shape: {y.shape}")

        return X, y

    def train_price_models(self, target='price_eur'):
        """Train multiple models for price prediction"""
        print("\n" + "="*80)
        print(f"TRAINING MODELS FOR {target.upper()} PREDICTION")
        print("="*80)

        X, y = self.prepare_features(target)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Scale features
        scaler_key = f'{target}_scaler'
        self.scalers[scaler_key] = StandardScaler()
        X_train_scaled = self.scalers[scaler_key].fit_transform(X_train)
        X_test_scaled = self.scalers[scaler_key].transform(X_test)

        print(f"\nTraining set: {len(X_train)} phones")
        print(f"Test set: {len(X_test)} phones")

        # Define models
        models_to_train = {
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, max_depth=15, n_jobs=-1),
            'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5),
            'Ridge Regression': Ridge(alpha=1.0),
            'Lasso Regression': Lasso(alpha=1.0)
        }

        results = {}

        for model_name, model in models_to_train.items():
            print(f"\nTraining {model_name}...")

            # Train
            if 'Regression' in model_name:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

            # Evaluate
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

            results[model_name] = {
                'mae': float(mae),
                'rmse': float(rmse),
                'r2': float(r2),
                'mape': float(mape)
            }

            print(f"  MAE: €{mae:.2f}" if target == 'price_eur' else f"  MAE: ${mae:.2f}")
            print(f"  RMSE: €{rmse:.2f}" if target == 'price_eur' else f"  RMSE: ${rmse:.2f}")
            print(f"  R² Score: {r2:.4f}")
            print(f"  MAPE: {mape:.2f}%")

            # Save best model (Random Forest)
            if model_name == 'Random Forest':
                model_key = f'{target}_model'
                self.models[model_key] = model

                # Feature importance
                if hasattr(model, 'feature_importances_'):
                    feature_importance = pd.DataFrame({
                        'feature': X.columns,
                        'importance': model.feature_importances_
                    }).sort_values('importance', ascending=False)

                    print("\n  Top 5 Important Features:")
                    for _, row in feature_importance.head().iterrows():
                        print(f"    {row['feature']}: {row['importance']:.4f}")

                    results[model_name]['feature_importance'] = feature_importance.to_dict('records')

        self.results[target] = results

        # Cross-validation on best model
        print("\nPerforming 5-fold cross-validation on Random Forest...")
        cv_scores = cross_val_score(
            models_to_train['Random Forest'],
            X, y,
            cv=5,
            scoring='r2'
        )
        print(f"  CV R² Scores: {cv_scores}")
        print(f"  Mean CV R²: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

        return self

    def train_all_currencies(self):
        """Train models for all currency predictions"""
        currencies = {
            'price_eur': 'EUR',
            'price_usd': 'USD',
            'price_inr': 'INR'
        }

        for currency_col, currency_name in currencies.items():
            if currency_col in self.df.columns:
                self.train_price_models(currency_col)

        return self

    def predict_price(self, phone_specs, currency='eur'):
        """Predict price for a phone with given specs"""
        currency_col = f'price_{currency}'
        model_key = f'{currency_col}_model'
        scaler_key = f'{currency_col}_scaler'

        if model_key not in self.models:
            raise ValueError(f"Model for {currency.upper()} not trained")

        # Prepare input
        input_df = pd.DataFrame([phone_specs])

        # Add derived features
        input_df['phone_age'] = 2025 - input_df['year']
        input_df['ram_battery_ratio'] = input_df['ram'] / (input_df['battery'] / 1000)
        input_df['screen_weight_ratio'] = input_df['screen'] / (input_df['weight'] / 100)
        input_df['total_camera'] = input_df['front_camera'] + input_df['back_camera']

        # Encode company
        input_df['company_encoded'] = self.encoders['company'].transform(input_df['company'])

        # Select features
        feature_cols = [
            'storage', 'ram', 'battery', 'screen', 'weight',
            'front_camera', 'back_camera', 'phone_age',
            'ram_battery_ratio', 'screen_weight_ratio', 'total_camera',
            'company_encoded'
        ]

        X_input = input_df[feature_cols]

        # Predict
        prediction = self.models[model_key].predict(X_input)[0]

        return prediction

    def generate_prediction_plots(self):
        """Generate prediction accuracy plots"""
        print("\n" + "="*80)
        print("GENERATING PREDICTION VISUALIZATIONS")
        print("="*80)

        fig, axes = plt.subplots(1, 2, figsize=(16, 6))

        for idx, (currency, ax) in enumerate(zip(['price_eur', 'price_usd'], axes)):
            if currency in self.models:
                model_key = f'{currency}_model'

                # Prepare test data
                X, y = self.prepare_features(currency)
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )

                # Predictions
                y_pred = self.models[model_key].predict(X_test)

                # Scatter plot
                ax.scatter(y_test, y_pred, alpha=0.5, s=30)
                ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()],
                       'r--', lw=2, label='Perfect Prediction')
                ax.set_xlabel(f'Actual {currency.upper().replace("PRICE_", "")} Price')
                ax.set_ylabel(f'Predicted {currency.upper().replace("PRICE_", "")} Price')
                ax.set_title(f'{currency.upper().replace("PRICE_", "")} Price Prediction Accuracy\nR² = {self.results[currency]["Random Forest"]["r2"]:.4f}')
                ax.legend()
                ax.grid(True, alpha=0.3)

        plt.tight_layout()
        output_path = 'data/price_prediction_accuracy.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✓ Saved visualization to: {output_path}")
        plt.close()

        return self

    def save_models(self):
        """Save trained models and results"""
        print("\n" + "="*80)
        print("SAVING MODELS AND RESULTS")
        print("="*80)

        # Save models
        for model_name, model in self.models.items():
            model_path = f'python_api/trained_models/{model_name}.pkl'
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            print(f"✓ Saved model: {model_path}")

        # Save scalers
        for scaler_name, scaler in self.scalers.items():
            scaler_path = f'python_api/trained_models/{scaler_name}.pkl'
            with open(scaler_path, 'wb') as f:
                pickle.dump(scaler, f)
            print(f"✓ Saved scaler: {scaler_path}")

        # Save encoders
        for encoder_name, encoder in self.encoders.items():
            encoder_path = f'python_api/trained_models/{encoder_name}_encoder.pkl'
            with open(encoder_path, 'wb') as f:
                pickle.dump(encoder, f)
            print(f"✓ Saved encoder: {encoder_path}")

        # Save results
        output = {
            'timestamp': datetime.now().isoformat(),
            'models_trained': list(self.models.keys()),
            'results': self.results
        }

        results_path = 'data/price_prediction_results.json'
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, default=str)
        print(f"✓ Saved results: {results_path}")

        return self

    def run_full_training(self):
        """Run complete price prediction training"""
        print("="*80)
        print("PRICE PREDICTION MODELS TRAINING")
        print("="*80)

        self.load_and_prepare_data()
        self.train_all_currencies()
        self.generate_prediction_plots()
        self.save_models()

        # Print summary
        print("\n" + "="*80)
        print("✅ TRAINING COMPLETE!")
        print("="*80)

        print("\nModel Performance Summary:")
        for currency, models in self.results.items():
            print(f"\n{currency.upper()}:")
            best_model = max(models.items(), key=lambda x: x[1]['r2'])
            print(f"  Best Model: {best_model[0]}")
            print(f"  R² Score: {best_model[1]['r2']:.4f}")
            print(f"  MAE: {best_model[1]['mae']:.2f}")
            print(f"  MAPE: {best_model[1]['mape']:.2f}%")

        return self

if __name__ == "__main__":
    trainer = PricePredictionModels()
    trainer.run_full_training()

    # Example prediction
    print("\n" + "="*80)
    print("EXAMPLE PREDICTION")
    print("="*80)

    example_phone = {
        'company': 'Samsung',
        'storage': 256,
        'ram': 8,
        'battery': 5000,
        'screen': 6.7,
        'weight': 195,
        'front_camera': 32,
        'back_camera': 108,
        'year': 2024
    }

    print("\nPhone Specifications:")
    for key, value in example_phone.items():
        print(f"  {key}: {value}")

    try:
        eur_price = trainer.predict_price(example_phone, 'eur')
        usd_price = trainer.predict_price(example_phone, 'usd')

        print("\nPredicted Prices:")
        print(f"  EUR: €{eur_price:.2f}")
        print(f"  USD: ${usd_price:.2f}")
    except Exception as e:
        print(f"\nPrediction error: {e}")
