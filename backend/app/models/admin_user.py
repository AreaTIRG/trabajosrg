import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Uuid

from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
