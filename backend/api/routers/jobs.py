from fastapi import APIRouter, Depends
from syft_core import Client as SyftBoxClient

from ..dependencies import get_syftbox_client
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
    syftbox_client: SyftBoxClient = Depends(get_syftbox_client),
) -> ListJobsResponse:
    """Get all jobs in the system."""
    service = JobService(syftbox_client)
    return await service.list_jobs()


@router.get(
    "/open-code/{job_uid}",
    summary="Open job code in browser",
    description="Open the code directory for a specific job in the default file browser",
)
async def open_job_code(
    job_uid: str,
    syftbox_client: SyftBoxClient = Depends(get_syftbox_client),
):
    """Open job code directory in the system file browser."""
    service = JobService(syftbox_client)
    await service.open_job_code(job_uid)
    return {"message": f"Opened code directory for job {job_uid}"}
