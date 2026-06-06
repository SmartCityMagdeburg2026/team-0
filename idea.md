 Smart City dashboard project using the uploaded repository/datasets.

PROJECT NAME:
Magdeburg Smart Living Navigator

MAIN GOAL:
Build a unique interactive dashboard/web app that helps the public decide:
"Where should I live in Magdeburg based on cost, accessibility, lifestyle, and future value?"

This should NOT look like a normal dashboard with random charts.
It should feel like a product / decision platform.

Core idea:
Instead of only showing rent, population, or employment charts, create a smart recommendation system that ranks Magdeburg districts/neighborhoods using a "Life Value Score":

Life Value Score =
Affordability
+ Transit Accessibility
+ 15-Minute City Access
+ Green Space Access
+ Healthcare Access
+ Economic Opportunity


The dashboard should be useful for:
- Students
- Working professionals
- Families
- Seniors
- New residents
- Expats
- General public

Important:
Do not make it only student-focused.
Do not create redundant charts.
Every visualization must answer a decision question.

====================================================
PHASE 1: PROJECT SETUP
====================================================

Create a modern full-stack dashboard project.

Use this stack:

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Leaflet or Mapbox for maps
- Framer Motion for smooth animations
- Lucide React for icons

Backend / Processing:
- Python
- Pandas
- GeoPandas if needed
- FastAPI for API
- Scikit-learn for scoring and prediction
- Optional: LangChain / simple RAG for AI assistant later

Folder structure:

smart-living-navigator/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── scoring/
│   │   └── models/
│   ├── data_processing/
│   │   ├── inspect_datasets.py
│   │   ├── clean_rent_data.py
│   │   ├── build_living_index.py
│   │   ├── fetch_osm_pois.py
│   │   ├── fetch_gtfs_transit.py
│   │   └── create_dashboard_dataset.py
│   └── requirements.txt
│
├── data/
│   ├── raw/
│   ├── external/
│   ├── processed/
│   └── final/
│
├── docs/
│   ├── data_dictionary.md
│   ├── methodology.md
│   └── scoring_logic.md
│
└── README.md

Create all required files.

====================================================
PHASE 2: DATA DISCOVERY
====================================================

The uploaded repository contains Smart City Magdeburg datasets.

First, inspect the full repository structure.

Search for these important datasets:

1. Mietspiegel 2024
   Expected folder:
   data/mietspiegel-2024/

   Important files may include:
   - nach-baualter.json
   - nach-wohnflaeche.json

   Use this for rent and affordability.

2. KISS-MD datasets
   Expected folder:
   data/kiss-md/

   Search categories related to:
   - population
   - districts
   - employment
   - housing
   - construction
   - economy
   - social indicators

3. Sensor data
   Expected folder:
   data/sensor-data/

   Search files:
   - klima-monat.json
   - klima-tag.json

   Use for climate/environment score.

4. Tax / economic data
   Expected folder:
   data/steuereinnahmen/

   Search files:
   - steuereinnahmen-2010-2025.csv
   - steuersaetze-1991-2026.csv

   Use for city economic trend, not district-level unless district data exists.

Create a script:

backend/data_processing/inspect_datasets.py

This script must:
- Recursively scan all files
- Print file paths
- Detect file type
- Load sample rows from CSV, XLSX, JSON
- Save a dataset inventory to:
  data/processed/dataset_inventory.csv

Columns:
- file_path
- file_type
- rows
- columns
- detected_theme
- usable_for_dashboard
- notes

Themes:
- rent
- population
- employment
- housing
- climate
- economy
- POI
- transit
- unknown

====================================================
PHASE 3: EXTERNAL DATA ENRICHMENT
====================================================

We need data that may not exist in the repo.

Add external open data enrichment.

Use OpenStreetMap using OSMnx or Overpass API.

Create:
backend/data_processing/fetch_osm_pois.py

Fetch POIs for Magdeburg:

Categories:
- supermarkets
- grocery stores
- pharmacies
- hospitals
- doctors
- schools
- universities
- parks
- gyms
- cafes
- restaurants
- tram stops
- bus stops

Save:
data/external/osm_pois_magdeburg.csv

Columns:
- poi_id
- name
- category
- latitude
- longitude
- tags
- source

Then aggregate by district/neighborhood if district boundaries exist.
If official district boundaries are not available, create approximate area clusters or use geospatial nearest-distance logic.

