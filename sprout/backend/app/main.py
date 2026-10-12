import hmac
import logging
from typing import Literal

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from . import rag, vectorstore
from .chunking import SUPPORTED
from .config import get_settings
from .ingest import ingest_file

log = logging.getLogger("sprout")
settings = get_settings()

app = FastAPI(title="Sprout - Prospera RAG assistant", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 15 * 1024 * 1024


def _same(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or not _same(x_admin_key, settings.admin_api_key):
        raise HTTPException(401, "Invalid admin key")


def require_chat_key(x_api_key: str = Header(default="")) -> None:
    if settings.chat_api_key and not _same(x_api_key, settings.chat_api_key):
        raise HTTPException(401, "Invalid API key")


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[Message] = []
    category: str | None = None


@app.get("/api/health")
def health():
    try:
        vectorstore.client().get_collections()
        qdrant = True
    except Exception:
        qdrant = False
    return {"ok": True, "bot": rag.BOT_NAME, "qdrant": qdrant, "openai_key_set": bool(settings.openai_api_key)}


@app.post("/api/chat", dependencies=[Depends(require_chat_key)])
async def chat(req: ChatRequest):
    """Streams Server-Sent Events: `sources`, then `token`s, then `done` (or `error`)."""
    history = [m.model_dump() for m in req.history]

    async def gen():
        try:
            async for chunk in rag.answer_stream(req.message, history, req.category):
                yield chunk
        except Exception as e:  # surface a clean error to the UI instead of a broken stream
            log.exception("chat failed")
            yield rag.sse({"type": "error", "message": f"{type(e).__name__}: {e}"[:300]})

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@app.get("/api/documents", dependencies=[Depends(require_admin)])
def documents():
    vectorstore.ensure_collection()
    return vectorstore.list_documents()


@app.post("/api/documents", dependencies=[Depends(require_admin)])
async def upload(file: UploadFile = File(...), category: str = Form("general")):
    name = file.filename or "upload"
    if not any(name.lower().endswith(ext) for ext in SUPPORTED):
        raise HTTPException(400, f"Unsupported file type. Supported: {', '.join(sorted(SUPPORTED))}")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large (max 15 MB)")
    try:
        return await ingest_file(name, data, category.strip().lower() or "general")
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.delete("/api/documents/{doc_id}", dependencies=[Depends(require_admin)])
def delete(doc_id: str):
    vectorstore.delete_document(doc_id)
    return {"deleted": doc_id}
