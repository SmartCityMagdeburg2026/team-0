// pages.matrix.* subtree
const matrix = {
  en: {
    title: 'Affordability vs. Livability',
    subtitle: 'The Value Matrix',
    subtitleParagraph:
      'Analyze district value based on standardized life-quality scores against estimated median monthly costs.',

    // chart header
    chartTitle: 'Value Matrix',
    bubbleHint: '· bubble = amenity density',

    // tier labels (legend dots + filter)
    tier: {
      high: 'High Value',
      balanced: 'Balanced',
      overpriced: 'Overpriced',
    },

    // quadrant corner labels (SVG text)
    quadrant: {
      bestValue: 'BEST VALUE',
      premium: 'PREMIUM',
      budgetCompromise: 'BUDGET COMPROMISE',
      overpriced: 'OVERPRICED',
    },

    fairValueRef: 'Fair Value Reference',

    // axis label
    axis: {
      life: 'Life Value Score',
    },

    // tooltip
    tooltip: {
      livability: 'Livability:',
      estRent: 'Est. Rent:',
    },

    // filter popover
    filter: {
      button: 'Filter',
      heading: 'Show categories',
    },

    // export button
    exportReport: 'Export Report',

    // ranking sidebar
    ranking: {
      title: 'Best value right now',
      valueLabel: 'Value',
      showLess: 'Show less',
      viewFull: 'View full ranking',
    },

    // market insight sidebar
    insight: {
      heading: 'Market Insight',
      body: '{{name}} offers the best livability for its price (≈ €{{rent}}/mo), sitting furthest above the fair-value line.',
      bodyNoRent: '{{name}} offers the best livability for its price, sitting furthest above the fair-value line.',
      cta: 'Read detailed analysis →',
    },

    // trend labels (used in trend())
    trend: {
      positive: 'Positive trend',
      emerging: 'Emerging',
      steady: 'Steady',
    },

    // "behind the score" section
    behindScore: 'behind the score',

    // InfoCard 1 — open data sources
    card1: {
      bigUnit: ' districts',
      body: 'Every district is scored from <sun>open data</sun> — net cold rent from the <sun>Mietspiegel 2024</sun>, ~2,000 <sun>amenities & transit stops</sun> from OpenStreetMap, and green space from the city tree cadastre.',
      source: 'Mietspiegel 2024 · OpenStreetMap · KISS-MD',
      details:
        'Rent is the qualified Mietspiegel net cold rent per Stadtteil (2012–2026). Amenities, transit stops and green space are counted from OpenStreetMap within each district. District boundaries come from the city\'s open geodata.',
    },

    // InfoCard 2 — Life Value Score
    card2: {
      scoreTitle: 'Life Value Score',
      body: 'Six sub-scores are normalized <sun>0–100</sun> and combined by weight. On the chart, color is <sun>value</sun> — how far a district sits above or below the <sun>fair-value line</sun>.',
      source: 'Transparent weighted index — no black-box ML',
      details:
        "Each district's six sub-scores are min-max normalized to 0–100 across all districts, then combined with the weights above into a Life Value Score. A district's color on the chart is its value: livability percentile minus cost percentile — above the fair-value line is good value (petrol), below is overpriced (red).",
    },

    // InfoCard shared UI
    infoCard: {
      sourceLabel: 'Source:',
      moreDetails: 'More details',
      less: 'Less',
    },

    // WEIGHTS bar labels
    weights: {
      affordability: 'Affordability',
      transit: 'Transit',
      fifteenMin: '15-Min City',
      future: 'Future',
      green: 'Green',
      healthcare: 'Healthcare',
    },
  },

  de: {
    title: 'Bezahlbarkeit vs. Lebensqualität',
    subtitle: 'Die Wert-Matrix',
    subtitleParagraph:
      'Vergleiche Stadtteile anhand standardisierter Lebensqualitäts-Scores mit den geschätzten monatlichen Mietkosten.',

    chartTitle: 'Wert-Matrix',
    bubbleHint: '· Blasengröße = Infrastrukturdichte',

    tier: {
      high: 'Gutes Preis-Leistungs-Verhältnis',
      balanced: 'Ausgewogen',
      overpriced: 'Überteuert',
    },

    quadrant: {
      bestValue: 'BESTES PREIS-LEISTUNGS-VERHÄLTNIS',
      premium: 'PREMIUM',
      budgetCompromise: 'GÜNSTIGER KOMPROMISS',
      overpriced: 'ÜBERTEUERT',
    },

    fairValueRef: 'Faire-Preis-Referenzlinie',

    axis: {
      life: 'Lebensqualitäts-Score',
    },

    tooltip: {
      livability: 'Lebensqualität:',
      estRent: 'Gesch. Miete:',
    },

    filter: {
      button: 'Filter',
      heading: 'Kategorien anzeigen',
    },

    exportReport: 'Bericht exportieren',

    ranking: {
      title: 'Aktuell bestes Preis-Leistungs-Verhältnis',
      valueLabel: 'Wert',
      showLess: 'Weniger anzeigen',
      viewFull: 'Vollständiges Ranking anzeigen',
    },

    insight: {
      heading: 'Markteinblick',
      body: '{{name}} bietet die beste Lebensqualität für seinen Preis (≈ €{{rent}}/Monat) und liegt am weitesten über der fairen Preislinie.',
      bodyNoRent: '{{name}} bietet die beste Lebensqualität für seinen Preis und liegt am weitesten über der fairen Preislinie.',
      cta: 'Detaillierte Analyse lesen →',
    },

    trend: {
      positive: 'Positiver Trend',
      emerging: 'Aufstrebend',
      steady: 'Stabil',
    },

    behindScore: 'hinter dem Score',

    card1: {
      bigUnit: ' Stadtteile',
      body: 'Jeder Stadtteil wird auf Basis von <sun>offenen Daten</sun> bewertet – Nettokaltmiete aus dem <sun>Mietspiegel 2024</sun>, ~2.000 <sun>Einrichtungen & Haltestellen</sun> aus OpenStreetMap und Grünflächen aus dem städtischen Baumkataster.',
      source: 'Mietspiegel 2024 · OpenStreetMap · KISS-MD',
      details:
        'Die Miete stammt aus dem qualifizierten Mietspiegel (Nettokaltmiete pro Stadtteil, 2012–2026). Einrichtungen, Haltestellen und Grünflächen werden aus OpenStreetMap innerhalb jedes Stadtteils gezählt. Die Stadtteilgrenzen stammen aus den offenen Geodaten der Stadt.',
    },

    card2: {
      scoreTitle: 'Lebensqualitäts-Score',
      body: 'Sechs Teilscores werden auf <sun>0–100</sun> normiert und gewichtet zusammengeführt. Die Farbe im Diagramm zeigt den <sun>Wert</sun> — wie weit ein Stadtteil über oder unter der <sun>fairen Preislinie</sun> liegt.',
      source: 'Transparenter gewichteter Index – kein Black-Box-ML',
      details:
        'Die sechs Teilscores jedes Stadtteils werden min-max-normiert (0–100 über alle Stadtteile) und mit den oben gezeigten Gewichtungen zu einem Lebensqualitäts-Score kombiniert. Die Farbe im Diagramm entspricht dem Wert: Lebensqualitäts-Perzentil minus Kosten-Perzentil – über der fairen Preislinie bedeutet gutes Preis-Leistungs-Verhältnis (petrol), darunter ist überteuert (rot).',
    },

    infoCard: {
      sourceLabel: 'Quelle:',
      moreDetails: 'Mehr Details',
      less: 'Weniger',
    },

    weights: {
      affordability: 'Bezahlbarkeit',
      transit: 'ÖPNV',
      fifteenMin: '15-Min-Stadt',
      future: 'Zukunft',
      green: 'Grün',
      healthcare: 'Gesundheit',
    },
  },
}

export default matrix
