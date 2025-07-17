import webbrowser

from fastapi import HTTPException
from loguru import logger
from syft_core import Client
from syft_rds import init_session

from ...models import ListJobsResponse


class JobService:
    """Service class for job-related operations."""

    def __init__(self, client: Client):
        self.client = client
        self.datasite_client = init_session(client.email)

    async def list_jobs(self) -> ListJobsResponse:
        """List all jobs in the system."""
        try:
            jobs = self.datasite_client.jobs.get_all()
            return ListJobsResponse(jobs=jobs)
        except Exception as e:
            logger.error(f"Error listing jobs: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def open_job_code(self, job_uid: str) -> None:
        """Open the job code directory in the file browser."""
        try:
            job = self.datasite_client.jobs.get(uid=job_uid)
            if not job:
                raise HTTPException(
                    status_code=404, detail=f"Job with UID '{job_uid}' not found"
                )

            # Open the job's code directory
            webbrowser.open(f"file://{job.user_code.local_dir}")
            logger.debug(f"Opened code directory for job {job_uid}")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error opening job code: {e}")
            raise HTTPException(status_code=500, detail=str(e))
