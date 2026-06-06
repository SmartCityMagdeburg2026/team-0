"""Phase 1 - canonical district table from Stadtteile.geojson.

Writes:
  data/processed/districts.json     (id, name, centroid, area_km2)
  data/processed/districts.geojson  (id + name + geometry, for spatial joins)
"""
import os
import re
import json
import unicodedata

import geopandas as gpd

HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, "..", "data", "raw")
PROC = os.path.join(HERE, "..", "data", "processed")


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    os.makedirs(PROC, exist_ok=True)
    g = gpd.read_file(os.path.join(RAW, "stadtteile.geojson")).to_crs(4326)
    g = g[g.geometry.notna()].copy()

    # area in km2 via a metric CRS (UTM 32N covers Magdeburg)
    g["area_km2"] = (g.to_crs(25832).area / 1e6).round(2)
    g["area_id"] = g["name"].map(slug)

    out = []
    for _, r in g.iterrows():
        c = r.geometry.centroid
        out.append({
            "area_id": r["area_id"],
            "area_name": r["name"],
            "centroid": [round(c.x, 5), round(c.y, 5)],
            "area_km2": float(r["area_km2"]),
        })
    out.sort(key=lambda d: d["area_name"])

    with open(os.path.join(PROC, "districts.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    dst = os.path.join(PROC, "districts.geojson")
    if os.path.exists(dst):
        os.remove(dst)
    g[["area_id", "name", "geometry"]].to_file(dst, driver="GeoJSON")

    print(f"wrote {len(out)} districts -> districts.json + districts.geojson")


if __name__ == "__main__":
    main()
