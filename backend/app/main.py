"""KiezKompass MD - API.

Serves data/final/neighborhood_scores.json. The file is reloaded automatically
whenever it changes on disk (so re-running the pipeline shows up without a
restart). Profile personalization is recomputed per request.
"""
import os
import re
import json
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, "..", ".env"), override=True)  # backend/.env wins over stale shell vars
DATA = os.path.join(HERE, "..", "data", "final", "neighborhood_scores.json")
GEO_PATH = os.path.join(HERE, "..", "data", "processed", "districts.geojson")
POINTS_PATH = os.path.join(HERE, "..", "data", "processed", "amenity_points.json")

_cache = {"mt": None, "areas": [], "by_id": {}, "geo": None, "points": {}}


def store():
    """Return cached data, reloading from disk whenever the scores file changes."""
    try:
        mt = os.path.getmtime(DATA)
    except OSError:
        mt = None
    if mt != _cache["mt"]:
        areas = json.load(open(DATA, encoding="utf-8"))
        by_id = {a["area_id"]: a for a in areas}
        geo = json.load(open(GEO_PATH, encoding="utf-8"))
        for f in geo.get("features", []):
            a = by_id.get(f["properties"].get("area_id"))
            if a:
                f["properties"]["area_name"] = a["area_name"]
                f["properties"]["life_value_score"] = a.get("life_value_score")
        points = json.load(open(POINTS_PATH, encoding="utf-8")) if os.path.exists(POINTS_PATH) else {}
        _cache.update(mt=mt, areas=areas, by_id=by_id, geo=geo, points=points)
    return _cache


# profile -> weight vector over scoring dimensions
PROFILE_WEIGHTS = {
    "general":      {"affordability": .25, "transit": .20, "fifteen_min": .20, "green": .10, "healthcare": .10, "future": .15},
    "student":      {"affordability": .35, "transit": .25, "fifteen_min": .20, "green": .05, "healthcare": .05, "future": .10},
    "professional": {"affordability": .20, "transit": .30, "fifteen_min": .20, "green": .10, "healthcare": .05, "future": .15},
    "family":       {"affordability": .25, "transit": .15, "fifteen_min": .15, "green": .25, "healthcare": .20, "future": .00},
    "senior":       {"affordability": .20, "transit": .25, "fifteen_min": .20, "green": .10, "healthcare": .25, "future": .00},
}
DIM = {
    "affordability": "affordability_score", "transit": "transit_score",
    "fifteen_min": "fifteen_min_score", "green": "green_score",
    "healthcare": "healthcare_score", "future": "future_value_score",
}


def score_for(area: dict, profile: str) -> int:
    w = PROFILE_WEIGHTS.get(profile, PROFILE_WEIGHTS["general"])
    num = den = 0.0
    for key, weight in w.items():
        v = area.get(DIM[key])
        if v is not None:
            num += weight * v
            den += weight
    return round(num / den) if den else (area.get("life_value_score") or 0)


