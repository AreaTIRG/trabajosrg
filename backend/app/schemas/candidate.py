from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class CandidateResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    cv_type: Optional[str]
    cv_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
