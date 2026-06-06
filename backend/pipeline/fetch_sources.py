"""Phase 0 - download the repo source files we need into data/raw/.

Run once; idempotent (skips files that already exist).
"""
import os
import urllib.request

BASE = "https://raw.githubusercontent.com/SmartCityMagdeburg2026/Datasources/main/data/"

# local name -> path in the Datasources repo
FILES = {
    "stadtteile.geojson": "Stadtteile/Stadtteile.geojson",
    "mietspiegel_wohnflaeche.json": "mietspiegel-2024/nach-wohnflaeche.json",
    "mietspiegel_baualter.json": "mietspiegel-2024/nach-baualter.json",
    "cafes.geojson": "CafesOSM/CafesOSM.geojson",
    "baumkataster.geojson": "Baumkataster/Baumkataster.geojson",
}

RAW = os.path.join(os.path.dirname(__file__), "..", "data", "raw")


def main():
    os.makedirs(RAW, exist_ok=True)
    for local, rel in FILES.items():
        dest = os.path.join(RAW, local)
        if os.path.exists(dest):
            print("skip ", local)
            continue
        print("fetch", local)
        urllib.request.urlretrieve(BASE + rel, dest)
    print("done ->", os.path.abspath(RAW))


if __name__ == "__main__":
    main()
