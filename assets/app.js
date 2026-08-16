/* ===========================================================================
   BI-Quiz · Selbstlernumgebung Business Intelligence (BINT)
   THWS Business School

   Kein Build-Schritt, keine Abhaengigkeiten, kein Server: reines ES-Modul.
   Der Lernstand liegt ausschliesslich im localStorage des jeweiligen Browsers.

   Aufbau dieser Datei
     1. Konstanten und kleine Helfer
     2. Speicher (Lernstand)
     3. Daten (Manifest + Fragen)
     4. Auswertung (Stufen, Serie, Auswahl der Fragen)
     5. Ansichten
     6. Router und Start
   =========================================================================== */

/* -- 1. Konstanten und Helfer --------------------------------------------- */

const SPEICHER_SCHLUESSEL = 'bi-quiz:v1';

const STUFEN_NORM = {
  einfach: 'Leicht', leicht: 'Leicht',
  mittel: 'Mittel', mittelschwer: 'Mittel',
  anspruchsvoll: 'Schwer', schwer: 'Schwer',
};

// Stufen einer Einheit. Bedingung: Anteil bearbeiteter Fragen UND Trefferquote.
const NIVEAUS = [
  { stufe: 0, titel: 'Noch nicht begonnen', abdeckung: 0,    quote: 0    },
  { stufe: 1, titel: 'Einstieg',            abdeckung: 0.01, quote: 0    },
  { stufe: 2, titel: 'Grundlagen sicher',   abdeckung: 0.40, quote: 0.60 },
  { stufe: 3, titel: 'Anwendung sicher',    abdeckung: 0.70, quote: 0.75 },
  { stufe: 4, titel: 'Souverän',            abdeckung: 0.90, quote: 0.85 },
];

const LAENGEN = [10, 20, 0];           // 0 = alle Fragen der Einheit
const MIN_FUER_SERIE = 5;              // ab so vielen Antworten zaehlt der Tag

const $ = (sel, wurzel = document) => wurzel.querySelector(sel);

/** Kleiner DOM-Baukasten. attrs: {class, onclick, dataset:{}, aria-*} */
function h(tag, attrs = {}, ...kinder) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kind of kinder.flat()) {
    if (kind === null || kind === undefined || kind === false) continue;
    n.append(kind instanceof Node ? kind : document.createTextNode(String(kind)));
  }
  return n;
}

const prozent = (x) => Math.round(x * 100);
const heute = () => new Date().toISOString().slice(0, 10);

function tageDazwischen(a, b) {
  const ms = Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z');
  return Math.round(ms / 86400000);
}

/** Fisher-Yates, arbeitet auf einer Kopie. */
function mischen(liste) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pluralFragen(n) { return n === 1 ? '1 Frage' : `${n} Fragen`; }

/* -- 2. Speicher ----------------------------------------------------------- */

const leererStand = () => ({
  version: 1,
  einheiten: {},                                        // key -> { fragen: {}, best: 0, runden: 0 }
  serie: { aktuell: 0, laengste: 0, letzterTag: null },
  gesamt: { beantwortet: 0, richtig: 0 },
});

let stand = leererStand();

function standLaden() {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!roh) return leererStand();
    const d = JSON.parse(roh);
    if (!d || typeof d !== 'object' || d.version !== 1) return leererStand();
    return Object.assign(leererStand(), d);
  } catch {
    return leererStand();                               // z. B. privater Modus ohne Speicher
  }
}

function standSichern() {
  try { localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand)); }
  catch { /* Speicher nicht verfuegbar -- die Sitzung laeuft trotzdem */ }
}

function einheitStand(key) {
  if (!stand.einheiten[key]) stand.einheiten[key] = { fragen: {}, best: 0, runden: 0 };
  const e = stand.einheiten[key];
  if (!e.fragen) e.fragen = {};
  return e;
}

/** Ergebnis einer einzelnen Frage festhalten. */
function antwortMerken(einheitKey, frageId, richtig) {
  const e = einheitStand(einheitKey);
  const f = e.fragen[frageId] || { versuche: 0, richtig: 0, zuletztRichtig: null };
  f.versuche += 1;
  if (richtig) f.richtig += 1;
  f.zuletztRichtig = richtig;
  f.zuletzt = heute();
  e.fragen[frageId] = f;
  stand.gesamt.beantwortet += 1;
  if (richtig) stand.gesamt.richtig += 1;
}

/** Serie fortschreiben. Gibt zurueck, ob heute neu gezaehlt wurde. */
function serieFortschreiben() {
  const s = stand.serie;
  const tag = heute();
  if (s.letzterTag === tag) return false;
  const abstand = s.letzterTag ? tageDazwischen(s.letzterTag, tag) : null;
  s.aktuell = abstand === 1 ? s.aktuell + 1 : 1;
  s.letzterTag = tag;
  s.laengste = Math.max(s.laengste || 0, s.aktuell);
  return true;
}

