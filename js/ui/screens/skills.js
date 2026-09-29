// Listening, Reading (Smart Reading), Writing Coach, Pronunciation Coach, Shadowing, Think in English y Translation Trainer
// (secciones 35-43, 141, 147-149).
import { esc, shuffle, levelIndex, LEVELS, pick } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { fullSentence } from "../../content/grammar.js";
import { SOUNDS, SOUND_BY_ID, SHADOWING } from "../../content/pronunciation.js";
import { WRITING_PROMPTS, THINK } from "../../content/extras.js";
import { EMAILS } from "../../content/professional.js";
import { check, wordDiff, speechScore, textComplexity } from "../../engine/grader.js";
import { detect, correct } from "../../engine/errors.js";
import { answer, analyzeText, activity, speakTime, addWord, lessonDone } from "../../core/actions.js";
import { record } from "../../engine/brain.js";
import { render, on, progressBar, audioBtn, speedPicker, tr, $, toast, backLink, tappable, openSheet, howTo } from "../components.js";
import { route, go, finishScreen, session } from "../app.js";
import { runExercises } from "../runner.js";
import { speak, listen, sttAvailable, stopListening } from "../../services/speech.js";
import { aiReady, structured, friendlyError } from "../../services/ai.js";
import { systemPrompt, explainLang } from "../../services/tutor.js";

const lvlOK = (lvl) => levelIndex(lvl) <= levelIndex(store.state.levels.overall) + 1;
const accent = () => store.state.profile.accent;

function sentencesForLevel(n = 8) {
  const li = levelIndex(store.state.levels.overall);
  const topics = C.grammar.filter((g) => levelIndex(g.level) <= li);
  return shuffle(topics.flatMap((g) => g.items.map((it) => ({ en: fullSentence(it), es: it[4], topic: g.id })))).slice(0, n);
}

