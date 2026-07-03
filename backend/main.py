from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os

from demo import answer_question, list_sample_questions

load_dotenv()

app = FastAPI(title="Healthcare EDI Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PLACEHOLDER_KEYS = {"", "YOUR_OPENAI_KEY", "sk-your-real-key-here"}


class AskRequest(BaseModel):
    question: str


def is_demo_mode() -> bool:
    explicit = os.getenv("DEMO_MODE", "").lower()
    if explicit in ("1", "true", "yes"):
        return True
    if explicit in ("0", "false", "no"):
        return False
    key = (os.getenv("OPENAI_API_KEY") or "").strip()
    return key in PLACEHOLDER_KEYS or not key.startswith("sk-")


def get_openai_client():
    key = os.getenv("OPENAI_API_KEY")
    if not key or key.strip() in PLACEHOLDER_KEYS:
        return None
    return OpenAI(api_key=key)


@app.get("/")
def health():
    return {
        "status": "running",
        "application": "Healthcare EDI Copilot",
        "demo_mode": is_demo_mode(),
    }


@app.get("/samples")
def samples():
    return {"questions": list_sample_questions()}


@app.post("/ask")
def ask(payload: Optional[AskRequest] = None, question: Optional[str] = None):
    question = question or (payload.question if payload else "")
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    question = question.strip()

    if is_demo_mode():
        result = answer_question(question)
        return {
            "answer": result["answer"],
            "mode": "demo",
            "matched_id": result.get("matched_id"),
        }

    client = get_openai_client()
    if not client:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY or enable DEMO_MODE=true.",
        )

    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {
                "role": "system",
                "content": """
            You are a Healthcare EDI Specialist.

            Expertise:

            ANSI X12
            834
            837
            999
            277CA
            HIPAA
            Claim troubleshooting
            RCA generation
            """,
            },
            {"role": "user", "content": question},
        ],
    )

    return {
        "answer": response.choices[0].message.content,
        "mode": "openai",
    }
