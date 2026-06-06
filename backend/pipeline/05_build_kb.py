"""Phase 5 - build the assistant's knowledge base (for BM25 retrieval).

Combines our own district profiles + scoring methodology + tenancy basics, and
(if reachable) a few Magdeburg open-data repo docs, into chunked text.
Writes data/processed/kb.json = [{id, text, source}].
"""
import os
import re
import json
import urllib.request

HERE = os.path.dirname(__file__)
FINAL = os.path.join(HERE, "..", "data", "final")
PROC = os.path.join(HERE, "..", "data", "processed")

RAW = "https://raw.githubusercontent.com/SmartCityMagdeburg2026/Datasources/main/"
REPO_DOCS = [
    ("Mietspiegel guide", RAW + "data/mietspiegel-2024/README.en.md"),
    ("KISS-MD statistics", RAW + "data/kiss-md/README.en.md"),
    ("Live data sources", RAW + "live-sources/DATENQUELLEN.en.md"),
]

METHODOLOGY = """How the Life Value Score works. Each Magdeburg district is rated 0-100 on six dimensions: Affordability (net cold rent from the Mietspiegel 2024, inverted so cheaper scores higher), Transit (density of tram and bus stops from OpenStreetMap), 15-Minute City (walking access to groceries, pharmacies, healthcare, parks, schools and cafes), Green space, Healthcare access, and Future value (the 2012-2026 rent trend). Each metric is min-max normalized across all 40 districts. The Life Value Score is a weighted average: Affordability 25%, Transit 20%, 15-Minute City 20%, Future 15%, Green 10%, Healthcare 10%. Personalized profiles (student, professional, family, senior) re-weight these dimensions.

On the Value Matrix a district's color is its value: livability percentile minus cost percentile. Above the fair-value line is good value (petrol), near it is balanced (orange), below is overpriced (red).

Estimated monthly cost. Total cost of life = net cold rent (rent per m2 times size) + utilities (about 2.5 EUR/m2) + transport (Deutschlandticket 58 EUR for tram, 0 for walk or bike, about 300 EUR for a car). These are transparent assumptions, not live listings; rent is a district average from the qualified Mietspiegel."""

TENANCY = """Renting in Magdeburg basics. The Mietspiegel is the city's official qualified rent index; it gives the net cold rent (Nettokaltmiete) per square metre by district, excluding utilities and heating. On top of the cold rent, tenants pay Nebenkosten (operating costs and heating), estimated here at about 2.5 EUR/m2 per month. A deposit (Kaution) of up to three months' cold rent is common. Public transport across Germany, including Magdeburg's MVB trams and buses, is covered by the Deutschlandticket monthly pass (about 58 EUR). Magdeburg is comparatively affordable: typical net cold rents range from roughly 6 to 9.5 EUR per square metre depending on district, building age and size."""

STATIC_DOCS = [("Scoring methodology", METHODOLOGY), ("Tenancy basics", TENANCY)]


def chunks(text, size=600):
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    out, buf = [], ""
    for p in paras:
        if len(buf) + len(p) > size and buf:
            out.append(buf.strip())
            buf = ""
        buf += p + "\n\n"
    if buf.strip():
        out.append(buf.strip())
    return out


def district_docs():
    areas = json.load(open(os.path.join(FINAL, "neighborhood_scores.json"), encoding="utf-8"))
    docs = []
    for a in areas:
        if a.get("life_value_score") is None:
            continue
        cold = round((a.get("rent_eur_sqm") or 0) * 50)
        t = (
            f"{a['area_name']} - Life Value Score {a['life_value_score']}/100. "
            f"Affordability {a.get('affordability_score')}, Transit {a.get('transit_score')}, "
            f"15-minute access {a.get('fifteen_min_score')}, Healthcare {a.get('healthcare_score')}, "
            f"Green space {a.get('green_score')}, Future value {a.get('future_value_score')}. "
            f"Net cold rent about {a.get('rent_eur_sqm')} EUR/m2 (about {cold} EUR/mo for 50 m2). "
            f"Best for: {', '.join(a.get('best_for') or ['balanced'])}."
        )
        docs.append({"id": f"district:{a['area_id']}", "text": t, "source": f"District profile - {a['area_name']}"})
    return docs


def main():
    kb = []
    kb += district_docs()
    for title, text in STATIC_DOCS:
        for i, c in enumerate(chunks(text)):
            kb.append({"id": f"{title}:{i}", "text": c, "source": title})
    for title, url in REPO_DOCS:
        try:
            txt = urllib.request.urlopen(url, timeout=20).read().decode("utf-8", "ignore")
            txt = re.sub(r"```.*?```", " ", txt, flags=re.S)  # drop code blocks
            txt = re.sub(r"[#>*`|_]", " ", txt)               # strip markdown
            for i, c in enumerate(chunks(txt)):
                kb.append({"id": f"{title}:{i}", "text": c, "source": title})
            print("fetched", title)
        except Exception as e:
            print("skip", title, "-", e)

    os.makedirs(PROC, exist_ok=True)
    with open(os.path.join(PROC, "kb.json"), "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False)
    print(f"wrote {len(kb)} KB chunks -> kb.json")


if __name__ == "__main__":
    main()
