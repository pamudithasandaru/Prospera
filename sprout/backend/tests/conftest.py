"""
Shared test setup: an in-memory Qdrant and deterministic fake embeddings, so the
suite needs no Qdrant server and makes no OpenAI calls.
"""
import math
import os
import re
import zlib

# Must be set before the app is imported (settings are cached on first use).
os.environ["QDRANT_URL"] = ":memory:"
os.environ["QDRANT_COLLECTION"] = "test_kb"
os.environ["ADMIN_API_KEY"] = "test-admin-key"
os.environ["OPENAI_API_KEY"] = "test-openai-key"
os.environ["CHAT_API_KEY"] = ""
os.environ["SCORE_THRESHOLD"] = "0.05"

import pytest

DIM = 1536
ADMIN = {"X-Admin-Key": "test-admin-key"}
STOPWORDS = set(
    "a an and are as at be by can do does for from how i if in is it me much my of on or that the this to "
    "what which with you your about tell please".split()
)


def fake_vector(text: str) -> list[float]:
    """Hashing-trick bag of words: texts that share words get similar vectors."""
    vec = [0.0] * DIM
    for word in re.findall(r"[a-z0-9]+", text.lower()):
        if word in STOPWORDS:
            continue
        vec[zlib.crc32(word.encode()) % DIM] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def fake_embed(texts: list[str]) -> list[list[float]]:
    return [fake_vector(t) for t in texts]


@pytest.fixture(autouse=True)
def fresh_app(monkeypatch):
    from app import ingest, rag, vectorstore
    from app.config import get_settings

    get_settings.cache_clear()
    vectorstore._client = None  # a brand-new empty in-memory Qdrant per test
    vectorstore._indexes_ready = False
    monkeypatch.setattr(ingest, "embed", fake_embed)
    monkeypatch.setattr(rag, "embed", fake_embed)
    yield
    vectorstore._client = None
    get_settings.cache_clear()


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)
