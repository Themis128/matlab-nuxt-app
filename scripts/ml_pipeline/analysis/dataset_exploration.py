"""
Dataset Exploration and Insights
Comprehensive exploratory data analysis and visualization
"""

import io
import sys

# Configure UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


class DatasetExplorer:
    def __init__(self, data_path='data/Mobiles_Dataset_Final.csv'):
        """Initialize Dataset Explorer"""
        self.data_path = data_path
        self.df = None
        self.insights = {}

    def load_data(self):
        """Load dataset"""
        print("="*80)
        print("LOADING DATASET")
        print("="*80)

        self.df = pd.read_csv(self.data_path)
        print(f"✓ Loaded {len(self.df)} phones")
        print(f"✓ Features: {len(self.df.columns)} columns")
        print(f"✓ Time range: {self.df['year'].min()}-{self.df['year'].max()}")

        return self

    def basic_statistics(self):
        """Calculate and display basic statistics"""
        print("\n" + "="*80)
        print("BASIC STATISTICS")
        print("="*80)

        # Numeric columns
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        print("\nNumeric Features Summary:")
        stats_df = self.df[numeric_cols].describe()
        print(stats_df.round(2))

        # Missing values
        print("\nMissing Values:")
        missing = self.df.isnull().sum()
        missing = missing[missing > 0].sort_values(ascending=False)
        if len(missing) > 0:
            for col, count in missing.items():
                pct = (count / len(self.df)) * 100
                print(f"  {col}: {count} ({pct:.1f}%)")
        else:
            print("  ✓ No missing values!")

        # Categorical features
        print("\nCategorical Features:")
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            unique_count = self.df[col].nunique()
            print(f"  {col}: {unique_count} unique values")
            if unique_count <= 10:
                top_values = self.df[col].value_counts().head(5)
                print(f"    Top: {', '.join([f'{val} ({count})' for val, count in top_values.items()])}")

        self.insights['basic_stats'] = stats_df.to_dict()

        return self

    def correlation_analysis(self):
        """Analyze correlations between features"""
        print("\n" + "="*80)
        print("CORRELATION ANALYSIS")
        print("="*80)

        # Select numeric columns
        numeric_cols = ['storage', 'ram', 'battery', 'screen', 'weight',
                       'front_camera', 'back_camera', 'price_eur', 'price_usd']
        numeric_cols = [col for col in numeric_cols if col in self.df.columns]

        corr_matrix = self.df[numeric_cols].corr()

        # Find strong correlations with price
        price_corr = corr_matrix['price_eur'].sort_values(ascending=False) if 'price_eur' in corr_matrix.columns else None

        if price_corr is not None:
            print("\nCorrelation with EUR Price:")
            for feature, corr_value in price_corr.items():
                if feature != 'price_eur':
                    print(f"  {feature}: {corr_value:.3f}")

        # Find strongest positive correlations (excluding self-correlations and price pairs)
        print("\nStrongest Feature Correlations:")
        corr_pairs = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if 'price' not in corr_matrix.columns[i] or 'price' not in corr_matrix.columns[j]:
                    corr_pairs.append((
                        corr_matrix.columns[i],
                        corr_matrix.columns[j],
                        corr_matrix.iloc[i, j]
                    ))

        corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
        for feat1, feat2, corr_val in corr_pairs[:5]:
            print(f"  {feat1} ↔ {feat2}: {corr_val:.3f}")

        self.insights['correlations'] = corr_matrix.to_dict()

        return self

    def price_analysis(self):
        """Analyze price distributions and relationships"""
        print("\n" + "="*80)
        print("PRICE ANALYSIS")
        print("="*80)

        for currency, col in [('EUR', 'price_eur'), ('USD', 'price_usd')]:
            if col in self.df.columns:
                prices = self.df[col].dropna()

                print(f"\n{currency} Prices:")
                print(f"  Mean: {currency_symbol(currency)}{prices.mean():.2f}")
                print(f"  Median: {currency_symbol(currency)}{prices.median():.2f}")
                print(f"  Std Dev: {currency_symbol(currency)}{prices.std():.2f}")
                print(f"  Range: {currency_symbol(currency)}{prices.min():.2f} - {currency_symbol(currency)}{prices.max():.2f}")

                # Quartiles
                q1, q2, q3 = prices.quantile([0.25, 0.5, 0.75])
                print(f"  Quartiles: Q1={currency_symbol(currency)}{q1:.2f}, Q2={currency_symbol(currency)}{q2:.2f}, Q3={currency_symbol(currency)}{q3:.2f}")

                # Price per GB RAM
                if 'ram' in self.df.columns:
                    price_per_gb = (self.df[col] / self.df['ram']).median()
                    print(f"  Median price per GB RAM: {currency_symbol(currency)}{price_per_gb:.2f}")

        return self

    def brand_analysis(self):
        """Analyze brands and their characteristics"""
        print("\n" + "="*80)
        print("BRAND ANALYSIS")
        print("="*80)

        brand_stats = self.df.groupby('company').agg({
            'price_eur': ['count', 'mean', 'median'],
            'ram': 'mean',
            'battery': 'mean',
            'back_camera': 'mean'
        }).round(2)

        brand_stats.columns = ['_'.join(col).strip() for col in brand_stats.columns.values]
        brand_stats = brand_stats.sort_values('price_eur_count', ascending=False)

        print("\nTop 10 Brands by Phone Count:")
        for idx, (brand, row) in enumerate(brand_stats.head(10).iterrows(), 1):
            print(f"{idx}. {brand}: {int(row['price_eur_count'])} phones")
            print(f"   Avg Price: €{row['price_eur_mean']:.2f} | Avg RAM: {row['ram_mean']:.1f}GB | Avg Battery: {row['battery_mean']:.0f}mAh")

        # Brand diversity
        print(f"\nTotal Brands: {self.df['company'].nunique()}")
        print(f"Market Concentration: Top 5 brands account for {(brand_stats.head(5)['price_eur_count'].sum() / len(self.df) * 100):.1f}% of phones")

        self.insights['brand_stats'] = brand_stats.to_dict()

        return self

    def temporal_trends(self):
        """Analyze trends over time"""
        print("\n" + "="*80)
        print("TEMPORAL TRENDS (2014-2025)")
        print("="*80)

        yearly_stats = self.df.groupby('year').agg({
            'price_eur': ['mean', 'median', 'count'],
            'ram': 'mean',
            'battery': 'mean',
            'screen': 'mean',
            'back_camera': 'mean'
        }).round(2)

        print("\nYearly Evolution:")
        print("Year | Count | Avg Price | Avg RAM | Avg Battery | Avg Screen | Avg Camera")
        print("-" * 80)
        for year in sorted(self.df['year'].unique()):
            if year in yearly_stats.index:
                stats = yearly_stats.loc[year]
                count = int(stats[('price_eur', 'count')])
                price = stats[('price_eur', 'mean')]
                ram = stats[('ram', 'mean')]
                battery = stats[('battery', 'mean')]
                screen = stats[('screen', 'mean')]
                camera = stats[('back_camera', 'mean')]

                print(f"{year} | {count:5d} | €{price:7.2f} | {ram:5.1f}GB | {battery:6.0f}mAh | {screen:5.2f}\" | {camera:5.1f}MP")

        # Calculate growth rates
        recent_years = yearly_stats.loc[yearly_stats.index >= 2020]
        if len(recent_years) >= 2:
            ram_growth = ((recent_years[('ram', 'mean')].iloc[-1] / recent_years[('ram', 'mean')].iloc[0]) - 1) * 100
            battery_growth = ((recent_years[('battery', 'mean')].iloc[-1] / recent_years[('battery', 'mean')].iloc[0]) - 1) * 100
            camera_growth = ((recent_years[('back_camera', 'mean')].iloc[-1] / recent_years[('back_camera', 'mean')].iloc[0]) - 1) * 100

            print("\nGrowth (2020-2025):")
            print(f"  RAM: {ram_growth:+.1f}%")
            print(f"  Battery: {battery_growth:+.1f}%")
            print(f"  Camera: {camera_growth:+.1f}%")

        self.insights['temporal_trends'] = yearly_stats.to_dict()

        return self

    def outlier_detection(self):
        """Detect and report outliers"""
        print("\n" + "="*80)
        print("OUTLIER DETECTION")
        print("="*80)

        numeric_cols = ['ram', 'battery', 'screen', 'weight', 'back_camera', 'price_eur']

        for col in numeric_cols:
            if col in self.df.columns:
                data = self.df[col].dropna()

                # IQR method
                Q1 = data.quantile(0.25)
                Q3 = data.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR

                outliers = data[(data < lower_bound) | (data > upper_bound)]

                if len(outliers) > 0:
                    print(f"\n{col}:")
                    print(f"  Normal range: {lower_bound:.2f} - {upper_bound:.2f}")
                    print(f"  Outliers: {len(outliers)} ({len(outliers)/len(data)*100:.1f}%)")
                    print(f"  Outlier range: {outliers.min():.2f} - {outliers.max():.2f}")

        return self

    def generate_comprehensive_visualizations(self):
        """Generate comprehensive visualization dashboard"""
        print("\n" + "="*80)
        print("GENERATING COMPREHENSIVE VISUALIZATIONS")
        print("="*80)

        # Set style
        sns.set_style("whitegrid")
        sns.set_palette("husl")

        # Create large dashboard
        fig = plt.figure(figsize=(20, 16))
        gs = fig.add_gridspec(4, 3, hspace=0.3, wspace=0.3)

        # 1. Price Distribution (EUR)
        ax1 = fig.add_subplot(gs[0, 0])
        self.df['price_eur'].hist(bins=40, ax=ax1, color='skyblue', edgecolor='black')
        ax1.axvline(self.df['price_eur'].median(), color='red', linestyle='--', linewidth=2)
        ax1.set_xlabel('Price (EUR)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('EUR Price Distribution')

        # 2. RAM Distribution
        ax2 = fig.add_subplot(gs[0, 1])
        ram_counts = self.df['ram'].value_counts().sort_index()
        ax2.bar(ram_counts.index, ram_counts.values, color='lightcoral', edgecolor='black')
        ax2.set_xlabel('RAM (GB)')
        ax2.set_ylabel('Number of Phones')
        ax2.set_title('RAM Distribution')

        # 3. Battery Distribution
        ax3 = fig.add_subplot(gs[0, 2])
        self.df['battery'].hist(bins=30, ax=ax3, color='lightgreen', edgecolor='black')
        ax3.set_xlabel('Battery (mAh)')
        ax3.set_ylabel('Frequency')
        ax3.set_title('Battery Capacity Distribution')

        # 4. Price vs RAM
        ax4 = fig.add_subplot(gs[1, 0])
        ax4.scatter(self.df['ram'], self.df['price_eur'], alpha=0.5, s=30)
        ax4.set_xlabel('RAM (GB)')
        ax4.set_ylabel('Price (EUR)')
        ax4.set_title('Price vs RAM')
        ax4.grid(True, alpha=0.3)

        # 5. Price vs Battery
        ax5 = fig.add_subplot(gs[1, 1])
        ax5.scatter(self.df['battery'], self.df['price_eur'], alpha=0.5, s=30, color='green')
        ax5.set_xlabel('Battery (mAh)')
        ax5.set_ylabel('Price (EUR)')
        ax5.set_title('Price vs Battery')
        ax5.grid(True, alpha=0.3)

        # 6. Price vs Screen Size
        ax6 = fig.add_subplot(gs[1, 2])
        ax6.scatter(self.df['screen'], self.df['price_eur'], alpha=0.5, s=30, color='purple')
        ax6.set_xlabel('Screen Size (inches)')
        ax6.set_ylabel('Price (EUR)')
        ax6.set_title('Price vs Screen Size')
        ax6.grid(True, alpha=0.3)

        # 7. Top Brands
        ax7 = fig.add_subplot(gs[2, 0])
        top_brands = self.df['company'].value_counts().head(10)
        ax7.barh(range(len(top_brands)), top_brands.values, color='orange')
        ax7.set_yticks(range(len(top_brands)))
        ax7.set_yticklabels(top_brands.index)
        ax7.set_xlabel('Number of Phones')
        ax7.set_title('Top 10 Brands by Phone Count')
        ax7.invert_yaxis()

        # 8. Yearly Trends
        ax8 = fig.add_subplot(gs[2, 1])
        yearly_prices = self.df.groupby('year')['price_eur'].mean()
        ax8.plot(yearly_prices.index, yearly_prices.values, marker='o', linewidth=2, markersize=8)
        ax8.set_xlabel('Year')
        ax8.set_ylabel('Average Price (EUR)')
        ax8.set_title('Average Price Trend Over Years')
        ax8.grid(True, alpha=0.3)

        # 9. Correlation Heatmap
        ax9 = fig.add_subplot(gs[2, 2])
        corr_cols = ['ram', 'battery', 'screen', 'back_camera', 'price_eur']
        corr_cols = [col for col in corr_cols if col in self.df.columns]
        corr_matrix = self.df[corr_cols].corr()
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', ax=ax9, square=True)
        ax9.set_title('Feature Correlation Matrix')

        # 10. Box plot - Price by Year (recent years)
        ax10 = fig.add_subplot(gs[3, 0])
        recent_data = self.df[self.df['year'] >= 2020]
        recent_data.boxplot(column='price_eur', by='year', ax=ax10)
        ax10.set_xlabel('Year')
        ax10.set_ylabel('Price (EUR)')
        ax10.set_title('Price Distribution by Year (2020-2025)')
        plt.sca(ax10)
        plt.xticks(rotation=45)

        # 11. Camera vs Price
        ax11 = fig.add_subplot(gs[3, 1])
        ax11.scatter(self.df['back_camera'], self.df['price_eur'], alpha=0.5, s=30, color='red')
        ax11.set_xlabel('Back Camera (MP)')
        ax11.set_ylabel('Price (EUR)')
        ax11.set_title('Price vs Camera Quality')
        ax11.grid(True, alpha=0.3)

        # 12. Screen vs Battery
        ax12 = fig.add_subplot(gs[3, 2])
        ax12.scatter(self.df['screen'], self.df['battery'], alpha=0.5, s=30, color='blue')
        ax12.set_xlabel('Screen Size (inches)')
        ax12.set_ylabel('Battery (mAh)')
        ax12.set_title('Screen Size vs Battery Capacity')
        ax12.grid(True, alpha=0.3)

        plt.suptitle('Comprehensive Dataset Exploration Dashboard', fontsize=16, y=0.995)

        # Save
        output_path = 'data/dataset_exploration_dashboard.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✓ Saved visualization dashboard to: {output_path}")
        plt.close()

        return self

    def save_insights(self):
        """Save all insights to JSON"""
        print("\n" + "="*80)
        print("SAVING INSIGHTS")
        print("="*80)

        output = {
            'timestamp': datetime.now().isoformat(),
            'dataset_info': {
                'total_phones': len(self.df),
                'features': list(self.df.columns),
                'companies': int(self.df['company'].nunique()),
                'year_range': f"{self.df['year'].min()}-{self.df['year'].max()}"
            },
            'insights': self.insights
        }

        output_path = 'data/dataset_exploration_insights.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, default=str)

        print(f"✓ Saved insights to: {output_path}")

        return self

    def run_full_exploration(self):
        """Run complete dataset exploration"""
        print("="*80)
        print("DATASET EXPLORATION AND ANALYSIS")
        print("="*80)

        self.load_data()
        self.basic_statistics()
        self.correlation_analysis()
        self.price_analysis()
        self.brand_analysis()
        self.temporal_trends()
        self.outlier_detection()
        self.generate_comprehensive_visualizations()
        self.save_insights()

        print("\n" + "="*80)
        print("✅ EXPLORATION COMPLETE!")
        print("="*80)
        print("\nFiles generated:")
        print("  - data/dataset_exploration_insights.json")
        print("  - data/dataset_exploration_dashboard.png")

        return self

def currency_symbol(currency):
    """Get currency symbol"""
    symbols = {
        'EUR': '€',
        'USD': '$',
        'INR': '₹',
        'CNY': '¥',
        'PKR': 'Rs',
        'AED': 'د.إ'
    }
    return symbols.get(currency, currency)

if __name__ == "__main__":
    explorer = DatasetExplorer()
    explorer.run_full_exploration()
