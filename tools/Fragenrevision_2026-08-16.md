# Revision der Fragenkataloge · 16.08.2026

Alle 450 Fragen wurden daraufhin durchgesehen, ob sie einen fachlichen Bezug haben oder nur
Kursorganisation, Personen und Übungsabläufe abfragen. **16 Fragen wurden ersetzt, eine repariert.**
Jede Ersatzfrage ist im Folientext des jeweiligen Decks belegt; die Folienzahl steht in der Tabelle.

## Ersetzt

| Einheit | id | vorher | jetzt | Folien |
|---|---|---|---|---|
| 1 Kickoff | K11 | Anzahl versteckter Defekte im Übungsdatensatz | Spannweite der BI-Definitionsansätze | 25 |
| 1 Kickoff | K12 | Erwartete Haltung der Studierenden | BI als Sammelbegriff und Vorläufersysteme | 24 |
| 1 Kickoff | K13 | Werdegang des Dozenten | Zeit- und Informationsvorteil durch BI | 43, 44 |
| 1 Kickoff | K22 | Drei-Runden-Muster der Teamarbeit | Zweck der nichtlinearen Aktivierung | 52, 53 |
| 1 Kickoff | K23 | Chronologie der Veranstaltungen | Rechenverfahren hinter BI-Analysefunktionen | 56 |
| 1 Kickoff | K24 | Wofür das Akronym BINT steht | Verfahrenswahl bei Tabellendaten | 57 |
| 1 Kickoff | K34 | Diagrammtyp in einer Live-Demo | Datenleck im Prognosemodell | 58 |
| 1 Kickoff | K49 | Veranstaltungsphilosophie des Dozenten | Warum Sprachmodelle falsche Zahlen liefern | 59, 60 |
| 3 Erster Bericht | EB12 | Fachdisziplinen der fiktiven Projektgruppe | Validität und Reliabilität von Daten | 36 |
| 3 Erster Bericht | EB14 | Welches Kollaborationswerkzeug benutzt wird | Spaltenorientierte Verarbeitung bei Aggregationen | 106, 107 |
| 3 Erster Bericht | EB23 | Was im Hands-on-Teil getan wurde | Dubletten beim Zusammenführen von Quellen | 35, 44 |
| 3 Erster Bericht | EB33 | Aufgabe der Studierenden auf dem Board | Speichermodus Import und Aktualität | 114, 115 |
| 3 Erster Bericht | EB37 | Berührungspunkte zweier Lehrveranstaltungen | Wirkung mehrerer Sicherheitsrollen | 153 |
| 3 Erster Bericht | EB38 | Didaktischer Leitgedanke des Dozenten | Kennzeichnung geprüfter Berichte | 154 |
| 5 Verbesserter Bericht | EB25 | Name der Excel-Datei der Fallstudie | Hyperbolischer Graph als Focus-plus-Context-Darstellung | 44, 45 |
| 9 Deployment | D42 | Kapitelnummern in einem Standardwerk | Export von Berichten als Governance-Frage | 43, 82 |

## Repariert

**Q25 (Einheit 2)** hatte gar keinen Fragetext, nur Thema, Optionen und Begründung. Der Fragesatz ist
ergänzt, alles Übrige unverändert. Die fehlende Schwierigkeitsangabe steht jetzt auf „Mittel".

## Nebenbefund: Position der richtigen Antwort

Beim Prüfen fiel auf, dass die richtige Antwort fast immer an zweiter Stelle stand — in der
Datenmodellierung 46 von 50 Mal, bei Python/FastHTML 45 von 50. Wer das bemerkt, beantwortet die
Kataloge ohne jedes Fachwissen richtig. Die Antwortoptionen sind deshalb **einmalig durchmischt**
worden; die richtige Antwort verteilt sich jetzt in jeder Datei annähernd gleichmäßig auf alle vier
Positionen. Inhaltlich wurde nichts geändert, nur die Reihenfolge innerhalb der `options`, mit
entsprechend nachgezogenem `correctIndex`.

