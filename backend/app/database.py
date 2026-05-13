from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.exc import OperationalError, IntegrityError
import asyncio

from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Lock to prevent concurrent initialization
_db_init_lock = asyncio.Lock()
_db_initialized = False

async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    global _db_initialized
    
    # Use lock to prevent concurrent initialization
    async with _db_init_lock:
        if _db_initialized:
            return
        
        try:
            async with engine.begin() as conn:
                if settings.DATABASE_URL.startswith("sqlite"):
                    await conn.exec_driver_sql("PRAGMA foreign_keys=ON")
                
                # Use checkfirst=True to avoid errors if objects already exist
                def create_tables(sync_conn):
                    Base.metadata.create_all(sync_conn, checkfirst=True)
                
                await conn.run_sync(create_tables)
            
            _db_initialized = True
            print("Database initialized successfully")
        except (OperationalError, IntegrityError) as e:
            # If tables already exist, just log and continue
            if "already exists" in str(e).lower() or "unique constraint" in str(e).lower():
                print(f"Database objects already exist, skipping initialization: {e}")
                _db_initialized = True
            else:
                raise
