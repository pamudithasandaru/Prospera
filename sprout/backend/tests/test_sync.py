import json
from types import SimpleNamespace

import pytest

from app import vectorstore
from tests.conftest import ADMIN, fake_vector

SPRAYER = {
    "id": "p1",
    "title": "Backpack Sprayer 20L",
    "text": "Marketplace product: Backpack Sprayer 20L. Category: sprayers. Price: LKR 12,500. In stock (14).",
    "url": "/marketplace",
}
TRACTOR = {
    "id": "p2",
    "title": "Mini Tractor 25HP",
    "text": "Marketplace product: Mini Tractor 25HP. Category: tractors. Price: LKR 1,850,000. In stock (2).",
    "url": "/marketplace",
}
COURSE = {
    "id": "c1",
    "title": "Smart Irrigation Design",
    "text": "Course: Smart Irrigation Design. Drip and sprinkler systems for different crops. Level: advanced.",
    "url": "/learning/course/c1",
}


def sync(client, kind, records, headers=ADMIN):
    return client.post("/api/sync", json={"kind": kind, "records": records}, headers=headers)


def top_hit(query: str, category: str | None = None):
    vectorstore.ensure_collection()
    hits = vectorstore.search(fake_vector(query), 3, 0.0, category)
    return hits[0] if hits else None


# ── access control ──────────────────────────────────────────────────────────
@pytest.mark.parametrize(
    "method,path,body",
    [
        ("post", "/api/sync", {"kind": "product", "records": []}),
        ("post", "/api/sync/prune", {"kind": "product", "keep_ids": []}),
        ("delete", "/api/sync/product/p1", None),
        ("get", "/api/sync/status", None),
        ("post", "/api/sync/knowledge-files", {}),
    ],
)
def test_sync_endpoints_require_the_admin_key(client, method, path, body):
    kwargs = {"json": body} if body is not None else {}
    assert getattr(client, method)(path, **kwargs).status_code == 401
    assert getattr(client, method)(path, headers={"X-Admin-Key": "wrong"}, **kwargs).status_code == 401


# ── upsert / replace ────────────────────────────────────────────────────────
def test_sync_stores_records_and_reports_status(client):
    r = sync(client, "product", [SPRAYER, TRACTOR])
    assert r.status_code == 200 and r.json() == {"kind": "product", "upserted": 2}
    sync(client, "course", [COURSE])

    st = client.get("/api/sync/status", headers=ADMIN).json()
    assert st["kinds"]["product"]["count"] == 2
    assert st["kinds"]["course"]["count"] == 1
    assert st["kinds"]["product"]["last_synced"]
    assert st["synced_records"] == 3 and st["documents"] == 0


