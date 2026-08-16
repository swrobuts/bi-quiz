#!/usr/bin/env python3
"""Erzeugt data/manifest.json und prueft die Quizdateien.

Aufruf aus dem Repo-Wurzelverzeichnis:

    python3 tools/build_manifest.py

Das Skript liest alle Dateien data/Quizfragen_*.json, ordnet sie ueber die
Tabelle EINHEITEN einer Lerneinheit zu und schreibt ein Manifest, das die
Weboberflaeche beim Start laedt. Dateien, die in EINHEITEN nicht vorkommen,
werden gemeldet und uebersprungen -- so faellt ein Tippfehler im Dateinamen
sofort auf, statt still zu verschwinden.

Neue Einheit ergaenzen: Datei nach data/ legen, unten einen Eintrag in
EINHEITEN aufnehmen, Skript laufen lassen, committen. Sonst nichts.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
DATEN = WURZEL / "data"

# Dateiname -> (Schluessel, Nummer, Titel, Kurztitel fuer enge Displays)
EINHEITEN = {
    "Quizfragen_Kickoff.json":                  ("E01", 1, "Kickoff",                "Kickoff"),
    "Quizfragen_Visualisierung.json":           ("E02", 2, "Datenvisualisierung",    "Visualisierung"),
    "Quizfragen_ErsterBericht.json":            ("E03", 3, "Erster Bericht",         "Erster Bericht"),
    "Quizfragen_Datenmodellierung.json":        ("E04", 4, "Datenmodellierung",      "Datenmodell"),
    "Quizfragen_ErsterVerbesserterBericht.json": ("E05", 5, "Verbesserter Bericht",  "Verb. Bericht"),
    "Quizfragen_Architekturen.json":            ("E06", 6, "Architekturen",          "Architekturen"),
    "Quizfragen_Datenbanken.json":              ("E07", 7, "Datenbanken & SQL",      "Datenbanken"),
    "Quizfragen_PythonFastHTML.json":           ("E08", 8, "Python & FastHTML",      "Python"),
    "Quizfragen_Deployment.json":               ("E09", 9, "Deployment & Betrieb",   "Deployment"),
}

# Die Rohdaten kennen fuenf Schreibweisen fuer drei Stufen.
STUFEN = {
    "einfach": "Leicht",
    "leicht": "Leicht",
    "mittel": "Mittel",
    "mittelschwer": "Mittel",
    "anspruchsvoll": "Schwer",
    "schwer": "Schwer",
}

PFLICHTFELDER = ("id", "question", "options", "correctIndex", "explanation")


def pruefe(datei: Path, fragen: list) -> tuple[list[str], list[str]]:
    """Gibt (Fehler, Hinweise) zurueck. Fehler brechen den Lauf ab."""
    fehler: list[str] = []
    hinweise: list[str] = []
    gesehen: dict[str, int] = {}

    if not isinstance(fragen, list):
        return [f"{datei.name}: erwartet wird eine Liste von Fragen"], []

    for i, f in enumerate(fragen, 1):
        ort = f"{datei.name} #{i} (id={f.get('id', '?')})"
        if not isinstance(f, dict):
            fehler.append(f"{ort}: kein Objekt")
            continue

        for feld in PFLICHTFELDER:
            if feld == "question" and not f.get("question"):
                # Faellt nicht hart aus: die Oberflaeche weicht auf topic aus.
                hinweise.append(f"{ort}: kein Fragetext -- die Oberflaeche zeigt ersatzweise 'topic'")
                continue
            if feld not in f or f[feld] in (None, "", []):
                fehler.append(f"{ort}: Feld '{feld}' fehlt oder ist leer")

        opts = f.get("options")
        if isinstance(opts, list):
            if len(opts) < 2:
                fehler.append(f"{ort}: weniger als zwei Antwortoptionen")
            ci = f.get("correctIndex")
            if not isinstance(ci, int) or not (0 <= ci < len(opts)):
                fehler.append(f"{ort}: correctIndex {ci!r} liegt ausserhalb der Optionen")
            if len({str(o).strip() for o in opts}) != len(opts):
                hinweise.append(f"{ort}: zwei Optionen sind wortgleich")

        roh = str(f.get("difficulty") or "").strip().lower()
        if not roh:
            hinweise.append(f"{ort}: keine Schwierigkeitsangabe -- wird als 'Mittel' gefuehrt")
        elif roh not in STUFEN:
            hinweise.append(f"{ort}: unbekannte Schwierigkeit {f.get('difficulty')!r} -- wird als 'Mittel' gefuehrt")

        fid = str(f.get("id", "")).strip()
        if fid:
            gesehen[fid] = gesehen.get(fid, 0) + 1

    for fid, n in sorted(gesehen.items()):
        if n > 1:
            fehler.append(f"{datei.name}: id '{fid}' kommt {n}-mal in derselben Datei vor")

    return fehler, hinweise


def main() -> int:
    if not DATEN.is_dir():
        print(f"Ordner nicht gefunden: {DATEN}", file=sys.stderr)
        return 1

    dateien = sorted(DATEN.glob("Quizfragen_*.json"))
    if not dateien:
        print(f"Keine Quizdateien in {DATEN} gefunden.", file=sys.stderr)
        return 1

    eintraege, alle_fehler, alle_hinweise = [], [], []

    for datei in dateien:
        if datei.name not in EINHEITEN:
            alle_hinweise.append(
                f"{datei.name}: keiner Lerneinheit zugeordnet -- Eintrag in tools/build_manifest.py ergaenzen"
            )
            continue

        try:
            fragen = json.loads(datei.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            alle_fehler.append(f"{datei.name}: ist kein gueltiges JSON ({e})")
            continue

        fehler, hinweise = pruefe(datei, fragen)
        alle_fehler += fehler
        alle_hinweise += hinweise

        schluessel, nummer, titel, kurz = EINHEITEN[datei.name]
        stufen: dict[str, int] = {}
        for f in fragen:
            stufe = STUFEN.get(str(f.get("difficulty") or "").strip().lower(), "Mittel")
            stufen[stufe] = stufen.get(stufe, 0) + 1

        eintraege.append({
            "key": schluessel,
            "nummer": nummer,
            "titel": titel,
            "kurz": kurz,
            "datei": f"data/{datei.name}",
            "anzahl": len(fragen),
            "stufen": {s: stufen.get(s, 0) for s in ("Leicht", "Mittel", "Schwer") if stufen.get(s)},
        })

    eintraege.sort(key=lambda e: e["nummer"])

    for h in alle_hinweise:
        print(f"Hinweis: {h}")
    for f in alle_fehler:
        print(f"FEHLER:  {f}", file=sys.stderr)
    if alle_fehler:
        print(f"\n{len(alle_fehler)} Fehler -- Manifest wurde NICHT geschrieben.", file=sys.stderr)
        return 2

    manifest = {
        "schema": 1,
        "kurs": "Business Intelligence (BINT)",
        "einheiten": eintraege,
    }
    ziel = DATEN / "manifest.json"
    ziel.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    gesamt = sum(e["anzahl"] for e in eintraege)
    print(f"\nmanifest.json geschrieben: {len(eintraege)} Einheiten, {gesamt} Fragen.")
    fehlend = [v for k, v in EINHEITEN.items() if not (DATEN / k).exists()]
    for _, nummer, titel, _ in fehlend:
        print(f"  offen: Einheit {nummer} ({titel}) -- Datei liegt noch nicht in data/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
