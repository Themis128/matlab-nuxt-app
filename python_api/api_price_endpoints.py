"""
FastAPI endpoints for price fetching via APIs
Adds price lookup endpoints to the main API
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from price_apis import PriceAPIManager
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/price", tags=["Price APIs"])

# Initialize price API manager
price_manager = PriceAPIManager()


class PriceSearchRequest(BaseModel):
    """Request model for price search"""

    product_name: str = Field(..., description="Product name to search for", min_length=1)
    preferred_source: Optional[str] = Field(
        None, description="Preferred API source: 'google', 'amazon', or None for all"
    )
    country: Optional[str] = Field("de", description="Country code for search (de, fr, uk, etc.)")


class PriceSearchResponse(BaseModel):
    """Response model for price search"""

    price: float = Field(..., description="Product price")
    currency: str = Field(..., description="Currency code")
    source: str = Field(..., description="API source used")
    url: Optional[str] = Field(None, description="Product URL if available")
    title: Optional[str] = Field(None, description="Product title if available")
    found: bool = Field(..., description="Whether price was found")


class PriceStatsResponse(BaseModel):
    """Response model for API statistics"""

    google_shopping: dict
    amazon_paapi: dict
    price_comparison: dict
    any_configured: bool


@router.get("/search", response_model=PriceSearchResponse)
async def search_price(
    product_name: str = Query(..., description="Product name to search for"),
    preferred_source: Optional[str] = Query(None, description="Preferred API: 'google', 'amazon', or None"),
    country: str = Query("de", description="Country code"),
):
    """
    Search for product price using configured APIs

    Example:
        GET /api/price/search?product_name=iPhone%2015%20Pro&preferred_source=google
    """
    if not price_manager.is_any_configured():
        raise HTTPException(
            status_code=503, detail="No price APIs configured. Please set up API keys in environment variables."
        )

    result = price_manager.get_price(product_name, preferred_source)

    if result:
        return PriceSearchResponse(
            price=result["price"],
            currency=result.get("currency", "EUR"),
            source=result.get("source", "Unknown"),
            url=result.get("url"),
            title=result.get("title"),
            found=True,
        )
    else:
        return PriceSearchResponse(price=0.0, currency="EUR", source="None", url=None, title=None, found=False)


@router.post("/search", response_model=PriceSearchResponse)
async def search_price_post(request: PriceSearchRequest):
    """
    Search for product price using POST request

    Example:
        POST /api/price/search
        {
            "product_name": "iPhone 15 Pro",
            "preferred_source": "google",
            "country": "de"
        }
    """
    if not price_manager.is_any_configured():
        raise HTTPException(
            status_code=503, detail="No price APIs configured. Please set up API keys in environment variables."
        )

    result = price_manager.get_price(request.product_name, request.preferred_source)

    if result:
        return PriceSearchResponse(
            price=result["price"],
            currency=result.get("currency", "EUR"),
            source=result.get("source", "Unknown"),
            url=result.get("url"),
            title=result.get("title"),
            found=True,
        )
    else:
        return PriceSearchResponse(price=0.0, currency="EUR", source="None", url=None, title=None, found=False)


@router.get("/stats", response_model=PriceStatsResponse)
async def get_price_stats():
    """
    Get statistics about API usage

    Example:
        GET /api/price/stats
    """
    stats = price_manager.get_stats()
    return PriceStatsResponse(
        google_shopping=stats["google_shopping"],
        amazon_paapi=stats["amazon_paapi"],
        price_comparison=stats["price_comparison"],
        any_configured=price_manager.is_any_configured(),
    )


@router.get("/status")
async def get_price_api_status():
    """
    Check which APIs are configured and ready to use

    Example:
        GET /api/price/status
    """
    return {
        "google_shopping": {
            "configured": price_manager.google_shopping.is_configured(),
            "api_key_set": bool(price_manager.google_shopping.api_key),
            "search_engine_id_set": bool(price_manager.google_shopping.search_engine_id),
        },
        "amazon_paapi": {
            "configured": price_manager.amazon_paapi.is_configured(),
            "access_key_set": bool(price_manager.amazon_paapi.access_key),
            "secret_key_set": bool(price_manager.amazon_paapi.secret_key),
            "partner_tag_set": bool(price_manager.amazon_paapi.partner_tag),
        },
        "price_comparison": {"api_key_set": bool(price_manager.price_comparison.api_key)},
        "any_configured": price_manager.is_any_configured(),
    }