/** Serie gilt nur, solange sie nicht aelter als gestern ist. */
function serieAktuell() {
  const s = stand.serie;
  if (!s.letzterTag) return 0;
  const abstand = tageDazwischen(s.letzterTag, heute());
  return abstand <= 1 ? s.aktuell : 0;
}

/* -- 3. Daten -------------------------------------------------------------- */

const daten = { manifest: null, fragen: new Map() };    // key -> Frageliste

async function manifestLaden() {
  const r = await fetch('data/manifest.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error(`manifest.json: HTTP ${r.status}`);
  daten.manifest = await r.json();
  return daten.manifest;
}

async function fragenLaden(einheit) {
  if (daten.fragen.has(einheit.key)) return daten.fragen.get(einheit.key);
  const r = await fetch(einheit.datei, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${einheit.datei}: HTTP ${r.status}`);
  const roh = await r.json();

  const liste = roh.map((q, i) => {
    const optionen = Array.isArray(q.options) ? q.options.map(String) : [];
    const ci = Number.isInteger(q.correctIndex) ? q.correctIndex : -1;
    return {
      // Die ids sind nur je Datei eindeutig (EB01 gibt es in E03 und E05) --
      // deshalb wird hier auf die Einheit qualifiziert.
      uid: `${einheit.key}:${q.id ?? 'nr' + (i + 1)}`,
      thema: q.topic || '',
      // In einer Datei fehlt der Fragetext; dann traegt das Thema die Frage.
      text: (q.question && String(q.question).trim()) || q.topic || 'Frage ohne Text',
      stufe: STUFEN_NORM[String(q.difficulty || '').trim().toLowerCase()] || 'Mittel',
      optionen,
      richtig: ci >= 0 && ci < optionen.length ? ci : 0,
      erklaerung: q.explanation || '',
      gueltig: optionen.length >= 2 && ci >= 0 && ci < optionen.length,
    };
  }).filter((q) => q.gueltig);

  daten.fragen.set(einheit.key, liste);
  return liste;
}

const einheitNach = (key) => (daten.manifest?.einheiten || []).find((e) => e.key === key);

/* -- 4. Auswertung --------------------------------------------------------- */

/** Kennzahlen einer Einheit auf Basis des gespeicherten Stands. */
function einheitKennzahlen(einheit) {
  const e = stand.einheiten[einheit.key];
  const gesamt = einheit.anzahl || 0;
  if (!e) return { bearbeitet: 0, gesamt, abdeckung: 0, quote: 0, offen: gesamt, falsch: 0, best: 0, runden: 0 };

  const eintraege = Object.values(e.fragen || {});
  const bearbeitet = eintraege.length;
  const richtigJetzt = eintraege.filter((f) => f.zuletztRichtig === true).length;
  const falsch = eintraege.filter((f) => f.zuletztRichtig === false).length;

  return {
    bearbeitet,
    gesamt,
    abdeckung: gesamt ? bearbeitet / gesamt : 0,
    // Trefferquote = Anteil der bearbeiteten Fragen, die zuletzt richtig waren.
    quote: bearbeitet ? richtigJetzt / bearbeitet : 0,
    offen: Math.max(0, gesamt - bearbeitet),
    falsch,
    best: e.best || 0,
    runden: e.runden || 0,
  };
}

/** Zuletzt falsch beantwortete Fragen ueber alle Einheiten. */
function offeneFehlerGesamt() {
  return Object.values(stand.einheiten).reduce(
    (s, e) => s + Object.values(e.fragen || {}).filter((f) => f.zuletztRichtig === false).length, 0);
}

function niveauVon(k) {
  let treffer = NIVEAUS[0];
  for (const n of NIVEAUS) {
    if (k.abdeckung >= n.abdeckung && k.quote >= n.quote) treffer = n;
  }
  if (k.bearbeitet === 0) return NIVEAUS[0];
  return treffer;
}

/**
 * Fragen fuer eine Runde auswaehlen.
 * Reihenfolge der Bevorzugung: zuletzt falsch > noch nie gestellt > schon sicher.
 * Innerhalb einer Gruppe wird gemischt, damit keine Runde der anderen gleicht.
 */
function rundeZusammenstellen(einheitKey, alleFragen, anzahl) {
  const e = stand.einheiten[einheitKey];
  const merk = e?.fragen || {};
  const falsch = [], neu = [], sicher = [];

  for (const q of alleFragen) {
    const f = merk[q.uid];
    if (!f) neu.push(q);
    else if (f.zuletztRichtig === false) falsch.push(q);
    else sicher.push(q);
  }

  const sortiert = [...mischen(falsch), ...mischen(neu), ...mischen(sicher)];
  const n = anzahl > 0 ? Math.min(anzahl, sortiert.length) : sortiert.length;
  // Der Anschnitt ist gewichtet, die Abfrage selbst wieder gemischt --
  // sonst kaemen alle Wiederholungen am Stueck zuerst.
  return mischen(sortiert.slice(0, n));
}

function falscheFragen(einheitKey, alleFragen) {
  const merk = stand.einheiten[einheitKey]?.fragen || {};
  return alleFragen.filter((q) => merk[q.uid]?.zuletztRichtig === false);
}

/* -- 5. Ansichten ---------------------------------------------------------- */

const app = () => $('#app');

function zeigen(knoten) {
  const ziel = app();
  ziel.replaceChildren(knoten);
  window.scrollTo({ top: 0, behavior: 'instant' });
  kopfZeichnen();
}

/** replaceChildren macht aus null den Text "null" -- deshalb vorher aussieben. */
function setzeKinder(ziel, ...kinder) {
  ziel.replaceChildren(...kinder.flat().filter((k) => k !== null && k !== undefined && k !== false));
}

function kopfZeichnen() {
  const rechts = $('#kopf-rechts');
  const s = serieAktuell();
  setzeKinder(rechts,
    s > 0
      ? h('span', { class: 'serie', title: `Längste Serie: ${stand.serie.laengste} Tage` },
          h('span', { class: 'serie-zahl' }, s),
          h('span', { class: 'serie-wort' }, s === 1 ? 'Tag' : 'Tage in Folge'))
      : null,
    h('button', { class: 'knopf leise', type: 'button', onclick: () => (location.hash = '#/fortschritt') }, 'Fortschritt'),
  );
}

/* ---- Ring als SVG -------------------------------------------------------- */

function ring(anteil, beschriftung) {
  const r = 22, u = 2 * Math.PI * r;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 52 52');
  svg.setAttribute('width', '52'); svg.setAttribute('height', '52');
  svg.setAttribute('aria-hidden', 'true');
  for (const [klasse, wert] of [['ring-spur', 0], ['ring-wert', anteil]]) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', '26'); c.setAttribute('cy', '26'); c.setAttribute('r', String(r));
    c.setAttribute('fill', 'none'); c.setAttribute('stroke-width', '5');
    c.setAttribute('stroke-linecap', 'round');
    c.setAttribute('class', klasse);
    if (klasse === 'ring-wert') {
      c.setAttribute('stroke-dasharray', String(u));
      c.setAttribute('stroke-dashoffset', String(u * (1 - Math.max(0, Math.min(1, wert)))));
    }
    svg.append(c);
  }
  return h('div', { class: 'ring' }, svg, h('span', { class: 'ring-zahl' }, beschriftung));
}

/* ---- Startseite ---------------------------------------------------------- */

function ansichtStart() {
  const einheiten = daten.manifest.einheiten;
  const alleK = einheiten.map((e) => ({ e, k: einheitKennzahlen(e) }));

  const fragenGesamt = einheiten.reduce((s, e) => s + e.anzahl, 0);
  const bearbeitet = alleK.reduce((s, x) => s + x.k.bearbeitet, 0);
  const falschGesamt = alleK.reduce((s, x) => s + x.k.falsch, 0);
  const quoteGesamt = stand.gesamt.beantwortet ? stand.gesamt.richtig / stand.gesamt.beantwortet : 0;

  const wurzel = h('div', {},
    h('section', { class: 'intro' },
      h('div', { class: 'intro-akzent' }),
      h('h1', {}, 'Selbstlernquiz Business Intelligence'),
      h('p', {},
        `${fragenGesamt} Fragen aus ${einheiten.length} Lerneinheiten. Wähle eine Einheit, `
        + 'beantworte die Fragen in deinem Tempo und lies die Begründung — auch dann, wenn du richtig lagst.'),
    ),

    h('section', { class: 'kennzahlen' },
      kennzahl(`${bearbeitet}`, h('small', {}, ` / ${fragenGesamt}`), 'Fragen bearbeitet'),
      kennzahl(`${prozent(quoteGesamt)}`, h('small', {}, ' %'), 'Trefferquote gesamt'),
      kennzahl(`${serieAktuell()}`, null, serieAktuell() === 1 ? 'Tag in Folge' : 'Tage in Folge'),
      kennzahl(`${falschGesamt}`, null, 'offene Fehler'),
    ),

    falschGesamt > 0
      ? h('section', { class: 'abschnitt' },
          h('div', { class: 'karte', style: 'padding:1rem;display:flex;gap:.85rem;align-items:center;flex-wrap:wrap' },
            h('div', { style: 'flex:1;min-width:14rem' },
              h('h3', {}, 'Gezielt wiederholen'),
              h('p', { style: 'font-size:.88rem;color:var(--muted);margin-top:.2rem' },
                `${pluralFragen(falschGesamt)} aus allen Einheiten sind zuletzt falsch beantwortet worden.`)),
            h('button', { class: 'knopf', type: 'button', onclick: () => (location.hash = '#/wiederholung') },
              'Fehler wiederholen'),
          ))
      : null,

    h('section', { class: 'abschnitt' },
      h('div', { class: 'abschnitt-kopf' },
        h('h2', {}, 'Lerneinheiten'),
        h('span', { class: 'abschnitt-hinweis' }, 'Ring = bearbeitete Fragen')),
      h('div', { class: 'kacheln' }, kachelnInReihenfolge(alleK)),
    ),
  );
  zeigen(wurzel);
}

function kennzahl(wert, zusatz, label) {
  return h('div', { class: 'karte kennzahl' },
    h('div', { class: 'kennzahl-wert' }, wert, zusatz),
    h('div', { class: 'kennzahl-label' }, label));
}

function kachel(einheit, k) {
  const niveau = niveauVon(k);
  return h('button', {
    class: `kachel${k.bearbeitet ? ' begonnen' : ''}`,
    type: 'button',
    onclick: () => startDialog(einheit),
    'aria-label': `Einheit ${einheit.nummer}, ${einheit.titel}. ${k.bearbeitet} von ${k.gesamt} Fragen bearbeitet.`,
  },
    h('div', { class: 'kachel-kopf' },
      ring(k.abdeckung, `${prozent(k.abdeckung)}%`),
      h('div', { class: 'kachel-text' },
        h('div', { class: 'kachel-nummer' }, `Einheit ${einheit.nummer}`),
        h('div', { class: 'kachel-titel' }, einheit.titel),
        h('div', { class: 'kachel-meta' },
          k.bearbeitet
            ? `${k.bearbeitet} von ${k.gesamt} bearbeitet · ${prozent(k.quote)} % sitzen`
            : `${k.gesamt} Fragen · noch nicht begonnen`),
      )),
    h('div', { class: 'kachel-fuss' },
      h('span', { class: 'stufe', dataset: { stufe: String(niveau.stufe) } }, niveau.titel),
      h('span', { class: 'kachel-offen' },
        k.falsch ? `${k.falsch} zu wiederholen` : k.offen ? `${k.offen} offen` : 'komplett'),
    ));
}

/**
 * Kacheln in der Reihenfolge der Kursstruktur. Fehlt eine Einheit im Manifest
 * (weil ihre Fragen noch nicht vorliegen), steht an ihrer Stelle ein
 * Platzhalter -- damit die Nummerierung fuer die Studierenden aufgeht.
 */
function kachelnInReihenfolge(alleK) {
  const nachNummer = new Map(alleK.map((x) => [x.e.nummer, x]));
  const max = Math.max(...alleK.map((x) => x.e.nummer));
  const kacheln = [];
  for (let n = 1; n <= max; n++) {
    const treffer = nachNummer.get(n);
    kacheln.push(treffer ? kachel(treffer.e, treffer.k) : platzhalterKachel(n));
  }
  return kacheln;
}

function platzhalterKachel(n) {
  return h('div', { class: 'kachel leer' },
    h('div', { class: 'kachel-kopf' },
      ring(0, '–'),
      h('div', { class: 'kachel-text' },
        h('div', { class: 'kachel-nummer' }, `Einheit ${n}`),
        h('div', { class: 'kachel-titel' }, 'folgt'),
        h('div', { class: 'kachel-meta' }, 'Fragen sind noch in Arbeit'))));
}

/* ---- Startdialog einer Einheit ------------------------------------------ */

let dialogZustand = { laenge: 10, mischen: true };

async function startDialog(einheit) {
  const k = einheitKennzahlen(einheit);
  const anker = $('#dialog-anker');

  const schliessen = () => { anker.replaceChildren(); document.body.style.overflow = ''; };
  document.body.style.overflow = 'hidden';

  const segmentKnopf = (wert) => h('button', {
    class: 'segment', type: 'button',
    'aria-pressed': String(dialogZustand.laenge === wert),
    disabled: wert > einheit.anzahl,
    onclick: (ev) => {
      dialogZustand.laenge = wert;
      ev.currentTarget.parentElement.querySelectorAll('.segment')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget)));
    },
  }, wert === 0 ? `alle ${einheit.anzahl}` : String(wert));

  const dialog = h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Einheit ${einheit.nummer} starten` },
    h('div', { class: 'dialog-kopf' },
      h('div', { class: 'kachel-nummer' }, `Einheit ${einheit.nummer}`),
      h('h2', {}, einheit.titel),
      h('p', {}, k.bearbeitet
        ? `${k.bearbeitet} von ${k.gesamt} Fragen bearbeitet, ${prozent(k.quote)} % davon sitzen.`
        : `${k.gesamt} Fragen. Zuerst kommen die, die du noch nie gesehen hast.`),
    ),
    h('div', { class: 'feld' },
      h('span', { class: 'feld-label' }, 'Wie viele Fragen?'),
      h('div', { class: 'segmente' }, LAENGEN.map(segmentKnopf))),
    h('div', { class: 'feld' },
      h('label', { class: 'schalter' },
        h('input', {
          type: 'checkbox', checked: dialogZustand.mischen,
          onchange: (ev) => { dialogZustand.mischen = ev.currentTarget.checked; },
        }),
        h('span', {}, 'Antwortoptionen mischen'))),
    k.falsch > 0
      ? h('div', { class: 'feld' },
          h('button', {
            class: 'knopf sekundaer breit', type: 'button',
            onclick: () => { schliessen(); location.hash = `#/wiederholung/${einheit.key}`; },
          }, `Nur die ${k.falsch} Fehler dieser Einheit`))
      : null,
    h('div', { class: 'knopf-reihe', style: 'margin-top:1.25rem' },
      h('button', {
        class: 'knopf', style: 'flex:1', type: 'button',
        onclick: () => { schliessen(); location.hash = `#/quiz/${einheit.key}/${dialogZustand.laenge}`; },
      }, 'Runde starten'),
      h('button', { class: 'knopf sekundaer', type: 'button', onclick: schliessen }, 'Abbrechen')),
  );

  const huelle = h('div', {
    class: 'dialog-huelle',
    onclick: (ev) => { if (ev.target === ev.currentTarget) schliessen(); },
  }, dialog);

  document.addEventListener('keydown', function esc(ev) {
    if (ev.key === 'Escape') { schliessen(); document.removeEventListener('keydown', esc); }
  });

  anker.replaceChildren(huelle);
  dialog.querySelector('.knopf')?.focus();
}

