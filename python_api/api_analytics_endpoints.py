"""
FastAPI router for analytics endpoints
Provides metrics, usage stats, and model performance data
"""

import json
import os
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

router = APIRouter()

# Example: Load analytics data from a JSON file
ANALYTICS_PATH = os.path.join(os.path.dirname(__file__), "../data/dataset_analysis_results.json")


def load_analytics_data() -> Dict[str, Any]:
    try:
        with open(ANALYTICS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load analytics data: {e}")


@router.get("/analytics/summary", response_model=Dict[str, Any])
def get_analytics_summary():
    """Returns summary analytics data"""
    return load_analytics_data()


@router.get("/analytics/metrics", response_model=Dict[str, Any])
def get_analytics_metrics():
    """Returns model metrics (example stub)"""
    data = load_analytics_data()
    return data.get("metrics", {})


@router.get("/analytics/usage", response_model=Dict[str, Any])
def get_analytics_usage():
    """Returns usage statistics (example stub)"""
    data = load_analytics_data()
    return data.get("usage", {})


# Add more endpoints as needed for your analytics needs
