// SPEAK (secciones 28-34, 59-62, 91-92, 114, 122, 140, 142): conversación, role play, Real Life/Story Mode,
// HELP progresivo, evaluación y "Better way to say it", entrevista de trabajo y Fluency Path.
import { esc, shuffle, levelIndex, words as tokenize, fmtMin, dayKey, DAY } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { CHARACTERS } from "../../content/characters.js";
import { CONV_LEVELS } from "../../content/scenarios.js";
import { INTERVIEW, STAR } from "../../content/professional.js";
import { FLUENCY_PATH } from "../../content/curriculum.js";
import { detect, correct } from "../../engine/errors.js";
import { record, current } from "../../engine/brain.js";
import { analyzeText, speakTime, activity, lessonDone } from "../../core/actions.js";
import { render, on, audioBtn, backLink, progressBar, $, toast, tr, howTo } from "../components.js";
import { route, go, finishScreen, session } from "../app.js";
import { speak, listen, sttAvailable, stopListening, stopSpeaking } from "../../services/speech.js";
import { aiReady, chat, structured, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

const NATURAL_MARKERS = /\b(could you|would you|i'd like|i would like|sounds good|of course|i see|to be honest|actually|by the way|that makes sense|no problem|let me|shall we)\b/i;
const PRO_MARKERS = /\b(could you|would it be possible|i'd suggest|i suggest|provided that|we will|i'll|according to|please find|let me summarize|regarding|in terms of|appreciate)\b/i;

export function registerSpeak() {
  route("/speak", () => {
    const s = store.state;
    const cats = [["travel", "✈️ Travel & daily life"], ["work", "💼 Work & study"], ["pro", "🏢 Professional role plays"]];
    const today = s.speaking[dayKey()] || 0;
    let week = 0; for (let i = 0; i < 7; i++) week += s.speaking[dayKey(Date.now() - i * DAY)] || 0;
    const v = render(`<h1>Speak</h1>
      <div class="card soft"><div class="row between"><b>🎙️ Speaking timer</b><span class="small muted">Today ${fmtMin(today)} · This week ${fmtMin(week)}</span></div></div>
      <div class="grid2" style="margin-top:12px">
        <a class="tile" href="#/talk"><span class="em">💬</span><b>Talk with AI</b><span>Free conversation · text & voice</span></a>
        <a class="tile" href="#/interview"><span class="em">🧑‍💻</span><b>Job Interview</b><span>Candidate · Recruiter</span></a>
        <a class="tile" href="#/roleplay/meeting"><span class="em">🗓️</span><b>Professional Meeting</b><span>Mike · PM</span></a>
        <a class="tile" href="#/fluency"><span class="em">🌊</span><b>Fluency Path</b><span>7 stages</span></a>
      </div>
      <h2>Conversation level</h2><div class="tabs">${CONV_LEVELS.map((l) => `<button class="chip ${s.settings.convLevel === l.n ? "on" : ""}" data-cl="${l.n}" title="${esc(l.es)}">L${l.n} · ${esc(l.title)}</button>`).join("")}</div>
      ${cats.map(([k, t]) => `<h2>${t}</h2><div class="list">${C.scenarios.filter((x) => x.cat === k).map((x) => `<a class="item" href="#/roleplay/${x.id}"><span class="em">${x.emoji}</span><span class="grow"><span class="title">${esc(x.title)}</span><div class="sub">${CHARACTERS[x.character]?.name || ""} · ${x.level}${x.story ? " · Story mode" : ""}${s.conversations.some((c) => c.scenario === x.id) ? " · ✔" : ""}</div></span>▶</a>`).join("")}</div>`).join("")}`);
    on(v, "click", "[data-cl]", (el) => { s.settings.convLevel = +el.dataset.cl; store.save(); v.querySelectorAll("[data-cl]").forEach((c) => c.classList.toggle("on", c === el)); });
  });

  route("/roleplay/:id", ({ id }) => roleplay(C.scenarioById[id]));
  route("/talk", () => freeTalk());
  route("/interview", () => interviewHome());
  route("/interview/:mode/:type", ({ mode, type }) => (mode === "candidate" ? interviewCandidate(type) : interviewRecruiter(type)));
  route("/fluency", () => {
    const s = store.state;
    const sp = current(s.skills["sk.speaking"]);
    const stage = Math.min(6, Math.floor(sp * 7));
    render(`${backLink("#/speak", "Speak")}<h1>🌊 Fluency Path</h1><p class="muted">Una ruta específica para hablar. Tu etapa se calcula con tu dominio real de speaking (${Math.round(sp * 100)}%).</p>
      <div class="path">${FLUENCY_PATH.map((f, i) => `<div class="stage ${i < stage ? "done" : i === stage ? "now" : ""}"><div class="dot">${i + 1}</div><a class="card tap" href="${f.route}" style="margin-left:6px"><b>${esc(f.title)}</b> <span class="muted small">· ${esc(f.es)}</span><div class="small muted">${esc(f.do)}</div></a></div>`).join("")}</div>`);
  });
}

// ── Role play guiado (local) con opción de IA ──
function roleplay(sc) {
  if (!sc) return go("#/speak");
  const s = store.state;
  const ch = CHARACTERS[sc.character] || CHARACTERS.speaky;
  const lvl = CONV_LEVELS[(s.settings.convLevel || 2) - 1];
  const lesson = session.lesson?.ref === sc.id ? session.lesson : null;
  const showTr = !s.settings.immersion && (s.settings.convLevel || 2) <= 2;
  const convo = { scenario: sc.id, turns: [], start: Date.now(), hints: 0, matched: 0, userTurns: 0, spokenSec: 0, confs: [], notes: [] };
  let idx = 0, hintLevel = 0, voice = sttAvailable(), hands = false, retried = false;
  const v = render(`<div class="row between"><a class="btn ghost sm" href="${lesson ? `#/unit/${lesson.unit}` : "#/speak"}">← Exit</a><span class="small muted" id="timer">🎙️ 0:00</span></div>
    <div class="who" style="margin:6px 0 10px"><div class="avatar" style="background:${ch.color}22">${ch.emoji}</div><div><b>${esc(ch.name)}</b> <span class="muted small">· ${esc(ch.role)}</span><div class="small muted">${sc.story ? "📖 REAL LIFE MODE · " : ""}${esc(sc.title)} · ${esc(sc.goal)}</div></div></div>
    ${sc.story ? `<div class="card hero" style="padding:12px 14px;margin-bottom:10px"><b>${sc.emoji} YOU ARE ${esc(sc.title.replace(/^At the /i, "AT THE ").toUpperCase())}</b></div>` : ""}
    ${howTo("Cómo funciona esta conversación", ["Lee o escucha lo que dice el personaje (🔊). Si hay traducción, aparece debajo.", "Responde <b>escribiendo</b> o pulsando 🎤 y hablando. Frases cortas están bien.", "¿No sabes qué decir? Pulsa <b>🆘 HELP</b>: cada vez te da una pista más (vocabulario → estructura → primeras palabras → frase completa).", "Si cometes un error, verás 💡 <i>Better</i> con la forma correcta. ¡Sigue hablando!", "Al final pulsa <b>🏁 End & evaluate</b> para ver tu evaluación y cómo decirlo mejor."], { open: !store.state.conversations.length })}
    <div class="chat" id="chat" aria-live="polite"></div>
    <div id="hint"></div>
    <div class="composer"><textarea class="inp" id="msg" rows="1" placeholder="Type or tap the mic…" aria-label="Tu respuesta"></textarea>${voice ? `<button class="mic" data-mic aria-label="Hablar">🎤</button>` : ""}<button class="btn primary" data-send aria-label="Enviar">➤</button></div>
    <div class="controls"><button class="btn sm" data-help>🆘 HELP</button><button class="btn sm" data-repeat>🔁 Repeat</button><button class="btn sm" data-slowr>🐢 Slower</button>${voice ? `<button class="btn sm" data-hands>🙌 Hands-free: off</button>` : ""}<button class="btn sm" data-end>🏁 End & evaluate</button></div>`);
  const chatEl = $("#chat", v), msg = $("#msg", v);
  const timer = setInterval(() => { if (!document.body.contains(v)) return clearInterval(timer); const t = Math.round(convo.spokenSec); $("#timer", v).textContent = `🎙️ ${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; }, 1000);

  const bubble = (role, html) => { const b = document.createElement("div"); b.className = `bubble ${role}`; b.innerHTML = html; chatEl.appendChild(b); b.scrollIntoView({ block: "end", behavior: "smooth" }); return b; };
  const aiSay = (text, es) => {
    bubble("ai", `${esc(text)} ${audioBtn(text, { cls: "btn sm", label: "🔊" })}${showTr && es ? `<span class="tr">${esc(es)}</span>` : ""}`);
    convo.turns.push({ role: "ai", text });
    return speak(text, { rate: lvl.rate * s.settings.audioRate, accent: s.profile.accent }).then(() => { if (hands && voice) startMic(); });
  };
  const stepNow = () => sc.steps[idx];
  aiSay(stepNow().ai, stepNow().es);

  async function startMic() {
    const btn = $("[data-mic]", v);
    if (!btn || btn.classList.contains("rec")) return;
    stopSpeaking();
    btn.classList.add("rec");
    try {
      const r = await listen({ accent: s.profile.accent, onInterim: (t) => (msg.value = t) });
      convo.spokenSec += r.sec; speakTime(r.sec);
      if (r.confidence) convo.confs.push(r.confidence);
      btn.classList.remove("rec");
      if (r.transcript) { msg.value = r.transcript; send(true); }
    } catch (e) { btn.classList.remove("rec"); toast(e.message === "not-allowed" ? "Microphone blocked." : "I couldn't hear you."); }
  }

  function send(spoken = false) {
    const text = msg.value.trim();
    if (!text) return;
    msg.value = "";
    $("#hint", v).innerHTML = "";
    bubble("me", esc(text) + (spoken ? " 🎤" : ""));
    convo.turns.push({ role: "user", text, spoken });
    convo.userTurns++;
    const errs = analyzeText(text, "conversation").filter((e) => e.cat !== "Writing");
    const st = stepNow();
    if (errs.length) {
      convo.notes.push({ original: text, improved: correct(text), natural: st.h[3] });
      bubble("note", `💡 Better: <b>${esc(correct(text))}</b><div class="small">${esc(errs[0].es)}</div>`);
    } else if (tokenize(text).length >= 2) convo.notes.push({ original: text, improved: null, natural: st.h[3] });
    if (st.end) return setTimeout(() => evaluate(), 600);
    // Ramas por palabras clave (Story Mode) o avance normal
    let next = null;
    for (const [kw, to] of st.go || []) {
      if (!kw || kw.split(" ").every((alt) => new RegExp("\\b(" + alt + ")", "i").test(text))) { next = to; break; }
    }
    const understood = next != null || tokenize(text).length >= 2;
    if (!understood && !retried) {
      retried = true;
      setTimeout(() => { aiSay("Sorry, could you say that again?", "Perdón, ¿puedes repetirlo?"); showHint(1); }, 500);
      return;
    }
    if (next != null && (st.go || []).some(([k]) => k)) convo.matched++;
    else if (understood) convo.matched += 0.8;
    retried = false; hintLevel = 0;
    idx = next ?? idx + 1;
    if (idx >= sc.steps.length) return evaluate();
    setTimeout(() => aiSay(stepNow().ai, stepNow().es), 500);
  }

  // HELP progresivo (sección 32): vocabulario → estructura → primeras palabras → frase sugerida
  function showHint(n) {
    const h = stepNow().h;
    const labels = ["Vocabulary", "Sentence structure", "First words", "Suggested sentence"];
    $("#hint", v).innerHTML = `<div class="hint">${h.slice(0, n).map((x, i) => `<div><b>Hint ${i + 1} · ${labels[i]}:</b> ${esc(x)}${i === 3 ? " " + audioBtn(x, { cls: "btn sm" }) : ""}</div>`).join("")}</div>`;
  }

  on(v, "click", "[data-send]", () => send(false));
  msg.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(false); } });
  on(v, "click", "[data-mic]", (el) => (el.classList.contains("rec") ? stopListening() : startMic()));
  on(v, "click", "[data-help]", () => { hintLevel = Math.min(4, hintLevel + 1); convo.hints++; showHint(hintLevel); });
  on(v, "click", "[data-repeat]", () => speak(stepNow().ai, { rate: lvl.rate * s.settings.audioRate, accent: s.profile.accent }));
  on(v, "click", "[data-slowr]", () => speak(stepNow().ai, { rate: 0.7, accent: s.profile.accent }));
  on(v, "click", "[data-hands]", (el) => { hands = !hands; el.textContent = `🙌 Hands-free: ${hands ? "on" : "off"}`; if (hands) startMic(); });
  on(v, "click", "[data-end]", () => evaluate());

  function evaluate() {
    clearInterval(timer); stopSpeaking(); stopListening();
    const userTexts = convo.turns.filter((t) => t.role === "user").map((t) => t.text);
    const nWords = userTexts.map((t) => tokenize(t).length);
    const avgWords = nWords.length ? nWords.reduce((a, b) => a + b, 0) / nWords.length : 0;
    const errCount = convo.notes.filter((n) => n.improved).length;
    const expected = 3 + levelIndex(sc.level) * 2;
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const allText = userTexts.join(" ");
    const uniq = new Set(tokenize(allText)).size;
    const sampleVocab = new Set(sc.steps.flatMap((st) => tokenize(st.h[0] + " " + st.h[3])));
    const used = [...new Set(tokenize(allText))].filter((w) => sampleVocab.has(w) && w.length > 3).length;
    const m = {
      Fluency: clamp01(avgWords / expected) * (convo.userTurns ? 1 : 0),
      Grammar: convo.userTurns ? clamp01(1 - errCount / convo.userTurns) : 0,
      Vocabulary: clamp01((used / 4) * 0.6 + (uniq / Math.max(12, expected * 3)) * 0.4),
      Pronunciation: convo.confs.length ? convo.confs.reduce((a, b) => a + b, 0) / convo.confs.length : null,
      Comprehension: convo.userTurns ? clamp01(convo.matched / Math.max(1, convo.userTurns)) : 0,
      Naturalness: clamp01(0.55 + (NATURAL_MARKERS.test(allText) ? 0.25 : 0) - convo.hints * 0.05 + (avgWords > 5 ? 0.2 : 0)),
    };
    if (sc.pro || sc.cat === "pro") m["Professional Communication"] = clamp01(0.45 + (PRO_MARKERS.test(allText) ? 0.35 : 0) + (errCount ? 0 : 0.2));
    const scores = Object.values(m).filter((x) => x != null);
    const overall = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    // Registro en el Brain
    if (convo.userTurns) {
      record(s.skills, "sk.speaking", { score: overall, produced: true, ctx: sc.cat });
      if (sc.pro) { const r = C.catalog["p." + sc.pro] ? "p." + sc.pro : sc.pro === "business" ? "b.business" : null; if (r) record(s.skills, r, { score: overall, produced: true }); }
      if (sc.id === "meeting") record(s.skills, "b.meetings", { score: overall, produced: true });
      if (sc.id === "presentation") record(s.skills, "b.presentations", { score: overall, produced: true });
      if (/negotiation|supplier|contract/.test(sc.id)) record(s.skills, "b.negotiation", { score: overall, produced: true });
    }
    s.conversations.push({ id: Date.now().toString(36), t: Date.now(), scenario: sc.id, pro: !!sc.pro, turns: convo.turns.slice(-30), eval: Object.fromEntries(Object.entries(m).map(([k, x]) => [k, x == null ? null : Math.round(x * 100)])) });
    store.save();
    activity("conversation", { scenario: sc.id, sec: Math.round((Date.now() - convo.start) / 1000), xp: 15 + convo.userTurns * 3 });
    if (lesson) lessonDone(lesson, overall);
    const better = convo.notes.filter((n) => n.improved || n.natural).slice(0, 5);
    const view = finishScreen({
      title: overall >= 0.75 ? "Great conversation!" : "Good practice — keep talking!", emoji: ch.emoji,
      lines: Object.entries(m).map(([k, x]) => [k, x == null ? "— (voice not used)" : `${Math.round(x * 100)}%`]),
      next: lesson ? `#/unit/${lesson.unit}` : "#/speak", nextLabel: lesson ? "Next lesson" : "More conversations",
      extra: `${better.length ? `<h2>💡 Better way to say it</h2>${better.map((n) => `<div class="card soft"><table class="t"><tr><th>Original</th><td>${esc(n.original)}</td></tr>${n.improved ? `<tr><th>Improved</th><td><b>${esc(n.improved)}</b></td></tr>` : ""}<tr><th>Natural</th><td>${esc(n.natural)} ${audioBtn(n.natural, { cls: "btn sm" })}</td></tr></table></div>`).join("")}` : ""}
        ${aiReady() ? `<div class="card" id="aiEval"><button class="btn" data-aieval>✨ Detailed AI evaluation</button></div>` : ""}`,
    });
    on(view, "click", "[data-aieval]", async () => {
      const box = $("#aiEval", view);
      box.innerHTML = `<p class="muted">✨ Evaluating…</p>`;
      try {
        let acc = "";
        await chat({ system: systemPrompt("Evaluate a role-play conversation. Be specific and encouraging."), messages: [{ role: "user", content: `Scenario: ${sc.title} (${sc.goal}).\nTranscript:\n${convo.turns.map((t) => `${t.role === "ai" ? ch.name : "Student"}: ${t.text}`).join("\n")}\n\nGive short feedback on fluency, grammar, vocabulary, comprehension, naturalness${sc.pro ? " and professional communication" : ""}, and rewrite 3 of the student's sentences in a more natural way.` }], effort: "medium", maxTokens: 900, onText: (d) => { acc += d; box.innerHTML = `<div style="white-space:pre-wrap">${esc(acc)}</div>`; } });
      } catch (e) { box.textContent = friendlyError(e); }
    });
  }
}

