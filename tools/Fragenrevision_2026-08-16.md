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

## Grenzfälle — bewusst stehen gelassen

Diese Fragen sind an Kursartefakte gebunden, haben aber fachlichen Kern. Sie bleiben, bis du anders
entscheidest:

* **K09, K10, K14 (Einheit 1)** — Datengrundlage, Ausgangsszenario und die sechs Schritte der
  Fallstudie. Der Ablauf eines BI-Projekts ist Lehrinhalt, die Bindung an die Kursfallstudie macht
  die Fragen aber nur im Kurskontext beantwortbar.
* **EB29 (Einheit 3)** — die absichtlich modifizierten Kursdaten. Lehrt Datenqualitätsbewusstsein,
  fragt aber eine Eigenheit des Kursdatensatzes ab.
* **EB39, EB40 (Einheit 5)** — Umsatzsumme und Zeilenzahl der Übungsdatenwelt. Das sind
  Kontrollzahlen aus deinem Kanon; als Quizfrage bleibt davon reines Auswendiglernen.
* **D41 (Einheit 9)** — das Standardwerk von Carzaniga et al. (1998). Literaturkenntnis, kein
  Kursartefakt, deshalb weniger kritisch als die entfernte Kapitelfrage.

Sag Bescheid, welche davon ebenfalls weichen sollen — Ersatz ist schnell geschrieben.
