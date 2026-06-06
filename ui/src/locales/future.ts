// pages.future.* subtree
const future = {
  en: {
    title: 'Future Neighborhood Predictor',
    subtitle: 'Projected trends and area viability based on historical civic data.',
    chartTitle: 'Rent Trendline (2012–2026)',
    chartSubtitle: 'Average cold rent (€/m²) for {{area}}.',
    badge: 'Historical + AI Projection',
    legend: {
      historical: 'Historical Rent',
      projected: 'Projected',
    },
    tooltip: {
      rent: 'Rent',
      year: 'Year {{year}}',
    },
    stats: {
      currentRent: 'Current Rent',
      currentUnit: '/m²',
      growth: 'Growth',
      growthSince: ' since 2012',
      risk: 'Rent-Increase Risk',
      recommendation: 'Recommendation',
    },
    recommend: {
      moveEarly: 'Move early — rising area',
      premium: 'Premium area',
      stable: 'Stable choice',
      solid: 'Solid value',
    },
    status: {
      stable: 'Stable',
      premium: 'Premium',
      move: 'Move early',
      budget: 'Budget',
      watch: 'Watch rent',
    },
    comparison: {
      title: 'District Comparison Panel',
      viewMatrix: 'View full matrix →',
    },
    riskLevel: {
      high: 'High',
      moderate: 'Moderate',
      low: 'Low',
    },
    disclaimer:
      'Estimated trend based on available open data — not exact prediction. Magdeburg Open Data Portal.',
    behind: {
      label: 'behind the forecast',
      card1Body:
        'The trendline is the Mietspiegel net cold rent per district, year by year — 2012–2024 observed and 2025–2026 projected by the index itself.',
      card1Details:
        'The qualified Mietspiegel publishes forward values for 2025–26; we plot the historical segment solid and the projection dashed. Construction permits/completions (KISS-MD) inform the momentum tags.',
      card1Big: '15',
      card1BigUnit: ' years',
      card1Source: 'Mietspiegel 2024, Stadt Magdeburg',
      card2GrowthRisk: 'Growth & risk',
      card2Body:
        'Growth is the rent change since 2012. The rent-increase risk and the move-early / premium / budget tags come from each district\'s growth versus the city median rent.',
      card2Details:
        'High growth + still-affordable = \'move early\'; expensive = \'premium\'; cheap & slow = \'budget\'; very fast = \'watch rent\'. Trends are indicative, not forecasts.',
      card2Source: 'Estimated from open data — not exact prediction',
    },
  },
  de: {
    title: 'Zukunfts-Stadtteil-Prognose',
    subtitle: 'Prognostizierte Trends und Standorteignung auf Basis historischer Stadtdaten.',
    chartTitle: 'Mietentwicklung (2012–2026)',
    chartSubtitle: 'Durchschnittliche Kaltmiete (€/m²) für {{area}}.',
    badge: 'Historisch + KI-Prognose',
    legend: {
      historical: 'Historische Miete',
      projected: 'Prognose',
    },
    tooltip: {
      rent: 'Miete',
      year: 'Jahr {{year}}',
    },
    stats: {
      currentRent: 'Aktuelle Miete',
      currentUnit: '/m²',
      growth: 'Wachstum',
      growthSince: ' seit 2012',
      risk: 'Mietpreisrisiko',
      recommendation: 'Empfehlung',
    },
    recommend: {
      moveEarly: 'Jetzt zuschlagen — aufstrebende Lage',
      premium: 'Premiumlage',
      stable: 'Stabile Wahl',
      solid: 'Solides Preis-Leistungs-Verhältnis',
    },
    status: {
      stable: 'Stabil',
      premium: 'Premium',
      move: 'Jetzt zuschlagen',
      budget: 'Günstig',
      watch: 'Mietentwicklung beobachten',
    },
    comparison: {
      title: 'Stadtteil-Vergleich',
      viewMatrix: 'Vollständige Matrix →',
    },
    riskLevel: {
      high: 'Hoch',
      moderate: 'Mittel',
      low: 'Niedrig',
    },
    disclaimer:
      'Geschätzter Trend auf Basis verfügbarer offener Daten — keine exakte Vorhersage. Magdeburg Open Data Portal.',
    behind: {
      label: 'hinter der Prognose',
      card1Body:
        'Die Trendlinie zeigt die Nettokaltmiete je Stadtteil laut Mietspiegel — 2012–2024 beobachtet und 2025–2026 vom Index selbst prognostiziert.',
      card1Details:
        'Der qualifizierte Mietspiegel veröffentlicht Vorausschauwerte für 2025–26; der historische Abschnitt wird durchgezogen, die Prognose gestrichelt dargestellt. Baugenehmigungen/-fertigstellungen (KISS-MD) fließen in die Momentum-Tags ein.',
      card1Big: '15',
      card1BigUnit: ' Jahre',
      card1Source: 'Mietspiegel 2024, Stadt Magdeburg',
      card2GrowthRisk: 'Wachstum & Risiko',
      card2Body:
        'Das Wachstum ist die Mietveränderung seit 2012. Das Mietpreisrisiko und die Tags „Jetzt zuschlagen / Premium / Günstig" ergeben sich aus dem Wachstum jedes Stadtteils im Verhältnis zur städtischen Medianmiete.',
      card2Details:
        'Hohes Wachstum + noch erschwinglich = „Jetzt zuschlagen"; teuer = „Premium"; günstig & langsam = „Günstig"; sehr schnell = „Mietentwicklung beobachten". Trends sind indikativ, keine Prognosen.',
      card2Source: 'Schätzung auf Basis offener Daten — keine exakte Vorhersage',
    },
  },
}

export default future
