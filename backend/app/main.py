"""Magdeburg Smart Living Navigator - API.

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

HERE = os.path.dirname(__file__)
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


app = FastAPI(title="Magdeburg Smart Living Navigator API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "districts": len(store()["areas"])}


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
