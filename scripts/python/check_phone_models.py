from pathlib import Path

import pandas as pd

# Get project root and load dataset
project_root = Path(__file__).parent.parent.parent
dataset_path = project_root / 'data' / 'Mobiles Dataset (2025).csv'
if not dataset_path.exists():
    dataset_path = project_root / 'Mobiles Dataset (2025).csv'
df = pd.read_csv(dataset_path, encoding='latin-1')

print(f"Total phones: {len(df)}")
print(f"Unique companies: {df['Company Name'].nunique()}")
print(f"Unique models: {df['Model Name'].nunique()}")
print(f"\nCompanies: {sorted(df['Company Name'].unique())}")
print(f"\nSample models by company:")
for company in sorted(df['Company Name'].unique()):
    company_models = df[df['Company Name'] == company]['Model Name'].unique()
    print(f"\n{company} ({len(company_models)} models):")
    for model in sorted(company_models)[:5]:
        print(f"  - {model}")
    if len(company_models) > 5:
        print(f"  ... and {len(company_models) - 5} more")