Die Mischung ist deterministisch aus der Fragen-id abgeleitet, damit ein erneuter Lauf dasselbe
Ergebnis liefert. Unabhängig davon mischt die Lernumgebung die Optionen zur Laufzeit noch einmal —
diese Voreinstellung lässt sich beim Start einer Runde abschalten.

---

# Zweiter Durchgang: Fallstudien-Inhalte

Vorgabe: Fragen, die Zahlen oder Inhalte aus der Kursfallstudie abfragen, haben in einem
Selbstlernquiz nichts zu suchen — es geht allein um Fachinhalte. Alle 450 Fragen wurden erneut
durchsucht, diesmal auch Antwortoptionen und Begründungen. **15 Fragen ersetzt, 9 entkoppelt.**

Betroffen waren nur die Einheiten 1, 3 und 5. Die Einheiten 2, 4, 6, 7, 8 und 9 enthalten keinen
einzigen Fallstudienbezug.

## Ersetzt (15)

| Einheit | id | vorher | jetzt | Folien |
|---|---|---|---|---|
| 1 Kickoff | K09 | Welche Datensätze von welcher Plattform die Fallstudie speisen | Die vier Stufen der Analytics-Treppe | 36 |
| 1 Kickoff | K10 | Das fiktive Einstiegsszenario der Fallstudie | Entstehung und betriebliche Verbreitung | 22, 23 |
| 1 Kickoff | K14 | Die sechs Schritte der Fallstudie | Werttreiber und Nutzenkategorien von BI | 41, 42 |
| 3 Erster Bericht | EB11 | Ausgangslage der Fallstudie | Accuracy bei seltenen Ereignissen | 55, 56 |
| 3 Erster Bericht | EB15 | Die Umsatzanomalie eines bestimmten Monats | Arbeitsbereich, App und Deployment-Pipeline | 152 |
| 3 Erster Bericht | EB29 | Absichtliche Modifikation der Kursdaten | Eigene Datums-Dimension statt Automatik | 117–120 |
| 3 Erster Bericht | EB50 | Höhe des Umsatzeinbruchs in Millionen | Kennzeichnung KI-erzeugter Berichtstexte | 133, 155 |
| 5 Verb. Bericht | EB26 | Das Abweichungsszenario ab August 2016 | Datenmodell fest an das BI-Tool gebunden | 15, 17, 31 |
| 5 Verb. Bericht | EB27 | Welcher Monat der Ausreisser ist | Bestellungen statt Positionen zählen | 25 |
| 5 Verb. Bericht | EB28 | Der genaue Abweichungsbetrag | Kardinalität und Filterrichtung der Beziehung | 27 |
| 5 Verb. Bericht | EB29 | Die verursachende Produkt-Unterkategorie | Sichten als Grundlage des Datenmodells | 56, 59, 61 |
| 5 Verb. Bericht | EB31 | Tiefste Hierarchiestufe im Fallbeispiel | Technische Attribute für Clienttools ausblenden | 30 |
| 5 Verb. Bericht | EB35 | Das positive Gegenstück im Januar 2016 | Dublettenfreie Dimensionstabellen | 56 |
| 5 Verb. Bericht | EB39 | Die Umsatzsumme des Kontrollzahlen-Kanons | Drillthrough gegenüber Drilldown | 73 |
| 5 Verb. Bericht | EB40 | Zeilenanzahl der Übungsdatenwelt | Automatisch abgeleiteter Cube in Python | 67–70 |

## Entkoppelt (9)

Hier war der Fachinhalt tragfähig, nur der Aufhänger kam aus der Fallstudie. Frage, Optionen oder
Begründung sind neutral formuliert, die Sache blieb dieselbe.

| Einheit | id | was geändert wurde |
|---|---|---|
| 1 Kickoff | K33 | „bei einer Abweichung im September 2016" raus; Begründung ohne Produktnamen |
| 3 Erster Bericht | EB45 | „für jede Fallstudien-Präsentation" raus |
| 3 Erster Bericht | EB34 | Beispiel „September 2016" durch „ein einzelner Monat" ersetzt |
| 3 Erster Bericht | EB46 | Beispielbotschaft ohne Fallstudienbezug |
| 5 Verb. Bericht | EB05 | Beispieltreiber aus der Begründung entfernt |
| 5 Verb. Bericht | EB17 | Bezugsmonat allgemein statt „Dezember 2016" |
| 5 Verb. Bericht | EB30 | Frage ohne konkrete Kategorienamen; Begründung ohne Millionenbeträge |
| 5 Verb. Bericht | EB36 | Frage, Optionen und Thema auf „ein Berichtsmonat" verallgemeinert |
| 5 Verb. Bericht | EB47 | Beispiel entfernt; ausserdem eine Scherzoption ersetzt (siehe unten) |

