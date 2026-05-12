from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class JobCreate(BaseModel):
    title: str
    zone: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    requirements: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    zone: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    requirements: Optional[str] = None


class JobResponse(BaseModel):
    id: UUID
    title: str
    zone: str
    location: Optional[str]
    job_type: Optional[str]
    requirements: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobStatusUpdate(BaseModel):
    status: str
