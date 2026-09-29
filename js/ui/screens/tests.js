// Centro de exámenes (secciones 7, 103-104, 166): EF SET-style, GoFluent-style, negocios, quick check,
// exámenes de unidad, historial y certificado imprimible.
import { esc, LEVELS, levelIndex, shuffle } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { UNITS } from "../../content/curriculum.js";
import { SCORE_BANDS, CAN_DO } from "../../content/tests-bank.js";
import { AdaptiveSection, levelFromScore, levelTestItems, businessTestItems, sectionScores, PASS_MARK } from "../../engine/testing.js";
import { reviewSet } from "../../engine/exercises.js";
import { record } from "../../engine/brain.js";
import { answer, activity } from "../../core/actions.js";
import { render, on, backLink, howTo, progressBar, $ } from "../components.js";
import { route, go } from "../app.js";
import { runExercises } from "../runner.js";
import { speak, stopSpeaking } from "../../services/speech.js";

export function registerTests() {
  route("/tests", () => {
    const s = store.state;
    const last = s.tests.slice(-6).reverse();
    render(`<h1>📝 Test Center</h1><p class="muted">Exámenes para medir tu nivel real, como los de las grandes plataformas de inglés. Todos son originales y se corrigen al instante.</p>
      <a class="card tap" href="#/tests/ef"><div class="row between"><b>🎓 English Level Test</b><span class="pill st-STRONG">0–100 · CEFR</span></div><div class="small muted">Formato tipo EF SET: Reading + Listening adaptativos. ≈ 25–35 min. Obtienes una puntuación de 0 a 100 y tu nivel A1–C2.</div></a>
      <a class="card tap" href="#/tests/levels"><div class="row between"><b>📊 Grammar & Vocabulary Level Test</b><span class="pill st-LEARNING">A1–C2</span></div><div class="small muted">Formato tipo GoFluent: 24 preguntas por nivel (gramática, vocabulario y situaciones de trabajo). Aprobado ≥ 70 %.</div></a>
      <a class="card tap" href="#/tests/business"><div class="row between"><b>💼 Business English Test</b><span class="pill st-PRACTICING">15 q</span></div><div class="small muted">Correos, reuniones, negociación y cortesía profesional.</div></a>
      <a class="card tap" href="#/tests/quick"><div class="row between"><b>⚡ Quick check</b><span class="pill st-NEW">5 min</span></div><div class="small muted">10 preguntas mezcladas de tu nivel actual (${s.levels.overall}).</div></a>
      <div class="grid2" style="margin-top:12px">
        <a class="tile" href="#/tests/units"><span class="em">📚</span><b>Unit tests</b><span>Un examen al final de cada unidad</span></a>
        <a class="tile" href="#/exam/${s.levels.overall}"><span class="em">🏆</span><b>Level exam ${s.levels.overall}</b><span>Sube de nivel con dominio real</span></a>
        <a class="tile" href="#/exam/weekly"><span class="em">🏁</span><b>Weekly assessment</b><span>Repaso de la semana</span></a>
        <a class="tile" href="#/placement"><span class="em">🔄</span><b>Placement test</b><span>Reevaluación completa</span></a>
      </div>
      <h2>Your results</h2>${last.length ? `<div class="list">${last.map((t, i) => `<a class="item" href="#/certificate/${s.tests.length - 1 - i}"><span class="em">${t.pass === false ? "📘" : "🏅"}</span><span class="grow"><span class="title">${esc(t.title)}</span><div class="sub">${new Date(t.t).toLocaleDateString()} · ${t.score}${t.kind === "ef" ? "/100" : "%"}${t.level ? " · " + t.level : ""}</div></span>📄</a>`).join("")}</div>` : `<div class="card muted">Todavía no has hecho exámenes.</div>`}
      <h2>CEFR scale</h2><div class="card"><table class="t">${SCORE_BANDS.map((b) => `<tr><td><span class="lvl">${b.level}</span></td><td><b>${b.label}</b><div class="small muted">${esc(CAN_DO[b.level])}</div></td><td class="small">${b.min}–${b.max}</td></tr>`).join("")}</table></div>`);
  });

  route("/tests/levels", () => {
    const s = store.state;
    render(`${backLink("#/tests", "Tests")}<h1>📊 Level tests</h1>${howTo("Cómo funciona", ["Elige un nivel. Te recomendamos empezar por tu nivel actual.", "Responde 24 preguntas: ~50 % gramática, ~30 % vocabulario y ~20 % situaciones de trabajo.", "Aprobado con 70 % o más. Verás tu resultado por sección y un certificado."], { open: true })}
      <div class="grid3">${LEVELS.map((L) => { const best = Math.max(0, ...s.tests.filter((t) => t.kind === "level" && t.level === L).map((t) => t.score)); return `<a class="tile center" href="#/tests/level/${L}"><b style="font-size:1.5rem">${L}</b><span>${best ? `Best ${best}%` : "Not taken"}</span></a>`; }).join("")}</div>`);
  });

  route("/tests/level/:L", ({ L }) => runner(`${L} Level Test`, "level", levelTestItems(C, L, 24), { level: L }));
  route("/tests/business", () => runner("Business English Test", "business", businessTestItems(15), {}));
  route("/tests/quick", () => {
    const s = store.state, li = levelIndex(s.levels.overall);
    const topics = C.grammar.filter((g) => levelIndex(g.level) <= li);
    const items = shuffle(shuffle(topics).slice(0, 5).flatMap((g) => reviewSet(g, 2).map((x) => ({ ...x, section: "Grammar" })))).slice(0, 10);
    runner("Quick check", "quick", items, { level: s.levels.overall });
  });

  route("/tests/units", () => {
    const s = store.state;
    render(`${backLink("#/tests", "Tests")}<h1>📚 Unit tests</h1>
      ${LEVELS.map((L) => { const us = UNITS.filter((u) => u.level === L); return us.length ? `<h2>${L}</h2><div class="list">${us.map((u) => { const tl = u.lessons.find((x) => x.kind === "test"); const st = s.lessons[tl.id]; return `<a class="item" href="#/lesson/${encodeURIComponent(tl.id)}"><span class="em">${st?.done ? "✅" : "📝"}</span><span class="grow"><span class="title">${esc(u.title)}</span><div class="sub">${esc(u.es)}${st ? ` · best ${Math.round(st.best * 100)}%` : ""}</div></span>▶</a>`; }).join("")}</div>` : ""; }).join("")}`);
  });

  route("/tests/ef", () => efIntro());
  route("/certificate/:i", ({ i }) => certificate(+i));
}

