# BI-Quiz — Selbstlernumgebung Business Intelligence

Statische Lernumgebung zum Modul **Business Intelligence (BINT)** der THWS Business School.
Studierende wählen eine Lerneinheit, beantworten Multiple-Choice-Fragen, bekommen sofort die
Begründung und sehen ihren Fortschritt. Läuft auf dem Smartphone genauso wie am Rechner.

Kein Build-Schritt, kein Framework, keine Anmeldung, kein Backend — reines HTML, CSS und ein
ES-Modul. Damit läuft die Seite unverändert auf GitHub Pages.

## Aufbau

```
index.html              Gerüst der Seite
assets/styles.css       Gestaltung (THWS-Orange #ec6608, Dunkelblau #003e6e)
assets/app.js           gesamte Logik: Laden, Runden, Auswertung, Fortschritt
data/manifest.json      erzeugt — welche Einheit liegt in welcher Datei
data/Quizfragen_*.json  die Fragen (Quelle, unverändert übernommen)
tools/build_manifest.py erzeugt das Manifest und prüft die Fragen
.nojekyll               verhindert, dass GitHub Pages die Dateien durch Jekyll schiebt
```

## Eine Lerneinheit ergänzen oder ändern

1. Neue oder geänderte Datei nach `data/` legen, Namensmuster `Quizfragen_<Thema>.json`.
2. Falls die Datei neu ist: in `tools/build_manifest.py` unten in der Tabelle `EINHEITEN`
   eine Zeile ergänzen (Dateiname → Schlüssel, Nummer, Titel, Kurztitel).
3. Manifest neu erzeugen und dabei prüfen lassen:

   ```bash
   python3 tools/build_manifest.py
   ```

4. Committen und pushen. Mehr ist nicht nötig — die Oberfläche liest ausschließlich das Manifest.

Solange eine Einheit fehlt, zeigt die Übersicht an ihrer Stelle eine Kachel „folgt", damit die
Nummerierung für die Studierenden aufgeht.

### Format einer Fragendatei

Eine Datei ist eine JSON-Liste. Jede Frage:

```json
{
  "id": "K01",
  "topic": "Arbeitsdefinition Business Intelligence",
  "difficulty": "Mittel",
  "question": "Wie lautet die Arbeitsdefinition von BI in diesem Kurs?",
  "options": ["…", "…", "…", "…"],
  "correctIndex": 1,
  "explanation": "Begründung, die nach dem Antworten erscheint."
}
```

Pflicht sind `options`, `correctIndex` und `explanation`. `difficulty` darf `Leicht`, `Mittel` oder
`Schwer` heißen; die Schreibweisen `Einfach`, `Mittelschwer` und `Anspruchsvoll` werden still
zugeordnet. Fehlt `question`, springt die Oberfläche auf `topic` — das Prüfskript meldet den Fall.
`id` muss nur innerhalb einer Datei eindeutig sein; die Oberfläche stellt intern die Einheit voran.

## Lokal ansehen

Die Seite lädt ihre Daten per `fetch`. Ein Doppelklick auf `index.html` reicht deshalb **nicht** —
der Browser blockiert das im `file://`-Kontext. Stattdessen:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Auf GitHub Pages veröffentlichen

```bash
git init -b main
git add .
git commit -m "BI-Quiz: Selbstlernumgebung für das Modul Business Intelligence"
git remote add origin https://github.com/<konto>/bi-quiz.git
git push -u origin main
```

Danach im Repository unter **Settings → Pages** als Quelle `Deploy from a branch` wählen,
Branch `main`, Ordner `/ (root)`. Nach ein bis zwei Minuten liegt die Seite unter
`https://<konto>.github.io/bi-quiz/`.

## Was gespeichert wird

Der Lernstand — welche Frage wie oft und zuletzt wie beantwortet wurde, Bestwerte, Tagesserie —
liegt ausschließlich im `localStorage` des jeweiligen Browsers. Es gibt keinen Server, keine
Konten, keine Cookies und keine Übertragung an Dritte. Unter *Fortschritt* können Studierende
ihren Stand als Datei sichern und auf einem anderen Gerät wieder einlesen.

Praktische Folge: Der Stand ist an Browser und Gerät gebunden. Wer den Browserspeicher leert,
beginnt von vorn. Das ist beabsichtigt — die Umgebung ist ein Übungswerkzeug, keine Prüfung, und
erhebt bewusst keine personenbezogenen Daten.

## Didaktische Mechanik

* **Auswahl der Fragen.** Eine Runde nimmt zuerst die zuletzt falsch beantworteten Fragen, dann
  die noch nie gestellten, zuletzt die bereits sitzenden — und mischt das Ergebnis, damit keine
  Runde der anderen gleicht.
* **Wiederholung.** Falsch beantwortete Fragen sammeln sich sichtbar an und lassen sich je Einheit
  oder über alle Einheiten hinweg gezielt wiederholen. Eine Frage verlässt den Stapel erst, wenn
  sie richtig beantwortet wurde.
* **Stufen.** Je Einheit gibt es vier Stufen — *Einstieg*, *Grundlagen sicher*, *Anwendung sicher*,
  *Souverän*. Sie hängen an zwei Größen gleichzeitig: dem Anteil bearbeiteter Fragen und der
  Trefferquote. Wer nur die leichten Fragen wiederholt, steigt nicht auf.
* **Serie.** Ein Tag zählt, sobald an ihm mindestens fünf Fragen beantwortet wurden.

---

THWS Business School · Modul Business Intelligence (BINT) · Prof. Dr. Robert Butscher