/* ---- Quiz ---------------------------------------------------------------- */

let runde = null;   // { einheit, fragen[], i, antworten[], modus }

async function ansichtQuiz(einheitKey, laenge, modus = 'runde') {
  const einheit = einheitNach(einheitKey);
  if (!einheit) return ansichtFehler(`Unbekannte Einheit „${einheitKey}“.`);

  const alle = await fragenLaden(einheit);
  let auswahl = modus === 'wiederholung'
    ? mischen(falscheFragen(einheitKey, alle))
    : rundeZusammenstellen(einheitKey, alle, laenge);

  if (!auswahl.length) {
    return zeigen(h('div', { class: 'karte ergebnis' },
      h('h2', {}, 'Nichts zu wiederholen'),
      h('p', { class: 'ergebnis-satz' }, 'In dieser Einheit ist gerade keine Frage offen.'),
      h('div', { class: 'knopf-reihe' },
        h('button', { class: 'knopf', type: 'button', onclick: () => (location.hash = '#/') }, 'Zur Übersicht'))));
  }

  runde = { einheit, fragen: auswahl, i: 0, antworten: [], modus };
  frageZeichnen();
}

function frageZeichnen() {
  const { einheit, fragen, i } = runde;
  const q = fragen[i];

  // Optionen ggf. mischen; die Zuordnung zur richtigen Antwort wandert mit.
  const reihenfolge = dialogZustand.mischen
    ? mischen(q.optionen.map((_, idx) => idx))
    : q.optionen.map((_, idx) => idx);

  const liste = h('ul', { class: 'optionen' });
  const fuss = h('div', { class: 'quiz-fuss' });
  const aufloesungsAnker = h('div', {});

  const beantworten = (angezeigterIndex) => {
    const echterIndex = reihenfolge[angezeigterIndex];
    const richtig = echterIndex === q.richtig;

    // In der einheitenuebergreifenden Wiederholung stammen die Fragen aus
    // verschiedenen Einheiten -- die Buchung folgt deshalb der uid, nicht der Runde.
    antwortMerken(q.uid.split(':')[0], q.uid, richtig);
    standSichern();
    runde.antworten.push({ frage: q, richtig });

    liste.querySelectorAll('.option').forEach((btn, idx) => {
      btn.disabled = true;
      const dieser = reihenfolge[idx];
      if (dieser === q.richtig) btn.classList.add('richtig');
      else if (idx === angezeigterIndex) btn.classList.add('falsch');
      else btn.classList.add('gedaempft');
    });

    aufloesungsAnker.replaceChildren(
      h('div', { class: 'aufloesung' },
        h('div', { class: `aufloesung-kopf ${richtig ? 'ok' : 'bad'}` },
          h('span', { 'aria-hidden': 'true' }, richtig ? '✓' : '✕'),
          h('span', {}, richtig ? 'Richtig' : 'Nicht richtig'),
        ),
        h('p', {}, q.erklaerung || 'Zu dieser Frage ist keine Begründung hinterlegt.'),
      ));
    aufloesungsAnker.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const weiter = h('button', {
      class: 'knopf', type: 'button',
      onclick: () => {
        runde.i += 1;
        if (runde.i >= runde.fragen.length) ansichtErgebnis();
        else frageZeichnen();
      },
    }, runde.i + 1 >= runde.fragen.length ? 'Runde auswerten' : 'Weiter');
    fuss.replaceChildren(weiter);
    weiter.focus();
  };

  reihenfolge.forEach((echterIndex, angezeigt) => {
    liste.append(h('li', {},
      h('button', {
        class: 'option', type: 'button',
        onclick: () => beantworten(angezeigt),
      },
        h('span', { class: 'option-taste', 'aria-hidden': 'true' }, 'ABCD'[angezeigt]),
        h('span', { class: 'option-text' }, q.optionen[echterIndex]))));
  });

  fuss.replaceChildren(
    h('button', {
      class: 'knopf sekundaer', type: 'button',
      onclick: () => {
        if (runde.antworten.length === 0) location.hash = '#/';
        else ansichtErgebnis();
      },
    }, runde.antworten.length ? 'Runde hier beenden' : 'Zurück zur Übersicht'));

  const fortschritt = (i) / runde.fragen.length;

  zeigen(h('div', { class: 'quiz' },
    h('div', { class: 'quiz-kopf' },
      h('div', { class: 'quiz-kopf-zeile' },
        h('span', { class: 'quiz-einheit' },
          runde.modus === 'wiederholung' ? 'Wiederholung' : `Einheit ${einheit.nummer} · ${einheit.kurz}`),
        h('span', { class: 'quiz-zaehler' }, `${i + 1} von ${runde.fragen.length}`)),
      h('div', { class: 'balken' }, h('div', { class: 'balken-wert', style: `width:${prozent(fortschritt)}%` }))),

    h('div', { class: 'karte frage-karte' },
      h('div', { class: 'frage-meta' },
        h('span', { class: 'marker', dataset: { stufe: q.stufe } }, q.stufe),
        q.thema ? h('span', { class: 'marker thema' }, q.thema) : null),
      h('p', { class: 'frage-text' }, q.text),
      liste,
      aufloesungsAnker),

    fuss,
    h('p', { class: 'tastenhinweis' }, 'Tasten 1–4 wählen eine Antwort, Enter geht weiter.'),
  ));

  tastenBinden(liste, fuss);
}

