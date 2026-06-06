"""Phase 3 - per-district amenity counts + nearest-distance from OSM (Overpass).

One Overpass call for the whole city. For each district we record, per category:
  count      = POIs of that category inside the district polygon
  nearest_m  = distance (m) from the district centroid to the nearest POI of that
               category anywhere in the city (so absent categories still get a value)
Writes data/processed/amenities.json -> {district: {cat: {count, nearest_m}}}.
"""
import os
import json
import time
import urllib.parse
import urllib.request

import geopandas as gpd
from shapely.geometry import Point

HERE = os.path.dirname(__file__)
PROC = os.path.join(HERE, "..", "data", "processed")

BBOX = "52.05,11.55,52.20,11.75"  # S,W,N,E
ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
CATEGORIES = ["grocery", "pharmacy", "healthcare", "school",
              "university", "park", "gym", "cafe", "transit"]


def build_query() -> str:
    filt = [
        f'nwr["shop"~"supermarket|convenience|greengrocer"]({BBOX});',
        f'nwr["amenity"="pharmacy"]({BBOX});',
        f'nwr["amenity"~"hospital|doctors|clinic"]({BBOX});',
        f'nwr["amenity"~"school|kindergarten"]({BBOX});',
        f'nwr["amenity"="university"]({BBOX});',
        f'nwr["leisure"="park"]({BBOX});',
        f'nwr["leisure"="fitness_centre"]({BBOX});',
        f'nwr["amenity"~"cafe|restaurant"]({BBOX});',
        f'nwr["railway"="tram_stop"]({BBOX});',
        f'nwr["highway"="bus_stop"]({BBOX});',
    ]
    return "[out:json][timeout:90];(" + "".join(filt) + ");out center tags;"


def categorize(tags: dict):
    shop = tags.get("shop", "")
    am = tags.get("amenity", "")
    lei = tags.get("leisure", "")
    cats = []
    if shop in ("supermarket", "convenience", "greengrocer"):
        cats.append("grocery")
    if am == "pharmacy":
        cats.append("pharmacy")
    if am in ("hospital", "doctors", "clinic"):
        cats.append("healthcare")
    if am in ("school", "kindergarten"):
        cats.append("school")
    if am == "university":
        cats.append("university")
    if lei == "park":
        cats.append("park")
    if lei == "fitness_centre":
        cats.append("gym")
    if am in ("cafe", "restaurant"):
        cats.append("cafe")
    if tags.get("railway") == "tram_stop" or tags.get("highway") == "bus_stop":
        cats.append("transit")
    return cats


def fetch():
    data = urllib.parse.urlencode({"data": build_query()}).encode()
    for url in ENDPOINTS:
        try:
            print("overpass:", url)
            req = urllib.request.Request(url, data=data, headers={"User-Agent": "magdeburg-navigator/1.0"})
            with urllib.request.urlopen(req, timeout=150) as r:
                return json.loads(r.read())["elements"]
        except Exception as e:
            print("  failed:", e)
            time.sleep(3)
    raise RuntimeError("all Overpass endpoints failed")


def main():
    elements = fetch()
    recs = []
    for e in elements:
        lat = e.get("lat") or e.get("center", {}).get("lat")
        lon = e.get("lon") or e.get("center", {}).get("lon")
        if lat is None or lon is None:
            continue
        for c in categorize(e.get("tags", {})):
            recs.append({"cat": c, "geometry": Point(lon, lat)})

    pois = gpd.GeoDataFrame(recs, crs=4326)
    districts = gpd.read_file(os.path.join(PROC, "districts.geojson")).to_crs(4326)

    # counts: POIs inside each district polygon
    joined = gpd.sjoin(pois, districts, predicate="within", how="inner")
    counts = joined.groupby(["name", "cat"]).size().to_dict()  # (name, cat) -> count

    # nearest distance: district centroid (metric CRS) to nearest POI of each category
    pois_m = pois.to_crs(25832)
    dist_m = districts.to_crs(25832)
    cat_geoms = {c: pois_m[pois_m["cat"] == c].geometry for c in CATEGORIES}

    out = {}
    for _, d in dist_m.iterrows():
        name = d["name"]
        centroid = d.geometry.centroid
        per = {}
        for c in CATEGORIES:
            g = cat_geoms[c]
            if len(g):
                d = g.distance(centroid)
                nearest = round(float(d.min()))
                r5, r10, r15 = int((d <= 400).sum()), int((d <= 800).sum()), int((d <= 1200).sum())
                p4326 = pois.geometry.loc[d.idxmin()]   # real nearest POI (lon, lat)
                nearest_ll = [round(p4326.x, 5), round(p4326.y, 5)]
            else:
                nearest, r5, r10, r15, nearest_ll = None, 0, 0, 0, None
            per[c] = {"count": int(counts.get((name, c), 0)), "nearest_m": nearest,
                      "r5": r5, "r10": r10, "r15": r15, "nearest_lonlat": nearest_ll}
        out[name] = per

    with open(os.path.join(PROC, "amenities.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"wrote amenities for {len(out)} districts ({len(pois)} POIs) -> amenities.json")


if __name__ == "__main__":
    main()
