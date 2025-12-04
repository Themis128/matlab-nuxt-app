# File Optimization Scripts

Comprehensive tools to reduce file sizes of ML models, images, and data files without losing quality.

## Quick Start

### Optimize Everything at Once

```powershell
npm run optimize
```

This runs all three optimization scripts and provides a complete summary.

### Individual Optimizations

**ML Models:**

```powershell
npm run optimize:models
```

**Images:**

```powershell
npm run optimize:images
```

**CSV Data:**

```powershell
npm run optimize:csv
```

## What Gets Optimized

### 1. ML Models (`optimize_models.py`)

**Target files:**

- `python_api/trained_models/*.pkl` (scikit-learn models)

**Optimizations:**

- ✅ Re-saves with joblib compression (level 9)
- ✅ More efficient serialization format
- ✅ Removes unnecessary training metadata

**Expected savings:** 20-40% file size reduction

**Example:**

```
brand_classifier_sklearn.pkl: 9.59 MB → 6.5 MB (32% reduction)
price_predictor_sklearn.pkl:  1.47 MB → 0.9 MB (39% reduction)
```

**Output:** `*_optimized.joblib` files

### 2. Images (`optimize_images.py`)

**Target files:**

- `public/images/*.png`
- `public/images/*.jpg`

**Optimizations:**

- ✅ PNG optimization with PIL
- ✅ Converts RGBA → RGB (removes alpha channel)
- ✅ Creates WebP versions (best compression)
- ✅ Maintains visual quality at 85% (adjustable)

**Expected savings:** 30-70% file size reduction

**Example:**

```
performance-dashboard.png: 483 KB → 340 KB (30% reduction)
WebP version:              483 KB → 145 KB (70% reduction)
```

**Output:** `*_optimized.png` and `*.webp` files

### 3. CSV Data (`optimize_csv.py`)

**Target files:**

- `data/*.csv`

**Optimizations:**

- ✅ Removes duplicate rows
- ✅ Drops empty columns
- ✅ Optimizes dtypes (int64→int32, float64→float32)
- ✅ Converts repetitive strings to categories
- ✅ GZIP compression

**Expected savings:** 40-80% file size reduction

**Example:**

```
Mobiles Dataset (2025).csv: 156 KB → 45 KB (71% reduction)
- Removed 15 duplicate rows
- Optimized 8 columns to int32
- GZIP compressed
```

**Output:** `*_optimized.csv.gz` files

## Advanced Usage

### Customize Image Quality

```powershell
python scripts/optimize_images.py --quality 90
```

Quality range: 1-100 (default: 85)

### Optimize Specific Directory

```powershell
python scripts/optimize_images.py --dir screenshots
python scripts/optimize_csv.py --dir public
```

### Skip WebP Conversion

```powershell
python scripts/optimize_images.py --no-webp
```

### Keep Duplicates in CSV

```powershell
python scripts/optimize_csv.py --keep-duplicates
```

### Replace Original Models

```powershell
python scripts/optimize_models.py --replace
```

⚠️ **Warning:** This backs up originals as `*.pkl.backup` then replaces them

## Testing Optimized Files

### Test ML Models

```python
import joblib

# Load optimized model
model = joblib.load('python_api/trained_models/price_predictor_optimized.joblib')

# Make prediction (should work identically)
result = model.predict(test_data)
```

### Test Images

```html
<!-- Use WebP with PNG fallback -->
<picture>
  <source srcset="/images/performance-dashboard.webp" type="image/webp" />
  <img src="/images/performance-dashboard.png" alt="Dashboard" />
</picture>
```

### Test CSV

```python
import pandas as pd

# Load compressed CSV
df = pd.read_csv('data/Mobiles Dataset (2025)_optimized.csv.gz', compression='gzip')
```

## Update Code to Use Optimized Files

### 1. Update API to Use Optimized Models

**File:** `python_api/predictions_sklearn.py`

