from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List

from syft_rds.models.models import Dataset as SyftDataset, Job as SyftJob


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Dataset(BaseSchema, SyftDataset):
    pass


class Job(BaseSchema, SyftJob):
    pass


class ListDatasetsResponse(BaseSchema):
    datasets: List[Dataset]


class ListJobsResponse(BaseSchema):
    jobs: List[Job]
