// Motor de decisión diaria (secciones 98-100, 139, 150). Todo local, sin IA.
import { DAY, dayKey, levelIndex } from "../core/util.js";
import { current, forgetting, trend, radar } from "./brain.js";
import { dueList, vocabStats } from "./srs.js";
import { LESSONS, UNITS } from "../content/curriculum.js";
import { PROFESSION_ROUTES, ROUTE_BY_ID } from "../content/professional.js";
import { RULE_BY_ID } from "./errors.js";

export function daysSinceStart(state, now = Date.now()) {
  return Math.floor((now - state.profile.createdAt) / DAY);
}

// Siguiente lección: la primera no completada del nivel actual; si no hay, del siguiente
export function nextLesson(state) {
  const li = levelIndex(state.levels.overall);
  const ordered = [...LESSONS].sort((a, b) => levelIndex(unitLevel(a)) - levelIndex(unitLevel(b)));
  return ordered.find((l) => levelIndex(unitLevel(l)) >= li && !state.lessons[l.id]?.done)
    || ordered.find((l) => !state.lessons[l.id]?.done) || null;
}
const unitOf = Object.fromEntries(UNITS.map((u) => [u.id, u]));
export const unitLevel = (lesson) => unitOf[lesson.unit]?.level || "A1";

function speakingSecondsLast(state, days, now) {
  let s = 0;
  for (let i = 0; i < days; i++) s += state.speaking[dayKey(now - i * DAY)] || 0;
  return s;
}

function recentPatterns(state, now) {
  return Object.entries(state.patterns)
    .filter(([, v]) => v.n >= 2 && now - v.last < 7 * DAY)
    .sort((a, b) => b[1].n - a[1].n);
}

export function recommendedScenario(state, catalogScenarios) {
  const li = levelIndex(state.levels.overall);
  const pro = routesFor(state.profile);
  const done = new Set(state.conversations.map((c) => c.scenario));
  const fits = catalogScenarios.filter((s) => levelIndex(s.level) <= li + 1);
  return fits.find((s) => s.pro && pro.includes(s.pro) && !done.has(s.id))
    || fits.find((s) => !done.has(s.id)) || fits[0] || catalogScenarios[0];
}

export function routesFor(profile) {
  const p = profile.professions || {};
  const names = [p.primary, p.secondary, ...(p.extra || [])].filter(Boolean);
  const out = [];
  for (const n of names) for (const r of PROFESSION_ROUTES[n] || []) if (!out.includes(r)) out.push(r);
  if (!out.length && (profile.goals || []).some((g) => ["Work", "Business", "Professional Development"].includes(g))) out.push("business");
  return out;
}

// Construye el plan del día
export function buildPlan(state, C, now = Date.now()) {
  const minutes = state.profile.dailyMinutes || 15;
  const cand = [];
  const due = dueList(state.vocab, now, 200);
  const lesson = nextLesson(state);
  const forgot = forgetting(state.skills, C.labels, now).filter((f) => C.catalog[f.id]);
  const pats = recentPatterns(state, now);
  const speakSec = speakingSecondsLast(state, 7, now);
  const R = radar(state, C.catalog, now);
  const li = levelIndex(state.levels.overall);
  const routes = routesFor(state.profile);
  const day = daysSinceStart(state, now);

  if (due.length) cand.push({ kind: "review", pri: 100 + due.length, min: Math.min(8, Math.max(3, Math.round(due.length * 0.35))), title: "Vocabulary review", es: `${due.length} palabras para repasar`, icon: "🔁", route: "#/review" });
  if (forgot[0]) {
    const f = forgot[0];
    cand.push({ kind: "forgot", pri: 85 + f.drop * 100, min: f.minutes, title: `${f.label} review`, es: `Lo estás olvidando: ${Math.round(f.previous * 100)}% → ${Math.round(f.estimated * 100)}%`, icon: "🧠", route: f.id.startsWith("g.") ? `#/grammar/${f.id}/practice` : f.id.startsWith("v.") ? `#/vocab/topic/${f.id.slice(2)}` : "#/smart-review" });
  }
  if (pats[0]) cand.push({ kind: "mistakes", pri: 78, min: 4, title: "Fix your mistakes", es: `${(RULE_BY_ID[pats[0][0]]?.en || pats[0][0]).split(":")[0].slice(0, 70)} (${pats[0][1].n}×)`, icon: "🎯", route: "#/mistakes/practice" });
  const lessonsDone = Object.values(state.lessons).filter((l) => l.done).length;
  if (lesson) cand.push({ kind: "lesson", pri: lessonsDone < 3 ? 95 : 72, min: 8, title: lessonTitle(lesson, C), es: "Siguiente lección de tu ruta", icon: "📘", route: `#/lesson/${encodeURIComponent(lesson.id)}` });
  if (speakSec < 600) {
    const sc = recommendedScenario(state, C.scenarios);
    cand.push({ kind: "speak", pri: 60 + (600 - speakSec) / 30, min: 6, title: `Speaking: ${sc.title}`, es: "Practica hablando", icon: "🗣️", route: `#/roleplay/${sc.id}` });
  }
  const weakest = Object.entries(R).filter(([k]) => ["Listening", "Reading", "Writing", "Pronunciation"].includes(k)).sort((a, b) => a[1] - b[1])[0];
  if (weakest) {
    const map = { Listening: ["#/listening", "🎧"], Reading: ["#/reading", "📖"], Writing: ["#/writing", "✍️"], Pronunciation: ["#/pronunciation", "👄"] };
    cand.push({ kind: "skill", pri: 55, min: 5, title: `${weakest[0]} practice`, es: "Tu habilidad más baja", icon: map[weakest[0]][1], route: map[weakest[0]][0] });
  }
  if (routes.length) {
    const r = ROUTE_BY_ID[routes[0]];
    cand.push({ kind: "pro", pri: li >= 1 ? 50 : 30, min: 5, title: r.title, es: "Tu inglés profesional", icon: r.icon, route: `#/pro/${r.id}` });
  }

  // Primera semana (sección 139)
  const FIRST_WEEK = {
    0: { kind: "assessment", title: state.profile.placementDone ? "Welcome lesson" : "Placement test", icon: "📝", route: state.profile.placementDone ? null : "#/placement" },
    1: { boost: ["review", "lesson", "speak"] }, 2: { boost: ["lesson", "forgot"] }, 3: { boost: ["skill"], force: { kind: "skill", title: "Listening practice", icon: "🎧", route: "#/listening", min: 6 } },
    4: { boost: ["speak"] }, 5: { boost: ["review", "mistakes", "forgot"], force: { kind: "smart", title: "Smart Review", icon: "🧠", route: "#/smart-review", min: 6 } },
    6: { force: { kind: "assessment", title: "Weekly assessment", icon: "🏁", route: "#/exam/weekly", min: 8 } },
  };
  const fw = day < 7 ? FIRST_WEEK[day] : null;
  if (fw?.route) cand.push({ ...fw, pri: 200, min: 10, es: "Primera semana" });
  if (fw?.force) cand.push({ ...fw.force, pri: 190, es: "Primera semana" });
  if (fw?.boost) cand.forEach((c) => { if (fw.boost.includes(c.kind)) c.pri += 40; });

  cand.sort((a, b) => b.pri - a.pri);
  const blocks = [];
  let total = 0;
  const kinds = new Set();
  for (const c of cand) {
    if (kinds.has(c.kind)) continue;
    const m = Math.min(c.min, Math.max(3, minutes - total));
    if (total + m > minutes + 2 && blocks.length) break;
    blocks.push({ ...c, min: m, id: c.kind });
    kinds.add(c.kind);
    total += m;
    if (total >= minutes) break;
  }
  // Garantiza producción oral si hay ≥ 10 minutos
  if (minutes >= 10 && !blocks.some((b) => b.kind === "speak") && cand.find((c) => c.kind === "speak")) {
    const sp = cand.find((c) => c.kind === "speak");
    if (blocks.length > 1) { total -= blocks[blocks.length - 1].min; blocks.pop(); }
    blocks.push({ ...sp, id: "speak", min: Math.min(sp.min, Math.max(3, minutes - total)) });
    total = blocks.reduce((a, b) => a + b.min, 0);
  }
  return { date: dayKey(now), blocks, total };
}

