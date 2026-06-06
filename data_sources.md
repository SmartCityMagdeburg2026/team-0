# Data Sources & Coverage Audit — KiezKompass MD

Audit of what the **Life Value Score** needs, what we already have, and where to
get the rest. Verdict first, detail below.

> **TL;DR — coverage is strong (~90%).** The repo provides the spatial backbone
> (district polygons), district-level rent, and district-level socio-economics.
> Only **two things must be fetched externally: OSM amenity POIs and GTFS
> transit.** Climate is the one genuinely weak (city-level only) factor.

Legend: ✅ in repo · 🔌 fetch from open API · 🟡 partial / proxy · ❌ not available

---

## 0. Spatial backbone (the join key)

| Asset | File | Notes |
|---|---|---|
| **District boundaries** | ✅ `data/Stadtteile/Stadtteile.geojson` | **40 Stadtteile**, properties `name` + `admin_level`, sourced from OSM (ODbL). |

**`name` is the canonical join key** for every district-level table. Mietspiegel
covers 37/34 of these 40; ~4–6 peripheral districts (Barleber See, Kreuzhorst,
Beyendorfer Grund, Zipkeleben, Pechau, Randau-Calenberge) have little/no rent or
amenity data → flag as low-confidence or exclude from ranking.

---

## 1. Coverage matrix — Life Value Score dimensions

| Dimension (idea.md) | Data needed | Status | Source | Unit |
|---|---|---|---|---|
| **Affordability** | rent €/m² per district | ✅ | `data/mietspiegel-2024/*.json` (2012–26) | district |
| ↳ backup / finer rent | grid rent | ✅ | `data/Zensus/ZensusMiete.geojson` | 100 m grid |
| **Transit accessibility** | stops, frequency, night service | 🔌 | GTFS `gtfs.de` nv_free (MVB/marego) | computed→district |
| ↳ car-dependence proxy | vehicles per district | ✅ | KISS-MD `kraftfahrzeugbestand…nach-stadtteilen` | district |
| **15-min city — grocery** | supermarkets/discounters | 🔌 | OSM Overpass `shop=supermarket` | points→district |
| **15-min city — pharmacy** | pharmacies | 🔌 | OSM `amenity=pharmacy` | points→district |
| **15-min city — cafés/lifestyle** | cafés | ✅ | `data/CafesOSM/CafesOSM.geojson` (+ OSM gyms/restaurants 🔌) | points→district |
| **Healthcare access** | hospitals, doctors | 🔌 | OSM `amenity=hospital/doctors/clinic` | points→district |
| **Education access** | schools | ✅ | KISS-MD `schulen…nach-stadtteilen` | district |
| ↳ universities | OVGU, HS Magdeburg-Stendal | 🔌 | OSM `amenity=university` (fixed coords) | points |
| **Green space access** | parks, trees | ✅🔌 | `data/Baumkataster/Baumkataster.geojson` (trees) + OSM `leisure=park`,`landuse=forest/grass` 🔌 | mixed→district |
| **Economic opportunity** | employed residents, businesses | ✅ | KISS-MD `…beschaeftigte…nach-stadtteilen`, `gewerbeanmeldungen…`, `handwerksbetriebe…`, `unternehmen-der-ihk…nach-stadtteilen` | district |
| **Population growth** | district pop over time | ✅ | KISS-MD `bevoelkerung-nach-stadtteilen/` (`entwicklung-der-hauptwohnsitzbevoelkerung…`) + `data/Zensus/ZensusBev.geojson` | district / grid |
| ↳ age structure (best_for) | age groups by district | ✅ | KISS-MD `hauptwohnsitzbevoelkerung-nach-altersgruppen` [Stadtteil] | district |
| ↳ density | inhabitants/km² | ✅ | KISS-MD `flaeche-und-einwohnerdichte` [Stadtteil] | district |
| **Future growth potential** | construction momentum, trend | ✅ | KISS-MD `…baugenehmigungen/baufertigstellungen…nach-stadtteilen` + Mietspiegel 2025–26 projection + `isek_2030_plus_stadtteile.pdf` | district |
| **Safety / stability** (families) | crime, accidents | ✅ | KISS-MD `erfasste-straftaten…nach-stadtteilen`, `unfallgeschehen…nach-stadtteilen` + `data/Unfaelle/Magdeburg_Unfallatlas.geojson` | district |
| **Climate comfort** | temperature/heat | 🟡 | `data/sensor-data/json/klima-tag.json`,`klima-monat.json` (DWD stn 03126) | **city only (uniform)** |
| **Live context** (AI panel) | weather, air, river | 🔌 | Bright Sky, Sensor.Community, PEGELONLINE | city/point |