export function registerSkills() {
  // ── LISTENING (sección 39) ──
  route("/listening", () => {
    const v = render(`${backLink("#/practice", "Practice")}<h1>🎧 Listening</h1>
    ${howTo("Cómo practicar listening", ["Elige un modo. Empieza por <b>Select what you heard</b> si eres principiante.", "Ajusta la velocidad: 0.5x o 0.75x al principio; 1x cuando te sientas seguro.", "Escucha todas las veces que necesites. Usa audífonos si puedes.", "Dictado: escribe TODO lo que oyes; la corrección te muestra palabra por palabra qué faltó."])}
    <p class="muted small">Audio speed:</p>${speedPicker()}
      <div class="list" style="margin-top:12px">
        <button class="item" data-mode="select"><span class="em">👂</span><span class="grow"><span class="title">Select what you heard</span><div class="sub">Elige la frase que escuchaste</div></span></button>
        <button class="item" data-mode="blank"><span class="em">🕳️</span><span class="grow"><span class="title">Fill the blank</span><div class="sub">Completa la palabra que falta</div></span></button>
        <button class="item" data-mode="dictation"><span class="em">📝</span><span class="grow"><span class="title">Dictation</span><div class="sub">Escribe lo que oyes</div></span></button>
        <button class="item" data-mode="questions"><span class="em">❓</span><span class="grow"><span class="title">Answer questions</span><div class="sub">Escucha un texto y responde</div></span></button>
        <button class="item" data-mode="keywords"><span class="em">🔑</span><span class="grow"><span class="title">Identify keywords</span><div class="sub">¿Qué palabra clave escuchaste?</div></span></button>
        <a class="item" href="#/shadowing"><span class="em">🔁</span><span class="grow"><span class="title">Shadowing</span><div class="sub">Listen · Read · Repeat · Compare</div></span></a>
      </div>`);
    on(v, "click", "[data-mode]", (el) => listeningSession(el.dataset.mode));
  });

  // ── READING (secciones 40-41) ──
  route("/reading", () => {
    const s = store.state;
    render(`${backLink("#/practice", "Practice")}<h1>📖 Reading</h1><p class="muted small">Toca cualquier palabra para ver definición, traducción y audio.</p>
      ${LEVELS.map((L) => {
        const rs = C.readings.filter((r) => r.level === L);
        return rs.length ? `<h2>${L}</h2><div class="list">${rs.map((r) => `<a class="item" href="#/read/${r.id}"><span class="em">${r.icon}</span><span class="grow"><span class="title">${esc(r.title)}</span><div class="sub">${L}${s.log.some((e) => e.kind === "read" && e.id === r.id) ? " · ✔ read" : ""}</div></span>▶</a>`).join("")}</div>` : "";
      }).join("")}`);
  });

  route("/read/:id", ({ id }) => {
    const r = C.readingById[id];
    if (!r) return go("#/reading");
    const lesson = session.lesson?.ref === id ? session.lesson : null;
    const t0 = Date.now();
    const known = (w) => !!C.words.find((x) => x.word.toLowerCase() === w.toLowerCase());
    const v = render(`${backLink(lesson ? `#/unit/${lesson.unit}` : "#/reading", lesson ? "Unit" : "Reading")}
      <div class="row between"><h1>${r.icon} ${esc(r.title)}</h1><span class="lvl">${r.level}</span></div>
      ${howTo("Cómo leer este texto", ["Lee el texto completo una vez sin detenerte, para entender la idea general.", "Léelo otra vez: <b>toca cualquier palabra</b> que no conozcas para ver su significado, escucharla y añadirla a tu vocabulario.", "Opcional: pulsa 🔊 Listen para escucharlo mientras lees.", "Pulsa <b>Answer questions</b> y responde las preguntas de comprensión."])}
      <div class="row">${audioBtn(r.text, { label: "🔊 Listen", cls: "btn sm" })}${speedPicker()}</div>
      <div class="card reader" style="margin-top:10px">${tappable(r.text, known)}</div>
      <div class="sticky-foot"><button class="btn primary big" data-q>Answer questions</button></div>`);
    on(v, "click", "[data-word]", (el) => wordSheet(el.dataset.word, r.text));
    on(v, "click", "[data-q]", () => {
      const items = r.q.map(([q, a, d]) => ({ type: "choose", prompt: q, options: shuffle([a, ...d]), answer: a, concept: null, skill: "sk.reading", ctx: r.topic }));
      runExercises({
        title: r.title, items, back: `#/read/${id}`,
        onDone: (res) => {
          activity("read", { id, sec: Math.round((Date.now() - t0) / 1000), xp: 10 });
          if (lesson) lessonDone(lesson, res.score);
          finishScreen({ title: "Reading complete", emoji: "📖", stars: res.score >= 0.9 ? 3 : res.score >= 0.6 ? 2 : 1, lines: [["Comprehension", `${res.ok}/${res.total}`]], next: lesson ? `#/unit/${lesson.unit}` : "#/reading" });
        },
      });
    });
  });

  // ── WRITING COACH (secciones 42-43, 48) ──
  route("/writing", () => {
    const s = store.state;
    render(`${backLink("#/practice", "Practice")}<h1>✍️ Writing Coach</h1>
      <a class="card tap" href="#/email"><b>📧 WRITE MY EMAIL</b><div class="muted small">Escribe un correo y recibe versiones corregida, natural y profesional.</div></a>
      <h2>Tasks</h2><div class="list">${WRITING_PROMPTS.map((p) => `<a class="item" href="#/writing/${p.id}"><span class="em">${p.email ? "📧" : "📝"}</span><span class="grow"><span class="title">${esc(p.type)} <span class="lvl" style="height:22px;font-size:.75rem">${p.level}</span></span><div class="sub">${esc(p.prompt)}</div></span></a>`).join("")}</div>`);
  });
  route("/writing/:id", ({ id }) => writingTask(WRITING_PROMPTS.find((p) => p.id === id)));
  route("/email", () => writingTask({ id: "free-email", type: "Email", level: store.state.levels.overall, prompt: "Write any work email you need (paste your draft).", es: "Escribe o pega el correo que necesitas enviar.", min: 20, email: true, free: true }));

  // ── PRONUNCIATION COACH (secciones 35-38) ──
  route("/pronunciation", () => {
    const s = store.state;
    render(`${backLink("#/practice", "Practice")}<h1>👄 Pronunciation Coach</h1><p class="muted small">ECHO analiza tu pronunciación con el reconocimiento de voz del navegador${sttAvailable() ? "" : " (no disponible aquí: usa escuchar y repetir)"}.</p>
      <a class="card tap" href="#/shadowing"><b>🔁 SHADOWING MODE</b><div class="muted small">Listen → Read → Repeat → Compare → Repeat without text</div></a>
      <h2>Problem sounds</h2><div class="grid2">${SOUNDS.map((x) => { const r = s.skills[x.id]; return `<a class="tile" href="#/pron/${x.id}"><span class="em">${x.icon}</span><b>${esc(x.title)}</b><span>${r ? Math.round(r.m * 100) + "%" : "New"}</span></a>`; }).join("")}</div>`);
  });
  route("/pron/:id", ({ id }) => pronSound(SOUND_BY_ID[id]));
  route("/shadowing", () => shadowing());

  // ── THINK IN ENGLISH (sección 141) ──
  route("/think", () => {
    const items = shuffle(THINK).slice(0, 5);
    let k = 0;
    const next = () => {
      if (k >= items.length) return finishScreen({ title: "You're thinking in English!", emoji: "💭", lines: [["Situations", items.length]], next: "#/practice" });
      const it = items[k];
      const v = render(`<div class="ex-head"><a class="iconbtn" href="#/practice">✕</a>${progressBar(k / items.length)}</div>
        <div class="muted small">THINK IN ENGLISH · no Spanish</div><div class="instr"><span class="ic">💭</span><div>Mira la situación y responde <b>directamente en inglés</b>, sin traducir mentalmente. Frases simples están perfectas.</div></div><div class="emoji-big">${it.emoji}</div><div class="prompt center">${esc(it.prompt)}</div>
        <div class="composer"><textarea class="inp" id="a" rows="2" placeholder="Answer directly in English…"></textarea>${sttAvailable() ? `<button class="mic" data-mic aria-label="Hablar">🎤</button>` : ""}</div><div id="fb"></div>
        <div class="sticky-foot"><button class="btn primary big" data-check>Check</button></div>`);
      let done = false;
      on(v, "click", "[data-mic]", async (el) => { el.classList.add("rec"); try { const r = await listen({ accent: accent(), onInterim: (t) => ($("#a", v).value = t) }); speakTime(r.sec); } catch {} el.classList.remove("rec"); });
      on(v, "click", "[data-check]", (b) => {
        if (done) { k++; return next(); }
        const text = $("#a", v).value.trim(); if (!text) return;
        done = true;
        const errs = analyzeText(text, "think");
        const relevant = it.kw.every((p) => new RegExp(p, "i").test(text));
        answer({ concept: null, skill: "sk.speaking", ok: relevant && !errs.length, score: relevant ? (errs.length ? 0.6 : 1) : 0.4, type: "type" });
        $("#fb", v).innerHTML = `<div class="feedback ${relevant && !errs.length ? "ok" : "info"}"><h4>${relevant ? (errs.length ? "Good idea — let's polish it" : "✅ Natural and clear!") : "Try to answer the situation directly"}</h4>
          ${errs.map((e) => `<div>• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b></div>`).join("")}<div class="small muted">A natural answer:</div><b>${esc(it.sample)}</b> ${audioBtn(it.sample, { cls: "btn sm" })}</div>`;
        b.textContent = "Continue";
      });
    };
    next();
  });

  // ── TRANSLATION TRAINER (sección 147): reduce progresivamente la dependencia ──
  route("/translate", () => {
    const li = levelIndex(store.state.levels.overall);
    const list = sentencesForLevel(6);
    const items = list.map((x, i) => {
      if (i % 3 === 2 && li < 3) return { type: "choose", prompt: `“${x.en}” means…`, options: shuffle([x.es, ...shuffle(list.filter((y) => y !== x)).slice(0, 2).map((y) => y.es)]), answer: x.es, concept: x.topic, ctx: "translate" };
      return { type: "translate", prompt: x.es, answer: x.en, full: x.en, es: x.es, concept: x.topic, topic: x.topic, ctx: "translate" };
    });
    runExercises({ title: "Translation trainer", items, back: "#/practice", onDone: (r) => finishScreen({ title: "Translation practice done", emoji: "🔄", lines: [["Correct", `${r.ok}/${r.total}`], ["Tip", li >= 2 ? "Try Think in English next" : "Keep going!"]], next: "#/practice" }) });
  });
}