// ── Talk with AI (sección 28): IA real si está activada; si no, SPEAKY local ──
const LOCAL_QS = {
  1: ["What is your name?", "Where are you from?", "What is your job?", "Do you like coffee?", "What do you do on Sundays?"],
  2: ["What did you do last weekend?", "What's your favorite food?", "Tell me about your family.", "Do you like your job? Why?", "What are your plans for tomorrow?"],
  3: ["What do you enjoy most about your work?", "Have you ever traveled abroad?", "What would you do with a free week?", "How do you usually learn new things?", "What's a challenge you faced recently?"],
};
function freeTalk() {
  const s = store.state;
  const lv = s.settings.convLevel || 2;
  const L = CONV_LEVELS[lv - 1];
  const useAI = aiReady();
  const ch = CHARACTERS[lv >= 6 ? "sofia" : lv >= 5 ? "lingo" : "speaky"];
  const history = [];
  const qs = shuffle(LOCAL_QS[Math.min(3, lv)] || LOCAL_QS[3]);
  let qi = 0, t0 = Date.now(), spoken = 0, turns = 0, errs = 0, hands = false;
  const v = render(`<div class="row between">${backLink("#/speak", "Speak")}<span class="small muted">Level ${lv}: ${esc(L.title)}</span></div>
    <div class="who" style="margin:6px 0 10px"><div class="avatar">${ch.emoji}</div><div><b>${esc(ch.name)}</b> <span class="muted small">· ${useAI ? "✨ AI conversation" : "Local practice mode"}</span>
      ${useAI ? "" : `<div class="small muted">Activa la IA en <a href="#/settings">Ajustes</a> para conversación libre real.</div>`}</div></div>
    <div class="chat" id="chat" aria-live="polite"></div>
    <div class="composer"><textarea class="inp" id="msg" rows="1" placeholder="Say anything…"></textarea>${sttAvailable() ? `<button class="mic" data-mic aria-label="Hablar">🎤</button>` : ""}<button class="btn primary" data-send>➤</button></div>
    <div class="controls">${sttAvailable() ? `<button class="btn sm" data-hands>🙌 Voice mode: off</button>` : ""}<button class="btn sm" data-end>🏁 End</button></div>`);
  const chatEl = $("#chat", v), msg = $("#msg", v);
  const bubble = (role, html) => { const b = document.createElement("div"); b.className = `bubble ${role}`; b.innerHTML = html; chatEl.appendChild(b); b.scrollIntoView({ block: "end" }); return b; };
  const say = (t) => speak(t, { rate: L.rate * s.settings.audioRate, accent: s.profile.accent }).then(() => { if (hands) mic(); });
  const first = useAI ? `Hi! I'm ${ch.name}. What would you like to talk about today?` : qs[0];
  bubble("ai", esc(first)); history.push({ role: "assistant", content: first }); say(first);

  async function mic() {
    const b = $("[data-mic]", v); if (!b || b.classList.contains("rec")) return;
    stopSpeaking(); b.classList.add("rec");
    try { const r = await listen({ accent: s.profile.accent, onInterim: (t) => (msg.value = t) }); spoken += r.sec; speakTime(r.sec); b.classList.remove("rec"); if (r.transcript) send(); }
    catch { b.classList.remove("rec"); }
  }
  async function send() {
    const text = msg.value.trim(); if (!text) return;
    msg.value = ""; turns++;
    bubble("me", esc(text));
    const found = analyzeText(text, "conversation").filter((e) => e.cat !== "Writing");
    if (found.length) { errs++; bubble("note", `💡 Better: <b>${esc(correct(text))}</b>`); }
    if (useAI) {
      history.push({ role: "user", content: text });
      const b = bubble("ai", "…");
      try {
        let acc = "";
        const sys = systemPrompt(`You are ${ch.name}, ${ch.role}. Personality: ${ch.voice}. Have a natural spoken conversation at conversation level ${lv}/7 (${L.title}). Keep each reply under 45 words and end with a question. ${lv <= 2 ? "Use very simple A1-A2 English." : lv === 5 ? "Use some idioms and phrasal verbs." : lv >= 6 ? "Use professional English." : ""} Do not correct the student inside the conversation; the app shows corrections separately.`);
        const reply = await chat({ system: sys, messages: history, onText: (d) => { acc += d; b.textContent = acc; } });
        history.push({ role: "assistant", content: reply });
        b.innerHTML = `${esc(reply)} ${audioBtn(reply, { cls: "btn sm" })}`;
        say(reply);
      } catch (e) { b.textContent = friendlyError(e); history.pop(); }
    } else {
      qi++;
      const reply = (tokenize(text).length > 6 ? "Interesting! " : "I see. ") + (qs[qi % qs.length]);
      bubble("ai", `${esc(reply)} ${audioBtn(reply, { cls: "btn sm" })}`);
      say(reply);
    }
  }
  on(v, "click", "[data-send]", send);
  msg.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  on(v, "click", "[data-mic]", (b) => (b.classList.contains("rec") ? stopListening() : mic()));
  on(v, "click", "[data-hands]", (el) => { hands = !hands; el.textContent = `🙌 Voice mode: ${hands ? "on" : "off"}`; if (hands) mic(); });
  on(v, "click", "[data-end]", () => {
    stopSpeaking();
    if (turns) { record(s.skills, "sk.speaking", { score: Math.max(0.3, 1 - errs / turns), produced: true }); s.conversations.push({ id: Date.now().toString(36), t: Date.now(), scenario: "free-talk", turns: history.slice(-30).map((h) => ({ role: h.role === "assistant" ? "ai" : "user", text: h.content })), eval: {} }); store.save(); }
    activity("conversation", { scenario: "free-talk", sec: Math.round((Date.now() - t0) / 1000), xp: turns * 4 });
    finishScreen({ title: "Nice chat!", emoji: "💬", lines: [["Your turns", turns], ["Speaking time", fmtMin(spoken)], ["Sentences to improve", errs]], next: "#/speak" });
  });
}

