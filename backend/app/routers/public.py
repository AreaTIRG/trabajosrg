import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.job_posting import JobPosting, JobStatus
from app.models.candidate import Candidate
from app.models.application import JobApplication, ApplicationStatus
from app.schemas.job import JobResponse
from app.config import settings

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/jobs", response_model=list[JobResponse])
async def list_jobs(
    zone: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(JobPosting).where(JobPosting.status == JobStatus.PUBLISHED)
    if zone:
        query = query.where(JobPosting.zone == zone)
    query = query.order_by(JobPosting.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobPosting).where(JobPosting.id == job_id, JobPosting.status == JobStatus.PUBLISHED)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/zones")
async def list_zones():
    return {"zones": ["Norte", "Sur", "Centro", "Oriente", "Occidente", "Otro"]}


@router.post("/applications", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_posting_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    cv_link: Optional[str] = Form(None),
    cv_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    job_posting_uuid = uuid.UUID(job_posting_id)

    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_posting_uuid,
            JobPosting.status == JobStatus.PUBLISHED,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not available")

    result = await db.execute(select(Candidate).where(Candidate.email == email))
    candidate = result.scalar_one_or_none()

    cv_url = None
    cv_type = "link" if cv_link else None

    if cv_file and cv_file.filename:
        ext = os.path.splitext(cv_file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        content = await cv_file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        cv_url = f"/uploads/{filename}"
        cv_type = "file"
    elif cv_link:
        cv_url = cv_link

    if candidate:
        candidate.first_name = first_name
        candidate.last_name = last_name
        if phone:
            candidate.phone = phone
        if cv_url:
            candidate.cv_url = cv_url
            candidate.cv_type = cv_type
    else:
        candidate = Candidate(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            cv_url=cv_url,
            cv_type=cv_type,
        )
        db.add(candidate)
        await db.flush()

    result = await db.execute(
        select(JobApplication).where(
            JobApplication.job_posting_id == job_posting_uuid,
            JobApplication.candidate_id == candidate.id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this job")

    application = JobApplication(
        job_posting_id=job_posting_uuid,
        candidate_id=candidate.id,
        status=ApplicationStatus.NEW,
    )
    db.add(application)
    await db.flush()

    return {"message": "Application submitted successfully", "application_id": str(application.id)}
