import uuid
from collections import defaultdict

from qdrant_client import QdrantClient, models

from .config import get_settings

_client: QdrantClient | None = None


_indexes_ready = False
INDEXED_FIELDS = ("doc_id", "category", "kind", "record_id", "origin")


def client() -> QdrantClient:
    global _client
    if _client is None:
        s = get_settings()
        if s.qdrant_url == ":memory:":
            _client = QdrantClient(":memory:")  # tests / local development without a Qdrant server
        else:
            _client = QdrantClient(url=s.qdrant_url, api_key=s.qdrant_api_key or None)
    return _client


def ensure_collection() -> None:
    global _indexes_ready
    s = get_settings()
    c = client()
    if not c.collection_exists(s.qdrant_collection):
        c.create_collection(
            s.qdrant_collection,
            vectors_config=models.VectorParams(size=s.embedding_dim, distance=models.Distance.COSINE),
        )
        _indexes_ready = False
    if not _indexes_ready:
        # Older collections predate the `kind` / `record_id` fields, so add any missing index once per process.
        try:
            existing = set((c.get_collection(s.qdrant_collection).payload_schema or {}).keys())
        except Exception:
            existing = set()
        for field in INDEXED_FIELDS:
            if field not in existing:
                try:
                    c.create_payload_index(s.qdrant_collection, field, models.PayloadSchemaType.KEYWORD)
                except Exception:
                    pass
        _indexes_ready = True


def upsert(doc_id: str, source: str, category: str, chunks, vectors: list[list[float]], extra: dict | None = None) -> None:
    s = get_settings()
    points = [
        models.PointStruct(
            id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{doc_id}:{i}")),
            vector=vec,
            payload={
                "doc_id": doc_id,
                "source": source,
                "category": category,
                "section": ch.section,
                "chunk_index": i,
                "text": ch.text,
                **(extra or {}),
            },
        )
        for i, (ch, vec) in enumerate(zip(chunks, vectors))
    ]
    for i in range(0, len(points), 64):
        client().upsert(s.qdrant_collection, points[i : i + 64])


def search(vector: list[float], limit: int, threshold: float, category: str | None = None):
    s = get_settings()
    flt = None
    if category:
        flt = models.Filter(must=[models.FieldCondition(key="category", match=models.MatchValue(value=category))])
    res = client().query_points(
        s.qdrant_collection,
        query=vector,
        limit=limit,
        score_threshold=threshold,
        query_filter=flt,
        with_payload=True,
    )
    return res.points


# ── Records synced from the Haritha Bhoomi database ─────────────────────────
# One point per record (a product, course, ...), keyed by (kind, record_id) so a
# re-sync replaces the old version instead of duplicating it.

def point_id(kind: str, record_id: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"sync:{kind}:{record_id}"))


def upsert_records(kind: str, records: list[dict], vectors: list[list[float]], synced_at: str) -> None:
    s = get_settings()
    points = [
        models.PointStruct(
            id=point_id(kind, r["id"]),
            vector=vec,
            payload={
                "doc_id": f"sync:{kind}:{r['id']}",
                "source": r["title"],
                "category": kind,
                "section": "",
                "chunk_index": 0,
                "text": r["text"],
                "kind": kind,
                "record_id": r["id"],
                "url": r.get("url") or "",
                "synced_at": synced_at,
            },
        )
        for r, vec in zip(records, vectors)
    ]
    for i in range(0, len(points), 64):
        client().upsert(s.qdrant_collection, points[i : i + 64])


def _kind_filter(kind: str) -> models.Filter:
    return models.Filter(must=[models.FieldCondition(key="kind", match=models.MatchValue(value=kind))])


def record_ids(kind: str) -> set[str]:
    s = get_settings()
    ids: set[str] = set()
    offset = None
    while True:
        points, offset = client().scroll(
            s.qdrant_collection, scroll_filter=_kind_filter(kind), limit=256, offset=offset,
            with_payload=["record_id"], with_vectors=False,
        )
        ids.update(p.payload["record_id"] for p in points if p.payload.get("record_id"))
        if offset is None:
            return ids


def delete_record(kind: str, record_id: str) -> None:
    s = get_settings()
    client().delete(s.qdrant_collection, points_selector=models.PointIdsList(points=[point_id(kind, record_id)]))


def prune_kind(kind: str, keep_ids: set[str]) -> int:
    """Removes synced records of this kind that no longer exist in the database. Returns how many."""
    s = get_settings()
    stale = record_ids(kind) - set(keep_ids)
    if stale:
        client().delete(s.qdrant_collection, points_selector=models.PointIdsList(points=[point_id(kind, r) for r in stale]))
    return len(stale)


def delete_kind(kind: str) -> None:
    s = get_settings()
    client().delete(s.qdrant_collection, points_selector=models.FilterSelector(filter=_kind_filter(kind)))


def kind_stats() -> dict[str, dict]:
    """{kind: {count, last_synced}} for every kind of synced record."""
    s = get_settings()
    stats: dict[str, dict] = {}
    offset = None
    while True:
        points, offset = client().scroll(
            s.qdrant_collection, limit=256, offset=offset, with_payload=["kind", "synced_at"], with_vectors=False,
        )
        for p in points:
            kind = p.payload.get("kind")
            if not kind:
                continue
            st = stats.setdefault(kind, {"count": 0, "last_synced": ""})
            st["count"] += 1
            st["last_synced"] = max(st["last_synced"], p.payload.get("synced_at") or "")
        if offset is None:
            return stats


def delete_document(doc_id: str) -> None:
    s = get_settings()
    client().delete(
        s.qdrant_collection,
        points_selector=models.FilterSelector(
            filter=models.Filter(must=[models.FieldCondition(key="doc_id", match=models.MatchValue(value=doc_id))])
        ),
    )


def list_documents() -> list[dict]:
    s = get_settings()
    docs: dict[str, dict] = defaultdict(lambda: {"chunks": 0})
    offset = None
    while True:
        points, offset = client().scroll(
            s.qdrant_collection,
            limit=256,
            offset=offset,
            with_payload=["doc_id", "source", "category", "kind", "origin"],
            with_vectors=False,
        )
        for p in points:
            kind = p.payload.get("kind")
            if kind:  # synced database records: one summary row per kind instead of thousands of rows
                d = docs[f"synced:{kind}"]
                d.update(doc_id=f"synced:{kind}", source=f"Synced from the database: {kind}", category=kind, synced=True)
            else:
                d = docs[p.payload["doc_id"]]
                d.update(doc_id=p.payload["doc_id"], source=p.payload["source"], category=p.payload["category"],
                         origin=p.payload.get("origin", "upload"), synced=False)
            d["chunks"] += 1
        if offset is None:
            break
    return sorted(docs.values(), key=lambda d: d["source"])