// ── AI Job Interview (secciones 59-62) ──
function interviewHome() {
  render(`${backLink("#/speak", "Speak")}<h1>🧑‍💻 AI Job Interview</h1>
    <div class="card"><b>⭐ STAR method</b><div class="small muted">Para preguntas de comportamiento (behavioral):</div>
      <table class="t">${STAR.map(([en, es, d, ex]) => `<tr><th>${en}<div class="small muted">${es}</div></th><td>${esc(d)}<div class="small"><i>${esc(ex)}</i></div></td></tr>`).join("")}</table></div>
    <h2>Candidate Mode</h2><p class="muted small">Tú eres el candidato. El reclutador te pregunta.</p>
    <div class="list">${Object.entries(INTERVIEW).map(([k, x]) => `<a class="item" href="#/interview/candidate/${k}"><span class="em">🎯</span><span class="grow"><span class="title">${esc(x.title)}</span><div class="sub">${x.level} · ${x.qs.length} questions</div></span>▶</a>`).join("")}</div>
    <h2>Recruiter Mode</h2><p class="muted small">Tú entrevistas; la IA es el candidato (ideal para RR. HH.).</p>
    <div class="list">${["basic", "professional", "behavioral"].map((k) => `<a class="item" href="#/interview/recruiter/${k}"><span class="em">🧑‍💼</span><span class="grow"><span class="title">${esc(INTERVIEW[k].title)}</span><div class="sub">${aiReady() ? "✨ AI candidate" : "Local candidate (limited)"}</div></span>▶</a>`).join("")}</div>`);
}

