// MY ENGLISH BRAIN (secciones 8-11, 14, 155, 165). Funciones puras sobre state.skills.
import { DAY, dayKey, daysBetween, clamp, LEVELS, levelIndex } from "../core/util.js";

export const STATES = ["NEW", "LEARNING", "PRACTICING", "STRONG", "MASTERED"];
export const BUCKETS = ["Mastered", "Strong", "Learning", "Weak", "New"];

export function emptyRec(now = Date.now()) {
  return { m: 0, n: 0, c: 0, first: now, last: now, stab: 1.5, ctx: [], days: [], prod: false, hist: [] };
}

// Retención con curva exponencial: 90 % cuando han pasado `stab` días
export function retention(rec, now = Date.now()) {
  if (!rec || !rec.n) return 1;
  const days = Math.max(0, (now - rec.last) / DAY);
  return Math.pow(0.9, days / Math.max(0.3, rec.stab));
}

export function current(rec, now = Date.now()) {
  if (!rec || !rec.n) return 0;
  return rec.m * (0.5 + 0.5 * retention(rec, now));
}

export function record(skills, id, { score = 1, ms = 0, ctx = "", produced = false, now = Date.now() } = {}) {
  const rec = skills[id] || (skills[id] = emptyRec(now));
  const cur = current(rec, now);
  const slow = ms > 25000;
  const q = clamp(score, 0, 1) * (slow ? 0.85 : 1);
  const alpha = Math.max(0.12, 0.45 / Math.sqrt(rec.n + 1));
  const gapDays = rec.n ? (now - rec.last) / DAY : 0;
  rec.m = clamp(cur + alpha * (q - cur), 0, 1);
  if (q >= 0.8) rec.stab = Math.min(365, rec.stab * (gapDays >= 1 ? 2.2 : 1.25));
  else rec.stab = Math.max(0.7, rec.stab * 0.55);
  rec.n += 1;
  if (q >= 0.8) {
    rec.c += 1;
    if (ctx && !rec.ctx.includes(ctx)) rec.ctx.push(ctx);
    const d = dayKey(now);
    if (!rec.days.includes(d)) rec.days.push(d);
    if (rec.days.length > 12) rec.days = rec.days.slice(-12);
    if (produced) rec.prod = true;
  }
  rec.last = now;
  const hist = rec.hist;
  const today = dayKey(now);
  if (hist.length && dayKey(hist[hist.length - 1][0]) === today) hist[hist.length - 1] = [now, +rec.m.toFixed(3)];
  else hist.push([now, +rec.m.toFixed(3)]);
  if (hist.length > 60) rec.hist = hist.slice(-60);
  return rec;
}

// ¿Verificado en varios días separados? (acierto "después de varios días")
function spacedVerified(rec) {
  if (rec.days.length < 2) return false;
  const first = rec.days[0], lastD = rec.days[rec.days.length - 1];
  return daysBetween(first, lastD) >= 2;
}

export function stateOf(rec, now = Date.now()) {
  if (!rec || !rec.n) return "NEW";
  const cur = current(rec, now);
  if (cur < 0.45) return "LEARNING";
  if (cur < 0.7) return "PRACTICING";
  if (cur >= 0.88 && rec.ctx.length >= 3 && spacedVerified(rec) && rec.prod) return "MASTERED";
  return "STRONG";
}

export function bucketOf(rec, now = Date.now()) {
  const s = stateOf(rec, now);
  if (s === "NEW") return "New";
  if (s === "MASTERED") return "Mastered";
  if (s === "STRONG") return "Strong";
  return current(rec, now) < 0.45 && rec.n >= 2 ? "Weak" : "Learning";
}

// Olvido inteligente (sección 11)
export function forgetting(skills, labels = {}, now = Date.now()) {
  const out = [];
  for (const id in skills) {
    const rec = skills[id];
    if (!rec.n || rec.m < 0.5) continue;
    const cur = current(rec, now);
    const drop = rec.m - cur;
    if (drop >= 0.1) {
      out.push({
        id, label: labels[id] || id, daysAgo: Math.floor((now - rec.last) / DAY),
        previous: rec.m, estimated: cur, drop,
        minutes: drop > 0.25 ? 8 : 5,
      });
    }
  }
  return out.sort((a, b) => b.drop - a.drop);
}

