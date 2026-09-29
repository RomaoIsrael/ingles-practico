// Inglés profesional (secciones 45-90, 152, 168, 186): rutas, frases, correos, cláusulas, Plain English y Career Coach.
import { esc, shuffle } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { ROUTES, ROUTE_BY_ID, PHRASES, EMAILS, CLAUSES, PLAIN_ENGLISH, CV_VERBS, LINKEDIN, DISCLAIMER } from "../../content/professional.js";
import { CHARACTERS } from "../../content/characters.js";
import { current } from "../../engine/brain.js";
import { vocabLessonSequence } from "../../engine/exercises.js";
import { routesFor } from "../../engine/planner.js";
import { addWord, answer, activity } from "../../core/actions.js";
import { render, on, audioBtn, backLink, progressBar, $, tr, charCard, openSheet } from "../components.js";
import { route, go, finishScreen } from "../app.js";
import { runExercises } from "../runner.js";
import { aiReady, ask, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

export function registerPro() {
  route("/pro", () => {
    const s = store.state;
    const mine = routesFor(s.profile);
    const v = render(`<h1>💼 Professional English</h1><p class="muted small">Aprende inglés general + inglés profesional a la vez.</p>
      ${mine.length ? `<h2>My routes</h2><div class="grid2">${mine.map((id) => tile(ROUTE_BY_ID[id], s)).join("")}</div>` : ""}
      <h2>Professional dashboard</h2>${dashboard(s)}
      <h2>Create my Professional English</h2><div class="card"><div class="small muted">Escribe tu profesión y te proponemos una ruta.</div>
        <div class="composer" style="margin-top:8px"><input class="inp" id="prof" placeholder="My profession is…" value="${esc(s.profile.professions.custom)}"><button class="btn primary" data-create>Create</button></div><div id="made"></div></div>
      <h2>All routes</h2><div class="grid2">${ROUTES.map((r) => tile(r, s)).join("")}</div>`);
    on(v, "click", "[data-create]", async () => {
      const text = $("#prof", v).value.trim();
      if (!text) return;
      s.profile.professions.custom = text; store.save();
      const kw = text.toLowerCase();
      const match = ROUTES.filter((r) => (r.title + " " + r.es + " " + r.id).toLowerCase().split(/\W+/).some((w) => w.length > 3 && kw.includes(w)));
      const box = $("#made", v);
      box.innerHTML = `<div style="margin-top:10px"><b>Suggested route:</b> ${match.length ? match.map((r) => `<a class="chip" href="#/pro/${r.id}">${r.icon} ${esc(r.title)}</a>`).join(" ") : `<a class="chip" href="#/pro/business">📈 Business English</a> <a class="chip" href="#/pro/career">🚀 Career Coach</a>`}</div>${aiReady() ? `<div id="aiR" class="small muted" style="margin-top:8px">✨ Designing a personalized plan…</div>` : ""}`;
      if (aiReady()) {
        try { let acc = ""; await ask({ system: systemPrompt(), prompt: `My profession is: ${text}. Create a personalized Professional English route: 6 modules (title + 5 key vocabulary items each + 1 typical conversation situation), adapted to my level. Be concise.`, maxTokens: 1200, onText: (d) => { acc += d; $("#aiR", v).innerHTML = `<div style="white-space:pre-wrap;color:var(--text)">${esc(acc)}</div>`; } }); }
        catch (e) { $("#aiR", v).textContent = friendlyError(e); }
      }
    });
  });

  route("/pro/:id", ({ id }) => routeScreen(ROUTE_BY_ID[id]));
  route("/phrases/:id", ({ id }) => phrasesScreen(id));
  route("/clauses", () => clauses());
  route("/plain", () => plain());
  route("/cv", () => cv());
  route("/linkedin", () => linkedin());
}

function tile(r, s) {
  const m = s.skills[r.concept];
  return `<a class="tile" href="#/pro/${r.id}"><span class="em">${r.icon}</span><b>${esc(r.title)}</b><span>${esc(r.es)}</span>${m ? progressBar(current(m), true) : ""}</a>`;
}

// Professional Dashboard (sección 87)
function dashboard(s) {
  const val = (id) => current(s.skills[id]);
  const general = ["sk.speaking", "sk.listening", "sk.reading", "sk.writing"].map(val).reduce((a, b) => a + b, 0) / 4;
  const proIds = Object.keys(s.skills).filter((id) => C.catalog[id]?.cat === "professional");
  const pro = proIds.length ? proIds.map(val).reduce((a, b) => a + b, 0) / proIds.length : 0;
  const tech = C.topics.filter((t) => t.area).flatMap((t) => t.words).filter((w) => s.vocab[w]?.reps).length;
  const rows = [["General English", general], ["Professional English", pro], ["Vocabulary (technical words)", Math.min(1, tech / 150), `${tech} words`], ["Meetings", val("b.meetings")], ["Emails", val("b.emails")], ["Presentations", val("b.presentations")], ["Negotiation", val("b.negotiation")]];
  return `<div class="card">${rows.map(([k, x, t]) => `<div class="row between small"><span>${k}</span><span class="muted">${t || Math.round(x * 100) + "%"}</span></div>${progressBar(x, true)}`).join("<div style='height:8px'></div>")}</div>`;
}

function routeScreen(r) {
  if (!r) return go("#/pro");
  const s = store.state;
  const ch = CHARACTERS[r.character] || CHARACTERS.nova;
  const v = render(`${backLink("#/pro", "Professional")}<h1>${r.icon} ${esc(r.title)}</h1><p class="muted">${esc(r.es)}</p>
    ${r.disclaimer ? `<div class="banner">⚖️ <span class="small">${esc(DISCLAIMER.es)}</span></div>` : ""}
    ${charCard(ch, `Hi! I'm ${esc(ch.name)}. Let's work on your ${esc(r.title)}.`, esc(ch.voice))}
    ${r.modules.map((m, i) => `<h2>${i + 1}. ${esc(m.title)}</h2><div class="list">
      ${(m.vocab || []).map((t) => { const T = C.topicById[t]; const known = T.words.filter((w) => s.vocab[w]?.reps).length; return `<div class="item"><span class="em">${T.icon}</span><span class="grow"><span class="title">${esc(T.title)}</span><div class="sub">${known}/${T.words.length} words</div></span><a class="btn sm" href="#/vocab/topic/${t}">List</a><button class="btn sm primary" data-learn="${t}">Learn</button></div>`; }).join("")}
      ${m.phrases ? `<a class="item" href="#/phrases/${m.phrases}"><span class="em">${PHRASES[m.phrases].icon}</span><span class="grow"><span class="title">${esc(PHRASES[m.phrases].title)} phrases</span><div class="sub">${PHRASES[m.phrases].groups.map((g) => g[0]).slice(0, 4).join(" · ")}…</div></span>▶</a>` : ""}
      ${(m.talk || []).map((t) => { const sc = C.scenarioById[t]; return `<a class="item" href="#/roleplay/${t}"><span class="em">${sc.emoji}</span><span class="grow"><span class="title">Role play: ${esc(sc.title)}</span><div class="sub">${esc(sc.goal)}</div></span>🗣️</a>`; }).join("")}
      ${(m.emails || []).map((e) => { const E = EMAILS.find((x) => x.id === e); return `<button class="item" data-email="${e}"><span class="em">📧</span><span class="grow"><span class="title">${esc(E.title)}</span><div class="sub">${esc(E.es)}</div></span>▶</button>`; }).join("")}
      ${m.clauses ? `<a class="item" href="#/clauses"><span class="em">📜</span><span class="grow"><span class="title">Contract Clause Trainer</span><div class="sub">Original · vocabulary · meaning · plain English · grammar</div></span>▶</a>` : ""}
      ${m.plain ? `<a class="item" href="#/plain"><span class="em">🔤</span><span class="grow"><span class="title">Plain English Mode</span><div class="sub">Legal English → simple English</div></span>▶</a>` : ""}
      ${m.cv ? `<a class="item" href="#/cv"><span class="em">📄</span><span class="grow"><span class="title">CV English</span><div class="sub">Led · Managed · Implemented…</div></span>▶</a>` : ""}
      ${m.linkedin ? `<a class="item" href="#/linkedin"><span class="em">🔗</span><span class="grow"><span class="title">LinkedIn English</span><div class="sub">Headline · About · Experience…</div></span>▶</a>` : ""}
      ${m.star || m.interview ? `<a class="item" href="#/interview"><span class="em">⭐</span><span class="grow"><span class="title">${m.star ? "STAR method" : "AI Job Interview"}</span><div class="sub">Candidate & Recruiter modes</div></span>▶</a>` : ""}
    </div>`).join("")}`);
  on(v, "click", "[data-learn]", (el) => {
    const T = C.topicById[el.dataset.learn];
    const words = T.words.map((w) => C.wordById[w]).filter(Boolean);
    const batch = (words.filter((w) => !s.vocab[w.id]?.reps).length ? words.filter((w) => !s.vocab[w.id]?.reps) : shuffle(words)).slice(0, 6);
    batch.forEach((w) => addWord(w.id));
    runExercises({ title: T.title, items: vocabLessonSequence(batch, words), back: `#/pro/${r.id}`, onDone: (res) => { answer({ concept: r.concept, ok: res.score >= 0.7, score: res.score, type: "choose" }); finishScreen({ title: "Professional words learned", emoji: T.icon, lines: [["Words", batch.length], ["Correct", `${res.ok}/${res.total}`]], next: `#/pro/${r.id}` }); } });
  });
  on(v, "click", "[data-email]", (el) => emailSheet(EMAILS.find((x) => x.id === el.dataset.email)));
}

function emailSheet(E) {
  openSheet(`<div class="row between"><h2 style="margin:0">📧 ${esc(E.title)}</h2><button class="iconbtn" data-close>✕</button></div><div class="small muted">Tone: ${E.tone} · Subject: <b>${esc(E.subject)}</b></div>
    <div class="email" style="margin-top:8px">${esc(E.body)}</div><div class="row" style="margin-top:10px">${audioBtn(E.body, { cls: "btn sm", label: "🔊 Listen" })}<a class="btn sm primary" href="#/email" data-close>✍️ Write my own</a></div>`);
}

function phrasesScreen(id) {
  const P = PHRASES[id];
  if (!P) return go("#/pro");
  const v = render(`${backLink("#/pro", "Professional")}<h1>${P.icon} ${esc(P.title)}</h1>
    <div class="stack" style="margin:10px 0"><button class="btn primary" data-quiz>🎯 Practice: choose the right phrase</button><button class="btn" data-say>🗣️ Say them aloud</button></div>
    ${P.groups.map(([g, list]) => `<h2>${esc(g)}</h2><div class="list">${list.map(([en, es, reg]) => `<div class="item" style="cursor:default"><span class="grow"><b>${esc(en)}</b>${tr(es)}<span class="small muted">${reg}</span></span>${audioBtn(en)}</div>`).join("")}</div>`).join("")}`);
  on(v, "click", "[data-quiz]", () => {
    const items = shuffle(P.groups).slice(0, 8).map(([g, list]) => {
      const right = shuffle(list)[0];
      const wrong = shuffle(P.groups.filter((x) => x[0] !== g)).slice(0, 2).map((x) => shuffle(x[1])[0][0]);
      return { type: "choose", prompt: `${g}: which phrase fits?`, options: shuffle([right[0], ...wrong]), answer: right[0], concept: id === "meeting" ? "b.meetings" : id === "presentation" ? "b.presentations" : id === "negotiation" ? "b.negotiation" : id === "audit" ? "p.audit" : "b.business", ctx: id };
    });
    runExercises({ title: P.title, items, back: `#/phrases/${id}`, onDone: (r) => finishScreen({ title: "Professional phrases", emoji: P.icon, lines: [["Correct", `${r.ok}/${r.total}`]], next: `#/phrases/${id}` }) });
  });
  on(v, "click", "[data-say]", () => {
    const items = shuffle(P.groups.flatMap(([, l]) => l)).slice(0, 5).map(([en, es]) => ({ type: "speak", prompt: en, answer: en, es, concept: id === "meeting" ? "b.meetings" : id === "presentation" ? "b.presentations" : "b.business", skill: "sk.speaking" }));
    runExercises({ title: P.title, items, back: `#/phrases/${id}`, onDone: (r) => finishScreen({ title: "Great delivery!", emoji: "🎤", lines: [["Average match", `${Math.round(r.score * 100)}%`]], next: `#/phrases/${id}` }) });
  });
}

// Contract Clause Trainer (sección 75)
function clauses() {
  render(`${backLink("#/pro/law", "Legal English")}<h1>📜 Contract Clause Trainer</h1><div class="banner">⚖️ <span class="small">${esc(DISCLAIMER.es)} Cláusulas educativas simplificadas.</span></div>
    ${CLAUSES.map((c) => `<details class="card"><summary>${esc(c.title)}</summary>
      <h3 style="margin-top:10px">Original clause</h3><div class="email">${esc(c.original)}</div>${audioBtn(c.original, { cls: "btn sm", label: "🔊 Listen" })}
      <h3 style="margin-top:10px">Key vocabulary</h3><table class="t">${c.vocab.map(([en, es]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(es)}</td></tr>`).join("")}</table>
      <h3 style="margin-top:10px">Meaning</h3><div>${esc(c.meaning)}</div>
      <h3 style="margin-top:10px">Plain English explanation</h3><div><b>${esc(c.plain)}</b></div>
      <h3 style="margin-top:10px">Grammar structure</h3><div class="small">${esc(c.grammar)}</div></details>`).join("")}`);
}

// Plain English Mode (sección 76)
function plain() {
  const v = render(`${backLink("#/pro/law", "Legal English")}<h1>🔤 Plain English Mode</h1><p class="muted small">Del inglés jurídico complejo a inglés sencillo, para aprender.</p>
    <table class="t card">${PLAIN_ENGLISH.map(([a, b]) => `<tr><td><i>${esc(a)}</i></td><td><b>${esc(b)}</b></td></tr>`).join("")}</table>
    <h2>Translate a legal sentence</h2><textarea class="inp" id="t" rows="4" placeholder="Paste a legal sentence…"></textarea><button class="btn primary" data-go style="margin-top:8px">Simplify</button><div id="out"></div>`);
  on(v, "click", "[data-go]", async () => {
    let text = $("#t", v).value.trim(); if (!text) return;
    let simple = text;
    for (const [a, b] of PLAIN_ENGLISH) simple = simple.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\…']/g, "").replace(/\s+/g, "\\s+").slice(0, 40), "i"), b.replace(/…$/, ""));
    simple = simple.replace(/\bshall not\b/gi, "must not").replace(/\bshall\b/gi, "must").replace(/\bhereby\b/gi, "").replace(/\bthereof\b/gi, "of it").replace(/\bherein\b/gi, "in this agreement");
    $("#out", v).innerHTML = `<div class="card" style="margin-top:10px"><b>Plain English (automatic):</b><div>${esc(simple)}</div>${aiReady() ? `<div id="ai" class="small muted" style="margin-top:8px">✨ …</div>` : ""}</div>`;
    if (aiReady()) try { let acc = ""; await ask({ system: systemPrompt("Teach legal English; do not give legal advice."), prompt: `Explain this legal sentence in plain English for a language learner, list key legal vocabulary with Spanish translations and the grammar structure:\n"${text}"`, maxTokens: 700, onText: (d) => { acc += d; $("#ai", v).innerHTML = `<div style="white-space:pre-wrap;color:var(--text)">${esc(acc)}</div>`; } }); } catch (e) { $("#ai", v).textContent = friendlyError(e); }
  });
}

// CV English (sección 89)
function cv() {
  const v = render(`${backLink("#/pro/career", "Career")}<h1>📄 CV English</h1><p class="muted small">Verbos de acción en pasado + tarea + resultado medible.</p>
    <div class="list">${CV_VERBS.map(([en, es, ex]) => `<div class="item" style="cursor:default"><span class="grow"><b>${en}</b> <span class="muted small">${es}</span><div class="small"><i>${esc(ex)}</i></div></span>${audioBtn(ex)}</div>`).join("")}</div>
    <h2>Improve a CV line</h2><input class="inp" id="l" placeholder="e.g. I was responsible for the maintenance team"><button class="btn primary" data-go style="margin-top:8px">Improve</button><div id="out"></div>`);
  on(v, "click", "[data-go]", async () => {
    const line = $("#l", v).value.trim(); if (!line) return;
    let better = line.replace(/^i was responsible for (the )?/i, "Managed the ").replace(/^i (was in charge of|managed)/i, "Managed").replace(/^i (helped|supported)/i, "Supported").replace(/^i made/i, "Developed").replace(/^i did/i, "Carried out");
    const hasNumber = /\d/.test(line);
    $("#out", v).innerHTML = `<div class="card" style="margin-top:10px"><div>✔ <b>${esc(better[0].toUpperCase() + better.slice(1))}</b></div>${hasNumber ? "" : `<div class="small muted">💡 Add a measurable result: “…, reducing downtime by 15%.”</div>`}<div id="ai"></div></div>`;
    activity("write", { sec: 30, xp: 5 });
    if (aiReady()) try { const out = await ask({ system: systemPrompt(), prompt: `Rewrite this CV bullet in strong professional English with an action verb and a measurable result (give 2 options): "${line}"`, maxTokens: 300 }); $("#ai", v).innerHTML = `<div style="white-space:pre-wrap">${esc(out)}</div>`; } catch (e) { $("#ai", v).textContent = friendlyError(e); }
  });
}

function linkedin() {
  render(`${backLink("#/pro/career", "Career")}<h1>🔗 LinkedIn English</h1>
    ${LINKEDIN.map((l) => `<div class="card"><b>${esc(l.part)}</b><div class="small muted">${esc(l.tip)}</div><div class="email" style="margin-top:8px">${esc(l.example)}</div></div>`).join("")}
    <a class="btn primary big" href="#/writing" style="margin-top:12px">✍️ Practice writing</a>`);
}
