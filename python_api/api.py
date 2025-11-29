"""
FastAPI server for Python prediction endpoints
Replaces MATLAB API endpoints
"""

import sys
import os
# Set default encoding to UTF-8 for Windows compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import logging

# Import API endpoints
try:
    from api_price_endpoints import router as price_router
    PRICE_APIS_AVAILABLE = True
except ImportError:
    PRICE_APIS_AVAILABLE = False
    print("[WARN] Price API endpoints not available (api_price_endpoints.py not found)")

try:
    from dataset_endpoints import router as dataset_router
    DATASET_APIS_AVAILABLE = True
except ImportError:
    DATASET_APIS_AVAILABLE = False
    print("[WARN] Dataset API endpoints not available (dataset_endpoints.py not found)")

# Try scikit-learn predictions first (works with Python 3.14), then TensorFlow, then basic
try:
    from predictions_sklearn import predict_price, predict_ram, predict_battery, predict_brand
    print("[OK] Using scikit-learn models for predictions")
except ImportError:
    try:
        from predictions_tensorflow import predict_price, predict_ram, predict_battery, predict_brand
        print("[OK] Using TensorFlow models for predictions")
    except ImportError:
        # Fallback to basic predictions
        from predictions import predict_price, predict_ram, predict_battery, predict_brand
        print("[WARN] Using basic predictions (trained models not available)")

# Configure logging for verbose output
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Set uvicorn loggers to DEBUG level for verbose output
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.setLevel(logging.DEBUG)
uvicorn_access_logger = logging.getLogger("uvicorn.access")
uvicorn_access_logger.setLevel(logging.DEBUG)

