// Prueba de nivel adaptativa en escalera (sección 7).
import { LEVELS, levelIndex, shuffle, pick } from "../core/util.js";
import { itemObj } from "../content/grammar.js";
import { READING_ITEMS, LISTENING_ITEMS } from "../content/placement-bank.js";
import { textComplexity } from "./grader.js";
import { detect } from "./errors.js";

const TEST_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const ORDER = ["grammar", "vocabulary", "reading", "listening"];

export class Placement {
  constructor(C, { rnd = Math.random, length = 12 } = {}) {
    this.C = C; this.rnd = rnd; this.length = length;
    this.li = 1; // empieza en A2
    this.i = 0;
    this.answers = []; // {skill, level, ok}
    this.used = new Set();
  }
  get done() { return this.i >= this.length; }
  next() {
    const skill = ORDER[this.i % ORDER.length];
    const level = TEST_LEVELS[this.li];
    const q = this.build(skill, level) || this.build(skill, TEST_LEVELS[Math.max(0, this.li - 1)]) || this.build("grammar", level);
    this.cur = q;
    return q;
  }
  build(skill, level) {
    const rnd = this.rnd;
    if (skill === "grammar") {
      const topics = this.C.grammar.filter((g) => g.level === level);
      if (!topics.length) return null;
      const t = pick(topics, rnd);
      const it = pick(t.items, rnd);
      const key = t.id + it[0];
      if (this.used.has(key)) return this.build(skill, level);
      this.used.add(key);
      const o = itemObj(it);
      return { skill, level, prompt: o.s.replace(/\s*\([^)]*\)/g, ""), options: shuffle([o.a, ...o.d], rnd), answer: o.a };
    }
    if (skill === "vocabulary") {
      const pool = this.C.words.filter((w) => w.cefr === level && !this.used.has(w.id));
      if (pool.length < 4) return null;
      const w = pick(pool, rnd);
      this.used.add(w.id);
      const others = shuffle(pool.filter((x) => x.id !== w.id && x.es !== w.es), rnd).slice(0, 3);
      return { skill, level, prompt: `What does "${w.word}" mean?`, options: shuffle([w.es, ...others.map((x) => x.es)], rnd), answer: w.es };
    }
    const bank = skill === "reading" ? READING_ITEMS : LISTENING_ITEMS;
    const pool = bank.filter((x) => x.level === level && !this.used.has(x.q));
    if (!pool.length) return null;
    const x = pick(pool, rnd);
    this.used.add(x.q);
    return { skill, level, passage: x.passage, audio: x.audio, prompt: x.q, options: shuffle([x.a, ...x.d], rnd), answer: x.a };
  }
  answer(choice) {
    const ok = choice === this.cur.answer;
    this.answers.push({ skill: this.cur.skill, level: this.cur.level, ok });
    this.li = Math.max(0, Math.min(TEST_LEVELS.length - 1, this.li + (ok ? 1 : -1)));
    this.i++;
    return ok;
  }
  skillLevel(skill) {
    const a = this.answers.filter((x) => x.skill === skill);
    if (!a.length) return null;
    const right = a.filter((x) => x.ok).map((x) => levelIndex(x.level));
    if (!right.length) return "A1";
    let est = Math.max(...right);
    if (a.some((x) => !x.ok && levelIndex(x.level) <= est)) est = Math.max(0, est - 1);
    return LEVELS[est];
  }
}

export function writingLevel(text) {
  const c = textComplexity(text);
  if (c.words < 8) return "A1";
  const errs = detect(text).filter((e) => e.cat !== "Writing").length;
  const errRate = errs / Math.max(1, c.sentences);
  const score = c.tenses * 1.1 + Math.min(4, c.connectors) * 0.6 + Math.min(6, c.sentences) * 0.35 + (c.words > 60 ? 1 : c.words > 30 ? 0.5 : 0) - errRate * 1.2;
  return score < 1.8 ? "A1" : score < 3.2 ? "A2" : score < 4.6 ? "B1" : score < 6 ? "B2" : "C1";
}

export function speakingLevel(avgScore) {
  if (avgScore == null) return null;
  return avgScore < 0.5 ? "A1" : avgScore < 0.7 ? "A2" : avgScore < 0.85 ? "B1" : "B2";
}

export function median(levels) {
  const xs = levels.filter(Boolean).map(levelIndex).sort((a, b) => a - b);
  if (!xs.length) return "A1";
  return LEVELS[xs[Math.floor((xs.length - 1) / 2)]];
}

export function placementResult(p, writing, speakingScore) {
  const r = {
    grammar: p.skillLevel("grammar") || "A1",
    vocabulary: p.skillLevel("vocabulary") || "A1",
    reading: p.skillLevel("reading") || "A1",
    listening: p.skillLevel("listening") || "A1",
    writing: writing ? writingLevel(writing) : null,
    speaking: speakingLevel(speakingScore),
  };
  r.pronunciation = r.speaking;
  r.overall = median([r.grammar, r.vocabulary, r.reading, r.listening, r.writing, r.speaking]);
  // Sin datos orales: speaking un nivel por debajo del general (conservador)
  if (!r.speaking) r.speaking = r.pronunciation = LEVELS[Math.max(0, levelIndex(r.overall) - 1)];
  if (!r.writing) r.writing = LEVELS[Math.max(0, levelIndex(r.overall) - 1)];
  return r;
}
