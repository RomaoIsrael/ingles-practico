// PROFILE (secciones 8-9, 101-102, 123-127, 155-159, 170, 179): Brain, Knowledge Map, reportes, logros, ajustes y privacidad.
import { esc, pct, fmtMin, LEVELS } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C, search, loadContent, validatePack } from "../../content/registry.js";
import { current, stateOf, bucketOf, radar, BUCKETS, STATES, forgetting } from "../../engine/brain.js";
import { vocabStats } from "../../engine/srs.js";
import { weeklyReport, monthlyReport } from "../../engine/analytics.js";
import { BADGES, playerLevel, xpForLevel, weeklyMissions, buyFreeze, totalSpeak } from "../../engine/gamification.js";
import { buildPlan } from "../../engine/planner.js";
import { PHRASAL_VERBS, IDIOMS } from "../../content/extras.js";
import { render, on, progressBar, statePill, bucketPill, radarChart, barChart, lineChart, $, toast, backLink } from "../components.js";
import { route, go } from "../app.js";
import { applyPrefs } from "../prefs.js";
import { PROFESSIONS, GOALS } from "./onboarding.js";

const CATS = [["grammar", "Grammar"], ["vocabulary", "Vocabulary"], ["speaking", "Speaking"], ["listening", "Listening"], ["reading", "Reading"], ["writing", "Writing"], ["pronunciation", "Pronunciation"], ["professional", "Professional English"], ["business", "Business English"]];
const BUCKET_COLOR = { Mastered: "var(--st-mastered)", Strong: "var(--st-strong)", Learning: "var(--st-learning)", Weak: "var(--st-weak)", New: "var(--st-new)" };