let tastenHandler = null;

function tastenBinden(liste, fuss) {
  // Pro Frage wird neu gezeichnet -- der alte Handler muss weg, sonst zeigen
  // mehrere Listener auf abgehaengte Schaltflaechen der Vorfragen.
  if (tastenHandler) document.removeEventListener('keydown', tastenHandler);
  const handler = (ev) => {
    if (!runde) return document.removeEventListener('keydown', handler);
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (['1', '2', '3', '4'].includes(ev.key)) {
      const btn = liste.querySelectorAll('.option')[Number(ev.key) - 1];
      if (btn && !btn.disabled) { ev.preventDefault(); btn.click(); }
    } else if (ev.key === 'Enter') {
      const weiter = fuss.querySelector('.knopf:not(.sekundaer)');
      if (weiter) { ev.preventDefault(); weiter.click(); }
    }
  };
  tastenHandler = handler;
  document.addEventListener('keydown', handler);
}

/* ---- Ergebnis ------------------------------------------------------------ */

function ansichtErgebnis() {
  const { einheit, antworten } = runde;
  const uebergreifend = runde.uebergreifend === true;
  const n = antworten.length;
  const richtig = antworten.filter((a) => a.richtig).length;
  const quote = n ? richtig / n : 0;

  // Rundenzahl und Bestwert gehoeren zu einer konkreten Einheit. Die
  // einheitenuebergreifende Wiederholung bucht deshalb nur die Serie.
  let warBestwert = false;
  if (!uebergreifend) {
    const e = einheitStand(einheit.key);
    const hatteRundenZuvor = (e.runden || 0) > 0;
    e.runden = (e.runden || 0) + 1;
    if (quote > (e.best || 0) && n >= MIN_FUER_SERIE) {
      e.best = quote;
      // Die allererste Runde ist kein "neuer Bestwert" -- das klingt hohl,
      // gerade wenn sie schlecht ausgefallen ist.
      warBestwert = hatteRundenZuvor;
    }
  }
  const serieNeu = n >= MIN_FUER_SERIE ? serieFortschreiben() : false;
  standSichern();

  const k = uebergreifend
    ? { falsch: offeneFehlerGesamt(), bearbeitet: 1, gesamt: 1, abdeckung: 1, quote, offen: 0, best: 0, runden: 0 }
    : einheitKennzahlen(einheit);
  const niveau = niveauVon(k);

  const satz = quote === 1 ? 'Alles richtig.'
    : quote >= 0.8 ? 'Das sitzt weitgehend.'
    : quote >= 0.5 ? 'Solide Grundlage, ein paar Lücken.'
    : 'Hier lohnt der Blick zurück in die Folien.';

  const hinweis = warBestwert
    ? `Neuer Bestwert in dieser Einheit: ${prozent(quote)} %.`
    : serieNeu
      ? `Serie fortgesetzt: ${serieAktuell()} ${serieAktuell() === 1 ? 'Tag' : 'Tage'} in Folge.`
      : n < MIN_FUER_SERIE
        ? `Ab ${MIN_FUER_SERIE} beantworteten Fragen zählt der Tag für deine Serie.`
        : `Stufe dieser Einheit: ${niveau.titel}.`;

  runde = null;

  zeigen(h('div', {},
    h('div', { class: 'karte ergebnis' },
      h('div', { class: 'ergebnis-quote' }, String(prozent(quote)), h('small', {}, ' %')),
      h('p', { class: 'ergebnis-satz' }, `${richtig} von ${n} richtig · ${einheit.titel}`),
      h('p', { class: 'ergebnis-satz' }, satz),
      h('div', { class: `ergebnis-hinweis${warBestwert ? '' : ' neutral'}` }, hinweis),
      h('div', { class: 'knopf-reihe' },
        k.falsch > 0
          ? h('button', {
              class: 'knopf', type: 'button',
              onclick: () => {
                const ziel = uebergreifend ? '#/wiederholung' : `#/wiederholung/${einheit.key}`;
                if (location.hash === ziel) route(); else location.hash = ziel;
              },
            }, `${k.falsch} Fehler wiederholen`)
          : h('button', {
              class: 'knopf', type: 'button',
              onclick: () => {
                if (uebergreifend) return (location.hash = '#/');
                const ziel = `#/quiz/${einheit.key}/10`;
                if (location.hash === ziel) route(); else location.hash = ziel;
              },
            }, uebergreifend ? 'Zur Übersicht' : 'Noch eine Runde'),
        h('button', { class: 'knopf sekundaer', type: 'button', onclick: () => (location.hash = '#/') }, 'Zur Übersicht')),
    ),

    h('div', { class: 'karte ergebnis-liste', style: 'padding:1rem 1.1rem;margin-top:1rem' },
      h('h3', {}, 'Diese Runde im Einzelnen'),
      antworten.map((a) => h('div', { class: `ergebnis-zeile ${a.richtig ? 'ok' : 'bad'}` },
        h('span', { class: 'zeichen', 'aria-hidden': 'true' }, a.richtig ? '✓' : '✕'),
        h('span', {}, a.frage.thema || a.frage.text.slice(0, 90)))),
    ),
  ));
}