Important:
Do not depend on grocery prices because reliable open grocery price data may not exist.
Use grocery accessibility instead.

Transit:
Search for GTFS/MVB/marego data support.
Create:
backend/data_processing/fetch_gtfs_transit.py

If GTFS is available:
- Load stops
- Load routes
- Load trips
- Load stop_times
- Compute:
  - nearest stop distance
  - number of departures per hour
  - night service availability
  - access to OVGU / city center / main station

If GTFS is not available:
Create a fallback using OSM transit stops:
- transit_stop_density
- distance_to_nearest_stop
- approximate transit score

Save:
data/external/transit_accessibility.csv

====================================================
PHASE 4: CREATE CORE SCORING DATASET
====================================================

Create:
backend/data_processing/create_dashboard_dataset.py

Final output:
data/final/neighborhood_living_scores.csv

Each row should represent one district/neighborhood/area.

Required columns:

Identification:
- area_id
- area_name
- latitude
- longitude

Cost:
- avg_rent_per_sqm
- estimated_monthly_rent_50sqm
- affordability_score

Accessibility:
- transit_score
- nearest_transit_stop_m
- night_transit_score

15-minute city:
- grocery_access_score
- pharmacy_access_score
- healthcare_access_score
- education_access_score
- park_access_score
- gym_cafe_lifestyle_score
- fifteen_min_city_score

Socio-economic:
- population_growth_score
- employment_opportunity_score
- economic_score

Environment:
- green_score
- climate_comfort_score

Future:
- future_growth_score
- rent_growth_risk
- future_value_score

Final:
- life_value_score
- best_for
- recommendation_label
- short_explanation

====================================================
PHASE 5: SCORING LOGIC
====================================================

Create:
backend/app/scoring/living_score.py

Implement all scoring functions.

Use 0–100 scale.

Important:
Normalize all values.

Affordability Score:
Lower rent should produce higher score.

Example:
affordability_score = 100 - normalized(avg_rent_per_sqm)

But do not make cheapest always best.
Use a balanced score.

Transit Score:
Based on:
- stop density
- nearest stop distance
- estimated frequency
- night availability

15-Minute City Score:
Count how many daily needs are reachable within 15 minutes walking/cycling/transit.

Approximation:
- walking radius: 1.2 km
- cycling radius: 3.5 km
- transit radius: nearest stop + service quality

Categories:
- grocery
- pharmacy
- healthcare
- park
- school/university
- public transport
- lifestyle

Life Value Score formula:

life_value_score =
0.25 * affordability_score
+ 0.20 * transit_score
+ 0.20 * fifteen_min_city_score
+ 0.10 * green_score
+ 0.10 * healthcare_access_score
+ 0.10 * economic_score
+ 0.05 * future_value_score

Also implement user-personalized scoring.

User profile weights:

Student:
- affordability 30%
- transit 25%
- university access 20%
- lifestyle 15%
- future 10%

Professional:
- commute/transit 30%
- affordability 20%
- lifestyle 20%
- economic opportunity 20%
- green 10%

Family:
- affordability 20%
- school/education 25%
- healthcare 20%
- green 20%
- safety proxy / stability 15%

Senior:
- healthcare 30%
- transit 25%
- grocery/pharmacy 20%
- affordability 15%
- green/quiet 10%

General:
Use default Life Value Score.

====================================================
PHASE 6: BACKEND API
====================================================

Create FastAPI app:

backend/app/main.py

Endpoints:

GET /api/health
Returns status.

GET /api/areas
Returns all neighborhood scores.

GET /api/areas/{area_id}
Returns detailed area profile.

POST /api/recommend
Input:
{
  "budget": 800,
  "profile": "professional",
  "work_location": "city_center",
  "transport_mode": "tram",
  "priorities": ["affordability", "parks", "healthcare"]
}

Output:
Top 5 recommended areas with:
- rank
- area_name
- match_score
- estimated_monthly_cost
- reason
- tradeoffs

GET /api/compare?area1=&area2=
Returns side-by-side comparison.

POST /api/hidden-cost
Input:
{
  "area_id": "...",
  "apartment_size": 50,
  "transport_mode": "tram"
}

Output:
- estimated_rent
- estimated_transport_cost
- estimated_utilities
- total_monthly_cost
- cost_label

POST /api/chat
Basic AI assistant endpoint.
For now, implement rule-based response if no LLM key exists.
Later it can be connected to RAG.

