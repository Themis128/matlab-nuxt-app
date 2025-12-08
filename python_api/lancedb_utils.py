"""
LanceDB utilities for multimodal data storage and retrieval
Handles CSV datasets and images with vector search capabilities
"""

import os

try:
    import lancedb

    _HAS_LANCEDB = True
except Exception:  # pragma: no cover - optional dependency
    lancedb = None
    _HAS_LANCEDB = False
import base64
import hashlib
import io
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
import requests
from PIL import Image

logger = logging.getLogger(__name__)


def sanitize_filter_value(value: str) -> str:
    """
    Sanitize filter values to prevent injection attacks.
    Escapes single quotes and removes dangerous characters.
    """
    if not isinstance(value, str):
        return str(value)
    # Escape single quotes and remove control characters
    sanitized = value.replace("'", "''").replace("\\", "\\\\")
    # Remove characters that could be used for injection
    sanitized = ''.join(c for c in sanitized if c.isprintable() or c.isspace())
    return sanitized.strip()


def sanitize_identifier(identifier: str) -> str:
    """
    Sanitize identifiers (like dataset_id, image_id) to prevent injection.
    Only allows alphanumeric, dash, underscore, and dot characters.
    """
    if not isinstance(identifier, str):
        raise ValueError(f"Invalid identifier type: {type(identifier)}")
    # Only allow safe characters for identifiers
    if not all(c.isalnum() or c in ('-', '_', '.') for c in identifier):
        raise ValueError(f"Invalid identifier format: {identifier}")
    return identifier


def sanitize_filter_value(value: str) -> str:
    """
    Sanitize filter values to prevent injection attacks.
    Escapes single quotes and removes dangerous characters.
    """
    if not isinstance(value, str):
        return str(value)
    # Escape single quotes and remove control characters
    sanitized = value.replace("'", "''").replace("\\", "\\\\")
    # Remove characters that could be used for injection
    sanitized = ''.join(c for c in sanitized if c.isprintable() or c.isspace())
    return sanitized.strip()


def sanitize_identifier(identifier: str) -> str:
    """
    Sanitize identifiers (like dataset_id, image_id) to prevent injection.
    Only allows alphanumeric, dash, underscore, and dot characters.
    """
    if not isinstance(identifier, str):
        raise ValueError(f"Invalid identifier type: {type(identifier)}")
    # Only allow safe characters for identifiers
    if not all(c.isalnum() or c in ('-', '_', '.') for c in identifier):
        raise ValueError(f"Invalid identifier format: {identifier}")
    return identifier