export function registerProfile() {
  route("/profile", () => {
    const s = store.state, vs = vocabStats(s.vocab), pl = playerLevel(s.game.xp);
    const studySec = s.log.reduce((a, e) => a + (e.sec || 0), 0);
    const p = s.profile;
    render(`<div class="row between"><div><h1>${esc(p.name || "My profile")}</h1><div class="muted small">${esc([p.professions.primary, p.professions.secondary, ...p.professions.extra].filter(Boolean).join(" + ") || "General English")} · ${p.accent === "uk" ? "🇬🇧" : "🇺🇸"}</div></div><span class="lvl" style="font-size:1.3rem;height:40px">${s.levels.overall}</span></div>
      <div class="grid3" style="margin-top:12px">
        <div class="card"><div class="kpi"><b>Lv ${pl}</b><span>${s.game.xp} XP</span></div>${progressBar((s.game.xp - xpForLevel(pl)) / (xpForLevel(pl + 1) - xpForLevel(pl)), true)}</div>
        <div class="card"><div class="kpi"><b>🔥 ${s.game.streak}</b><span>Streak · best ${s.game.best}</span></div></div>
        <div class="card"><div class="kpi"><b>🪙 ${s.game.coins}</b><span>Coins · 🧊 ${s.game.freezes}</span></div></div>
        <div class="card"><div class="kpi"><b>${vs.learned}</b><span>Words</span></div></div>
        <div class="card"><div class="kpi"><b>${fmtMin(studySec)}</b><span>Study time</span></div></div>
        <div class="card"><div class="kpi"><b>${Object.keys(s.game.badges).length}</b><span>Achievements</span></div></div>
      </div>
      <h2>Skills</h2><div class="card">${radarChart(radar(s, C.catalog))}</div>
      <div class="card soft"><table class="t">${["overall", "grammar", "vocabulary", "speaking", "listening", "reading", "writing", "pronunciation"].map((k) => `<tr><td>${k[0].toUpperCase() + k.slice(1)}</td><td><span class="lvl">${s.levels[k]}</span></td></tr>`).join("")}</table></div>
      <div class="grid2" style="margin-top:12px">
        <a class="tile" href="#/brain"><span class="em">🧠</span><b>My English Brain</b><span>Mastery per concept</span></a>
        <a class="tile" href="#/map"><span class="em">🗺️</span><b>Knowledge Map</b><span>Mastered → New</span></a>
        <a class="tile" href="#/reports"><span class="em">📊</span><b>Reports</b><span>Weekly · Monthly</span></a>
        <a class="tile" href="#/achievements"><span class="em">🏅</span><b>Achievements</b><span>Badges · missions</span></a>
        <a class="tile" href="#/pro"><span class="em">💼</span><b>Professional profile</b><span>Routes & dashboard</span></a>
        <a class="tile" href="#/goals"><span class="em">🎯</span><b>Goals</b><span>${p.dailyMinutes} min/day · target ${p.targetLevel}</span></a>
        <a class="tile" href="#/favorites"><span class="em">⭐</span><b>Favorites & notes</b><span>${s.favorites.length} · ${s.notes.length}</span></a>
        <a class="tile" href="#/settings"><span class="em">⚙️</span><b>Settings</b><span>Theme · accessibility · AI</span></a>
      </div>`);
  });

  // MY ENGLISH BRAIN (secciones 8, 185)
  route("/brain", () => {
    const s = store.state, now = Date.now();
    const cat = location.hash.split("?cat=")[1] || "all";
    const ids = Object.keys(C.catalog).filter((id) => cat === "all" || C.catalog[id].cat === cat);
    const rows = ids.map((id) => ({ id, c: C.catalog[id], r: s.skills[id], v: current(s.skills[id], now) })).sort((a, b) => (b.r ? 1 : 0) - (a.r ? 1 : 0) || b.v - a.v);
    const f = forgetting(s.skills, C.labels, now);
    render(`${backLink("#/profile", "Profile")}<h1>🧠 My English Brain</h1><p class="muted small">Tu dominio real de cada concepto, recalculado con cada respuesta y con el paso del tiempo (olvido).</p>
      <div class="tabs"><a class="chip ${cat === "all" ? "on" : ""}" href="#/brain">All</a>${CATS.map(([k, l]) => `<a class="chip ${cat === k ? "on" : ""}" href="#/brain?cat=${k}">${l}</a>`).join("")}</div>
      ${f.length ? `<div class="card" style="margin-top:12px"><b>🧊 Intelligent Forgetting</b>${f.slice(0, 4).map((x) => `<div class="row between small" style="margin-top:6px"><span>${esc(x.label)} · ${x.daysAgo}d ago</span><span>${pct(x.previous)}% → <b>${pct(x.estimated)}%</b></span></div>`).join("")}</div>` : ""}
      <div class="list" style="margin-top:12px">${rows.map(({ id, c, r, v }) => `<a class="item" href="${id.startsWith("g.") ? `#/grammar/${id}` : id.startsWith("v.") ? `#/vocab/topic/${id.slice(2)}` : id.startsWith("pr.") ? `#/pron/${id}` : "#/practice"}"><span class="em">${c.icon || "•"}</span><span class="grow"><span class="title">${esc(c.label)} <span class="muted small">${c.level || ""}</span></span>${progressBar(v, true)}</span><span class="small"><b>${r ? pct(v) + "%" : ""}</b></span>${statePill(stateOf(r, now))}</a>`).join("")}</div>
      <p class="small muted">Estados: ${STATES.join(" → ")}. MASTERED exige acierto en 3 contextos, en días separados y producción activa.</p>`);
  });

  // KNOWLEDGE MAP (sección 9)
  route("/map", () => {
    const s = store.state, now = Date.now();
    const counts = Object.fromEntries(BUCKETS.map((b) => [b, 0]));
    const sections = CATS.map(([k, label]) => {
      const ids = Object.keys(C.catalog).filter((id) => C.catalog[id].cat === k);
      if (!ids.length) return "";
      return `<h2>${label}</h2><div class="kmap">${ids.map((id) => { const b = bucketOf(s.skills[id], now); counts[b]++; return `<a class="kcell" style="background:${BUCKET_COLOR[b]}" href="${id.startsWith("g.") ? `#/grammar/${id}` : id.startsWith("v.") ? `#/vocab/topic/${id.slice(2)}` : "#/brain"}" title="${esc(C.catalog[id].label)}: ${b}"><span>${C.catalog[id].icon || ""} ${esc(C.catalog[id].label)}</span><small>${b}${s.skills[id] ? " · " + pct(current(s.skills[id], now)) + "%" : ""}</small></a>`; }).join("")}</div>`;
    }).join("");
    render(`${backLink("#/profile", "Profile")}<h1>🗺️ Knowledge Map</h1><div class="chips" id="legend"></div>${sections}`);
    $("#legend").innerHTML = BUCKETS.map((b) => `<span class="chip">${bucketPill(b)} ${counts[b]}</span>`).join("");
  });

  route("/reports", () => {
    const s = store.state;
    const w = weeklyReport(s, C), m = monthlyReport(s, C);
    const plan = buildPlan(s, C);
    render(`${backLink("#/profile", "Profile")}<h1>📊 Reports</h1>
      <h2>Weekly report</h2><div class="card">${barChart(w.daily.map((d) => ({ l: d.label, v: d.min })), { unit: "m" })}
        <table class="t">
          <tr><td>Study time</td><td><b>${fmtMin(w.studySec)}</b></td></tr><tr><td>Lessons</td><td><b>${w.lessons}</b></td></tr>
          <tr><td>Words learned</td><td><b>${w.words}</b></td></tr><tr><td>Speaking time</td><td><b>${fmtMin(w.speakSec)}</b></td></tr>
          <tr><td>Grammar accuracy</td><td><b>${w.grammarAccuracy == null ? "—" : pct(w.grammarAccuracy) + "%"}</b></td></tr>
          <tr><td>Pronunciation score</td><td><b>${w.pronScore == null ? "—" : pct(w.pronScore) + "%"}</b></td></tr>
          <tr><td>Main improvement</td><td><b>${w.improvement ? `${esc(w.improvement.label)} (+${pct(w.improvement.delta)}%)` : "—"}</b></td></tr>
          <tr><td>Main weakness</td><td><b>${w.weakness ? `${esc(w.weakness.label)} (${pct(w.weakness.value)}%)` : "—"}</b></td></tr>
          <tr><td>Recommended focus</td><td><b>${plan.blocks.slice(0, 2).map((b) => esc(b.title)).join(" · ")}</b></td></tr></table></div>
      <h2>Monthly report</h2><div class="card">
        <div class="row between"><span>Current level <span class="lvl">${m.currentLevel}</span></span><span class="muted">Previous <span class="lvl">${m.previousLevel}</span></span></div>
        ${lineChart([{ name: "Study min", v: m.weeks.map((x) => x.studyMin) }, { name: "Speaking min", v: m.weeks.map((x) => x.speakMin) }], { labels: m.weeks.map((x) => x.label) })}
        ${lineChart([{ name: "Vocabulary growth", v: m.weeks.map((x) => x.words) }, { name: "Listening %", v: m.weeks.map((x) => x.listening) }], { labels: m.weeks.map((x) => x.label) })}
        <table class="t"><tr><td>Speaking</td><td><b>${pct(m.speaking.now)}%</b> <span class="muted">(${m.speaking.trend >= 0 ? "+" : "-"}${pct(Math.abs(m.speaking.trend))}% this month)</span></td></tr>
          <tr><td>Listening</td><td><b>${pct(m.listening.now)}%</b> <span class="muted">(${m.listening.trend >= 0 ? "+" : "-"}${pct(Math.abs(m.listening.trend))}%)</span></td></tr>
          <tr><td>Professional English</td><td><b>${pct(m.professional)}%</b></td></tr><tr><td>Words mastered</td><td><b>${m.vocab.mastered}</b> / ${m.vocab.learned}</td></tr></table></div>
      <div class="stack" style="margin-top:12px"><a class="btn big" href="#/exam/weekly">🏁 Weekly assessment</a><a class="btn big" href="#/placement">🔄 Placement reassessment</a></div>`);
  });

  route("/achievements", () => {
    const s = store.state;
    const wm = weeklyMissions(s);
    const v = render(`${backLink("#/profile", "Profile")}<h1>🏅 Achievements</h1>
      <div class="card"><div class="row between"><b>🔥 Streak ${s.game.streak} days</b><span class="small muted">🧊 Streak freezes: ${s.game.freezes}</span></div><div class="small muted">Un protector gratuito por semana cubre un día perdido. Compra más con 50 monedas.</div><button class="btn sm" data-freeze style="margin-top:8px">Buy freeze (🪙 50)</button></div>
      <h2>Weekly mission</h2><div class="list">${wm.map((m) => `<div class="card soft"><div class="row between"><b>${m.done ? "✅" : "🎯"} ${esc(m.text)}</b><span class="small">${m.progress}/${m.target}</span></div>${progressBar(m.progress / m.target, true)}</div>`).join("")}</div>
      <h2>Badges</h2><div class="grid3">${BADGES.map((b) => { const got = s.game.badges[b.id]; return `<div class="card center" style="${got ? "" : "opacity:.45"}"><div style="font-size:2rem">${b.icon}</div><b class="small">${esc(b.title)}</b><div class="small muted">${got ? new Date(got).toLocaleDateString() : esc(b.es)}</div></div>`; }).join("")}</div>`);
    on(v, "click", "[data-freeze]", () => { if (buyFreeze(s)) { store.save(); toast("Streak freeze purchased 🧊"); go("#/achievements"); } else toast("Not enough coins"); });
  });

  route("/goals", () => {
    const s = store.state, p = s.profile;
    const v = render(`${backLink("#/profile", "Profile")}<h1>🎯 Goals & professional profile</h1>
      <h3>Daily time</h3><div class="chips">${[5, 10, 15, 20, 30, 45, 60].map((m) => `<button class="chip ${p.dailyMinutes === m ? "on" : ""}" data-min="${m}">${m} min</button>`).join("")}</div>
      <h3 style="margin-top:14px">Target level</h3><div class="chips">${LEVELS.map((l) => `<button class="chip ${p.targetLevel === l ? "on" : ""}" data-tl="${l}">${l}</button>`).join("")}</div>
      <h3 style="margin-top:14px">Why are you learning?</h3><div class="chips">${GOALS.map((g) => `<button class="chip ${p.goals.includes(g) ? "on" : ""}" data-goal="${esc(g)}">${esc(g)}</button>`).join("")}</div>
      <h3 style="margin-top:14px">Professions</h3><a class="btn" href="#/onboarding/6">Edit professions</a>`);
    on(v, "click", "[data-min]", (el) => { p.dailyMinutes = +el.dataset.min; store.save(); go("#/goals"); });
    on(v, "click", "[data-tl]", (el) => { p.targetLevel = el.dataset.tl; store.save(); go("#/goals"); });
    on(v, "click", "[data-goal]", (el) => { const g = el.dataset.goal, i = p.goals.indexOf(g); if (i >= 0) p.goals.splice(i, 1); else p.goals.push(g); store.save(); el.classList.toggle("on"); });
  });

  route("/favorites", () => {
    const s = store.state;
    const v = render(`${backLink("#/profile", "Profile")}<h1>⭐ Favorites</h1>
      <div class="list">${s.favorites.map((f) => `<a class="item" href="${f.type === "word" ? "#/word/" + f.id : "#/grammar/" + f.id}"><span class="em">${f.type === "word" ? "📚" : "🧩"}</span><span class="grow title">${esc(f.label)}</span></a>`).join("") || `<div class="muted">Usa ☆ Favorite en palabras y temas de gramática.</div>`}</div>
      <h2>📝 Personal notes</h2><div class="list">${s.notes.map((n) => `<div class="card soft"><div class="small muted">${esc(n.label || "")} · ${new Date(n.t).toLocaleDateString()}</div><div style="white-space:pre-wrap">${esc(n.text)}</div><button class="btn sm ghost" data-del="${n.id}">Delete</button></div>`).join("") || `<div class="muted">Aún no tienes notas.</div>`}</div>
      <h3 style="margin-top:14px">New note</h3><textarea class="inp" id="nt" rows="3"></textarea><button class="btn primary" data-add style="margin-top:8px">Save note</button>`);
    on(v, "click", "[data-del]", (el) => { s.notes = s.notes.filter((n) => n.id !== el.dataset.del); store.save(); go("#/favorites"); });
    on(v, "click", "[data-add]", () => { const t = $("#nt", v).value.trim(); if (t) { s.notes.push({ id: Date.now().toString(36), t: Date.now(), text: t, label: "General" }); store.save(); go("#/favorites"); } });
  });

  route("/settings", () => settings());
  route("/privacy", () => privacy());

  route("/search", () => {
    const v = render(`<h1>🔎 Search</h1><input class="inp" id="q" placeholder="Words, grammar, lessons, idioms, phrasal verbs, professional topics…" autocomplete="off"><div class="list" id="r" style="margin-top:12px"></div>`);
    const q = $("#q", v);
    const hrefFor = (x) => ({ word: `#/word/${x.id}`, grammar: `#/grammar/${x.id}`, reading: `#/read/${x.id}`, scenario: `#/roleplay/${x.id}`, phrasal: "#/library/phrasal", idiom: "#/library/idioms" })[x.type] || "#/practice";
    q.addEventListener("input", () => {
      const res = search(q.value, { phrasal: PHRASAL_VERBS, idiom: IDIOMS });
      $("#r", v).innerHTML = res.map((x) => `<a class="item" href="${hrefFor(x)}"><span class="grow"><span class="title">${esc(x.label)}</span><div class="sub">${esc(x.type)} · ${esc(x.sub)}</div></span></a>`).join("");
    });
    q.focus();
  });
}

function settings() {
  const s = store.state, st = s.settings;
  const opt = (name, val, cur, label) => `<button class="chip ${cur === val ? "on" : ""}" data-set="${name}" data-val="${val}">${label}</button>`;
  const v = render(`${backLink("#/profile", "Profile")}<h1>⚙️ Settings</h1>
    <h2>Appearance</h2><div class="card stack">
      <div><b>Theme</b><div class="chips">${opt("theme", "light", st.theme, "☀️ Light")}${opt("theme", "dark", st.theme, "🌙 Dark")}${opt("theme", "system", st.theme, "🖥️ System")}</div></div>
      <div><b>Text size</b><div class="chips">${[[0.9, "A−"], [1, "A"], [1.15, "A+"], [1.3, "A++"]].map(([x, l]) => opt("textSize", x, st.textSize, l)).join("")}</div></div>
      <label class="row"><input type="checkbox" data-bool="highContrast" ${st.highContrast ? "checked" : ""}> High contrast</label>
      <label class="row"><input type="checkbox" data-bool="reducedMotion" ${st.reducedMotion ? "checked" : ""}> Reduced animations</label></div>
    <h2>Learning</h2><div class="card stack">
      <label class="row"><input type="checkbox" data-bool="immersion" ${st.immersion ? "checked" : ""}> <span><b>ENGLISH ONLY (Immersion Mode)</b><div class="small muted">Oculta las traducciones; aparecen solo si las pides.</div></span></label>
      <div><b>Explanations</b><div class="chips">${opt("explainLang", "auto", st.explainLang, "Auto by level")}${opt("explainLang", "es", st.explainLang, "Español")}${opt("explainLang", "both", st.explainLang, "English + Español")}${opt("explainLang", "en", st.explainLang, "English")}</div></div>
      <div><b>Accent</b><div class="chips">${opt("accent", "us", s.profile.accent, "🇺🇸 American")}${opt("accent", "uk", s.profile.accent, "🇬🇧 British")}</div></div>
      <div><b>Audio speed</b><div class="chips">${[0.5, 0.75, 1, 1.25].map((x) => opt("audioRate", x, st.audioRate, x + "x")).join("")}</div></div>
      <label class="row"><input type="checkbox" data-bool="notifications" ${st.notifications ? "checked" : ""}> Daily reminder (máx. 1 al día)</label></div>
    <h2>✨ AI teacher (optional)</h2><div class="card stack">
      <div class="small muted">Sin IA la app funciona completa y offline (corrección, repasos, planes y role plays locales). Con IA: conversación libre, correcciones de escritura avanzadas, explicaciones abiertas, fotos y documentos. Usa tu propia clave de la API de Claude; se guarda <b>solo en este dispositivo</b> y se envía únicamente a la API de Anthropic.</div>
      <label class="row"><input type="checkbox" data-ai="enabled" ${st.ai.enabled ? "checked" : ""}> Enable AI teacher</label>
      <input class="inp" id="key" type="password" placeholder="sk-ant-…" value="${esc(st.ai.apiKey)}" autocomplete="off">
      <input class="inp" id="model" value="${esc(st.ai.model)}" aria-label="Model">
      <div class="row"><button class="btn primary sm" data-savekey>Save</button><button class="btn sm" data-test>Test connection</button><span class="small muted" id="aistat"></span></div></div>
    <h2>Content (CMS)</h2><div class="card stack"><div class="small muted">Importa paquetes de contenido en JSON (lecciones, gramática, vocabulario, lecturas, escenarios). Formato en docs/08-mvp-y-fases.md.</div>
      <label class="btn sm">📦 Import content pack<input type="file" accept="application/json" hidden id="pack"></label>
      ${s.packs.length ? `<div class="small">Installed: ${s.packs.map((p) => esc(p.id)).join(", ")} <button class="btn sm ghost" data-clearpacks>Remove all</button></div>` : ""}</div>
    <h2>Offline</h2><div class="card small muted">Todo el contenido (lecciones, vocabulario, ejercicios) funciona sin conexión después de la primera visita. El audio usa las voces del dispositivo. La IA y el reconocimiento de voz de algunos navegadores necesitan internet.</div>
    <div class="stack" style="margin-top:12px"><a class="btn big" href="#/privacy">🔒 Privacy & data</a></div>`);
  on(v, "click", "[data-set]", (el) => {
    const k = el.dataset.set, val = isNaN(+el.dataset.val) ? el.dataset.val : +el.dataset.val;
    if (k === "accent") s.profile.accent = val; else st[k] = val;
    store.save(); applyPrefs(); settings();
  });
  on(v, "change", "[data-bool]", (el) => {
    st[el.dataset.bool] = el.checked; store.save(); applyPrefs();
    if (el.dataset.bool === "notifications" && el.checked && "Notification" in window) Notification.requestPermission().catch(() => {});
  });
  on(v, "change", "[data-ai]", (el) => { st.ai.enabled = el.checked; store.save(); });
  on(v, "click", "[data-savekey]", () => { st.ai.apiKey = $("#key", v).value.trim(); st.ai.model = $("#model", v).value.trim() || "claude-opus-5-5"; if (st.ai.apiKey) st.ai.enabled = true; store.save(); toast("AI settings saved"); settings(); });
  on(v, "click", "[data-test]", async () => {
    const stat = $("#aistat", v); stat.textContent = "Testing…";
    try { const { ask } = await import("../../services/ai.js"); const out = await ask({ system: "Reply with exactly: OK", prompt: "Say OK", maxTokens: 20 }); stat.textContent = "✅ " + out; }
    catch (e) { const { friendlyError } = await import("../../services/ai.js"); stat.textContent = "❌ " + friendlyError(e); }
  });
  $("#pack", v).addEventListener("change", async (e) => {
    try {
      const p = JSON.parse(await e.target.files[0].text());
      const errs = validatePack(p);
      if (errs.length) return toast("Pack rejected: " + errs.slice(0, 2).join(" "), 5000);
      s.packs = s.packs.filter((x) => x.id !== p.id).concat(p); store.save(); loadContent(s.packs); toast(`Pack "${p.id}" installed`); settings();
    } catch (err) { toast("Invalid JSON: " + err.message); }
  });
  on(v, "click", "[data-clearpacks]", () => { s.packs = []; store.save(); loadContent([]); settings(); });
}

function privacy() {
  const v = render(`${backLink("#/settings", "Settings")}<h1>🔒 Privacy & data</h1>
    <div class="card small">Tus datos viven en este dispositivo. No se guardan grabaciones de voz: solo el texto reconocido. La clave de IA nunca sale de tu navegador salvo hacia la API de Anthropic.</div>
    <div class="stack" style="margin-top:12px">
      <button class="btn big" data-export>📤 Export my data (JSON)</button>
      <label class="btn big">📥 Import data<input type="file" accept="application/json" hidden id="imp"></label>
      <button class="btn big" data-conv>🗑️ Delete conversations</button>
      <button class="btn big" data-voice>🎙️ Delete voice data (speaking history)</button>
      <button class="btn big" data-hist>🧹 Delete learning history</button>
      <button class="btn big" data-all style="color:var(--bad)">⚠️ Delete account & all data</button>
    </div>
    <h2>Microphone</h2><div class="card small muted">El permiso del micrófono se controla desde tu navegador (icono de candado junto a la dirección). La app solo escucha mientras el botón 🎤 está rojo.</div>`);
  const s = store.state;
  on(v, "click", "[data-export]", () => {
    const blob = new Blob([store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `ingles-practico-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  });
  $("#imp", v).addEventListener("change", async (e) => { try { store.importJSON(await e.target.files[0].text()); toast("Imported ✔"); go("#/home"); } catch (err) { toast("Invalid file"); } });
  on(v, "click", "[data-conv]", () => { if (confirm("Delete all conversations?")) { store.deleteConversations(); toast("Conversations deleted"); } });
  on(v, "click", "[data-voice]", () => { if (confirm("Delete speaking history?")) { s.speaking = {}; s.conversations.forEach((c) => c.turns.forEach((t) => delete t.spoken)); store.save(); toast("Voice data deleted"); } });
  on(v, "click", "[data-hist]", () => { if (confirm("Delete all learning history? Your profile and settings stay.")) { store.deleteHistory(); toast("History deleted"); go("#/home"); } });
  on(v, "click", "[data-all]", () => { if (confirm("Delete everything on this device? This cannot be undone.")) { store.deleteAll(); location.hash = "#/welcome"; location.reload(); } });
}
