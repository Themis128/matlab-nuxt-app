# Database Reference

## Overview

The application uses a **dual-database architecture** to handle different types of data:

1. **SQLite Database** (`price_database.db`) - Relational database for mobile phone price data
2. **LanceDB** - Multimodal vector database for CSV datasets, images, and semantic search

---

## 1. SQLite Database (Price Database)

### Purpose

Stores structured mobile phone data including specifications, prices across multiple regions, and product images.

### Location

- **File Path**: `python_api/price_database.db`
- **Type**: SQLite 3 database
- **Initialization**: Created via `python_api/create_price_db.py`

### Schema

#### Table: `mobile_prices`

```sql
CREATE TABLE IF NOT EXISTS mobile_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT,
    model TEXT,
    weight TEXT,
    ram TEXT,
    front_camera TEXT,
    back_camera TEXT,
    processor TEXT,
    battery TEXT,
    screen_size TEXT,
    price_pakistan REAL,
    price_india REAL,
    price_china REAL,
    price_usa REAL,
    price_dubai REAL,
    launched_year INTEGER,
    image_url TEXT,
    image_data BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Column Descriptions

| Column           | Type      | Description                                          |
| ---------------- | --------- | ---------------------------------------------------- |
| `id`             | INTEGER   | Primary key, auto-incrementing                       |
| `company`        | TEXT      | Mobile phone manufacturer (e.g., "Samsung", "Apple") |
| `model`          | TEXT      | Model name (e.g., "Galaxy S24", "iPhone 15")         |
| `weight`         | TEXT      | Device weight in grams                               |
| `ram`            | TEXT      | RAM capacity (e.g., "8GB", "12GB")                   |
| `front_camera`   | TEXT      | Front camera specifications                          |
| `back_camera`    | TEXT      | Rear camera specifications                           |
| `processor`      | TEXT      | Processor name/model                                 |
| `battery`        | TEXT      | Battery capacity (mAh)                               |
| `screen_size`    | TEXT      | Screen size in inches                                |
| `price_pakistan` | REAL      | Price in Pakistan (PKR)                              |
| `price_india`    | REAL      | Price in India (INR)                                 |
| `price_china`    | REAL      | Price in China (CNY)                                 |
| `price_usa`      | REAL      | Price in USA (USD)                                   |
| `price_dubai`    | REAL      | Price in Dubai (AED)                                 |
| `launched_year`  | INTEGER   | Year the device was launched                         |
| `image_url`      | TEXT      | URL to product image                                 |
| `image_data`     | BLOB      | Binary image data (optional)                         |
| `created_at`     | TIMESTAMP | Record creation timestamp                            |

### Data Source

- **Primary Source**: `data/Mobiles Dataset (2025).csv`
- **Population**: Automated via `create_price_db.py` script
- **Update Frequency**: Manual (run script when CSV is updated)

### Implementation

#### Database Connection Class

**File**: `python_api/price_apis.py`

```python
class LocalPriceDatabase:
    """Local SQLite database for price lookups"""

    def __init__(self):
        db_path = Path(__file__).parent / "price_database.db"
        self.conn = sqlite3.connect(str(db_path))
        self.conn.row_factory = sqlite3.Row
```

#### Key Methods

1. **`search_product(query: str, country: str = "usa")`**
   - Searches for products by name/model
   - Supports country-specific price lookups
   - Returns price and product information

2. **`get_product_details(company: str, model: str)`**
   - Retrieves complete product specifications
   - Includes all price regions and technical details

3. **`close()`**
   - Closes database connection

### Usage Example

```python
from price_apis import LocalPriceDatabase

# Initialize database
db = LocalPriceDatabase()

# Search for product
result = db.search_product("Samsung Galaxy S24", country="usa")
if result:
    print(f"Price: ${result['price']:.2f}")
    print(f"Source: {result['source']}")

# Get full product details
details = db.get_product_details("Samsung", "Galaxy S24")
if details:
    print(f"RAM: {details['ram']}")
    print(f"Battery: {details['battery']} mAh")
    print(f"USA Price: ${details['price_usa']:.2f}")

