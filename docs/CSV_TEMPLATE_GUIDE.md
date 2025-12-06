# CSV Template Guide for Model Training

## Overview

This guide explains the CSV template format required for training all 41 models in the application.

## Template File

The template CSV file is located at: `data/mobile_dataset_template.csv`

## Required Columns

Your CSV file must include the following columns (exact names required):

### Core Information
- **Company Name** (required) - Brand/manufacturer name (e.g., "Samsung", "Apple", "Xiaomi")
- **Model Name** (required) - Full model name (e.g., "Galaxy S24 Ultra", "iPhone 15 Pro Max")
- **Launched Year** (required) - Year the phone was launched (e.g., 2024, 2023)

### Physical Specifications
- **Mobile Weight** (required) - Weight in grams (e.g., "233", "221 grams", "233g")
- **Screen Size** (required) - Screen size in inches (e.g., "6.8 inches", "6.8", "6.8\"")
- **RAM** (required) - RAM capacity (e.g., "12 GB", "8GB", "12")
- **Battery Capacity** (required) - Battery capacity in mAh (e.g., "5000 mAh", "5000", "5000mAh")
- **Storage** (optional) - Can be extracted from Model Name if not present (e.g., "128GB", "256GB")

### Camera Specifications
- **Front Camera** (optional but recommended) - Front camera in MP (e.g., "12 MP", "12", "12MP")
- **Back Camera** (optional but recommended) - Back camera in MP (e.g., "200 MP", "200", "200MP")

### Processor
- **Processor** (optional but recommended) - Processor name (e.g., "Snapdragon 8 Gen 3", "A17 Pro")

### Price Information (Multiple Currencies)
- **Launched Price (USA)** (required) - Price in USD (e.g., "$999", "999", "$999.99")
- **Launched Price (Pakistan)** (optional) - Price in PKR (e.g., "$1200", "1200")
- **Launched Price (India)** (optional) - Price in INR (e.g., "$100000", "100000")
- **Launched Price (China)** (optional) - Price in CNY (e.g., "$8000", "8000")
- **Launched Price (Dubai)** (optional) - Price in AED (e.g., "$4500", "4500")

## Column Format Examples

### Company Name
```
Samsung
Apple
Xiaomi
OnePlus
Google
```

### Model Name
```
Galaxy S24 Ultra
iPhone 15 Pro Max
Mi 14 Pro
OnePlus 12
Pixel 8 Pro
```

### Mobile Weight
```
233
221 grams
233g
221
```

### RAM
```
12 GB
8GB
12
8 GB
```

### Battery Capacity
```
5000 mAh
5000
5000mAh
4441 mAh
```

### Screen Size
```
6.8 inches
6.8
6.8"
6.7 inches
```

### Front Camera / Back Camera
```
12 MP
12
12MP
200 MP
48 MP
```

### Processor
```
Snapdragon 8 Gen 3
A17 Pro
Snapdragon 8 Gen 2
MediaTek Dimensity 9300
```

### Launched Year
```
2024
2023
2022
```

### Price Columns
```
$999
999
$999.99
1200
$1200
```

## CSV Format Requirements

1. **Encoding**: UTF-8 or Latin-1 (both are supported)
2. **Delimiter**: Comma (`,`)
3. **Header Row**: First row must contain column names (exact names as listed above)
4. **Quotes**: Optional, but recommended for values with commas
5. **Missing Values**: Leave empty or use `NA`, `N/A`, or blank

## Example CSV Row

```csv
Company Name,Model Name,Mobile Weight,RAM,Front Camera,Back Camera,Processor,Battery Capacity,Screen Size,Launched Price (Pakistan),Launched Price (India),Launched Price (China),Launched Price (USA),Launched Price (Dubai),Launched Year
Samsung,Galaxy S24 Ultra,233,12 GB,12 MP,200 MP,Snapdragon 8 Gen 3,5000 mAh,6.8 inches,$1200,$100000,$8000,$999,$4500,2024
```

## Data Validation

The system automatically:
- ✅ Parses numbers from text (e.g., "12 GB" → 12)
- ✅ Handles different formats (e.g., "6.8 inches" → 6.8)
- ✅ Extracts storage from model name if not present
- ✅ Converts prices to numeric values
- ✅ Handles missing optional fields

## Minimum Required Columns

For basic model training, you need at minimum:
- Company Name
- Model Name
- Mobile Weight
- RAM
- Battery Capacity
- Screen Size
- Launched Price (USA)
- Launched Year

## Optional Columns (Recommended)

These improve model accuracy:
- Front Camera
- Back Camera
- Processor
- Storage (or include in Model Name)
- Additional price columns (Pakistan, India, China, Dubai)

## Upload Process

1. **Prepare CSV**: Use the template format
2. **Save File**: Save as CSV (UTF-8 or Latin-1 encoding)
3. **Upload**: Place in `data/` directory or specify path
4. **Run Training**: Execute `python create_price_db.py`
5. **All Models Train**: All 41 models train automatically!

## File Location

Place your CSV file in one of these locations:
- `data/Mobiles Dataset (2025).csv` (default)
- `Mobiles Dataset (2025).csv` (root directory)
- Any custom path (specify in script)

## Troubleshooting

### CSV Not Loading
- Check column names match exactly (case-sensitive)
- Verify encoding (try UTF-8 or Latin-1)
- Ensure no special characters break the format

### Missing Data
- Optional columns can be empty
- Required columns must have values
- System will skip rows with critical missing data

### Price Parsing Issues
- Use numeric format or currency symbols
- Avoid complex formats (e.g., "USD $999")
- Simple formats work best: "$999" or "999"

### Model Name Issues
- Include storage in model name if not separate column
- Format: "iPhone 15 Pro Max 256GB"
- System extracts storage automatically

## Best Practices

1. **Consistent Format**: Use same format for all rows
2. **Complete Data**: Fill all available fields for better accuracy
3. **Valid Values**: Ensure numeric fields are parseable
4. **No Duplicates**: Each row should be unique
5. **Recent Data**: Include latest models for better predictions

## Template Download

Download the template from: `data/mobile_dataset_template.csv`

Or create your own using the column structure above.

## Next Steps

1. ✅ Download template: `data/mobile_dataset_template.csv`
2. ✅ Fill with your data
3. ✅ Save as CSV (UTF-8 encoding)
4. ✅ Place in `data/` directory
5. ✅ Run: `python create_price_db.py`
6. ✅ All 41 models train automatically!
