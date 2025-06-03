# Standard library imports
import json
from pathlib import Path

# Third-party imports
from fastapi import HTTPException
from loguru import logger
from syft_core import Client

# Local imports
from backend.config import Settings


def get_auto_approve_file_path(client: Client, settings: Settings) -> Path:
    return client.app_data(settings.app_name) / "auto_approve.json"


def get_auto_approve_file(client: Client, settings: Settings) -> dict[str, str]:
    """
    Get the path to the auto-approve file.
    If it doesn't exist, create it.
    """
    approve_file_path = get_auto_approve_file_path(client, settings)
    approve_file_path.parent.mkdir(
        parents=True, exist_ok=True
    )  # Ensure the directory exists
    if not approve_file_path.exists():
        approve_file_path.write_text("{}")  # Initialize with an empty JSON object

    # read the file and return it as a dictionary
    try:
        with open(approve_file_path, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        logger.error(
            "Failed to decode JSON from auto-approve file, returning empty dict"
        )
        return {}
    except Exception as e:
        logger.error(f"Error reading auto-approve file: {e}")
        raise HTTPException(status_code=500, detail="Failed to read auto-approve file")


def save_auto_approve_file(
    client: Client, settings: Settings, data: dict[str, str]
) -> None:
    """
    Save the auto-approve data to the file.
    """
    approve_file_path = get_auto_approve_file_path(client, settings)
    try:
        with open(approve_file_path, "w") as file:
            json.dump(data, file, indent=4)
        logger.debug(f"Auto-approve data saved to {approve_file_path}")
    except Exception as e:
        logger.error(f"Error saving auto-approve file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save auto-approve file")
