"""
Pytest configuration for FastAPI tests
"""

import os
import sys

import pytest

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))


@pytest.fixture(scope="session")
def anyio_backend():
    """Configure async backend for pytest-asyncio"""
    return "asyncio"
