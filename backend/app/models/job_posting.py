import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    zone = Column(String(100), nullable=False, index=True)
    location = Column(String(255))
    job_type = Column(String(50))
    requirements = Column(Text)
    status = Column(SQLEnum(JobStatus), default=JobStatus.DRAFT, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
