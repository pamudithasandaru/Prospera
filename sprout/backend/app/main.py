import hmac
import logging
from typing import Literal

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from . import rag, vectorstore
from .chunking import SUPPORTED
from .config import get_settings
from .ingest import default_knowledge_dir, ingest_file, ingest_folder, sync_records

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
    if doc_id.startswith("synced:"):  # a whole kind of database records (re-created by the next sync)
        vectorstore.ensure_collection()
        vectorstore.delete_kind(doc_id.split(":", 1)[1])
    else:
        vectorstore.delete_document(doc_id)
    return {"deleted": doc_id}


# ── Sync: database records pushed by the Haritha Bhoomi API ─────────────────
# The platform API owns the database, decides what is public and pushes it here.

SyncKind = Literal["product", "listing", "course", "scheme", "guide"]


class SyncRecord(BaseModel):
    id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=300)
    text: str = Field(min_length=1, max_length=8000)
    url: str | None = Field(default=None, max_length=300)

    @field_validator("url")
    @classmethod
    def _site_path_only(cls, v):
        # Links in answers must stay on the platform: only site-relative paths like "/market".
        if v and (not v.startswith("/") or v.startswith("//")):
            raise ValueError("url must be a site-relative path such as /market")
        return v


class SyncRequest(BaseModel):
    kind: SyncKind
    records: list[SyncRecord] = Field(max_length=500)


class PruneRequest(BaseModel):
    kind: SyncKind
    keep_ids: list[str] = Field(max_length=10000)


class KnowledgeFilesRequest(BaseModel):
    prune: bool = True
    remove_sources: list[str] = Field(default=[], max_length=50)


@app.post("/api/sync", dependencies=[Depends(require_admin)])
async def sync(req: SyncRequest):
    """Adds or replaces records (matched by kind + id). Send at most 500 per request."""
    try:
        return await sync_records(req.kind, [r.model_dump() for r in req.records])
    except Exception as e:
        log.exception("sync failed")
        raise HTTPException(502, f"Sync failed: {type(e).__name__}: {e}"[:300])


@app.post("/api/sync/prune", dependencies=[Depends(require_admin)])
def sync_prune(req: PruneRequest):
    """Removes synced records of a kind whose id is not in keep_ids (deleted in the database)."""
    vectorstore.ensure_collection()
    return {"kind": req.kind, "deleted": vectorstore.prune_kind(req.kind, set(req.keep_ids))}


@app.delete("/api/sync/{kind}/{record_id}", dependencies=[Depends(require_admin)])
def sync_delete(kind: SyncKind, record_id: str):
    vectorstore.ensure_collection()
    vectorstore.delete_record(kind, record_id)
    return {"kind": kind, "deleted": record_id}


@app.get("/api/sync/status", dependencies=[Depends(require_admin)])
def sync_status():
    vectorstore.ensure_collection()
    kinds = vectorstore.kind_stats()
    docs = [d for d in vectorstore.list_documents() if not d.get("synced")]
    return {
        "kinds": kinds,
        "synced_records": sum(k["count"] for k in kinds.values()),
        "documents": len(docs),
        "document_chunks": sum(d["chunks"] for d in docs),
    }


@app.post("/api/sync/knowledge-files", dependencies=[Depends(require_admin)])
async def sync_knowledge_files(req: KnowledgeFilesRequest = KnowledgeFilesRequest()):
    """Re-ingests the guide/starter documents from this server's knowledge folder (no upload needed)."""
    try:
        return await ingest_folder(default_knowledge_dir(), prune=req.prune, remove_sources=req.remove_sources)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        log.exception("knowledge file sync failed")
        raise HTTPException(502, f"Sync failed: {type(e).__name__}: {e}"[:300])