# Close connection
db.close()
```

### API Integration

The SQLite database is accessed through the following API endpoints:

- **`GET /api/products`** - List products with pagination
- **`GET /api/products/{company}/{model}`** - Get specific product details
- **`POST /api/advanced/compare`** - Compare multiple products

### Country Code Mapping

| Country Code | Database Column  | Currency |
| ------------ | ---------------- | -------- |
| `usa`        | `price_usa`      | USD      |
| `india`      | `price_india`    | INR      |
| `pakistan`   | `price_pakistan` | PKR      |
| `china`      | `price_china`    | CNY      |
| `dubai`      | `price_dubai`    | AED      |

---

## 2. LanceDB (Multimodal Vector Database)

### Purpose

Stores and searches multimodal data including:

- CSV datasets with metadata
- Images with embeddings
- Vector embeddings for semantic search
- Text content with vector representations

### Architecture

#### Deployment Modes

1. **Local OSS (Open Source)**
   - **Path**: `python_api/lancedb_data/`
   - **Storage**: Local file system
   - **Use Case**: Development, testing
   - **Configuration**: No environment variables required

2. **LanceDB Cloud (Production)**
   - **Storage**: Cloud-hosted managed service
   - **Use Case**: Production deployments
   - **Configuration**: Requires environment variables

### Configuration

#### Environment Variables

```bash
# Cloud Deployment (Production)
LANCEDB_CLOUD_URI="your-cloud-database-uri"
LANCEDB_API_KEY="your-api-key"
LANCEDB_REGION="us-east-1"

# Ollama Configuration (for embeddings)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_EMBEDDING_MODEL="nomic-embed-text"
```

#### Local Deployment

```bash
# No configuration needed
# Data stored in: python_api/lancedb_data/
```

### Database Structure

#### Tables/Collections

1. **`csv_datasets`**
   - Stores CSV dataset metadata and samples
   - Schema: Dynamic (LanceDB schema-on-read)

2. **`images`**
   - Stores image files with embeddings
   - Includes metadata and tags

3. **`multimodal_index`**
   - Unified search index for all data types
   - Enables cross-modal search

4. **`vector_content`**
   - Stores text content with vector embeddings
   - Enables semantic search

### Schema Details

#### CSV Datasets Table

```python
{
    "id": str,                    # Unique dataset ID
    "filename": str,              # Original filename
    "description": str,            # Dataset description
    "columns_json": str,           # JSON array of column names
    "row_count": int,              # Number of rows
    "data_types_json": str,        # JSON object of column types
    "sample_data_json": str,        # JSON array of sample rows
    "upload_date": str,            # ISO timestamp
    "tags_json": str,              # JSON array of tags
    "metadata_json": str           # JSON object of additional metadata
}
```

#### Images Table

```python
{
    "id": str,                     # Unique image ID
    "filename": str,               # Original filename
    "description": str,            # Image description
    "image_data": bytes,           # Binary image data
    "image_url": str,              # URL to image
    "width": int,                  # Image width
    "height": int,                 # Image height
    "format": str,                 # Image format (JPEG, PNG, etc.)
    "upload_date": str,            # ISO timestamp
    "tags_json": str,              # JSON array of tags
    "metadata_json": str,         # JSON object of metadata
    "embedding": List[float]       # Vector embedding (if available)
}
```

#### Multimodal Index

```python
{
    "id": str,                     # Unique content ID
    "content_type": str,           # "csv", "image", or "text"
    "content_id": str,             # Reference to original content
    "text_content": str,           # Searchable text
    "embedding": List[float],      # Vector embedding
    "metadata_json": str           # JSON metadata
}
```

### Implementation

#### Database Manager Class

**File**: `python_api/lancedb_utils.py`

```python
class LanceDBManager:
    """LanceDB manager for multimodal data operations"""

    def __init__(
        self,
        db_path: str = "./lancedb_data",
        cloud_uri: str = None,
        api_key: str = None,
        region: str = "us-east-1",
        ollama_base_url: str = None,
        ollama_model: str = None,
    ):
        # Initialize connection (cloud or local)
