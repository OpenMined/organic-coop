from fastapi import HTTPException
from loguru import logger
from syft_core import Client


async def get_client() -> Client:
    """Dependency for getting client"""
    try:
        return Client.load()
    except Exception as e:
        logger.error(f"Failed to load client: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize client")
