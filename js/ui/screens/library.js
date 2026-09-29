// Biblioteca (secciones 106-110, 146), juegos (93) y Document English Lab / Camera (112-113).
import { esc, shuffle, pick, levelIndex } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { fullSentence } from "../../content/grammar.js";
import { FALSE_FRIENDS, PHRASAL_VERBS, IDIOMS, COLLOCATIONS, US_UK, NATURAL } from "../../content/extras.js";
import { SOUNDS } from "../../content/pronunciation.js";
import { makeGrammarExercise, vocabExercise } from "../../engine/exercises.js";
import { detect, correct } from "../../engine/errors.js";
import { answer, activity, addWord, wordResult } from "../../core/actions.js";
import { render, on, audioBtn, backLink, progressBar, $, tappable, toast } from "../components.js";
import { route, go, finishScreen } from "../app.js";
import { runExercises } from "../runner.js";
import { wordSheet } from "./skills.js";
import { aiReady, ask, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

const LIB = {
  falsefriends: { title: "⚠️ False friends", es: "Palabras que parecen españolas pero significan otra cosa.", rows: FALSE_FRIENDS.map(([w, es, trap, ex, ex2]) => ({ h: w, es: `= ${es}`, sub: `≠ ${trap}`, ex: [ex, ex2] })) },
  phrasal: { title: "🧗 Phrasal verbs", es: "Verbo + partícula = significado nuevo.", rows: PHRASAL_VERBS.map(([w, es, ex, ctx]) => ({ h: w, es, sub: ctx, ex: [ex] })) },
  idioms: { title: "🦜 Idioms", es: "Expresiones idiomáticas y su registro.", rows: IDIOMS.map(([w, es, ex, reg]) => ({ h: w, es, sub: reg, ex: [ex] })) },
  collocations: { title: "🔗 Collocations", es: "Combinaciones naturales de palabras.", rows: COLLOCATIONS.map(([w, es]) => ({ h: w, es, ex: [] })) },
  usuk: { title: "🇺🇸 🇬🇧 American vs British", es: "Mismo significado, palabra distinta.", rows: US_UK.map(([us, uk, es]) => ({ h: `🇺🇸 ${us} · 🇬🇧 ${uk}`, es, ex: [], us, uk })) },
};

export function registerLibrary() {
  route("/library/:kind", ({ kind }) => {
    if (kind === "natural") return naturalScreen();
    const L = LIB[kind];
    if (!L) return go("#/practice");
    const v = render(`${backLink("#/practice", "Practice")}<h1>${L.title}</h1><p class="muted">${esc(L.es)}</p>
      <div class="stack" style="margin:10px 0"><button class="btn primary" data-quiz>🎯 Practice this list</button></div>
      <div class="list">${L.rows.map((r) => `<div class="card soft"><div class="row between"><b>${esc(r.h)}</b>${audioBtn(r.us ? (store.state.profile.accent === "uk" ? r.uk : r.us) : r.h, { cls: "btn sm" })}</div><div>${esc(r.es)}</div>${r.sub ? `<div class="small muted">${esc(r.sub)}</div>` : ""}${r.ex.map((e) => `<div class="small"><i>${esc(e)}</i></div>`).join("")}</div>`).join("")}</div>`);
    on(v, "click", "[data-quiz]", () => {
      const rows = shuffle(L.rows).slice(0, 8);
      const items = rows.map((r) => ({ type: "choose", prompt: `${r.h} →`, options: shuffle([r.es, ...shuffle(L.rows.filter((x) => x !== r)).slice(0, 2).map((x) => x.es)]), answer: r.es, concept: kind === "phrasal" ? "g.phrasal-verbs" : null, skill: null, ctx: kind }));
      runExercises({ title: L.title, items, back: `#/library/${kind}`, onDone: (res) => finishScreen({ title: "Nice work", emoji: "📘", lines: [["Correct", `${res.ok}/${res.total}`]], next: `#/library/${kind}` }) });
    });
  });

  route("/games", () => {
    const G = [["match", "🔗", "Word Match", "Empareja inglés–español"], ["builder", "🧱", "Sentence Builder", "Ordena las palabras"], ["listening", "🎧", "Listening Challenge", "¿Qué frase escuchaste?"], ["race", "🏎️", "Vocabulary Race", "60 segundos"], ["puzzle", "🧩", "Grammar Puzzle", "Temas mezclados"], ["pron", "🎤", "Pronunciation Challenge", "Palabras difíciles"], ["detective", "🕵️", "Word Detective", "Encuentra el error"], ["memory", "🃏", "Memory Vocabulary", "Parejas de cartas"]];
    render(`${backLink("#/practice", "Practice")}<h1>🎮 Game Mode</h1><p class="muted small">Jugar también es practicar: cada respuesta actualiza tu English Brain.</p>
      <div class="grid2">${G.map(([id, e, t, d]) => `<a class="tile" href="#/game/${id}"><span class="em">${e}</span><b>${t}</b><span>${d}</span></a>`).join("")}</div>`);
  });
  route("/game/:id", ({ id }) => game(id));

  route("/doclab", () => docLab());
}

function naturalScreen() {
  render(`${backLink("#/practice", "Practice")}<h1>🌿 Natural English</h1><p class="muted">Textbook → Correct → Natural → Professional</p>
    ${NATURAL.map((n) => `<div class="card"><div class="muted small">${esc(n.situation)}</div><table class="t">
      <tr><th>📕 Textbook</th><td><s>${esc(n.textbook)}</s></td></tr><tr><th>✔ Correct</th><td>${esc(n.correct)}</td></tr>
      <tr><th>🌿 Natural</th><td><b>${esc(n.natural)}</b> ${audioBtn(n.natural, { cls: "btn sm" })}</td></tr><tr><th>💼 Professional</th><td><b>${esc(n.professional)}</b> ${audioBtn(n.professional, { cls: "btn sm" })}</td></tr></table></div>`).join("")}`);
}

function levelWords(n) {
  const li = levelIndex(store.state.levels.overall);
  return shuffle(C.words.filter((w) => levelIndex(w.cefr) <= li + 1 && !w.word.includes(" "))).slice(0, n);
}
function levelItems(n) {
  const li = levelIndex(store.state.levels.overall);
  return shuffle(C.grammar.filter((g) => levelIndex(g.level) <= li).flatMap((g) => g.items.map((it) => [g, it]))).slice(0, n);
}

function game(id) {
  const back = "#/games";
  const done = (title, lines) => finishScreen({ title, emoji: "🎮", lines, next: back, nextLabel: "More games" });
  if (id === "builder" || id === "puzzle" || id === "detective") {
    const pairs = levelItems(8);
    const type = id === "builder" ? "order" : id === "puzzle" ? "type" : "fix";
    return runExercises({ title: { builder: "Sentence Builder", puzzle: "Grammar Puzzle", detective: "Word Detective" }[id], items: pairs.map(([g, it]) => makeGrammarExercise(g, it, type)), back, onDone: (r) => done("Game over", [["Score", `${r.ok}/${r.total}`]]) });
  }
  if (id === "listening") {
    const pairs = levelItems(6).map(([g, it]) => fullSentence(it));
    return runExercises({ title: "Listening Challenge", items: pairs.map((x) => ({ type: "listen", prompt: x, options: shuffle([x, ...shuffle(pairs.filter((y) => y !== x)).slice(0, 2)]), answer: x, skill: "sk.listening" })), back, onDone: (r) => done("Game over", [["Score", `${r.ok}/${r.total}`]]) });
  }
  if (id === "pron") {
    const words = shuffle(SOUNDS.flatMap((s) => s.words.map((w) => [s.id, w.replace(/\s*\/[^/]+\//g, "")]))).slice(0, 6);
    return runExercises({ title: "Pronunciation Challenge", items: words.map(([sid, w]) => ({ type: "say", prompt: w, answer: w, concept: sid })), back, onDone: (r) => done("Game over", [["Score", `${Math.round(r.score * 100)}%`]]) });
  }
  if (id === "race") return race();
  if (id === "match") return match();
  if (id === "memory") return memory();
  go(back);
}

function race() {
  const words = levelWords(40);
  let k = 0, score = 0, end = Date.now() + 60000;
  const tick = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    if (!left || k >= words.length) { activity("game", { g: "race", sec: 60, xp: score * 2 }); return finishScreen({ title: "Vocabulary Race", emoji: "🏎️", lines: [["Correct answers", score], ["Answered", k]], next: "#/games" }); }
    const w = words[k];
    const opts = shuffle([w.es, ...shuffle(words.filter((x) => x !== w)).slice(0, 3).map((x) => x.es)]);
    const v = render(`<div class="ex-head"><a class="iconbtn" href="#/games">✕</a>${progressBar(left / 60)}<b>⏱ ${left}s</b></div><div class="muted small">Score ${score}</div>
      <div class="emoji-big">${w.emoji}</div><div class="prompt center">${esc(w.word)}</div><div class="options">${opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>`);
    on(v, "click", "[data-o]", (el) => {
      const ok = el.dataset.o === w.es;
      if (ok) score++;
      wordResult(w.id, "v." + w.topic, { ok, ms: 2500 });
      el.classList.add(ok ? "right" : "wrong");
      k++; setTimeout(tick, ok ? 150 : 600);
    });
  };
  tick();
}

function match() {
  const words = levelWords(5);
  let selEn = null, found = 0, tries = 0;
  const en = shuffle(words), es = shuffle(words);
  const v = render(`${backLink("#/games", "Games")}<h1>🔗 Word Match</h1><p class="muted small">Toca una palabra en inglés y luego su traducción.</p>
    <div class="grid2"><div class="options">${en.map((w) => `<button class="opt" data-en="${w.id}">${w.emoji} ${esc(w.word)}</button>`).join("")}</div>
    <div class="options">${es.map((w) => `<button class="opt" data-es="${w.id}">${esc(w.es)}</button>`).join("")}</div></div>`);
  on(v, "click", "[data-en]", (el) => { v.querySelectorAll("[data-en]").forEach((b) => b.classList.remove("sel")); el.classList.add("sel"); selEn = el.dataset.en; });
  on(v, "click", "[data-es]", (el) => {
    if (!selEn) return;
    tries++;
    const ok = el.dataset.es === selEn;
    const w = C.wordById[selEn];
    wordResult(w.id, "v." + w.topic, { ok, ms: 3000 });
    if (ok) {
      found++;
      el.classList.add("right"); el.disabled = true;
      const b = v.querySelector(`[data-en="${selEn}"]`); b.classList.remove("sel"); b.classList.add("right"); b.disabled = true;
      selEn = null;
      if (found === words.length) setTimeout(() => finishScreen({ title: "All matched!", emoji: "🔗", lines: [["Pairs", found], ["Attempts", tries]], next: "#/games" }), 500);
    } else { el.classList.add("wrong"); setTimeout(() => el.classList.remove("wrong"), 500); }
  });
}

function memory() {
  const words = levelWords(6);
  const cards = shuffle(words.flatMap((w) => [{ id: w.id, face: w.emoji }, { id: w.id, face: w.word }]));
  let open = [], found = 0, moves = 0;
  const v = render(`${backLink("#/games", "Games")}<h1>🃏 Memory Vocabulary</h1><p class="muted small">Encuentra las parejas: emoji ↔ palabra.</p>
    <div class="grid3">${cards.map((c, i) => `<button class="tile center" data-c="${i}" style="min-height:80px;align-items:center;justify-content:center;font-weight:700">❔</button>`).join("")}</div><p class="center muted" id="mv">Moves: 0</p>`);
  on(v, "click", "[data-c]", (el) => {
    const i = +el.dataset.c;
    if (open.length === 2 || open.includes(i) || el.dataset.done) return;
    el.textContent = cards[i].face; open.push(i);
    if (open.length === 2) {
      moves++; $("#mv", v).textContent = `Moves: ${moves}`;
      const [a, b] = open;
      if (cards[a].id === cards[b].id) {
        found++;
        [a, b].forEach((k) => { const e = v.querySelector(`[data-c="${k}"]`); e.dataset.done = 1; e.style.borderColor = "var(--ok)"; });
        const w = C.wordById[cards[a].id]; wordResult(w.id, "v." + w.topic, { ok: true, ms: 5000 });
        open = [];
        if (found === words.length) setTimeout(() => finishScreen({ title: "Memory master!", emoji: "🃏", lines: [["Moves", moves]], next: "#/games" }), 500);
      } else setTimeout(() => { [a, b].forEach((k) => (v.querySelector(`[data-c="${k}"]`).textContent = "❔")); open = []; }, 800);
    }
  });
}

// DOCUMENT ENGLISH LAB (sección 112) + CAMERA LEARNING MODE (sección 113)
function docLab() {
  const s = store.state;
  const v = render(`${backLink("#/practice", "Practice")}<h1>📄 Document English Lab</h1>
    <p class="muted small">Pega un email, informe, procedimiento, contrato, política, acta o documento técnico. Analizamos vocabulario, gramática, expresiones y estilo.</p>
    <div class="chips" style="margin-bottom:8px">${["Email", "Report", "Procedure", "Contract", "Policy", "Presentation", "Meeting minutes", "Technical document"].map((t) => `<span class="chip">${t}</span>`).join("")}</div>
    <textarea class="inp" id="doc" rows="8" placeholder="Paste your document here…"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn primary" data-an>Analyze</button>
      <label class="btn">📷 Camera / photo<input type="file" accept="image/*" capture="environment" hidden id="cam"></label></div>
    <div id="out"></div>`);
  on(v, "click", "[data-an]", () => analyzeDoc($("#doc", v).value, $("#out", v)));
  $("#cam", v).addEventListener("change", async (e) => {
    const f = e.target.files[0];
    const out = $("#out", v);
    if (!f) return;
    if (!aiReady()) { out.innerHTML = `<div class="card">📷 Para leer texto de una foto se necesita la IA (visión). Actívala en <a href="#/settings">Ajustes</a>, o copia el texto y pégalo arriba.</div>`; return; }
    const data = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.readAsDataURL(f); });
    out.innerHTML = `<div class="card muted">✨ Reading the photo…</div>`;
    try {
      let acc = "";
      await ask({ system: systemPrompt(), images: [{ type: f.type || "image/jpeg", data }], prompt: "Transcribe the English text in this photo. Then: 1) explain it simply, 2) translate the key sentences into Spanish, 3) list up to 8 useful vocabulary items (word – meaning), 4) create 3 short exercises with answers.", maxTokens: 1500, onText: (d) => { acc += d; out.innerHTML = `<div class="card" style="white-space:pre-wrap">${esc(acc)}</div>`; } });
    } catch (err) { out.innerHTML = `<div class="card">${esc(friendlyError(err))}</div>`; }
  });
}

function analyzeDoc(text, out) {
  text = text.trim();
  if (!text) return;
  const tokens = text.toLowerCase().match(/[a-z][a-z'-]+/g) || [];
  const uniq = [...new Set(tokens)];
  const found = C.words.filter((w) => uniq.includes(w.word.toLowerCase()) || (w.word.includes(" ") && text.toLowerCase().includes(w.word.toLowerCase())));
  const pro = found.filter((w) => w.area);
  const levels = {};
  found.forEach((w) => (levels[w.cefr] = (levels[w.cefr] || 0) + 1));
  const errs = detect(text);
  const formal = (text.match(/\b(shall|hereby|pursuant|notwithstanding|therefore|furthermore|regarding|kindly|sincerely|accordance)\b/gi) || []).length;
  const informal = (text.match(/\b(gonna|wanna|hey|thanks!|cheers|guys|btw)\b/gi) || []).length;
  const passive = (text.match(/\b(is|are|was|were|be|been)\s+\w+ed\b/gi) || []).length;
  out.innerHTML = `<div class="card" style="margin-top:12px"><h3>Style</h3><div class="chips"><span class="chip">${tokens.length} words</span><span class="chip">Tone: ${formal > informal ? "formal" : informal ? "informal" : "neutral"}</span><span class="chip">Passive voice: ${passive}</span><span class="chip">Known dictionary words: ${found.length}</span></div>
    <h3 style="margin-top:12px">Vocabulary by level</h3><div class="chips">${Object.entries(levels).sort().map(([l, n]) => `<span class="chip">${l}: ${n}</span>`).join("") || "—"}</div>
    ${pro.length ? `<h3 style="margin-top:12px">Professional terms</h3><div class="list">${pro.slice(0, 15).map((w) => `<div class="row between"><span>${w.emoji} <b>${esc(w.word)}</b> — ${esc(w.es)}</span><button class="btn sm" data-addw="${w.id}">➕</button></div>`).join("")}</div>` : ""}
    ${errs.length ? `<h3 style="margin-top:12px">Grammar notes</h3>${errs.map((e) => `<div>• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b></div>`).join("")}` : ""}
    <h3 style="margin-top:12px">Smart Reading</h3><div class="reader card soft">${tappable(text, (w) => !!C.words.find((x) => x.word.toLowerCase() === w.toLowerCase()))}</div>
    <div id="ai">${aiReady() ? `<button class="btn" data-ai>✨ Explain vocabulary, grammar, expressions and professional style</button>` : `<p class="small muted">Con la IA activada, el tutor explica expresiones y estilo profesional del documento.</p>`}</div></div>`;
  out.onclick = async (e) => {
    const w = e.target.closest("[data-word]"); if (w) wordSheet(w.dataset.word, text);
    const a = e.target.closest("[data-addw]"); if (a) { addWord(a.dataset.addw); a.textContent = "✔"; }
    if (e.target.closest("[data-ai]")) {
      const box = out.querySelector("#ai");
      box.innerHTML = `<p class="muted">✨ Analyzing…</p>`;
      try { let acc = ""; await ask({ system: systemPrompt(), prompt: `Explain this document for my English learning: key vocabulary, grammar structures, useful expressions and professional style. Be concise.\n"""${text.slice(0, 6000)}"""`, maxTokens: 1400, onText: (d) => { acc += d; box.innerHTML = `<div style="white-space:pre-wrap">${esc(acc)}</div>`; } }); }
      catch (err) { box.textContent = friendlyError(err); }
    }
  };
  activity("read", { id: "doclab", sec: 60 });
}
