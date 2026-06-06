// pages.map.* subtree
const map = {
  en: {
    title: 'Living Value Map',
    error: {
      api: 'Could not reach the API — is the backend running on :8000?',
    },
    budgetBar: {
      label: 'Budget:',
      valueFor: 'Value for…',
    },
    profiles: {
      general: 'General',
      student: 'Student',
      professional: 'Professional',
      family: 'Family',
      senior: 'Senior',
    },
    search: {
      placeholder: 'Search districts...',
    },
    legend: {
      title: 'Living Value Index',
      high: 'High Value',
      balanced: 'Balanced',
      low: 'Overpriced / Low',
      dimmed: 'Dimmed = above €{{budget}}',
    },
    panel: {
      empty: 'Select a district on the map.',
      bestFor: 'Best for: {{values}}',
      overBudget: 'Above your €{{budget}}/mo budget (≈ €{{rent}}/mo)',
      livabilityTitle: 'Livability Score',
      livabilitySubtitle: 'Based on 6 key civic metrics',
      marketAvg: 'Market average',
      estRent: 'Est. monthly rent €{{amount}}',
      rentPerSqm: '(€{{value}}/m²)',
      breakdown: 'District Breakdown',
      compare: 'Compare District',
      fallbackDesc: 'An established Magdeburg district with its own everyday character and access across the city.',
    },
    rating: {
      exceptional: 'Exceptional',
      excellent: 'Excellent',
      high: 'High',
      good: 'Good',
      moderate: 'Moderate',
      low: 'Low',
    },
    breakdown: {
      affordability: 'Affordability',
      transit: 'Transit',
      fifteenMin: '15-Min City',
      healthcare: 'Healthcare',
      greenSpace: 'Green Space',
      futureValue: 'Future Value',
    },
  },
  de: {
    title: 'Wohnwert-Karte',
    error: {
      api: 'API nicht erreichbar — läuft das Backend auf Port 8000?',
    },
    budgetBar: {
      label: 'Budget:',
      valueFor: 'Wert für…',
    },
    profiles: {
      general: 'Allgemein',
      student: 'Student:in',
      professional: 'Berufstätige',
      family: 'Familie',
      senior: 'Senior:in',
    },
    search: {
      placeholder: 'Stadtteile suchen...',
    },
    legend: {
      title: 'Wohnwert-Index',
      high: 'Hoher Wert',
      balanced: 'Ausgewogen',
      low: 'Überteuert / Niedrig',
      dimmed: 'Ausgegraut = über €{{budget}}',
    },
    panel: {
      empty: 'Wähle einen Stadtteil auf der Karte.',
      bestFor: 'Am besten für: {{values}}',
      overBudget: 'Über deinem Budget von €{{budget}}/Mo. (≈ €{{rent}}/Mo.)',
      livabilityTitle: 'Wohnqualitäts-Score',
      livabilitySubtitle: 'Basierend auf 6 städtischen Kernwerten',
      marketAvg: 'Marktdurchschnitt',
      estRent: 'Geschätzte Monatsmiete €{{amount}}',
      rentPerSqm: '(€{{value}}/m²)',
      breakdown: 'Stadtteil-Übersicht',
      compare: 'Stadtteil vergleichen',
      fallbackDesc: 'Ein etablierter Magdeburger Stadtteil mit eigenem Alltagscharakter und guter Anbindung an die ganze Stadt.',
    },
    rating: {
      exceptional: 'Herausragend',
      excellent: 'Ausgezeichnet',
      high: 'Hoch',
      good: 'Gut',
      moderate: 'Mittel',
      low: 'Niedrig',
    },
    breakdown: {
      affordability: 'Erschwinglichkeit',
      transit: 'Nahverkehr',
      fifteenMin: '15-Min-Stadt',
      healthcare: 'Gesundheit',
      greenSpace: 'Grünflächen',
      futureValue: 'Zukunftswert',
    },
  },
}

export default map