function runner(title, kind, items, extra) {
  const v = render(`${backLink("#/tests", "Tests")}<h1>${esc(title)}</h1>
    <div class="card"><table class="t"><tr><td>Preguntas</td><td><b>${items.length}</b></td></tr><tr><td>Tiempo recomendado</td><td><b>${Math.ceil(items.length * 0.75)} min</b></td></tr><tr><td>Aprobado</td><td><b>70 %</b></td></tr></table></div>
    ${howTo("Instrucciones", ["Lee cada pregunta y elige o escribe la respuesta.", "Verás la corrección y la explicación después de cada respuesta.", "Al final obtendrás tu puntuación por sección y un certificado para imprimir."], { open: true })}
    <div class="sticky-foot"><button class="btn primary big" data-go>Start</button></div>`);
  on(v, "click", "[data-go]", () => {
    const t0 = Date.now();
    runExercises({ title, items, back: "#/tests", onDone: (r) => {
      const s = store.state;
      const score = Math.round(r.score * 100);
      s.tests.push({ t: Date.now(), kind, title, score, pass: r.score >= PASS_MARK, sections: sectionScores(r.results), ...extra });
      store.save();
      activity("exam", { kind, score: r.score, sec: Math.round((Date.now() - t0) / 1000) });
      go(`#/certificate/${s.tests.length - 1}`);
    } });
  });
}

