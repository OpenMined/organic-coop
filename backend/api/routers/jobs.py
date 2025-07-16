from fastapi import APIRouter, Depends
from syft_core import Client

from ..dependencies import get_client
from ..services.job_service import JobService
from ...models import ListJobsResponse


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get(
    "",
    summary="List all jobs",
    description="Retrieve a list of all jobs in the system",
    response_model=ListJobsResponse,
)
async def list_jobs(
    client: Client = Depends(get_client),
) -> ListJobsResponse:
    """Get all jobs in the system."""
    service = JobService(client)
    return await service.list_jobs()


@router.get(
    "/open-code/{job_uid}",
    summary="Open job code in browser",
    description="Open the code directory for a specific job in the default file browser",
)
async def open_job_code(
    job_uid: str,
    client: Client = Depends(get_client),
):
    """Open job code directory in the system file browser."""
    service = JobService(client)
    await service.open_job_code(job_uid)
    return {"message": f"Opened code directory for job {job_uid}"}