class OllamaEmbeddings:
    """Ollama-based embeddings using local AI models"""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "nomic-embed-text"):
        """
        Initialize Ollama embeddings

        Args:
            base_url: Ollama server URL
            model: Embedding model name (e.g., 'nomic-embed-text', 'mxbai-embed-large')
        """
        self.base_url = base_url.rstrip("/")
        self.model = model
        self._check_ollama_connection()

    def _check_ollama_connection(self):
        """Check if Ollama server is running and model is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m["name"] for m in models]
                # Check if model exists (with or without tag)
                model_base = self.model.split(":")[0]
                available_models = [name.split(":")[0] for name in model_names]
                if model_base not in available_models:
                    logger.warning(f"Model '{self.model}' not found in Ollama. Available models: {model_names}")
                    logger.info(f"Pulling model '{self.model}'...")
                    self._pull_model()
                else:
                    logger.info(f"Ollama connection successful. Using model: {self.model}")
            else:
                raise Exception(f"Ollama server responded with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Cannot connect to Ollama server at {self.base_url}: {e}")
            logger.info("Make sure Ollama is running with: ollama serve")
            raise

    def _pull_model(self):
        """Pull the required model from Ollama"""
        try:
            response = requests.post(
                f"{self.base_url}/api/pull",
                json={"name": self.model},
                timeout=300,  # 5 minutes timeout for model download
            )
            if response.status_code == 200:
                logger.info(f"Successfully pulled model: {self.model}")
            else:
                raise Exception(f"Failed to pull model: {response.text}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to pull model {self.model}: {e}")
            raise

    def embed_text(self, text: str) -> List[float]:
        """
        Generate embeddings for text using Ollama

        Args:
            text: Input text to embed

        Returns:
            Embedding vector as list of floats
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings", json={"model": self.model, "prompt": text}, timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("embedding", [])
            else:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of input texts

        Returns:
            List of embedding vectors
        """
        embeddings = []
        for text in texts:
            try:
                embedding = self.embed_text(text)
                embeddings.append(embedding)
            except Exception as e:
                logger.error(f"Failed to embed text: {e}")
                # Return zero vector as fallback
                embeddings.append([0.0] * 768)  # Common embedding dimension
        return embeddings


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
        """
        Initialize LanceDB connection

        Args:
            db_path: Path to store LanceDB data (for OSS)
            cloud_uri: Cloud database URI (for Cloud/Enterprise)
            api_key: API key for cloud access
            region: AWS region for cloud deployment
            ollama_base_url: Ollama server URL for embeddings
            ollama_model: Ollama model for text embeddings
        """
        if cloud_uri and api_key:
            # LanceDB Cloud/Enterprise connection
            self.db_path = cloud_uri
            self.is_cloud = True
            if _HAS_LANCEDB:
                self.db = lancedb.connect(uri=cloud_uri, api_key=api_key, region=region)
                logger.info(f"Connected to LanceDB Cloud: {cloud_uri}")
            else:
                raise Exception("LanceDB library required for cloud connections")
        else:
            # LanceDB OSS local connection
            self.db_path = Path(db_path)
            self.db_path.mkdir(exist_ok=True)
            self.is_cloud = False
            if _HAS_LANCEDB:
                self.db = lancedb.connect(str(self.db_path))
                logger.info(f"Connected to LanceDB OSS: {self.db_path}")
            else:
                # Provide a lightweight in-memory fallback so the rest of the app
                # can function (searches will be best-effort and limited).
                logger.warning("LanceDB is not installed; using in-memory fallback for testing.")

            class _FakeTable:
                def __init__(self, records=None):
                    self.records = list(records or [])

                def add(self, recs):
                    self.records.extend(recs)

                def delete(self, expr):
                    # Very naive delete: remove by id equality expression
                    try:
                        key, val = expr.split("==")
                        key = key.strip().strip("'")
                        val = val.strip().strip("'")
                        self.records = [r for r in self.records if str(r.get(key)) != val]
                    except Exception:
                        self.records = []

                def search(self):
                    class _FakeSearch:
                        def __init__(self, records):
                            self._records = records
                            self._limit = 100

                        def where(self, expr=None):
                            return self

                        def limit(self, n):
                            self._limit = n
                            return self

                        def to_list(self):
                            return self._records[: self._limit]

                    return _FakeSearch(self.records)

            class _FakeDB:
                def __init__(self):
                    self._tables = {}

                def open_table(self, name):
                    if name in self._tables:
                        return self._tables[name]
                    raise Exception("Table not found")

                def create_table(self, name, records):
                    t = _FakeTable(records)
                    self._tables[name] = t
                    return t

                def table_names(self):
                    return list(self._tables.keys())

            self.db = _FakeDB()

        # Initialize Ollama embeddings
        try:
            self.embeddings = OllamaEmbeddings(base_url=ollama_base_url, model=ollama_model)
            logger.info(f"Ollama embeddings initialized with model: {ollama_model}")
        except Exception as e:
            logger.warning(f"Failed to initialize Ollama embeddings: {e}")
            logger.info("Embeddings functionality will be limited")
            self.embeddings = None

        self._initialize_tables()

    def _initialize_tables(self):
        """Initialize database tables for different data types"""
        # Note: LanceDB works better with dynamic schemas, so we'll create tables on first use
        # rather than pre-defining strict schemas
        pass

    def store_csv_dataset(
        self, file_path: str, description: str = "", tags: List[str] = None, metadata: Dict[str, Any] = None
    ) -> str:
        """
        Store a CSV dataset in LanceDB

        Args:
            file_path: Path to CSV file
            description: Description of the dataset
            tags: List of tags for categorization
            metadata: Additional metadata

        Returns:
            Dataset ID
        """
        try:
            # Read CSV file
            df = pd.read_csv(file_path)
            filename = Path(file_path).name

            # Generate unique ID
            dataset_id = f"dataset_{hashlib.sha256(filename.encode()).hexdigest()[:8]}"

            # Analyze data types and sample
            data_types = df.dtypes.astype(str).to_dict()
            sample_data = df.head(5).to_dict("records")
            columns = df.columns.tolist()

            # Prepare dataset record - store complex data as JSON strings for flexibility
            dataset_record = {
                "id": dataset_id,
                "filename": filename,
                "description": description or f"Dataset: {filename}",
                "columns_json": json.dumps(columns),
                "row_count": len(df),
                "data_types_json": json.dumps(data_types),
                "sample_data_json": json.dumps(sample_data),
                "upload_date": datetime.now().isoformat(),
                "tags_json": json.dumps(tags or []),
                "metadata_json": json.dumps(metadata or {}),
            }

            # Store in LanceDB (create table if it doesn't exist)
            try:
                table = self.db.open_table("csv_datasets")
            except Exception:
                # Table doesn't exist, create it with the first record
                table = self.db.create_table("csv_datasets", [dataset_record])
                return dataset_id

            table.add([dataset_record])

            # Also store in multimodal index for search
            self._add_to_multimodal_index(dataset_id, "csv", f"{description} {filename} {' '.join(columns)}")

            logger.info(f"Stored CSV dataset: {dataset_id}")
            return dataset_id

        except Exception as e:
            logger.error(f"Failed to store CSV dataset: {e}")
            raise

    def store_image(
        self, file_path: str, description: str = "", tags: List[str] = None, metadata: Dict[str, Any] = None
    ) -> str:
        """
        Store an image in LanceDB

        Args:
            file_path: Path to image file
            description: Description of the image
            tags: List of tags for categorization
            metadata: Additional metadata

        Returns:
            Image ID
        """
        try:
            # Read and process image
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode != "RGB":
                    img = img.convert("RGB")

                # Get image properties
                width, height = img.size
                format_name = img.format or "UNKNOWN"

                # Convert to base64
                buffer = io.BytesIO()
                img.save(buffer, format="JPEG")
                image_data = base64.b64encode(buffer.getvalue()).decode()

                # Generate hash for deduplication
                image_hash = hashlib.sha256(buffer.getvalue()).hexdigest()

            filename = Path(file_path).name
            file_size = os.path.getsize(file_path)

            # Generate unique ID
            image_id = f"img_{hashlib.sha256(f'{filename}{image_hash}'.encode()).hexdigest()[:8]}"

            # Prepare image record
            image_record = {
                "id": image_id,
                "filename": filename,
                "description": description or f"Image: {filename}",
                "image_data": image_data,
                "image_hash": image_hash,
                "width": width,
                "height": height,
                "format": format_name,
                "size_bytes": file_size,
                "upload_date": datetime.now().isoformat(),
                "tags": tags or [],
                "metadata": metadata or {},
                "vector_embedding": None,  # Placeholder for future embedding
            }

            # Store in LanceDB (create table if it doesn't exist)
            try:
                table = self.db.open_table("images")
            except Exception:
                # Table doesn't exist, create it with the first record
                table = self.db.create_table("images", [image_record])
                return image_id

            table.add([image_record])

            # Also store in multimodal index for search
            self._add_to_multimodal_index(image_id, "image", f"{description} {filename}")

            logger.info(f"Stored image: {image_id}")
            return image_id

        except Exception as e:
            logger.error(f"Failed to store image: {e}")
            raise

    def _add_to_multimodal_index(self, content_id: str, content_type: str, text_content: str):
        """Add content to multimodal search index"""
        try:
            index_record = {
                "id": f"idx_{content_id}",
                "content_type": content_type,
                "content_id": content_id,
                "text_content": text_content,
                "image_embedding": None,
                "metadata": {},
                "created_date": datetime.now().isoformat(),
            }

            table = self.db.open_table("multimodal_index")
            table.add([index_record])

        except Exception as e:
            logger.error(f"Failed to add to multimodal index: {e}")

    def search_datasets(self, query: str = "", tags: List[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search CSV datasets by text query and tags

        Args:
            query: Text search query
            tags: Filter by tags
            limit: Maximum results to return

        Returns:
            List of matching datasets
        """
        try:
            table = self.db.open_table("csv_datasets")

            # Build filter conditions
            conditions = []

            if query:
                # Simple text search in description and filename
                # Sanitize query to prevent injection
                sanitized_query = sanitize_filter_value(query)
                conditions.append(f"description LIKE '%{sanitized_query}%' OR filename LIKE '%{sanitized_query}%'")

            if tags:
                # SECURITY: Sanitize each tag to prevent injection
                sanitized_tags = [sanitize_filter_value(str(tag)) for tag in tags]
                tag_conditions = [f"'{tag}' in tags" for tag in sanitized_tags]
                conditions.append(f"({' | '.join(tag_conditions)})")

            filter_expr = " & ".join(conditions) if conditions else None

            if filter_expr:
                results = table.search().where(filter_expr).limit(limit).to_list()
            else:
                results = table.search().limit(limit).to_list()

            return results

        except Exception as e:
            logger.error(f"Failed to search datasets: {e}")
            return []

    def search_images(self, query: str = "", tags: List[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search images by text query and tags

        Args:
            query: Text search query
            tags: Filter by tags
            limit: Maximum results to return

        Returns:
            List of matching images
        """
        try:
            table = self.db.open_table("images")

            # Build filter conditions
            conditions = []

            if query:
                # Simple text search in description and filename
                # Sanitize query to prevent injection
                sanitized_query = sanitize_filter_value(query)
                conditions.append(
                    f"description.str.contains('{sanitized_query}', case=False) | filename.str.contains('{sanitized_query}', case=False)"
                )

            if tags:
                # SECURITY: Sanitize each tag to prevent injection
                sanitized_tags = [sanitize_filter_value(str(tag)) for tag in tags]
                tag_conditions = [f"'{tag}' in tags" for tag in sanitized_tags]
                conditions.append(f"({' | '.join(tag_conditions)})")

            filter_expr = " & ".join(conditions) if conditions else None

            if filter_expr:
                results = table.search().where(filter_expr).limit(limit).to_list()
            else:
                results = table.search().limit(limit).to_list()

            return results

        except Exception as e:
            logger.error(f"Failed to search images: {e}")
            return []

    def get_dataset_by_id(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get dataset by ID"""
        try:
            # Sanitize dataset_id to prevent injection
            sanitized_id = sanitize_identifier(dataset_id)
            table = self.db.open_table("csv_datasets")
            results = table.search().where(f"id == '{sanitized_id}'").limit(1).to_list()
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Failed to get dataset {dataset_id}: {e}")
            return None

    def get_image_by_id(self, image_id: str) -> Optional[Dict[str, Any]]:
        """Get image by ID"""
        try:
            # Sanitize image_id to prevent injection
            sanitized_id = sanitize_identifier(image_id)
            table = self.db.open_table("images")
            results = table.search().where(f"id == '{sanitized_id}'").limit(1).to_list()
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Failed to get image {image_id}: {e}")
            return None

    def get_all_datasets(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all datasets"""
        try:
            table = self.db.open_table("csv_datasets")
            return table.search().limit(limit).to_list()
        except Exception as e:
            logger.error(f"Failed to get all datasets: {e}")
            return []

    def get_all_images(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all images"""
        try:
            table = self.db.open_table("images")
            return table.search().limit(limit).to_list()
        except Exception as e:
            logger.error(f"Failed to get all images: {e}")
            return []

    def delete_dataset(self, dataset_id: str) -> bool:
        """Delete dataset by ID"""
        try:
            # Sanitize dataset_id to prevent injection
            sanitized_id = sanitize_identifier(dataset_id)
            table = self.db.open_table("csv_datasets")
            # LanceDB delete operation
            table.delete(f"id == '{sanitized_id}'")
            logger.info(f"Deleted dataset: {dataset_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete dataset {dataset_id}: {e}")
            return False

    def delete_image(self, image_id: str) -> bool:
        """Delete image by ID"""
        try:
            # Sanitize image_id to prevent injection
            sanitized_id = sanitize_identifier(image_id)
            table = self.db.open_table("images")
            table.delete(f"id == '{sanitized_id}'")
            logger.info(f"Deleted image: {image_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete image {image_id}: {e}")
            return False

    def vector_search(
        self, vector: List[float], limit: int = 10, metric: str = "L2", table_name: str = None
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search

        Args:
            vector: Query vector
            limit: Maximum results
            metric: Distance metric (L2, cosine, dot)
            table_name: Specific table to search (optional)

        Returns:
            Search results
        """
        try:
            if table_name:
                table = self.db.open_table(table_name)
                results = table.search(vector).metric(metric).limit(limit).to_pandas()
                return results.to_dict("records") if hasattr(results, "to_dict") else results
            else:
                # Cross-table search - search all tables with vector columns
                all_results = []
                for table_name in self.db.table_names():
                    try:
                        table = self.db.open_table(table_name)
                        # Check if table has vector data (simplified check)
                        results = table.search(vector).metric(metric).limit(limit).to_pandas()
                        if not results.empty:
                            table_results = results.to_dict("records")
                            # Add table name to results
                            for result in table_results:
                                result["_table"] = table_name
                            all_results.extend(table_results[:limit])
                    except Exception:
                        # Skip tables that don't support vector search
                        continue

                # Sort by score and limit
                all_results.sort(key=lambda x: x.get("_score", 0), reverse=True)
                return all_results[:limit]

        except Exception as e:
            logger.error(f"Failed to perform vector search: {e}")
            return []

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embeddings for text using Ollama

        Args:
            text: Input text to embed

        Returns:
            Embedding vector
        """
        if not self.embeddings:
            raise Exception("Ollama embeddings not initialized")
        return self.embeddings.embed_text(text)

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors
        """
        if not self.embeddings:
            raise Exception("Ollama embeddings not initialized")
        return self.embeddings.embed_batch(texts)

    def embed_and_store_text(self, text: str, metadata: Dict[str, Any] = None) -> str:
        """
        Generate embedding for text and store in vector table

        Args:
            text: Text to embed and store
            metadata: Additional metadata

        Returns:
            Content ID
        """
        try:
            # Generate embedding
            embedding = self.generate_embedding(text)

            # Create record
            content_id = f"text_{hashlib.sha256(text.encode()).hexdigest()[:8]}"
            record = {
                "id": content_id,
                "content_type": "text",
                "text_content": text,
                "vector_embedding": embedding,
                "metadata": metadata or {},
                "created_date": datetime.now().isoformat(),
            }

            # Store in vector table
            try:
                table = self.db.open_table("vector_content")
            except Exception:
                # Create table with vector column
                import pyarrow as pa

                schema = pa.schema(
                    [
                        pa.field("id", pa.string()),
                        pa.field("content_type", pa.string()),
                        pa.field("text_content", pa.string()),
                        pa.field("vector_embedding", pa.list_(pa.float32(), len(embedding))),
                        pa.field("metadata", pa.string()),  # JSON string
                        pa.field("created_date", pa.string()),
                    ]
                )
                table = self.db.create_table("vector_content", schema=schema)

            table.add([record])
            logger.info(f"Embedded and stored text content: {content_id}")
            return content_id

        except Exception as e:
            logger.error(f"Failed to embed and store text: {e}")
            raise

    def semantic_search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Perform semantic search using Ollama embeddings

        Args:
            query: Search query
            limit: Maximum results

        Returns:
            Search results with similarity scores
        """
        try:
            # Generate embedding for query
            query_embedding = self.generate_embedding(query)

            # Search vector table
            table = self.db.open_table("vector_content")
            results = table.search(query_embedding).limit(limit).to_pandas()

            return results.to_dict("records") if hasattr(results, "to_dict") else results

        except Exception as e:
            logger.error(f"Failed to perform semantic search: {e}")
            return []


# Global instance - configure for cloud or local
def _create_db_manager():
    """Create database manager with cloud or local configuration"""
    # Check for cloud configuration
    cloud_uri = os.environ.get("LANCEDB_CLOUD_URI")
    api_key = os.environ.get("LANCEDB_API_KEY")
    region = os.environ.get("LANCEDB_REGION", "us-east-1")

    # Ollama configuration
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model = os.environ.get("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")

    if cloud_uri and api_key:
        logger.info("Initializing LanceDB Cloud connection")
        return LanceDBManager(
            cloud_uri=cloud_uri,
            api_key=api_key,
            region=region,
            ollama_base_url=ollama_base_url,
            ollama_model=ollama_model,
        )
    else:
        logger.info("Initializing LanceDB OSS local connection")
        return LanceDBManager(db_path="./lancedb_data", ollama_base_url=ollama_base_url, ollama_model=ollama_model)


db_manager = _create_db_manager()


def get_db_manager() -> LanceDBManager:
    """Get the global LanceDB manager instance"""
    return db_manager
