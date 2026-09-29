// Exámenes (secciones 7, 103-104, 166): formato EF SET (lectura + escucha adaptativas, 0-100 ↔ CEFR),
// formato GoFluent (gramática, vocabulario e inglés de negocios por nivel), examen de unidad y quick check.
import { LEVELS, levelIndex, shuffle, pick } from "../core/util.js";
import { itemObj } from "../content/grammar.js";
import { TEST_READINGS, TEST_LISTENINGS, BUSINESS_ITEMS, SCORE_BANDS } from "../content/tests-bank.js";
import { READINGS } from "../content/reading.js";

const EF_LEVELS = ["A1", "A2", "B1", "B2", "C1"];

// Bloques (texto o diálogo + preguntas) por nivel, combinando el banco de exámenes y las lecturas del curso
export function readingBlocks(level) {
  const extra = READINGS.filter((r) => r.level === level).map((r) => ({ level, title: r.title, text: r.text, q: r.q }));
  return [...TEST_READINGS.filter((r) => r.level === level), ...extra];
}
export const listeningBlocks = (level) => TEST_LISTENINGS.filter((l) => l.level === level);

// Test adaptativo por secciones: cada bloque se elige según el resultado del anterior
export class AdaptiveSection {
  constructor(kind, { blocks = 3, rnd = Math.random, start = 1 } = {}) {
    this.kind = kind; this.total = blocks; this.rnd = rnd; this.li = start;
    this.done = []; // {level, ok, n}
    this.used = new Set();
  }
  get finished() { return this.done.length >= this.total; }
  next() {
    const get = this.kind === "reading" ? readingBlocks : listeningBlocks;
    for (const d of [0, -1, 1, -2, 2]) {
      const L = EF_LEVELS[Math.min(EF_LEVELS.length - 1, Math.max(0, this.li + d))];
      const pool = get(L).filter((b) => !this.used.has(b.title || b.lines?.[0]));
      if (pool.length) { const b = pick(pool, this.rnd); this.used.add(b.title || b.lines[0]); return { ...b, level: L }; }
    }
    return null;
  }
  record(level, ok, n) {
    this.done.push({ level, ok, n });
    const r = ok / n;
    this.li = Math.max(0, Math.min(EF_LEVELS.length - 1, levelIndex(level) + (r >= 0.75 ? 1 : r < 0.5 ? -1 : 0)));
  }
  // Puntuación 0-100: nivel más alto dominado (≥ 60 %) + rendimiento dentro de la banda
  score() {
    if (!this.done.length) return 1;
    const passed = this.done.filter((d) => d.ok / d.n >= 0.6).map((d) => levelIndex(d.level));
    const top = passed.length ? Math.max(...passed) : -1;
    if (top < 0) {
      const r = this.done.reduce((a, d) => a + d.ok, 0) / this.done.reduce((a, d) => a + d.n, 0);
      return Math.max(1, Math.round(r * 25));
    }
    const band = SCORE_BANDS[top];
    const atTop = this.done.filter((d) => levelIndex(d.level) === top);
    const r = atTop.reduce((a, d) => a + d.ok, 0) / atTop.reduce((a, d) => a + d.n, 0);
    const above = this.done.filter((d) => levelIndex(d.level) > top);
    const bonus = above.length ? (above.reduce((a, d) => a + d.ok, 0) / above.reduce((a, d) => a + d.n, 0)) * 0.5 : 0;
    const span = top === SCORE_BANDS.length - 1 ? 10 : band.max - band.min;
    return Math.min(100, Math.round(band.min + span * Math.min(1, (r - 0.6) / 0.4 * 0.7 + bonus)));
  }
}

export function levelFromScore(score) {
  return (SCORE_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_BANDS[0]).level;
}

// Test de nivel estilo GoFluent: gramática + vocabulario + (B1+) negocios. Devuelve ejercicios para el runner.
export function levelTestItems(C, level, n = 24, rnd = Math.random) {
  const li = levelIndex(level);
  const topics = C.grammar.filter((g) => g.level === level);
  const gram = shuffle(topics.flatMap((t) => t.items.map((it) => [t, it])), rnd).slice(0, Math.round(n * 0.5)).map(([t, it]) => {
    const o = itemObj(it);
    return { type: "choose", prompt: o.s.replace(/\s*\([^)]*\)/g, ""), options: shuffle([o.a, ...o.d], rnd), answer: o.a, concept: t.id, section: "Grammar", ctx: o.ctx, topic: t.id, item: it, es: o.es };
  });
  const words = shuffle(C.words.filter((w) => w.cefr === level), rnd);
  const vocab = words.slice(0, Math.round(n * 0.3)).map((w) => {
    const others = shuffle(C.words.filter((x) => x.cefr === level && x.id !== w.id && x.es !== w.es), rnd).slice(0, 3);
    return rnd() < 0.5
      ? { type: "choose", prompt: `“${w.word}” means…`, options: shuffle([w.es, ...others.map((x) => x.es)], rnd), answer: w.es, concept: "v." + w.topic, section: "Vocabulary" }
      : { type: "choose", prompt: `Which word matches: “${w.def}”?`, options: shuffle([w.word, ...others.map((x) => x.word)], rnd), answer: w.word, concept: "v." + w.topic, section: "Vocabulary" };
  });
  const biz = shuffle(BUSINESS_ITEMS.filter((b) => levelIndex(b.level) <= li && levelIndex(b.level) >= li - 1), rnd).slice(0, n - gram.length - vocab.length)
    .map((b) => ({ type: "choose", prompt: b.q, options: shuffle([b.a, ...b.d], rnd), answer: b.a, concept: "b.business", section: "Business" }));
  return shuffle([...gram, ...vocab, ...biz], rnd);
}

export function businessTestItems(n = 15, rnd = Math.random) {
  return shuffle(BUSINESS_ITEMS, rnd).slice(0, n).map((b) => ({ type: "choose", prompt: b.q, options: shuffle([b.a, ...b.d], rnd), answer: b.a, concept: "b.business", section: `Business ${b.level}` }));
}

// Resultados por sección (Grammar / Vocabulary / Business…)
export function sectionScores(results) {
  const by = {};
  for (const r of results) {
    const k = r.ex.section || "Other";
    (by[k] ||= { ok: 0, n: 0 }).n++;
    if (r.ok) by[k].ok++;
  }
  return by;
}

export const PASS_MARK = 0.7;
export { EF_LEVELS, LEVELS };
