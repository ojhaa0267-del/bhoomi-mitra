"""
Bhoomi Mitra – Conversational Voice Agent Chat Route
POST /api/v1/chat
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.services.chatbot_llm import get_llm_response

router = APIRouter(prefix="/api/v1", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str
    land_code: Optional[str] = None
    lang: Optional[str] = "hi"


@router.post("/chat", summary="Converse with the multilingual Bhoomi Mitra AI voice agent")
async def chat(
    body: ChatRequest,
    _user: dict = Depends(get_current_user),
):
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty.")

    response_text = await get_llm_response(body.query, body.land_code, body.lang or "hi")
    return {"response_text": response_text}