// Ficha rápida de palabra en Smart Reading (sección 41)
export function wordSheet(raw, context = "") {
  const w0 = raw.toLowerCase().replace(/[’']s$/, "");
  const cands = [w0, w0.replace(/(ies)$/, "y"), w0.replace(/(es|s|ed|ing)$/, ""), w0.replace(/(ed|ing)$/, "e")];
  const w = C.words.find((x) => cands.includes(x.word.toLowerCase()));
  const sh = openSheet(w
    ? `<div class="row between"><h2 style="margin:0">${w.emoji} ${esc(w.word)}</h2><button class="iconbtn" data-close>✕</button></div>
       <div class="muted">/${esc(w.ipa)}/ · ${w.cefr}</div><div class="row" style="margin:8px 0">${audioBtn(w.word, { cls: "btn sm", label: "🔊 Pronunciation" })}</div>
       <div><b>${esc(w.es)}</b></div><div>${esc(w.def)}</div><div><i>${esc(w.ex)}</i></div>
       <div class="row" style="margin-top:12px"><button class="btn primary" data-add="${w.id}">➕ Add to Vocabulary</button><a class="btn" href="#/word/${w.id}" data-close>Open card</a></div>`
    : `<div class="row between"><h2 style="margin:0">${esc(raw)}</h2><button class="iconbtn" data-close>✕</button></div>
       <div class="row" style="margin:8px 0">${audioBtn(raw, { cls: "btn sm", label: "🔊 Pronunciation" })}</div>
       <p class="muted">Esta palabra aún no está en el diccionario de la app.</p><button class="btn" data-askw>🙋 Ask my teacher</button>`);
  sh.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-add]");
    if (a) { addWord(a.dataset.add); a.textContent = "✔ Added"; }
    if (e.target.closest("[data-askw]")) { const { openAsk } = await import("./ask.js"); openAsk(`What does "${raw}" mean in this context: "${context.slice(0, 200)}"?`); }
  });
}