function starScore(text) {
  const t = text.toLowerCase();
  return {
    S: /\b(when|last (year|month|week)|in my (previous|last)|at my|once|there was)\b/.test(t),
    T: /\b(i had to|my (task|job|role|goal) was|i was responsible|we needed to|the goal)\b/.test(t),
    A: /\bi (\w+ed|made|took|spoke|led|built|found|went|wrote|decided|organized|organised)\b/.test(t),
    R: /\b(as a result|result|so |finally|in the end|we (reduced|improved|saved|achieved|delivered)|%|percent)\b/.test(t),
  };
}

function interviewCandidate(type) {
  const s = store.state;
  const I = INTERVIEW[type] || INTERVIEW.basic;
  const qs = I.qs;
  const answers = [];
  let k = 0, spoken = 0;
  const rec = CHARACTERS.recruiter;
  const ask = () => {
    if (k >= qs.length) return result();
    const q = qs[k];
    const v = render(`<div class="ex-head"><a class="iconbtn" href="#/interview">✕</a>${progressBar(k / qs.length)}<span class="small muted">${k + 1}/${qs.length}</span></div>
      <div class="who"><div class="avatar">${rec.emoji}</div><div><b>${rec.name}</b> <span class="muted small">· ${esc(I.title)}</span></div></div>
      <div class="bubble ai" style="margin:10px 0">${esc(q)} ${audioBtn(q, { cls: "btn sm" })}</div>
      ${type === "behavioral" ? `<div class="small muted">Use STAR: Situation → Task → Action → Result</div>` : ""}
      <div class="composer"><textarea class="inp" id="a" rows="4" placeholder="Your answer…"></textarea>${sttAvailable() ? `<button class="mic" data-mic aria-label="Hablar">🎤</button>` : ""}</div>
      <div id="fb"></div><div class="sticky-foot"><button class="btn primary big" data-next>Answer</button></div>`);
    speak(q, { accent: s.profile.accent, rate: s.settings.audioRate });
    let done = false;
    on(v, "click", "[data-mic]", async (b) => { b.classList.add("rec"); try { const r = await listen({ accent: s.profile.accent, maxSec: 60, onInterim: (t) => ($("#a", v).value = t) }); spoken += r.sec; speakTime(r.sec); } catch {} b.classList.remove("rec"); });
    on(v, "click", "[data-next]", (b) => {
      if (done) { k++; return ask(); }
      const text = $("#a", v).value.trim(); if (!text) return;
      done = true;
      const errs = analyzeText(text, "interview").filter((e) => e.cat !== "Writing");
      const st = starScore(text);
      answers.push({ q, text, errs: errs.length, words: tokenize(text).length, star: st });
      $("#fb", v).innerHTML = `<div class="feedback info">${errs.map((e) => `<div>• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b></div>`).join("") || "✅ No common grammar errors."}
        <div class="small" style="margin-top:6px">Length: ${tokenize(text).length} words ${tokenize(text).length < 20 ? "· try to give more detail and an example" : ""}</div>
        ${type === "behavioral" ? `<div class="small">STAR: ${Object.entries(st).map(([k2, ok]) => `${ok ? "✅" : "➖"} ${k2}`).join(" ")}</div>` : ""}</div>`;
      b.textContent = "Next question";
    });
  };
  const result = () => {
    const n = answers.length || 1;
    const avgWords = answers.reduce((a, x) => a + x.words, 0) / n;
    const errRate = answers.reduce((a, x) => a + x.errs, 0) / n;
    const starAvg = answers.reduce((a, x) => a + Object.values(x.star).filter(Boolean).length / 4, 0) / n;
    const allText = answers.map((a) => a.text).join(" ");
    const m = {
      "English Fluency": Math.min(1, avgWords / 45), Grammar: Math.max(0, 1 - errRate * 0.35),
      Vocabulary: Math.min(1, new Set(tokenize(allText)).size / 120 + 0.2), "Answer Structure": type === "behavioral" ? starAvg : Math.min(1, 0.4 + avgWords / 80),
      "Professional English": Math.min(1, 0.45 + (PRO_MARKERS.test(allText) ? 0.3 : 0) + (/\b(led|managed|implemented|developed|coordinated|improved|reduced|achieved)\b/i.test(allText) ? 0.25 : 0)),
      Clarity: Math.max(0.2, Math.min(1, 1 - Math.abs(avgWords - 55) / 90)),
    };
    const overall = Object.values(m).reduce((a, b) => a + b, 0) / 6;
    record(s.skills, "sk.speaking", { score: overall, produced: true, ctx: "interview" });
    record(s.skills, "b.career", { score: overall, produced: true });
    s.conversations.push({ id: Date.now().toString(36), t: Date.now(), scenario: "interview-" + type, pro: true, turns: answers.flatMap((a) => [{ role: "ai", text: a.q }, { role: "user", text: a.text }]), eval: Object.fromEntries(Object.entries(m).map(([k2, x]) => [k2, Math.round(x * 100)])) });
    store.save();
    activity("conversation", { scenario: "interview", sec: Math.round(spoken) + answers.length * 60, xp: 40 });
    const v = finishScreen({ title: "Interview evaluation", emoji: "🧑‍💻", lines: Object.entries(m).map(([k2, x]) => [k2, `${Math.round(x * 100)}%`]), next: "#/interview",
      extra: aiReady() ? `<div class="card" id="aiI"><button class="btn" data-ai>✨ AI feedback on my answers</button></div>` : "" });
    on(v, "click", "[data-ai]", async () => {
      const box = $("#aiI", v); box.innerHTML = `<p class="muted">✨ …</p>`;
      try { let acc = ""; await chat({ system: systemPrompt("You are an experienced recruiter and English coach."), messages: [{ role: "user", content: `Evaluate my ${I.title} answers (English fluency, grammar, vocabulary, answer structure${type === "behavioral" ? " using STAR" : ""}, professional English, clarity) and give an improved version of my weakest answer.\n\n${answers.map((a) => `Q: ${a.q}\nA: ${a.text}`).join("\n\n")}` }], effort: "medium", maxTokens: 1200, onText: (d) => { acc += d; box.innerHTML = `<div style="white-space:pre-wrap">${esc(acc)}</div>`; } }); }
      catch (e) { box.textContent = friendlyError(e); }
    });
  };
  ask();
}

