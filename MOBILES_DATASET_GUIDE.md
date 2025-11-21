# Mobile Phones Dataset - Network Architecture Guide

## Dataset: abdulmalik1518/mobiles-dataset-2025

This guide helps you choose the right neural network architecture based on your dataset structure.

## Step 1: Analyze Your Dataset

First, run the analysis script to understand your data:
```matlab
run('analyze_mobiles_dataset.m')
```

Or download and check manually:
```bash
kaggle datasets download abdulmalik1518/mobiles-dataset-2025
unzip mobiles-dataset-2025.zip
```

## Step 2: Choose Network Based on Data Type

### Scenario A: Image Dataset (Phone Photos)

**If your dataset contains images of mobile phones:**

#### Recommended Networks:

1. **Convolutional Neural Network (CNN)** ✅
   - **Use for**: Classifying phone brand, model, or category
   - **Architecture**: Conv layers → Pooling → Fully Connected → Classification
   - **Example**: `examples/mobiles_cnn_classification.m`
   - **Advantages**: Learns visual features automatically
   - **Best for**: Brand/model recognition from photos

2. **Transfer Learning (Pretrained Networks)** ⭐ RECOMMENDED
   - **Use for**: Quick training with limited data
   - **Models**: ResNet50, MobileNetV2, EfficientNet
   - **Advantages**:
     - Pretrained on ImageNet (millions of images)
     - Faster training
     - Better accuracy with less data
   - **Best for**: Most image classification tasks

3. **Siamese Network**
   - **Use for**: Finding similar phones by image
   - **Architecture**: Twin CNNs with similarity comparison
   - **Best for**: Image similarity search

### Scenario B: Tabular Dataset (Specifications CSV)

**If your dataset contains phone specifications (RAM, Storage, Price, etc.):**

#### Recommended Networks:

1. **Fully Connected Neural Network (FCN/DNN)** ✅
   - **Use for**: Price prediction, feature prediction
   - **Architecture**: Input → Hidden layers → Output
   - **Example**: `examples/mobiles_tabular_regression.m`
   - **Tasks**:
     - **Regression**: Predict price from specifications
     - **Classification**: Classify brand from specs
     - **Feature Prediction**: Predict missing specifications

2. **Deep Neural Network with Dropout**
   - **Use for**: Complex relationships between features
   - **Architecture**: Multiple hidden layers with regularization
   - **Best for**: Non-linear feature relationships

### Scenario C: Both Images AND Tabular Data

**If your dataset has both images and specifications:**

#### Recommended Network:

1. **Hybrid Network** ⭐ BEST OPTION
   - **Use for**: Combining visual and specification features
   - **Architecture**:
     - Image Branch: CNN → Image features
     - Tabular Branch: FCN → Specification features
     - Fusion: Concatenate → Combined → Output
   - **Example**: `examples/mobiles_hybrid_network.m`
   - **Advantages**: Uses both visual and technical information
   - **Best for**: Most accurate predictions

## Common Tasks and Network Recommendations

### Task 1: Price Prediction
- **Data**: Specifications (RAM, Storage, Screen Size, etc.)
- **Network**: Fully Connected Neural Network (Regression)
- **Output**: Continuous value (price)
- **File**: `examples/mobiles_tabular_regression.m`

### Task 2: Brand Classification
- **Data**: Images OR Specifications
- **Network**:
  - Images → CNN or Transfer Learning
  - Specs → FCN
  - Both → Hybrid Network
- **Output**: Categorical (Samsung, Apple, etc.)
- **Files**: `examples/mobiles_cnn_classification.m` or `examples/mobiles_tabular_regression.m`

### Task 3: Model Recognition
- **Data**: Images
- **Network**: CNN or Transfer Learning (ResNet, MobileNet)
- **Output**: Phone model name
- **File**: `examples/mobiles_cnn_classification.m`

### Task 4: Feature Prediction
- **Data**: Some specifications
- **Network**: FCN (Regression or Classification)
- **Output**: Missing feature (e.g., predict RAM from other specs)
- **File**: `examples/mobiles_tabular_regression.m`

### Task 5: Similar Phone Search
- **Data**: Images
- **Network**: Siamese Network
- **Output**: Similarity score
- **Best for**: Recommendation systems

## Quick Decision Tree

```
Do you have images?
├─ YES → Do you have specifications too?
│  ├─ YES → Use Hybrid Network ⭐
│  └─ NO → Use CNN or Transfer Learning
│
└─ NO → Do you have tabular data?
   └─ YES → Use Fully Connected Network (FCN)
```

## Getting Started

1. **Download the dataset**:
   ```bash
   kaggle datasets download abdulmalik1518/mobiles-dataset-2025
   unzip mobiles-dataset-2025.zip
   ```

2. **Analyze the dataset**:
   ```matlab
   run('analyze_mobiles_dataset.m')
   ```

3. **Choose your network** based on data type:
   - Images only → `examples/mobiles_cnn_classification.m`
   - Tabular only → `examples/mobiles_tabular_regression.m`
   - Both → `examples/mobiles_hybrid_network.m`

4. **Prepare your data** and train!

## GPU Acceleration

Your RTX 3070 Laptop GPU (7.46 GB) will accelerate:
- ✅ CNN training (image processing)
- ✅ Transfer learning fine-tuning
- ✅ Hybrid network training
- ✅ Tabular network training

All examples are configured to use GPU automatically when available.

## Next Steps

1. Run `analyze_mobiles_dataset.m` to understand your data
2. Choose the appropriate example script
3. Modify for your specific task
4. Train and evaluate!