---

## 1b. Page-by-page — required vs. available data

The same data cut by **screen**. **Pages 5 (Hidden Cost) and 6 (Future Predictor)
are fully buildable from repo data today; the rest unblock once OSM POIs + GTFS
land.** (Daily Life Simulator was dropped.) ⚙️ = constant/assumption, no dataset.

| # | Page | Decision question | Buildable now? |
|---|---|---|---|
| 1 | Home / Recommendation | Where should I live? | ⏳ needs OSM + GTFS (full score) |
| 2 | Living Value Map | Which areas are best value? | ⏳ boundaries ✅, score needs OSM + GTFS |
| 3 | Affordability × Liveability | Affordable *and* liveable? | ⏳ axes ✅, Y-score needs OSM + GTFS |
| 4 | 15-Minute City Explorer | Daily needs reachable? | ⏳ most POI-heavy — needs OSM + GTFS |
| 5 | Hidden Cost Analyzer | Real monthly cost? | ✅ now (repo only) |
| 6 | Future Predictor | Good long-term? | ✅ now (repo only) |
| 7 | Area Comparison | Which area is better? | ⏳ rent/future rows ✅, access rows need OSM + GTFS |
| 8 | AI Relocation Assistant | Can I ask naturally? | ⏳ scores need OSM + GTFS; live rail needs live APIs |

**Page 1 · Home / Recommendation** — needs the aggregate `life_value_score` + profile weights (logic)

| Required | Status |
|---|---|
| District identity + centroid | ✅ `Stadtteile.geojson` |
| Affordability + est. rent | ✅ Mietspiegel |
| Pop / jobs / economy / safety sub-scores | ✅ KISS-MD `…nach-stadtteilen` |
| Transit score | 🔌 GTFS |
| 15-min / healthcare / green scores | 🔌 OSM (café✅, schools ✅, trees ✅) |

**Page 2 · Living Value Map**

| Required | Status |
|---|---|
| District polygons (the hero visual) | ✅ `Stadtteile.geojson` |
| Per-district score + sub-scores (coloring + side panel) | ✅ rent + socio-econ · 🔌 OSM + GTFS |

**Page 3 · Affordability × Liveability Matrix**

| Required | Status |
|---|---|
| X = est. monthly cost | ✅ Mietspiegel + ⚙️ constants |
| Y = Life Value Score | 🔌 needs OSM + GTFS |
| Bubble size = population | ✅ KISS-MD population |

**Page 4 · 15-Minute City Explorer** — the most data-hungry page

| Required | Status |
|---|---|
| Grocery, pharmacy, hospital, doctors, gym | 🔌 OSM Overpass |
| Café | ✅ `CafesOSM.geojson` |
| School / University | ✅ KISS-MD schools · 🔌 OSM universities |
| Park / green | ✅ `Baumkataster.geojson` · 🔌 OSM parks |
| Transit stop | 🔌 GTFS |
| Boundaries (“within 15 min”) | ✅ `Stadtteile.geojson` |

**Page 5 · Hidden Cost Analyzer** — ✅ buildable now

| Required | Status |
|---|---|
| Rent €/m² per district + city average | ✅ Mietspiegel |
| Utilities €2.5/m², Deutschlandticket €58, car | ⚙️ constants (no dataset) |

**Page 6 · Future Neighborhood Predictor** — ✅ buildable now

| Required | Status |
|---|---|
| Rent trend 2012–26 (+ projection) | ✅ Mietspiegel |
| Construction momentum | ✅ `…baugenehmigungen/baufertigstellungen…nach-stadtteilen` |
| Population trend | ✅ `bevoelkerung-nach-stadtteilen/` |
| Strategy context | ✅ `isek_2030_plus_stadtteile.pdf` |

**Page 7 · Area Comparison**

