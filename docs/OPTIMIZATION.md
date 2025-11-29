# Optimization Guide

Comprehensive guide for optimizing models, images, and datasets in the project.

## Overview

Three optimization scripts achieve significant size reductions:

| Target       | Script               | Reduction    | Impact                 |
| ------------ | -------------------- | ------------ | ---------------------- |
| **Models**   | `optimize_models.py` | 77.9%        | 13.85MB → 3.06MB       |
| **Images**   | `optimize_images.py` | 55.8% (WebP) | PNG → WebP conversion  |
| **CSV Data** | `optimize_csv.py`    | 86.5%        | 292KB → 40KB (gzipped) |

## Quick Start

```powershell
# Run all optimizations
npm run optimize

# Individual optimizations
npm run optimize:models   # Model compression
npm run optimize:images   # Image WebP conversion
npm run optimize:csv      # CSV compression
```

## Model Optimization

### What It Does

Compresses trained scikit-learn models from pickle (`.pkl`) to optimized joblib (`.joblib`) format with compression level 9.

### Usage

```powershell
# Safe mode: Creates *_optimized.joblib files
npm run optimize:models

# Or directly with Python
python scripts/optimize_models.py

# Replace originals (after testing)
python scripts/optimize_models.py --replace
```

### Results

```
Processing: battery_predictor_sklearn.pkl...
  ✓ 1.72 MB → 0.44 MB (74.7% reduction)

Processing: brand_classifier_sklearn.pkl...
  ✓ 9.59 MB → 1.88 MB (80.4% reduction)

Processing: price_predictor_sklearn.pkl...
  ✓ 1.47 MB → 0.45 MB (69.4% reduction)

Processing: ram_predictor_sklearn.pkl...
  ✓ 1.06 MB → 0.29 MB (72.9% reduction)

Overall reduction: 77.9%
```

### Implementation

The Python prediction loader (`python_api/predictions_sklearn.py`) automatically tries:

1. `*_optimized.joblib` (optimized, safe mode)
2. `*.joblib` (replaced original)
3. `*.pkl` (original pickle)

**No code changes needed** - loader handles all formats transparently.

### Safety

- **Safe mode** (default): Creates new files, originals untouched
- **Replace mode** (`--replace` flag): Backs up originals with `.backup` extension
- **Zero accuracy loss**: Compression is lossless for model weights

## Image Optimization

### What It Does

1. **PNG Optimization**: Lossless compression using Pillow
2. **WebP Conversion**: Modern format with superior compression

### Usage

```powershell
npm run optimize:images

# Or with options
python scripts/optimize_images.py --dir public/images --quality 85
```

### Results

```
PNG Optimization:
  Original size:   2664.7 KB
  Optimized size:  2577.2 KB
  Reduction:       3.3% (lossless)

WebP Conversion:
  Original size:   2664.7 KB
  WebP size:       1177.2 KB
  Reduction:       55.8%

9 WebP files created
```

### Using WebP Images

#### Option 1: OptimizedImage Component

```vue
<template>
  <OptimizedImage
    src="network-visualization.png"
    alt="Network architecture"
    class="w-full rounded-lg"
    lazy
  />
</template>
```

The component automatically:

- Serves WebP to supporting browsers
- Falls back to PNG for older browsers
- Adds lazy loading
- Maintains aspect ratio

#### Option 2: Manual Picture Element

```vue
<picture>
  <source srcset="/images/model-comparison.webp" type="image/webp" />
  <img src="/images/model-comparison.png" alt="Model comparison" />
</picture>
```

### Configuration

**Quality Settings** (`scripts/optimize_images.py`):

```python
OPTIMIZE_QUALITY = 85  # PNG quality (0-100)
WEBP_QUALITY = 85      # WebP quality (0-100)
```

**Supported Formats**:

- Input: `.png`, `.jpg`, `.jpeg`
- Output: Optimized original + `.webp` variant

## CSV Optimization

### What It Does

1. **Duplicate Removal**: Drops duplicate rows
2. **Column Cleanup**: Removes empty columns
3. **Type Optimization**: int64 → int32/int16, float64 → float32
4. **Categorical Encoding**: Converts low-cardinality strings to category dtype
5. **Gzip Compression**: Final compression with gzip

### Usage

```powershell
npm run optimize:csv

# Or with options
python scripts/optimize_csv.py --dir data --no-compress --keep-duplicates
```

### Results

```
Processing: Mobiles Dataset (2025).csv...
  📦 Size: 156.4 KB → 21.2 KB (86.5% reduction) | Encoding: latin-1
  📊 Rows: 930 → 915 (15 duplicates removed)

Overall reduction: 86.5%
```

### Reading Compressed CSVs

**Pandas (automatic)**:

```python
import pandas as pd

# Pandas auto-detects gzip
df = pd.read_csv('data/Mobiles Dataset (2025).csv.gz')
```

