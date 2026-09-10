"""
Bhoomi Mitra – FastAPI Core Application Entrypoint (main.py)

Starts the application, registers middleware, mounts all API routers,
and exposes a health-check endpoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import search, analytics, chat, documents, tts

settings = get_settings()

# ── App Instance ────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
    description=(
        "🌾 **Bhoomi Mitra (Pratyaksh AI)** — AI-powered Citizen Land Portal.\n\n"
        "Provides Bhu-Aadhar land registry search, GIS risk scoring, SRO delay prediction, "
        "and a multilingual Hinglish voice agent interface.\n\n"
        "**Demo mode**: Set `DEMO_BYPASS_AUTH=true` in `.env` and use `Bearer demo-citizen-token` "
        "as Authorization header to bypass Firebase token validation."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ────────────────────────────────────────────────────────────────────
allowed_origins = [o.strip() for o in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(search.router)
app.include_router(analytics.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(tts.router)


# ── Health & Root ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Root health check")
def root():
    return {
        "service": settings.app_title,
        "version": settings.app_version,
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"], summary="Detailed health check")
def health():
    from app.database import check_db_connection
    db_ok = check_db_connection()
    return {
        "api": "ok",
        "database": "ok" if db_ok else "unavailable (using mock data)",
        "demo_mode": settings.demo_bypass_auth,
    }
