from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationResponse(BaseModel):
    id: UUID
    job_posting_id: UUID
    candidate_id: UUID
    status: str
    internal_notes: Optional[str]
    applied_at: datetime
    job_title: Optional[str] = None
    job_zone: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None

    class Config:
        from_attributes = True