## Nebenbefund: eine Scherzoption

EB47 in Einheit 5 enthielt als Antwortoption die Abfolge „1. Wer hat die Daten geladen? → 2. Wie
viel hat das BI-Tool gekostet? → 3. Wann ist Feierabend?". Eine so offensichtlich unernste Option
verengt die Auswahl faktisch auf drei und macht die Frage leichter, als sie sein soll. Sie ist durch
eine plausible technische Abfolge ersetzt. Ein systematischer Durchlauf über alle 450 Fragen fand
keine weitere Option dieser Art.

---

# Dritter Durchgang: Literatur- und Namensfragen

Vorgabe: Auch Fragen, deren Antwort eine Person, ein Unternehmen, eine Jahreszahl oder ein
Buchtitel ist, gehören nicht in ein fachliches Quiz. Alle 450 Fragen wurden auf diesen Fragetyp
durchsucht. **6 ersetzt, 3 umformuliert.**

## Ersetzt (6)

| Einheit | id | vorher — gesuchte Antwort war | jetzt | Folien |
|---|---|---|---|---|
| 1 Kickoff | K26 | „Howard Dresner (Gartner Group)" | Wie ein neuronales Netz Gewichte lernt | 54 |
| 3 Erster Bericht | EB01 | Jahr und Konsortium der CRISP-DM-Veröffentlichung | Datenvertrag gegen stille Schemaänderungen | 99 |
| 4 Datenmodellierung | M02 | „Lawrence Corr und Jim Stagnitto" | Additivität von Kennzahlen über die Zeit | 87, 88 |
| 4 Datenmodellierung | M33 | „Anthropic" | Abgrenzung der OLAP-Operationen Slice und Dice | 150, 152, 153 |
| 5 Verb. Bericht | EB23 | „2006" (Erscheinungsjahr eines Buches) | Dimensionen im Modell ableiten oder per ETL | 19–21 |
| 9 Deployment | D41 | Titel eines Technical Report von 1998 | Stiller Ausfall trotz grüner Überwachung | 27, 28 |

## Umformuliert (3)

Hier stand der Name nur am Anfang der Frage, die Substanz trug den Rest. Die Namensabfrage ist
entfallen, der Fachinhalt geblieben; die Urheberschaft steht jetzt am Ende der Begründung, wo sie
als Beleg hingehört und nicht als gesuchte Antwort.

| Einheit | id | vorher | jetzt |
|---|---|---|---|
| 5 Verb. Bericht | EB20 | „Auf welchen Vordenker geht ‚Small Multiples' zurück und welches Prinzip …" | Konstruktionsprinzip der Small Multiples |
| 6 Architekturen | A23 | „Auf welchen Erfinder geht die Lambda-Architektur zurück und welchen Konflikt …" | Zielkonflikt der Lambda-Architektur |
| 6 Architekturen | A39 | „Auf welche Vordenkerin geht ‚Data Mesh' zurück und wie …" | Grundgedanke des Data Mesh |

## Stand nach allen drei Durchgängen

Ein abschließender Lauf über alle 450 Fragen findet:

* keine Frage mehr, deren Antwort ein Name, ein Unternehmen, eine Jahreszahl oder ein Werk ist,
* keine Zahl und keinen Inhalt aus der Kursfallstudie — auch nicht in Optionen oder Begründungen,
* keine Frage zu Kursorganisation, Personen oder Übungsabläufen,
* **450 verschiedene Themen**, kursweit keine einzige Dublette,
* keine doppelten ids, keine unvollständige Frage, keinen ungültigen `correctIndex`,
* die richtige Antwort gleichmäßig über alle vier Positionen verteilt.
