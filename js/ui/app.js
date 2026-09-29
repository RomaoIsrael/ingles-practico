// Router por hash, sesión del plan diario y pantalla de fin de actividad.
import { esc } from "../core/util.js";
import { store } from "../core/store.js";
import { render, on, confetti, closeSheet } from "./components.js";

const routes = [];
export function route(pattern, handler) {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "/?$");
  routes.push({ re, keys, handler });
}

export function go(hash) {
  if (location.hash === hash) dispatch(); else location.hash = hash;
}

export function dispatch() {
  const s = store.state;
  closeSheet();
  let h = location.hash.slice(1) || "/home";
  if (!s.profile.onboarded && !h.startsWith("/welcome") && !h.startsWith("/onboarding") && !h.startsWith("/placement")) h = "/welcome";
  const path = h.split("?")[0];
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", h.startsWith(a.dataset.tab)));
      document.body.dataset.route = h.split("/")[1];
      try { r.handler(params); } catch (e) { console.error(e); render(`<div class="card"><h2>Something went wrong</h2><p class="muted">${esc(e.message)}</p><a class="btn" href="#/home">Home</a></div>`); }
      return;
    }
  }
  go("#/home");
}

// ── Plan diario en ejecución (sección 98) ──
export const session = { plan: null, idx: 0 };

export function startPlan(plan) {
  session.plan = plan; session.idx = 0;
  store.state.daily = { date: plan.date, blocks: plan.blocks, done: store.state.daily.date === plan.date ? store.state.daily.done : [] };
  store.save();
  nextBlock();
}
export function nextBlock() {
  const p = session.plan;
  if (!p) return go("#/home");
  const done = new Set(store.state.daily.done);
  const b = p.blocks.find((x) => !done.has(x.id));
  if (!b) { session.plan = null; return go("#/plan/done"); }
  session.current = b.id;
  go(b.route);
}
export function markBlockDone() {
  if (!session.plan || !session.current) return false;
  const d = store.state.daily;
  if (!d.done.includes(session.current)) d.done.push(session.current);
  store.save();
  return true;
}

// Pantalla estándar de fin de actividad
export function finishScreen({ title = "Well done!", emoji = "🎉", lines = [], stars = 0, next = "#/home", nextLabel = "Continue", extra = "" }) {
  const inPlan = markBlockDone();
  const v = render(`
    <div class="center" style="padding-top:20px">
      <div class="emoji-big">${emoji}</div>
      <h1>${esc(title)}</h1>
      ${stars ? `<div style="font-size:2rem">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>` : ""}
    </div>
    <div class="card">${lines.map((l) => `<div class="row between"><span class="muted">${esc(l[0])}</span><b>${esc(l[1])}</b></div>`).join("<hr>")}</div>
    ${extra}
    <div style="margin-top:16px" class="stack">
      ${inPlan ? `<button class="btn primary big" data-nextblock>Next in today's plan →</button>` : `<a class="btn primary big" href="${next}">${esc(nextLabel)}</a>`}
      <a class="btn big ghost" href="#/home">Home</a>
    </div>`);
  on(v, "click", "[data-nextblock]", () => nextBlock());
  if (stars >= 2 || title.includes("Level")) confetti();
  return v;
}
