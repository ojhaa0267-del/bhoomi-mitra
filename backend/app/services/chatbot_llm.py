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


async def get_llm_response(user_message: str, land_code: str | None = None, lang: str = "hi") -> str:
    """
    Returns a Bhoomi Mitra AI response to the user's query.
    Falls back gracefully across Gemini -> Groq -> Ollama -> Demo.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    ollama_url = os.getenv("OPENAI_API_BASE_URL", "")

    lang_map = {
        "hi": "Hindi / Hinglish", "bn": "Bengali", "ta": "Tamil", "te": "Telugu",
        "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam",
        "pa": "Punjabi", "or": "Odia", "en": "English", "ur": "Urdu",
        "as": "Assamese", "mai": "Maithili", "ne": "Nepali"
    }
    selected_lang_name = lang_map.get(lang, "Hindi")

    context = ""
    if land_code:
        record = fetch_land_record(land_code)
        if record:
            context = (
                f"\n\n[LAND CONTEXT for Bhu-Aadhar ID {land_code}]\n"
                f"Owner: {record.get('owner_details', {}).get('name', 'N/A')}\n"
                f"Area: {record.get('land_profile', {}).get('area_acres', 'N/A')} acres, Type: {record.get('land_profile', {}).get('land_type', 'N/A')}\n"
                f"Mouza: {record.get('land_profile', {}).get('mouza', 'N/A')}\n"
                f"Survey: {record.get('land_profile', {}).get('survey_status', 'N/A')}\n"
                f"Price Gap: {record.get('market_details', {}).get('price_gap_percentage', 0)}%\n"
                f"Coordinates: {record.get('coordinates', {})}\n"
            )

    lang_instruction = (
        f"\n\nLANGUAGE INSTRUCTION: The citizen speaks {selected_lang_name}. "
        f"Respond politely, helpfully, and clearly in {selected_lang_name}."
    )
    full_system = BHOOMI_MITRA_SYSTEM_PROMPT + context + lang_instruction

    # ── Google Gemini API (Highest Priority) ──────────────────────────────
    if gemini_key:
        try:
            return await _call_gemini(user_message, full_system, gemini_key)
        except Exception as e:
            print(f"Gemini API call failed ({e}). Trying Groq fallback...")

    # ── Groq API (High-speed LPU fallback) ────────────────────────────────
    if groq_key:
        try:
            groq_res = await _call_groq(user_message, full_system, groq_key)
            if groq_res:
                return groq_res
        except Exception as e:
            print(f"Groq API call failed ({e}). Trying next fallback...")

    # ── Ollama / local OpenAI-compat endpoint ─────────────────────────────
    if ollama_url:
        try:
            return await _call_openai_compat(user_message, full_system, ollama_url)
        except Exception as e:
            print(f"Ollama call failed ({e}).")

    # ── Static demo fallback ──────────────────────────────────────────────
    return _demo_response(user_message, land_code, lang)


async def _call_gemini(message: str, system: str, api_key: str) -> str:
    models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"]
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
    async with httpx.AsyncClient(timeout=15) as client:
        last_err = None
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"].strip()
                last_err = f"Status {resp.status_code}: {resp.text[:100]}"
            except Exception as e:
                last_err = str(e)
        raise RuntimeError(f"All Gemini models failed. Last error: {last_err}")


async def _call_groq(message: str, system: str, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]
    async with httpx.AsyncClient(timeout=15) as client:
        for model in models:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.6,
                "max_tokens": 300,
            }
            try:
                resp = await client.post(url, json=payload, headers={"Authorization": f"Bearer {api_key}"})
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"].strip()
                    if content:
                        return content
            except Exception as e:
                print(f"Groq model {model} attempt failed: {e}")
        return ""


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
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


def _demo_response(message: str, land_code: str | None, lang: str = "hi") -> str:
    """Rich static demo response when no LLM API is configured or available."""
    msg_lower = message.lower()

    if land_code and ("map" in msg_lower or "dikhaiye" in msg_lower or "show" in msg_lower or "dekhao" in msg_lower):
        record = fetch_land_record(land_code)
        if record:
            lat = record["coordinates"]["latitude"]
            lng = record["coordinates"]["longitude"]
            if lang == "bn":
                return (
                    f"নিশ্চয়ই! আমি প্লট {land_code} এর ম্যাপ স্ক্রিনে দেখাচ্ছি। "
                    f"সার্ভে স্ট্যাটাস: '{record['land_profile']['survey_status']}'। "
                    f"[MAP_ACTION: {{\"lat\": {lat}, \"lng\": {lng}, \"zoom\": 16}}]"
                )
            return (
                f"Zaroor! Maine plot {land_code} ka map aapki screen par center kar diya hai. "
                f"Is zameen ka survey status '{record['land_profile']['survey_status']}' hai. "
                f"[MAP_ACTION: {{\"lat\": {lat}, \"lng\": {lng}, \"zoom\": 16}}]"
            )

    if "mutation" in msg_lower or "dakhil" in msg_lower or "time" in msg_lower or "kitna" in msg_lower or "somoy" in msg_lower:
        if lang == "bn":
            return (
                "সাধারণত মিউটেশন (নামপত্তন) সম্পন্ন হতে ১০ থেকে ১৪ কার্যদিবস সময় লাগে। "
                "আমাদের AI মডেল SRO কিউ লোডের ভিত্তিতে সঠিক পূর্বাভাস দেয়।"
            )
        return (
            "Aam taur par mutation (Dakhil-Kharij) mein 10 se 14 working days lagte hain. "
            "Hamara AI model SRO queue load ke base par exact estimate deta hai. "
            "Timeline bar mein aap live progress track kar sakte hain!"
        )

    if "risk" in msg_lower or "safe" in msg_lower or "dispute" in msg_lower or "court" in msg_lower or "mamla" in msg_lower:
        if lang == "bn":
            return (
                "আপনার প্লটের ট্রাস্ট স্কোর আমাদের AI বিশ্লেষণ করেছে। "
                "কোনো কোর্ট কেস বা হাইওয়ে বাফার থাকলে তা সরাসরি সতর্কতা সহ দেখানো হয়।"
            )
        return (
            "Aapke plot ka Trust Score hamare AI ne evaluate kiya hai. "
            "Agar koi court case ya highway buffer hai toh woh red flag ke saath dikhaaya jayega. "
            "Niche diye gaye Trust Score gauge mein detail dekh sakte hain."
        )

    # Multilingual default greetings for demo fallback
    greetings = {
        "bn": (
            "নমস্কার! আমি আপনার ভূমি মিত্র AI। "
            "আপনার ১৪-ডিজিট ভূ-আধার ID লিখুন এবং আমি সাথে সাথে প্লটের সম্পূর্ণ বিবরণ, "
            "রেজিস্ট্রি স্ট্যাটাস ও ট্রাস্ট স্কোর জানিয়ে দেব!"
        ),
        "ta": (
            "வணக்கம்! நான் உங்கள் பூமி மித்ரா AI. "
            "உங்கள் 14-இலக்க பூ-ஆதார் ID-ஐ உள்ளிடுங்கள், "
            "நிலத்தின் முழு விவரம், பதிவு நிலை மற்றும் நம்பிக்கை மதிப்பீடு உடனே தருகிறேன்!"
        ),
        "te": (
            "నమస్కారం! నేను మీ భూమి మిత్ర AI. "
            "మీ 14-అంకెల భూ-ఆధార్ ID నమోదు చేయండి, "
            "భూమి వివరాలు, రిజిస్ట్రేషన్ స్థితి మరియు నమ్మకం స్కోర్ వెంటనే చెప్తాను!"
        ),
        "mr": (
            "नमस्कार! मी तुमचा भूमी मित्र AI आहे. "
            "तुमचा 14-अंकी भू-आधार ID टाका आणि मी लगेच जमिनीची पूर्ण माहिती, "
            "नोंदणी स्थिती आणि ट्रस्ट स्कोर सांगतो!"
        ),
        "gu": (
            "નમસ્તે! હું તમારો ભૂમિ મિત્ર AI છું. "
            "તમારો 14-અંકનો ભૂ-આધાર ID દાખલ કરો, "
            "જમીનની સંપૂર્ણ માહિતી, રજિસ્ટ્રી સ્ટેટસ અને ટ્રસ્ટ સ્કોર તરત આપીશ!"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಭೂಮಿ ಮಿತ್ರ AI. "
            "ನಿಮ್ಮ 14-ಅಂಕಿ ಭೂ-ಆಧಾರ್ ID ನಮೂದಿಸಿ, "
            "ಭೂಮಿ ವಿವರ, ನೋಂದಣಿ ಸ್ಥಿತಿ ಮತ್ತು ಟ್ರಸ್ಟ್ ಸ್ಕೋರ್ ತಕ್ಷಣ ತಿಳಿಸುತ್ತೇನೆ!"
        ),
        "ml": (
            "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഭൂമി മിത്ര AI ആണ്. "
            "നിങ്ങളുടെ 14 അക്ക ഭൂ-ആധാർ ID നൽകൂ, "
            "ഭൂമിയുടെ വിശദാംശങ്ങൾ, രജിസ്ട്രേഷൻ നില, ട്രസ്റ്റ് സ്കോർ ഉടൻ അറിയിക്കാം!"
        ),
        "pa": (
            "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਭੂਮੀ ਮਿੱਤਰ AI ਹਾਂ। "
            "ਆਪਣਾ 14-ਅੰਕ ਭੂ-ਆਧਾਰ ID ਦਰਜ ਕਰੋ, "
            "ਜ਼ਮੀਨ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ, ਰਜਿਸਟ੍ਰੀ ਸਥਿਤੀ ਅਤੇ ਟ੍ਰਸਟ ਸਕੋਰ ਤੁਰੰਤ ਦੱਸਾਂਗਾ!"
        ),
        "or": (
            "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ଭୂମି ମିତ୍ର AI। "
            "ଆପଣଙ୍କ 14-ଅଙ୍କ ଭୂ-ଆଧାର ID ଲେଖନ୍ତୁ, "
            "ଜମିର ସମ୍ପୂର୍ଣ୍ଣ ତଥ୍ୟ, ପଞ୍ଜୀକରଣ ସ୍ଥିତି ଏବଂ ବିଶ୍ୱସ୍ତ ସ୍କୋର ତୁରନ୍ତ ଜଣାଇବି!"
        ),
        "en": (
            "Hello! I'm your Bhoomi Mitra AI assistant. "
            "Enter your 14-digit Bhu-Aadhar ID and I'll instantly provide complete land details, "
            "registry status, and Trust Score!"
        ),
        "ur": (
            "السلام علیکم! میں آپ کا بھومی مِتر AI ہوں۔ "
            "اپنا 14 ہندسوں والا بھو آدھار ID درج کریں، "
            "زمین کی مکمل تفصیلات، رجسٹری کی حیثیت اور ٹرسٹ اسکور فوری طور پر بتاؤں گا!"
        ),
    }

    if lang in greetings:
        return greetings[lang]

    return (
        "Namaste! Main aapka Bhoomi Mitra AI hoon. "
        "Aap apna 14-digit Bhu-Aadhar ID dalein aur main turant aapki zameen ki poori jankari de dunga — "
        "registry status, risk score, aur SRO delay estimate ke saath!"
    )

