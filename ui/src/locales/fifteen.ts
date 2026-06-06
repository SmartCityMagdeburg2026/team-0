// pages.fifteen.* subtree
const fifteen = {
  en: {
    title: '15-Minute City Radius',
    subtitle:
      'Visualizing walking distances to essential amenities from the district center. A strong 15-minute score indicates high walkability and local convenience.',

    walkScore: {
      label: 'Overall Walk Score',
    },

    map: {
      title: 'Accessibility Map',
      amenities: '{{count}} amenities',
    },

    bands: {
      r5: '5-Minute Walk',
      r5sub: 'Immediate Vicinity',
      r10: '10-Minute Walk',
      r10sub: 'Neighborhood Level',
      r15: '15-Minute Walk',
      r15sub: 'District Bound',
    },

    quality: {
      optimal: 'Optimal',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      limited: 'Limited',
    },

    cat: {
      grocery: 'Groceries',
      transit: 'Transit',
      healthcare: 'Health',
      park: 'Parks',
      school: 'School',
      retail: 'Retail',
      clinic: 'Clinic',
      civic: 'Civic',
      gyms: 'Gyms',
    },

    legend: {
      min5: '5 Min',
      min10: '10 Min',
      min15: '15 Min',
    },

    footnote:
      'Every amenity within the 15-min radius is plotted at its real OpenStreetMap location; pin color = walk band (5 / 10 / 15 min).',

    behind: {
      label: 'behind the walk score',
      card1: {
        big: '2,059',
        bigUnit: ' amenities',
        source: 'OpenStreetMap (Overpass) · district centroids',
        details:
          'Walking speed ≈ 5 km/h, so 5 min ≈ 400 m, 10 min ≈ 800 m, 15 min ≈ 1200 m. Each POI\'s straight-line distance from the district centre is binned into those rings; the pins on the map are the real OSM coordinates.',
        bodyPrefix: 'Walkability comes from ~2,000',
        bodyAmenities: 'amenities & transit stops',
        bodyMid: 'mapped in',
        bodyOsm: 'OpenStreetMap',
        bodySuffix: ', counted inside 400 / 800 / 1200 m walk rings around each district centre.',
      },
      card2: {
        source: 'Min-max normalized access index',
        details:
          'A district scoring high has many amenities close to its centre relative to the other districts. The radar shows the seven dimensions; the band cards count amenities reachable within each walk ring.',
        scoreTitle: 'Walk Score',
        bodyPrefix: 'The',
        bodyOverall: 'Overall Walk Score',
        bodyMid: 'averages seven access dimensions — grocery, pharmacy, healthcare, parks, schools, transit and cafés — each',
        bodyNorm: 'normalized 0–100',
        bodySuffix: 'across all districts.',
      },
    },
  },

  de: {
    title: '15-Minuten-Stadt-Radius',
    subtitle:
      'Hier siehst du, wie weit du von wichtigen Orten im Stadtteil zu Fuß gehen musst. Ein hoher 15-Minuten-Score steht für gute Walkability und kurze Wege im Alltag.',

    walkScore: {
      label: 'Gesamt-Walk-Score',
    },

    map: {
      title: 'Erreichbarkeitskarte',
      amenities: '{{count}} Orte',
    },

    bands: {
      r5: '5-Minuten-Fußweg',
      r5sub: 'Direkte Umgebung',
      r10: '10-Minuten-Fußweg',
      r10sub: 'Nachbarschaftsebene',
      r15: '15-Minuten-Fußweg',
      r15sub: 'Stadtteilgrenze',
    },

    quality: {
      optimal: 'Optimal',
      excellent: 'Ausgezeichnet',
      good: 'Gut',
      fair: 'Akzeptabel',
      limited: 'Eingeschränkt',
    },

    cat: {
      grocery: 'Lebensmittel',
      transit: 'ÖPNV',
      healthcare: 'Gesundheit',
      park: 'Parks',
      school: 'Schule',
      retail: 'Einzelhandel',
      clinic: 'Klinik',
      civic: 'Öffentlich',
      gyms: 'Fitnessstudios',
    },

    legend: {
      min5: '5 Min',
      min10: '10 Min',
      min15: '15 Min',
    },

    footnote:
      'Alle Orte im 15-Minuten-Radius sind an ihrer echten OpenStreetMap-Position eingezeichnet; die Pinfarbe zeigt das Laufband (5 / 10 / 15 Min).',

    behind: {
      label: 'hinter dem Walk-Score',
      card1: {
        big: '2.059',
        bigUnit: ' Orte',
        source: 'OpenStreetMap (Overpass) · Stadtteil-Zentroide',
        details:
          'Gehgeschwindigkeit ≈ 5 km/h, also 5 Min ≈ 400 m, 10 Min ≈ 800 m, 15 Min ≈ 1200 m. Die Luftlinien-Entfernung jedes POI vom Stadtteilzentrum wird in diese Ringe eingeordnet; die Pins auf der Karte zeigen die echten OSM-Koordinaten.',
        bodyPrefix: 'Die Walkability basiert auf ~2.000',
        bodyAmenities: 'Orte & Haltestellen',
        bodyMid: 'aus',
        bodyOsm: 'OpenStreetMap',
        bodySuffix: ', die in 400 / 800 / 1200 m Laufringen um das jeweilige Stadtteilzentrum gezählt werden.',
      },
      card2: {
        source: 'Min-Max-normierter Erreichbarkeitsindex',
        details:
          'Ein Stadtteil mit hohem Score hat viele Orte nah an seinem Zentrum – im Vergleich zu den anderen Stadtteilen. Das Radar zeigt die sieben Dimensionen; die Band-Karten zählen die Orte innerhalb jedes Laufrings.',
        scoreTitle: 'Walk Score',
        bodyPrefix: 'Der',
        bodyOverall: 'Gesamt-Walk-Score',
        bodyMid: 'mittelt sieben Erreichbarkeitsdimensionen – Lebensmittel, Apotheke, Gesundheit, Parks, Schulen, ÖPNV und Cafés – jeweils',
        bodyNorm: 'normiert auf 0–100',
        bodySuffix: 'über alle Stadtteile.',
      },
    },
  },
}

export default fifteen