====================================================
PHASE 7: FRONTEND UI DESIGN
====================================================

Build the dashboard like a product, not a report.

Use a clean modern interface.

Color theme:
- dark navy background
- teal / green accents
- white cards
- soft shadows
- rounded corners

Dashboard name:
"Magdeburg Smart Living Navigator"

Hero question:
"Where should you live in Magdeburg?"

Main sections:

1. AI Recommendation Panel
2. Living Value Map
3. Affordability vs Liveability Matrix
4. 15-Minute City Explorer
5. Hidden Cost Analyzer
6. Daily Life Simulator
7. Future Neighborhood Predictor
8. Area Comparison
9. AI Relocation Assistant

====================================================
PAGE 1: HOME / RECOMMENDATION
====================================================

Create:
frontend/src/pages/HomePage.tsx

Top section:

Title:
Magdeburg Smart Living Navigator

Subtitle:
Find the best neighborhood based on cost, accessibility, lifestyle, and future value.

User input panel:
- Monthly housing budget slider
- Profile dropdown:
  - General
  - Student
  - Professional
  - Family
  - Senior
- Transport preference:
  - Walking
  - Bike
  - Tram
  - Car
- Lifestyle priorities:
  - Affordable
  - Green
  - Healthcare
  - Night transit
  - Cafes
  - Schools
  - Quiet
  - City center access

Button:
"Find My Best Areas"

Result card:
Show top recommendation:

Example:
Recommended Area: Stadtfeld Ost
Match Score: 91%
Why:
- Within your budget
- Strong transit access
- Good park and grocery access
- Better value than city average

Also show:
- Estimated rent
- Total monthly cost
- Commute/accessibility score
- Best for label

====================================================
PAGE 2: LIVING VALUE MAP
====================================================

Create:
frontend/src/components/LivingValueMap.tsx

Use Leaflet.

Show Magdeburg map.

Each area should be shown as:
- polygon if district boundary exists
- marker/bubble if no boundary exists

Color logic:
- Green: high life value score
- Yellow: balanced
- Red: low value / overpriced

Clicking an area opens side panel:

Area Profile:
- Life Value Score
- Affordability
- Transit
- 15-Min City
- Healthcare
- Green
- Future Value
- Estimated Monthly Rent
- Best For
- Short Explanation

Important:
Map should be the hero visual, not a small chart.

====================================================
PAGE 3: AFFORDABILITY VS LIVEABILITY MATRIX
====================================================

Create:
frontend/src/components/ValueMatrix.tsx

Scatter/bubble chart.

X-axis:
Estimated Monthly Cost

Y-axis:
Life Value Score

Bubble size:
Population / housing demand / area importance

Quadrants:
- High value + affordable = Best Value
- High value + expensive = Premium
- Low value + affordable = Budget Compromise
- Low value + expensive = Overpriced

When hovering:
Show area name and score breakdown.

This chart should replace redundant rent/population charts.

====================================================
PAGE 4: 15-MINUTE CITY EXPLORER
====================================================

Create:
frontend/src/components/FifteenMinuteExplorer.tsx

User selects an area.

Show checklist:

Within 15 minutes:
- Grocery
- Pharmacy
- Doctor/Hospital
- Park
- School/University
- Transit stop
- Gym/Cafe

Each item:
- Available / Not Available
- Nearest distance
- Count of POIs nearby

Show:
15-Minute City Score: 88/100

Visualization:
radar chart or icon grid.

====================================================
PAGE 5: HIDDEN COST ANALYZER
====================================================

Create:
frontend/src/components/HiddenCostAnalyzer.tsx

Purpose:
Show that rent is not the full cost.

User inputs:
- area
- apartment size
- transport mode

Output:
- Rent estimate
- Utilities estimate
- Transport estimate
- Total monthly cost
- Difference from city average

Important:
Use realistic simple assumptions if actual utility data is missing.

Example:
Utilities = 2.5 €/sqm
Deutschlandticket = 49–58 € depending current local assumption; allow config value.
Car mode = higher monthly cost placeholder.

Do not exaggerate differences.
A 30–40 euro rent difference is acceptable if quality improves.

Add smart statement:
"Although this area is €35 more expensive than average, it saves commute/access effort and has better daily access."



====================================================
PAGE 6: AREA COMPARISON
====================================================

Create:
frontend/src/components/AreaComparison.tsx