// ── EF SET-style: Reading + Listening adaptativos ──
function efIntro() {
  const v = render(`${backLink("#/tests", "Tests")}<h1>🎓 English Level Test</h1><p class="muted">Formato tipo EF SET: mide tu comprensión de lectura y de escucha y te da una puntuación de 0 a 100 alineada con el MCER (CEFR).</p>
    <div class="card"><table class="t"><tr><td>Parte 1 · Reading</td><td><b>3 textos · ~12 preguntas</b></td></tr><tr><td>Parte 2 · Listening</td><td><b>3 audios · ~8 preguntas</b></td></tr><tr><td>Tiempo</td><td><b>25–35 min</b></td></tr><tr><td>Resultado</td><td><b>0–100 + nivel A1–C2</b></td></tr></table></div>
    ${howTo("Instrucciones", ["El test es <b>adaptativo</b>: si aciertas, el siguiente texto es más difícil; si fallas, más fácil.", "<b>Reading:</b> lee el texto completo y responde todas sus preguntas; luego pulsa <i>Submit</i>.", "<b>Listening:</b> pulsa ▶ Play. Puedes escuchar hasta 2 veces. El texto escrito está oculto.", "No uses traductor ni diccionario: queremos tu nivel real.", "Busca un lugar tranquilo y usa audífonos para la parte de listening."], { open: true })}
    <div class="sticky-foot"><button class="btn primary big" data-go>Start the test</button></div>`);
  on(v, "click", "[data-go]", () => efRun());
}

