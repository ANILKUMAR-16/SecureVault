from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SecureVault"
    API_V1_STR: str = "/api/v1"
    
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str
    STORAGE_PATH: str

    class Config:
        env_file = ".env"

settings = Settings()
