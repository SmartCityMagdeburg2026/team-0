// pages.ai.* subtree
const ai = {
  en: {
    title: 'AI Relocation Assistant',
    disclaimer: 'AI Assistant can make mistakes. Verify important information with city resources.',
    placeholder: 'Ask about neighborhoods, commute times, or specific amenities…',
    welcome: 'Welcome to Magdeburg! Tell me your budget, who you are, and what matters most to your daily life.',
    sg: { value: 'Best value', family: 'Family-friendly', student: 'Near OVGU', quiet: 'Quiet & green' },
    error: {
      api: 'Could not reach the API — is the backend running on :8000?',
    },
    thinking: 'Thinking…',
    matchSuffix: '% Match',
    sourcesLabel: 'Sources:',
    pros: {
      transit: 'Excellent transit links',
      park: 'Great park access',
      green: 'Lots of green space',
      walking: 'Everything in walking distance',
      healthcare: 'Strong healthcare access',
      affordable: 'Very affordable',
      overall: 'Strong overall fit',
    },
    cons: {
      highDemand: 'High demand area',
      higherRent: 'Higher rent',
      commute: 'Longer commute to centre',
      limitedGreen: 'Limited green space',
      limitedData: 'Limited data',
    },
    cards: {
      dataLabel: 'behind the assistant',
      dataTitle: '2',
      dataUnit: ' sources of truth',
      dataSource: 'Live scored data + BM25 over 70 doc chunks',
      dataDetails:
        'The tool reads the same data the API serves (auto-refreshed after each pipeline run), so figures are always current. Retrieval uses BM25 over district profiles, the scoring methodology, tenancy basics and Magdeburg open-data docs.',
      dataBody:
        'Recommendations come from our <b>live scored dataset</b> via a tool (exact rent, scores, ranking). Knowledge answers are <b>retrieved</b> from indexed district profiles, methodology and Magdeburg open-data docs.',
      modelSource: 'DeepSeek function-calling + retrieval-augmented',
      modelDetails:
        'No numbers are invented — figures come from the recommend_districts tool, prose from the retrieved context. If no API key is set, it falls back to a rule-based parser so the page still works offline.',
      modelBig: 'DeepSeek + tool + RAG',
      modelBody:
        '<b>DeepSeek</b> decides per question: a recommendation calls the <b>recommend_districts</b> tool (filter + sort live data); a knowledge question uses <b>BM25 retrieval</b>, then DeepSeek answers grounded in the sources.',
    },
  },
  de: {
    title: 'KI-Umzugsassistent',
    disclaimer: 'Der KI-Assistent kann Fehler machen. Prüfe wichtige Informationen bei den städtischen Stellen.',
    placeholder: 'Frag nach Stadtteilen, Fahrzeiten oder bestimmten Einrichtungen…',
    welcome: 'Willkommen in Magdeburg! Sag mir dein Budget, wer du bist und was dir im Alltag am wichtigsten ist.',
    sg: { value: 'Bestes Preis-Leistung', family: 'Familienfreundlich', student: 'Nahe OVGU', quiet: 'Ruhig & grün' },
    error: {
      api: 'API nicht erreichbar — läuft das Backend auf :8000?',
    },
    thinking: 'Einen Moment…',
    matchSuffix: '% Treffer',
    sourcesLabel: 'Quellen:',
    pros: {
      transit: 'Sehr gute ÖPNV-Anbindung',
      park: 'Tolle Parknähe',
      green: 'Viel Grünfläche',
      walking: 'Alles zu Fuß erreichbar',
      healthcare: 'Gute Gesundheitsversorgung',
      affordable: 'Sehr günstig',
      overall: 'Insgesamt sehr gut geeignet',
    },
    cons: {
      highDemand: 'Hohe Nachfrage',
      higherRent: 'Höhere Miete',
      commute: 'Längerer Weg ins Zentrum',
      limitedGreen: 'Wenig Grünfläche',
      limitedData: 'Wenig Daten vorhanden',
    },
    cards: {
      dataLabel: 'hinter dem Assistenten',
      dataTitle: '2',
      dataUnit: ' Wahrheitsquellen',
      dataSource: 'Live-Bewertungsdaten + BM25 über 70 Dokumentabschnitte',
      dataDetails:
        'Das Tool liest dieselben Daten, die die API liefert (automatisch nach jedem Pipeline-Lauf aktualisiert) – die Zahlen sind also immer aktuell. Die Suche nutzt BM25 über Stadtteilprofile, die Bewertungsmethodik, Mietrecht-Grundlagen und Magdeburger Open-Data-Dokumente.',
      dataBody:
        'Empfehlungen kommen aus unserem <b>live bewerteten Datensatz</b> via Tool (genaue Miete, Scores, Ranking). Wissensfragen werden aus indizierten Stadtteilprofilen, der Methodik und Magdeburger Open-Data-Dokumenten <b>abgerufen</b>.',
      modelSource: 'DeepSeek Function-Calling + Retrieval-Augmented',
      modelDetails:
        'Es werden keine Zahlen erfunden – die Werte stammen aus dem recommend_districts-Tool, der Fließtext aus dem abgerufenen Kontext. Ohne API-Key greift ein regelbasierter Parser ein, damit die Seite auch offline funktioniert.',
      modelBig: 'DeepSeek + Tool + RAG',
      modelBody:
        '<b>DeepSeek</b> entscheidet je nach Frage: Bei einer Empfehlung ruft es das <b>recommend_districts</b>-Tool auf (filtern + sortieren); bei einer Wissensfrage wird per <b>BM25-Suche</b> abgerufen, und DeepSeek antwortet auf Basis der gefundenen Quellen.',
    },
  },
}

export default ai