function listeningSession(mode) {
  const list = sentencesForLevel(mode === "questions" ? 0 : 6);
  let items = [];
  if (mode === "select") items = list.map((x) => {
    const distract = shuffle(list.filter((y) => y !== x)).slice(0, 2).map((y) => y.en);
    return { type: "listen", prompt: x.en, options: shuffle([x.en, ...distract]), answer: x.en, skill: "sk.listening", concept: null, ctx: "listening" };
  });
  if (mode === "blank") items = list.map((x) => {
    const ws = x.en.split(" "); const k = ws.reduce((best, w, i) => (w.replace(/\W/g, "").length > ws[best].replace(/\W/g, "").length ? i : best), 0);
    const target = ws[k].replace(/[.,?!]/g, "");
    return { type: "listen-type", prompt: x.en, gapped: ws.map((w, i) => (i === k ? w.replace(target, "_____") : w)).join(" "), answer: target, skill: "sk.listening" };
  });
  if (mode === "dictation") items = list.slice(0, 5).map((x) => ({ type: "dictation", prompt: x.en, answer: x.en, skill: "sk.listening", es: x.es }));
  if (mode === "keywords") items = list.map((x) => {
    const ws = x.en.replace(/[.,?!]/g, "").split(" ").filter((w) => w.length > 3);
    const key = pick(ws);
    const others = shuffle(C.words.filter((w) => !w.word.includes(" ") && w.word.toLowerCase() !== key.toLowerCase())).slice(0, 3).map((w) => w.word);
    return { type: "listen", prompt: x.en, options: shuffle([key, ...others]), answer: key, skill: "sk.listening" };
  });
  if (mode === "questions") {
    const r = shuffle(C.readings.filter((x) => lvlOK(x.level)))[0];
    items = [{ type: "listen-text", text: r.text }, ...r.q.map(([q, a, d]) => ({ type: "choose", prompt: q, options: shuffle([a, ...d]), answer: a, skill: "sk.listening" }))];
  }
  runListening(items, mode);
}

