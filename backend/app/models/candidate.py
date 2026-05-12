import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    cv_type = Column(String(10), default="file")
    cv_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("JobApplication", back_populates="candidate")
