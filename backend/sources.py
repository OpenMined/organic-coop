import json
from syft_core import Client

from .config import get_settings


def find_source(dataset_uid: str):
    sources = get_sources()

    return sources.get(dataset_uid, None)


def get_sources():
    syftbox_client = Client.load()
    app_settings = get_settings()

    sources_path = (
        syftbox_client.config_path.parent
        / app_settings.app_name
        / "datasets_sources.json"
    )

    if not sources_path.is_file():
        sources = {}
    else:
        with open(sources_path) as f:
            sources = json.load(f)

    return sources
