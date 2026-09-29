// HOME (sección 118): saludo, nivel, plan de hoy, continuar, reto diario, coach, racha, alerta de olvido.
import { esc, greeting, pct } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { buildPlan, recommendation, nextLesson, lessonTitle, notice } from "../../engine/planner.js";
import { forgetting } from "../../engine/brain.js";
import { dailyChallenge, playerLevel, xpForLevel } from "../../engine/gamification.js";
import { vocabStats } from "../../engine/srs.js";
import { CHARACTERS } from "../../content/characters.js";
import { render, on, progressBar, charCard } from "../components.js";
import { route, startPlan, session, go, nextBlock } from "../app.js";

export function registerHome() {
  route("/home", () => {
    const s = store.state, now = Date.now();
    const plan = buildPlan(s, C, now);
    const doneToday = s.daily.date === plan.date ? s.daily.done : [];
    const planDone = plan.blocks.length && plan.blocks.every((b) => doneToday.includes(b.id));
    const rec = recommendation(s, C, now);
    const next = nextLesson(s);
    const ch = dailyChallenge(s, now);
    const f = forgetting(s.skills, C.labels, now).filter((x) => C.catalog[x.id])[0];
    const vs = vocabStats(s.vocab, now);
    const pl = playerLevel(s.game.xp);
    const nova = CHARACTERS.nova;
    const v = render(`
      <div class="row between"><div><div class="muted small">${greeting(now)} 👋</div><h1 style="margin-top:0">${esc(s.profile.name || "Welcome back")}</h1></div>
        <a href="#/profile" class="kpi center" style="text-decoration:none;color:inherit"><span class="lvl" style="font-size:1.1rem">${s.levels.overall}</span><span>Current level</span></a></div>
      ${!s.profile.placementDone && s.profile.selfLevel !== "beginner" ? `<a class="banner" href="#/placement">📝 <span>Haz la prueba de nivel para personalizar tu ruta.</span></a>` : ""}
      ${s.settings.notifications ? `<div class="banner">🔔 <span>${esc(notice(s, C, now))}</span></div>` : ""}

      <div class="card hero">
        <div class="row between"><h2 style="margin:0;color:#fff">Today's Plan</h2><span class="small">${plan.total} min</span></div>
        <div class="muted small" style="margin-bottom:10px">This is what you should learn today.</div>
        <div class="list">${plan.blocks.map((b) => `<a class="item" href="${b.route}" style="background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.25);color:#fff"><span class="em">${doneToday.includes(b.id) ? "✅" : b.icon}</span><span class="grow"><span class="title">${esc(b.title)}</span><div class="sub" style="color:rgba(255,255,255,.8)">${esc(b.es)}</div></span><span class="small">${b.min} min</span></a>`).join("")}</div>
        <button class="btn hero big" style="margin-top:12px" data-plan>${planDone ? "✔ Plan completed · Practice more" : doneToday.length ? "Continue plan" : "Start"}</button>
      </div>

      ${f ? `<div class="card"><div class="row between"><b>🧠 ${esc(f.label)}</b><span class="pill st-FORGOTTEN">Forgetting</span></div>
        <div class="grid3 small" style="margin:8px 0"><div class="kpi"><b>${f.daysAgo}d</b><span>Last practiced</span></div><div class="kpi"><b>${pct(f.previous)}%</b><span>Previous mastery</span></div><div class="kpi"><b>${pct(f.estimated)}%</b><span>Estimated now</span></div></div>
        <a class="btn sm primary" href="${f.id.startsWith("g.") ? `#/grammar/${f.id}/practice` : "#/smart-review"}">${f.minutes}-minute review</a></div>` : ""}

      <h2>Continue Learning</h2>
      ${next ? `<a class="card tap" href="#/lesson/${encodeURIComponent(next.id)}"><div class="row between"><div><div class="muted small">${esc(next.unit.toUpperCase())} · ${esc(next.kind)}</div><b>${esc(lessonTitle(next, C))}</b></div><span class="btn sm primary">▶</span></div></a>` : `<div class="card">🎉 All lessons done at this level.</div>`}

      <div class="grid2" style="margin-top:12px"><a class="tile" href="#/syllabus"><span class="em">📖</span><b>Temario</b><span>Todo el curso A1–C2</span></a><a class="tile" href="#/tests"><span class="em">📝</span><b>Test Center</b><span>Mide tu nivel 0–100</span></a></div>

      <h2>Daily Challenge</h2>
      <div class="card"><div class="row between"><b>${ch.done ? "✅" : "🎯"} ${esc(ch.text)}</b><span class="small muted">${ch.progress}/${ch.target}</span></div><div class="small muted">${esc(ch.es)}</div>${progressBar(ch.progress / ch.target, true)}</div>

      <h2>Your coach recommends</h2>
      ${charCard(nova, esc(rec.text), rec.blocks.map((b) => `${b.title} – ${b.min} min`).join(" · "))}

      <div class="grid3" style="margin-top:12px">
        <a class="card tap center" href="#/achievements"><div style="font-size:1.6rem">🔥</div><b>${s.game.streak}</b><div class="small muted">day streak</div></a>
        <a class="card tap center" href="#/vocab"><div style="font-size:1.6rem">📚</div><b>${vs.learned}</b><div class="small muted">words · ${vs.due} due</div></a>
        <a class="card tap center" href="#/profile"><div style="font-size:1.6rem">⭐</div><b>Lv ${pl}</b><div class="small muted">${s.game.xp - xpForLevel(pl)}/${xpForLevel(pl + 1) - xpForLevel(pl)} XP</div></a>
      </div>`);
    on(v, "click", "[data-plan]", () => {
      if (planDone) return go("#/practice");
      if (session.plan && session.plan.date === plan.date) return nextBlock();
      startPlan(plan);
    });
  });

  route("/plan/done", () => {
    render(`<div class="center" style="padding-top:24px"><div class="emoji-big">🏁</div><h1>Today's plan completed!</h1><p class="muted">Great work. Your Brain has been updated. Tomorrow's plan will focus on what you need next.</p></div>
      <div class="stack"><a class="btn primary big" href="#/reports">See my progress</a><a class="btn big" href="#/practice">Practice more</a><a class="btn ghost big" href="#/home">Home</a></div>`);
  });
}