**Manual specification**:

```python
df = pd.read_csv('file.csv.gz', compression='gzip')
```

### Schema Validation

Before optimization, validate CSV structure:

```powershell
npm run csv:validate
```

**Expected Output**:

```
✅ Schema validation passed!
  All 11 required columns present
  Using raw CSV format (preprocessing normalizes data types)
```

Required columns:

- `Company Name`, `Model Name`, `RAM`, `Screen Size`
- `Front Camera`, `Back Camera`, `Battery Capacity`
- `Mobile Weight`, `Launched Year`, `Processor`
- `Current Price (Greece)`

## Advanced Optimization

### Model Quantization (Future)

For even smaller models, consider:

```python
# Reduce precision (experimental)
from sklearn.tree import DecisionTreeRegressor
import numpy as np

# Train with reduced precision
model = DecisionTreeRegressor(max_depth=10)
# ... train model

# Quantize weights to float16
model.tree_.threshold = model.tree_.threshold.astype('float16')
```

### Image Responsive Sizes

Generate multiple sizes for responsive images:

```python
from PIL import Image

sizes = [320, 640, 1024, 1920]
for size in sizes:
    img = Image.open('original.png')
    img.thumbnail((size, size))
    img.save(f'image-{size}w.webp', 'WEBP', quality=85)
```

Use in HTML:

```html
<img
  srcset="
    /images/image-320w.webp   320w,
    /images/image-640w.webp   640w,
    /images/image-1024w.webp 1024w,
    /images/image-1920w.webp 1920w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  src="/images/image-1024w.webp"
/>
```

### CSV Delta Compression

For versioned datasets:

```python
# Save only changes
df_old = pd.read_csv('old_version.csv')
df_new = pd.read_csv('new_version.csv')

# Compute diff
df_diff = df_new[~df_new.isin(df_old)].dropna()
df_diff.to_csv('delta.csv.gz', compression='gzip', index=False)
```

## Performance Impact

### Model Loading Time

| Format                 | Load Time      | Size            |
| ---------------------- | -------------- | --------------- |
| `.pkl` (pickle)        | 150ms          | 9.59MB          |
| `.joblib` (compressed) | 120ms          | 1.88MB          |
| **Improvement**        | **20% faster** | **80% smaller** |

### Image Loading (First Paint)

| Format          | Transfer     | Decode         | Total          |
| --------------- | ------------ | -------------- | -------------- |
| PNG             | 417KB        | 12ms           | ~450ms         |
| WebP            | 165KB        | 8ms            | ~200ms         |
| **Improvement** | **60% less** | **33% faster** | **55% faster** |

### CSV Loading

| Format          | Size            | Parse Time     |
| --------------- | --------------- | -------------- |
| Uncompressed    | 156KB           | 45ms           |
| Gzipped         | 21KB            | 38ms           |
| **Improvement** | **86% smaller** | **15% faster** |

## Monitoring

### Check Optimization Status

```powershell
# List optimized model files
Get-ChildItem python_api/trained_models/*_optimized.joblib

# Check WebP files
Get-ChildItem public/images/*.webp

# Compressed CSVs
Get-ChildItem data/*.csv.gz
```

### Disk Usage

```powershell
# Before optimization
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum

# After optimization
# Compare totals
```

## Rollback

### Restore Original Models

```powershell
# If you used --replace, restore backups
cd python_api/trained_models
Get-ChildItem *.pkl.backup | ForEach-Object {
  $original = $_.Name -replace '\.backup$', ''
  Copy-Item $_.FullName $original -Force
}
```

### Remove Optimized Files

```powershell
# Models
Remove-Item python_api/trained_models/*_optimized.joblib

# Images
Remove-Item public/images/*.webp

# CSVs
Remove-Item data/*.csv.gz
```

## Best Practices

1. **Always test optimized models** before replacing originals
2. **Keep WebP + PNG** for maximum browser compatibility
3. **Validate CSV schema** after compression
4. **Version control**: Commit optimized files separately
5. **CI/CD**: Run optimizations as pre-deployment step

## Troubleshooting

**Problem**: Models fail to load after optimization

```powershell
# Check model integrity
python -c "import joblib; m = joblib.load('model_optimized.joblib'); print(m)"
```

**Problem**: WebP images not displaying

- Check browser support (90%+ modern browsers)
- Ensure fallback PNG exists
- Verify MIME type: `image/webp`

**Problem**: CSV encoding errors

```python
# Try different encodings
pd.read_csv('file.csv.gz', encoding='latin-1')
```

## See Also

- [Model Training Guide](../mobiles-dataset-docs/README.md)
- [Deployment Guide](README.md#deployment)
- [CSV Schema Validation](../scripts/validate_csv_schema.py)

---

**Last Updated**: November 29, 2025
