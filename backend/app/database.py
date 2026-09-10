"""
Bhoomi Mitra – PostgreSQL / PostGIS Database Connection
Uses a simple SQLAlchemy connection pool. PostGIS extension must be enabled.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.postgres_uri,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a database session and closes it when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Health-check helper – returns True if PostGIS is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT PostGIS_Version();"))
        return True
    except Exception:
        return False
