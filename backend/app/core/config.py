"""
Configuración de la aplicación cargada desde variables de entorno / archivo .env.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "EduTest AI"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Seguridad
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # Base de datos (provisional – reemplaza con tu URL de BD)
    DATABASE_URL: str = "sqlite:///./edutest.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
