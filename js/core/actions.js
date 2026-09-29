// Acciones de aprendizaje: cada evidencia actualiza Brain, SRS, errores, XP, racha y registro.
import { store, logEvent } from "./store.js";
import { uid, dayKey } from "./util.js";
import { record } from "../engine/brain.js";
import { review, newCard, gradeFrom, GRADE } from "../engine/srs.js";
import { addXP, touchStreak, checkBadges, XP } from "../engine/gamification.js";
import { detect, RULE_BY_ID } from "../engine/errors.js";
import { isProduction } from "../engine/exercises.js";

const S = () => store.state;
let badgeListener = () => {};
export function onBadge(fn) { badgeListener = fn; }

function after(save = true) {
  const s = S();
  touchStreak(s);
  const fresh = checkBadges(s);
  if (save) store.save();
  fresh.forEach((b) => badgeListener(b));
}

// Respuesta a un ejercicio. score 0..1, prod = producción activa
export function answer({ concept, ok, score, ms = 0, ctx = "", type = "", skill = null, sec = 0, hints = 0, typo = false }) {
  const s = S();
  const prod = isProduction(type);
  const sc = score ?? (ok ? (hints ? 0.6 : typo ? 0.85 : 1) : 0);
  if (concept) record(s.skills, concept, { score: sc, ms, ctx, produced: prod && ok });
  if (skill) record(s.skills, skill, { score: sc, ms, ctx });
  const xp = addXP(s, ok ? (prod ? XP.produce : XP.recognize) : XP.attempt);
  logEvent(s, { kind: "answer", skill: concept || skill, ok, prod, sec: sec || Math.round(ms / 1000), xp });
  after();
  return xp;
}

// Palabra: calificación SRS automática a partir del ejercicio
export function wordResult(wordId, concept, { ok, hints = 0, ms = 0, typo = false, sec = 0 }) {
  const s = S();
  const isNew = !s.vocab[wordId] || s.vocab[wordId].reps === 0;
  const card = s.vocab[wordId] || newCard();
  const grade = gradeFrom({ correct: ok, hints, ms, typo });
  s.vocab[wordId] = review(card, grade);
  if (concept) record(s.skills, concept, { score: ok ? (grade === GRADE.HARD ? 0.7 : 1) : 0, ms, ctx: "vocab" });
  if (isNew) logEvent(s, { kind: "word_new", w: wordId });
  const xp = addXP(s, ok ? XP.review : XP.attempt);
  logEvent(s, { kind: "review", w: wordId, ok, sec: sec || Math.round(ms / 1000), xp });
  after();
  return grade;
}

export function addWord(wordId) {
  const s = S();
  if (!s.vocab[wordId]) { s.vocab[wordId] = newCard(); s.vocab[wordId].due = Date.now(); s.vocab[wordId].reps = 0; store.save(); return true; }
  return false;
}

// Analiza un texto libre: guarda errores (My Mistakes), patrones y penaliza el tema relacionado
export function analyzeText(text, source = "writing") {
  const s = S();
  const found = detect(text);
  for (const f of found) {
    s.mistakes.push({ id: uid(), t: Date.now(), cat: f.cat, pattern: f.id, wrong: f.wrong, right: f.right, why: f.es, topic: f.topic, source, fixed: false });
    const p = s.patterns[f.id] || (s.patterns[f.id] = { n: 0, last: 0 });
    p.n += 1; p.last = Date.now();
    if (f.topic) record(s.skills, f.topic, { score: 0.2, ctx: source });
  }
  if (found.length) store.save();
  return found;
}

export function markMistakeFixed(topicOrPattern) {
  const s = S();
  // Solo cuenta como corregido un error antiguo (acertar después, en otro momento)
  const old = Date.now() - 10 * 60 * 1000;
  const m = s.mistakes.find((x) => !x.fixed && x.t < old && (x.topic === topicOrPattern || x.pattern === topicOrPattern));
  if (m) { m.fixed = true; store.save(); }
}

export function recordMistake({ cat, wrong, right, why, topic, pattern = "" }) {
  const s = S();
  s.mistakes.push({ id: uid(), t: Date.now(), cat, pattern, wrong, right, why, topic, source: "exercise", fixed: false });
  if (pattern) { const p = s.patterns[pattern] || (s.patterns[pattern] = { n: 0, last: 0 }); p.n++; p.last = Date.now(); }
  store.save();
}

export function speakTime(sec) {
  const s = S();
  if (sec <= 0) return;
  const k = dayKey();
  s.speaking[k] = (s.speaking[k] || 0) + Math.round(sec);
  addXP(s, Math.round((sec / 60) * XP.speakMinute));
  logEvent(s, { kind: "speak", sec: Math.round(sec) });
  after();
}

export function lessonDone(lesson, score, sec = 0) {
  const s = S();
  const prev = s.lessons[lesson.id] || { done: 0, best: 0, stars: 0, times: 0 };
  const stars = score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1;
  s.lessons[lesson.id] = { done: Date.now(), best: Math.max(prev.best, score), stars: Math.max(prev.stars, stars), times: prev.times + 1 };
  addXP(s, XP.lesson);
  logEvent(s, { kind: "lesson", id: lesson.id, lk: lesson.kind, score, sec });
  after();
  return stars;
}

export function activity(kind, data = {}) {
  const s = S();
  logEvent(s, { kind, ...data });
  if (data.xp) addXP(s, data.xp);
  after();
}

export function ruleInfo(id) { return RULE_BY_ID[id]; }
