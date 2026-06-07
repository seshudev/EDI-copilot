import json
import re
from pathlib import Path

KNOWLEDGE_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_edi_knowledge.json"


def load_knowledge():
    with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
        return json.load(f)


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def answer_question(question: str) -> dict:
    """Match user question to sample knowledge using keyword overlap."""
    entries = load_knowledge()
    q_tokens = _tokenize(question)
    if not q_tokens:
        return {
            "answer": "Please enter a question about healthcare EDI (837, 834, 999, 277CA, HIPAA, etc.).",
            "source": "demo",
            "matched_id": None,
        }

    best = None
    best_score = 0

    for entry in entries:
        keywords = set(k.lower() for k in entry.get("keywords", []))
        keyword_tokens = set()
        for kw in keywords:
            keyword_tokens.update(_tokenize(kw))

        overlap = len(q_tokens & keyword_tokens)
        # Boost if question text appears in sample question
        sample_q = entry.get("question", "").lower()
        if any(tok in sample_q for tok in q_tokens):
            overlap += 2

        if overlap > best_score:
            best_score = overlap
            best = entry

    if best and best_score > 0:
        return {
            "answer": best["answer"],
            "source": "demo",
            "matched_id": best["id"],
            "sample_question": best.get("question"),
        }

    return {
        "answer": (
            "Demo mode: I could not find a close match in the sample knowledge base. "
            "Try one of the sample questions below, or ask about 837 claims, 999 AK901, "
            "277CA status, 834 enrollment, CLM02 duplicates, or HIPAA 5010 versions."
        ),
        "source": "demo",
        "matched_id": None,
    }


def list_sample_questions() -> list[dict]:
    entries = load_knowledge()
    return [
        {"id": e["id"], "question": e["question"]}
        for e in entries
    ]