Allow selecting two or three areas.

Show cards:

Area A vs Area B

Compare:
- Estimated rent
- Total monthly cost
- Transit score
- 15-minute city score
- Healthcare score
- Green score
- Future value score
- Best for

Add final verdict:
"Best value"
"Best accessibility"
"Best for families"
"Best budget choice"

====================================================
PAGE 7: AI RELOCATION ASSISTANT
====================================================

Create:
frontend/src/components/AIRelocationAssistant.tsx

Chat-style interface.

Example user queries:
- I have 800 euros budget and want good transit.
- I work near city center and want parks nearby.
- Which area is best for a family?
- Which area gives best value for money?

Backend should parse:
- budget
- profile
- priorities
- destination

Return:
- top recommended areas
- reasoning
- tradeoffs

If no LLM API key:
Use rule-based parser.

If OpenAI/LLM key exists:
Use LLM to convert natural language to structured filters.
Do not expose API key in frontend.

====================================================
PHASE 8: MOCK DATA FALLBACK
====================================================

If some datasets are missing or difficult to process, create a fallback dataset:

data/final/neighborhood_living_scores.csv

Use realistic area names from Magdeburg:
- Stadtfeld Ost
- Stadtfeld West
- Alte Neustadt
- Neue Neustadt
- Sudenburg
- Buckau
- Reform
- Cracau
- Herrenkrug
- Altstadt
- Leipziger Straße
- Ottersleben

Do not claim mock data is real.
Add a field:
data_confidence = "estimated"

Dashboard should work even before all real data is processed.

====================================================
PHASE 9: UX REQUIREMENTS
====================================================

The dashboard must feel interactive and impressive.

Add:
- Smooth page transitions
- Animated score cards
- Hover states
- Map interactions
- Tooltips explaining each score
- Loading skeletons
- Empty state messages
- Responsive design

Avoid:
- Too many line charts
- Redundant population-only charts
- Static tables only
- Overcrowded dashboard pages
- Generic Power BI look

Each section should answer one unique question:

Home:
Where should I live?

Map:
Which areas are best value?

Matrix:
Which areas are affordable and liveable?

15-Min Explorer:
Can I access daily needs easily?

Hidden Cost:
What is the real monthly cost?

Daily Life:
How convenient will my routine be?

Future Predictor:
Is this area a good long-term choice?

Comparison:
Which area is better for me?

AI Assistant:
Can I ask naturally?

====================================================
PHASE 10: DOCUMENTATION
====================================================

Create:

README.md

Include:
- Project goal
- Dataset sources
- Features
- How to run backend
- How to run frontend
- Scoring method
- Limitations
- Future work

Create:
docs/scoring_logic.md

Explain:
- Life Value Score
- Affordability Score
- Transit Score
- 15-Minute City Score
- Future Value Score
- Personalized scoring

Create:
docs/data_dictionary.md

Explain final dataset columns.

Create:
docs/methodology.md

Explain:
- Data cleaning
- OSM enrichment
- GTFS enrichment
- Feature engineering
- Assumptions
- Limitations

====================================================
PHASE 11: RUN COMMANDS
====================================================

Set up backend:

cd backend
python -m venv venv
source venv/bin/activate

For Windows:
venv\Scripts\activate

Install:
pip install fastapi uvicorn pandas numpy scikit-learn geopandas shapely osmnx requests python-dotenv openpyxl

Freeze:
pip freeze > requirements.txt

Run:
uvicorn app.main:app --reload --port 8000

Set up frontend:

cd frontend
npm install
npm install recharts leaflet react-leaflet lucide-react framer-motion axios
npm run dev

Frontend should call backend at:
http://localhost:8000

Use environment file:
frontend/.env

VITE_API_BASE_URL=http://localhost:8000

====================================================
PHASE 12: FINAL DELIVERABLE
====================================================

At the end, the app should have:

1. Working frontend
2. Working FastAPI backend
3. Processed final dataset
4. Scoring system
5. Interactive map
6. Recommendation system
7. Hidden cost analyzer
8. 15-minute city explorer
9. Area comparison
10. AI assistant placeholder or working rule-based assistant
11. Clean documentation

The final product should look like:

"Magdeburg Smart Living Navigator"
A smart city decision platform that helps residents find the best neighborhood by comparing quality of life per euro.

Do not build a generic dashboard.
Build a personalized, interactive, smart living recommendation platform.