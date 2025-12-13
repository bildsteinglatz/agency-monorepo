export const imprintData = {
  impressum: {
    title: `Impressum (W25 Beta 0.3.8. ${new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })})`,
    intro: "Informationen gemäß § 5 ECG und § 14 UGB",
    sections: [
      {
        title: "1. Verantwortlicher",
        content: [
          "MMag. Matthias Bildstein",
          "Praterstrasse 49",
          "1020 Wien / ÖSTERREICH"
        ]
      },
      {
        title: "2. Kontakt",
        content: [
          "Tel: +43(0)699 11190126",
          "E-Mail: office@bildsteinglatz.com"
        ]
      },
      {
        title: "3. Berufsrechtliche Information",
        content: [
          "Rechtsform: Einzelunternehmen / Neue Selbständigkeit",
          "Berufsbezeichnung: Freischaffender Künstler (Önace Code: 90030)",
          "UID: ATU69366134",
          "EORI: ATEOS1000134211"
        ]
      },
      {
        title: "4. Zuständige Behörden und Vertretungen",
        content: [
          "Zuständiges Finanzamt: Finanzamt Österreich, Dienststelle Wien 1/23",
          "Sozialversicherung: Sozialversicherungsanstalt der Selbständigen (SVS)",
          "Interessenvertretung: Berufsvereinigung Bildender Künstlerinnen und Künstler Vorarlbergs, Bildrecht Wien",
          "Anwendbare Rechtsvorschriften: Es gelten die Bestimmungen des Kunstförderungsgesetzes (KuFöG) und das Urheberrechtsgesetz (UrhG)."
        ]
      }
    ],
    copyright: [
      "Alle Rechte vorbehalten.",
      `© Bildstein | Glatz, ${new Date().getFullYear()}`,
      `© Bildrecht, Wien, ${new Date().getFullYear()}`,
      `© Visarte, Zürich, ${new Date().getFullYear()}`,
      `© Matthias Bildstein, ${new Date().getFullYear()}`,
      `© Philippe Glatz, ${new Date().getFullYear()}`,
      `© Clemens Ascher, ${new Date().getFullYear()}, photography`,
      `© Martin Bischof, ${new Date().getFullYear()}, photography`,
      `© Donato Caspari, ${new Date().getFullYear()}, photography`,
      `© Daniel Furxer, ${new Date().getFullYear()}, photography`,
      `© Florian Koller, ${new Date().getFullYear()}, photography`,
      `© Petra Rainer, ${new Date().getFullYear()}, photography`,
      `© Philipp Steurer, ${new Date().getFullYear()}, photography`,
      `© Darko Todorovic, ${new Date().getFullYear()}, photography`,
    ]
  },
  privacy: {
    title: "Datenschutzerklärung (DSGVO)",
    intro: "Informationen zur Datenverarbeitung\nStand: 26. November 2025",
    sections: [
      {
        title: "1. Verantwortlicher und Kontakt",
        content: [
          "Verantwortlich für die Datenverarbeitung auf dieser Website ist:",
          "MMag. Matthias Bildstein (siehe Impressum)",
          "Praterstrasse 49, 1020 Wien, ÖSTERREICH",
          "Kontakt: office@bildsteinglatz.com"
        ]
      },
      {
        title: "2. Ihre Rechte als betroffene Person",
        content: [
          "Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und Datenübertragbarkeit (Art. 20 DSGVO). Ebenso haben Sie ein Widerspruchsrecht (Art. 21 DSGVO).",
          "Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, haben Sie das Recht auf Beschwerde bei der österreichischen Datenschutzbehörde (DSB)."
        ]
      },
      {
        title: "3. Verarbeitung von Nutzungsdaten",
        subsections: [
          {
            title: "3.1. Server-Logfiles (Erforderliche Daten)",
            content: [
              "Beim Besuch dieser Website speichert der Hosting-Provider standardmäßig technische Daten in sogenannten Server-Logfiles. Dazu gehören Ihre IP-Adresse, der Browsertyp, das Datum und die Uhrzeit des Zugriffs.",
              "Zweck: Gewährleistung der technischen Sicherheit und Fehleranalyse.",
              "Speicherdauer: 7 Tage, danach anonymisiert.",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an der sicheren und fehlerfreien Bereitstellung)."
            ]
          },
          {
            title: "3.2. Cookies",
            content: [
              "Diese Website verwendet ausschließlich technisch notwendige Cookies, die zur grundlegenden Funktion erforderlich sind (z.B. für die Navigation oder Sicherheit). Es werden keine Tracking- oder Marketing-Cookies eingesetzt.",
              "Rechtsgrundlage: § 165 Abs. 3 TKG 2021 (für technisch notwendige Cookies)."
            ]
          }
        ]
      },
      {
        title: "4. Kontaktaufnahme (E-Mail)",
        content: [
          "Wenn Sie uns per E-Mail kontaktieren, speichern wir die von Ihnen übermittelten Daten zur Bearbeitung Ihrer Anfrage. Eine Weitergabe an Dritte erfolgt ohne Ihre Zustimmung nicht.",
          "Zweck: Bearbeitung und Beantwortung der Anfrage.",
          "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder vorvertragliche Maßnahmen)."
        ]
      },
      {
        title: "5. Externe Dienste und Infrastruktur",
        intro: "Wir verzichten auf dieser Website auf den Einsatz von Web-Analyse-Tools (wie Google Analytics) und Social-Media-Plugins, die eine Einwilligung erfordern. Die nachfolgend aufgeführten Dienste sind für den technischen Betrieb und die funktionale Darstellung der Website erforderlich.",
        subsections: [
          {
            title: "5.1. Hosting, Backend und Datenbank (Vercel, Sanity, Firestore)",
            content: [
              "Diese Website wird bei Vercel Inc. gehostet. Die Inhalte und Daten (z.B. Texte, Bilder) werden über Sanity.io (ein Content Management System) bereitgestellt und in Google Firestore (einer Datenbank von Google) gespeichert. Vercel, Sanity und Google handeln hierbei als unsere Auftragsverarbeiter.",
              "Zweck: Bereitstellung und Betrieb der Website.",
              "Betroffene Daten: Bestandsdaten, Inhaltsdaten, Nutzungsdaten, Metadaten.",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an einer effizienten und sicheren Bereitstellung) sowie Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung, falls Sie registrierte Dienste nutzen).",
              "Datentransfer: Da Vercel und Google US-amerikanische Unternehmen sind, erfolgt eine Datenübertragung in die USA. Es werden die von der EU-Kommission genehmigten Standardvertragsklauseln (SCCs) als Garantien verwendet."
            ]
          },
          {
            title: "5.2. Video-Inhalte (Vimeo)",
            content: [
              "Wir nutzen Vimeo für die Darstellung von Videos. Vimeo wird betrieben von Vimeo.com, Inc. Wir verwenden den \"Do Not Track\"-Modus, um das Tracking zu minimieren.",
              "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse an der visuellen Präsentation der Arbeiten).",
              "Datentransfer: USA (Standardvertragsklauseln)."
            ]
          }
        ]
      }
    ]
  },
  agb: {
    title: "Allgemeine Geschäftsbedingungen (AGB)",
    intro: `Bildstein | Glatz\n$$Hier vollständige Firmenanschrift einfügen, z.B. Atelieradresse$$\n$$Land: Österreich / Schweiz$$\n(nachfolgend „Künstler“ genannt)\n\nStand: ${new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    sections: [
      {
        title: "TEIL A: Allgemeine und Werkverkaufsbedingungen",
        content: [
          "Diese Bestimmungen gelten für alle Vertragsverhältnisse, insbesondere für den Verkauf von Werken, Editionen und Leihgaben."
        ]
      },
      {
        title: "§ 1 Definitionen",
        content: [
          "Werk: Bezieht sich auf alle physischen und digitalen Kunstwerke, Installationen, Editionen oder Unikate, die von den Künstlern geschaffen und verkauft werden.",
          "Auftraggeber (AG) / Kunde: Die natürliche oder juristische Person, die das Werk in Auftrag gibt, erwirbt oder leiht.",
          "Entwürfe: Alle vorbereitenden geistigen Vorleistungen der Künstler, insbesondere Skizzen, Modelle, digitale Renderings, 3D-Scans und statische Vorkalkulationen.",
          "Schriftform: Bezieht sich auf die Übermittlung von Erklärungen per Brief, Telefax oder E-Mail. Mündliche Erklärungen oder Mitteilungen per Social Media (z.B. WhatsApp, Telegram) genügen der Schriftform nicht, es sei denn, sie werden nachträglich per E-Mail oder Brief bestätigt.",
          "Geringfügiger Mangel: Ein Mangel, der die Funktion, Nutzungssicherheit oder den künstlerischen Gesamteindruck des Werkes nicht wesentlich beeinträchtigt und dessen Behebung in einem angemessenen Zeitraum möglich ist.",
          "Schwerwiegender Mangel: Ein Mangel, der die Standsicherheit, die wesentliche Funktion oder den künstlerischen Gesamteindruck so beeinträchtigt, dass das Werk nicht genutzt oder ausgestellt werden kann."
        ]
      },
      {
        title: "§ 2 Geltungsbereich und Vertragsschluss",
        content: [
          "Diese AGB gelten für alle Geschäftsbeziehungen zwischen den Künstlern und ihren Kunden. Abweichende oder ergänzende Bedingungen des Kunden werden nur bei ausdrücklicher schriftlicher Zustimmung der Künstler Vertragsbestandteil.",
          "Ein Vertrag kommt durch die schriftliche Annahme des Angebots, die Ausstellung einer Rechnung oder die Unterzeichnung eines Kauf- oder Leihvertrages zustande.",
          "Unverbindlichkeit von Entwürfen: Digitale Renderings, Vorschauen oder Modelle sind unverbindliche Darstellungen; geringfügige Abweichungen im finalen Werk (z.B. in Farbe, Dimension oder Materialstruktur) stellen keinen Mangel dar."
        ]
      },
      {
        title: "§ 3 Preise & Zahlungsbedingungen",
        content: [
          "Alle Preise verstehen sich in EUR oder CHF. Die Umsatzsteuer (MwSt) wird entsprechend der steuerrechtlichen Situation des Lieferortes separat ausgewiesen.",
          "Fälligkeit: Bei Werkverkäufen ist die Zahlung sofort nach Rechnungsstellung ohne Abzug fällig. Skontoabzüge sind nicht zulässig, sofern nicht ausdrücklich vereinbart.",
          "Zahlungsziel & Verzug: Rechnungen sind innerhalb von 14 Tagen nach Zugang fällig."
        ]
      },
      {
        title: "§ 4 Transport, Gefahrübergang & Eigentumsvorbehalt",
        content: [
          "Transport & Risiko: Die Lieferung erfolgt „Ab Werk/Atelier“ (EXW – Incoterms 2020), sofern nicht anders vereinbart. Der Transport erfolgt auf Kosten und Risiko des Kunden, auch wenn die Künstler den Transport organisieren.",
          "Versicherungspflicht ab Versand: Ab Übergabe an den Spediteur (oder bei Abholung) geht die Gefahr des zufälligen Untergangs oder der Beschädigung auf den Kunden über. Der Kunde ist für die Transportversicherung zuständig.",
          "Eigentumsvorbehalt: Das Werk bleibt bis zur vollständigen Bezahlung im Eigentum der Künstler. Vor Eigentumsübergang ist jede Weitergabe, Verpfändung oder sicherungsweise Übereignung untersagt."
        ]
      },
      {
        title: "§ 5 Urheberrecht, Entwürfe & Digitale Rechte",
        content: [
          "Urheberrecht: Das Urheberrecht am Werk verbleibt uneingeschränkt bei Bildstein | Glatz. Mit dem Erwerb eines Werkes gehen keine Nutzungs-, Reproduktions-, Digitalisierungs- oder sonstigen Verwertungsrechte über.",
          "Kommerzielle und Digitale Nutzung: Jede gewerbliche oder kommerzielle Nutzung sowie die Erstellung digitaler Derivate (insbesondere Reproduktion, Digitalisierung, 3D-Scans, VR/AR-Anwendungen, die Nutzung für NFTs, KI-Generierung oder Deepfakes) bedarf der gesonderten, schriftlichen Zustimmung der Künstler und ist honorarpflichtig.",
          "Dokumentationsrecht des Kunden: Der Kunde erhält das einfache, nicht-exklusive Recht, das Werk für private oder interne Dokumentationszwecke (z. B. Sammlungsdokumentation, interne Kataloge ohne Verkauf) abzubilden.",
          "Eigentum an Entwürfen: Alle Entwürfe verbleiben im geistigen Eigentum und im physischen Besitz der Künstler. Der Kunde erhält keine Nutzungsrechte an verworfenen Entwürfen.",
          "Namensnennung: Die Namensnennung („Bildstein | Glatz“) ist bei jeder öffentlichen Abbildung oder Ausstellung zwingend erforderlich."
        ]
      },
      {
        title: "§ 6 Gewährleistung & Mängel",
        content: [
          "Künstlerische Beschaffenheit: Künstlerische Unikatcharakteristika (Farbnuancen, Materialstruktur, Patina, leichte Oberflächenveränderungen) stellen keinen Mangel dar.",
          "Gewährleistung: Gewährleistungsansprüche für Unternehmer verjähren 12 Monate nach Übergabe des Werkes.",
          "Mängel bei Versand: Stellt der Kunde bei Eintreffen des versandten Werkes Mängel fest, hat er dies unverzüglich (spätestens binnen 7 Tagen) schriftlich zu rügen und fotografisch zu dokumentieren."
        ]
      },
      {
        title: "§ 7 Leihgaben und Ausstellungen",
        content: [
          "Pflichten des Kunden: Bei Leihgaben und Ausstellungen stellt der Kunde eine dem Werk angemessene Präsentation, Bewachung und Klimaführung sicher. Der Kunde muss eine dem Wert des Werkes entsprechende Ausstellungspolice abschließen und den Künstlern den Versicherungsschutz nachweisen.",
          "Haftung: Schäden während der Leihdauer (ab Übergabe bis zur Rücknahme) liegen ausschließlich in der Verantwortung des Kunden."
        ]
      },
      {
        title: "§ 8 Umgang mit dem Werk & Integritätsschutz",
        content: [
          "Veränderungsverbot: Das Werk darf ohne schriftliche Zustimmung der Künstler nicht verändert, demontiert oder an anderer Stelle in verändertem Kontext wieder aufgebaut (Entstellung) werden.",
          "Rückruf- und Rücknahmerecht: Im Falle einer schwerwiegenden, nachweislichen und nachhaltigen Verletzung der Urheberpersönlichkeitsrechte (z.B. grobe Entstellung des Werkes oder Nutzung in einem die künstlerische Reputation nachhaltig schädigenden Kontext), sind die Künstler berechtigt, die Rückgabe des Werkes gegen Rückerstattung des ursprünglichen Netto-Kaufpreises (abzüglich einer angemessenen Wertminderung) zu verlangen."
        ]
      },
      {
        title: "§ 9 Haftung",
        content: [
          "Haftungsumfang: Die Künstler haften unbeschränkt nur für Vorsatz, grobe Fahrlässigkeit sowie bei Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.",
          "Haftungsbegrenzung: Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung der Künstler auf den bei Vertragsschluss typischerweise vorhersehbaren Sach- und reinen Vermögensschaden begrenzt, maximal jedoch auf die Höhe des Kaufpreises oder die Deckungssumme der bestehenden Betriebshaftpflichtversicherung (es gilt der höhere Betrag)."
        ]
      },
      {
        title: "TEIL B: Sonderbedingungen für Installationen und Großprojekte",
        content: [
          "Diese Bestimmungen gelten nur für komplexe Werkverträge, Installationen im öffentlichen Raum und Großprojekte, sofern sie im Einzelvertrag als anwendbar erklärt werden. Bei Konflikten haben die Bestimmungen dieses Teils Vorrang vor Teil A."
        ]
      },
      {
        title: "§ 10 Anwendungsbereich, Kündigung & Entwürfe",
        content: [
          "Anwendung: Dieser Teil B gilt für Auftragsarbeiten, Installationen im öffentlichen Raum und Projekte mit Montageleistungen.",
          "Leistungsumfang: Planungsleistungen (Statik, Tiefbau, Genehmigungsplanung) sind nur dann geschuldet, wenn sie explizit im Einzelvertrag inkludiert sind.",
          "Vergütung verworfener Entwürfe: Wird der Vertrag über die Ausführung des Werkes nicht abgeschlossen oder bricht der AG die Planung ab, sind die Künstler berechtigt, die bis dahin erbrachten Planungsleistungen und Entwürfe auf Basis der vereinbarten Honorarsätze abzurechnen.",
          "Kündigung von Auftragsarbeiten durch AG: Kündigt der AG einen Werkvertrag ohne wichtigen Grund, sind die Künstler berechtigt, alle bis zum Kündigungszeitpunkt erbrachten Leistungen abzurechnen. Darüber hinaus steht den Künstlern eine pauschalierte Entschädigung von mindestens 20% des noch nicht abgerechneten Netto-Auftragswertes für den entgangenen Gewinn und die entstandenen Gemeinkosten zu. Den Parteien bleibt der Nachweis eines geringeren oder höheren Schadens vorbehalten."
        ]
      },
      {
        title: "§ 11 Projektablauf, Genehmigungen & Nachträge",
        content: [
          "Pflichten AG – Genehmigungen & Statik: Die Verantwortung und die Kosten für die bauseitige Vorbereitung, die Erlangung aller behördlichen Genehmigungen (einschließlich Bau-, Werbe- und Denkmalschutzbewilligungen) sowie die Beauftragung des Prüfstatikers obliegen dem AG. Der AG stellt die Künstler von allen Ansprüchen Dritter frei, die aus fehlenden Genehmigungen resultieren.",
          "Subunternehmer: Die Künstler sind berechtigt, Subunternehmer für einzelne Gewerke zu beauftragen. Die Haftung für die Leistungen der Subunternehmer verbleibt bei den Künstlern.",
          "Nachtragsmanagement (Change Orders): Wünscht der AG eine Änderung, ist diese schriftlich zu beantragen. Mündliche Anweisungen des AG auf der Baustelle müssen zur Gültigkeit unverzüglich vom AG in Schriftform bestätigt werden. Die Durchführung beginnt erst nach schriftlicher Annahme des Nachtragsangebots, das Kosten, neue Terminschiene und Auswirkungen regelt.",
          "Projektverzug durch AG: Verzögerungen, die auf fehlende bauseitige Voraussetzungen, verspätete Genehmigungen oder Drittverzögerungen des AG zurückzuführen sind, verlängern die Ausführungsfrist der Künstler angemessen. Kosten für Wartezeiten und Mehraufwand werden gesondert in Rechnung gestellt."
        ]
      },
      {
        title: "§ 12 Abnahme & Haftung im Projektbereich",
        content: [
          "Zahlungsmodell: Soweit im Einzelvertrag vereinbart, kann das Standardmodell (z.B. 30% Anzahlung / 30% nach Atelierfertigstellung / 40% nach Abnahme) zur Anwendung kommen.",
          "Abnahmefrist: Der AG ist verpflichtet, das Werk innerhalb von 14 Werktagen nach Mitteilung der Fertigstellung zu prüfen und die Abnahme zu erklären. Geringfügige Mängel berechtigen nicht zur Verweigerung der Abnahme.",
          "Fiktive Abnahme: Nimmt der AG das Werk ohne schriftliche Erklärung in Gebrauch, erfolgt die Zahlung der Schlussrechnung oder werden keine schwerwiegenden Einwände innerhalb der Frist erhoben, gilt das Werk als mängelfrei abgenommen.",
          "Gefahrübergang bei Verzug: Bei unbegründeter Verweigerung der Abnahme durch den AG geht die Gefahr mit dem Datum der ursprünglich geplanten Abnahme auf den AG über (Abnahmeverzug).",
          "Statik-Haftung: Für die statische Sicherheit haften die Künstler nur, wenn sie die statische Berechnung selbst beauftragt und als eigene Leistung geschuldet war.",
          "Rückbaukosten: Wird das Werk durch grob fahrlässigen oder unsachgemäßen Umgang seitens des AG beschädigt, so dass ein unumgänglicher Rückbau notwendig wird, trägt der AG sämtliche dafür anfallenden Kosten."
        ]
      },
      {
        title: "§ 13 Operative Sonderregelungen (müssen explizit im Einzelvertrag vereinbart sein)",
        content: [
          "Zugang & Arbeitszeiten (24h-Klausel): Sofern der Einzelvertrag diese Klausel explizit aufnimmt, gewährleistet der AG dem Künstlerteam während der vereinbarten Aufbauphase uneingeschränkten Zugang zum Installationsort rund um die Uhr (24 Stunden/Tag), einschließlich Wochenenden und Feiertagen. Der AG holt alle notwendigen Genehmigungen hierfür ein.",
          "Aufenthalt & Übernachtung: Soweit für den effizienten Projektablauf erforderlich und im Einzelvertrag vereinbart, ist den Künstlern das Übernachten am oder in unmittelbarer Nähe des Installationsortes (z.B. in temporären Unterkünften auf dem Gelände) zu gestatten. Der AG trägt die Verantwortung für die Einhaltung aller brandschutz- und arbeitsschutzrechtlichen Bestimmungen im Zusammenhang mit dieser Übernachtung."
        ]
      },
      {
        title: "§ 14 Material, Patina & Wartung",
        content: [
          "Material & Patina: Im Außenraum auftretende witterungsbedingte Materialveränderungen (Rost, Patina, Ausbleichen, Risse) sind werkimmanent und kein Mangel.",
          "Wartungspflicht: Bei Werken im Außenbereich wird der AG verpflichtet, die von den Künstlern empfohlenen Wartungsintervalle (z.B. jährliche Sichtprüfung, Reinigung) einzuhalten und diese Wartung von einer Fachfirma durchführen und dokumentieren zu lassen. Schäden, die auf mangelnde oder unsachgemäße Wartung zurückzuführen sind, liegen nicht im Verantwortungsbereich der Künstler."
        ]
      },
      {
        title: "§ 15 Schlussbestimmungen",
        content: [
          "Rechtswahl & Gerichtsstand: Es gilt das Recht des Staates, in dem die rechnungsstellende Niederlassung der Künstler ihren Sitz hat (Österreich oder Schweiz), unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist der Sitz der rechnungsstellenden Niederlassung der Künstler.",
          "Verjährung: Die Verjährung von Honoraransprüchen beträgt die gesetzliche Frist (in AT/CH i.d.R. 3 bzw. 5 Jahre).",
          "Salvatorische Klausel: Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
          "Datenschutz: Die Verarbeitung personenbezogener Daten erfolgt gemäß der gesonderten Datenschutzerklärung."
        ]
      }
    ]
  }
};
