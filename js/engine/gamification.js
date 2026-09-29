// Gamificación sana (secciones 93-97, 138, 156). Sin vidas ni bloqueos.
import { dayKey, daysBetween, seeded, DAY } from "../core/util.js";
import { DAILY_CHALLENGES, WEEKLY_MISSIONS } from "../content/extras.js";
import { vocabStats } from "./srs.js";
import { stateOf } from "./brain.js";

export const XP = { produce: 10, recognize: 6, attempt: 1, lesson: 20, review: 5, speakMinute: 2 };

export const playerLevel = (xp) => Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 100)) / 2) + 1;
export const xpForLevel = (n) => 50 * (n - 1) * n; // XP acumulado para empezar el nivel n

export function addXP(state, n) {
  const before = Math.floor(state.game.xp / 10);
  state.game.xp += n;
  state.game.coins += Math.floor(state.game.xp / 10) - before;
  return n;
}

// Racha: se llama con cualquier actividad. Un protector semanal gratuito cubre un día perdido.
export function touchStreak(state, now = Date.now()) {
  const g = state.game, today = dayKey(now);
  const week = weekKey(now);
  if (g.freezeWeek !== week) { g.freezes = Math.max(g.freezes, 1); g.freezeWeek = week; }
  if (g.lastDay === today) return g.streak;
  if (!g.lastDay) g.streak = 1;
  else {
    const gap = daysBetween(g.lastDay, today);
    if (gap === 1) g.streak += 1;
    else if (gap === 2 && g.freezes > 0) { g.freezes -= 1; g.streak += 1; }
    else g.streak = 1;
  }
  g.lastDay = today;
  g.best = Math.max(g.best, g.streak);
  return g.streak;
}

export function buyFreeze(state) {
  if (state.game.coins < 50) return false;
  state.game.coins -= 50; state.game.freezes += 1;
  return true;
}

