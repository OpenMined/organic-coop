# Standard library imports
from pathlib import Path
import tempfile
from fastapi.responses import JSONResponse
import requests

# Third-party imports
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from loguru import logger
from syft_core import Client
from syft_core.url import SyftBoxURL
from syft_rds import init_session
from syft_rds.models.models import DatasetUpdate
from filelock import FileLock


# Local imports
from .config import Settings, get_settings
from .models import ListDatasetsResponse, ListJobsResponse, Dataset as DatasetModel
from .models import ListAutoApproveResponse
from .utils import (
    get_auto_approve_file,
    get_auto_approve_file_path,
    save_auto_approve_file,
)


# Dependency for getting client
async def get_client(settings: Settings = Depends(get_settings)) -> Client:
    try:
        return Client.load()
    except Exception as e:
        logger.error(f"Failed to load client: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize client")


v1_router = APIRouter(prefix="/v1", dependencies=[Depends(get_client)])

# --------------- Dataset Endpoints ---------------


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


@v1_router.put(
    "/datasets/{dataset_name}",
    tags=["datasets"],
    summary="Update a dataset",
    description="Update an existing dataset by its name",
)
async def update_dataset(
    dataset_name: str,
):
    pass


@v1_router.delete(
    "/datasets/{dataset_name}",
    tags=["datasets"],
    summary="Delete a dataset",
    description="Delete a dataset by its name",
)
async def delete_dataset(
    dataset_name: str,
    client: Client = Depends(get_client),
) -> JSONResponse:
    try:
        datasite_client = init_session(client.email)
        datasite_client.dataset.delete(dataset_name)
        logger.debug(f"Dataset {dataset_name} deleted successfully")
        return JSONResponse(
            content={"message": f"Dataset {dataset_name} deleted successfully"},
            status_code=200,
        )
    except Exception as e:
        logger.error(f"Error deleting dataset {dataset_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------

# --------------- Job Endpoints ---------------


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


# ---------------------------------------------------------------

# -------------------- Auto-approve Endpoints --------------------


@v1_router.post(
    "/auto-approve",
    tags=["auto-approve"],
    summary="Adds datasite to Auto-approve list ",
    description=" Adds the datasite to the auto-approve list",
)
async def auto_approve(
    client: Client = Depends(get_client),
    settings: Settings = Depends(get_settings),
    datasite_name: str = Form(
        ..., description="Name of the datasite to add to auto-approve list"
    ),
) -> JSONResponse:
    # Create a lock file path based on the auto-approve file path
    lock_file_path = get_auto_approve_file_path(client, settings).with_suffix(".lock")
    file_lock = FileLock(str(lock_file_path))

    try:
        # Acquire the lock before modifying the file
        with file_lock:
            auto_approve_file = get_auto_approve_file(client, settings)
            auto_approve_datasites = auto_approve_file.get("datasites", [])
            if datasite_name not in auto_approve_datasites:
                auto_approve_datasites.append(datasite_name)
                auto_approve_file["datasites"] = auto_approve_datasites

                # Update datasets with the auto-approve datasites
                datasite_client = init_session(client.email)
                datasets = datasite_client.dataset.get_all()
                for dataset in datasets:
                    updated_dataset = datasite_client.dataset.update(
                        DatasetUpdate(
                            uid=dataset.uid,
                            auto_approval=auto_approve_datasites,
                        )
                    )
                    logger.debug(
                        f"Updated dataset {updated_dataset.name} with auto-approval for {auto_approve_datasites}"
                    )

                save_auto_approve_file(client, settings, auto_approve_file)
                logger.debug(f"Added {datasite_name} to auto-approve list")
                return JSONResponse(
                    content={"message": f"{datasite_name} added to auto-approve list"},
                    status_code=200,
                )
            else:
                logger.debug(f"{datasite_name} is already in the auto-approve list")
                return JSONResponse(
                    content={
                        "message": f"{datasite_name} is already in the auto-approve list"
                    },
                    status_code=200,
                )
    except Exception as e:
        logger.error(f"Error in auto-approve operation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@v1_router.get(
    "/auto-approve",
    tags=["auto-approve"],
    summary="Get the auto-approve list",
    response_model=ListAutoApproveResponse,
    description="Retrieve the list of datasites that are auto-approved",
)
async def get_auto_approve_list(
    client: Client = Depends(get_client),
    settings: Settings = Depends(get_settings),
) -> ListAutoApproveResponse:
    """
    Get the list of datasites that are auto-approved.
    """
    auto_approve_file = get_auto_approve_file(client, settings)
    return ListAutoApproveResponse(auto_approve=auto_approve_file.get("datasites", []))


# ------------------------------------------------

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