/* ---- Wiederholung über alle Einheiten ------------------------------------ */

async function ansichtWiederholungGesamt() {
  const einheiten = daten.manifest.einheiten;
  const gesammelt = [];
  for (const e of einheiten) {
    const alle = await fragenLaden(e);
    for (const q of falscheFragen(e.key, alle)) gesammelt.push({ q, e });
  }
  if (!gesammelt.length) {
    return zeigen(h('div', { class: 'karte ergebnis' },
      h('h2', {}, 'Keine offenen Fehler'),
      h('p', { class: 'ergebnis-satz' }, 'Alle bisher bearbeiteten Fragen sitzen. Nimm dir eine neue Einheit vor.'),
      h('div', { class: 'knopf-reihe' },
        h('button', { class: 'knopf', type: 'button', onclick: () => (location.hash = '#/') }, 'Zur Übersicht'))));
  }
  const gemischt = mischen(gesammelt);
  runde = {
    einheit: { key: gemischt[0].e.key, nummer: 0, titel: 'Wiederholung', kurz: 'Wiederholung' },
    fragen: gemischt.map((x) => x.q),
    i: 0, antworten: [], modus: 'wiederholung', uebergreifend: true,
  };
  frageZeichnen();
}

/* ---- Fortschritt --------------------------------------------------------- */