// Variante de ejecución para ejercicios de audio (dictado / hueco / texto)
function runListening(items, mode) {
  const s = store.state;
  const simple = items.filter((x) => ["listen", "choose"].includes(x.type));
  if (simple.length === items.length) {
    return runExercises({ title: "Listening", items, back: "#/listening", onDone: (r) => { activity("listening", { sec: items.length * 20 }); finishScreen({ title: "Listening done", emoji: "🎧", lines: [["Correct", `${r.ok}/${r.total}`]], next: "#/listening" }); } });
  }
  let k = 0, ok = 0, total = 0;
  const next = () => {
    if (k >= items.length) { activity("listening", { sec: items.length * 25 }); return finishScreen({ title: "Listening done", emoji: "🎧", lines: [["Correct", `${ok}/${total}`]], next: "#/listening" }); }
    const it = items[k];
    if (it.type === "listen-text") {
      const v = render(`<div class="ex-head"><a class="iconbtn" href="#/listening">✕</a>${progressBar(0)}</div><h2>Listen to the text</h2>${speedPicker()}
        <div class="center" style="margin:20px 0"><button class="btn primary big" data-play>🔊 Play</button></div>
        <details class="card soft"><summary>Show text (captions)</summary><div class="reader">${esc(it.text)}</div></details>
        <div class="sticky-foot"><button class="btn primary big" data-next>Answer questions</button></div>`);
      on(v, "click", "[data-play]", () => speak(it.text, { rate: s.settings.audioRate, accent: accent() }));
      on(v, "click", "[data-next]", () => { const rest = items.slice(1); runExercises({ title: "Listening", items: rest, back: "#/listening", onDone: (r) => { activity("listening", { sec: 120 }); finishScreen({ title: "Listening done", emoji: "🎧", lines: [["Correct", `${r.ok}/${r.total}`]], next: "#/listening" }); } }); });
      return;
    }
    const v = render(`<div class="ex-head"><a class="iconbtn" href="#/listening">✕</a>${progressBar(k / items.length)}<span class="small muted">${k + 1}/${items.length}</span></div>
      <div class="muted small">${it.type === "dictation" ? "DICTATION · write everything you hear" : "FILL THE BLANK"}</div>
      <div class="center" style="margin:14px 0"><button class="btn primary" data-play>🔊 Play</button> <button class="btn" data-slow>🐢 Slow</button></div>
      ${it.gapped ? `<div class="prompt">${esc(it.gapped).replace("_____", '<span class="blank"></span>')}</div>` : ""}
      <input class="inp" id="a" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${it.type === "dictation" ? "Type the sentence…" : "Missing word"}"><div id="fb"></div>
      <div class="sticky-foot"><button class="btn primary big" data-check>Check</button></div>`);
    const play = (slow) => speak(it.prompt, { rate: slow ? 0.7 : s.settings.audioRate, accent: accent() });
    setTimeout(() => play(), 300);
    on(v, "click", "[data-play]", () => play());
    on(v, "click", "[data-slow]", () => play(true));
    let done = false;
    const inp = $("#a", v);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") $("[data-check]", v).click(); });
    on(v, "click", "[data-check]", (b) => {
      if (done) { k++; return next(); }
      const text = inp.value.trim(); if (!text) return;
      done = true; total++;
      const r = check(text, [it.answer]);
      if (r.ok) ok++;
      answer({ concept: null, skill: "sk.listening", ok: r.ok, type: "type" });
      $("#fb", v).innerHTML = `<div class="feedback ${r.ok ? "ok" : "bad"}"><h4>${r.ok ? "✅ Well done." : "Almost — compare:"}</h4>${r.ok ? "" : `<div class="diff">${wordDiff(text, it.prompt).map((d) => `<span class="${d.s}">${esc(d.w)}</span>`).join(" ")}</div>`}<div><b>${esc(it.prompt)}</b></div>${it.es ? tr(it.es) : ""}</div>`;
      b.textContent = "Continue";
    });
  };
  next();
}