```python
# Before
model = pickle.load('trained_models/price_predictor_sklearn.pkl')

# After
model = joblib.load('trained_models/price_predictor_sklearn.joblib')
```

### 2. Update Components to Use WebP Images

**File:** `components/PerformanceMetrics.vue`

```vue
<template>
  <picture>
    <source srcset="/images/performance-dashboard.webp" type="image/webp" />
    <img src="/images/performance-dashboard.png" alt="Performance Dashboard" />
  </picture>
</template>
```

### 3. Update CSV Loaders

**File:** `server/api/dataset/search.get.ts`

```typescript
// Before
const csvPath = join(projectRoot, 'data', 'Mobiles Dataset (2025).csv');

// After (if using compressed version)
const csvPath = join(projectRoot, 'data', 'Mobiles Dataset (2025).csv.gz');
// Note: Most CSV parsers auto-detect gzip
```

## Replacing Original Files

After testing, you can safely replace originals:

### Manual Replacement

```powershell
# Models
mv python_api/trained_models/price_predictor_sklearn.pkl python_api/trained_models/price_predictor_sklearn.pkl.backup
mv python_api/trained_models/price_predictor_optimized.joblib python_api/trained_models/price_predictor_sklearn.joblib

# Images (keep both for browser compatibility)
# Just reference .webp in HTML with PNG fallback

# CSV
mv data/Mobiles\ Dataset\ (2025).csv data/Mobiles\ Dataset\ (2025).csv.backup
mv data/Mobiles\ Dataset\ (2025)_optimized.csv.gz data/Mobiles\ Dataset\ (2025).csv.gz
```

### Automated Replacement (Models Only)

```powershell
python scripts/optimize_models.py --replace
```

## Expected Total Savings

Based on your current files:

| Category    | Original Size | Optimized Size | Savings          |
| ----------- | ------------- | -------------- | ---------------- |
| ML Models   | ~52 MB        | ~35 MB         | ~17 MB (33%)     |
| PNG Images  | ~2.5 MB       | ~1.5 MB        | ~1 MB (40%)      |
| WebP Images | ~2.5 MB       | ~0.8 MB        | ~1.7 MB (68%)    |
| CSV Data    | ~350 KB       | ~100 KB        | ~250 KB (71%)    |
| **Total**   | **~55 MB**    | **~37 MB**     | **~18 MB (33%)** |

_Plus faster load times and better performance!_

## Troubleshooting

### ImportError: No module named 'joblib'

```powershell
pip install joblib
```

### ImportError: No module named 'PIL'

```powershell
pip install Pillow
```

### ImportError: No module named 'pandas'

```powershell
pip install pandas
```

### Install all dependencies

```powershell
pip install joblib Pillow pandas
```

### "Permission denied" when replacing files

- Close any programs using the files
- Run terminal as administrator
- Or manually rename files

## Best Practices

✅ **DO:**

- Run optimizations before committing large files
- Test optimized files before replacing originals
- Keep backups of original files
- Use WebP with PNG/JPG fallbacks for browser compatibility
- Version control optimization scripts

❌ **DON'T:**

- Delete originals without testing
- Set image quality below 80 (visible quality loss)
- Remove all duplicates from datasets without verifying
- Optimize files that change frequently (re-optimize after changes)

## Automation

Add to your CI/CD pipeline:

```yaml
# .github/workflows/optimize.yml
name: Optimize Assets
on: [push]
jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: pip install joblib Pillow pandas
      - run: python scripts/optimize_all.py
      - run: git add . && git commit -m "Optimize assets" || true
```

## Related Documentation

- [Git LFS Configuration](../.gitattributes) - Large file tracking
- [.gitignore](../.gitignore) - Excluded files
- [Python API README](../python_api/README.md) - Model usage

---

**Last Updated:** November 29, 2025  
**Python Requirements:** joblib, Pillow, pandas  
**Compatible with:** Windows, Linux, macOS
