// Preparación de exámenes internacionales: IELTS, TOEFL, TOEIC, Cambridge (sección 103).
import { esc, shuffle, words as tokenize } from "../../core/util.js";
import { store } from "../../core/store.js";
import { EXAMS, EXAM_BY_ID } from "../../content/exam-prep.js";
import { detect } from "../../engine/errors.js";
import { textComplexity } from "../../engine/grader.js";
import { sectionScores } from "../../engine/testing.js";
import { record } from "../../engine/brain.js";
import { activity, speakTime, analyzeText } from "../../core/actions.js";
import { render, on, backLink, howTo, $ } from "../components.js";
import { route, go, finishScreen } from "../app.js";
import { runExercises } from "../runner.js";
import { writingTask } from "./skills.js";
import { speak, listen, sttAvailable, stopListening } from "../../services/speech.js";
import { aiReady, ask, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

export function registerExams() {
  route("/exams", () => {
    render(`${backLink("#/tests", "Tests")}<h1>🌍 Exam preparation</h1>
      <p class="muted">Prepárate para los exámenes internacionales más importantes. Aquí conoces el formato, las estrategias y practicas con tareas <b>originales</b> en el mismo formato.</p>
      <div class="banner small">ℹ️ Material de práctica propio de la app, no oficial. Para el examen real, consulta además la web oficial de cada examen.</div>
      <div class="list">${EXAMS.map((e) => `<a class="card tap" href="#/exams/${e.id}"><div class="row between"><b>${e.icon} ${esc(e.name)}</b><span class="small muted">${esc(e.levels)}</span></div><div class="small muted">${esc(e.who)}</div></a>`).join("")}</div>`);
  });

  route("/exams/:id", ({ id }) => {
    const e = EXAM_BY_ID[id];
    if (!e) return go("#/exams");
    const P = e.practice;
    const nQ = (P.choose?.length || 0) + (P.type?.length || 0);
    const v = render(`${backLink("#/exams", "Exams")}<h1>${e.icon} ${esc(e.name)}</h1><p class="muted">${esc(e.who)}</p>
      <h2>📋 Formato del examen</h2><div class="card"><table class="t"><tr><th>Parte</th><th>Duración</th><th>Qué evalúa</th></tr>${e.format.map(([a, b, c]) => `<tr><td><b>${esc(a)}</b></td><td class="small">${esc(b)}</td><td class="small">${esc(c)}</td></tr>`).join("")}</table>
        <div class="small muted" style="margin-top:8px">Equivalencia orientativa con el MCER: ${esc(e.scale)}</div></div>
      <h2>🧠 Estrategias</h2><div class="card"><ul>${e.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <h2>✍️ Practica</h2><div class="list">
        ${nQ ? `<button class="item" data-mode="questions"><span class="em">🎯</span><span class="grow"><span class="title">Practice questions</span><div class="sub">${nQ} preguntas en formato ${esc(e.name)}</div></span>▶</button>` : ""}
        ${(P.writing || []).map((w) => `<button class="item" data-write="${w.id}"><span class="em">📝</span><span class="grow"><span class="title">${esc(w.type)}</span><div class="sub">${esc(w.es)}</div></span>▶</button>`).join("")}
        ${(P.speaking || []).map((sp, i) => `<button class="item" data-speak="${i}"><span class="em">🎤</span><span class="grow"><span class="title">Speaking · ${esc(sp.part)}</span><div class="sub">${sp.prep ? `${sp.prep}s preparación · ` : ""}${sp.time}s para hablar</div></span>▶</button>`).join("")}
      </div>`);
    on(v, "click", "[data-mode]", () => {
      const items = [
        ...(P.choose || []).map((x) => ({ type: "choose", prompt: x.prompt, options: shuffle(x.options), answer: x.answer, passage: x.passage, section: x.section, concept: null })),
        ...(P.type || []).map((x) => ({ type: "type", prompt: x.prompt, answer: x.answer, alts: x.alts, hint: x.hint, section: x.section, concept: null })),
      ];
      runExercises({ title: `${e.name} practice`, items: shuffle(items), back: `#/exams/${id}`, onDone: (r) => {
        const s = store.state;
        s.tests.push({ t: Date.now(), kind: "exam-prep", title: `${e.name} practice`, score: Math.round(r.score * 100), pass: r.score >= 0.7, sections: sectionScores(r.results) });
        store.save(); activity("exam", { kind: e.id, score: r.score, sec: items.length * 40 });
        go(`#/certificate/${s.tests.length - 1}`);
      } });
    });
    on(v, "click", "[data-write]", (el) => writingTask(P.writing.find((w) => w.id === el.dataset.write), `#/exams/${id}`));
    on(v, "click", "[data-speak]", (el) => speakingTask(e, P.speaking[+el.dataset.speak]));
  });
}

// Tarea de speaking cronometrada: preparación → respuesta → análisis
function speakingTask(e, sp) {
  const s = store.state;
  let phase = sp.prep ? "prep" : "ready", left = sp.prep || sp.time, timer = null, transcript = "", spoken = 0;
  const back = `#/exams/${e.id}`;
  const draw = () => {
    const v = render(`${backLink(back, e.name)}<div class="muted small">${esc(e.name)} · SPEAKING · ${esc(sp.part)}</div>
      <div class="card"><p class="lead"><b>${esc(sp.q)}</b></p>${sp.q.length < 160 ? `<button class="btn sm" data-say="${esc(sp.q)}">🔊 Listen</button>` : ""}</div>
      ${howTo("Cómo hacer esta tarea", [sp.prep ? `Tienes <b>${sp.prep} segundos</b> para preparar: anota 4–5 palabras clave.` : "No hay tiempo de preparación: responde directamente.", `Luego habla durante <b>${sp.time} segundos</b>. Pulsa 🎤 (o habla en voz alta si tu navegador no reconoce la voz).`, "Estructura: respuesta directa → razón → ejemplo → conclusión.", "Al terminar verás tu transcripción, palabras por minuto y errores."], { open: true })}
      <div class="card center"><div style="font-size:2.6rem;font-weight:900" id="clock">${left}s</div><div class="muted" id="ph">${{ prep: "⏳ Preparación", ready: "Listo para hablar", speak: "🎤 Habla ahora", done: "✅ Terminado" }[phase]}</div>
        ${phase === "prep" ? `<textarea class="inp" rows="3" placeholder="Tus notas…" style="margin-top:10px"></textarea><button class="btn" data-skipprep style="margin-top:8px">Empezar a hablar ya</button>` : ""}
        ${phase === "ready" ? `<button class="btn primary big" data-start style="margin-top:10px">🎤 Start speaking</button>` : ""}
        ${phase === "speak" ? `<div class="small" id="live" style="margin-top:10px;min-height:40px"></div><button class="btn" data-stop style="margin-top:8px">⏹ Stop</button>` : ""}
      </div><div id="out"></div>`);
    on(v, "click", "[data-skipprep]", () => { clearInterval(timer); phase = "ready"; left = sp.time; draw(); });
    on(v, "click", "[data-start]", () => startSpeaking());
    on(v, "click", "[data-stop]", () => endSpeaking());
    return v;
  };
  const tick = (onZero) => { timer = setInterval(() => { left--; const c = document.getElementById("clock"); if (c) c.textContent = `${left}s`; if (left <= 0) { clearInterval(timer); onZero(); } }, 1000); };
  const startSpeaking = async () => {
    phase = "speak"; left = sp.time; draw();
    tick(() => endSpeaking());
    const t0 = Date.now();
    if (sttAvailable()) {
      try {
        const r = await listen({ accent: s.profile.accent, continuous: true, maxSec: sp.time + 2, onInterim: (t) => { transcript = t; const l = document.getElementById("live"); if (l) l.textContent = t; } });
        transcript = r.transcript || transcript;
      } catch { /* sin micrófono */ }
    }
    spoken = (Date.now() - t0) / 1000;
    if (phase === "speak") endSpeaking();
  };
  const endSpeaking = () => {
    if (phase === "done") return;
    phase = "done"; clearInterval(timer); stopListening();
    const used = Math.max(1, Math.min(sp.time, spoken || sp.time - left));
    speakTime(used);
    const v = draw();
    const w = tokenize(transcript).length;
    const wpm = Math.round((w / used) * 60);
    const errs = transcript ? analyzeText(transcript, "exam-speaking").filter((x) => x.cat !== "Writing") : [];
    const c = textComplexity(transcript);
    const score = transcript ? Math.max(0.2, Math.min(1, (Math.min(wpm, 130) / 130) * 0.5 + Math.min(1, c.connectors / 3) * 0.25 + (errs.length ? 0 : 0.25))) : 0.5;
    record(s.skills, "sk.speaking", { score, produced: true, ctx: "exam" });
    $("#out", v).innerHTML = `<div class="card"><h3>Your answer</h3>${transcript ? `<div class="email">${esc(transcript)}</div>` : `<p class="muted">No se capturó transcripción (tu navegador no reconoce voz o no hablaste cerca del micrófono). Autoevalúate con la lista de abajo.</p>`}
      <table class="t" style="margin-top:8px"><tr><td>Speaking time</td><td><b>${Math.round(used)}s / ${sp.time}s</b></td></tr>${transcript ? `<tr><td>Words</td><td><b>${w}</b></td></tr><tr><td>Words per minute</td><td><b>${wpm}</b> <span class="small muted">(fluido: 110–150)</span></td></tr><tr><td>Connectors used</td><td><b>${c.connectors}</b></td></tr><tr><td>Grammar issues</td><td><b>${errs.length}</b></td></tr>` : ""}</table>
      ${errs.map((x) => `<div>• <s>${esc(x.wrong)}</s> → <b>${esc(x.right)}</b></div>`).join("")}
      <h3 style="margin-top:10px">Checklist</h3><ul class="small"><li>¿Respondiste directamente a la pregunta?</li><li>¿Diste al menos una razón y un ejemplo?</li><li>¿Usaste conectores (because, however, for example)?</li><li>¿Hablaste todo el tiempo sin pausas largas?</li></ul>
      <div id="ai">${aiReady() && transcript ? `<button class="btn" data-ai>✨ AI examiner feedback</button>` : ""}</div>
      <div class="row" style="margin-top:10px"><button class="btn primary" data-again>🔁 Try again</button><a class="btn" href="${back}">Back</a></div></div>`;
    activity("exam", { kind: e.id + "-speaking", score, sec: used });
    on(v, "click", "[data-again]", () => { phase = sp.prep ? "prep" : "ready"; left = sp.prep || sp.time; transcript = ""; draw(); if (phase === "prep") tick(() => { phase = "ready"; left = sp.time; draw(); }); });
    on(v, "click", "[data-ai]", async () => {
      const box = $("#ai", v); box.innerHTML = `<p class="muted">✨ …</p>`;
      try { let acc = ""; await ask({ system: systemPrompt(`You are an experienced ${e.name} speaking examiner. Use the public assessment criteria (fluency and coherence, lexical resource, grammatical range and accuracy, pronunciation). Estimate a band/level range, and be encouraging and specific.`), prompt: `Task (${sp.part}): ${sp.q}\nCandidate transcript (speech-to-text, ${Math.round(used)} seconds):\n"""${transcript}"""`, maxTokens: 900, onText: (d) => { acc += d; box.innerHTML = `<div style="white-space:pre-wrap">${esc(acc)}</div>`; } }); }
      catch (err) { box.textContent = friendlyError(err); }
    });
  };
  draw();
  if (phase === "prep") tick(() => { phase = "ready"; left = sp.time; draw(); });
}
