// Componentes reutilizables (sección 169). Renderizan HTML como texto; los eventos se conectan por delegación.
import { esc, pct, clamp } from "../core/util.js";
import { speak, stopSpeaking } from "../services/speech.js";
import { store } from "../core/store.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const view = () => document.getElementById("view");

export function render(html) {
  stopSpeaking();
  // Un contenedor nuevo por pantalla: los eventos delegados mueren con él
  const scr = document.createElement("div");
  scr.className = "scr";
  scr.innerHTML = html;
  view().replaceChildren(scr);
  window.scrollTo(0, 0);
  const h = scr.querySelector("h1, h2, .prompt");
  if (h) h.setAttribute("tabindex", "-1");
  return scr;
}

// Delegación de eventos: on(root, 'click', '[data-go]', (el, ev) => …)
export function on(root, type, sel, fn) {
  root.addEventListener(type, (ev) => {
    const el = ev.target.closest(sel);
    if (el && root.contains(el)) fn(el, ev);
  });
}

export const progressBar = (x, thin = false) => `<div class="bar${thin ? " thin" : ""}" role="progressbar" aria-valuenow="${pct(x)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct(x)}%"></i></div>`;
export const statePill = (state) => `<span class="pill st-${state}">${state}</span>`;
export const bucketPill = (b) => `<span class="pill b-${b}">${b}</span>`;
export const lvl = (l) => `<span class="lvl">${esc(l)}</span>`;

export function audioBtn(text, { label = "🔊", cls = "iconbtn", slow = false } = {}) {
  return `<button class="${cls}" data-say="${esc(text)}" ${slow ? 'data-slow="1"' : ""} aria-label="Escuchar: ${esc(text)}" title="Escuchar">${label}</button>`;
}

export function speedPicker() {
  const r = store.state.settings.audioRate;
  return `<div class="chips" role="group" aria-label="Velocidad de audio">${[0.5, 0.75, 1, 1.25].map((x) => `<button class="chip ${x === r ? "on" : ""}" data-rate="${x}">${x}x</button>`).join("")}</div>`;
}

// Conecta botones de audio / velocidad globalmente (una sola vez)
export function wireGlobalAudio() {
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-say]");
    if (b) {
      const s = store.state.settings;
      speak(b.dataset.say, { rate: b.dataset.slow ? Math.min(0.75, s.audioRate) : s.audioRate, accent: store.state.profile.accent });
    }
    const r = ev.target.closest("[data-rate]");
    if (r) {
      store.state.settings.audioRate = +r.dataset.rate;
      store.save();
      r.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === r));
    }
  });
}

export function toast(msg, ms = 2400) {
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

export function openSheet(html, { onClose } = {}) {
  closeSheet();
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.id = "sheet";
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest("[data-close]")) closeSheet(onClose); });
  document.body.appendChild(bg);
  const f = bg.querySelector("input, textarea, button");
  if (f) setTimeout(() => f.focus(), 50);
  return bg.firstElementChild;
}
export function closeSheet(cb) {
  const s = document.getElementById("sheet");
  if (s) { s.remove(); if (cb) cb(); }
}

export function confetti() {
  if (store.state.settings.reducedMotion) return;
  const c = document.createElement("div");
  c.className = "confetti";
  const colors = ["#4F46E5", "#06B6D4", "#16A34A", "#F59E0B", "#EC4899"];
  c.innerHTML = Array.from({ length: 40 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${colors[i % 5]};animation-delay:${Math.random() * 0.5}s"></i>`).join("");
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 2400);
}

export function backLink(href = "#/home", label = "Back") {
  return `<a class="btn ghost sm" href="${href}" aria-label="Volver">← ${esc(label)}</a>`;
}

// ── Gráficas SVG (sección 155) ──
export function radarChart(data, size = 280) {
  const keys = Object.keys(data), n = keys.length, cx = size / 2, cy = size / 2, r = size / 2 - 44;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v]; };
  const rings = [0.25, 0.5, 0.75, 1].map((k) => `<polygon class="grid" points="${keys.map((_, i) => pt(i, k).join(",")).join(" ")}"/>`).join("");
  const axes = keys.map((_, i) => `<line class="grid" x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}"/>`).join("");
  const poly = `<polygon class="area" points="${keys.map((k, i) => pt(i, clamp(data[k], 0.02, 1)).join(",")).join(" ")}"/>`;
  const labels = keys.map((k, i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(k)} ${pct(data[k])}%</text>`; }).join("");
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" role="img" aria-label="Skill radar: ${keys.map((k) => `${k} ${pct(data[k])}%`).join(", ")}">${rings}${axes}${poly}${labels}</svg>`;
}

