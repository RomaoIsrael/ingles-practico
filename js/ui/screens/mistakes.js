// MY MISTAKES + Smart Review + Lesson Generator (secciones 23, 100, 136, 145, 151, 160).
import { esc, shuffle } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { RULE_BY_ID } from "../../engine/errors.js";
import { reviewSet, vocabExercise, profContexts } from "../../engine/exercises.js";
import { dueList, isForgotten } from "../../engine/srs.js";
import { forgetting } from "../../engine/brain.js";
import { weakConcepts } from "../../engine/planner.js";
import { render, on, backLink, $ } from "../components.js";
import { route, finishScreen } from "../app.js";
import { runExercises } from "../runner.js";
import { aiReady, ask, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

const CATS = ["Grammar", "Vocabulary", "Pronunciation", "Word Order", "Verb Tenses", "Articles", "Prepositions", "Speaking", "Writing", "Listening"];

export function registerMistakes() {
  route("/mistakes", () => {
    const s = store.state;
    const open = s.mistakes.filter((m) => !m.fixed);
    const byCat = Object.fromEntries(CATS.map((c) => [c, open.filter((m) => m.cat === c)]));
    const pats = Object.entries(s.patterns).sort((a, b) => b[1].n - a[1].n).slice(0, 6);
    const v = render(`${backLink("#/practice", "Practice")}<h1>🎯 My Mistakes</h1>
      <p class="muted small">Los errores son parte normal del aprendizaje. Aquí se guardan para repasarlos en otros contextos.</p>
      ${pats.length ? `<div class="card"><b>🧠 Your error patterns</b><div class="list" style="margin-top:8px">${pats.map(([id, p]) => `<div class="row between"><span>${esc(RULE_BY_ID[id]?.es.split(":")[0] || id)}</span><span class="pill st-LEARNING">${p.n}×</span></div>`).join("")}</div></div>` : ""}
      <div class="stack" style="margin:12px 0"><a class="btn primary big" href="#/mistakes/practice" ${open.length ? "" : 'aria-disabled="true"'}>Practice my mistakes (${open.length})</a>${aiReady() ? `<button class="btn big" data-gen>✨ Create a lesson from my errors this week</button>` : ""}</div><div id="gen"></div>
      <div class="chips">${CATS.map((c) => `<span class="chip">${c} <b>${byCat[c].length}</b></span>`).join("")}</div>
      <h2>Recent</h2><div class="list">${open.slice(-30).reverse().map((m) => `<div class="card soft"><div class="small muted">${esc(m.cat)} · ${new Date(m.t).toLocaleDateString()}</div><div><s>${esc(m.wrong)}</s> → <b>${esc(m.right)}</b></div><div class="small">${esc(m.why || "")}</div>${m.topic && C.grammarById[m.topic] ? `<a class="small" href="#/grammar/${m.topic}">${esc(C.grammarById[m.topic].title)} →</a>` : ""}</div>`).join("") || `<div class="card center muted">No mistakes yet. Keep practicing!</div>`}</div>`);
    on(v, "click", "[data-gen]", async (b) => {
      b.disabled = true;
      const box = $("#gen", v);
      box.innerHTML = `<div class="card muted">✨ Creating your micro-lesson…</div>`;
      const week = s.mistakes.filter((m) => Date.now() - m.t < 7 * 86400000).slice(-15).map((m) => `- "${m.wrong}" → "${m.right}" (${m.cat})`).join("\n");
      try {
        let acc = "";
        await ask({ system: systemPrompt(), prompt: `Create a 5-minute micro-lesson based on these mistakes from my week:\n${week || "(no mistakes recorded)"}\nFormat: 1) the pattern I keep making, 2) the rule in simple words, 3) three examples adapted to my profession, 4) three short practice sentences with answers at the end.`, maxTokens: 900, onText: (d) => { acc += d; box.innerHTML = `<div class="card" style="white-space:pre-wrap">${esc(acc)}</div>`; } });
      } catch (e) { box.innerHTML = `<div class="card">${esc(friendlyError(e))}</div>`; }
    });
  });

  route("/mistakes/practice", () => {
    const s = store.state;
    const topics = [...new Set(s.mistakes.filter((m) => !m.fixed && m.topic).slice(-20).map((m) => m.topic))].map((id) => C.grammarById[id]).filter(Boolean);
    const prof = profContexts(s.profile);
    const items = shuffle(topics.flatMap((t) => reviewSet(t, 2, { prof, recent: s.skills[t.id]?.ctx || [] }))).slice(0, 10);
    if (!items.length) return route_empty();
    runExercises({ title: "Fix your mistakes", items, back: "#/mistakes", onDone: (r) => finishScreen({ title: r.score >= 0.8 ? "Mistakes fixed!" : "Getting better", emoji: "🎯", lines: [["Correct", `${r.ok}/${r.total}`], ["Topics", topics.map((t) => t.title).join(", ")]], next: "#/mistakes" }) });
  });

  // Smart Review: errores + palabras olvidadas + gramática débil + conceptos olvidándose (sección 100)
  route("/smart-review", () => {
    const s = store.state, now = Date.now();
    const prof = profContexts(s.profile);
    const items = [];
    const mistakeTopics = [...new Set(s.mistakes.filter((m) => !m.fixed && m.topic).slice(-10).map((m) => m.topic))];
    const forgot = forgetting(s.skills, C.labels, now).map((f) => f.id).filter((id) => id.startsWith("g."));
    const weak = weakConcepts(s, C, 6, now).filter((id) => id.startsWith("g."));
    const gIds = [...new Set([...mistakeTopics, ...forgot, ...weak])].slice(0, 4);
    for (const id of gIds) items.push(...reviewSet(C.grammarById[id], 2, { prof, recent: s.skills[id]?.ctx || [] }));
    const forgottenWords = Object.keys(s.vocab).filter((id) => isForgotten(s.vocab[id], now));
    const wids = [...new Set([...forgottenWords, ...dueList(s.vocab, now, 6)])].slice(0, 6).map((id) => C.wordById[id]).filter(Boolean);
    wids.forEach((w, i) => items.push(vocabExercise(w, i % 2 ? "recall" : "gap", C.words.filter((x) => x.topic === w.topic))));
    if (!items.length) {
      const studied = C.grammar.filter((g) => s.skills[g.id]);
      (studied.length ? shuffle(studied).slice(0, 3) : C.grammar.filter((g) => g.level === s.levels.overall).slice(0, 2)).forEach((g) => items.push(...reviewSet(g, 2, { prof })));
    }
    runExercises({ title: "Smart Review", items: shuffle(items).slice(0, 12), back: "#/practice", onDone: (r) => finishScreen({ title: "Smart Review done", emoji: "🧠", lines: [["Correct", `${r.ok}/${r.total}`], ["Mixed topics", gIds.length + (wids.length ? 1 : 0)]], next: "#/practice" }) });
  });
}

function route_empty() {
  render(`${backLink("#/mistakes", "Mistakes")}<div class="card center"><div class="emoji-big">✨</div><h2>Nothing to fix right now</h2><p class="muted">Your mistakes will appear here after lessons, writing and conversations.</p><a class="btn primary" href="#/smart-review">Try Smart Review</a></div>`);
}
