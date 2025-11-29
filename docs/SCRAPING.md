# Web Scraping System

Automated data enrichment system for mobile phone dataset using multiple data sources.

## Overview

The scraping system adds **28 new features** to the existing dataset by collecting data from:

1. **GSMArena** - Detailed specs, display/camera details, user ratings
2. **Benchmark Sites** - AnTuTu, Geekbench performance scores
3. **Review Aggregators** - Amazon ratings, sentiment analysis

## Features Scraped

### Display Features (5)

- `refresh_rate` - Display refresh rate (Hz)
- `display_type` - Panel type (AMOLED, IPS LCD, etc.)
- `peak_brightness_nits` - Peak brightness
- `resolution` - Screen resolution

### Camera Features (6)

- `main_camera_mp` - Main camera megapixels
- `main_aperture` - Aperture (f/x.x)
- `sensor_size` - Image sensor size
- `has_ois` - Optical image stabilization
- `max_video` - Maximum video resolution (4K, 8K)
- `max_video_fps` - Maximum video framerate

### Battery & Charging (4)

- `charging_speed_w` - Wired charging power (watts)
- `wireless_charging_w` - Wireless charging power
- `has_reverse_charging` - Reverse wireless charging capability
- `endurance_rating_hours` - Battery endurance (hours)

### Build Quality (3)

- `glass_type` - Screen protection (Gorilla Glass, Ceramic Shield)
- `ip_rating` - Water resistance rating (IP67, IP68)
- `materials` - Build materials

### User Ratings (2)

- `gsmarena_rating` - GSMArena user score (1-10)
- `gsmarena_review_count` - Number of reviews

### Performance Benchmarks (4)

- `antutu_score` - AnTuTu benchmark score
- `geekbench_single` - Geekbench single-core score
- `geekbench_multi` - Geekbench multi-core score
- `performance_tier` - Tier (flagship, high-end, mid-range, budget, entry-level)

### Review Sentiment (4)

- `amazon_rating` - Amazon average rating (1-5 stars)
- `amazon_review_count` - Number of Amazon reviews
- `positive_sentiment_pct` - Percentage of positive reviews
- `negative_sentiment_pct` - Percentage of negative reviews

## Usage

### Quick Start

```powershell
# Scrape 10 phones with caching and merge with dataset
python scripts/scrapers/run_scrapers.py --limit 10 --populate-cache --merge

# Scrape all phones in dataset (takes time!)
python scripts/scrapers/run_scrapers.py --populate-cache --merge

# Scrape specific phones
python scripts/scrapers/run_scrapers.py --limit 5
```

### Command-Line Options

```powershell
--limit N           # Limit to N phones from dataset
--dataset PATH      # Custom dataset path
--output PATH       # Output path for scraped data
--merge             # Merge with original dataset
--populate-cache    # Pre-populate with known benchmark/review data
```

### Outputs

1. **`data/scraped_phone_data.json`** - Raw nested JSON data
2. **`data/scraped_phone_data.csv`** - Flattened tabular data (28 columns)
3. **`data/Mobiles Dataset (2025) - Enhanced.csv`** - Original dataset + scraped features (43 columns)
4. **`data/scraper_cache/`** - Cached results to avoid re-scraping

## Architecture

```
scripts/scrapers/
├── __init__.py                  # Package initialization
├── common.py                    # Shared utilities (rate limiting, parsing, caching)
├── gsmarena_scraper.py          # GSMArena scraper
├── benchmark_scraper.py         # Benchmark scores scraper
├── review_scraper.py            # Review & sentiment scraper
└── run_scrapers.py              # Main orchestrator
```

### Scraper Components

**`common.py`** - Shared utilities:

- Rate limiting (1.5-3s delays)
- HTTP request handling with retries
- HTML parsing with BeautifulSoup
- Text cleaning and number extraction
- JSON caching system
- Logging configuration

**`gsmarena_scraper.py`** - GSMArena.com scraper:

- Phone search by model name
- Display specs extraction
- Camera specs extraction
- Battery/charging details
- Build quality features
- User ratings

**`benchmark_scraper.py`** - Performance benchmarks:

- AnTuTu scores
- Geekbench single/multi-core scores
- Performance tier classification
- Supports known data population (8 phones pre-loaded)

**`review_scraper.py`** - Review aggregation:

- Amazon ratings (requires API in production)
- Review count
- Sentiment analysis (positive/neutral/negative percentages)
- Common keyword extraction
- Supports known data population (8 phones pre-loaded)

**`run_scrapers.py`** - Orchestrator:

