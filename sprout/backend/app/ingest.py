import hashlib

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


async def ingest_file(filename: str, data: bytes, category: str = "general") -> dict:
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
    vectorstore.upsert(doc_id, filename, category, chunks, vectors)
    return {"doc_id": doc_id, "source": filename, "category": category, "chunks": len(chunks)}
