# Healthcare EDI Copilot

Healthcare EDI Copilot is a small full stack assistant for healthcare EDI questions. It includes a FastAPI backend and a Next.js frontend that can answer from sample EDI knowledge in demo mode, or call OpenAI when an API key is configured.

## Features

- Chat-style UI for EDI questions
- Demo mode that works without an API key
- Sample knowledge for 837, 834, 999, 277CA, HIPAA 5010, and common claim rejection topics
- FastAPI endpoints for health, sample questions, and answers
- Next.js frontend with backend connection status

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- OpenAI API key, only if you want live model answers instead of demo mode

## Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
Copy-Item .env.example .env
```

For demo mode, keep this in `backend/.env`:

```text
DEMO_MODE=true
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-4o-mini
```

For OpenAI mode, set `DEMO_MODE=false` and replace `OPENAI_API_KEY` with your real key.

Start the API:

```powershell
cd backend
.\.venv\Scripts\uvicorn.exe main:app --reload --host 127.0.0.1 --port 8080
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend uses `http://127.0.0.1:8080` by default. To point it somewhere else, set:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
```

## API

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | GET | Health check and current mode |
| `/samples` | GET | Sample demo questions |
| `/ask` | POST | Ask the EDI copilot |

Example request:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8080/ask `
  -ContentType "application/json" `
  -Body '{"question":"What does AK901 mean on a 999 acknowledgment?"}'
```

## RAG Notes

`backend/rag.py` and `backend/vector_store.py` are reserved for a later retrieval workflow. They expect a PDF at `data/837_guide.pdf`. After adding the guide, you can build a FAISS index from a Python shell:

```python
from rag import load_documents
from vector_store import build_vectorstore

docs = load_documents()
db = build_vectorstore(docs)
db.save_local("data/faiss_index")
```

## Project Layout

```text
backend/     FastAPI backend and demo answer logic
frontend/    Next.js chat UI
data/        Sample EDI knowledge
docs/        Architecture and roadmap notes
```