- Loads dataset
- Runs all scrapers sequentially
- Flattens nested data
- Merges with original dataset
- Saves multiple output formats

## Data Flow

```
1. Load Dataset
   ↓
2. Extract Phone List (Company + Model Name)
   ↓
3. For each phone:
   a. Search GSMArena → Get URL
   b. Scrape GSMArena page → Extract specs
   c. Get benchmarks (from cache or API)
   d. Get reviews (from cache or API)
   ↓
4. Flatten nested JSON → CSV
   ↓
5. Merge with original dataset
   ↓
6. Save enhanced dataset
```

## Rate Limiting & Caching

**Rate Limiting:**

- Random delays: 1.5-3 seconds between requests
- Prevents IP bans and respects site policies
- Configurable per scraper

**Caching:**

- All scraped data cached in `data/scraper_cache/*.json`
- Cache persists between runs
- Re-use cached data with `--populate-cache`
- Manual cache: Edit JSON files directly

## Known Data

Pre-populated benchmark and review data for 8 popular phones:

1. Samsung Galaxy S24 Ultra
2. iPhone 15 Pro Max
3. Google Pixel 8 Pro
4. OnePlus 12
5. Xiaomi 14 Pro
6. Samsung Galaxy A54
7. iPhone 14
8. Redmi Note 13 Pro

Use `--populate-cache` to load this data before scraping.

## Limitations & Notes

### GSMArena

- ⚠️ Currently has URL parsing issues (returns wrong product pages)
- ✅ HTML structure parsing works correctly
- **Fix needed**: Improve search result selector

### Benchmarks

- ⚠️ Real-time scraping not implemented (API required)
- ✅ Pre-populated data for 8 phones works
- **Alternative**: Manually populate `benchmark_cache.json`

### Reviews

- ⚠️ Amazon requires Product Advertising API
- ✅ Pre-populated data for 8 phones works
- **Alternative**: Use review aggregator sites or manual data entry

### Production Recommendations

1. Use official APIs (Amazon Product Advertising, GSMArena may not have public API)
2. Implement proper error handling for rate limits
3. Add proxy rotation for large-scale scraping
4. Consider paid data services (Keepa, CamelCamelCamel for pricing)
5. Respect robots.txt and site terms of service

## Example: Run Individual Scrapers

```powershell
# Test GSMArena scraper
cd scripts/scrapers
python gsmarena_scraper.py

# Populate benchmark cache
python benchmark_scraper.py

# Populate review cache
python review_scraper.py
```

## New Model Predictions Enabled

With 28 additional features, you can now create models for:

### Quality Score Prediction

**Input**: Benchmarks + ratings + build quality  
**Output**: Overall quality score (1-10)

### Photography Capability Score

**Input**: Camera specs (aperture, sensor size, OIS, video)  
**Output**: Camera quality score (1-10)

### Display Quality Score

**Input**: Refresh rate, brightness, type, resolution  
**Output**: Display quality tier

### User Satisfaction Prediction

**Input**: Review sentiment, ratings, review count  
**Output**: Predicted satisfaction level

### Longevity Score

**Input**: Build quality, materials, IP rating  
**Output**: Expected lifespan (years)

### Gaming Performance Classification

**Input**: Benchmarks, refresh rate, cooling  
**Output**: Gaming tier (casual, mid, high-end, pro)

## Troubleshooting

### No phones found

**Issue**: Dataset column names mismatch  
**Fix**: Check dataset has `Company Name` and `Model Name` columns

### URL parsing errors (GSMArena)

**Issue**: BeautifulSoup selector returns wrong element  
**Fix**: Update selector in `gsmarena_scraper.py` line 60

### Encoding errors

**Issue**: CSV contains non-UTF-8 characters  
**Fix**: Scraper tries cp1252, latin1, iso-8859-1 automatically

### Cache not loading

**Issue**: JSON files corrupted  
**Fix**: Delete `data/scraper_cache/` and re-run with `--populate-cache`

## Next Steps

1. **Fix GSMArena URL parsing** - Improve search result selector
2. **Add API integrations** - Implement official APIs for benchmarks/reviews
3. **Price tracking** - Create historical pricing scraper (Keepa, CamelCamelCamel)
4. **DxOMark scores** - Add camera/display/audio quality ratings
5. **iFixit repairability** - Add repairability scores
6. **Expand known data** - Manually populate more phones in caches

---

**Created**: November 29, 2025  
**Status**: ✅ Functional (with known data), ⚠️ Live scraping needs fixes
