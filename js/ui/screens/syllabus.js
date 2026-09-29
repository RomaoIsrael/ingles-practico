// TEMARIO: el curso como una materia de estudio (índice de contenidos por nivel, como un libro de texto).
import { esc, LEVELS } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { UNITS, STAGES } from "../../content/curriculum.js";
import { CAN_DO } from "../../content/tests-bank.js";
import { SOUND_BY_ID } from "../../content/pronunciation.js";
import { render, on, backLink, howTo, progressBar } from "../components.js";
import { route } from "../app.js";

const LEVEL_NAME = { A1: "Beginner (incluye Starter: desde cero)", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Proficiency" };
const HOURS = { A1: "80–100 h", A2: "180–200 h", B1: "350–400 h", B2: "500–600 h", C1: "700–800 h", C2: "1000–1200 h" };

export function registerSyllabus() {
  route("/syllabus", () => {
    const s = store.state;
    render(`<h1>📖 Temario del curso</h1>
      <p class="muted">El curso completo de inglés organizado como una materia: niveles del Marco Común Europeo (MCER/CEFR), unidades, objetivos y contenidos. La secuencia sigue el orden habitual de los grandes programas de inglés (Cambridge, libros de texto internacionales) con contenido original.</p>
      ${howTo("Cómo usar el temario", ["Elige tu nivel. Si empiezas desde cero, comienza por <b>A1 · Starter</b>.", "Cada unidad tiene objetivos (lo que podrás hacer), gramática, vocabulario, frases, pronunciación y un examen.", "Toca un tema de gramática para abrir sus <b>apuntes completos</b> (puedes imprimirlos).", "Estudia 15–20 minutos al día: es mejor poco cada día que mucho una vez por semana."], { open: true })}
      <div class="list">${LEVELS.map((L) => {
        const us = UNITS.filter((u) => u.level === L);
        const all = us.flatMap((u) => u.lessons), done = all.filter((l) => s.lessons[l.id]?.done).length;
        return `<a class="card tap" href="#/syllabus/${L}"><div class="row between"><b><span class="lvl">${L}</span> ${LEVEL_NAME[L]}</b><span class="small muted">${us.length} unidades</span></div><div class="small muted" style="margin:6px 0">${esc(CAN_DO[L])}</div>${progressBar(all.length ? done / all.length : 0, true)}<div class="small muted">Horas guiadas de referencia (acumuladas): ${HOURS[L]}</div></a>`;
      }).join("")}</div>
      <div class="stack" style="margin-top:12px"><a class="btn big" href="#/grammar">🧩 Todos los apuntes de gramática</a><a class="btn big" href="#/tests">📝 Centro de exámenes</a></div>`);
  });

  route("/syllabus/:L", ({ L }) => {
    const s = store.state;
    const us = UNITS.filter((u) => u.level === L);
    const v = render(`<div class="no-print">${backLink("#/syllabus", "Temario")}</div><h1><span class="lvl">${L}</span> ${LEVEL_NAME[L] || ""}</h1><p class="muted">${esc(CAN_DO[L] || "")}</p>
      <div class="no-print row" style="margin-bottom:10px"><button class="btn sm" data-print>🖨️ Imprimir temario</button><a class="btn sm primary" href="#/learn/${L}">▶ Estudiar ${L}</a></div>
      ${STAGES.filter((st) => us.some((u) => u.stage === st.id)).map((st) => `<h2>${st.icon} ${esc(st.title)}</h2>${us.filter((u) => u.stage === st.id).map((u) => unitBlock(u, s)).join("")}`).join("")}`);
    on(v, "click", "[data-print]", () => window.print());
  });
}

function unitBlock(u, s) {
  const by = (k) => u.lessons.filter((l) => l.kind === k);
  const done = u.lessons.filter((l) => s.lessons[l.id]?.done).length;
  const g = by("grammar").map((l) => C.grammarById[l.ref]).filter(Boolean);
  const v = by("vocab").map((l) => C.topicById[l.ref]).filter(Boolean);
  const other = [...by("talk").map((l) => `🗣️ ${esc(C.scenarioById[l.ref]?.title || l.ref)}`), ...by("read").map((l) => `📖 ${esc(C.readingById[l.ref]?.title || l.ref)}`), ...by("pron").map((l) => `👄 ${esc(SOUND_BY_ID[l.ref]?.title || l.ref)}`), ...by("alphabet").map(() => "🔤 The alphabet")];
  return `<div class="card"><div class="row between"><h3 style="margin:0">Unit ${esc(u.id.toUpperCase())} · ${esc(u.title)}</h3><span class="small muted">${done}/${u.lessons.length}</span></div><div class="small muted">${esc(u.es)}</div>
    <table class="t" style="margin-top:8px">
      ${u.goals.length ? `<tr><th>🎯 Objetivos</th><td>${u.goals.map((x) => `• ${esc(x)}`).join("<br>")}</td></tr>` : ""}
      ${g.length ? `<tr><th>🧩 Gramática</th><td>${g.map((x) => `<a href="#/grammar/${x.id}">${x.icon} ${esc(x.title)}</a>`).join("<br>")}</td></tr>` : ""}
      ${v.length ? `<tr><th>📚 Vocabulario</th><td>${v.map((x) => `<a href="#/vocab/topic/${x.id}">${x.icon} ${esc(x.title)}</a> <span class="muted small">(${x.words.length})</span>`).join("<br>")}</td></tr>` : ""}
      ${u.learn.length ? `<tr><th>📌 Contenidos</th><td>${u.learn.map((x) => `• ${esc(x)}`).join("<br>")}</td></tr>` : ""}
      ${u.phrases.length ? `<tr><th>💬 Frases</th><td>${u.phrases.slice(0, 4).map(([en]) => `“${esc(en)}”`).join("<br>")}</td></tr>` : ""}
      ${other.length ? `<tr><th>🎧 Habilidades</th><td>${other.join("<br>")}</td></tr>` : ""}
      <tr><th>📝 Evaluación</th><td>Unit test (aprobado ≥ 70 %)</td></tr>
    </table><a class="btn sm no-print" href="#/unit/${u.id}" style="margin-top:8px">Abrir unidad →</a></div>`;
}
