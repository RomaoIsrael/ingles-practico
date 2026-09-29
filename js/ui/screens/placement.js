// Prueba de nivel y examen de nivel (secciones 7, 104, 165-166).
import { esc, LEVELS, levelIndex } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { Placement, placementResult } from "../../engine/placement.js";
import { seedPrior, readyForExam, nextLevel, record } from "../../engine/brain.js";
import { speechScore } from "../../engine/grader.js";
import { WRITING_ITEM, SPEAKING_ITEMS } from "../../content/placement-bank.js";
import { reviewSet } from "../../engine/exercises.js";
import { activity, speakTime, analyzeText } from "../../core/actions.js";
import { render, on, progressBar, audioBtn, $, confetti } from "../components.js";
import { route, go, finishScreen } from "../app.js";
import { speak, listen, sttAvailable } from "../../services/speech.js";
import { runExercises } from "../runner.js";

export function registerPlacement() {
  route("/placement", () => {
    const v = render(`
      <h1>Placement test</h1>
      <p class="muted">≈ 10 minutos. Las preguntas se adaptan a tus respuestas: si aciertas, suben de nivel; si fallas, bajan. No pasa nada si no sabes una respuesta.</p>
      <div class="card"><div class="list">
        <div class="row"><span>🧩</span> Grammar · 📚 Vocabulary · 📖 Reading · 🎧 Listening</div>
        <div class="row"><span>✍️</span> A short writing task</div>
        <div class="row"><span>🎤</span> Speaking & pronunciation (optional)</div></div></div>
      <div class="sticky-foot stack"><button class="btn primary big" data-start>Start the test</button>
      <button class="btn ghost big" data-beginner>I'm a complete beginner → start at A1</button></div>`);
    on(v, "click", "[data-start]", () => runPlacement());
    on(v, "click", "[data-beginner]", () => { const s = store.state; s.profile.onboarded = true; s.levels.history.push({ t: Date.now(), overall: "A1" }); store.save(); go("#/home"); });
  });

  route("/exam/:level", ({ level }) => levelExam(level));
}