```

#### Key Methods

1. **`store_csv_dataset(file_path, description, tags, metadata)`**
   - Stores CSV file with metadata
   - Analyzes data types and creates samples
   - Returns dataset ID

2. **`store_image(file_path, description, tags, metadata)`**
   - Stores image with embeddings
   - Generates vector embeddings if Ollama available
   - Returns image ID

3. **`get_all_datasets(limit)`**
   - Retrieves all stored datasets
   - Returns list of dataset records

4. **`get_all_images(limit)`**
   - Retrieves all stored images
   - Returns list of image records

5. **`search_datasets(query, tags, limit)`**
   - Text-based search across datasets
   - Supports tag filtering

6. **`search_images(query, tags, limit)`**
   - Text-based search across images
   - Supports tag filtering

7. **`semantic_search(query, limit)`**
   - Vector similarity search
   - Uses embeddings for semantic matching

8. **`generate_embedding(text)`**
   - Generates vector embedding for text
   - Uses Ollama embeddings if available

9. **`embed_and_store_text(text, metadata)`**
   - Stores text with generated embeddings
   - Enables semantic search

### Embeddings

#### Ollama Integration

The system uses **Ollama** for generating text embeddings:

- **Model**: `nomic-embed-text` (default)
- **Base URL**: Configurable via `OLLAMA_BASE_URL`
- **Purpose**: Generate vector embeddings for semantic search

#### Embedding Dimensions

- **Text Embeddings**: 768 dimensions (nomic-embed-text)
- **Image Embeddings**: Generated from image features (if available)

### API Endpoints

#### Dataset Management

- **`POST /api/lancedb/datasets/upload`** - Upload CSV dataset
- **`GET /api/lancedb/datasets`** - List all datasets
- **`GET /api/lancedb/datasets/{id}`** - Get specific dataset
- **`DELETE /api/lancedb/datasets/{id}`** - Delete dataset
- **`POST /api/lancedb/datasets/search`** - Search datasets

#### Image Management

- **`POST /api/lancedb/images/upload`** - Upload image
- **`GET /api/lancedb/images`** - List all images
- **`GET /api/lancedb/images/{id}`** - Get specific image
- **`DELETE /api/lancedb/images/{id}`** - Delete image
- **`POST /api/lancedb/images/search`** - Search images

#### Vector Search

- **`POST /api/lancedb/vector/search`** - Vector similarity search
- **`POST /api/lancedb/embeddings/generate`** - Generate text embedding
- **`POST /api/lancedb/embeddings/store`** - Store text with embedding
- **`POST /api/lancedb/semantic/search`** - Semantic text search

#### Table Management

- **`POST /api/lancedb/tables`** - Create table
- **`GET /api/lancedb/tables`** - List all tables
- **`DELETE /api/lancedb/tables/{name}`** - Drop table
- **`PUT /api/lancedb/tables/{name}/schema`** - Alter table schema

#### Health & Statistics

- **`GET /api/lancedb/health`** - Database health check
- **`GET /api/lancedb/stats`** - Database statistics

### Usage Examples

#### Store CSV Dataset

```python
from lancedb_utils import get_db_manager

db = get_db_manager()

dataset_id = db.store_csv_dataset(
    file_path="data/mobiles.csv",
    description="Mobile phone dataset 2025",
    tags=["mobile", "phones", "2025"],
    metadata={"source": "internal", "version": "1.0"}
)

print(f"Dataset stored with ID: {dataset_id}")
```

#### Store Image

```python
image_id = db.store_image(
    file_path="images/samsung_galaxy_s24.jpg",
    description="Samsung Galaxy S24 product image",
    tags=["samsung", "galaxy", "product"],
    metadata={"brand": "Samsung", "model": "Galaxy S24"}
)

print(f"Image stored with ID: {image_id}")
```

#### Semantic Search

```python
# Search for similar content
results = db.semantic_search(
    query="high-end smartphone with large battery",
    limit=10
)

for result in results:
    print(f"Found: {result['text_content']}")
    print(f"Similarity: {result.get('score', 'N/A')}")
```

#### Generate Embedding

```python
# Generate embedding for text
embedding = db.generate_embedding(
    "Samsung Galaxy S24 Ultra with 200MP camera"
)

