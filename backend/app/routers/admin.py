import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.admin_user import AdminUser
from app.models.job_posting import JobPosting, JobStatus
from app.models.candidate import Candidate
from app.models.application import JobApplication, ApplicationStatus
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobStatusUpdate
from app.schemas.application import ApplicationResponse, ApplicationStatusUpdate
from app.schemas.candidate import CandidateResponse
from app.schemas.auth import AdminUserCreate, AdminUserResponse
from app.auth import get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/me")
async def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    return {"id": str(current_admin.id), "email": current_admin.email, "name": current_admin.name}


@router.get("/jobs", response_model=list[JobResponse])
async def list_all_jobs(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    query = select(JobPosting)
    if status_filter:
        query = query.where(JobPosting.status == status_filter)
    query = query.order_by(JobPosting.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    job = JobPosting(**job_data.model_dump())
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return job


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_admin(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: uuid.UUID,
    job_data: JobUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in job_data.model_dump(exclude_unset=True).items():
        setattr(job, key, value)

    await db.flush()
    await db.refresh(job)
    return job


@router.patch("/jobs/{job_id}/status", response_model=JobResponse)
async def update_job_status(
    job_id: uuid.UUID,
    status_data: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if status_data.status not in [s.value for s in JobStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    job.status = status_data.status
    await db.flush()
    await db.refresh(job)
    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft jobs can be deleted")
    await db.delete(job)
    await db.flush()


@router.get("/applications", response_model=list[ApplicationResponse])
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    job_filter: Optional[uuid.UUID] = Query(None, alias="job_id"),
    zone: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    query = select(
        JobApplication,
        JobPosting.title,
        JobPosting.zone,
        Candidate.first_name,
        Candidate.last_name,
        Candidate.email,
    ).join(
        JobPosting, JobApplication.job_posting_id == JobPosting.id
    ).join(
        Candidate, JobApplication.candidate_id == Candidate.id
    )

    if status_filter:
        query = query.where(JobApplication.status == status_filter)
    if job_filter:
        query = query.where(JobApplication.job_posting_id == job_filter)
    if zone:
        query = query.where(JobPosting.zone == zone)

    query = query.order_by(JobApplication.applied_at.desc())
    result = await db.execute(query)
    rows = result.all()

    return [
        ApplicationResponse(
            id=row[0].id,
            job_posting_id=row[0].job_posting_id,
            candidate_id=row[0].candidate_id,
            status=row[0].status.value if hasattr(row[0].status, "value") else row[0].status,
            internal_notes=row[0].internal_notes,
            applied_at=row[0].applied_at,
            job_title=row[1],
            job_zone=row[2],
            candidate_name=f"{row[3]} {row[4]}",
            candidate_email=row[5],
        )
        for row in rows
    ]


@router.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: uuid.UUID,
    status_data: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobApplication).where(JobApplication.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if status_data.status not in [s.value for s in ApplicationStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    app.status = status_data.status
    await db.flush()
    return {"message": "Status updated", "status": status_data.status}


@router.patch("/applications/{application_id}/notes")
async def update_application_notes(
    application_id: uuid.UUID,
    notes: dict,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(JobApplication).where(JobApplication.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.internal_notes = notes.get("internal_notes", "")
    await db.flush()
    return {"message": "Notes updated"}


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    user_data: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(AdminUser).where(AdminUser.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = AdminUser(
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
