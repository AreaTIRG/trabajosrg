import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class ApplicationStatus(str, enum.Enum):
    NEW = "NEW"
    REVIEWING = "REVIEWING"
    INTERVIEWING = "INTERVIEWING"
    HIRED = "HIRED"
    REJECTED = "REJECTED"


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    job_posting_id = Column(Uuid, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Uuid, ForeignKey("candidates.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.NEW, index=True)
    internal_notes = Column(Text)
    applied_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("JobPosting", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