// Recruiter Mode: el estudiante entrevista. IA = candidato; sin IA, candidato local con respuestas preparadas.
const CANDIDATE = [
  [/yourself|introduce|about you/i, "Sure. I'm Daniela, a mechanical engineer with seven years of experience in maintenance for the oil and gas industry."],
  [/strength/i, "I'm very organized and good at solving problems under pressure. For example, I reduced unplanned downtime by 15% last year."],
  [/weakness/i, "Sometimes I take on too many tasks myself. I'm learning to delegate more, and it's helping my team grow."],
  [/why.*(job|position|company|us)/i, "Your company is investing in renewable energy, and I want to use my maintenance experience in that area."],
  [/salary|expect/i, "Based on my experience and the market, I'm expecting between 3,500 and 4,000 dollars per month."],
  [/conflict|difficult|disagree/i, "Once a technician disagreed with a procedure. I listened, we checked the manual together, and we updated the procedure."],
  [/start|available|notice/i, "I could start in one month, after my notice period."],
  [/question/i, "Yes — what does success look like in this role after six months?"],
];
function interviewRecruiter(type) {
  const s = store.state;
  const useAI = aiReady();
  const history = [];
  const cand = { name: "Daniela", emoji: "👩‍🔧" };
  const v = render(`${backLink("#/interview", "Interview")}<h1>🧑‍💼 Recruiter Mode</h1><p class="muted small">You are the recruiter (${esc(INTERVIEW[type].title)}). Ask questions in English. ${useAI ? "✨ AI candidate" : "Candidato local: responde a preguntas típicas."}</p>
    <div class="chips">${INTERVIEW[type].qs.slice(0, 4).map((q) => `<button class="chip" data-sugg="${esc(q)}">${esc(q)}</button>`).join("")}</div>
    <div class="chat" id="chat" style="margin-top:12px"></div>
    <div class="composer"><textarea class="inp" id="msg" rows="1" placeholder="Ask a question…"></textarea><button class="btn primary" data-send>➤</button></div>
    <div class="controls"><button class="btn sm" data-end>🏁 End interview</button></div>`);
  const chatEl = $("#chat", v), msg = $("#msg", v);
  let turns = 0, errs = 0;
  const bubble = (role, html) => { const b = document.createElement("div"); b.className = `bubble ${role}`; b.innerHTML = html; chatEl.appendChild(b); b.scrollIntoView({ block: "end" }); return b; };
  async function send() {
    const q = msg.value.trim(); if (!q) return;
    msg.value = ""; turns++;
    bubble("me", esc(q));
    const e = analyzeText(q, "interview").filter((x) => x.cat !== "Writing");
    if (e.length) { errs++; bubble("note", `💡 Better: <b>${esc(correct(q))}</b>`); }
    if (useAI) {
      history.push({ role: "user", content: q });
      const b = bubble("ai", "…");
      try { let acc = ""; const reply = await chat({ system: `You are ${cand.name}, a realistic job candidate (mechanical engineer, 7 years in oil & gas maintenance) in a ${INTERVIEW[type].title}. Answer the recruiter naturally in 2-4 sentences. Stay in character.`, messages: history, onText: (d) => { acc += d; b.textContent = acc; } }); history.push({ role: "assistant", content: reply }); b.innerHTML = `${cand.emoji} ${esc(reply)}`; speak(reply, { accent: s.profile.accent }); }
      catch (err) { b.textContent = friendlyError(err); history.pop(); }
    } else {
      const hit = CANDIDATE.find(([re]) => re.test(q));
      const reply = hit ? hit[1] : "Could you rephrase the question, please?";
      bubble("ai", `${cand.emoji} ${esc(reply)}`); speak(reply, { accent: s.profile.accent });
    }
  }
  on(v, "click", "[data-sugg]", (el) => { msg.value = el.dataset.sugg; msg.focus(); });
  on(v, "click", "[data-send]", send);
  msg.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  on(v, "click", "[data-end]", () => {
    record(s.skills, "p.hr", { score: turns ? Math.max(0.3, 1 - errs / turns) : 0.3, produced: true });
    activity("conversation", { scenario: "recruiter", sec: turns * 40, xp: turns * 4 });
    s.conversations.push({ id: Date.now().toString(36), t: Date.now(), scenario: "recruiter-" + type, pro: true, turns: [], eval: {} }); store.save();
    finishScreen({ title: "Interview finished", emoji: "🧑‍💼", lines: [["Questions asked", turns], ["Questions to improve", errs]], next: "#/interview" });
  });
}