app = FastAPI(title="KiezKompass MD API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


@app.get("/api/health")
def health():
    import sys
    return {
        "status": "ok",
        "districts": len(store()["areas"]),
        "ai_ready": bool(os.getenv("DEEPSEEK_API_KEY")) and OpenAI is not None,
        "has_key": bool(os.getenv("DEEPSEEK_API_KEY")),
        "has_openai": OpenAI is not None,
        "env_path": os.path.abspath(os.path.join(HERE, "..", ".env")),
        "python": sys.executable,
    }


@app.get("/api/geojson")
def geojson():
    return store()["geo"]


@app.get("/api/amenities/{area_id}")
def amenity_points(area_id: str):
    s = store()
    a = s["by_id"].get(area_id)
    if not a:
        raise HTTPException(404, "unknown area")
    return s["points"].get(a["area_name"], [])


@app.get("/api/areas")
def list_areas(profile: str = "general"):
    res = [{**a, "match_score": score_for(a, profile)} for a in store()["areas"]]
    res.sort(key=lambda a: a["match_score"], reverse=True)
    return res


@app.get("/api/areas/{area_id}")
def get_area(area_id: str):
    a = store()["by_id"].get(area_id)
    if not a:
        raise HTTPException(404, "unknown area")
    return a


class RecommendIn(BaseModel):
    budget: Optional[int] = None
    profile: str = "general"
    priorities: list[str] = []


@app.post("/api/recommend")
def recommend(q: RecommendIn):
    res = []
    for a in store()["areas"]:
        if q.budget and a.get("est_rent_50sqm") and a["est_rent_50sqm"] > q.budget:
            continue
        res.append({
            "area_id": a["area_id"], "area_name": a["area_name"],
            "match_score": score_for(a, q.profile),
            "est_rent_50sqm": a.get("est_rent_50sqm"),
            "life_value_score": a.get("life_value_score"),
            "best_for": a.get("best_for"),
        })
    res.sort(key=lambda a: a["match_score"], reverse=True)
    return {"profile": q.profile, "budget": q.budget, "results": res[:5]}


@app.get("/api/compare")
def compare(area1: str, area2: str):
    by_id = store()["by_id"]
    a, b = by_id.get(area1), by_id.get(area2)
    if not a or not b:
        raise HTTPException(404, "unknown area")
    return {"area1": a, "area2": b}


class HiddenCostIn(BaseModel):
    area_id: str
    apartment_size: int = 50
    transport_mode: str = "tram"


TICKET = {"walk": 0, "bike": 0, "tram": 58, "car": 300}


@app.post("/api/hidden-cost")
def hidden_cost(q: HiddenCostIn):
    a = store()["by_id"].get(q.area_id)
    if not a:
        raise HTTPException(404, "unknown area")
    rent = round((a.get("rent_eur_sqm") or 0) * q.apartment_size)
    utilities = round(2.5 * q.apartment_size)
    transport = TICKET.get(q.transport_mode, 58)
    total = rent + utilities + transport
    return {
        "area": a["area_name"], "rent": rent, "utilities": utilities,
        "transport": transport, "total_monthly_cost": total,
    }


class ChatIn(BaseModel):
    message: str = ""


@app.post("/api/chat")
def chat(q: ChatIn):
    """Rule-based NL parse (swap in Claude later via ANTHROPIC_API_KEY)."""
    msg = q.message.lower()
    budget = None
    m = re.search(r"(\d{3,4})\s*(?:euro|eur|€)?", msg)
    if m:
        budget = int(m.group(1))
    profile = next((p for p in PROFILE_WEIGHTS if p in msg), "general")
    rec = recommend(RecommendIn(budget=budget, profile=profile))
    top = rec["results"][:3]
    names = ", ".join(r["area_name"] for r in top) or "no matches in budget"
    return {
        "parsed": {"budget": budget, "profile": profile},
        "reply": f"Based on a {profile} profile" + (f" under €{budget}" if budget else "") + f", your best areas are: {names}.",
        "results": top,
    }


# ----------------------------------------------------------------- AI assistant
try:
    from rank_bm25 import BM25Okapi
except Exception:
    BM25Okapi = None
try:
    from openai import OpenAI
except Exception:
    OpenAI = None

KB_PATH = os.path.join(HERE, "..", "data", "processed", "kb.json")
_kb = {"loaded": False, "kb": [], "bm25": None}


def _tok(s):
    return re.findall(r"\w+", s.lower())


def get_kb():
    if not _kb["loaded"]:
        try:
            kb = json.load(open(KB_PATH, encoding="utf-8"))
        except OSError:
            kb = []
        bm25 = BM25Okapi([_tok(c["text"]) for c in kb]) if (kb and BM25Okapi) else None
        _kb.update(loaded=True, kb=kb, bm25=bm25)
    return _kb


def kb_search(query, k=4):
    kb = get_kb()
    if not kb["bm25"]:
        return []
    scores = kb["bm25"].get_scores(_tok(query))
    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    return [kb["kb"][i] for i in order if scores[i] > 0]


PRIORITY_DIM = {
    "affordable": "affordability_score", "affordability": "affordability_score", "cheap": "affordability_score",
    "green": "green_score", "nature": "green_score", "quiet": "green_score", "parks": "green_score",
    "healthcare": "healthcare_score", "health": "healthcare_score",
    "transit": "transit_score", "night transit": "transit_score", "tram": "transit_score", "commute": "transit_score",
    "cafe": "lifestyle_score", "cafes": "lifestyle_score", "lifestyle": "lifestyle_score",
    "schools": "education_score", "school": "education_score",
    "city center": "fifteen_min_score", "central": "fifteen_min_score", "amenities": "fifteen_min_score",
}


def run_recommend(budget=None, profile="general", priorities=None):
    priorities = priorities or []
    out = []
    for a in store()["areas"]:
        if a.get("rent_eur_sqm") is None or a.get("life_value_score") is None:
            continue
        base = score_for(a, profile)
        vals = [a.get(PRIORITY_DIM[p.lower()]) for p in priorities
                if p.lower() in PRIORITY_DIM and a.get(PRIORITY_DIM[p.lower()]) is not None]
        bonus = (sum(vals) / len(vals) - 50) * 0.35 if vals else 0
        cold = round((a.get("rent_eur_sqm") or 0) * 50)
        total = cold + 125 + 58
        if budget and total > budget:
            continue
        out.append({
            "area_id": a["area_id"], "area_name": a["area_name"],
            "match_score": round(max(0, min(100, base + bonus))),
            "est_rent_50sqm": cold, "total_monthly": total,
            "life_value_score": a.get("life_value_score"), "best_for": a.get("best_for"),
        })
    out.sort(key=lambda x: x["match_score"], reverse=True)
    return out[:5]


TOOLS = [{
    "type": "function",
    "function": {
        "name": "recommend_districts",
        "description": "Rank Magdeburg districts for a person using the live scored dataset. Use for any request to find, recommend or compare areas, or anything about budget, rent, or the 'best' district.",
        "parameters": {
            "type": "object",
            "properties": {
                "budget": {"type": "integer", "description": "max total monthly housing budget in EUR (optional)"},
                "profile": {"type": "string", "enum": ["general", "student", "professional", "family", "senior"]},
                "priorities": {"type": "array", "items": {"type": "string"},
                               "description": "e.g. affordable, green, healthcare, transit, schools, quiet, city center"},
            },
        },
    },
}]


class AssistantIn(BaseModel):
    message: str = ""
    history: list[dict] = []


def _fallback(message: str):
    msg = message.lower()
    m = re.search(r"(\d{3,4})", msg)
    budget = int(m.group(1)) if m else None
    profile = next((p for p in PROFILE_WEIGHTS if p in msg), "general")
    prios = [w for w in PRIORITY_DIM if w in msg]
    results = run_recommend(budget, profile, prios)
    names = ", ".join(r["area_name"] for r in results[:3]) or "no matches in budget"
    return {
        "reply": f"Best areas for a {profile} profile" + (f" under €{budget}" if budget else "") + f": {names}. (Set DEEPSEEK_API_KEY for full answers.)",
        "results": results, "sources": [],
    }


@app.post("/api/assistant")
def assistant(q: AssistantIn):
    ctx = kb_search(q.message, 4)
    sources = list(dict.fromkeys(c["source"] for c in ctx))
    key = os.getenv("DEEPSEEK_API_KEY")
    if not key or not OpenAI:
        return _fallback(q.message)

    client = OpenAI(api_key=key, base_url="https://api.deepseek.com")
    system = (
        "You are KiezKompass MD, a Magdeburg neighborhood relocation assistant. Help people choose a district to live in. "
        "For ANY recommendation, budget, rent or 'best area' question, CALL recommend_districts and base your answer "
        "strictly on its numbers - never invent figures. For descriptive or knowledge questions use the CONTEXT below; "
        "if it doesn't cover the question, say so briefly. Be concise and friendly, and name districts.\n\nCONTEXT:\n"
        + "\n---\n".join(f"[{c['source']}] {c['text']}" for c in ctx)
    )
    msgs = [{"role": "system", "content": system}] + list(q.history) + [{"role": "user", "content": q.message}]
    results = []
    try:
        for _ in range(3):
            r = client.chat.completions.create(model="deepseek-chat", messages=msgs, tools=TOOLS, tool_choice="auto", temperature=0.3)
            m = r.choices[0].message
            if m.tool_calls:
                msgs.append({
                    "role": "assistant", "content": m.content,
                    "tool_calls": [{"id": tc.id, "type": "function",
                                    "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                                   for tc in m.tool_calls],
                })
                for tc in m.tool_calls:
                    args = json.loads(tc.function.arguments or "{}")
                    results = run_recommend(args.get("budget"), args.get("profile", "general"), args.get("priorities", []))
                    msgs.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(results)})
                continue
            return {"reply": m.content or "", "results": results, "sources": sources}
    except Exception as e:
        return {"reply": f"Assistant error: {e}", "results": [], "sources": sources}
    return {"reply": "Sorry, I couldn't complete that request.", "results": results, "sources": sources}