function ansichtFortschritt() {
  const einheiten = daten.manifest.einheiten;
  const zeilen = einheiten.map((e) => ({ e, k: einheitKennzahlen(e) }));
  const gesamtQuote = stand.gesamt.beantwortet ? stand.gesamt.richtig / stand.gesamt.beantwortet : 0;

  const exportieren = () => {
    const blob = new Blob([JSON.stringify(stand, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `bi-quiz-lernstand-${heute()}.json` });
    document.body.append(a); a.click(); a.remove();
  };

  const importieren = () => {
    const eingabe = h('input', { type: 'file', accept: 'application/json,.json' });
    eingabe.addEventListener('change', async () => {
      const datei = eingabe.files?.[0];
      if (!datei) return;
      try {
        const d = JSON.parse(await datei.text());
        if (!d || d.version !== 1) throw new Error('Format passt nicht');
        stand = Object.assign(leererStand(), d);
        standSichern();
        ansichtFortschritt();
      } catch (err) {
        alert(`Diese Datei lässt sich nicht einlesen: ${err.message}`);
      }
    });
    eingabe.click();
  };

  const zuruecksetzen = () => {
    if (!confirm('Der gesamte Lernstand in diesem Browser wird gelöscht. Fortfahren?')) return;
    stand = leererStand();
    standSichern();
    ansichtFortschritt();
  };

  zeigen(h('div', {},
    h('section', { class: 'intro' },
      h('div', { class: 'intro-akzent' }),
      h('h1', {}, 'Dein Fortschritt'),
      h('p', {}, 'Alles hier steht nur in diesem Browser. Wenn du das Gerät wechselst, nimm den Lernstand als Datei mit.')),

    h('section', { class: 'kennzahlen' },
      kennzahl(String(stand.gesamt.beantwortet), null, 'Antworten insgesamt'),
      kennzahl(String(prozent(gesamtQuote)), h('small', {}, ' %'), 'Trefferquote gesamt'),
      kennzahl(String(serieAktuell()), null, 'Tage in Folge'),
      kennzahl(String(stand.serie.laengste || 0), null, 'längste Serie'),
    ),

    h('section', { class: 'abschnitt' },
      h('div', { class: 'abschnitt-kopf' }, h('h2', {}, 'Einheiten im Einzelnen')),
      h('div', { class: 'karte tabellen-huelle' },
        h('table', { class: 'tabelle' },
          h('thead', {}, h('tr', {},
            h('th', {}, 'Einheit'),
            h('th', { class: 'zahl' }, 'bearbeitet'),
            h('th', { class: 'zahl' }, 'sitzen'),
            h('th', { class: 'zahl' }, 'Bestwert'),
            h('th', {}, 'Stufe'))),
          h('tbody', {}, zeilen.map(({ e, k }) => h('tr', {},
            h('td', {}, `${e.nummer}. ${e.titel}`),
            h('td', { class: 'zahl' }, `${k.bearbeitet}/${k.gesamt}`),
            h('td', { class: 'zahl' }, k.bearbeitet ? `${prozent(k.quote)} %` : '–'),
            h('td', { class: 'zahl' }, k.best ? `${prozent(k.best)} %` : '–'),
            h('td', {}, niveauVon(k).titel))))))),

    h('section', { class: 'abschnitt' },
      h('div', { class: 'abschnitt-kopf' }, h('h2', {}, 'Lernstand sichern')),
      h('div', { class: 'karte', style: 'padding:1rem' },
        h('p', { style: 'font-size:.9rem;color:var(--muted);margin-bottom:.9rem' },
          'Die Datei enthält nur deine Antwortstatistik — keine Namen, keine Kennungen.'),
        h('div', { class: 'knopf-reihe' },
          h('button', { class: 'knopf sekundaer', type: 'button', onclick: exportieren }, 'Als Datei speichern'),
          h('button', { class: 'knopf sekundaer', type: 'button', onclick: importieren }, 'Datei einlesen'),
          h('button', { class: 'knopf leise', type: 'button', onclick: zuruecksetzen }, 'Alles zurücksetzen')))),

    h('div', { class: 'knopf-reihe' },
      h('button', { class: 'knopf sekundaer', type: 'button', onclick: () => (location.hash = '#/') }, 'Zur Übersicht')),
  ));
}

/* ---- Fehler -------------------------------------------------------------- */

function ansichtFehler(text, detail) {
  zeigen(h('div', { class: 'karte', style: 'padding:1.5rem' },
    h('h2', {}, 'Das hat nicht geklappt'),
    h('p', { style: 'margin-top:.5rem;color:var(--muted)' }, text),
    detail ? h('p', { class: 'fehler', style: 'margin-top:.75rem' }, h('code', {}, detail)) : null,
    h('div', { class: 'knopf-reihe', style: 'margin-top:1.25rem' },
      h('button', { class: 'knopf sekundaer', type: 'button', onclick: () => location.reload() }, 'Neu laden'))));
}

/* -- 6. Router und Start --------------------------------------------------- */

async function route() {
  const pfad = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
  try {
    if (pfad[0] === 'quiz' && pfad[1]) {
      await ansichtQuiz(pfad[1], Number(pfad[2] ?? 10), 'runde');
    } else if (pfad[0] === 'wiederholung' && pfad[1]) {
      await ansichtQuiz(pfad[1], 0, 'wiederholung');
    } else if (pfad[0] === 'wiederholung') {
      await ansichtWiederholungGesamt();
    } else if (pfad[0] === 'fortschritt') {
      ansichtFortschritt();
    } else {
      runde = null;
      ansichtStart();
    }
  } catch (err) {
    ansichtFehler('Die Fragen ließen sich nicht laden. Läuft die Seite über einen Webserver?', String(err));
  }
}

async function start() {
  stand = standLaden();
  document.querySelector('.marke').addEventListener('click', () => (location.hash = '#/'));
  window.addEventListener('hashchange', route);
  try {
    await manifestLaden();
  } catch (err) {
    return ansichtFehler(
      'Das Manifest der Lerneinheiten fehlt oder ist nicht erreichbar. '
      + 'Lokal muss die Seite über einen Webserver laufen (python3 -m http.server), '
      + 'nicht per Doppelklick aus dem Dateisystem.', String(err));
  }
  route();
}

start();
