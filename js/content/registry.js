// Registro central de contenido + catálogo de conceptos del Brain. También aplica paquetes JSON (CMS ligero, secciones 130/179).
import { GRAMMAR } from "./grammar.js";
import { GENERAL_WORDS, GENERAL_TOPICS, buildWords } from "./vocab.js";
import { PRO_WORDS, PRO_TOPICS } from "./pro-vocab.js";
import { STARTER_WORDS, STARTER_TOPICS } from "./starter.js";
import { ADV_WORDS, ADV_TOPICS } from "./vocab-adv.js";
import { ADV_READINGS, ADV_SCENARIOS } from "./advanced-extra.js";
import { READINGS } from "./reading.js";
import { SCENARIOS } from "./scenarios.js";
import { SOUNDS } from "./pronunciation.js";
import { ROUTES } from "./professional.js";
import { LEVELS } from "../core/util.js";

export const C = {
  grammar: [], grammarById: {}, words: [], wordById: {}, topics: [], topicById: {},
  readings: [], readingById: {}, scenarios: [], scenarioById: {}, catalog: {}, labels: {},
};

function index() {
  C.grammarById = Object.fromEntries(C.grammar.map((g) => [g.id, g]));
  C.wordById = {};
  for (const w of C.words) if (!C.wordById[w.id]) C.wordById[w.id] = w;
  C.topicById = Object.fromEntries(C.topics.map((t) => [t.id, t]));
  C.readingById = Object.fromEntries(C.readings.map((r) => [r.id, r]));
  C.scenarioById = Object.fromEntries(C.scenarios.map((s) => [s.id, s]));

  // Catálogo de conceptos (Knowledge Map)
  const cat = {};
  for (const g of C.grammar) cat[g.id] = { cat: "grammar", level: g.level, label: g.title, icon: g.icon };
  for (const t of C.topics) {
    const words = t.words.map((id) => C.wordById[id]).filter(Boolean);
    const lvl = t.level || modeLevel(words.map((w) => w.cefr));
    cat[t.concept] = { cat: t.area ? "professional" : "vocabulary", level: lvl, label: t.title, icon: t.icon, area: t.area };
  }
  for (const s of SOUNDS) cat[s.id] = { cat: "pronunciation", level: "A1", label: s.title, icon: s.icon };
  cat["sk.speaking"] = { cat: "speaking", level: "", label: "Speaking", icon: "🗣️" };
  cat["sk.listening"] = { cat: "listening", level: "", label: "Listening", icon: "🎧" };
  cat["sk.reading"] = { cat: "reading", level: "", label: "Reading", icon: "📖" };
  cat["sk.writing"] = { cat: "writing", level: "", label: "Writing", icon: "✍️" };
  for (const r of ROUTES) cat[r.concept] = { cat: r.concept.startsWith("b.") ? "business" : "professional", level: "", label: r.title, icon: r.icon };
  for (const k of ["b.meetings", "b.emails", "b.presentations", "b.negotiation"]) cat[k] = { cat: "business", level: "", label: { "b.meetings": "Meetings", "b.emails": "Emails", "b.presentations": "Presentations", "b.negotiation": "Negotiation" }[k], icon: "💼" };
  C.catalog = cat;
  C.labels = Object.fromEntries(Object.entries(cat).map(([k, v]) => [k, v.label]));
}

function modeLevel(levels) {
  if (!levels.length) return "A1";
  const count = {};
  levels.forEach((l) => (count[l] = (count[l] || 0) + 1));
  return Object.entries(count).sort((a, b) => b[1] - a[1] || LEVELS.indexOf(a[0]) - LEVELS.indexOf(b[0]))[0][0];
}

export function loadContent(packs = []) {
  C.grammar = [...GRAMMAR];
  C.words = [...STARTER_WORDS, ...GENERAL_WORDS, ...ADV_WORDS, ...PRO_WORDS];
  C.topics = [...STARTER_TOPICS, ...GENERAL_TOPICS, ...ADV_TOPICS, ...PRO_TOPICS];
  C.readings = [...READINGS, ...ADV_READINGS];
  C.scenarios = [...SCENARIOS, ...ADV_SCENARIOS];
  for (const p of packs) {
    try { applyPack(p); } catch (e) { console.warn("Paquete de contenido ignorado:", e.message); }
  }
  index();
  return C;
}

// Validación mínima de paquetes (calidad de contenido, sección 167)
export function validatePack(p) {
  const errors = [];
  if (!p || typeof p !== "object") return ["El paquete no es un objeto JSON."];
  if (!p.id) errors.push("Falta 'id'.");
  for (const g of p.grammar || []) {
    if (!g.id?.startsWith("g.")) errors.push(`Tema sin id válido (debe empezar por 'g.'): ${g.title || "?"}`);
    if (!LEVELS.includes(g.level)) errors.push(`Nivel inválido en ${g.id}`);
    for (const it of g.items || []) {
      if (!Array.isArray(it) || !String(it[0]).includes("___")) errors.push(`Ítem sin hueco ___ en ${g.id}`);
      else if ((it[2] || []).includes(it[1])) errors.push(`Distractor igual a la respuesta en ${g.id}`);
    }
  }
  for (const [tid, t] of Object.entries(p.vocab || {})) {
    for (const w of t.words || []) if (!Array.isArray(w) || w.length < 6) errors.push(`Palabra incompleta en ${tid}`);
  }
  return errors;
}

function applyPack(p) {
  const errs = validatePack(p);
  if (errs.length) throw new Error(errs.join(" "));
  for (const g of p.grammar || []) {
    g.rule = g.rule || { es: [], en: [] };
    g.examples = g.examples || [];
    g.items = g.items || [];
    const i = C.grammar.findIndex((x) => x.id === g.id);
    if (i >= 0) C.grammar[i] = g; else C.grammar.push(g);
  }
  if (p.vocab) {
    const built = buildWords(p.vocab);
    C.words.push(...built.words);
    C.topics.push(...built.topics);
  }
  for (const r of p.readings || []) C.readings.push(r);
  for (const s of p.scenarios || []) C.scenarios.push(s);
}

// Búsqueda global (sección 157)
export function search(q, extra = {}) {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const out = [];
  for (const w of C.words) if (w.word.toLowerCase().includes(s) || w.es.toLowerCase().includes(s)) out.push({ type: "word", id: w.id, label: `${w.emoji} ${w.word}`, sub: w.es });
  for (const g of C.grammar) if ((g.title + " " + g.es).toLowerCase().includes(s)) out.push({ type: "grammar", id: g.id, label: `${g.icon} ${g.title}`, sub: `${g.level} · ${g.es}` });
  for (const r of C.readings) if (r.title.toLowerCase().includes(s)) out.push({ type: "reading", id: r.id, label: `${r.icon} ${r.title}`, sub: r.level });
  for (const sc of C.scenarios) if ((sc.title + " " + sc.es).toLowerCase().includes(s)) out.push({ type: "scenario", id: sc.id, label: `${sc.emoji} ${sc.title}`, sub: sc.es });
  for (const [k, list] of Object.entries(extra)) for (const it of list) if ((it[0] + " " + it[1]).toLowerCase().includes(s)) out.push({ type: k, id: it[0], label: it[0], sub: it[1] });
  return out.slice(0, 40);
}

loadContent();
