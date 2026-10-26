import hashlib
from datetime import datetime, timezone
from pathlib import Path

from openai import AsyncOpenAI

from . import vectorstore
from .chunking import chunk_text, extract_text
from .config import get_settings


def openai_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=get_settings().openai_api_key)


async def embed(texts: list[str]) -> list[list[float]]:
    s = get_settings()
    out: list[list[float]] = []
    oc = openai_client()
    for i in range(0, len(texts), 96):
        resp = await oc.embeddings.create(model=s.embedding_model, input=texts[i : i + 96])
        out.extend(d.embedding for d in resp.data)
    return out


def doc_id_for(filename: str) -> str:
    """Stable per filename, so re-uploading a file replaces its previous version."""
    return hashlib.sha1(filename.encode()).hexdigest()[:16]


async def ingest_file(filename: str, data: bytes, category: str = "general", origin: str = "upload") -> dict:
    s = get_settings()
    text = extract_text(filename, data)
    chunks = chunk_text(text, s.chunk_size, s.chunk_overlap)
    if not chunks:
        raise ValueError("No extractable text found in the document.")
    doc_id = doc_id_for(filename)
    # embed the heading with the text so short chunks keep their context
    vectors = await embed([f"{c.section}\n{c.text}" if c.section else c.text for c in chunks])
    vectorstore.ensure_collection()
    vectorstore.delete_document(doc_id)
    vectorstore.upsert(doc_id, filename, category, chunks, vectors, extra={"origin": origin})
    return {"doc_id": doc_id, "source": filename, "category": category, "chunks": len(chunks)}


MAX_RECORD_CHARS = 3000


async def sync_records(kind: str, records: list[dict]) -> dict:
    """Embeds and stores database records (one point each), replacing earlier versions of the same ids."""
    unique: dict[str, dict] = {}
    for r in records:  # a repeated id inside one batch: the last one wins
        unique[r["id"]] = {
            "id": r["id"],
            "title": r["title"].strip(),
            "text": r["text"].strip()[:MAX_RECORD_CHARS],
            "url": r.get("url") or "",
        }
    prepared = list(unique.values())
    if not prepared:
        return {"kind": kind, "upserted": 0}
    vectors = await embed([f"{p['title']}\n{p['text']}" for p in prepared])
    vectorstore.ensure_collection()
    vectorstore.upsert_records(kind, prepared, vectors, datetime.now(timezone.utc).isoformat())
    return {"kind": kind, "upserted": len(prepared)}


def default_knowledge_dir() -> Path:
    configured = get_settings().knowledge_dir
    # backend/app/ingest.py -> parents[2] is the sprout/ folder
    return Path(configured) if configured else Path(__file__).resolve().parents[2] / "knowledge"


async def ingest_folder(folder: Path, prune: bool = False, remove_sources: list[str] | None = None) -> dict:
    """
    Ingests every supported file under `folder` (sub-folder name = category).
    prune: also delete earlier folder-ingested documents whose file no longer exists.
    remove_sources: delete documents with these file names whatever their origin (retired starter files).
    Documents uploaded by hand are never pruned.
    """
    from .chunking import SUPPORTED

    folder = Path(folder)
    if not folder.is_dir():
        raise ValueError(f"Knowledge folder not found: {folder}")

    ingested, skipped, seen = [], [], set()
    for path in sorted(folder.rglob("*")):
        if path.suffix.lower() not in SUPPORTED:
            continue
        category = path.parent.name.lower() if path.parent != folder else "general"
        try:
            r = await ingest_file(path.name, path.read_bytes(), category, origin="folder")
            ingested.append({"source": r["source"], "category": r["category"], "chunks": r["chunks"]})
            seen.add(path.name)
        except ValueError as e:
            skipped.append({"source": path.name, "reason": str(e)})

    removed = []
    if prune or remove_sources:
        vectorstore.ensure_collection()
        for d in vectorstore.list_documents():
            if d.get("synced"):
                continue
            retired = d["source"] in (remove_sources or [])
            orphan = prune and d.get("origin") == "folder" and d["source"] not in seen
            if retired and d["source"] not in seen or orphan:
                vectorstore.delete_document(d["doc_id"])
                removed.append(d["source"])
    return {"ingested": ingested, "skipped": skipped, "removed": removed}
