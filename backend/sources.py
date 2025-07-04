import json
from pydantic import BaseModel, HttpUrl
from syft_core import Client

from .config import get_settings


class ShopifySource(BaseModel):
    store_url: HttpUrl
    pat: str


type SourcesConfig = dict[str, ShopifySource]


def find_source(dataset_uid: str):
    sources = load_sources()

    return sources.get(dataset_uid, None)


def get_sources_config_path():
    syftbox_client = Client.load()
    app_settings = get_settings()

    sources_config_path = (
        syftbox_client.workspace.data_dir
        / "private"
        / app_settings.app_name
        / "dataset-sources.json"
    )

    return sources_config_path


def load_sources() -> SourcesConfig:
    sources_config_path = get_sources_config_path()

    if not sources_config_path.is_file():
        sources = {}
    else:
        with open(sources_config_path) as f:
            sources = json.load(f)

    return sources


def save_sources(sources: SourcesConfig):
    sources_config_path = get_sources_config_path()

    if not sources_config_path.is_file():
        sources_config_path.parent.mkdir(parents=True, exist_ok=True)

    with open(sources_config_path, "w") as f:
        json.dump(sources, f, indent=2)


def add_dataset_source(uid: str, source: ShopifySource):
    sources = load_sources()
    sources[uid] = source
    save_sources(sources)
