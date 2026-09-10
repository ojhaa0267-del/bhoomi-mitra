"""
Bhoomi Mitra – LLM Voice Agent Wrapper

Routes conversational queries to a hosted language model.
Supports:
  - Groq API (llama-3-8b-8192) – fast, free tier available
  - OpenAI-compatible endpoint (Ollama local fallback)
  - Static demo mode (no API key required)

Set GROQ_API_KEY or OPENAI_API_BASE_URL in .env to activate live LLM mode.
"""
from __future__ import annotations
import os
import re
import json
import httpx
from app.services.govt_api_mock import fetch_land_record

BHOOMI_MITRA_SYSTEM_PROMPT = """
You are "Bhoomi Mitra", a very helpful, friendly, and polite Indian local land advisor.
You talk naturally like a real human friend or local counselor in clean, polite Hindi / Hinglish.

TONE & STYLE RULES:
1. Speak with natural warmth and respect (use 'Aap', 'Ji', 'Bhaiya', 'Dost').
2. Sound like a helpful person speaking on the phone, NOT a robotic AI. Avoid bookish Hindi and avoid English computer jargon.
3. Keep answers punchy, sweet, and to the point (2 to 3 sentences maximum), perfectly crafted for human voice playback.
4. Simplify land concepts easily:
   - Dakhil-Kharij ko "naam chadwana / mutation" bolein.
   - Court dispute ko "kanooni mamla / case" bolein.
5. If user asks to see the map or locate the plot, append this tag at the very end:
   [MAP_ACTION: {"lat": <lat>, "lng": <lng>, "zoom": 16}]
""".strip()


async def get_llm_response(user_message: str, land_code: str | None = None) -> str:
    """
    Returns a Bhoomi Mitra AI response to the user's query.
    Falls back to a rich static response in demo mode.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    ollama_url = os.getenv("OPENAI_API_BASE_URL", "")

    context = ""
    if land_code:
        record = fetch_land_record(land_code)
        if record:
            context = (
                f"\n\n[LAND CONTEXT for {land_code}]\n"
                f"Owner: {record['owner_details']['name']}\n"
                f"Area: {record['land_profile']['area_acres']} acres, Type: {record['land_profile']['land_type']}\n"
                f"Survey: {record['land_profile']['survey_status']}\n"
                f"Price Gap: {record['market_details']['price_gap_percentage']}%\n"
                f"Coordinates: {record['coordinates']}\n"
            )

    full_system = BHOOMI_MITRA_SYSTEM_PROMPT + context

    # ── Google Gemini API (Highest Priority) ──────────────────────────────
    if gemini_key:
        try:
            return await _call_gemini(user_message, full_system, gemini_key)
        except Exception as e:
            # Fallback to Groq if Gemini fails
            pass

    # ── Groq API ──────────────────────────────────────────────────────────
    if groq_key:
        return await _call_groq(user_message, full_system, groq_key)

    # ── Ollama / local OpenAI-compat endpoint ─────────────────────────────
    if ollama_url:
        return await _call_openai_compat(user_message, full_system, ollama_url)

    # ── Static demo fallback ──────────────────────────────────────────────
    return _demo_response(user_message, land_code)


async def _call_gemini(message: str, system: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": system}]
        },
        "contents": [
            {
                "parts": [{"text": message}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 300,
        }
    }
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()


async def _call_groq(message: str, system: str, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3-8b-8192",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": message},
        ],
        "temperature": 0.6,
        "max_tokens": 300,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(url, json=payload, headers={"Authorization": f"Bearer {api_key}"})
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


async def _call_openai_compat(message: str, system: str, base_url: str) -> str:
    url = f"{base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": "llama3",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": message},
        ],
        "temperature": 0.6,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


def _demo_response(message: str, land_code: str | None) -> str:
    """Rich static demo response when no LLM API is configured."""
    msg_lower = message.lower()

    if land_code and ("map" in msg_lower or "dikhaiye" in msg_lower or "show" in msg_lower):
        record = fetch_land_record(land_code)
        if record:
            lat = record["coordinates"]["latitude"]
            lng = record["coordinates"]["longitude"]
            return (
                f"Zaroor! Maine plot {land_code} ka map aapki screen par center kar diya hai. "
                f"Is zameen ka survey status '{record['land_profile']['survey_status']}' hai. "
                f"[MAP_ACTION: {{\"lat\": {lat}, \"lng\": {lng}, \"zoom\": 16}}]"
            )

    if "mutation" in msg_lower or "dakhil" in msg_lower or "time" in msg_lower or "kitna" in msg_lower:
        return (
            "Aam taur par mutation (Dakhil-Kharij) mein 10 se 14 working days lagte hain. "
            "Hamara AI model SRO queue load ke base par exact estimate deta hai. "
            "Timeline bar mein aap live progress track kar sakte hain!"
        )

    if "risk" in msg_lower or "safe" in msg_lower or "dispute" in msg_lower:
        return (
            "Aapke plot ka Trust Score hamare AI ne evaluate kiya hai. "
            "Agar koi court case ya highway buffer hai toh woh red flag ke saath dikhaaya jayega. "
            "Niche diye gaye Trust Score gauge mein detail dekh sakte hain."
        )

    return (
        "Namaste! Main aapka Bhoomi Mitra AI hoon. "
        "Aap apna 14-digit Bhu-Aadhar ID dalein aur main turant aapki zameen ki poori jankari de dunga — "
        "registry status, risk score, aur SRO delay estimate ke saath!"
    )