export function writingTask(p, back = "#/writing") {
  if (!p) return go("#/writing");
  const s = store.state;
  const t0 = Date.now();
  const tmpl = p.email ? EMAILS.filter((e) => e.tone).slice(0, 3) : [];
  const v = render(`${backLink(back, back === "#/writing" ? "Writing" : "Back")}<div class="muted small">${esc(p.type)} · ${p.level}</div><h1>${esc(p.prompt)}</h1>${tr(p.es)}
    ${p.email ? `<details class="card soft"><summary>📐 Email structure</summary><ol class="small"><li>Greeting (Dear… / Hi…)</li><li>Purpose (I'm writing to…)</li><li>Details</li><li>Request / next step (Could you…?)</li><li>Closing (Best regards,)</li></ol><div class="small">Models: ${tmpl.map((e) => `<a href="#" data-model="${e.id}">${esc(e.title)}</a>`).join(" · ")}</div></details>` : ""}
    ${howTo("Cómo escribir tu texto", ["Lee la consigna y piensa 1 minuto qué quieres decir.", p.email ? "Sigue la estructura: saludo → propósito → detalles → petición → despedida (mira los modelos arriba)." : "Organiza tus ideas: introducción, 2–3 ideas con ejemplos y una conclusión.", `Escribe al menos <b>${p.min} palabras</b>. Usa conectores: because, so, however, although…`, "Pulsa <b>Check my writing</b>: verás los errores explicados, la versión corregida y (con IA) versiones natural y profesional."])}
    <textarea class="inp" id="t" rows="9" placeholder="Write here…" style="margin-top:10px"></textarea>
    <div class="row between small muted"><span id="wc">0 words</span><span>min. ${p.min}</span></div>
    <div id="fb"></div><div class="sticky-foot"><button class="btn primary big" data-check>Check my writing</button></div>`);
  const ta = $("#t", v);
  ta.addEventListener("input", () => ($("#wc", v).textContent = `${ta.value.trim().split(/\s+/).filter(Boolean).length} words`));
  on(v, "click", "[data-model]", (el, e) => { e.preventDefault(); const m = EMAILS.find((x) => x.id === el.dataset.model); openSheet(`<h2>${esc(m.title)}</h2><div class="small muted">Subject: ${esc(m.subject)}</div><div class="email">${esc(m.body)}</div><button class="btn" data-close style="margin-top:10px">Close</button>`); });
  on(v, "click", "[data-check]", async () => {
    const text = ta.value.trim();
    if (!text) return;
    const errs = analyzeText(text, p.email ? "email" : "writing");
    const fixed = correct(text);
    const c = textComplexity(text);
    const hasGreeting = /^(dear|hi|hello|good (morning|afternoon))\b/im.test(text), hasClosing = /(regards|best|sincerely|thanks|thank you|cheers)[,!.]?\s*(\n|$)/im.test(text);
    const polite = /\b(could you|would you|please|i would like|i'd like|would it be possible)\b/i.test(text);
    const checks = p.email ? [["Greeting", hasGreeting], ["Polite request", polite], ["Closing", hasClosing], ["Length", c.words >= p.min]] : [["Length", c.words >= p.min], ["Connectors (because, however…)", c.connectors > 0], ["Variety of tenses", c.tenses >= 2]];
    const score = Math.max(0, 1 - errs.length * 0.12) * (0.6 + 0.4 * (checks.filter((x) => x[1]).length / checks.length));
    record(s.skills, "sk.writing", { score, produced: true });
    if (p.email) { record(s.skills, "b.emails", { score, produced: true }); s.emails = (s.emails || 0) + 1; activity("email", { sec: Math.round((Date.now() - t0) / 1000), xp: 15 }); }
    else { s.writings = (s.writings || 0) + 1; activity("write", { sec: Math.round((Date.now() - t0) / 1000), xp: 15 }); }
    const fb = $("#fb", v);
    fb.innerHTML = `<div class="card" style="margin-top:12px"><h3>Analysis</h3>
      <table class="t">${checks.map(([k, ok]) => `<tr><td>${esc(k)}</td><td>${ok ? "✅" : "➖"}</td></tr>`).join("")}<tr><td>Grammar issues found</td><td>${errs.length}</td></tr><tr><td>Words</td><td>${c.words}</td></tr></table>
      ${errs.length ? `<h3 style="margin-top:12px">What to fix</h3>${errs.map((e) => `<div style="margin-bottom:6px">• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b><div class="small muted">${esc(explainLang() === "en" ? e.en : e.es)}</div></div>`).join("")}` : ""}
      <h3 style="margin-top:12px">Original</h3><div class="email">${esc(text)}</div>
      <h3 style="margin-top:12px">Corrected</h3><div class="email">${esc(fixed)}</div>
      <div id="ai">${aiReady() ? `<p class="muted small">✨ Preparing natural and professional versions…</p>` : `<p class="muted small">Activa la IA en Ajustes para recibir versiones <b>Natural</b> y <b>Professional</b> y análisis de tono y claridad.</p>`}</div></div>`;
    if (aiReady()) {
      try {
        const out = await structured({
          system: systemPrompt("You are a writing coach. Return only the JSON requested."),
          prompt: `Task: ${p.prompt}\nStudent text:\n"""${text}"""\nEvaluate grammar, vocabulary, clarity, naturalness, tone, structure and professionalism (0-10 each). Provide corrected, natural and professional versions and up to 4 short tips.`,
          schema: { type: "object", additionalProperties: false, required: ["scores", "corrected", "natural", "professional", "tips"], properties: {
            scores: { type: "object", additionalProperties: false, required: ["grammar", "vocabulary", "clarity", "naturalness", "tone", "structure", "professionalism"], properties: Object.fromEntries(["grammar", "vocabulary", "clarity", "naturalness", "tone", "structure", "professionalism"].map((k) => [k, { type: "integer" }])) },
            corrected: { type: "string" }, natural: { type: "string" }, professional: { type: "string" }, tips: { type: "array", items: { type: "string" } } } },
        });
        $("#ai", v).innerHTML = `<h3 style="margin-top:12px">Scores</h3><div class="chips">${Object.entries(out.scores).map(([k, n]) => `<span class="chip">${k} ${n}/10</span>`).join("")}</div>
          <h3 style="margin-top:12px">Natural version</h3><div class="email">${esc(out.natural)}</div><h3 style="margin-top:12px">Professional version</h3><div class="email">${esc(out.professional)}</div>
          <h3 style="margin-top:12px">Tips</h3><ul>${out.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      } catch (e) { $("#ai", v).innerHTML = `<p class="small muted">${esc(friendlyError(e))}</p>`; }
    }
  });
}

