"""Check Euro price scraper status"""
import json
import pandas as pd
from pathlib import Path

# Get project root
project_root = Path(__file__).parent.parent.parent

# Check progress
progress_file = project_root / 'data' / 'euro_price_scraping_progress.json'
if progress_file.exists():
    with open(progress_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    stats = data.get('stats', {})
    prices = data.get('prices', {})
    print(f"Progress Status:")
    print(f"  Models processed: {stats.get('total', 0)}")
    print(f"  Prices found: {stats.get('found', 0)}")
    print(f"  Not found: {stats.get('not_found', 0)}")
    print(f"  Unique prices scraped: {len(prices)}")
    print(f"  Last update: {data.get('timestamp', 'N/A')}")
else:
    print("No progress file found")

# Check total unique models
dataset_path = project_root / 'data' / 'Mobiles Dataset (2025).csv'
if not dataset_path.exists():
    dataset_path = project_root / 'Mobiles Dataset (2025).csv'
df = pd.read_csv(dataset_path, encoding='latin-1')
models = set()
for _, row in df.iterrows():
    company = str(row.get('Company Name', '')).strip()
    model = str(row.get('Model Name', '')).strip()
    if model and model != 'nan':
        models.add(f"{company} {model}".strip())

print(f"\nTotal unique models in dataset: {len(models)}")
print(f"Remaining models to process: {len(models) - stats.get('total', 0)}")

# Check output file
output_file = project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025)_EUR.csv'
if output_file.exists():
    print(f"\nOutput file exists: {output_file}")
else:
    print(f"\nOutput file not created yet")