def test_records_are_searchable_with_their_page_link(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    hit = top_hit("how much is the backpack sprayer")
    assert hit.payload["source"] == "Backpack Sprayer 20L"
    assert hit.payload["url"] == "/marketplace"
    assert hit.payload["kind"] == "product" and hit.payload["category"] == "product"
    assert top_hit("tractor horsepower price").payload["record_id"] == "p2"


def test_category_filter_separates_kinds(client):
    sync(client, "product", [SPRAYER])
    sync(client, "course", [COURSE])
    assert top_hit("irrigation systems", "course").payload["kind"] == "course"
    # the sprayer product also matches this query, but a course filter only ever returns courses
    vectorstore.ensure_collection()
    hits = vectorstore.search(fake_vector("sprayer irrigation systems"), 5, 0.0, "course")
    assert hits and {h.payload["kind"] for h in hits} == {"course"}


def test_resync_replaces_instead_of_duplicating(client):
    sync(client, "product", [SPRAYER])
    changed = {**SPRAYER, "text": "Marketplace product: Backpack Sprayer 20L. Price: LKR 9,900. Out of stock."}
    sync(client, "product", [changed])

    assert client.get("/api/sync/status", headers=ADMIN).json()["kinds"]["product"]["count"] == 1
    assert "9,900" in top_hit("backpack sprayer price").payload["text"]
    assert "12,500" not in top_hit("backpack sprayer price").payload["text"]


def test_duplicate_ids_in_one_batch_keep_the_last(client):
    sync(client, "product", [SPRAYER, {**SPRAYER, "text": "Marketplace product: Backpack Sprayer 20L. Newer."}])
    assert client.get("/api/sync/status", headers=ADMIN).json()["kinds"]["product"]["count"] == 1
    assert "Newer" in top_hit("sprayer").payload["text"]


def test_empty_batch_is_fine(client):
    assert sync(client, "product", []).json() == {"kind": "product", "upserted": 0}


def test_long_text_is_trimmed_before_storing(client):
    sync(client, "course", [{"id": "big", "title": "Big course", "text": "word " * 1500}])  # 7,500 chars
    assert len(top_hit("word").payload["text"]) <= 3000


# ── prune / delete ──────────────────────────────────────────────────────────
def test_prune_removes_records_deleted_in_the_database(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    sync(client, "course", [COURSE])

    r = client.post("/api/sync/prune", json={"kind": "product", "keep_ids": ["p1"]}, headers=ADMIN)
    assert r.json() == {"kind": "product", "deleted": 1}

    st = client.get("/api/sync/status", headers=ADMIN).json()["kinds"]
    assert st["product"]["count"] == 1 and st["course"]["count"] == 1  # other kinds untouched
    vectorstore.ensure_collection()
    hits = vectorstore.search(fake_vector("mini tractor 25HP price"), 5, 0.0, "product")
    assert [h.payload["record_id"] for h in hits] == ["p1"]  # the pruned tractor (p2) is gone


def test_prune_with_everything_kept_deletes_nothing(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    r = client.post("/api/sync/prune", json={"kind": "product", "keep_ids": ["p1", "p2"]}, headers=ADMIN)
    assert r.json()["deleted"] == 0


def test_delete_single_record(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    assert client.delete("/api/sync/product/p1", headers=ADMIN).status_code == 200
    assert client.get("/api/sync/status", headers=ADMIN).json()["kinds"]["product"]["count"] == 1
    assert client.delete("/api/sync/product/never-existed", headers=ADMIN).status_code == 200  # idempotent


# ── validation ──────────────────────────────────────────────────────────────
@pytest.mark.parametrize(
    "payload",
    [
        {"kind": "users", "records": []},  # not an allowed kind
        {"kind": "product", "records": [{**SPRAYER, "url": "https://evil.example/phish"}]},
        {"kind": "product", "records": [{**SPRAYER, "url": "//evil.example/x"}]},
        {"kind": "product", "records": [{**SPRAYER, "title": ""}]},
        {"kind": "product", "records": [{**SPRAYER, "id": ""}]},
        {"kind": "product", "records": [{**SPRAYER, "text": "x" * 8001}]},
        {"kind": "product", "records": [{**SPRAYER, "id": f"p{i}"} for i in range(501)]},
    ],
)
def test_invalid_sync_requests_are_rejected(client, payload):
    assert client.post("/api/sync", json=payload, headers=ADMIN).status_code == 422
    assert client.get("/api/sync/status", headers=ADMIN).json()["synced_records"] == 0


def test_site_relative_url_is_accepted_and_optional(client):
    r = sync(client, "scheme", [{"id": "s1", "title": "Fertilizer subsidy", "text": "Subsidy for fertilizer."}])
    assert r.status_code == 200
    assert top_hit("fertilizer").payload["url"] == ""


# ── Documents tab integration ───────────────────────────────────────────────
def test_documents_list_groups_synced_records_into_one_row_per_kind(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    client.post("/api/documents", files={"file": ("tips.md", b"# Tips\n\nWater early.")}, data={"category": "farming"}, headers=ADMIN)

    docs = client.get("/api/documents", headers=ADMIN).json()
    synced = [d for d in docs if d["doc_id"].startswith("synced:")]
    assert len(docs) == 2 and len(synced) == 1
    assert synced[0]["doc_id"] == "synced:product" and synced[0]["chunks"] == 2 and synced[0]["synced"] is True


def test_deleting_the_synced_row_removes_that_whole_kind(client):
    sync(client, "product", [SPRAYER, TRACTOR])
    sync(client, "course", [COURSE])
    assert client.delete("/api/documents/synced:product", headers=ADMIN).status_code == 200
    st = client.get("/api/sync/status", headers=ADMIN).json()["kinds"]
    assert "product" not in st and st["course"]["count"] == 1


# ── knowledge folder sync ───────────────────────────────────────────────────
@pytest.fixture
def knowledge(tmp_path, monkeypatch):
    (tmp_path / "farming").mkdir()
    (tmp_path / "guides").mkdir()
    (tmp_path / "farming" / "soil.md").write_text("# Soil\n\nCompost improves soil health.", encoding="utf-8")
    (tmp_path / "guides" / "market.md").write_text("# Sell on the market\n\n1. Open Wholesale Market.", encoding="utf-8")
    (tmp_path / "notes.exe").write_bytes(b"ignored")
    monkeypatch.setenv("KNOWLEDGE_DIR", str(tmp_path))
    from app.config import get_settings

    get_settings.cache_clear()
    return tmp_path


def test_knowledge_files_are_ingested_with_folder_names_as_categories(client, knowledge):
    r = client.post("/api/sync/knowledge-files", json={}, headers=ADMIN).json()
    assert {(d["source"], d["category"]) for d in r["ingested"]} == {("soil.md", "farming"), ("market.md", "guides")}
    assert r["removed"] == []
    assert top_hit("wholesale market how to sell", "guides").payload["source"] == "market.md"


def test_knowledge_sync_prunes_deleted_files_but_never_hand_uploaded_docs(client, knowledge):
    client.post("/api/sync/knowledge-files", json={}, headers=ADMIN)
    client.post("/api/documents", files={"file": ("manual.md", b"# Manual\n\nUploaded by an admin.")}, headers=ADMIN)

    (knowledge / "farming" / "soil.md").unlink()
    r = client.post("/api/sync/knowledge-files", json={"prune": True}, headers=ADMIN).json()
    assert r["removed"] == ["soil.md"]

    sources = {d["source"] for d in client.get("/api/documents", headers=ADMIN).json()}
    assert sources == {"market.md", "manual.md"}


def test_retired_starter_files_can_be_removed_by_name(client, knowledge):
    client.post("/api/documents", files={"file": ("prospera-courses.md", b"# Old\n\nStale course list.")}, headers=ADMIN)
    r = client.post("/api/sync/knowledge-files", json={"prune": False, "remove_sources": ["prospera-courses.md"]}, headers=ADMIN).json()
    assert r["removed"] == ["prospera-courses.md"]
    assert "prospera-courses.md" not in {d["source"] for d in client.get("/api/documents", headers=ADMIN).json()}


def test_missing_knowledge_folder_is_a_clean_400(client, monkeypatch, tmp_path):
    monkeypatch.setenv("KNOWLEDGE_DIR", str(tmp_path / "nope"))
    from app.config import get_settings

    get_settings.cache_clear()
    assert client.post("/api/sync/knowledge-files", json={}, headers=ADMIN).status_code == 400


# ── the chat actually uses synced data ──────────────────────────────────────
class _FakeLLM:
    """Stands in for OpenAI: records the prompt and streams a fixed reply."""

    def __init__(self):
        self.calls = []
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    async def _create(self, **kwargs):
        self.calls.append(kwargs)

        async def stream():
            for word in ("The", " sprayer", " costs", " LKR 12,500", " [1]"):
                yield SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=word))])

        return stream()


def _sse_events(text: str):
    return [json.loads(line[5:]) for line in text.splitlines() if line.startswith("data:")]


def test_chat_retrieves_synced_records_and_tells_the_model_the_page(client, monkeypatch):
    from app import rag

    llm = _FakeLLM()
    monkeypatch.setattr(rag, "openai_client", lambda: llm)
    sync(client, "product", [SPRAYER, TRACTOR])
    sync(client, "course", [COURSE])

    r = client.post("/api/chat", json={"message": "How much is the backpack sprayer?"})
    events = _sse_events(r.text)
    assert events[0]["type"] == "sources"
    first = events[0]["sources"][0]
    assert first["source"] == "Backpack Sprayer 20L" and first["url"] == "/marketplace"
    assert "".join(e["text"] for e in events if e["type"] == "token") == "The sprayer costs LKR 12,500 [1]"
    assert events[-1]["type"] == "done"

    system, *_, user = llm.calls[0]["messages"]
    assert "Haritha Bhoomi" in system["content"] and "Prospera" not in system["content"]
    assert "Information as of" in system["content"]  # the rule that makes prices carry a date
    assert "page: /marketplace" in user["content"] and "LKR 12,500" in user["content"]


def test_chat_category_filter_limits_retrieval_to_one_kind(client, monkeypatch):
    from app import rag

    monkeypatch.setattr(rag, "openai_client", lambda: _FakeLLM())
    sync(client, "product", [SPRAYER])
    sync(client, "course", [COURSE])
    r = client.post("/api/chat", json={"message": "sprayer irrigation", "category": "course"})
    kinds = {s["category"] for s in _sse_events(r.text)[0]["sources"]}
    assert kinds == {"course"}


# ── the real knowledge folder shipped in the repo ───────────────────────────
def _real_knowledge_dir():
    from pathlib import Path

    return Path(__file__).resolve().parents[2] / "knowledge"


def test_real_knowledge_folder_ingests_cleanly(client, monkeypatch):
    monkeypatch.delenv("KNOWLEDGE_DIR", raising=False)
    from app.config import get_settings

    get_settings.cache_clear()
    r = client.post("/api/sync/knowledge-files", json={}, headers=ADMIN).json()

    assert r["skipped"] == [], r["skipped"]
    categories = {d["category"] for d in r["ingested"]}
    assert categories == {"farming", "guides"}
    guides = [d for d in r["ingested"] if d["category"] == "guides"]
    assert len(guides) >= 10 and all(d["chunks"] >= 1 for d in r["ingested"])


def test_guides_use_the_current_brand_and_real_menu_names():
    import re

    folder = _real_knowledge_dir()
    texts = {p.name: p.read_text(encoding="utf-8") for p in folder.rglob("*.md")}
    assert texts, "no knowledge files found"
    for name, text in texts.items():
        assert "prospera" not in text.lower(), f"{name} still says Prospera"

    # Every "the **X** menu item" in a guide must be a real navigation title in the app.
    access = (folder.parents[1] / "client" / "src" / "config" / "access.js")
    if access.exists():
        titles = set(re.findall(r"title: '([^']+)'", access.read_text(encoding="utf-8")))
        assert "Wholesale Market" in titles
        for name, text in texts.items():
            for menu in re.findall(r"\*\*([A-Za-z ]+)\*\* menu item", text):
                assert menu in titles, f"{name} mentions a menu item that does not exist: {menu}"


def test_guides_do_not_promise_features_that_do_not_exist():
    # Guard against re-introducing claims found to be false when the guides were written.
    text = " ".join(p.read_text(encoding="utf-8").lower() for p in _real_knowledge_dir().rglob("*.md"))
    assert "my listings" not in text and "create new listing" not in text  # users cannot add wholesale listings
    assert "view cart" not in text and "checkout page" not in text