export function barChart(items, { h = 140, unit = "" } = {}) {
  const w = 320, max = Math.max(1, ...items.map((i) => i.v)), bw = (w - 20) / items.length;
  const bars = items.map((it, i) => {
    const bh = ((h - 34) * it.v) / max, x = 10 + i * bw + bw * 0.18, y = h - 20 - bh;
    return `<rect class="barr" x="${x}" y="${y}" width="${bw * 0.64}" height="${Math.max(1, bh)}" rx="4"/><text x="${x + bw * 0.32}" y="${h - 6}" text-anchor="middle">${esc(it.l)}</text>${it.v ? `<text x="${x + bw * 0.32}" y="${y - 4}" text-anchor="middle">${it.v}${unit}</text>` : ""}`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${items.map((i) => `${i.l}: ${i.v}${unit}`).join(", ")}">${bars}</svg>`;
}

export function lineChart(series, { h = 150, labels = [] } = {}) {
  const w = 320, pad = 24, all = series.flatMap((s) => s.v), max = Math.max(1, ...all);
  const n = Math.max(...series.map((s) => s.v.length));
  const x = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, n - 1), y = (v) => h - 22 - ((h - 40) * v) / max;
  const lines = series.map((s, si) => `<polyline class="line" style="stroke:${si ? "var(--primary)" : "var(--accent)"}" points="${s.v.map((v, i) => `${x(i)},${y(v)}`).join(" ")}"/>` + s.v.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${si ? "var(--primary)" : "var(--accent)"}"/>`).join("")).join("");
  const lab = labels.map((l, i) => `<text x="${x(i)}" y="${h - 6}" text-anchor="middle">${esc(l)}</text>`).join("");
  const legend = series.map((s, si) => `<text x="${pad + si * 120}" y="12" style="fill:${si ? "var(--primary)" : "var(--accent)"}">● ${esc(s.name)}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${series.map((s) => s.name + ": " + s.v.join(", ")).join("; ")}">${legend}${lines}${lab}</svg>`;
}

export function charCard(ch, text, sub = "") {
  return `<div class="card soft"><div class="who"><div class="avatar" style="background:${ch.color}22">${ch.emoji}</div><div><b>${esc(ch.name)}</b> <span class="muted small">· ${esc(ch.role)}</span><div>${text}</div>${sub ? `<div class="muted small">${sub}</div>` : ""}</div></div></div>`;
}

// Traducciones visibles u ocultas según Immersion Mode (sección 105)
export function tr(es) {
  if (!es) return "";
  if (store.state.settings.immersion) return `<details class="small muted"><summary>Show translation</summary>${esc(es)}</details>`;
  return `<div class="small muted">${esc(es)}</div>`;
}

// Texto con palabras tocables (Smart Reading, sección 41)
export function tappable(text, known = () => false) {
  return esc(text).replace(/[A-Za-z][A-Za-z'’-]*/g, (w) => `<span class="w${known(w) ? " known" : ""}" data-word="${w}">${w}</span>`).replace(/\n/g, "<br>");
}

// Caja de instrucciones paso a paso (didáctica): título, pasos numerados y ejemplo opcional
export function howTo(title, steps, { example = "", open = false } = {}) {
  return `<details class="howto" ${open ? "open" : ""}><summary>📝 ${esc(title)}</summary><ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>${example ? `<div class="small"><b>Ejemplo:</b> ${example}</div>` : ""}</details>`;
}

// Tabla genérica {title?, cols, rows}
export function table(t) {
  if (!t) return "";
  return `${t.title ? `<h4 class="tt">${esc(t.title)}</h4>` : ""}<div class="tscroll"><table class="t grid"><thead><tr>${t.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<b>${esc(c)}</b>` : esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

// Secciones de los apuntes profundos de gramática. Devuelve [{id, title, html}]
export function deepSections(g) {
  const d = g.deep;
  if (!d) return [];
  const out = [];
  out.push({ id: "intro", icon: "💡", title: "¿Qué es y para qué sirve?", html: `<p class="lead">${esc(d.intro)}</p>` });
  out.push({ id: "form", icon: "🧱", title: "La forma (cómo se construye)", html: table(d.form) + table(d.form2) + table(d.form3) });
  if (d.uses?.length) out.push({ id: "uses", icon: "🎯", title: "¿Cuándo se usa?", html: `<div class="list">${d.uses.map(([u, en, es]) => `<div class="usecard"><div class="small muted">${esc(u)}</div><div><b>${esc(en)}</b> <button class="iconbtn sm" data-say="${esc(en)}" aria-label="Escuchar">🔊</button></div>${es ? `<div class="small">${esc(es)}</div>` : ""}</div>`).join("")}</div>` });
  if (d.spelling?.length) out.push({ id: "spelling", icon: "✏️", title: "Reglas de ortografía", html: `<ul>${d.spelling.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` });
  if (d.signals?.length) out.push({ id: "signals", icon: "🚦", title: "Palabras señal (te avisan qué tiempo usar)", html: `<div class="chips">${d.signals.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>` });
  if (d.mistakes?.length) out.push({ id: "mistakes", icon: "⚠️", title: "Errores comunes (¡evítalos!)", html: `<div class="list">${d.mistakes.map(([w, r, why]) => `<div class="mistake"><div>❌ <s>${esc(w)}</s></div><div>✅ <b>${esc(r)}</b></div><div class="small muted">${esc(why)}</div></div>`).join("")}</div>` });
  if (d.spanish) out.push({ id: "spanish", icon: "🇪🇸", title: "Comparación con el español", html: `<p>${esc(d.spanish)}</p>` });
  if (d.tips?.length) out.push({ id: "tips", icon: "🧠", title: "Trucos para recordar", html: `<ul>${d.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` });
  return out;
}
