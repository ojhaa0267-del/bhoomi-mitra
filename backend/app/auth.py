"""
Bhoomi Mitra – Firebase Authentication Middleware

Validates incoming Firebase ID tokens (Bearer JWT) on every protected API route.
Supports a DEMO_BYPASS_AUTH mode for local demos without a Firebase project.
"""
import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException, status, Depends
from app.config import get_settings


def _init_firebase() -> None:
    """Initialise the Firebase Admin SDK (idempotent – skips if already loaded)."""
    if firebase_admin._apps:
        return

    settings = get_settings()
    cert_path = settings.firebase_credentials_path

    if os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred)
    else:
        # In demo/CI mode without a real credentials file, init without cert.
        # Token verification will fail unless demo_bypass_auth is True.
        firebase_admin.initialize_app()


# Eagerly initialise so the first request isn't slow.
_init_firebase()


def get_current_user(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency that extracts and validates a Firebase ID token.

    Raises HTTP 401 on any auth failure.
    Returns the decoded token dict (contains uid, email, custom claims, etc.)
    """
    settings = get_settings()

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Use: Bearer <firebase-id-token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.strip().split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    # ── Demo bypass (never enable in production) ────────────────────────────
    if settings.demo_bypass_auth and token == "demo-citizen-token":
        return {
            "uid": "demo-citizen-uid-001",
            "email": "citizen@bhoomi-demo.in",
            "role": "citizen",
            "demo": True,
        }

    # ── Real Firebase verification ───────────────────────────────────────────
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )
