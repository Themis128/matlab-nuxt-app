# TensorFlow Model Training Guide

## 🎯 Overview

This guide shows you how to train TensorFlow/Keras models that replicate your MATLAB models for better accuracy and deployment on free hosting services.

## 📋 Prerequisites

```bash
pip install -r requirements.txt
```

Required packages:

- TensorFlow 2.15.0
- scikit-learn 1.3.2
- pandas 2.1.3
- numpy 1.24.3

## 🚀 Quick Start

### Step 1: Prepare Dataset

Make sure your CSV file is in the project root:

```
Mobiles Dataset (2025).csv
```

### Step 2: Train Models

```bash
cd python_api
python train_models.py
```

This will:

1. Load and preprocess the dataset
2. Train 4 models:
   - Price Prediction
   - RAM Prediction
   - Battery Prediction
   - Brand Classification
3. Save models to `python_api/trained_models/`

### Step 3: Use Trained Models

The prediction functions automatically use TensorFlow models if available:

```python
from predictions_tensorflow import predict_price

price = predict_price(8, 4000, 6.1, 174, 2024, 'Apple')
print(f"Predicted price: ${price}")
```

## 📊 Model Architectures

### Price Prediction Model

```
Input (24 features)
  ↓
Dense(128, relu) + Dropout(0.3)
  ↓
Dense(64, relu) + Dropout(0.2)
  ↓
Dense(32, relu)
  ↓
Dense(1)  # Regression output
```

### RAM/Battery Prediction Models

```
Input (N features)
  ↓
Dense(64, relu) + Dropout(0.3)
  ↓
Dense(32, relu)
  ↓
Dense(1)  # Regression output
```

### Brand Classification Model

```
Input (6 features)
  ↓
Dense(64, relu) + Dropout(0.3)
  ↓
Dense(32, relu)
  ↓
Dense(N_classes, softmax)  # Classification output
```

## 🔧 Training Parameters

- **Epochs**: 100 (with early stopping)
- **Batch Size**: 64
- **Optimizer**: Adam (learning_rate=0.001)
- **Loss**: MSE (regression), Sparse Categorical Crossentropy (classification)
- **Validation Split**: 15%
- **Test Split**: 15%

## 📁 Output Files

After training, you'll have:

```
python_api/trained_models/
├── price_predictor.h5              # TensorFlow model
├── price_predictor_metadata.json    # Normalization params, metrics
├── ram_predictor.h5
├── ram_predictor_metadata.json
├── battery_predictor.h5
├── battery_predictor_metadata.json
├── brand_classifier.h5
└── brand_classifier_metadata.json
```

## 📈 Expected Performance

Based on MATLAB models:

- **Price Prediction**: R² ≈ 0.98, RMSE ≈ $47
- **RAM Prediction**: R² ≈ 0.95, RMSE ≈ 0.60 GB
- **Battery Prediction**: R² ≈ 0.94, RMSE ≈ 142 mAh
- **Brand Classification**: Accuracy ≈ 65%

## 🎯 Usage in API

The FastAPI server automatically uses TensorFlow models:

```python
# In api.py
from predictions_tensorflow import predict_price, predict_ram, ...

# Models are loaded automatically on first import
```

## 🔄 Updating Models

To retrain with different parameters:

```python
# Edit train_models.py
train_price_model(data, epochs=150, batch_size=32)  # Custom parameters
```

## 🐛 Troubleshooting

### Out of Memory

- Reduce batch size: `batch_size=32`
- Reduce model size: fewer neurons in layers

### Poor Performance

- Train for more epochs
- Adjust learning rate
- Add more layers/neurons
- Check data quality

### Model Not Loading

- Check file paths
- Verify TensorFlow version
- Check model file exists

## 📚 Next Steps

1. ✅ Train models: `python train_models.py`
2. ✅ Test predictions: Use API or direct functions
3. ✅ Deploy: Models ready for cloud deployment
4. 🔮 Optimize: Tune hyperparameters for better accuracy

## 💡 Tips

- **GPU**: Training is faster with GPU (optional)
- **Early Stopping**: Prevents overfitting
- **Normalization**: Critical for good performance
- **Data Quality**: Clean data = better models

---

**Your TensorFlow models are ready for production! 🚀**