function efRun() {
  const sections = [new AdaptiveSection("reading", { blocks: 3 }), new AdaptiveSection("listening", { blocks: 3 })];
  let si = 0;
  const t0 = Date.now();
  const nextBlock = () => {
    const sec = sections[si];
    if (sec.finished) { si++; if (si >= sections.length) return finish(); return transition(); }
    const b = sec.next();
    if (!b) { sec.total = sec.done.length; return nextBlock(); }
    showBlock(sec, b);
  };
  const transition = () => {
    const v = render(`<div class="center" style="padding-top:30px"><div class="emoji-big">🎧</div><h1>Part 2 · Listening</h1><p class="muted">Ahora escucharás conversaciones. Pulsa ▶ Play y responde. Puedes escuchar cada audio 2 veces.</p><button class="btn primary big" data-go>Continue</button></div>`);
    on(v, "click", "[data-go]", nextBlock);
  };
  const showBlock = (sec, b) => {
    const isL = sec.kind === "listening";
    let plays = 0;
    const idx = sections.slice(0, si).reduce((a, x) => a + x.total, 0) + sec.done.length;
    const totalBlocks = sections.reduce((a, x) => a + x.total, 0);
    const v = render(`<div class="ex-head"><a class="iconbtn" href="#/tests" aria-label="Salir">✕</a>${progressBar(idx / totalBlocks)}<span class="small muted">${isL ? "Listening" : "Reading"} ${sec.done.length + 1}/${sec.total}</span></div>
      ${isL ? `<div class="card center"><button class="btn primary big" data-play>▶ Play (<span id="pl">2</span> left)</button><div class="small muted" style="margin-top:6px">Escucha y responde. No se muestra el texto.</div></div>`
        : `<div class="card"><h3>${esc(b.title)}</h3><div class="reader" style="white-space:pre-wrap">${esc(b.text)}</div></div>`}
      <div class="stack" style="margin-top:12px">${b.q.map(([q, a, d], qi) => `<div class="card"><b>${qi + 1}. ${esc(q)}</b><div class="options" style="margin-top:8px">${shuffle([a, ...d]).map((o) => `<button class="opt" data-q="${qi}" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div></div>`).join("")}</div>
      <div class="sticky-foot"><button class="btn primary big" data-submit disabled>Submit</button></div>`);
    const answers = {};
    on(v, "click", "[data-o]", (el) => {
      v.querySelectorAll(`[data-q="${el.dataset.q}"]`).forEach((x) => x.classList.remove("sel"));
      el.classList.add("sel"); answers[el.dataset.q] = el.dataset.o;
      $("[data-submit]", v).disabled = Object.keys(answers).length < b.q.length;
    });
    on(v, "click", "[data-play]", async (el) => {
      if (plays >= 2) return;
      plays++; $("#pl", v).textContent = 2 - plays; el.disabled = true;
      const acc = store.state.profile.accent;
      for (const [k, line] of b.lines.entries()) {
        if (!document.body.contains(v)) return;
        await speak(line.replace(/^[AB]:\s*/, ""), { accent: k % 2 ? (acc === "uk" ? "us" : "uk") : acc, rate: 0.95 });
      }
      el.disabled = plays >= 2;
    });
    on(v, "click", "[data-submit]", () => {
      stopSpeaking();
      let ok = 0;
      b.q.forEach(([q, a], qi) => { const right = answers[qi] === a; if (right) ok++; answer({ concept: null, skill: isL ? "sk.listening" : "sk.reading", ok: right, type: "choose" }); });
      sec.record(b.level, ok, b.q.length);
      nextBlock();
    });
  };
  const finish = () => {
    const s = store.state;
    const [rd, ls] = sections.map((x) => x.score());
    const score = Math.round((rd + ls) / 2);
    const level = levelFromScore(score);
    record(s.skills, "sk.reading", { score: 0.3 + levelIndex(levelFromScore(rd)) * 0.12 });
    record(s.skills, "sk.listening", { score: 0.3 + levelIndex(levelFromScore(ls)) * 0.12 });
    s.levels.reading = levelFromScore(rd); s.levels.listening = levelFromScore(ls);
    s.tests.push({ t: Date.now(), kind: "ef", title: "English Level Test (Reading + Listening)", score, level, sections: { Reading: { score: rd, level: levelFromScore(rd) }, Listening: { score: ls, level: levelFromScore(ls) } } });
    store.save();
    activity("exam", { kind: "ef", score: score / 100, sec: Math.round((Date.now() - t0) / 1000) });
    go(`#/certificate/${s.tests.length - 1}`);
  };
  nextBlock();
}

// Certificado imprimible
function certificate(i) {
  const s = store.state;
  const t = s.tests[i];
  if (!t) return go("#/tests");
  const lvl = t.level || (t.kind === "business" ? "" : "");
  const secs = Object.entries(t.sections || {});
  const v = render(`<div class="no-print">${backLink("#/tests", "Tests")}</div>
    <div class="cert" style="margin-top:10px">
      <div class="small muted">INGLÉS PRÁCTICO · CERTIFICATE OF RESULTS</div>
      <h1 style="margin:10px 0">${esc(s.profile.name || "Student")}</h1>
      <div>${esc(t.title)}</div>
      <div class="big">${t.score}${t.kind === "ef" ? "<small style='font-size:1.2rem'>/100</small>" : "%"}</div>
      ${t.kind === "ef" ? `<div><span class="lvl" style="font-size:1.4rem;height:40px">${t.level}</span> <b>${esc(SCORE_BANDS.find((b) => b.level === t.level)?.label || "")}</b></div><p class="small">${esc(CAN_DO[t.level])}</p>`
        : `<div><b>${t.pass ? "✅ PASSED" : "📘 NOT PASSED YET"}</b>${lvl ? ` · Level ${lvl}` : ""}</div>`}
      <table class="t" style="margin-top:12px">${secs.map(([k, x]) => `<tr><td>${esc(k)}</td><td><b>${x.score != null ? `${x.score}/100 · ${x.level}` : `${x.ok}/${x.n} (${Math.round((100 * x.ok) / x.n)}%)`}</b></td></tr>`).join("")}</table>
      <div class="small muted" style="margin-top:12px">${new Date(t.t).toLocaleDateString()} · Resultado orientativo de práctica; no es una certificación oficial.</div>
    </div>
    <div class="stack no-print" style="margin-top:14px">${t.pass === false ? `<a class="btn primary big" href="#/learn">Review & study</a>` : ""}<button class="btn big" data-print>🖨️ Print / Save as PDF</button><a class="btn ghost big" href="#/tests">Back to tests</a></div>`);
  on(v, "click", "[data-print]", () => window.print());
}
