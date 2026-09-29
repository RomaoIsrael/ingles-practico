// PRACTICE hub + My Vocabulary, ficha de palabra, repaso SRS y diccionario (secciones 17-20, 111, 121, 143).
import { esc, shuffle, levelIndex, LEVELS } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { cardState, vocabStats, dueList, intervalDays } from "../../engine/srs.js";
import { vocabExercise, vocabLessonSequence } from "../../engine/exercises.js";
import { current } from "../../engine/brain.js";
import { addWord, activity } from "../../core/actions.js";
import { render, on, progressBar, statePill, audioBtn, tr, $, toast, backLink } from "../components.js";
import { route, go, finishScreen } from "../app.js";
import { runExercises } from "../runner.js";
import { toggleFav } from "./learn.js";

export function registerVocab() {
  route("/practice", () => {
    const s = store.state, st = vocabStats(s.vocab);
    const t = (href, em, b, sp) => `<a class="tile" href="${href}"><span class="em">${em}</span><b>${b}</b><span>${sp}</span></a>`;
    render(`<h1>Practice</h1>
      <div class="grid2">
        ${t("#/vocab", "📚", "Vocabulary", `${st.learned} words · ${st.due} to review`)}
        ${t("#/grammar", "🧩", "Grammar", "Rules & practice")}
        ${t("#/listening", "🎧", "Listening", "Dictation · audio")}
        ${t("#/reading", "📖", "Reading", "Smart Reading A1–C2")}
        ${t("#/writing", "✍️", "Writing", "Writing Coach · emails")}
        ${t("#/pronunciation", "👄", "Pronunciation", "Sounds · Shadowing")}
        ${t("#/mistakes", "🎯", "Mistakes", `${s.mistakes.filter((m) => !m.fixed).length} to fix`)}
        ${t("#/smart-review", "🧠", "Smart Review", "Mixed, personalized")}
      </div>
      <h2>Study & tests</h2><div class="grid2">${t("#/syllabus", "📖", "Temario", "El curso como materia")}${t("#/tests", "📝", "Test Center", "EF/GoFluent-style tests")}</div>
      <h2>Games</h2><div class="grid2">${t("#/games", "🎮", "Game Mode", "8 mini-games")}${t("#/think", "💭", "Think in English", "No Spanish allowed")}</div>
      <h2>Library</h2><div class="grid2">
        ${t("#/library/falsefriends", "⚠️", "False friends", "actually ≠ actualmente")}
        ${t("#/library/phrasal", "🧗", "Phrasal verbs", "set up · follow up…")}
        ${t("#/library/idioms", "🦜", "Idioms", "break the ice…")}
        ${t("#/library/collocations", "🔗", "Collocations", "make a decision…")}
        ${t("#/library/usuk", "🇺🇸🇬🇧", "US vs UK", "apartment / flat")}
        ${t("#/library/natural", "🌿", "Natural English", "textbook → natural")}
        ${t("#/translate", "🔄", "Translation trainer", "ES → EN · EN → ES")}
        ${t("#/doclab", "📄", "Document Lab", "Emails, contracts, reports")}
      </div>`);
  });

  route("/vocab", () => {
    const s = store.state, st = vocabStats(s.vocab);
    const my = Object.keys(s.vocab).map((id) => C.wordById[id]).filter(Boolean);
    const topics = C.topics.filter((t) => !t.area);
    const pro = C.topics.filter((t) => t.area);
    render(`${backLink("#/practice", "Practice")}<h1>My Vocabulary</h1>
      <div class="grid2">
        <div class="card"><div class="kpi"><b>${st.learned}</b><span>Words Learned</span></div></div>
        <div class="card"><div class="kpi"><b>${st.mastered}</b><span>Words Mastered</span></div></div>
        <div class="card"><div class="kpi"><b>${st.due}</b><span>Words to Review</span></div></div>
        <div class="card"><div class="kpi"><b>${st.forgotten}</b><span>Words Forgotten</span></div></div>
      </div>
      <div class="stack" style="margin-top:12px"><a class="btn primary big" href="#/review" ${st.due ? "" : 'aria-disabled="true"'}>🔁 Review ${st.due} words</a><a class="btn big" href="#/dictionary">🔎 Dictionary</a></div>
      <h2>Topics</h2><div class="grid2">${topics.map((t) => topicTile(t, s)).join("")}</div>
      <h2>Professional banks</h2><div class="grid2">${pro.map((t) => topicTile(t, s)).join("")}</div>
      ${my.length ? `<h2>My words</h2><div class="list">${my.slice(-40).reverse().map((w) => `<a class="item" href="#/word/${w.id}"><span class="em">${w.emoji}</span><span class="grow"><span class="title">${esc(w.word)}</span><div class="sub">${esc(w.es)}</div></span>${statePill(cardState(s.vocab[w.id]))}</a>`).join("")}</div>` : ""}`);
  });

  route("/vocab/topic/:id", ({ id }) => {
    const t = C.topicById[id];
    if (!t) return go("#/vocab");
    const s = store.state;
    const words = t.words.map((w) => C.wordById[w]).filter(Boolean);
    const v = render(`${backLink("#/vocab", "Vocabulary")}<h1>${t.icon} ${esc(t.title)}</h1><p class="muted">${esc(t.es)} · ${words.length} words${t.area ? " · Professional" : ""}</p>
      ${s.skills[t.concept] ? progressBar(current(s.skills[t.concept])) : ""}
      <div class="stack" style="margin:12px 0"><button class="btn primary big" data-practice>🎯 Practice this topic</button></div>
      <div class="list">${words.map((w) => `<a class="item" href="#/word/${w.id}"><span class="em">${w.emoji}</span><span class="grow"><span class="title">${esc(w.word)} <span class="muted small">${w.cefr}</span></span><div class="sub">${esc(w.es)}</div></span>${statePill(cardState(s.vocab[w.id]))}</a>`).join("")}</div>`);
    on(v, "click", "[data-practice]", () => {
      const pick = shuffle(words).slice(0, 6);
      pick.forEach((w) => addWord(w.id));
      runExercises({ title: t.title, items: vocabLessonSequence(pick, words), back: `#/vocab/topic/${id}`, onDone: (r) => finishScreen({ title: "Topic practiced", emoji: "📚", lines: [["Correct", `${r.ok}/${r.total}`], [t.title, `${Math.round(current(store.state.skills[t.concept]) * 100)}%`]], next: `#/vocab/topic/${id}` }) });
    });
  });

  route("/word/:id", ({ id }) => {
    const w = C.wordById[id];
    if (!w) return go("#/vocab");
    const s = store.state, card = s.vocab[id];
    const fav = s.favorites.some((f) => f.id === id);
    const v = render(`${backLink("#/vocab", "Vocabulary")}
      <div class="card center"><div class="emoji-big">${w.emoji}</div><h1>${esc(w.word)} ${audioBtn(w.word)} ${audioBtn(w.word, { label: "🐢", slow: true })}</h1>
        <div class="muted">/${esc(w.ipa)}/ · ${w.cefr} · frequency ${"●".repeat(4 - w.freq)}${"○".repeat(w.freq - 1)}</div>
        ${w.uk ? `<div class="small">🇺🇸 ${esc(w.word)} · 🇬🇧 ${esc(w.uk)}</div>` : ""}</div>
      <div class="card"><table class="t">
        <tr><th>Translation</th><td>${esc(w.es)}</td></tr><tr><th>Definition</th><td>${esc(w.def)}</td></tr>
        <tr><th>Example</th><td><i>${esc(w.ex)}</i> ${audioBtn(w.ex, { label: "🔉" })}</td></tr>
        ${w.syn ? `<tr><th>Synonym</th><td>${esc(w.syn)}</td></tr>` : ""}${w.ant ? `<tr><th>Antonym</th><td>${esc(w.ant)}</td></tr>` : ""}
        <tr><th>Topic</th><td><a href="#/vocab/topic/${w.topic}">${esc(C.topicById[w.topic]?.title || w.topic)}</a></td></tr>
        ${w.area ? `<tr><th>Professional use</th><td>${esc(C.topicById[w.topic]?.title)}</td></tr>` : ""}
        <tr><th>Status</th><td>${statePill(cardState(card))} ${card?.reps ? `<span class="small muted">next review in ${Math.max(0, Math.round((card.due - Date.now()) / 86400000))} d</span>` : ""}</td></tr></table></div>
      <div class="controls"><button class="btn primary" data-add>${card ? "✔ In My Vocabulary" : "➕ Add to Vocabulary"}</button><button class="btn" data-practice>🎯 Practice This</button><button class="btn" data-fav>${fav ? "★ Saved" : "☆ Favorite"}</button></div>`);
    on(v, "click", "[data-add]", () => { if (addWord(id)) toast("Added to My Vocabulary"); });
    on(v, "click", "[data-fav]", () => { toggleFav({ type: "word", id, label: w.word }); go("#/word/" + id); });
    on(v, "click", "[data-practice]", () => {
      addWord(id);
      const pool = C.words.filter((x) => x.topic === w.topic);
      runExercises({ title: w.word, items: ["recall", "meaning", "listen", "say"].map((t) => vocabExercise(w, t, pool)), back: `#/word/${id}`, onDone: (r) => finishScreen({ title: "Practiced!", emoji: w.emoji, lines: [["Correct", `${r.ok}/${r.total}`]], next: `#/word/${id}` }) });
    });
  });

  // Repaso SRS con active recall (secciones 12-13)
  route("/review", () => {
    const s = store.state;
    let ids = dueList(s.vocab, Date.now(), 20);
    if (!ids.length) {
      // Sin vencidas: palabras nuevas de alta frecuencia del nivel (sección 143)
      const li = levelIndex(s.levels.overall);
      const fresh = C.words.filter((w) => !s.vocab[w.id] && !w.area && levelIndex(w.cefr) <= li).sort((a, b) => a.freq - b.freq).slice(0, 5);
      if (!fresh.length) return render(`${backLink("#/vocab", "Vocabulary")}<div class="card center"><div class="emoji-big">✅</div><h2>No words to review</h2><p class="muted">Learn new words in a vocabulary lesson.</p><a class="btn primary" href="#/learn">Go to Learn</a></div>`);
      fresh.forEach((w) => addWord(w.id));
      ids = fresh.map((w) => w.id);
    }
    const words = ids.map((id) => C.wordById[id]).filter(Boolean);
    const items = words.map((w, i) => vocabExercise(w, ["recall", "gap", "reverse", "listen"][i % 4], C.words.filter((x) => x.topic === w.topic)));
    runExercises({
      title: "Vocabulary review", items, back: "#/vocab",
      onDone: (r) => {
        const st = vocabStats(store.state.vocab);
        finishScreen({ title: "Review complete", emoji: "🔁", lines: [["Reviewed", words.length], ["Correct", `${r.ok}/${r.total}`], ["Mastered words", st.mastered], ["Still due", st.due]], next: "#/vocab" });
      },
    });
  });

  route("/dictionary", () => {
    const v = render(`${backLink("#/vocab", "Vocabulary")}<h1>Dictionary</h1><input class="inp" id="q" placeholder="Search in English or Spanish…" autocomplete="off"><div id="res" class="list" style="margin-top:12px"></div>`);
    const q = $("#q", v), res = $("#res", v);
    const run = () => {
      const x = q.value.trim().toLowerCase();
      const list = x.length < 2 ? [] : C.words.filter((w) => w.word.toLowerCase().includes(x) || w.es.toLowerCase().includes(x)).slice(0, 40);
      res.innerHTML = list.map((w) => `<a class="item" href="#/word/${w.id}"><span class="em">${w.emoji}</span><span class="grow"><span class="title">${esc(w.word)} <span class="muted small">/${esc(w.ipa)}/ · ${w.cefr}</span></span><div class="sub">${esc(w.es)} — ${esc(w.def)}</div></span></a>`).join("") || (x.length >= 2 ? `<div class="muted">No results. Try the ASK button for other words.</div>` : "");
    };
    q.addEventListener("input", run);
    q.focus();
  });
}

function topicTile(t, s) {
  const known = t.words.filter((id) => s.vocab[id]?.reps).length;
  return `<a class="tile" href="#/vocab/topic/${t.id}"><span class="em">${t.icon}</span><b>${esc(t.title)}</b><span>${known}/${t.words.length} words</span>${progressBar(known / t.words.length, true)}</a>`;
}