function lessonTitle(lesson, C) {
  if (lesson.kind === "grammar") return C.grammarById[lesson.ref]?.title || lesson.ref;
  if (lesson.kind === "vocab") return "Words: " + (C.topicById[lesson.ref]?.title || lesson.ref);
  if (lesson.kind === "talk") return "Talk: " + (C.scenarioById[lesson.ref]?.title || lesson.ref);
  if (lesson.kind === "read") return "Read: " + (C.readingById[lesson.ref]?.title || lesson.ref);
  if (lesson.kind === "pron") return "Sounds: " + lesson.ref.replace("pr.", "").toUpperCase();
  return lesson.ref;
}
export { lessonTitle };

// "Your coach recommends" (sección 99): compara tendencias de 7 días
export function recommendation(state, C, now = Date.now()) {
  const ids = Object.keys(state.skills).filter((id) => state.skills[id].n >= 3 && C.catalog[id]);
  const trends = ids.map((id) => [id, trend(state.skills[id], 7, now)]);
  const up = trends.filter((t) => t[1] > 0.03).sort((a, b) => b[1] - a[1])[0];
  const down = trends.filter((t) => t[1] < -0.03).sort((a, b) => a[1] - b[1])[0];
  const forgot = forgetting(state.skills, C.labels, now)[0];
  const lbl = (id) => C.labels[id] || id;
  let text;
  if (up && down) text = `You are improving in ${lbl(up[0])}, but your ${lbl(down[0])} accuracy has decreased.`;
  else if (down) text = `Your ${lbl(down[0])} accuracy has decreased this week. Let's reinforce it.`;
  else if (forgot) text = `You haven't practiced ${forgot.label} for ${forgot.daysAgo} days. Estimated mastery: ${Math.round(forgot.estimated * 100)}%.`;
  else if (up) text = `Great improvement in ${lbl(up[0])}! Keep the momentum.`;
  else if (!ids.length) text = "Let's start building your English Brain. Every answer teaches me what you need.";
  else text = "You're getting more accurate. Today's plan keeps everything fresh.";
  const plan = buildPlan(state, C, now);
  return { text, blocks: plan.blocks.slice(0, 3) };
}

// Notificaciones sobrias (sección 124): máximo 1 mensaje relevante
export function notice(state, C, now = Date.now()) {
  const st = vocabStats(state.vocab, now);
  if (st.due >= 5) return `You have ${st.due} words ready for review.`;
  const f = forgetting(state.skills, C.labels, now)[0];
  if (f) return `${f.label} needs a ${f.minutes}-minute review.`;
  return `Your ${state.profile.dailyMinutes}-minute English lesson is ready.`;
}

export function weakConcepts(state, C, n = 6, now = Date.now()) {
  return Object.keys(state.skills)
    .filter((id) => C.catalog[id] && state.skills[id].n >= 1 && (id.startsWith("g.") || id.startsWith("v.")))
    .map((id) => [id, current(state.skills[id], now)])
    .sort((a, b) => a[1] - b[1]).slice(0, n).map(([id]) => id);
}
