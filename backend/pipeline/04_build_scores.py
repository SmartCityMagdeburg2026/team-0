"""Phase 4 - join everything into the API data contract.

Reads processed/{districts,rent,amenities}.json, normalizes each metric to 0-100
across the 40 districts, computes a weighted life_value_score, and writes
data/final/neighborhood_scores.json.
"""
import os
import json

HERE = os.path.dirname(__file__)
PROC = os.path.join(HERE, "..", "data", "processed")
FINAL = os.path.join(HERE, "..", "data", "final")

# default Life Value Score weights (over the dimensions we have data for now)
WEIGHTS = {
    "affordability": 0.25, "transit": 0.20, "fifteen_min": 0.20,
    "green": 0.10, "healthcare": 0.10, "future": 0.05,
}


def load(name):
    return json.load(open(os.path.join(PROC, name), encoding="utf-8"))


def normalize(values: dict, invert=False) -> dict:
    """name -> value  ->  name -> 0..100 (min-max). None passes through."""
    nums = [v for v in values.values() if v is not None]
    if not nums:
        return {k: None for k in values}
    lo, hi = min(nums), max(nums)
    out = {}
    for k, v in values.items():
        if v is None:
            out[k] = None
            continue
        s = 0.0 if hi == lo else (v - lo) / (hi - lo)
        out[k] = round(100 * (1 - s if invert else s))
    return out


def avg(*xs):
    vs = [x for x in xs if x is not None]
    return round(sum(vs) / len(vs)) if vs else None


def best_for(s):
    tags = []
    if (s["affordability_score"] or 0) >= 60:
        tags.append("budget-friendly")
    if (s["fifteen_min_score"] or 0) >= 70:
        tags.append("car-free living")
    if (s["green_score"] or 0) >= 60:
        tags.append("nature lovers")
    if (s["transit_score"] or 0) >= 70:
        tags.append("commuters")
    return tags[:3] or ["balanced"]


def main():
    os.makedirs(FINAL, exist_ok=True)
    districts = load("districts.json")
    rent = load("rent.json")
    amen = load("amenities.json")
    names = [d["area_name"] for d in districts]

    aff = normalize({n: rent.get(n, {}).get("rent_eur_sqm") for n in names}, invert=True)
    future = normalize({n: rent.get(n, {}).get("rent_growth_pct_2012_2024") for n in names})

    def cat_score(cat):
        return normalize({n: ((amen.get(n, {}) or {}).get(cat) or {}).get("count") for n in names})

    grocery, pharm, health = cat_score("grocery"), cat_score("pharmacy"), cat_score("healthcare")
    edu, park, gym = cat_score("school"), cat_score("park"), cat_score("gym")
    cafe, transit = cat_score("cafe"), cat_score("transit")

    out = []
    for d in districts:
        n = d["area_name"]
        s = {
            "affordability_score": aff[n],
            "transit_score": transit[n],
            "fifteen_min_score": avg(grocery[n], pharm[n], health[n], edu[n], park[n], cafe[n], transit[n]),
            "grocery_score": grocery[n], "pharmacy_score": pharm[n], "healthcare_score": health[n],
            "education_score": edu[n], "park_score": park[n], "green_score": park[n],
            "lifestyle_score": cafe[n], "gym_score": gym[n],
            "economic_score": None,            # KISS-MD socio-econ = Phase 6
            "future_value_score": future[n],
        }
        comp = {"affordability": s["affordability_score"], "transit": s["transit_score"],
                "fifteen_min": s["fifteen_min_score"], "green": s["green_score"],
                "healthcare": s["healthcare_score"], "future": s["future_value_score"]}
        num = den = 0.0
        for k, w in WEIGHTS.items():
            if comp[k] is not None:
                num += w * comp[k]
                den += w
        life = round(num / den) if den else None

        r = rent.get(n, {})
        conf = "high" if (r.get("rent_eur_sqm") is not None and amen.get(n)) else "low"
        out.append({
            **d, **s,
            "rent_eur_sqm": r.get("rent_eur_sqm"),
            "est_rent_50sqm": r.get("est_rent_50sqm"),
            "rent_proj_2026": r.get("rent_proj_2026"),
            "rent_growth_pct": r.get("rent_growth_pct_2012_2024"),
            "rent_series": r.get("series", []),
            "life_value_score": life,
            "best_for": best_for(s),
            "amenities": amen.get(n, {}),
            "data_confidence": conf,
        })

    out.sort(key=lambda d: (d["life_value_score"] or 0), reverse=True)
    with open(os.path.join(FINAL, "neighborhood_scores.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"wrote scores for {len(out)} districts -> final/neighborhood_scores.json")


if __name__ == "__main__":
    main()
