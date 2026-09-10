"""
Bhoomi Mitra – Configuration & Environment Variables
All settings are loaded from environment variables (or a .env file in development).
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Application ──────────────────────────────────────────────────────────
    app_title: str = "Bhoomi Mitra API"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── CORS (comma-separated list of allowed origins) ───────────────────────
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    # ── Firebase ─────────────────────────────────────────────────────────────
    firebase_credentials_path: str = "credentials/firebase-adminsdk.json"
    demo_bypass_auth: bool = False   # Set True only for local demos without Firebase

    # ── Database (PostgreSQL + PostGIS) ──────────────────────────────────────
    postgres_uri: str = "postgresql://bhoomi_user:bhoomi_pass@localhost:5432/bhoomi_mitra_db"

    # ── ML Model ─────────────────────────────────────────────────────────────
    delay_model_path: str = "../ml_engine/delay_predictor_model.pkl"

    # ── External APIs ────────────────────────────────────────────────────────
    groq_api_key: str = ""
    gemini_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton – import and call this everywhere instead of Settings()."""
    return Settings()
