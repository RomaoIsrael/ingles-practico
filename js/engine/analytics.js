// Reportes semanales y mensuales (secciones 101-102, 154). Calculados localmente.
import { DAY, dayKey } from "../core/util.js";
import { metrics } from "./gamification.js";
import { current, trend, avg } from "./brain.js";
import { vocabStats } from "./srs.js";

export function weeklyReport(state, C, now = Date.now()) {
  const from = now - 7 * DAY;
  const m = metrics(state, from, now + 1);
  const words = Object.values(state.vocab).filter((c) => c.added >= from).length;
  const gAns = state.log.filter((e) => e.t >= from && e.kind === "answer" && String(e.skill).startsWith("g."));
  const pron = state.log.filter((e) => e.t >= from && e.kind === "pron").map((e) => e.score || 0);
  let speakSec = 0;
  for (let i = 0; i < 7; i++) speakSec += state.speaking[dayKey(now - i * DAY)] || 0;
  const tr = Object.keys(state.skills).filter((id) => C.catalog[id] && state.skills[id].n >= 2).map((id) => [id, trend(state.skills[id], 7, now)]);
  const best = tr.sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.keys(state.skills).filter((id) => C.catalog[id] && state.skills[id].n >= 2).map((id) => [id, current(state.skills[id], now)]).sort((a, b) => a[1] - b[1])[0];
  return {
    studySec: m.sec, lessons: m.lessons, words, speakSec,
    grammarAccuracy: gAns.length ? gAns.filter((e) => e.ok).length / gAns.length : null,
    pronScore: pron.length ? avg(pron) : null,
    improvement: best && best[1] > 0 ? { id: best[0], label: C.labels[best[0]], delta: best[1] } : null,
    weakness: weakest ? { id: weakest[0], label: C.labels[weakest[0]], value: weakest[1] } : null,
    daily: Array.from({ length: 7 }, (_, i) => {
      const d = now - (6 - i) * DAY, k = dayKey(d);
      const s = new Date(d); s.setHours(0, 0, 0, 0);
      return { day: k, label: new Date(d).toLocaleDateString("en", { weekday: "short" }), min: Math.round(metrics(state, s.getTime(), s.getTime() + DAY).sec / 60) };
    }),
  };
}

export function monthlyReport(state, C, now = Date.now()) {
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const to = now - w * 7 * DAY, from = to - 7 * DAY;
    const m = metrics(state, from, to);
    const lAns = state.log.filter((e) => e.t >= from && e.t < to && e.kind === "answer" && e.skill === "sk.listening");
    let sp = 0;
    for (let i = 0; i < 7; i++) sp += state.speaking[dayKey(to - 1 - i * DAY)] || 0;
    weeks.push({
      label: `W${4 - w}`, studyMin: Math.round(m.sec / 60),
      words: Object.values(state.vocab).filter((c) => c.added < to).length,
      speakMin: Math.round(sp / 60),
      listening: lAns.length ? Math.round((100 * lAns.filter((e) => e.ok).length) / lAns.length) : 0,
    });
  }
  const pro = Object.keys(state.skills).filter((id) => id.startsWith("p.") || id.startsWith("b.") || C.catalog[id]?.cat === "professional");
  const hist = state.levels.history;
  return {
    weeks,
    currentLevel: state.levels.overall,
    previousLevel: hist.length > 1 ? hist[hist.length - 2].overall : hist[0]?.overall || state.levels.overall,
    vocab: vocabStats(state.vocab, now),
    speaking: { now: current(state.skills["sk.speaking"], now), trend: trend(state.skills["sk.speaking"], 30, now) },
    listening: { now: current(state.skills["sk.listening"], now), trend: trend(state.skills["sk.listening"], 30, now) },
    professional: pro.length ? avg(pro.map((id) => current(state.skills[id], now))) : 0,
  };
}
