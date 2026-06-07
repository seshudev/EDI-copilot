# Healthcare EDI Copilot

AI assistant for healthcare EDI (834, 837, 999, 277CA, HIPAA).

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key

## Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

Copy `backend/.env` and set your key:

```
OPENAI_API_KEY=sk-...
```

### Frontend

```powershell
cd frontend
npm install
```

## Run

**Terminal 1 — API (port 8000):**

```powershell
cd backend
.\.venv\Scripts\uvicorn.exe main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — UI (port 3000):**

```powershell
cd frontend
npm run dev
```

Open http://localhost:3000

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/ask?question=...` | POST | Ask the EDI copilot |

## RAG (Phase 2 — not wired to API yet)

`rag.py` and `vector_store.py` expect a PDF at `data/837_guide.pdf`. Add your guide there, then build the vector store from a Python shell:

```python
from rag import load_documents
from vector_store import build_vectorstore

docs = load_documents()
db = build_vectorstore(docs)
db.save_local("data/faiss_index")
```

## Project layout

```
backend/     FastAPI + OpenAI
frontend/    Next.js UI
docs/        Architecture & roadmap
data/        Knowledge PDFs (you provide)
```
