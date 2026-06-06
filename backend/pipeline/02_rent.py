"""Phase 2 - rent & affordability per district from the Mietspiegel.

Uses the representative '50 bis unter 80 qm' class (falls back to the mean of
available classes). Estimates a warm-ish monthly cost = (rent + utilities) * 50 m2.

Writes data/processed/rent.json  (keyed by district name).
"""
import os
import json
import statistics as st

HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, "..", "data", "raw")
PROC = os.path.join(HERE, "..", "data", "processed")

NEBEN = 3.0           # utilities estimate, EUR/m2
REPR = "50 bis unter 80 qm"
REAL_YEAR = 2024      # last observed year (2025-26 are projected)


def main():
    rows = json.load(open(os.path.join(RAW, "mietspiegel_wohnflaeche.json"), encoding="utf-8"))["rows"]

    # district -> year -> class -> rent
    by = {}
    for r in rows:
        v = r.get("nettokaltmiete_pro_qm")
        if v is None:
            continue
        by.setdefault(r["stadtteil"], {}).setdefault(r["year"], {})[r["wohnflaechenklasse"]] = v

    def rent_for(years, y):
        cls = years.get(y, {})
        if not cls:
            return None
        return cls.get(REPR) if REPR in cls else st.mean(cls.values())

    out = {}
    for district, years in by.items():
        r_now = rent_for(years, REAL_YEAR)
        if r_now is None:  # fall back to most recent year that has data
            avail = [y for y in years if rent_for(years, y) is not None]
            r_now = rent_for(years, max(avail)) if avail else None
        if r_now is None:
            continue
        r_2012 = rent_for(years, 2012)
        r_2026 = rent_for(years, 2026)
        series = [{"year": y, "rent": round(rent_for(years, y), 2)}
                  for y in sorted(years) if rent_for(years, y) is not None]
        out[district] = {
            "rent_eur_sqm": round(r_now, 2),
            "est_rent_50sqm": round((r_now + NEBEN) * 50),
            "rent_growth_pct_2012_2024": round(100 * (r_now - r_2012) / r_2012, 1) if r_2012 else None,
            "rent_proj_2026": round(r_2026, 2) if r_2026 else None,
            "series": series,
        }

    with open(os.path.join(PROC, "rent.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"wrote rent for {len(out)} districts -> rent.json")


if __name__ == "__main__":
    main()