// Entrenador por sonido: escuchar pares mínimos → discriminar → decir palabras y frases
function pronSound(snd) {
  if (!snd) return go("#/pronunciation");
  const s = store.state;
  const lesson = session.lesson?.ref === snd.id ? session.lesson : null;
  const v = render(`${backLink(lesson ? `#/unit/${lesson.unit}` : "#/pronunciation", lesson ? "Unit" : "Pronunciation")}
    <h1>${snd.icon} ${esc(snd.title)}</h1>${howTo("Cómo entrenar este sonido", ["Lee el consejo de ECHO sobre cómo poner la boca y la lengua.", "Escucha los <b>pares mínimos</b> (palabras casi iguales) y nota la diferencia.", "Toca las palabras y frases para escucharlas y repítelas en voz alta.", "Pulsa <b>Start training</b>: primero distingues sonidos al oírlos y luego los dices con el micrófono."])}<div class="card"><b>ECHO 🎧:</b> ${esc(explainLang() === "en" ? snd.tip.en : snd.tip.es)}</div>
    <h2>Minimal pairs</h2>${speedPicker()}<div class="list" style="margin-top:8px">${snd.pairs.map(([a, b]) => `<div class="item" style="cursor:default"><span class="grow"><b>${esc(a)}</b> vs <b>${esc(b)}</b></span>${audioBtn(a)}${audioBtn(b)}</div>`).join("")}</div>
    <h2>Words & sentences</h2><div class="chips">${snd.words.map((w) => `<button class="chip" data-say="${esc(w)}">${esc(w)}</button>`).join("")}</div>
    <div class="list" style="margin-top:8px">${snd.sentences.map((x) => `<div class="item" style="cursor:default"><span class="grow">${esc(x)}</span>${audioBtn(x)}</div>`).join("")}</div>
    <div class="sticky-foot"><button class="btn primary big" data-train>🎤 Start training</button></div>`);
  on(v, "click", "[data-train]", () => {
    const clean = (x) => x.replace(/\s*\/[^/]+\/|[↗↘]|\([^)]*\)/g, "").trim();
    const disc = snd.pairs.slice(0, 3).map(([a, b]) => { const t = Math.random() < 0.5 ? a : b; return { type: "listen", prompt: clean(t), options: shuffle([clean(a), clean(b)]), answer: clean(t), concept: snd.id, skill: "sk.listening" }; });
    const sayW = shuffle(snd.words).slice(0, 3).map((w) => ({ type: "say", prompt: clean(w), answer: clean(w), concept: snd.id }));
    const sayS = snd.sentences.slice(0, 2).map((x) => ({ type: "speak", prompt: clean(x), answer: clean(x), concept: snd.id }));
    runExercises({
      title: snd.title, items: [...disc, ...sayW, ...sayS], back: `#/pron/${snd.id}`,
      onDone: (r) => {
        activity("pron", { sound: snd.id, score: r.score, sec: 180 });
        record(s.skills, "sk.speaking", { score: r.score });
        if (lesson) lessonDone(lesson, r.score);
        finishScreen({ title: r.score >= 0.8 ? "Your pronunciation improved." : "Let's reinforce this one more time.", emoji: "👄", lines: [["Score", `${Math.round(r.score * 100)}%`], ["Sound", snd.title]], next: lesson ? `#/unit/${lesson.unit}` : "#/pronunciation" });
      },
    });
  });
}

