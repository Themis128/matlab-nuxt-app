#!/bin/bash

# Download Mobiles Dataset from Kaggle
# Make sure you have kaggle CLI installed and configured

echo "Downloading mobiles dataset from Kaggle..."
kaggle datasets download abdulmalik1518/mobiles-dataset-2025

echo "Extracting dataset..."
unzip -q mobiles-dataset-2025.zip -d mobiles_dataset

echo "Dataset downloaded and extracted to mobiles_dataset/ folder"
echo "Listing contents..."
ls -la mobiles_dataset/