export function weekKey(t = Date.now()) {
  const d = new Date(t); d.setHours(12, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // lunes = 0
  return dayKey(d.getTime() - day * DAY);
}

// Métricas agregadas del registro para retos y misiones
export function metrics(state, from, to = Date.now() + 1) {
  const m = { words: 0, reviews: 0, speakMin: 0, pron: 0, grammarLesson: 0, lessons: 0, read: 0, produce: 0, emails: 0, sec: 0, ok: 0, total: 0 };
  for (const e of state.log) {
    if (e.t < from || e.t >= to) continue;
    m.sec += e.sec || 0;
    if (e.kind === "word_new") m.words++;
    if (e.kind === "review") m.reviews++;
    if (e.kind === "speak") m.speakMin += (e.sec || 0) / 60;
    if (e.kind === "pron") m.pron++;
    if (e.kind === "lesson") { m.lessons++; if (e.lk === "grammar") m.grammarLesson++; }
    if (e.kind === "read") m.read++;
    if (e.kind === "answer") { m.total++; if (e.ok) m.ok++; if (e.ok && e.prod) m.produce++; }
    if (e.kind === "email") m.emails++;
  }
  m.speakMin = Math.round(m.speakMin * 10) / 10;
  return m;
}

export function dailyChallenge(state, now = Date.now()) {
  const rnd = seeded("daily" + dayKey(now));
  const ch = DAILY_CHALLENGES[Math.floor(rnd() * DAILY_CHALLENGES.length)];
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const m = metrics(state, start.getTime(), now + 1);
  const progress = Math.min(ch.target, Math.floor(m[ch.kind] || 0));
  return { ...ch, progress, done: progress >= ch.target };
}

export function weeklyMissions(state, now = Date.now()) {
  const start = new Date(weekKey(now) + "T00:00:00").getTime();
  const m = metrics(state, start, now + 1);
  return WEEKLY_MISSIONS.map((w) => ({ ...w, progress: Math.min(w.target, Math.floor(m[w.kind] || 0)), done: (m[w.kind] || 0) >= w.target }));
}

export const BADGES = [
  { id: "first-lesson", icon: "🎉", title: "First Lesson", es: "Primera lección", test: (s) => Object.values(s.lessons).some((l) => l.done) },
  { id: "first-conversation", icon: "💬", title: "First Conversation", es: "Primera conversación", test: (s) => s.conversations.length > 0 },
  { id: "placement", icon: "📝", title: "Placement Done", es: "Prueba de nivel", test: (s) => s.profile.placementDone },
  { id: "words-100", icon: "💯", title: "100 Words", es: "100 palabras", test: (s, v) => v.learned >= 100 },
  { id: "words-500", icon: "📚", title: "500 Words", es: "500 palabras", test: (s, v) => v.learned >= 500 },
  { id: "words-1000", icon: "🏛️", title: "1000 Words", es: "1000 palabras", test: (s, v) => v.learned >= 1000 },
  { id: "streak-7", icon: "🔥", title: "7-Day Streak", es: "Racha de 7 días", test: (s) => s.game.best >= 7 },
  { id: "streak-30", icon: "🌋", title: "30-Day Streak", es: "Racha de 30 días", test: (s) => s.game.best >= 30 },
  { id: "speak-30", icon: "🎙️", title: "30 Minutes Speaking", es: "30 minutos hablando", test: (s) => totalSpeak(s) >= 1800 },
  { id: "speak-300", icon: "📣", title: "5 Hours Speaking", es: "5 horas hablando", test: (s) => totalSpeak(s) >= 18000 },
  { id: "pro-meeting", icon: "🗓️", title: "First Professional Meeting", es: "Primera reunión profesional", test: (s) => s.conversations.some((c) => c.pro) },
  { id: "first-email", icon: "📧", title: "First Email", es: "Primer correo", test: (s) => s.emails > 0 },
  { id: "a2", icon: "🥉", title: "A2 Reached", es: "Nivel A2", test: (s) => ["A2", "B1", "B2", "C1", "C2"].includes(s.levels.overall) },
  { id: "b1", icon: "🥈", title: "B1 Reached", es: "Nivel B1", test: (s) => ["B1", "B2", "C1", "C2"].includes(s.levels.overall) },
  { id: "b2", icon: "🥇", title: "B2 Reached", es: "Nivel B2", test: (s) => ["B2", "C1", "C2"].includes(s.levels.overall) },
  { id: "mistake-hunter", icon: "🕵️", title: "Mistake Hunter", es: "Cazador de errores", test: (s) => s.mistakes.filter((m) => m.fixed).length >= 10 },
  { id: "perfect", icon: "⭐", title: "Perfect Lesson", es: "Lección perfecta", test: (s) => Object.values(s.lessons).some((l) => l.best >= 1) },
  { id: "pron-pro", icon: "👄", title: "Pronunciation Pro", es: "Pronunciación pro", test: (s) => Object.keys(s.skills).some((k) => k.startsWith("pr.") && s.skills[k].m >= 0.9) },
  { id: "grammar-master", icon: "🧩", title: "Grammar Master", es: "Maestro de gramática", test: (s) => Object.keys(s.skills).some((k) => k.startsWith("g.") && stateOf(s.skills[k]) === "MASTERED") },
  { id: "early-bird", icon: "🐦", title: "Early Bird", es: "Madrugador", test: (s) => s.log.some((e) => new Date(e.t).getHours() < 7) },
  { id: "night-owl", icon: "🦉", title: "Night Owl", es: "Búho nocturno", test: (s) => s.log.some((e) => new Date(e.t).getHours() >= 22) },
];

export function totalSpeak(s) { return Object.values(s.speaking).reduce((a, b) => a + b, 0); }

// Devuelve las insignias nuevas
export function checkBadges(state, now = Date.now()) {
  const v = vocabStats(state.vocab, now);
  const fresh = [];
  for (const b of BADGES) {
    if (!state.game.badges[b.id] && b.test(state, v)) { state.game.badges[b.id] = now; fresh.push(b); }
  }
  return fresh;
}

// Mensajes adultos y motivadores (sección 134)
export const PRAISE = ["Great improvement.", "You're getting more accurate.", "Nice work — that's the natural way to say it.", "Excellent. That structure is getting stronger.", "Well done.", "Exactly right."];
export const ENCOURAGE = ["Let's reinforce this one more time.", "Almost there — look at the rule.", "Good try. Mistakes are how the Brain learns.", "Close! Let's see what happened."];
