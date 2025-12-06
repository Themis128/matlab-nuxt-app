# CSV Upload Guide - Train All 41 Models

## Quick Start

1. **Download Template**: `data/mobile_dataset_template.csv`
2. **Fill with Your Data**: Use the template format
3. **Save as CSV**: UTF-8 or Latin-1 encoding
4. **Upload**: Place in `data/` directory
5. **Train**: Run `python create_price_db.py`
6. **Done**: All 41 models train automatically!

## CSV Template Location

```
data/mobile_dataset_template.csv
```

## Required Columns

Your CSV must have these exact column names:

### Required Columns
- `Company Name` - Brand name (e.g., "Samsung", "Apple")
- `Model Name` - Full model name (e.g., "Galaxy S24 Ultra")
- `Mobile Weight` - Weight in grams (e.g., "233", "233g")
- `RAM` - RAM capacity (e.g., "12 GB", "8GB")
- `Battery Capacity` - Battery in mAh (e.g., "5000 mAh", "5000")
- `Screen Size` - Screen size in inches (e.g., "6.8 inches", "6.8")
- `Launched Price (USA)` - Price in USD (e.g., "$999", "999")
- `Launched Year` - Year launched (e.g., "2024", "2023")

### Optional Columns (Recommended)
- `Front Camera` - Front camera in MP (e.g., "12 MP", "12")
- `Back Camera` - Back camera in MP (e.g., "200 MP", "200")
- `Processor` - Processor name (e.g., "Snapdragon 8 Gen 3")
- `Launched Price (Pakistan)` - Price in PKR
- `Launched Price (India)` - Price in INR
- `Launched Price (China)` - Price in CNY
- `Launched Price (Dubai)` - Price in AED

## Example CSV Format

```csv
Company Name,Model Name,Mobile Weight,RAM,Front Camera,Back Camera,Processor,Battery Capacity,Screen Size,Launched Price (Pakistan),Launched Price (India),Launched Price (China),Launched Price (USA),Launched Price (Dubai),Launched Year
Samsung,Galaxy S24 Ultra,233,12 GB,12 MP,200 MP,Snapdragon 8 Gen 3,5000 mAh,6.8 inches,$1200,$100000,$8000,$999,$4500,2024
Apple,iPhone 15 Pro Max,221,8 GB,12 MP,48 MP,A17 Pro,4441 mAh,6.7 inches,$1500,$134900,$9000,$1199,$5000,2023
```

## Data Format Tips

### Numbers
- System automatically extracts numbers from text
- "12 GB" → 12
- "6.8 inches" → 6.8
- "$999" → 999

### Missing Data
- Optional columns can be empty
- Required columns must have values
- Use blank cells or "N/A" for missing data

### Storage
- Can be in Model Name: "iPhone 15 Pro Max 256GB"
- System extracts automatically
- Or add separate "Storage" column

## Upload Process

### Step 1: Prepare CSV
- Use template: `data/mobile_dataset_template.csv`
- Fill with your data
- Save as CSV (UTF-8 encoding)

### Step 2: Place File
Put CSV in one of these locations:
- `data/Mobiles Dataset (2025).csv` (default)
- `Mobiles Dataset (2025).csv` (root)
- Custom path (specify in script)

### Step 3: Run Training
```bash
cd python_api
python create_price_db.py
```

### Step 4: Wait for Training
- Basic 4 models: ~2-5 minutes
- All 41 models: ~30-60 minutes
- Progress shown in console

## What Happens

1. ✅ CSV loaded → SQLite database
2. ✅ Images loaded → LanceDB (if available)
3. ✅ All 41 models train automatically
4. ✅ Models versioned and backed up
5. ✅ Rollback if scores worse
6. ✅ Notifications for each model

## Validation

The system automatically:
- ✅ Parses numbers from text
- ✅ Handles different formats
- ✅ Extracts storage from model name
- ✅ Converts prices to numeric
- ✅ Handles missing optional fields
- ✅ Skips invalid rows

## Troubleshooting

### CSV Not Loading
- Check column names match exactly (case-sensitive)
- Try UTF-8 or Latin-1 encoding
- Remove special characters

### Missing Data
- Optional columns can be empty
- Required columns must have values
- System skips rows with critical missing data

### Price Issues
- Use simple formats: "$999" or "999"
- Avoid complex formats: "USD $999"
- System extracts numbers automatically

## Best Practices

1. **Consistent Format**: Same format for all rows
2. **Complete Data**: Fill all available fields
3. **Valid Values**: Ensure numeric fields are parseable
4. **No Duplicates**: Each row should be unique
5. **Recent Data**: Include latest models

## Template Download

The template is at: `data/mobile_dataset_template.csv`

It includes:
- All required columns
- Example data rows
- Proper formatting
- Ready to use

## Next Steps

1. ✅ Download template
2. ✅ Fill with your data
3. ✅ Save as CSV
4. ✅ Upload to `data/` directory
5. ✅ Run `python create_price_db.py`
6. ✅ All 41 models train automatically!

## Support

For detailed documentation, see:
- `docs/CSV_TEMPLATE_GUIDE.md` - Complete guide
- `python_api/README_AUTO_TRAIN_ALL.md` - Training details
- `docs/DATA_PIPELINE.md` - Pipeline architecture
