# Standard library imports
from pathlib import Path
import tempfile
import requests

# Third-party imports
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from loguru import logger
from syft_core import Client
from syft_core.url import SyftBoxURL
from syft_rds import init_session

# Local imports
from .config import Settings, get_settings
from .models import ListDatasetsResponse, ListJobsResponse, Dataset as DatasetModel


# Dependency for getting client
async def get_client(settings: Settings = Depends(get_settings)) -> Client:
    try:
        return Client.load()
    except Exception as e:
        logger.error(f"Failed to load client: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize client")


v1_router = APIRouter(prefix="/v1", dependencies=[Depends(get_client)])


@v1_router.get(
    "/datasets",
    tags=["datasets"],
    summary="List all datasets",
    description="Retrieve a list of all available datasets in the system",
)
async def list_datasets(
    client: Client = Depends(get_client),
) -> ListDatasetsResponse:
    try:
        datasite_client = init_session(client.email)
        datasets = [
            DatasetModel.model_validate(dataset)
            for dataset in datasite_client.dataset.get_all()
        ]
        # TODO: temporary fix - rds' .dataset.create() doesn't take individual files as private and mock inputs
        # Also a None readme is not allowed. So manually fixing them here.
        for dataset in datasets:
            private_file_path = next(dataset.private_path.iterdir(), None)
            dataset.private = SyftBoxURL.from_path(private_file_path, client.workspace)
            mock_file_path = next(dataset.mock_path.iterdir(), None)
            dataset.mock = SyftBoxURL.from_path(mock_file_path, client.workspace)
            dataset.readme = None
            dataset.private_size = (
                private_file_path.stat().st_size if private_file_path else "1 B"
            )
            dataset.mock_size = (
                mock_file_path.stat().st_size if mock_file_path else "1 B"
            )
        return ListDatasetsResponse(datasets=datasets)
    except Exception as e:
        logger.error(f"Error listing datasets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@v1_router.post(
    "/datasets",
    tags=["datasets"],
    status_code=201,
    summary="Create a new dataset",
    description="Create a new dataset with a dataset file, name, and description",
)
async def create_dataset(
    dataset: UploadFile = File(..., description="The dataset file to upload"),
    name: str = Form(
        ..., min_length=1, max_length=100, description="The name of the dataset"
    ),
    description: str = Form(
        ...,
        max_length=350,
        description="Brief description of the dataset",
    ),
    client: Client = Depends(get_client),
) -> DatasetModel:
    try:
        datasite_client = init_session(client.email)

        # Validate file types if needed
        if not dataset.content_type:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {dataset.filename}",
            )

        # Save uploaded files
        with tempfile.TemporaryDirectory() as temp_dir:
            real_path = Path(temp_dir) / "real"
            real_path.mkdir(parents=True, exist_ok=True)
            real_dataset_path = real_path / f"{dataset.filename}"
            real_dataset_path.write_bytes(dataset.file.read())
            logger.debug(f"Uploaded dataset temporarily saved to: {real_dataset_path}")

            # TODO auto-generate mock dataset
            mock_path = Path(temp_dir) / "mock"
            mock_path.mkdir(parents=True, exist_ok=True)
            mock_dataset_path = mock_path / f"{dataset.filename}"

            # Hardcoded GitHub raw CSV URL
            github_csv_url = "https://raw.githubusercontent.com/OpenMined/datasets/refs/heads/main/enclave/crop_stock_data.csv"
            try:
                response = requests.get(github_csv_url)
                response.raise_for_status()
                mock_dataset_path.write_bytes(response.content)
                logger.debug(
                    f"Mock dataset downloaded  and saved to: {mock_dataset_path}"
                )
            except Exception as e:
                logger.error(f"Failed to download mock dataset: {e}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to download mock dataset from GitHub: {e}",
                )

            # TODO fix None bug in syft_rds/client/local_stores/dataset.py:274 (if not Path(description_path).exists())
            dummy_description_path = Path(temp_dir) / "dummy_description.txt"
            dummy_description_path.touch()

            dataset = datasite_client.dataset.create(
                name=name,
                summary=description,
                path=real_path,
                mock_path=mock_path,
                description_path=dummy_description_path,
            )
            logger.debug(f"Dataset created: {dataset}")
            return dataset
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating dataset: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@v1_router.get(
    "/jobs",
    tags=["jobs"],
    summary="List all jobs",
    description="Retrieve a list of all jobs in the system",
)
async def list_jobs(
    client: Client = Depends(get_client),
) -> ListJobsResponse:
    try:
        datasite_client = init_session(client.email)
        jobs = datasite_client.jobs.get_all()
        return ListJobsResponse(jobs=jobs)
    except Exception as e:
        logger.error(f"Error listing jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


api_router = APIRouter(prefix="/api")
api_router.include_router(v1_router)


# Add health check endpoint
@api_router.get(
    "/health",
    summary="Health check endpoint",
    description="Check if the API is running properly",
)
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
