import uuid
from collections import defaultdict

from qdrant_client import QdrantClient, models

from .config import get_settings

_client: QdrantClient | None = None


def client() -> QdrantClient:
    global _client
    if _client is None:
        s = get_settings()
        _client = QdrantClient(url=s.qdrant_url, api_key=s.qdrant_api_key or None)
    return _client


def ensure_collection() -> None:
    s = get_settings()
    c = client()
    if not c.collection_exists(s.qdrant_collection):
        c.create_collection(
            s.qdrant_collection,
            vectors_config=models.VectorParams(size=s.embedding_dim, distance=models.Distance.COSINE),
        )
        c.create_payload_index(s.qdrant_collection, "doc_id", models.PayloadSchemaType.KEYWORD)
        c.create_payload_index(s.qdrant_collection, "category", models.PayloadSchemaType.KEYWORD)


def upsert(doc_id: str, source: str, category: str, chunks, vectors: list[list[float]]) -> None:
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
            with_payload=["doc_id", "source", "category"],
            with_vectors=False,
        )
        for p in points:
            d = docs[p.payload["doc_id"]]
            d.update(doc_id=p.payload["doc_id"], source=p.payload["source"], category=p.payload["category"])
            d["chunks"] += 1
        if offset is None:
            break
    return sorted(docs.values(), key=lambda d: d["source"])
