# Backend Architecture — Magdeburg Smart Living Navigator

Deliberately simple. **No database** (40 districts = tiny). A one-time **pipeline**
turns open data into a single scored JSON; a thin **FastAPI** app serves it. The UI
calls REST endpoints. Personalization (profile weights) is recomputed per request —
no rebuild needed.

```
GitHub repo data ──fetch──▶ data/raw/ ──process──▶ data/processed/*.json
        (+ OSM Overpass)                                   │ join on district name
                                                           ▼
                                         data/final/neighborhood_scores.json
                                                           │  loaded into memory
                                                    FastAPI (app/main.py) ──▶ UI
```

## Folder layout
```
backend/
├── venv/                       # installed
├── requirements.txt            # installed
├── .env.example
├── architecture.md             # this file
├── data/
│   ├── raw/                    # downloaded sources (gitignored)
│   ├── processed/             # one JSON per source, keyed by district name
│   └── final/
│       └── neighborhood_scores.json   # the ONE file the API serves
├── pipeline/
│   ├── fetch_sources.py        # download the repo files we need
│   ├── 01_districts.py         # Stadtteile.geojson -> 40 districts (id, centroid, area)
│   ├── 02_rent.py              # Mietspiegel -> affordability + trend
│   ├── 03_osm_amenities.py     # Overpass -> per-district amenity counts
│   └── 04_build_scores.py      # join + normalize -> neighborhood_scores.json
└── app/
    ├── __init__.py
    └── main.py                 # FastAPI: health, areas, recommend, compare, hidden-cost, chat
```

## Data contract — `neighborhood_scores.json`
A list of 40 districts; each has identity + 0–100 sub-scores + a `life_value_score`:
```json
{ "area_id":"stadtfeld-ost", "area_name":"Stadtfeld Ost", "centroid":[11.60,52.13],
  "rent_eur_sqm":7.39, "est_rent_50sqm":520,
  "affordability_score":72, "transit_score":80, "fifteen_min_score":86,
  "grocery_score":90, "healthcare_score":70, "green_score":60, "future_value_score":70,
  "life_value_score":76, "best_for":["commuters"], "data_confidence":"high" }
```

## Scoring (transparent, 0–100)
- Each raw metric → **min-max normalized** across the 40 districts (rent is inverted: cheaper = higher).
- `life_value_score` = weighted sum over the dimensions that have data.
- **Profiles** (student/professional/family/senior) just swap the weight vector at request time.
- No supervised ML (no ground truth). k-means "personas" = optional stretch.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | status + district count |
| GET | `/api/areas?profile=` | all 40, scored for the profile |
| GET | `/api/areas/{id}` | one district detail |
| POST | `/api/recommend` | top-5 by budget + profile + priorities |
| GET | `/api/compare?area1=&area2=` | side-by-side |
| POST | `/api/hidden-cost` | rent + utilities + transport = total |
| POST | `/api/chat` | rule-based NL parse (Claude later) |

## Pragmatic choices — easy vs. not
| Want | Easy? | Decision |
|---|---|---|
| District polygons | ✅ repo `Stadtteile.geojson` | use directly |
| Rent + trend | ✅ repo Mietspiegel | use directly |
| Amenity access (15-min / healthcare / green) | ✅ one Overpass call | fetch once, commit |
| Transit | ⚠️ GTFS = 200 MB+ | **MVP = OSM stop density** (easy); full GTFS = later |
| Socio-econ (pop/jobs/economy/safety) | ⚠️ KISS-MD keyed by Stadtteil-**Nr**, needs crosswalk | **Phase 6 (later)** |
| Climate per district | ❌ one city station | skip as differentiator |
| Live weather/air/Elbe | ✅ CORS APIs | optional, call from UI directly |

## Phases
- [x] **0 · Scaffold + fetch** — folders, `.env`, download sources
- [x] **1 · Districts** — `01_districts.py` → 40 districts
- [x] **2 · Rent** — `02_rent.py` → affordability + 2012→2026 trend
- [x] **3 · Amenities** — `03_osm_amenities.py` → Overpass counts per district
- [x] **4 · Build scores** — `04_build_scores.py` → `neighborhood_scores.json`
- [x] **5 · API** — `app/main.py` serves it with profile personalization
- [ ] **6 · Later** — KISS-MD socio-econ (Nr↔name crosswalk), GTFS night transit, Claude chat, live APIs

Run order:
```bash
P=backend/venv/Scripts/python.exe
$P backend/pipeline/fetch_sources.py
$P backend/pipeline/01_districts.py
$P backend/pipeline/02_rent.py
$P backend/pipeline/03_osm_amenities.py
$P backend/pipeline/04_build_scores.py
$P -m uvicorn app.main:app --reload --port 8000   # from backend/
```