| Required | Status |
|---|---|
| Rent, total cost, future value, socio rows | ✅ Mietspiegel + KISS-MD |
| Transit, 15-min, healthcare, green rows | 🔌 OSM + GTFS |

**Page 8 · AI Relocation Assistant**

| Required | Status |
|---|---|
| Scores dataset (for recommendations) | ✅ rent + socio · 🔌 OSM + GTFS |
| RAG knowledge base | ✅ `data/rag/` |
| NL → structured filters (LLM) | ⚙️ Claude API (no dataset) |
| Live rail: weather / tram / air | 🔌 Bright Sky / GTFS-RT / Sensor.Community |

> **Build order:** ship Pages 5 & 6 from repo data → fetch OSM + GTFS → unblock
> Pages 1–4 & 7 → wire Page 8 (scores + live APIs).

---

## 2. What we already have (repo) — no fetching needed

**Geo / spatial**
- `data/Stadtteile/Stadtteile.geojson` — 40 district polygons (join key `name`)
- `data/Zensus/ZensusBev.geojson`, `ZensusMiete.geojson` — census population & rent (100 m grid)
- `data/Baumkataster/Baumkataster.geojson` — municipal tree cadastre (green/canopy)
- `data/CafesOSM/CafesOSM.geojson` — cafés (OSM, pre-extracted)
- `data/Unfaelle/Magdeburg_Unfallatlas.geojson` — accident points

**Rent / affordability**
- `data/mietspiegel-2024/nach-wohnflaeche.json` (37 districts × 4 size classes, 2012–26)
- `data/mietspiegel-2024/nach-baualter.json` (34 districts × 6 era classes, 2012–26)
- ⚠️ District **averages**, not listings. Nettokaltmiete only → add Nebenkosten (~€2.5–4/m²). 2025–26 are **projected**. ~16–24 % cells `null` (small sample).

**District-level KISS-MD (29 of 322 datasets `nach Stadtteilen`)** — the socio-economic spine:
- Population: `bevoelkerung-nach-stadtteilen/` (development over time, age groups, density, households, foreign pop)
- Employment: `sozialversicherungspflichtig-beschaeftigte-am-wohnort-nach-stadtteilen…` (×2)
- Economy: `gewerbeanmeldungen…`, `handwerksbetriebe…`, `unternehmen-der-ihk…nach-stadtteilen`
- Housing/construction: `baufertigstellungen…`, `erteilte-baugenehmigungen…`, `wohnungsbestand…`, `wohngeldempfaenger…`, `abgaenge-durch-abbrueche…` (all `nach-stadtteilen`)
- Education: `schulen-in-der-stadt-magdeburg-nach-stadtteilen`
- Safety: `erfasste-straftaten…nach-stadtteilen`, `unfallgeschehen…nach-stadtteilen`
- Transport: `kraftfahrzeugbestand…nach-stadtteilen`

**City-level context (not district-resolved, use as backdrop):**
- Climate: `data/sensor-data/json/klima-tag.json` (1881→), `klima-monat.json` (1834→), DWD station 03126
- Finance: `data/steuereinnahmen/` (tax revenue 2010–25, rates 1991–2026)
- Strategy / RAG: `data/rag/` incl. `isek_2030_plus_stadtteile.pdf` (urban-development plan by district)

---

## 3. What to fetch externally (only two real jobs)

### A) OSM amenity POIs → `fetch_osm_pois.py` (Overpass)
Cafés already exist; fetch the rest within the city bbox `52.05,11.55,52.20,11.75`:
```
[out:json][timeout:90];
( nwr["shop"~"supermarket|convenience|greengrocer"]({{bbox}});
  nwr["amenity"~"pharmacy|hospital|doctors|clinic|university|cafe|restaurant"]({{bbox}});
  nwr["leisure"~"fitness_centre|park|sports_centre"]({{bbox}});
  nwr["landuse"~"forest|grass|recreation_ground"]({{bbox}}); );
out center tags;
```
Endpoint `https://overpass-api.de/api/interpreter` (rate-limited ~2 req/s → fetch
once, commit JSON). Then point-in-polygon into `Stadtteile.geojson`, compute
per-district counts + nearest-distance. Campuses: OVGU (Universitätsplatz),
HS Magdeburg-Stendal (Herrenkrug) — geocode once.

