"""
European Market Analysis Model
Analyzes pricing trends, market segments, and brand positioning in EUR prices
"""

import json
from datetime import datetime

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


class EuropeanMarketAnalyzer:
    def __init__(self, data_path='data/Mobiles_Dataset_Final.csv'):
        """Initialize the European Market Analyzer"""
        self.data_path = data_path
        self.df = None
        self.results = {}

    def load_data(self):
        """Load and prepare data"""
        print("Loading dataset...")
        self.df = pd.read_csv(self.data_path)
        print(f"✓ Loaded {len(self.df)} phones")

        # Filter for phones with EUR prices
        self.df = self.df[self.df['price_eur'].notna()].copy()
        print(f"✓ {len(self.df)} phones with EUR prices")

        return self

    def analyze_price_segments(self):
        """Analyze EUR price segments"""
        print("\n" + "="*80)
        print("PRICE SEGMENTATION ANALYSIS")
        print("="*80)

        # Define price segments
        self.df['price_segment'] = pd.cut(
            self.df['price_eur'],
            bins=[0, 200, 500, 1000, float('inf')],
            labels=['Budget (€0-200)', 'Mid-Range (€200-500)', 'Premium (€500-1000)', 'Ultra-Premium (€1000+)']
        )

        # Count phones in each segment
        segment_counts = self.df['price_segment'].value_counts().sort_index()
        segment_percentages = (segment_counts / len(self.df) * 100).round(1)

        print("\nMarket Share by Price Segment:")
        for segment, count in segment_counts.items():
            pct = segment_percentages[segment]
            print(f"  {segment}: {count} phones ({pct}%)")

        # Average specs per segment
        print("\nAverage Specifications per Segment:")
        segment_specs = self.df.groupby('price_segment').agg({
            'ram': 'mean',
            'battery': 'mean',
            'screen': 'mean',
            'back_camera': 'mean',
            'price_eur': 'mean'
        }).round(2)

        for segment in segment_specs.index:
            print(f"\n{segment}:")
            print(f"  Average Price: €{segment_specs.loc[segment, 'price_eur']:.2f}")
            print(f"  RAM: {segment_specs.loc[segment, 'ram']:.1f} GB")
            print(f"  Battery: {segment_specs.loc[segment, 'battery']:.0f} mAh")
            print(f"  Screen: {segment_specs.loc[segment, 'screen']:.2f} inches")
            print(f"  Camera: {segment_specs.loc[segment, 'back_camera']:.1f} MP")

        self.results['price_segments'] = {
            'counts': segment_counts.to_dict(),
            'percentages': segment_percentages.to_dict(),
            'avg_specs': segment_specs.to_dict()
        }

        return self

    def analyze_brand_positioning(self):
        """Analyze brand positioning in EUR market"""
        print("\n" + "="*80)
        print("BRAND POSITIONING ANALYSIS")
        print("="*80)

        brand_stats = self.df.groupby('company').agg({
            'price_eur': ['mean', 'median', 'min', 'max', 'count'],
            'ram': 'mean',
            'battery': 'mean'
        }).round(2)

        brand_stats.columns = ['avg_price', 'median_price', 'min_price', 'max_price', 'phone_count', 'avg_ram', 'avg_battery']
        brand_stats = brand_stats.sort_values('median_price', ascending=False)

        print("\nTop 10 Brands by Median EUR Price:")
        for idx, (brand, row) in enumerate(brand_stats.head(10).iterrows(), 1):
            print(f"{idx}. {brand}:")
            print(f"   Median: €{row['median_price']:.2f} | Range: €{row['min_price']:.0f}-€{row['max_price']:.0f}")
            print(f"   Phones: {int(row['phone_count'])} | RAM: {row['avg_ram']:.1f}GB | Battery: {row['avg_battery']:.0f}mAh")

        # Brand segments
        brand_stats['brand_tier'] = pd.cut(
            brand_stats['median_price'],
            bins=[0, 300, 600, float('inf')],
            labels=['Budget', 'Mid-Range', 'Premium']
        )

        print("\nBrands by Tier:")
        for tier in ['Premium', 'Mid-Range', 'Budget']:
            brands = brand_stats[brand_stats['brand_tier'] == tier].index.tolist()
            if brands:
                print(f"  {tier}: {', '.join(brands)}")

        self.results['brand_positioning'] = brand_stats.to_dict()

        return self

    def analyze_value_for_money(self):
        """Analyze value for money in EUR market"""
        print("\n" + "="*80)
        print("VALUE FOR MONEY ANALYSIS")
        print("="*80)

        # Calculate value score (specs per EUR)
        self.df['value_score'] = (
            (self.df['ram'] / self.df['ram'].max()) * 30 +
            (self.df['battery'] / self.df['battery'].max()) * 30 +
            (self.df['back_camera'] / self.df['back_camera'].max()) * 20 +
            (self.df['screen'] / self.df['screen'].max()) * 20
        ) / (self.df['price_eur'] / self.df['price_eur'].median())

        # Top value phones
        top_value = self.df.nlargest(10, 'value_score')[
            ['company', 'model', 'price_eur', 'ram', 'battery', 'back_camera', 'value_score']
        ]

        print("\nTop 10 Best Value Phones (EUR Market):")
        for idx, (_, phone) in enumerate(top_value.iterrows(), 1):
            print(f"{idx}. {phone['company']} {phone['model']}")
            print(f"   Price: €{phone['price_eur']:.2f} | RAM: {phone['ram']:.0f}GB | Battery: {phone['battery']:.0f}mAh")
            print(f"   Camera: {phone['back_camera']:.0f}MP | Value Score: {phone['value_score']:.2f}")

        self.results['best_value_phones'] = top_value.to_dict('records')

        return self

    def analyze_market_trends(self):
        """Analyze EUR market trends over time"""
        print("\n" + "="*80)
        print("MARKET TRENDS ANALYSIS (2014-2025)")
        print("="*80)

        yearly_trends = self.df.groupby('year').agg({
            'price_eur': ['mean', 'median', 'count'],
            'ram': 'mean',
            'battery': 'mean',
            'back_camera': 'mean'
        }).round(2)

        print("\nAverage EUR Price by Year:")
        for year in sorted(self.df['year'].unique()):
            if year in yearly_trends.index:
                avg_price = yearly_trends.loc[year, ('price_eur', 'mean')]
                count = int(yearly_trends.loc[year, ('price_eur', 'count')])
                print(f"  {year}: €{avg_price:.2f} (n={count})")

        # Price trend
        recent_years = yearly_trends.loc[yearly_trends.index >= 2020]
        if len(recent_years) > 1:
            price_change = recent_years[('price_eur', 'mean')].iloc[-1] - recent_years[('price_eur', 'mean')].iloc[0]
            pct_change = (price_change / recent_years[('price_eur', 'mean')].iloc[0]) * 100
            print(f"\nPrice Trend (2020-2025): {'+' if price_change > 0 else ''}{price_change:.2f} EUR ({pct_change:+.1f}%)")

        self.results['market_trends'] = {
            str(k): v for k, v in yearly_trends.to_dict().items()
        }

        return self

    def perform_clustering(self):
        """Perform K-Means clustering to identify market segments"""
        print("\n" + "="*80)
        print("MARKET SEGMENTATION (K-Means Clustering)")
        print("="*80)

        # Prepare features for clustering
        features = ['price_eur', 'ram', 'battery', 'screen', 'back_camera']
        X = self.df[features].fillna(self.df[features].median())

        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Perform clustering
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.df['market_cluster'] = kmeans.fit_predict(X_scaled)

        # Analyze clusters
        cluster_names = {
            0: 'Entry-Level',
            1: 'Value Segment',
            2: 'Mid-Premium',
            3: 'Flagship'
        }

        # Sort clusters by average price
        cluster_prices = self.df.groupby('market_cluster')['price_eur'].mean().sort_values()
        cluster_mapping = {old_id: idx for idx, old_id in enumerate(cluster_prices.index)}
        self.df['market_cluster'] = self.df['market_cluster'].map(cluster_mapping)

        print("\nIdentified Market Segments:")
        for cluster_id in sorted(self.df['market_cluster'].unique()):
            cluster_data = self.df[self.df['market_cluster'] == cluster_id]
            cluster_name = list(cluster_names.values())[cluster_id]

            print(f"\n{cluster_name} (n={len(cluster_data)}):")
            print(f"  Price Range: €{cluster_data['price_eur'].min():.0f} - €{cluster_data['price_eur'].max():.0f}")
            print(f"  Average Price: €{cluster_data['price_eur'].mean():.2f}")
            print(f"  Average RAM: {cluster_data['ram'].mean():.1f}GB")
            print(f"  Average Battery: {cluster_data['battery'].mean():.0f}mAh")
            print(f"  Top Brands: {', '.join(cluster_data['company'].value_counts().head(3).index.tolist())}")

        return self

    def generate_visualizations(self):
        """Generate market analysis visualizations"""
        print("\n" + "="*80)
        print("GENERATING VISUALIZATIONS")
        print("="*80)

        # Set style
        sns.set_style("whitegrid")
        plt.rcParams['figure.figsize'] = (15, 10)

        # Create subplots
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))

        # 1. Price Distribution
        axes[0, 0].hist(self.df['price_eur'], bins=30, color='skyblue', edgecolor='black')
        axes[0, 0].axvline(self.df['price_eur'].median(), color='red', linestyle='--', label=f'Median: €{self.df["price_eur"].median():.2f}')
        axes[0, 0].set_xlabel('Price (EUR)')
        axes[0, 0].set_ylabel('Number of Phones')
        axes[0, 0].set_title('EUR Price Distribution')
        axes[0, 0].legend()

        # 2. Price by Brand (top 10)
        top_brands = self.df.groupby('company')['price_eur'].median().nlargest(10)
        axes[0, 1].barh(range(len(top_brands)), top_brands.values, color='lightcoral')
        axes[0, 1].set_yticks(range(len(top_brands)))
        axes[0, 1].set_yticklabels(top_brands.index)
        axes[0, 1].set_xlabel('Median Price (EUR)')
        axes[0, 1].set_title('Top 10 Brands by Median EUR Price')
        axes[0, 1].invert_yaxis()

        # 3. Price Segments
        segment_counts = self.df['price_segment'].value_counts()
        axes[1, 0].pie(segment_counts.values, labels=segment_counts.index, autopct='%1.1f%%', startangle=90)
        axes[1, 0].set_title('Market Share by Price Segment')

        # 4. Price vs RAM (with segments)
        for segment in self.df['price_segment'].unique():
            if pd.notna(segment):
                segment_data = self.df[self.df['price_segment'] == segment]
                axes[1, 1].scatter(segment_data['ram'], segment_data['price_eur'], alpha=0.6, label=segment, s=50)
        axes[1, 1].set_xlabel('RAM (GB)')
        axes[1, 1].set_ylabel('Price (EUR)')
        axes[1, 1].set_title('Price vs RAM by Segment')
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)

        plt.tight_layout()

        # Save figure
        output_path = 'data/european_market_analysis.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✓ Saved visualization to: {output_path}")
        plt.close()

        return self

    def save_results(self):
        """Save analysis results to JSON"""
        print("\n" + "="*80)
        print("SAVING RESULTS")
        print("="*80)

        output = {
            'timestamp': datetime.now().isoformat(),
            'total_phones': len(self.df),
            'price_summary': {
                'min': float(self.df['price_eur'].min()),
                'max': float(self.df['price_eur'].max()),
                'mean': float(self.df['price_eur'].mean()),
                'median': float(self.df['price_eur'].median())
            },
            'analysis_results': self.results
        }

        output_path = 'data/european_market_analysis.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, default=str)

        print(f"✓ Saved analysis results to: {output_path}")

        return self

    def run_full_analysis(self):
        """Run complete European market analysis"""
        print("="*80)
        print("EUROPEAN MARKET ANALYSIS")
        print("="*80)

        self.load_data()
        self.analyze_price_segments()
        self.analyze_brand_positioning()
        self.analyze_value_for_money()
        self.analyze_market_trends()
        self.perform_clustering()
        self.generate_visualizations()
        self.save_results()

        print("\n" + "="*80)
        print("✅ ANALYSIS COMPLETE!")
        print("="*80)
        print("\nFiles generated:")
        print("  - data/european_market_analysis.json")
        print("  - data/european_market_analysis.png")

        return self

if __name__ == "__main__":
    analyzer = EuropeanMarketAnalyzer()
    analyzer.run_full_analysis()
