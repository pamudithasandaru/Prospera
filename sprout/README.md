# Sprout - Haritha Bhoomi RAG Assistant

Sprout is a chat assistant (Retrieval-Augmented Generation) for Haritha Bhoomi. It answers questions about farming, about the platform's products, wholesale listings, courses and government schemes, and about how to use the website.

It has its own backend, frontend, config and ports. The main platform API feeds it public catalogue data (see **Syncing the database** below); it never gets database access itself.

| Part | Tech | Port |
|---|---|---|
| `backend/` | Python, FastAPI, OpenAI, Qdrant client | 8001 |
| `frontend/` | React + Vite | 5173 |
| Qdrant | Docker (`docker-compose.yml`) | 6333 |
| `knowledge/` | Guides and farming documents (sub-folder name = category): `guides/` how to use the website, `farming/` agronomy | - |

## Setup

1. **Start Qdrant**
   ```bash
   cd sprout
   docker compose up -d
   ```
2. **Backend**
   ```bash
   cd sprout/backend
   python -m venv .venv
   .venv\Scripts\activate          # Windows  (Linux/macOS: source .venv/bin/activate)
   pip install -r requirements.txt
   copy .env.example .env          # then edit .env: set OPENAI_API_KEY and ADMIN_API_KEY
   python -m app.cli ../knowledge  # load the guides and farming documents
   uvicorn app.main:app --port 8001 --reload
   ```
   API docs: http://localhost:8001/docs
3. **Frontend**
   ```bash
   cd sprout/frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173

Never commit `.env`; it holds your OpenAI key.

## Using it

- **Chat tab:** ask questions. Answers stream in with numbered citations and expandable sources. The topic dropdown restricts retrieval to one category.
- **Documents tab:** enter the admin key (`ADMIN_API_KEY`), then upload PDF, DOCX, TXT or MD files (max 15 MB) with a category. Re-uploading a file with the same name replaces it.
- Add or edit files in `knowledge/` and re-run `python -m app.cli ../knowledge` (or, on a deployed server, click **Sync** on the Admin Panel's **Chatbot** tab, which re-reads the folder without any upload).
- Keep the guides in step with the website: they quote real menu and button names. A test (`tests/test_sync.py`) fails if a guide mentions a menu item that does not exist in `client/src/config/access.js`.

## API

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/chat` | `X-API-Key` if `CHAT_API_KEY` is set | Body `{message, history[], category?}`; streams SSE events `sources`, `token`, `done`/`error` |
| `GET /api/documents` | `X-Admin-Key` | List documents |
| `POST /api/documents` | `X-Admin-Key` | Multipart upload (`file`, `category`) |
| `DELETE /api/documents/{doc_id}` | `X-Admin-Key` | Remove a document |
| `GET /api/health` | none | Status of the service, Qdrant and key config |
| `POST /api/sync` | `X-Admin-Key` | Add or replace database records: `{kind, records:[{id,title,text,url?}]}`, kinds `product`, `listing`, `course`, `scheme`, `guide`; max 500 per call |
| `POST /api/sync/prune` | `X-Admin-Key` | `{kind, keep_ids[]}`: remove synced records that no longer exist |
| `DELETE /api/sync/{kind}/{id}` | `X-Admin-Key` | Remove one synced record |
| `GET /api/sync/status` | `X-Admin-Key` | Count and last-synced time per kind, plus document totals |
| `POST /api/sync/knowledge-files` | `X-Admin-Key` | Re-ingest `knowledge/` on this server; `{prune, remove_sources[]}` |

## Syncing the database

Products, wholesale listings, courses and government schemes live in the platform database. The platform API (`server/services/chatbotSync.js`) turns each record into a short text and pushes it to `POST /api/sync`; Sprout embeds it into Qdrant (one point per record, so a re-sync replaces rather than duplicates).

- **Only public catalogue fields** are sent. Users, emails, phone numbers, seller names, messages, loans, credit scores, tickets, farm finances, carts and applications are never read. A test checks that the sync code touches only the four public tables.
- Every record ends with "Information as of <date>", and the assistant is told to say prices and stock are as of that date and to point to the page.
- **When it syncs:** a few seconds after an admin or expert creates, edits or deletes a record; every `CHATBOT_SYNC_INTERVAL_HOURS` (default 6) as a full re-sync that also removes deleted records; and on demand from **Admin Panel > Chatbot**.
- **Setup on the platform API:** set `SPROUT_URL` and `SPROUT_ADMIN_KEY` (the same value as `ADMIN_API_KEY` here). Without them the feature is switched off and nothing else changes.
- Marketplace prices are quoted in US dollars because that is what the Marketplace page shows; wholesale prices are in LKR.

Synced records appear in the Documents tab as one summary row per kind (for example "Synced from the database: product"). Deleting that row removes the whole kind until the next sync.

## Connecting the website

The Haritha Bhoomi site calls `POST /api/chat` from its chat widget (`REACT_APP_SPROUT_URL`; add the site's address to `CORS_ORIGINS`). When an answer cites a product, course or scheme, the widget shows an "Open: ..." link to that page. Page links are site-relative paths only (`/marketplace`); Sprout rejects full URLs in synced records.

## Tests

```bash
cd sprout/backend
pytest
```

The tests use an in-memory Qdrant and fake embeddings, so they need no Qdrant server, no OpenAI key and make no network calls.