print(f"Embedding dimensions: {len(embedding)}")
```

### Data Pipeline

#### Automated Loading

**File**: `python_api/data_pipeline.py`

The data pipeline automatically:

1. Loads CSV files from `data/` directory
2. Processes images from `public/mobile_images/`
3. Creates relationships between datasets and images
4. Generates embeddings for searchable content

#### Usage

```bash
# Load all data
python python_api/data_pipeline.py --csv-dir data/ --image-dir public/mobile_images/

# Load specific dataset
python python_api/data_pipeline.py --csv-file data/mobiles.csv
```

### Performance Considerations

#### Local OSS

- **Storage**: File-based, limited by disk space
- **Speed**: Fast for small to medium datasets
- **Scalability**: Limited to single machine

#### Cloud Deployment

- **Storage**: Scalable cloud storage
- **Speed**: Optimized for large datasets
- **Scalability**: Automatic scaling
- **Features**: High availability, backups, monitoring

### Migration

#### Local to Cloud

1. **Export local data** (if needed):

```python
from lancedb_utils import get_db_manager

db = get_db_manager()
# Export logic here
```

2. **Update environment variables**:

```bash
export LANCEDB_CLOUD_URI="your-cloud-uri"
export LANCEDB_API_KEY="your-api-key"
```

3. **Restart application** - Connection automatically switches to cloud

### Backup & Recovery

#### Local OSS

- **Backup**: Copy `lancedb_data/` directory
- **Recovery**: Restore directory from backup

#### Cloud

- **Backup**: Automated by LanceDB Cloud
- **Recovery**: Point-in-time recovery available
- **Monitoring**: Built-in performance monitoring

---

## Database Integration

### Connection Management

Both databases use connection pooling and lazy initialization:

- **SQLite**: Single connection per request (lightweight)
- **LanceDB**: Persistent connection (singleton pattern)

### Error Handling

Both implementations include:

- Connection retry logic
- Graceful degradation (fallback to in-memory for LanceDB)
- Comprehensive error logging

### Performance Optimization

1. **SQLite**:
   - Indexed searches on `company` and `model`
   - Row factory for efficient data access
   - Connection reuse

2. **LanceDB**:
   - Vector indexing for fast similarity search
   - Batch operations for bulk inserts
   - Embedding caching

---

## Maintenance

### SQLite Database

#### Recreate Database

```bash
cd python_api
python create_price_db.py
```

#### Backup

```bash
# Copy database file
cp price_database.db price_database.db.backup
```

#### Verify Integrity

```sql
PRAGMA integrity_check;
```

### LanceDB

#### Health Check

```bash
curl http://localhost:8000/api/lancedb/health
```

#### Statistics

```bash
curl http://localhost:8000/api/lancedb/stats
```

#### Compact Tables

```bash
curl -X POST http://localhost:8000/api/lancedb/tables/{table_name}/compact
```

---

## Troubleshooting

### SQLite Issues

**Problem**: Database locked

- **Solution**: Ensure connections are properly closed
- **Check**: No long-running transactions

**Problem**: Database file not found

- **Solution**: Run `create_price_db.py` to initialize

### LanceDB Issues

**Problem**: Ollama connection failed

- **Solution**: Check `OLLAMA_BASE_URL` environment variable
- **Check**: Ollama server is running

**Problem**: Cloud connection failed

- **Solution**: Verify `LANCEDB_CLOUD_URI` and `LANCEDB_API_KEY`
- **Check**: Network connectivity

**Problem**: Embeddings not generating

- **Solution**: Install Ollama and required model
- **Check**: `OLLAMA_EMBEDDING_MODEL` is correct

---

## Best Practices

1. **Always close SQLite connections** after use
2. **Use connection pooling** for high-traffic scenarios
3. **Index frequently queried columns** in SQLite
4. **Generate embeddings in batch** for LanceDB
5. **Use semantic search** for text queries in LanceDB
6. **Backup databases regularly** before major updates
7. **Monitor database size** and performance metrics

---

## References

- **SQLite Documentation**: https://www.sqlite.org/docs.html
- **LanceDB Documentation**: https://lancedb.github.io/lancedb/
- **Ollama Documentation**: https://ollama.ai/docs
