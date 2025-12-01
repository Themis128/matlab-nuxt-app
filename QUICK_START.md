# Quick Start Guide - Mobile Dataset Analysis

## 🚀 Quick Commands

### Run All Analysis

```bash
python run_all_analysis.py
```

**Generates:**

- European market segmentation
- Price prediction models (89.81% accuracy)
- Dataset insights and trends
- Visualizations

### Fix Dataset Issues

```bash
python fix_dataset_issues.py
```

**Fixes:**

- RAM outliers (caps at 24GB)
- Camera concatenation errors
- Price data entry errors
- Adds EUR prices

### Test API

```bash
# Start Python API (Terminal 1)
cd python_api
python api.py

# Start Nuxt (Terminal 2)
npm run dev

# Run tests (Terminal 3)
npm test
```

## 📊 Key Results

### Type Checking (TypeScript)

If the TypeScript checks run out of memory on large machines or slow environments, use the CI-scoped check or the memory-increased helper.

```pwsh
# Fast, scoped check (recommended)
npm run typecheck

# Full project check with increased Node heap (may need lots of RAM)
npm run typecheck:mem
```

### Dataset

- **930 phones** from 19 brands
- **Years:** 2014-2025
- **Prices:** $79 - $3,962 (€72.68 - €3,645.22)
- **Status:** Production-ready with EUR prices

### European Market

- Budget (€0-300): **330 phones** (35.5%)
- Mid-range (€300-700): **326 phones** (35.1%)
- Premium (€700-1200): **232 phones** (25.0%)
- Flagship (€1200+): **42 phones** (4.5%)

### ML Models

- **Gradient Boosting:** 89.81% accuracy, $78.92 MAE
- **Random Forest:** 85.56% accuracy
- **Best predictor:** Storage (56% correlation)

## 📁 Output Files

### Analysis Results

```
data/
├── Mobiles_Dataset_Final.csv              # Production dataset
├── european_market_analysis.json          # Market segments
├── price_prediction_results.json          # ML model performance
├── dataset_exploration_insights.json      # Trends & insights
└── dataset_exploration_dashboard.png      # 4-panel viz
```

### Reports

```
./
├── IMPLEMENTATION_SUMMARY.md              # Detailed documentation
└── QUICK_START.md                         # This file
```

## 🔍 Key Findings

### Market Insights

1. **Oppo leads** in model count (129 models)
2. **Apple** highest avg price (€946.21)
3. **Budget dominates** - 35.5% under €300
4. **2025 trend:** Prices down 30%, battery up 6%

### Price Drivers

1. **Storage** - 56% correlation (strongest)
2. **RAM** - 44% correlation
3. **Weight** - 27.1% feature importance
4. **Cameras** - Weak correlation (surprising!)

### Best Value

- **Tecno Pop 9 64GB** - $89 (11.01 value score)
- **Infinix Smart HD** - $79 (10.43 value score)
- Budget segment offers best specs-to-price

## 🛠️ Troubleshooting

### Dataset Not Loading

```bash
# Verify file exists
ls data/Mobiles_Dataset_Final.csv

# Re-run preprocessing if needed
python fix_dataset_issues.py
```

### API Test Failing

```bash
# Check Python API is running
curl http://localhost:8000/health

# Restart if needed
cd python_api
python api.py
```

### Missing EUR Prices

```bash
# Re-run data fixing
python fix_dataset_issues.py

# Verify EUR column exists
python -c "import pandas as pd; df = pd.read_csv('data/Mobiles_Dataset_Final.csv'); print(df.columns)"
```

## 📖 Documentation

- **Full details:** `IMPLEMENTATION_SUMMARY.md`
- **API docs:** `python_api/README.md`
- **Test guide:** `tests/README.md`

## ✅ Checklist

- [x] Dataset preprocessed
- [x] EUR prices added
- [x] Outliers fixed
- [x] Market analysis done
- [x] ML models trained
- [x] Insights extracted
- [x] API fixed
- [x] Tests passing

**Status:** Production Ready! 🎉
