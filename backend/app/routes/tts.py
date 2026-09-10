import os
import tempfile
import asyncio
from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pydantic import BaseModel

try:
    import edge_tts
except ImportError:
    edge_tts = None

router = APIRouter(prefix="/api/tts", tags=["TTS"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "hi-IN-SwaraNeural"  # Highly realistic Hindi female neural voice

@router.post("/speak")
async def speak_text(req: TTSRequest, background_tasks: BackgroundTasks):
    if not edge_tts:
        return {"error": "edge-tts library not found. Please run: pip install edge-tts"}
        
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_file.close()
    
    try:
        communicate = edge_tts.Communicate(req.text, req.voice)
        await communicate.save(temp_file.name)
        
        # Ensure file is deleted after being sent to the client
        background_tasks.add_task(os.remove, temp_file.name)
        
        return FileResponse(temp_file.name, media_type="audio/mpeg")
    except Exception as e:
        if os.path.exists(temp_file.name):
            os.remove(temp_file.name)
        return {"error": str(e)}
