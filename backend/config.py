import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ShitBase Backend"
    DEBUG: bool = True  # Toggle for verbose logs
    SECRET_KEY: str = os.getenv("SECRET_KEY", os.environ["JWT_SECRET_KEY"])
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Use absolute paths for reliability
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    DB_PATH: str = os.path.join(BASE_DIR, "db_data", "database.sqlite")
    LOG_DIR: str = os.path.join(BASE_DIR, "logs")

    HOST: str = "0.0.0.0"
    PORT: int = 6942

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.LOG_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DB_PATH), exist_ok=True)
