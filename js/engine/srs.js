// Repetición espaciada (sección 12). Cálculo 100 % local, sin IA (sección 176).
// Escalera base 1-3-7-15-30-60 días, ajustada por un factor de facilidad por palabra.
import { DAY } from "../core/util.js";

export const LADDER = [1, 3, 7, 15, 30, 60];
export const GRADE = { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 };
const RELEARN_MS = 10 * 60 * 1000;

export function newCard(now = Date.now()) {
  return { step: -1, ease: 1, due: now, reps: 0, lapses: 0, last: 0, lastGrade: null, added: now };
}

export function intervalDays(step, ease) {
  if (step < 0) return 0;
  if (step < LADDER.length) return Math.max(1, Math.round(LADDER[step] * ease));
  // Más allá de 60 días: se duplica por peldaño extra
  return Math.round(LADDER[LADDER.length - 1] * 2 ** (step - LADDER.length + 1) * ease);
}

export function review(card, grade, now = Date.now()) {
  const c = { ...card };
  c.reps += 1;
  c.last = now;
  c.lastGrade = grade;
  if (grade === GRADE.AGAIN) {
    c.lapses += 1;
    c.ease = Math.max(0.7, +(c.ease - 0.15).toFixed(2));
    c.step = 0;
    c.due = now + RELEARN_MS;
    return c;
  }
  if (grade === GRADE.HARD) {
    c.step = Math.max(0, c.step);
    c.ease = Math.max(0.7, +(c.ease - 0.05).toFixed(2));
    c.due = now + Math.max(1, Math.round(intervalDays(c.step, c.ease) * 0.6)) * DAY;
    return c;
  }
  if (grade === GRADE.EASY) c.ease = Math.min(1.4, +(c.ease + 0.1).toFixed(2));
  c.step = Math.max(0, c.step) + (grade === GRADE.EASY ? 2 : 1);
  if (card.step < 0) c.step -= 1; // la primera vez "Good" deja el peldaño 0 (1 día)
  c.due = now + intervalDays(c.step, c.ease) * DAY;
  return c;
}

// Estado visible de la palabra (sección 20)
export function cardState(card, now = Date.now()) {
  if (!card || card.reps === 0) return "NEW";
  if (isForgotten(card, now)) return "FORGOTTEN";
  if (card.step >= 5) return "MASTERED";
  if (card.step >= 2) return "REVIEW";
  return "LEARNING";
}

export function isForgotten(card, now = Date.now()) {
  if (!card || card.reps === 0) return false;
  if (card.lastGrade === GRADE.AGAIN) return true;
  const interval = Math.max(DAY, card.due - card.last);
  return now - card.due > interval * 2;
}

export const isDue = (card, now = Date.now()) => !!card && card.reps > 0 && card.due <= now;

// Convierte el resultado de un ejercicio en una calificación (el estudiante no se autoevalúa)
export function gradeFrom({ correct, hints = 0, ms = 0, typo = false }) {
  if (!correct) return GRADE.AGAIN;
  if (hints > 0 || typo) return GRADE.HARD;
  if (ms && ms < 4000) return GRADE.EASY;
  return GRADE.GOOD;
}

export function vocabStats(vocab, now = Date.now()) {
  const st = { total: 0, learned: 0, mastered: 0, due: 0, forgotten: 0, learning: 0, review: 0 };
  for (const id in vocab) {
    const c = vocab[id];
    st.total++;
    const s = cardState(c, now);
    if (c.reps > 0) st.learned++;
    if (s === "MASTERED") st.mastered++;
    if (s === "FORGOTTEN") st.forgotten++;
    if (s === "LEARNING") st.learning++;
    if (s === "REVIEW") st.review++;
    if (isDue(c, now)) st.due++;
  }
  return st;
}

export function dueList(vocab, now = Date.now(), limit = 50) {
  return Object.entries(vocab)
    .filter(([, c]) => isDue(c, now))
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, limit)
    .map(([id]) => id);
}
