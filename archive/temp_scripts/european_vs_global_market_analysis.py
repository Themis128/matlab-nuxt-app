"""
European vs Global Mobile Market Analysis
==========================================
Comprehensive analysis comparing European market trends with global patterns:
- Price positioning and premium segments
- Brand market share and competitive dynamics
- Technology adoption rates
- Feature preferences and specifications
- Market growth trajectories
- Value proposition analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from scipy import stats
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (14, 8)

class MarketAnalyzer:
    def __init__(self, data_path='data/Mobiles_Dataset_Feature_Engineered.csv'):
        """Initialize market analyzer"""
        print("="*80)
        print("EUROPEAN VS GLOBAL MOBILE MARKET ANALYSIS")
        print("="*80)
        print("\nLoading dataset...")
        self.df = pd.read_csv(data_path)
        print(f"✓ Loaded {len(self.df)} phones from {self.df['Launched Year'].nunique()} years")
        print(f"✓ Brands: {self.df['Company Name'].nunique()}")

        # Ensure output directory
        Path('data/market_analysis').mkdir(parents=True, exist_ok=True)
        Path('data/market_analysis/plots').mkdir(exist_ok=True)

        self.results = {}

    def define_market_regions(self):
        """Define European vs Global market regions and calculate regional prices"""
        print("\n[1/10] Defining market regions...")

        # European countries (we have Dubai data as proxy for European pricing patterns)
        # USA, China, India represent global markets
        # Pakistan represents emerging markets

        self.df['price_usa'] = pd.to_numeric(self.df['Launched Price (USA)'], errors='coerce')
        self.df['price_china'] = pd.to_numeric(self.df['Launched Price (China)'], errors='coerce')
        self.df['price_india'] = pd.to_numeric(self.df['Launched Price (India)'], errors='coerce')
        self.df['price_dubai'] = pd.to_numeric(self.df['Launched Price (Dubai)'], errors='coerce')
        self.df['price_pakistan'] = pd.to_numeric(self.df['Launched Price (Pakistan)'], errors='coerce')

        # Calculate average global price (excluding Dubai as European proxy)
        self.df['price_global_avg'] = self.df[['price_usa', 'price_china', 'price_india']].mean(axis=1)

        # Use Dubai as European market proxy
        self.df['price_european'] = self.df['price_dubai']

        # Calculate price premium (European vs Global)
        self.df['european_price_premium_pct'] = (
            (self.df['price_european'] - self.df['price_global_avg']) /
            self.df['price_global_avg'] * 100
        )

        # Market segments based on price
        self.df['price_segment_global'] = pd.cut(
            self.df['price_global_avg'],
            bins=[0, 200, 400, 700, 1200, np.inf],
            labels=['Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra-Premium']
        )

        self.df['price_segment_europe'] = pd.cut(
            self.df['price_european'],
            bins=[0, 200, 400, 700, 1200, np.inf],
            labels=['Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra-Premium']
        )

        # Valid data mask
        self.valid_mask = (
            self.df['price_usa'].notna() &
            self.df['price_european'].notna() &
            (self.df['price_usa'] > 0) &
            (self.df['price_european'] > 0)
        )

        print(f"✓ Phones with both European & Global pricing: {self.valid_mask.sum()}")
        print(f"✓ Average European premium: {self.df.loc[self.valid_mask, 'european_price_premium_pct'].mean():.1f}%")

        self.results['market_definition'] = {
            'total_phones': len(self.df),
            'phones_with_dual_pricing': int(self.valid_mask.sum()),
            'avg_european_premium_pct': float(self.df.loc[self.valid_mask, 'european_price_premium_pct'].mean()),
            'european_avg_price': float(self.df.loc[self.valid_mask, 'price_european'].mean()),
            'global_avg_price': float(self.df.loc[self.valid_mask, 'price_global_avg'].mean())
        }

    def analyze_brand_positioning(self):
        """Analyze brand market positioning in Europe vs Global"""
        print("\n[2/10] Analyzing brand positioning...")

        df_valid = self.df[self.valid_mask].copy()

        brand_analysis = df_valid.groupby('Company Name').agg({
            'price_european': ['mean', 'std', 'count'],
            'price_global_avg': ['mean', 'std'],
            'european_price_premium_pct': 'mean',
            'RAM': 'mean',
            'Battery Capacity': 'mean',
            'Screen Size': 'mean'
        }).round(2)

        brand_analysis.columns = ['_'.join(col).strip() for col in brand_analysis.columns.values]
        brand_analysis = brand_analysis[brand_analysis['price_european_count'] >= 3]  # Min 3 models
        brand_analysis = brand_analysis.sort_values('price_european_mean', ascending=False)

        print(f"\n✓ Top 10 Brands by European Market Positioning:")
        print(brand_analysis.head(10)[['price_european_mean', 'price_global_avg_mean', 'european_price_premium_pct_mean']])

        # Market share by segment
        segment_share = df_valid.groupby(['price_segment_europe', 'Company Name']).size().unstack(fill_value=0)
        segment_share_pct = segment_share.div(segment_share.sum(axis=1), axis=0) * 100

        self.results['brand_positioning'] = {
            'brand_stats': brand_analysis.to_dict(),
            'top_premium_brands': brand_analysis.head(10).index.tolist(),
            'segment_share': segment_share_pct.to_dict()
        }

        # Plot: Brand positioning
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        top_brands = brand_analysis.head(15)
        x = np.arange(len(top_brands))
        width = 0.35

        ax1.barh(x, top_brands['price_european_mean'], width, label='European Market', alpha=0.8)
        ax1.barh(x + width, top_brands['price_global_avg_mean'], width, label='Global Market', alpha=0.8)
        ax1.set_yticks(x + width / 2)
        ax1.set_yticklabels(top_brands.index)
        ax1.set_xlabel('Average Price ($)')
        ax1.set_title('Brand Positioning: European vs Global Markets')
        ax1.legend()
        ax1.grid(axis='x', alpha=0.3)

        premium_brands = brand_analysis.nlargest(10, 'european_price_premium_pct_mean')
        ax2.barh(premium_brands.index, premium_brands['european_price_premium_pct_mean'], color='coral')
        ax2.set_xlabel('European Price Premium (%)')
        ax2.set_title('Top 10 Brands by European Premium Pricing')
        ax2.grid(axis='x', alpha=0.3)
        ax2.axvline(0, color='black', linewidth=0.8)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/brand_positioning.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: brand_positioning.png")

    def analyze_temporal_trends(self):
        """Analyze how markets evolved over time"""
        print("\n[3/10] Analyzing temporal market trends...")

        df_valid = self.df[self.valid_mask].copy()

        yearly_trends = df_valid.groupby('Launched Year').agg({
            'price_european': ['mean', 'median', 'std'],
            'price_global_avg': ['mean', 'median', 'std'],
            'european_price_premium_pct': 'mean',
            'RAM': 'mean',
            'Battery Capacity': 'mean',
            'Screen Size': 'mean',
            'Company Name': 'count'
        }).round(2)

        yearly_trends.columns = ['_'.join(col).strip() for col in yearly_trends.columns.values]

        print(f"\n✓ Yearly Market Evolution:")
        print(yearly_trends[['price_european_mean', 'price_global_avg_mean', 'european_price_premium_pct_mean', 'Company Name_count']])

        self.results['temporal_trends'] = yearly_trends.to_dict()

        # Plot: Temporal trends
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))

        years = yearly_trends.index

        # Price evolution
        ax1.plot(years, yearly_trends['price_european_mean'], marker='o', label='European Market', linewidth=2)
        ax1.plot(years, yearly_trends['price_global_avg_mean'], marker='s', label='Global Market', linewidth=2)
        ax1.fill_between(years, yearly_trends['price_european_mean'], yearly_trends['price_global_avg_mean'], alpha=0.2)
        ax1.set_xlabel('Year')
        ax1.set_ylabel('Average Price ($)')
        ax1.set_title('Price Evolution: European vs Global Markets')
        ax1.legend()
        ax1.grid(alpha=0.3)

        # Premium percentage trend
        ax2.plot(years, yearly_trends['european_price_premium_pct_mean'], marker='o', color='coral', linewidth=2)
        ax2.axhline(0, color='black', linestyle='--', linewidth=0.8)
        ax2.set_xlabel('Year')
        ax2.set_ylabel('Premium (%)')
        ax2.set_title('European Price Premium Trend')
        ax2.grid(alpha=0.3)
        ax2.fill_between(years, 0, yearly_trends['european_price_premium_pct_mean'], alpha=0.3, color='coral')

        # Specifications evolution
        ax3.plot(years, yearly_trends['RAM_mean'], marker='o', label='RAM (GB)', linewidth=2)
        ax3.plot(years, yearly_trends['Battery Capacity_mean']/1000, marker='s', label='Battery (Ah)', linewidth=2)
        ax3.plot(years, yearly_trends['Screen Size_mean'], marker='^', label='Screen (inches)', linewidth=2)
        ax3.set_xlabel('Year')
        ax3.set_ylabel('Specification Value')
        ax3.set_title('Technology Specification Trends')
        ax3.legend()
        ax3.grid(alpha=0.3)

        # Market volume
        ax4.bar(years, yearly_trends['Company Name_count'], color='steelblue', alpha=0.7)
        ax4.set_xlabel('Year')
        ax4.set_ylabel('Number of Models Launched')
        ax4.set_title('Market Activity (Model Launches per Year)')
        ax4.grid(axis='y', alpha=0.3)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/temporal_trends.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: temporal_trends.png")

    def analyze_segment_distribution(self):
        """Analyze market segment distribution"""
        print("\n[4/10] Analyzing market segment distribution...")

        df_valid = self.df[self.valid_mask].copy()

        # European segment distribution
        europe_segments = df_valid['price_segment_europe'].value_counts()
        global_segments = df_valid['price_segment_global'].value_counts()

        segment_comparison = pd.DataFrame({
            'European Market': europe_segments,
            'Global Market': global_segments
        }).fillna(0)

        segment_comparison_pct = segment_comparison.div(segment_comparison.sum()) * 100

        print("\n✓ Market Segment Distribution (%):")
        print(segment_comparison_pct.round(1))

        self.results['segment_distribution'] = {
            'european': europe_segments.to_dict(),
            'global': global_segments.to_dict(),
            'european_pct': (europe_segments / europe_segments.sum() * 100).to_dict(),
            'global_pct': (global_segments / global_segments.sum() * 100).to_dict()
        }

        # Plot: Segment distribution
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        x = np.arange(len(segment_comparison))
        width = 0.35

        ax1.bar(x - width/2, segment_comparison['European Market'], width, label='European Market', alpha=0.8)
        ax1.bar(x + width/2, segment_comparison['Global Market'], width, label='Global Market', alpha=0.8)
        ax1.set_xticks(x)
        ax1.set_xticklabels(segment_comparison.index, rotation=45)
        ax1.set_ylabel('Number of Models')
        ax1.set_title('Market Segment Distribution by Volume')
        ax1.legend()
        ax1.grid(axis='y', alpha=0.3)

        # Pie charts
        colors = sns.color_palette('husl', len(segment_comparison))
        ax2.pie(europe_segments, labels=europe_segments.index, autopct='%1.1f%%', colors=colors, startangle=90)
        ax2.set_title('European Market Segment Share')

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/segment_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: segment_distribution.png")

    def analyze_feature_preferences(self):
        """Analyze feature preferences by market"""
        print("\n[5/10] Analyzing feature preferences...")

        df_valid = self.df[self.valid_mask].copy()

        # Correlation with price in each market
        features = ['RAM', 'Battery Capacity', 'Screen Size', 'Mobile Weight']

        correlations = {}
        for feature in features:
            if feature in df_valid.columns:
                corr_europe = df_valid[[feature, 'price_european']].corr().iloc[0, 1]
                corr_global = df_valid[[feature, 'price_global_avg']].corr().iloc[0, 1]
                correlations[feature] = {
                    'european': float(corr_europe),
                    'global': float(corr_global),
                    'difference': float(corr_europe - corr_global)
                }

        print("\n✓ Feature-Price Correlations:")
        for feature, corrs in correlations.items():
            print(f"  {feature:20s}: Europe={corrs['european']:+.3f}, Global={corrs['global']:+.3f}, Δ={corrs['difference']:+.3f}")

        self.results['feature_preferences'] = correlations

        # Segment-wise feature analysis
        segment_features = df_valid.groupby('price_segment_europe')[features].mean()

        # Plot: Feature preferences
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        axes = axes.ravel()

        for idx, feature in enumerate(features[:4]):
            if feature in df_valid.columns:
                ax = axes[idx]

                # Box plot by segment
                europe_data = [df_valid[df_valid['price_segment_europe'] == seg][feature].dropna()
                              for seg in ['Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra-Premium']]

                bp = ax.boxplot(europe_data, labels=['Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra'], patch_artist=True)

                for patch in bp['boxes']:
                    patch.set_facecolor('lightblue')
                    patch.set_alpha(0.7)

                ax.set_ylabel(feature)
                ax.set_xlabel('Market Segment')
                ax.set_title(f'{feature} Distribution by Price Segment (European Market)')
                ax.grid(axis='y', alpha=0.3)
                ax.set_xticklabels(['Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra'], rotation=45)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/feature_preferences.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: feature_preferences.png")

    def analyze_competitive_landscape(self):
        """Analyze competitive dynamics"""
        print("\n[6/10] Analyzing competitive landscape...")

        df_valid = self.df[self.valid_mask].copy()

        # Market concentration (HHI - Herfindahl-Hirschman Index)
        europe_share = df_valid.groupby('Company Name').size()
        europe_share_pct = (europe_share / europe_share.sum() * 100)
        hhi_europe = (europe_share_pct ** 2).sum()

        print(f"\n✓ Market Concentration (HHI):")
        print(f"  European Market: {hhi_europe:.0f}")
        print(f"  Interpretation: {'Highly Concentrated' if hhi_europe > 2500 else 'Moderately Concentrated' if hhi_europe > 1500 else 'Competitive'}")

        # Top brands market share
        top_brands = europe_share_pct.nlargest(10)
        print(f"\n✓ Top 10 Brands Market Share (European):")
        for brand, share in top_brands.items():
            print(f"  {brand:20s}: {share:5.1f}%")

        # Competitive intensity by segment
        segment_competition = df_valid.groupby('price_segment_europe')['Company Name'].nunique()

        self.results['competitive_landscape'] = {
            'hhi_europe': float(hhi_europe),
            'market_structure': 'Highly Concentrated' if hhi_europe > 2500 else 'Moderately Concentrated' if hhi_europe > 1500 else 'Competitive',
            'top_10_brands_share': top_brands.to_dict(),
            'top_10_combined_share': float(top_brands.sum()),
            'brands_by_segment': segment_competition.to_dict()
        }

        # Plot: Competitive landscape
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Market share pie
        colors = sns.color_palette('Set3', len(top_brands) + 1)
        sizes = list(top_brands.values) + [100 - top_brands.sum()]
        labels = list(top_brands.index) + ['Others']

        ax1.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
        ax1.set_title(f'European Market Share (Top 10 + Others)\nHHI: {hhi_europe:.0f}')

        # Competitive intensity by segment
        ax2.bar(segment_competition.index.astype(str), segment_competition.values, color='steelblue', alpha=0.7)
        ax2.set_xlabel('Price Segment')
        ax2.set_ylabel('Number of Competing Brands')
        ax2.set_title('Competitive Intensity by Segment (European Market)')
        ax2.grid(axis='y', alpha=0.3)
        plt.xticks(rotation=45)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/competitive_landscape.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: competitive_landscape.png")

    def analyze_value_proposition(self):
        """Analyze value-for-money across markets"""
        print("\n[7/10] Analyzing value propositions...")

        df_valid = self.df[self.valid_mask].copy()

        # Calculate value scores (spec per dollar)
        df_valid['value_score_europe'] = (
            df_valid['RAM'] * 10 +
            df_valid['Battery Capacity'] / 100 +
            df_valid['Screen Size'] * 50
        ) / df_valid['price_european']

        df_valid['value_score_global'] = (
            df_valid['RAM'] * 10 +
            df_valid['Battery Capacity'] / 100 +
            df_valid['Screen Size'] * 50
        ) / df_valid['price_global_avg']

        # Best value phones
        europe_best_value = df_valid.nlargest(10, 'value_score_europe')[
            ['Company Name', 'Model Name', 'price_european', 'value_score_europe', 'RAM', 'Battery Capacity']
        ]

        print("\n✓ Top 10 Best Value Phones (European Market):")
        print(europe_best_value.to_string(index=False))

        # Value by segment
        segment_value = df_valid.groupby('price_segment_europe').agg({
            'value_score_europe': 'mean',
            'value_score_global': 'mean',
            'price_european': 'mean',
            'RAM': 'mean',
            'Battery Capacity': 'mean'
        }).round(3)

        self.results['value_proposition'] = {
            'best_value_europe': europe_best_value.to_dict('records'),
            'segment_value': segment_value.to_dict()
        }

        # Plot: Value analysis
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Value score distribution
        ax1.scatter(df_valid['price_european'], df_valid['value_score_europe'], alpha=0.5, s=50)
        ax1.set_xlabel('Price (€)')
        ax1.set_ylabel('Value Score (Spec/$)')
        ax1.set_title('Value Proposition: European Market')
        ax1.grid(alpha=0.3)

        # Add trend line
        z = np.polyfit(df_valid['price_european'], df_valid['value_score_europe'], 2)
        p = np.poly1d(z)
        x_line = np.linspace(df_valid['price_european'].min(), df_valid['price_european'].max(), 100)
        ax1.plot(x_line, p(x_line), "r--", alpha=0.8, linewidth=2)

        # Value by segment
        segments = segment_value.index.astype(str)
        x = np.arange(len(segments))
        width = 0.35

        ax2.bar(x - width/2, segment_value['value_score_europe'], width, label='European Market', alpha=0.8)
        ax2.bar(x + width/2, segment_value['value_score_global'], width, label='Global Market', alpha=0.8)
        ax2.set_xticks(x)
        ax2.set_xticklabels(segments, rotation=45)
        ax2.set_ylabel('Value Score')
        ax2.set_title('Value Proposition by Segment')
        ax2.legend()
        ax2.grid(axis='y', alpha=0.3)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/value_proposition.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: value_proposition.png")

    def analyze_price_gaps(self):
        """Analyze price gaps and arbitrage opportunities"""
        print("\n[8/10] Analyzing cross-market price gaps...")

        df_valid = self.df[self.valid_mask].copy()

        # Calculate all price gaps
        df_valid['gap_europe_usa'] = ((df_valid['price_european'] - df_valid['price_usa']) / df_valid['price_usa'] * 100)
        df_valid['gap_europe_china'] = ((df_valid['price_european'] - df_valid['price_china']) / df_valid['price_china'] * 100)
        df_valid['gap_europe_india'] = ((df_valid['price_european'] - df_valid['price_india']) / df_valid['price_india'] * 100)

        gaps_summary = df_valid[['gap_europe_usa', 'gap_europe_china', 'gap_europe_india']].describe()

        print("\n✓ Price Gap Statistics (%):")
        print(gaps_summary.round(1))

        # Largest gaps by brand
        brand_gaps = df_valid.groupby('Company Name')[['gap_europe_usa', 'gap_europe_china', 'gap_europe_india']].mean()
        brand_gaps = brand_gaps[df_valid.groupby('Company Name').size() >= 3]
        brand_gaps = brand_gaps.sort_values('gap_europe_usa', ascending=False)

        self.results['price_gaps'] = {
            'summary_stats': gaps_summary.to_dict(),
            'brand_gaps': brand_gaps.to_dict(),
            'largest_gaps': df_valid.nlargest(10, 'gap_europe_usa')[
                ['Company Name', 'Model Name', 'price_european', 'price_usa', 'gap_europe_usa']
            ].to_dict('records')
        }

        # Plot: Price gaps
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Gap distribution
        ax1.hist(df_valid['gap_europe_usa'].dropna(), bins=50, alpha=0.7, label='Europe-USA', color='blue')
        ax1.hist(df_valid['gap_europe_china'].dropna(), bins=50, alpha=0.7, label='Europe-China', color='red')
        ax1.hist(df_valid['gap_europe_india'].dropna(), bins=50, alpha=0.7, label='Europe-India', color='green')
        ax1.axvline(0, color='black', linestyle='--', linewidth=2)
        ax1.set_xlabel('Price Gap (%)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Distribution of European Price Premiums')
        ax1.legend()
        ax1.grid(alpha=0.3)

        # Brand gaps
        top_brands = brand_gaps.head(15)
        ax2.barh(range(len(top_brands)), top_brands['gap_europe_usa'], color='coral', alpha=0.7)
        ax2.set_yticks(range(len(top_brands)))
        ax2.set_yticklabels(top_brands.index)
        ax2.set_xlabel('Average Europe-USA Price Gap (%)')
        ax2.set_title('Top 15 Brands by European Premium')
        ax2.axvline(0, color='black', linewidth=0.8)
        ax2.grid(axis='x', alpha=0.3)

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/price_gaps.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: price_gaps.png")

    def perform_pca_analysis(self):
        """Perform PCA to identify market differentiation factors"""
        print("\n[9/10] Performing PCA analysis...")

        df_valid = self.df[self.valid_mask].copy()

        # Select numeric features
        features = ['RAM', 'Battery Capacity', 'Screen Size', 'Mobile Weight',
                   'price_european', 'price_global_avg', 'Launched Year']

        # Prepare data
        X = df_valid[features].dropna()
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # PCA
        pca = PCA(n_components=3)
        components = pca.fit_transform(X_scaled)

        print(f"\n✓ PCA Explained Variance:")
        for i, var in enumerate(pca.explained_variance_ratio_):
            print(f"  PC{i+1}: {var*100:.1f}%")
        print(f"  Total: {sum(pca.explained_variance_ratio_)*100:.1f}%")

        # Feature loadings
        loadings = pd.DataFrame(
            pca.components_.T,
            columns=['PC1', 'PC2', 'PC3'],
            index=features
        )

        print("\n✓ Feature Loadings:")
        print(loadings.round(3))

        self.results['pca_analysis'] = {
            'explained_variance': pca.explained_variance_ratio_.tolist(),
            'cumulative_variance': np.cumsum(pca.explained_variance_ratio_).tolist(),
            'feature_loadings': loadings.to_dict()
        }

        # Plot: PCA
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Scree plot
        ax1.bar(range(1, 4), pca.explained_variance_ratio_ * 100, alpha=0.7, color='steelblue')
        ax1.set_xlabel('Principal Component')
        ax1.set_ylabel('Explained Variance (%)')
        ax1.set_title('PCA Scree Plot')
        ax1.set_xticks(range(1, 4))
        ax1.grid(axis='y', alpha=0.3)

        # Loadings heatmap
        sns.heatmap(loadings, annot=True, cmap='RdBu_r', center=0, ax=ax2,
                   cbar_kws={'label': 'Loading'}, fmt='.2f')
        ax2.set_title('PCA Feature Loadings')

        plt.tight_layout()
        plt.savefig('data/market_analysis/plots/pca_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()

        print("✓ Saved: pca_analysis.png")

    def generate_insights_report(self):
        """Generate executive summary and insights"""
        print("\n[10/10] Generating insights report...")

        insights = {
            'executive_summary': {
                'european_premium_avg': f"{self.results['market_definition']['avg_european_premium_pct']:.1f}%",
                'european_avg_price': f"${self.results['market_definition']['european_avg_price']:.2f}",
                'global_avg_price': f"${self.results['market_definition']['global_avg_price']:.2f}",
                'market_concentration': self.results['competitive_landscape']['market_structure'],
                'top_3_brands': list(self.results['competitive_landscape']['top_10_brands_share'].keys())[:3]
            },
            'key_findings': [
                f"European market shows {self.results['market_definition']['avg_european_premium_pct']:.1f}% average price premium over global markets",
                f"Market concentration (HHI: {self.results['competitive_landscape']['hhi_europe']:.0f}) indicates {self.results['competitive_landscape']['market_structure'].lower()} market structure",
                f"Top 10 brands control {self.results['competitive_landscape']['top_10_combined_share']:.1f}% of European market",
                f"Premium and Flagship segments represent {self.results['segment_distribution']['european_pct'].get('Premium', 0) + self.results['segment_distribution']['european_pct'].get('Flagship', 0):.1f}% of European market"
            ],
            'strategic_recommendations': [
                "European market commands premium pricing - brands should invest in features that justify higher prices",
                "Focus on premium/flagship segments where European buyers show strong preference",
                "Consider differentiated pricing strategies across markets to capture regional willingness-to-pay",
                "Technology adoption (RAM, battery) shows strong correlation with pricing - emphasize spec leadership"
            ]
        }

        self.results['insights'] = insights

        # Save complete results
        with open('data/market_analysis/european_vs_global_analysis.json', 'w') as f:
            json.dump(self.results, f, indent=2, default=str)

        print("\n" + "="*80)
        print("ANALYSIS COMPLETE - KEY INSIGHTS")
        print("="*80)

        print(f"\n📊 Executive Summary:")
        for key, value in insights['executive_summary'].items():
            print(f"  • {key.replace('_', ' ').title()}: {value}")

        print(f"\n🔍 Key Findings:")
        for i, finding in enumerate(insights['key_findings'], 1):
            print(f"  {i}. {finding}")

        print(f"\n💡 Strategic Recommendations:")
        for i, rec in enumerate(insights['strategic_recommendations'], 1):
            print(f"  {i}. {rec}")

        print(f"\n✓ Complete analysis saved to: data/market_analysis/")
        print(f"✓ Generated {len([f for f in Path('data/market_analysis/plots').glob('*.png')])} visualization plots")
        print("="*80)

    def run_complete_analysis(self):
        """Run all analysis steps"""
        self.define_market_regions()
        self.analyze_brand_positioning()
        self.analyze_temporal_trends()
        self.analyze_segment_distribution()
        self.analyze_feature_preferences()
        self.analyze_competitive_landscape()
        self.analyze_value_proposition()
        self.analyze_price_gaps()
        self.perform_pca_analysis()
        self.generate_insights_report()

if __name__ == '__main__':
    analyzer = MarketAnalyzer()
    analyzer.run_complete_analysis()
