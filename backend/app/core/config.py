"""
Application configuration loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "EduTest AI"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # Database (placeholder – replace with your DB URL)
    DATABASE_URL: str = "sqlite:///./edutest.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
