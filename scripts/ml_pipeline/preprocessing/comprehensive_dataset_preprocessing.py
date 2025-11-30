"""
Comprehensive Dataset Preprocessing Pipeline
Handles: EUR conversion, outlier removal, data cleaning, feature engineering
"""

import json
from datetime import datetime

import numpy as np
import pandas as pd


class DatasetPreprocessor:
    def __init__(self, csv_path='data/Mobiles Dataset (2025).csv'):
        self.csv_path = csv_path
        self.df = None
        self.preprocessing_report = {
            'timestamp': datetime.now().isoformat(),
            'original_shape': None,
            'cleaned_shape': None,
            'issues_fixed': [],
            'features_added': [],
            'outliers_removed': {}
        }

    def load_dataset(self):
        """Load dataset with proper encoding handling"""
        print("Loading dataset...")
        try:
            self.df = pd.read_csv(self.csv_path, encoding='utf-8')
        except UnicodeDecodeError:
            self.df = pd.read_csv(self.csv_path, encoding='latin-1')

        self.preprocessing_report['original_shape'] = self.df.shape
        print(f"Loaded {self.df.shape[0]} rows, {self.df.shape[1]} columns")
        return self

    def clean_screen_size(self):
        """Remove 'inches' from screen size and convert to float"""
        if 'Screen Size' in self.df.columns:
            print("Cleaning screen size...")
            self.df['Screen Size'] = self.df['Screen Size'].astype(str).str.replace(' inches', '').str.replace('"', '')
            self.df['Screen Size'] = pd.to_numeric(self.df['Screen Size'], errors='coerce')
            self.preprocessing_report['issues_fixed'].append('Cleaned screen size format')

    def fix_outliers(self):
        """Fix data entry outliers"""
        print("Fixing outliers...")

        # RAM outliers: max should be ≤24GB
        if 'RAM' in self.df.columns:
            ram_before = len(self.df[self.df['RAM'] > 24])
            self.df.loc[self.df['RAM'] > 24, 'RAM'] = np.nan
            self.preprocessing_report['outliers_removed']['RAM'] = f"Removed {ram_before} values > 24GB"
            print(f"  Fixed {ram_before} RAM outliers (>24GB)")

        # Camera outliers: max reasonable value ~200MP
        for col in ['Front Camera', 'Back Camera']:
            if col in self.df.columns:
                cam_before = len(self.df[self.df[col] > 200])
                self.df.loc[self.df[col] > 200, col] = np.nan
                self.preprocessing_report['outliers_removed'][col] = f"Removed {cam_before} values > 200MP"
                print(f"  Fixed {cam_before} {col} outliers (>200MP)")

        # Price outliers: remove extreme values (>$20000)
        if 'Price' in self.df.columns:
            price_before = len(self.df[self.df['Price'] > 20000])
            self.df.loc[self.df['Price'] > 20000, 'Price'] = np.nan
            self.preprocessing_report['outliers_removed']['Price'] = f"Removed {price_before} values > $20000"
            print(f"  Fixed {price_before} price outliers (>$20000)")

    def add_eur_prices(self, usd_to_eur_rate=0.92):
        """Add EUR price column"""
        print(f"Adding EUR prices (rate: {usd_to_eur_rate})...")
        if 'Price' in self.df.columns:
            self.df['Price_EUR'] = self.df['Price'] * usd_to_eur_rate
            self.preprocessing_report['features_added'].append(f'Price_EUR (rate: {usd_to_eur_rate})')

    def engineer_features(self):
        """Add engineered features"""
        print("Engineering features...")

        # Value ratios
        if 'Price' in self.df.columns:
            if 'RAM' in self.df.columns:
                self.df['ram_to_price'] = self.df['RAM'] / (self.df['Price'] + 1)
                self.preprocessing_report['features_added'].append('ram_to_price')

            if 'Battery' in self.df.columns:
                self.df['battery_to_price'] = self.df['Battery'] / (self.df['Price'] + 1)
                self.preprocessing_report['features_added'].append('battery_to_price')

            if 'Screen Size' in self.df.columns:
                self.df['screen_to_price'] = self.df['Screen Size'] / (self.df['Price'] + 1)
                self.preprocessing_report['features_added'].append('screen_to_price')

        # Interaction features
        if 'RAM' in self.df.columns and 'Battery' in self.df.columns:
            self.df['ram_battery_interaction'] = self.df['RAM'] * self.df['Battery']
            self.preprocessing_report['features_added'].append('ram_battery_interaction')

        if 'Screen Size' in self.df.columns and 'Weight' in self.df.columns:
            self.df['screen_weight_ratio'] = self.df['Screen Size'] / (self.df['Weight'] + 1)
            self.preprocessing_report['features_added'].append('screen_weight_ratio')

        # Brand segment (based on average price)
        if 'Company' in self.df.columns and 'Price' in self.df.columns:
            brand_avg_price = self.df.groupby('Company')['Price'].mean()

            def get_brand_segment(company):
                avg = brand_avg_price.get(company, 0)
                if avg > 800:
                    return 'premium'
                elif avg > 400:
                    return 'mid'
                else:
                    return 'budget'

            self.df['brand_segment'] = self.df['Company'].apply(get_brand_segment)
            self.preprocessing_report['features_added'].append('brand_segment')

        # Temporal features
        if 'Year' in self.df.columns:
            current_year = 2025
            self.df['months_since_launch'] = (current_year - self.df['Year']) * 12
            self.df['technology_generation'] = pd.cut(self.df['Year'],
                                                      bins=[0, 2018, 2021, 2025],
                                                      labels=['old', 'mid', 'latest'])
            self.preprocessing_report['features_added'].extend(['months_since_launch', 'technology_generation'])

    def save_preprocessed_data(self):
        """Save preprocessed dataset"""
        print("Saving preprocessed dataset...")

        # Remove rows with too many missing values
        self.df = self.df.dropna(thresh=len(self.df.columns) * 0.5)

        self.preprocessing_report['cleaned_shape'] = self.df.shape

        # Save CSV
        output_path = 'data/Mobiles_Dataset_Preprocessed.csv'
        self.df.to_csv(output_path, index=False, encoding='utf-8')
        print(f"Saved to {output_path}")

        # Save report
        report_path = 'data/preprocessing_report.json'
        with open(report_path, 'w') as f:
            json.dump(self.preprocessing_report, f, indent=2)
        print(f"Report saved to {report_path}")

        return self

    def generate_summary(self):
        """Generate preprocessing summary"""
        print("\n" + "="*60)
        print("PREPROCESSING SUMMARY")
        print("="*60)
        print(f"Original shape: {self.preprocessing_report['original_shape']}")
        print(f"Cleaned shape: {self.preprocessing_report['cleaned_shape']}")
        print(f"\nIssues fixed: {len(self.preprocessing_report['issues_fixed'])}")
        for issue in self.preprocessing_report['issues_fixed']:
            print(f"  - {issue}")

        print("\nOutliers removed:")
        for col, info in self.preprocessing_report['outliers_removed'].items():
            print(f"  - {col}: {info}")

        print(f"\nFeatures added: {len(self.preprocessing_report['features_added'])}")
        for feat in self.preprocessing_report['features_added']:
            print(f"  - {feat}")

        print("="*60)

        return self

def main():
    """Run complete preprocessing pipeline"""
    preprocessor = DatasetPreprocessor()

    (preprocessor
     .load_dataset()
     .clean_screen_size()
     .fix_outliers()
     .add_eur_prices()
     .engineer_features()
     .save_preprocessed_data()
     .generate_summary())

    print("\n✓ Preprocessing complete!")
    print("Next steps:")
    print("  1. Run dataset_exploration.py for EDA")
    print("  2. Run european_market_analysis.py for market insights")
    print("  3. Run price_prediction_models.py for ML training")

if __name__ == '__main__':
    main()