### B) GTFS transit → `fetch_gtfs_transit.py`
`https://download.gtfs.de/germany/nv_free/latest.zip` (CC-BY) → filter `stops.txt`
to bbox, join `stop_times.txt`/`trips.txt`/`calendar.txt`. Per stop: departures/hour,
**night departures 22:00–04:00**, then nearest-stop + stop-density per district.
Optional live delays: `realtime.gtfs.de/realtime-free.pb` (needs FastAPI proxy).

### C) Live context (optional, AI/“real-time” flourish)
Bright Sky `api.brightsky.dev/current_weather` · Sensor.Community
`data.sensor.community/airrohr/v1/filter` · PEGELONLINE Elbe gauge. All CORS-OK.

---

## 4. Genuine gaps & honest fallbacks

| Gap | Reality | Fallback |
|---|---|---|
| **Per-district climate** | one DWD station → uniform city value | Drop as differentiator, or proxy “comfort” from OSM green+water proximity (heat-island) |
| **Grocery prices** | not open data | Use grocery **access/density** (decided) |
| **Jobs *located* in district** | employment data is residents-employed (`am Wohnort`), not workplaces | Supplement “economic opportunity” with business density (Gewerbe/IHK) |
| **Per-district live air quality** | Sensor.Community = sparse points | Treat air as city-level context only |
| **Healthcare quality/capacity** | only facility locations | Access proxy only; label as such |
| **Per-flat energy rating** | none (GDPR + no open register) | Construction-era from Mietspiegel `nach-baualter` as efficiency proxy |

---

## 5. Integration risks (read before coding)

1. **Join keys** — normalize Mietspiegel & KISS-MD district names to the 40
   `Stadtteile.geojson` `name`s. Mind umlauts/encoding (Brückfeld, Sülzegrund,
   Westerhüsen). Ignore KISS-MD files keyed by *Statistische Bezirke* or *PLZ* —
   use the `…nach-stadtteilen` Stadtteil-level files only.
2. **Census grids** (ZensusBev/Miete) are 100 m INSPIRE cells → area-weighted
   aggregation into district polygons before use.
3. **Projected years** — Mietspiegel 2025–26 are forecasts; label them.
4. **Null handling** — Mietspiegel suppresses small samples (`null`); filter and
   show `stichprobengroesse` as a confidence cue.
5. **Sensitive data** — crime by district is aggregate (GDPR-safe) but present as a
   normalized “safety index,” not raw counts, to avoid stigmatizing framing.
6. **Low-data districts** — peripheral Stadtteile lack rent/POIs → mark
   `data_confidence="low"` or exclude from the ranking, don’t fabricate.

---

## 6. Action checklist (maps to `backend/data_processing/`)

- [ ] `inspect_datasets.py` — inventory all repo files (already specced)
- [ ] **`load_districts.py`** — `Stadtteile.geojson` → canonical table (`area_id`, `name`, centroid, area_km²)
- [ ] `clean_rent_data.py` — Mietspiegel → district avg €/m² (2024) + 2012–26 trend + projection flag
- [ ] **`load_kissmd_districts.py`** — the 29 `nach-stadtteilen` datasets → population trend, age, density, employment, business, crime, construction (joined on `name`)
- [ ] `fetch_osm_pois.py` — Overpass (§3A) + reuse `CafesOSM.geojson` → per-district amenity counts/distances
- [ ] `fetch_gtfs_transit.py` — GTFS (§3B) → transit + night-service scores
- [ ] `build_living_index.py` — join all district tables on `name` → per-dimension 0–100 → `life_value_score`
- [ ] (opt) `aggregate_zensus.py` — grids → district finer rent/pop
- [ ] (opt) live proxies for weather/air/Elbe in the AI/context panel

---

## 7. Licensing / attribution

KISS-MD © Stadt Magdeburg, Amt für Statistik · Mietspiegel: own calc., source
value-marktdatenbank · Climate: DWD (GeoNutzV) · OSM/Stadtteile/Cafés: © OpenStreetMap
contributors (ODbL) · Census: © Statistische Ämter (Zensus 2022) · GTFS: gtfs.de
(CC-BY 4.0). **Open data only, no personal data (GDPR Art. 4).**
