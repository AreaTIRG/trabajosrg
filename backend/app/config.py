from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./puestos.db"
    SECRET_KEY: str = "secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    ADMIN_EMAIL: str = "admin@puestos.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "Admin"
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"

settings = Settings()
