import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.database import init_db, async_session_factory
from app.models.admin_user import AdminUser
from app.auth import get_password_hash
from app.config import settings
from app.routers import public, auth, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_admin()
    yield


async def seed_admin():
    async with async_session_factory() as session:
        result = await session.execute(select(AdminUser).limit(1))
        if not result.scalar_one_or_none():
            admin = AdminUser(
                email=settings.ADMIN_EMAIL,
                name=settings.ADMIN_NAME,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            )
            session.add(admin)
            await session.commit()


app = FastAPI(title="Puestos API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)