// SHADOWING (sección 38): Listen → Read → Repeat → Compare → Repeat without text
function shadowing() {
  const s = store.state;
  const lvl = s.levels.overall;
  const list = SHADOWING[lvl] || SHADOWING.A1;
  let k = 0, stage = 0, scores = [];
  const STAGES = ["1 · Listen", "2 · Read", "3 · Repeat", "4 · Compare", "5 · Repeat without text"];
  const HELP = ["Escucha la frase sin leerla. Concéntrate en el ritmo y la entonación.", "Ahora lee la frase mientras la escuchas otra vez (🔊).", "Pulsa 🎤 y repite la frase imitando la voz lo más parecido posible.", "Repite de nuevo y compara: verás qué palabras se entendieron (verde) y cuáles faltaron.", "¡Reto! Repite la frase SIN ver el texto, de memoria."];
  const step = () => {
    if (k >= list.length) {
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      if (scores.length) record(s.skills, "sk.speaking", { score: avg });
      activity("pron", { sound: "shadowing", score: avg, sec: list.length * 40 });
      return finishScreen({ title: "Shadowing complete", emoji: "🔁", lines: [["Sentences", list.length], ["Average match", scores.length ? `${Math.round(avg * 100)}%` : "—"]], next: "#/pronunciation" });
    }
    const text = list[k];
    const hide = stage === 4;
    const v = render(`<div class="ex-head"><a class="iconbtn" href="#/pronunciation">✕</a>${progressBar((k * 5 + stage) / (list.length * 5))}<span class="small muted">${k + 1}/${list.length}</span></div>
      <div class="muted small">SHADOWING · ${lvl}</div><h2>${STAGES[stage]}</h2><div class="instr"><span class="ic">🔁</span><div>${HELP[stage]}</div></div>${speedPicker()}
      <div class="card center" style="margin-top:10px;font-size:1.25rem;font-weight:700;min-height:70px">${hide || stage === 0 ? "🙈 ……" : esc(text)}</div>
      <div class="center" style="margin:14px 0">${audioBtn(text, { cls: "btn primary", label: "🔊 Listen" })}</div>
      ${stage >= 2 ? `<div class="center"><button class="mic" data-mic aria-label="Hablar">🎤</button><div class="small muted" id="heard">${sttAvailable() ? "Repeat the sentence." : "Repeat aloud, then continue."}</div></div>` : ""}
      <div id="cmp"></div>
      <div class="sticky-foot"><button class="btn primary big" data-next>${stage < 4 ? "Next step" : "Next sentence"}</button></div>`);
    if (stage <= 1) setTimeout(() => speak(text, { rate: s.settings.audioRate, accent: accent() }), 300);
    on(v, "click", "[data-mic]", async (el) => {
      el.classList.add("rec");
      try {
        const r = await listen({ accent: accent(), onInterim: (t) => ($("#heard", v).textContent = t) });
        speakTime(r.sec);
        const sc = speechScore(r.transcript, text, r.confidence);
        scores.push(sc.score);
        $("#cmp", v).innerHTML = `<div class="feedback ${sc.score >= 0.8 ? "ok" : "info"}"><b>Match ${Math.round(sc.score * 100)}%</b><div class="diff">${wordDiff(r.transcript, text).map((d) => `<span class="${d.s}">${esc(d.w)}</span>`).join(" ")}</div></div>`;
      } catch { $("#heard", v).textContent = "I couldn't hear you."; }
      el.classList.remove("rec");
    });
    on(v, "click", "[data-next]", () => { if (stage < 4) stage++; else { stage = 0; k++; } step(); });
  };
  step();
}
