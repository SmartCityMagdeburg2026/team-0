// pages.home.* subtree
const home = {
  en: {
    title: 'Find your place in Magdeburg',

    hero: {
      heading: 'Where should you <1>live</1> in Magdeburg?',
      sub: 'Discover the perfect neighborhood tailored to your budget, commute, and lifestyle goals.',
    },

    controls: {
      heading: 'Personalize Your Search',
      profileLabel: 'I am looking as a:',
      budgetLabel: 'Monthly Budget',
      budgetMin: 'MIN. €300',
      budgetMax: 'MAX. €1500+',
      transportLabel: 'Primary Transport',
      lifestyleLabel: 'Lifestyle Must-Haves',
      cta: 'Find My Best Areas',
    },

    profiles: {
      General: 'General',
      Student: 'Student',
      Professional: 'Professional',
      Family: 'Family',
      Senior: 'Senior',
    },

    lifestyle: {
      Affordable: 'Affordable',
      'Green Spaces': 'Green Spaces',
      Healthcare: 'Healthcare',
      'Night Transit': 'Night Transit',
      'Café Culture': 'Café Culture',
      Schools: 'Schools',
      'City Center': 'City Center',
    },

    error: {
      api: 'Could not reach the API — is the backend running on :8000?',
    },

    results: {
      bestMatchLabel: 'Best match for you',
      tileRent: 'Estimated Rent',
      tileCost: 'Total Cost of Life',
      tileTransit: 'Transit Score',
      insightsHeading: 'Key Insights',
      fullAnalysis: 'Full district analysis',
      altsHeading: 'Strong Alternatives',
      viewAll: 'View All Comparisons',
      altRent: 'Est. Rent €{{amount}}/mo',
      fallbackDesc: 'A characterful Magdeburg district.',
      noMatch: 'No districts within €{{budget}}. Raise the budget to see matches.',
      matchLabel: 'Match',
    },

    insights: {
      withinBudget: 'Perfectly within your budget',
      overBudget: 'Slightly above your budget',
      carAccess: 'Easy road & parking access',
      walkable: 'Highly walkable & bike-friendly',
      someWalking: 'Some walking distances',
      excellentTram: 'Excellent tram network coverage',
      modestTransit: 'Modest transit coverage',
      greenHigh: 'High density of green spaces',
      greenLow: 'Compact, built-up surroundings',
      futureGrowth: 'Projected future value growth',
      futureStable: 'Stable long-term value',
    },

    districtDesc: {
      Buckau: 'Riverside creative hub with industrial charm.',
      Sudenburg: 'Traditional, lively, and highly affordable.',
      Cracau: 'Serene park-side living for nature lovers.',
      'Stadtfeld Ost': 'Leafy, central and well-connected.',
      Altstadt: 'Historic old town at the heart of the city.',
      Herrenkrug: 'Green riverside by the park and campus.',
    },

    behind: {
      label: 'behind the recommendation',
      card1Body:
        'Every district is scored from <b>open data</b> across six dimensions — <b>affordability, transit, 15-min access, green, healthcare</b> and <b>future value</b>.',
      card1Source: 'Mietspiegel 2024 · OpenStreetMap · KISS-MD',
      card1Details:
        'Affordability is the Mietspiegel 2024 net cold rent; transit, 15-minute access, green space and healthcare come from ~2,000 OpenStreetMap amenities & stops; future value from the 2012–2026 rent trend. Each metric is normalized 0–100 across all districts.',
      card1Big: '40',
      card1BigUnit: ' districts',
      card2MatchScore: 'Match Score',
      card2Body:
        'We start from your <b>profile\'s</b> weighted Life Value Score, add a <b>bonus</b> for your lifestyle must-haves, then keep only districts within your <b>budget</b> & commute cost.',
      card2Source: 'Profile weights + lifestyle bonus, budget-filtered',
      card2Details:
        'Your profile sets the weight vector (e.g. Family favours healthcare, green & schools). Each lifestyle chip you pick adds a bonus toward that dimension. Your budget + commute mode then filter out districts whose total cost (rent + utilities + transport) exceeds it — the top card is the highest-scoring district that fits.',
    },

    footer: {
      copyright: '© 2026 KiezKompass MD',
      privacy: 'Privacy',
      terms: 'Terms',
      dataSource: 'Data Source',
    },
  },

  de: {
    title: 'Finde deinen Platz in Magdeburg',

    hero: {
      heading: 'Wo solltest du in Magdeburg <1>wohnen</1>?',
      sub: 'Entdecke das perfekte Viertel, abgestimmt auf dein Budget, deinen Arbeitsweg und deinen Lebensstil.',
    },

    controls: {
      heading: 'Suche personalisieren',
      profileLabel: 'Ich suche als:',
      budgetLabel: 'Monatliches Budget',
      budgetMin: 'MIN. €300',
      budgetMax: 'MAX. €1500+',
      transportLabel: 'Hauptverkehrsmittel',
      lifestyleLabel: 'Lifestyle-Prioritäten',
      cta: 'Meine besten Stadtteile finden',
    },

    profiles: {
      General: 'Allgemein',
      Student: 'Student',
      Professional: 'Berufstätig',
      Family: 'Familie',
      Senior: 'Senior',
    },

    lifestyle: {
      Affordable: 'Günstig',
      'Green Spaces': 'Grünflächen',
      Healthcare: 'Gesundheit',
      'Night Transit': 'Nachtverkehr',
      'Café Culture': 'Café-Kultur',
      Schools: 'Schulen',
      'City Center': 'Stadtzentrum',
    },

    error: {
      api: 'Die API ist nicht erreichbar — läuft das Backend auf :8000?',
    },

    results: {
      bestMatchLabel: 'Bester Treffer für dich',
      tileRent: 'Geschätzte Miete',
      tileCost: 'Gesamtlebenshaltungskosten',
      tileTransit: 'ÖPNV-Score',
      insightsHeading: 'Wichtige Erkenntnisse',
      fullAnalysis: 'Vollständige Stadtteilanalyse',
      altsHeading: 'Starke Alternativen',
      viewAll: 'Alle Vergleiche anzeigen',
      altRent: 'Ca. Miete €{{amount}}/Monat',
      fallbackDesc: 'Ein charaktervoller Magdeburger Stadtteil.',
      noMatch: 'Keine Stadtteile unter €{{budget}}. Erhöhe das Budget, um Treffer zu sehen.',
      matchLabel: 'Treffer',
    },

    insights: {
      withinBudget: 'Perfekt in deinem Budget',
      overBudget: 'Leicht über deinem Budget',
      carAccess: 'Gute Straßen- & Parkmöglichkeiten',
      walkable: 'Sehr gut zu Fuß & mit dem Rad erreichbar',
      someWalking: 'Einige Wege zu Fuß',
      excellentTram: 'Ausgezeichnetes Straßenbahnnetz',
      modestTransit: 'Mäßige ÖPNV-Abdeckung',
      greenHigh: 'Hohe Dichte an Grünflächen',
      greenLow: 'Kompaktes, bebautes Umfeld',
      futureGrowth: 'Prognostiziertes zukünftiges Wertwachstum',
      futureStable: 'Stabiler Langzeitwert',
    },

    districtDesc: {
      Buckau: 'Kreatives Flussufer-Viertel mit industriellem Charme.',
      Sudenburg: 'Traditionell, lebendig und sehr erschwinglich.',
      Cracau: 'Ruhiges Wohnen am Park für Naturliebhaber.',
      'Stadtfeld Ost': 'Grün, zentral und gut vernetzt.',
      Altstadt: 'Historische Altstadt im Herzen der Stadt.',
      Herrenkrug: 'Grünes Flussufer am Park und Campus.',
    },

    behind: {
      label: 'hinter der Empfehlung',
      card1Body:
        'Jeder Stadtteil wird anhand von <b>offenen Daten</b> in sechs Dimensionen bewertet — <b>Erschwinglichkeit, ÖPNV, 15-Min-Zugang, Grün, Gesundheit</b> und <b>Zukunftswert</b>.',
      card1Source: 'Mietspiegel 2024 · OpenStreetMap · KISS-MD',
      card1Details:
        'Die Erschwinglichkeit basiert auf der Nettokaltmiete des Mietspiegels 2024; ÖPNV, 15-Minuten-Zugang, Grünflächen und Gesundheitsversorgung stammen aus ~2.000 OpenStreetMap-Einrichtungen & Haltestellen; der Zukunftswert aus dem Miettrend 2012–2026. Jede Kennzahl wird 0–100 über alle Stadtteile normiert.',
      card1Big: '40',
      card1BigUnit: ' Stadtteile',
      card2MatchScore: 'Match-Score',
      card2Body:
        'Wir starten mit dem gewichteten Lebenswertscore deines <b>Profils</b>, fügen einen <b>Bonus</b> für deine Lifestyle-Prioritäten hinzu und behalten nur Stadtteile innerhalb deines <b>Budgets</b> & Pendelkosten.',
      card2Source: 'Profilgewichtungen + Lifestyle-Bonus, budgetgefiltert',
      card2Details:
        'Dein Profil legt den Gewichtungsvektor fest (z. B. bevorzugt Familie Gesundheit, Grün & Schulen). Jeder gewählte Lifestyle-Chip gibt einen Bonus für diese Dimension. Budget + Pendelart filtern dann Stadtteile heraus, deren Gesamtkosten (Miete + Nebenkosten + Transport) das Budget überschreiten – die oberste Karte ist der am höchsten bewertete passende Stadtteil.',
    },

    footer: {
      copyright: '© 2026 KiezKompass MD',
      privacy: 'Datenschutz',
      terms: 'Nutzungsbedingungen',
      dataSource: 'Datenquelle',
    },
  },
}

export default home