// Cambio de dominio en una ventana (para "You are improving in…")
export function trend(rec, days = 7, now = Date.now()) {
  if (!rec || !rec.hist || rec.hist.length < 2) return 0;
  const since = now - days * DAY;
  const before = [...rec.hist].reverse().find(([t]) => t < since) || rec.hist[0];
  return current(rec, now) - before[1];
}

export function avg(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }

// Radar de 7 ejes (sección 155). catalog: { id: {cat, level} }
export function radar(state, catalog, now = Date.now()) {
  const sk = state.skills;
  const lvl = levelIndex(state.levels.overall);
  const val = (id) => current(sk[id], now);
  const grammarIds = Object.keys(catalog).filter((id) => catalog[id].cat === "grammar" && levelIndex(catalog[id].level) <= lvl);
  const vocabIds = Object.keys(sk).filter((id) => id.startsWith("v."));
  const pronIds = Object.keys(catalog).filter((id) => catalog[id].cat === "pronunciation");
  const practiced = (ids) => ids.filter((id) => sk[id] && sk[id].n);
  return {
    Speaking: val("sk.speaking"),
    Listening: val("sk.listening"),
    Reading: val("sk.reading"),
    Writing: val("sk.writing"),
    Vocabulary: avg(practiced(vocabIds).map(val)) * (vocabIds.length ? 1 : 0),
    Grammar: avg(grammarIds.map(val)),
    Pronunciation: avg(practiced(pronIds).map(val)),
  };
}

// Cobertura de un nivel: media del dominio actual de gramática + vocabulario de ese nivel.
// Los conceptos no practicados cuentan 0 → el nivel sube por dominio real, no por XP (sección 165).
export function coverage(state, catalog, level, now = Date.now()) {
  const ids = Object.keys(catalog).filter((id) => catalog[id].level === level && (catalog[id].cat === "grammar" || catalog[id].cat === "vocabulary"));
  if (!ids.length) return 0;
  return avg(ids.map((id) => current(state.skills[id], now)));
}

export function nextLevel(level) {
  const i = levelIndex(level);
  return i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
}

export function readyForExam(state, catalog, now = Date.now()) {
  const cov = coverage(state, catalog, state.levels.overall, now);
  return { coverage: cov, ready: cov >= 0.7 && !!nextLevel(state.levels.overall) };
}

// Inicializa conocimientos previos tras la prueba de nivel (dominio 60 %, sin verificar)
export function seedPrior(state, catalog, level, now = Date.now()) {
  const li = levelIndex(level);
  for (const id in catalog) {
    const c = catalog[id];
    if (c.cat !== "grammar" && c.cat !== "vocabulary") continue;
    if (levelIndex(c.level) < li && !state.skills[id]) {
      const rec = emptyRec(now);
      rec.m = 0.62; rec.n = 1; rec.c = 1; rec.stab = 6; rec.hist = [[now, 0.62]];
      state.skills[id] = rec;
    }
  }
}

// Resumen compacto para la IA (contexto limitado, sección 133)
export function summary(state, catalog, now = Date.now()) {
  const p = state.profile, L = state.levels;
  const weak = Object.keys(state.skills)
    .filter((id) => state.skills[id].n >= 2)
    .map((id) => [id, current(state.skills[id], now)])
    .sort((a, b) => a[1] - b[1]).slice(0, 4)
    .map(([id, v]) => `${catalog[id]?.label || id} (${Math.round(v * 100)}%)`);
  const pats = Object.entries(state.patterns).sort((a, b) => b[1].n - a[1].n).slice(0, 4).map(([k, v]) => `${k} (${v.n})`);
  const prof = [p.professions.primary, p.professions.secondary, ...(p.professions.extra || []), p.professions.custom].filter(Boolean).join(" + ");
  return [
    `Student: native ${p.nativeLang === "es" ? "Spanish" : p.nativeLang}, overall level ${L.overall} (grammar ${L.grammar}, vocabulary ${L.vocabulary}, speaking ${L.speaking}, listening ${L.listening}).`,
    `Goals: ${p.goals.join(", ") || "general"}. Profession: ${prof || "not set"}. Preferred accent: ${p.accent === "uk" ? "British" : "American"}.`,
    weak.length ? `Weak areas: ${weak.join(", ")}.` : "",
    pats.length ? `Frequent mistakes: ${pats.join(", ")}.` : "",
  ].filter(Boolean).join("\n");
}