function runPlacement() {
  const p = new Placement(C);
  let writing = "", speakScores = [];
  const s = store.state;

  function q() {
    if (p.done) return writingStep();
    const it = p.next();
    const v = render(`
      <div class="ex-head">${progressBar(p.i / (p.length + 2))}<span class="small muted">${p.i + 1}/${p.length + 2}</span></div>
      <div class="muted small">${esc({ grammar: "🧩 Grammar", vocabulary: "📚 Vocabulary", reading: "📖 Reading", listening: "🎧 Listening" }[it.skill])}</div>
      ${it.passage ? `<div class="card soft" style="margin:10px 0">${esc(it.passage)}</div>` : ""}
      ${it.audio ? `<div class="center" style="margin:12px 0"><button class="btn primary" data-play>🔊 Play audio</button></div>` : ""}
      <div class="prompt">${esc(it.prompt).replace("___", '<span class="blank"></span>')}</div>
      <div class="options">${it.options.map((o) => `<button class="opt" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      <div class="center" style="margin-top:14px"><button class="btn sm ghost" data-opt="__idk">I don't know</button></div>`);
    if (it.audio) setTimeout(() => speak(it.audio, { accent: s.profile.accent, rate: 0.95 }), 300);
    on(v, "click", "[data-play]", () => speak(it.audio, { accent: s.profile.accent, rate: 0.95 }));
    on(v, "click", "[data-opt]", (el) => { p.answer(el.dataset.opt); q(); });
  }

  function writingStep() {
    const v = render(`
      <div class="ex-head">${progressBar((p.length) / (p.length + 2))}<span class="small muted">${p.length + 1}/${p.length + 2}</span></div>
      <div class="muted small">✍️ Writing</div><div class="prompt">${esc(WRITING_ITEM.prompt)}</div><div class="muted small">${esc(WRITING_ITEM.es)}</div>
      <textarea class="inp" id="w" rows="6" placeholder="Write here…"></textarea>
      <div class="sticky-foot stack"><button class="btn primary big" data-next>Continue</button><button class="btn ghost" data-skip>Skip</button></div>`);
    on(v, "click", "[data-next]", () => { writing = $("#w", v).value; speakingStep(0); });
    on(v, "click", "[data-skip]", () => speakingStep(0));
  }

  function speakingStep(k) {
    if (!sttAvailable() || k >= SPEAKING_ITEMS.length) return results();
    const item = SPEAKING_ITEMS[k];
    const v = render(`
      <div class="ex-head">${progressBar(1)}<span class="small muted">🎤 ${k + 1}/${SPEAKING_ITEMS.length}</span></div>
      <div class="muted small">🎤 Speaking & pronunciation (optional)</div>
      <div class="prompt">${esc(item.text)} ${audioBtn(item.text)}</div>
      <div class="center" style="margin:18px 0"><button class="mic" data-mic aria-label="Hablar">🎤</button><div class="muted small" id="heard">Tap and read the sentence aloud.</div></div>
      <div class="sticky-foot"><button class="btn ghost big" data-skip>Skip speaking</button></div>`);
    on(v, "click", "[data-mic]", async (el) => {
      el.classList.add("rec");
      try {
        const r = await listen({ accent: s.profile.accent, onInterim: (t) => ($("#heard", v).textContent = t) });
        speakTime(r.sec);
        speakScores.push(speechScore(r.transcript, item.text, r.confidence).score);
        speakingStep(k + 1);
      } catch { el.classList.remove("rec"); $("#heard", v).textContent = "I couldn't hear you. Try again or skip."; }
    });
    on(v, "click", "[data-skip]", () => results());
  }

  function results() {
    const avg = speakScores.length ? speakScores.reduce((a, b) => a + b, 0) / speakScores.length : null;
    const r = placementResult(p, writing, avg);
    if (writing.trim()) analyzeText(writing, "placement");
    Object.assign(s.levels, { overall: r.overall, grammar: r.grammar, vocabulary: r.vocabulary, reading: r.reading, listening: r.listening, writing: r.writing, speaking: r.speaking, pronunciation: r.pronunciation, lastAssessment: Date.now() });
    s.levels.history.push({ t: Date.now(), overall: r.overall });
    seedPrior(s, C.catalog, r.overall);
    const toScore = (l) => 0.35 + levelIndex(l) * 0.1;
    for (const [k, id] of [["speaking", "sk.speaking"], ["listening", "sk.listening"], ["reading", "sk.reading"], ["writing", "sk.writing"]]) record(s.skills, id, { score: toScore(r[k]) });
    s.profile.onboarded = true; s.profile.placementDone = true;
    store.save();
    activity("placement", { result: r.overall, sec: 600 });
    const rows = [["Overall English", r.overall], ["Grammar", r.grammar], ["Vocabulary", r.vocabulary], ["Speaking", r.speaking], ["Listening", r.listening], ["Reading", r.reading], ["Writing", r.writing], ["Pronunciation", r.pronunciation]];
    const v = render(`
      <div class="center" style="padding-top:12px"><div class="emoji-big">🎯</div><h1>Your level: ${r.overall}</h1><p class="muted">Tu Brain ya tiene un punto de partida. Iremos confirmando cada habilidad con la práctica.</p></div>
      <div class="card"><table class="t">${rows.map(([k, l], i) => `<tr><td>${i ? "" : "<b>"}${k}${i ? "" : "</b>"}</td><td><span class="lvl">${l}</span></td><td style="width:40%">${progressBar((levelIndex(l) + 1) / 6, true)}</td></tr>`).join("")}</table></div>
      <div class="sticky-foot"><a class="btn primary big" href="#/home">Start learning</a></div>`);
    confetti();
  }
  q();
}

// Examen de nivel (checkpoint) o evaluación semanal
function levelExam(level) {
  const s = store.state;
  const weekly = level === "weekly";
  const target = weekly ? s.levels.overall : level;
  const { coverage, ready } = readyForExam(s, C.catalog);
  if (!weekly && !ready && target === s.levels.overall) {
    render(`<a class="btn ghost sm" href="#/learn">← Learn</a><h1>${target} level exam</h1>
      <div class="card"><p>Para desbloquear el examen necesitas un dominio real del ${Math.round(coverage * 100)}% → <b>70%</b> de la gramática y el vocabulario de ${target}.</p>${progressBar(coverage / 0.7)}
      <p class="muted small">El nivel no sube por XP, sino por dominio comprobado (sección 165).</p><a class="btn primary" href="#/learn/${target}">Keep learning ${target}</a></div>`);
    return;
  }
  const topics = C.grammar.filter((g) => g.level === target);
  const pool = weekly ? C.grammar.filter((g) => s.skills[g.id]) : topics;
  const list = (pool.length ? pool : topics).flatMap((t) => reviewSet(t, weekly ? 1 : 2)).slice(0, weekly ? 10 : 14);
  runExercises({
    title: weekly ? "Weekly assessment" : `${target} level exam`, items: list, back: "#/learn",
    onDone: ({ score, ok, total }) => {
      activity("exam", { level: target, score, sec: total * 30 });
      let title = weekly ? "Weekly assessment done" : "Exam finished", emoji = "📋";
      if (!weekly && score >= 0.7 && target === s.levels.overall && nextLevel(target)) {
        s.levels.overall = nextLevel(target);
        s.levels.grammar = LEVELS[Math.max(levelIndex(s.levels.grammar), levelIndex(s.levels.overall))];
        s.levels.history.push({ t: Date.now(), overall: s.levels.overall });
        s.levels.lastAssessment = Date.now();
        store.save();
        title = `Level up: ${s.levels.overall}!`; emoji = "🏆";
      }
      finishScreen({ title, emoji, lines: [["Score", `${Math.round(score * 100)}%`], ["Correct", `${ok}/${total}`], ["Current level", s.levels.overall]], next: "#/learn" });
    },
  });
}