app = FastAPI(title="Mobile Phone Prediction API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints if available
if PRICE_APIS_AVAILABLE:
    app.include_router(price_router)
    print("[OK] Price API endpoints loaded")

if DATASET_APIS_AVAILABLE:
    app.include_router(dataset_router)
    print("[OK] Dataset API endpoints loaded")


# Request/Response models
class PriceRequest(BaseModel):
    ram: float = Field(..., description="RAM in GB", ge=1, le=24)
    battery: float = Field(..., description="Battery capacity in mAh", ge=2000, le=7000)
    screen: float = Field(..., description="Screen size in inches", ge=4, le=8)
    weight: float = Field(..., description="Weight in grams", ge=100, le=300)
    year: int = Field(..., description="Launch year", ge=2020, le=2025)
    company: str = Field(..., description="Company name")
    front_camera: Optional[float] = Field(None, description="Front camera in MP", ge=0, le=100)
    back_camera: Optional[float] = Field(None, description="Back camera in MP", ge=0, le=200)
    processor: Optional[str] = Field(None, description="Processor name (e.g., 'A17 Bionic', 'Snapdragon 8 Gen 2')")
    storage: Optional[float] = Field(None, description="Storage capacity in GB", ge=32, le=2048)


class PriceResponse(BaseModel):
    price: float


class RamRequest(BaseModel):
    battery: float = Field(..., description="Battery capacity in mAh", ge=2000, le=7000)
    screen: float = Field(..., description="Screen size in inches", ge=4, le=8)
    weight: float = Field(..., description="Weight in grams", ge=100, le=300)
    year: int = Field(..., description="Launch year", ge=2020, le=2025)
    price: float = Field(..., description="Price in USD", ge=100, le=5000)
    company: str = Field(..., description="Company name")
    front_camera: Optional[float] = Field(None, description="Front camera in MP", ge=0, le=100)
    back_camera: Optional[float] = Field(None, description="Back camera in MP", ge=0, le=200)
    processor: Optional[str] = Field(None, description="Processor name")
    storage: Optional[float] = Field(None, description="Storage capacity in GB", ge=32, le=2048)


class RamResponse(BaseModel):
    ram: float


class BatteryRequest(BaseModel):
    ram: float = Field(..., description="RAM in GB", ge=1, le=24)
    screen: float = Field(..., description="Screen size in inches", ge=4, le=8)
    weight: float = Field(..., description="Weight in grams", ge=100, le=300)
    year: int = Field(..., description="Launch year", ge=2020, le=2025)
    price: float = Field(..., description="Price in USD", ge=100, le=5000)
    company: str = Field(..., description="Company name")
    front_camera: Optional[float] = Field(None, description="Front camera in MP", ge=0, le=100)
    back_camera: Optional[float] = Field(None, description="Back camera in MP", ge=0, le=200)
    processor: Optional[str] = Field(None, description="Processor name")
    storage: Optional[float] = Field(None, description="Storage capacity in GB", ge=32, le=2048)


class BatteryResponse(BaseModel):
    battery: float


class BrandRequest(BaseModel):
    ram: float = Field(..., description="RAM in GB", ge=1, le=24)
    battery: float = Field(..., description="Battery capacity in mAh", ge=2000, le=7000)
    screen: float = Field(..., description="Screen size in inches", ge=4, le=8)
    weight: float = Field(..., description="Weight in grams", ge=100, le=300)
    year: int = Field(..., description="Launch year", ge=2020, le=2025)
    price: float = Field(..., description="Price in USD", ge=100, le=5000)
    front_camera: Optional[float] = Field(None, description="Front camera in MP", ge=0, le=100)
    back_camera: Optional[float] = Field(None, description="Back camera in MP", ge=0, le=200)
    processor: Optional[str] = Field(None, description="Processor name")
    storage: Optional[float] = Field(None, description="Storage capacity in GB", ge=32, le=2048)


class BrandResponse(BaseModel):
    brand: str


# Health check
@app.get("/")
async def root():
    return {"message": "Mobile Phone Prediction API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Prediction endpoints
@app.post("/api/predict/price", response_model=PriceResponse)
async def predict_price_endpoint(request: PriceRequest):
    """Predict mobile phone price"""
    try:
        price = predict_price(
            request.ram,
            request.battery,
            request.screen,
            request.weight,
            request.year,
            request.company,
            front_camera=request.front_camera,
            back_camera=request.back_camera,
            processor=request.processor,
            storage=request.storage
        )
        return PriceResponse(price=round(price))
    except Exception as e:
        # Ensure error message is ASCII-safe for Windows compatibility
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        if not error_msg:
            error_msg = "Prediction failed"
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/predict/ram", response_model=RamResponse)
async def predict_ram_endpoint(request: RamRequest):
    """Predict RAM capacity"""
    try:
        ram = predict_ram(
            request.battery,
            request.screen,
            request.weight,
            request.year,
            request.price,
            request.company,
            front_camera=request.front_camera,
            back_camera=request.back_camera,
            processor=request.processor,
            storage=request.storage
        )
        return RamResponse(ram=round(ram, 1))
    except Exception as e:
        # Ensure error message is ASCII-safe for Windows compatibility
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        if not error_msg:
            error_msg = "Prediction failed"
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/predict/battery", response_model=BatteryResponse)
async def predict_battery_endpoint(request: BatteryRequest):
    """Predict battery capacity"""
    try:
        battery = predict_battery(
            request.ram,
            request.screen,
            request.weight,
            request.year,
            request.price,
            request.company,
            front_camera=request.front_camera,
            back_camera=request.back_camera,
            processor=request.processor,
            storage=request.storage
        )
        return BatteryResponse(battery=round(battery))
    except Exception as e:
        # Ensure error message is ASCII-safe for Windows compatibility
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        if not error_msg:
            error_msg = "Prediction failed"
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/predict/brand", response_model=BrandResponse)
async def predict_brand_endpoint(request: BrandRequest):
    """Predict brand"""
    try:
        brand = predict_brand(
            request.ram,
            request.battery,
            request.screen,
            request.weight,
            request.year,
            request.price,
            front_camera=request.front_camera,
            back_camera=request.back_camera,
            processor=request.processor,
            storage=request.storage
        )
        return BrandResponse(brand=brand)
    except Exception as e:
        # Ensure error message is ASCII-safe for Windows compatibility
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        if not error_msg:
            error_msg = "Prediction failed"
        raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    # Run on specified port with verbose logging
    port = 8000
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="debug",
        access_log=True,
        reload=False
    )
