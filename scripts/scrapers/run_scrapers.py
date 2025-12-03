"""
Main scraper orchestrator to run all scrapers and merge results.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.scrapers.benchmark_scraper import BenchmarkScraper
from scripts.scrapers.common import logger
from scripts.scrapers.gsmarena_scraper import GSMArenaScraper
from scripts.scrapers.review_scraper import ReviewScraper


class ScraperOrchestrator:
    """Orchestrates all scrapers and merges data."""
    
    def __init__(self, dataset_path: str = None):
        """
        Initialize orchestrator.
        
        Args:
            dataset_path: Path to main dataset CSV
        """
        self.dataset_path = dataset_path or 'data/Mobiles Dataset (2025).csv'
        self.gsmarena = GSMArenaScraper()
        self.benchmark = BenchmarkScraper()
        self.review = ReviewScraper()
        
        self.df = None
        self.enriched_data = {}
    
    def load_dataset(self) -> pd.DataFrame:
        """Load main dataset."""
        try:
            # Try UTF-8 first, fallback to cp1252/latin1
            encodings = ['utf-8', 'cp1252', 'latin1', 'iso-8859-1']
            
            for encoding in encodings:
                try:
                    self.df = pd.read_csv(self.dataset_path, encoding=encoding)
                    logger.info(f"Loaded dataset with {encoding}: {len(self.df)} phones")
                    return self.df
                except (UnicodeDecodeError, FileNotFoundError) as e:
                    if encoding == encodings[-1]:
                        raise
                    continue
            
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            return None
    
    def get_phone_list(self, limit: int = None) -> List[str]:
        """
        Get list of phone models from dataset.
        
        Args:
            limit: Optional limit on number of phones
        
        Returns:
            List of phone model names
        """
        if self.df is None:
            self.load_dataset()
        
        if self.df is None:
            return []
        
        # Check actual column names
        logger.info(f"Dataset columns: {list(self.df.columns)}")
        
        # Combine Company Name and Model Name for full name
        phones = []
        for _, row in self.df.iterrows():
            company = str(row.get('Company Name', row.get('Company', ''))).strip()
            model = str(row.get('Model Name', row.get('Model', ''))).strip()
            
            if company and model:
                full_name = f"{company} {model}"
                phones.append(full_name)
        
        if limit:
            phones = phones[:limit]
        
        logger.info(f"Found {len(phones)} phone models")
        return phones
    
    def scrape_all(self, phone_list: List[str] = None, limit: int = 10) -> Dict[str, Dict[str, Any]]:
        """
        Run all scrapers on phone list.
        
        Args:
            phone_list: Optional custom phone list
            limit: Limit number of phones to scrape
        
        Returns:
            Dictionary of enriched phone data
        """
        if phone_list is None:
            phone_list = self.get_phone_list(limit=limit)
        
        logger.info(f"Starting scraping for {len(phone_list)} phones...")
        
        results = {}
        
        for i, phone in enumerate(phone_list, 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"Processing {i}/{len(phone_list)}: {phone}")
            logger.info(f"{'='*60}")
            
            phone_data = {
                'model_name': phone,
                'gsmarena': {},
                'benchmarks': {},
                'reviews': {}
            }
            
            # GSMArena specs
            try:
                logger.info("→ Scraping GSMArena...")
                phone_data['gsmarena'] = self.gsmarena.scrape_phone(phone)
            except Exception as e:
                logger.error(f"GSMArena error: {e}")
            
            # Benchmarks
            try:
                logger.info("→ Getting benchmarks...")
                chipset = phone_data['gsmarena'].get('performance', {}).get('chipset')
                phone_data['benchmarks'] = self.benchmark.get_benchmark_scores(phone, chipset)
            except Exception as e:
                logger.error(f"Benchmark error: {e}")
            
            # Reviews
            try:
                logger.info("→ Getting reviews...")
                phone_data['reviews'] = self.review.get_reviews(phone)
            except Exception as e:
                logger.error(f"Review error: {e}")
            
            results[phone] = phone_data
        
        self.enriched_data = results
        return results
    
    def flatten_data(self) -> pd.DataFrame:
        """
        Flatten enriched data into tabular format.
        
        Returns:
            DataFrame with all features
        """
        if not self.enriched_data:
            logger.error("No enriched data to flatten")
            return None
        
        rows = []
        
        for phone, data in self.enriched_data.items():
            row = {'model_name': phone}
            
            # GSMArena display features
            display = data.get('gsmarena', {}).get('display', {})
            row['refresh_rate'] = display.get('refresh_rate')
            row['display_type'] = display.get('type')
            row['peak_brightness_nits'] = display.get('peak_brightness_nits')
            row['resolution'] = display.get('resolution')
            
            # GSMArena camera features
            camera = data.get('gsmarena', {}).get('camera', {})
            row['main_camera_mp'] = camera.get('main_mp')
            row['main_aperture'] = camera.get('main_aperture')
            row['sensor_size'] = camera.get('sensor_size')
            row['has_ois'] = camera.get('has_ois', False)
            row['max_video'] = camera.get('max_video')
            row['max_video_fps'] = camera.get('max_video_fps')
            
            # GSMArena battery features
            battery = data.get('gsmarena', {}).get('battery', {})
            row['charging_speed_w'] = battery.get('charging_speed_w')
            row['wireless_charging_w'] = battery.get('wireless_charging_w')
            row['has_reverse_charging'] = battery.get('has_reverse_charging', False)
            row['endurance_rating_hours'] = battery.get('endurance_rating_hours')
            
            # GSMArena build features
            build = data.get('gsmarena', {}).get('build', {})
            row['glass_type'] = build.get('glass_type')
            row['ip_rating'] = build.get('ip_rating')
            row['materials'] = build.get('materials')
            
            # User ratings
            user_rating = data.get('gsmarena', {}).get('user_rating', {})
            row['gsmarena_rating'] = user_rating.get('score')
            row['gsmarena_review_count'] = user_rating.get('review_count')
            
            # Benchmarks
            benchmarks = data.get('benchmarks', {})
            row['antutu_score'] = benchmarks.get('antutu')
            geekbench = benchmarks.get('geekbench', {})
            row['geekbench_single'] = geekbench.get('single_core')
            row['geekbench_multi'] = geekbench.get('multi_core')
            row['performance_tier'] = benchmarks.get('performance_tier')
            
            # Reviews
            reviews = data.get('reviews', {})
            row['amazon_rating'] = reviews.get('rating')
            row['amazon_review_count'] = reviews.get('review_count')
            sentiment = reviews.get('sentiment', {})
            row['positive_sentiment_pct'] = sentiment.get('positive')
            row['negative_sentiment_pct'] = sentiment.get('negative')
            
            rows.append(row)
        
        df = pd.DataFrame(rows)
        logger.info(f"Flattened data: {len(df)} rows, {len(df.columns)} columns")
        return df
    
    def save_results(self, output_path: str = None):
        """
        Save enriched data to file.
        
        Args:
            output_path: Output file path (JSON or CSV)
        """
        if not self.enriched_data:
            logger.error("No data to save")
            return
        
        if output_path is None:
            output_path = 'data/scraped_phone_data.json'
        
        try:
            # Save raw JSON
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.enriched_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved raw data to: {output_path}")
            
            # Save flattened CSV
            df = self.flatten_data()
            if df is not None:
                csv_path = output_path.replace('.json', '.csv')
                df.to_csv(csv_path, index=False, encoding='utf-8')
                logger.info(f"Saved flattened data to: {csv_path}")
        
        except Exception as e:
            logger.error(f"Error saving results: {e}")
    
    def merge_with_dataset(self, output_path: str = None):
        """
        Merge scraped data with original dataset.
        
        Args:
            output_path: Output path for merged dataset
        """
        if self.df is None:
            self.load_dataset()
        
        if self.df is None:
            logger.error("Cannot merge - dataset not loaded")
            return
        
        # Get flattened scraped data
        scraped_df = self.flatten_data()
        if scraped_df is None:
            logger.error("Cannot merge - no scraped data")
            return
        
        # Merge on model name (need to create matching column in original)
        original_df = self.df.copy()
        original_df['model_name'] = (
            original_df.get('Company Name', original_df.get('Company', '')).astype(str) + ' ' + 
            original_df.get('Model Name', original_df.get('Model', '')).astype(str)
        )
        
        # Merge
        merged = pd.merge(
            original_df,
            scraped_df,
            on='model_name',
            how='left',
            suffixes=('', '_scraped')
        )
        
        if output_path is None:
            output_path = 'data/Mobiles Dataset (2025) - Enhanced.csv'
        
        merged.to_csv(output_path, index=False, encoding='utf-8')
        logger.info(f"Merged dataset saved to: {output_path}")
        logger.info(f"Total rows: {len(merged)}, Total columns: {len(merged.columns)}")


def main():
    """Run scraper orchestrator."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape phone data from multiple sources')
    parser.add_argument('--limit', type=int, default=10, help='Limit number of phones to scrape')
    parser.add_argument('--dataset', type=str, help='Path to dataset CSV')
    parser.add_argument('--output', type=str, help='Output path for results')
    parser.add_argument('--merge', action='store_true', help='Merge with original dataset')
    parser.add_argument('--populate-cache', action='store_true', help='Populate known data first')
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = ScraperOrchestrator(dataset_path=args.dataset)
    
    # Populate caches with known data
    if args.populate_cache:
        logger.info("Populating caches with known data...")
        orchestrator.benchmark.populate_known_scores()
        orchestrator.review.populate_known_reviews()
    
    # Run scrapers
    logger.info(f"\nStarting scraper orchestrator (limit: {args.limit} phones)")
    orchestrator.scrape_all(limit=args.limit)
    
    # Save results
    orchestrator.save_results(output_path=args.output)
    
    # Merge with original dataset if requested
    if args.merge:
        logger.info("\nMerging with original dataset...")
        orchestrator.merge_with_dataset()
    
    logger.info("\n" + "="*60)
    logger.info("Scraping complete!")
    logger.info("="*60)


if __name__ == "__main__":
    main()
