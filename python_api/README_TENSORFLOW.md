# TensorFlow Models - Quick Reference

## 🚀 Training

```bash
cd python_api
python train_models.py
```

## 📊 Models Trained

1. **Price Predictor** - Predicts phone price
2. **RAM Predictor** - Predicts RAM capacity
3. **Battery Predictor** - Predicts battery capacity
4. **Brand Classifier** - Classifies phone brand

## ✅ Using Models

Models are automatically used by the API. No configuration needed!

```python
from predictions_tensorflow import predict_price

price = predict_price(8, 4000, 6.1, 174, 2024, 'Apple')
```

## 📁 Files

- `train_models.py` - Training script
- `predictions_tensorflow.py` - Prediction functions
- `trained_models/` - Saved models (after training)

## 🎯 Performance

Matches MATLAB model accuracy:

- Price: R² ≈ 0.98
- RAM: R² ≈ 0.95
- Battery: R² ≈ 0.94
- Brand: Accuracy ≈ 65%

See `TENSORFLOW_TRAINING_GUIDE.md` for details!
