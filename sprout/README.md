# Sprout - Prospera RAG Assistant

Sprout is a standalone chat assistant (Retrieval-Augmented Generation) that answers questions about farming topics and about Prospera's courses, marketplace products, government schemes and services, using documents you provide.

It is independent of the main Prospera app: its own backend, frontend, config and ports.

| Part | Tech | Port |
|---|---|---|
| `backend/` | Python, FastAPI, OpenAI, Qdrant client | 8001 |
| `frontend/` | React + Vite | 5173 |
| Qdrant | Docker (`docker-compose.yml`) | 6333 |
| `knowledge/` | Starter documents (sub-folder name = category) | - |

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
   python -m app.cli ../knowledge  # load the starter documents
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
- Replace the starter files in `knowledge/` with your real content and re-run `python -m app.cli ../knowledge`.

## API

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/chat` | `X-API-Key` if `CHAT_API_KEY` is set | Body `{message, history[], category?}`; streams SSE events `sources`, `token`, `done`/`error` |
| `GET /api/documents` | `X-Admin-Key` | List documents |
| `POST /api/documents` | `X-Admin-Key` | Multipart upload (`file`, `category`) |
| `DELETE /api/documents/{doc_id}` | `X-Admin-Key` | Remove a document |
| `GET /api/health` | none | Status of the service, Qdrant and key config |

## Connecting the Prospera frontend later

Call `POST http://localhost:8001/api/chat` from Prospera's React app (add its origin to `CORS_ORIGINS`), or reuse `frontend/src/components/Chat.jsx`. For production, proxy the call through Prospera's Express server so the chat key stays server-side.

## Tests

```bash
cd sprout/backend
pytest
```
