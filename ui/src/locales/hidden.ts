// pages.hidden.* subtree
const hidden = {
  en: {
    title1: "Rent isn't the",
    title2: 'full cost.',
    subtitle:
      'Discover the true cost of living in different Magdeburg districts by factoring in utilities, mobility, and daily necessities.',

    params: {
      title: 'Your Parameters',
      primaryCommute: 'Primary Commute',
    },

    total: {
      label: 'Estimated Monthly Total',
      perMonth: '/mo',
      vsCityAvg: 'vs city avg',
    },

    costStructure: {
      label: 'Cost Structure',
      hundred: '100%',
    },

    lineItems: {
      coldRent: 'Cold Rent',
      utilitiesHeating: 'Utilities & Heating',
      transport: 'Transport ({{mode}})',
    },

    transportSub: {
      tram: 'Deutschlandticket',
      car: 'fuel + parking',
      bike: 'fuel (charging) + upkeep',
      walk: 'no ticket needed',
    },

    insight: {
      title: 'Value Insight',
      above: 'Although <b>€{{eur}} above average</b>, {{name}} offsets the higher base rent with strong daily access — amenities and transit within a short walk, saving commute effort and time.',
      below: 'Although <b>€{{eur}} below average</b>, {{name}} is an easy win: a low total cost without giving up everyday access.',
    },

    behind: {
      label: 'behind the cost',
      card1Big: '3',
      card1BigUnit: ' cost layers',
      card1Source: 'Mietspiegel 2024 · Deutschlandticket',
      card1Details:
        'Transport: tram = €63 (Deutschlandticket, 2026 price), bike ≈ €15 (fuel/charging + upkeep), car = €300 placeholder, walk = €0. Utilities use a 2.5 €/m² Nebenkosten assumption; rent is the qualified Mietspiegel net cold rent for the selected district (a district average, not a live listing).',
      card1Body:
        'True cost stacks three layers: <b>rent</b> (Mietspiegel 2024 net cold rent × size), <b>utilities</b> (a flat 2.5 €/m²), and <b>transport</b> for your commute mode.',
      card2BigLabel: 'Total Cost of Life',
      card2Source: 'Own calculation, transparent assumptions',
      card2Details:
        'Estimates are deliberately modest — a €30–40 difference is acceptable if access improves. Rent is a district average from the Mietspiegel, not an individual listing.',
      card2Body:
        '<b>Total = rent + utilities + transport</b>. We compare it to the <b>city average</b> for the same flat size and commute, so the badge shows whether you\'re above or below typical.',
    },
  },

  de: {
    title1: 'Die Miete ist nicht',
    title2: 'alles.',
    subtitle:
      'Entdecke die wahren Lebenshaltungskosten in den Magdeburger Stadtteilen – inklusive Nebenkosten, Mobilität und Alltagsbedarf.',

    params: {
      title: 'Deine Parameter',
      primaryCommute: 'Hauptverkehrsmittel',
    },

    total: {
      label: 'Geschätzte Monatskosten',
      perMonth: '/Monat',
      vsCityAvg: 'vs. Stadtdurchschnitt',
    },

    costStructure: {
      label: 'Kostenstruktur',
      hundred: '100%',
    },

    lineItems: {
      coldRent: 'Kaltmiete',
      utilitiesHeating: 'Nebenkosten & Heizung',
      transport: 'Mobilität ({{mode}})',
    },

    transportSub: {
      tram: 'Deutschlandticket',
      car: 'Kraftstoff + Parken',
      bike: 'Kraftstoff (Laden) + Wartung',
      walk: 'kein Ticket nötig',
    },

    insight: {
      title: 'Werteinschätzung',
      above: 'Obwohl <b>€{{eur}} über dem Durchschnitt</b>, gleicht {{name}} die höhere Grundmiete durch eine starke Alltagsinfrastruktur aus – Einkaufen und ÖPNV in kurzer Laufweite sparen Zeit und Aufwand.',
      below: 'Obwohl <b>€{{eur}} unter dem Durchschnitt</b>, ist {{name}} ein echter Gewinn: günstige Gesamtkosten ohne Abstriche bei der Alltagsversorgung.',
    },

    behind: {
      label: 'hinter den Kosten',
      card1Big: '3',
      card1BigUnit: ' Kostenebenen',
      card1Source: 'Mietspiegel 2024 · Deutschlandticket',
      card1Details:
        'Mobilität: Straßenbahn = €63 (Deutschlandticket, Preis 2026), Fahrrad ≈ €15 (Kraftstoff/Laden + Wartung), Auto = €300 Schätzwert, zu Fuß = €0. Nebenkosten mit 2,5 €/m² pauschal; Miete ist der qualifizierte Nettokaltmiete-Mittelwert des Stadtteils aus dem Mietspiegel (kein Echtzeit-Inserat).',
      card1Body:
        'Die Gesamtkosten setzen sich aus drei Ebenen zusammen: <b>Kaltmiete</b> (Mietspiegel 2024 × Fläche), <b>Nebenkosten</b> (pauschal 2,5 €/m²) und <b>Mobilität</b> für dein Verkehrsmittel.',
      card2BigLabel: 'Gesamte Lebenshaltungskosten',
      card2Source: 'Eigene Berechnung, transparente Annahmen',
      card2Details:
        'Die Schätzungen sind bewusst konservativ – eine Differenz von €30–40 ist akzeptabel, wenn die Infrastruktur besser ist. Die Miete ist ein Stadtteil-Durchschnitt aus dem Mietspiegel, kein Einzelinserat.',
      card2Body:
        '<b>Gesamt = Kaltmiete + Nebenkosten + Mobilität</b>. Der Vergleich mit dem <b>Stadtdurchschnitt</b> für gleiche Fläche und Verkehrsmittel zeigt, ob du über oder unter dem Üblichen liegst.',
    },
  },
}

export default hidden
