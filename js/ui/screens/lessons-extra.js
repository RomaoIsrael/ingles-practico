// Lecciones nuevas: Alfabeto (Starter), Frases útiles (funciones comunicativas) y Examen de unidad.
import { esc, shuffle, pct } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { UNIT_BY_ID } from "../../content/curriculum.js";
import { ALPHABET, CONFUSING_LETTERS, SURVIVAL } from "../../content/starter.js";
import { reviewSet, vocabExercise } from "../../engine/exercises.js";
import { sectionScores, PASS_MARK } from "../../engine/testing.js";
import { lessonDone, addWord, activity } from "../../core/actions.js";
import { render, on, audioBtn, backLink, howTo, tr, progressBar } from "../components.js";
import { finishScreen, go } from "../app.js";
import { runExercises } from "../runner.js";

export function lessonExtras(l) {
  if (l.kind === "alphabet") return alphabetLesson(l);
  if (l.kind === "phrases") return phrasesLesson(l);
  if (l.kind === "test") return unitTest(l);
  go("#/learn");
}

function alphabetLesson(l) {
  const v = render(`${backLink(`#/unit/${l.unit}`, "Unit")}<div class="muted small">STARTER · LEARN</div><h1>🔤 The alphabet</h1>
    ${howTo("Qué hacer", ["Toca cada letra para escuchar cómo se dice en inglés.", "Repite en voz alta. La pista debajo de cada letra es la pronunciación aproximada en español.", "Pon atención a las vocales: ¡suenan diferente que en español!", "Cuando estés listo, pulsa <b>Practicar</b>."], { open: true })}
    <div class="grid3">${ALPHABET.map(([L, say, ex]) => `<button class="tile letter" data-say="${L}. ${ex}" aria-label="${L}">${L}${L.toLowerCase()}<small>«${esc(say)}» · ${esc(ex)}</small></button>`).join("")}</div>
    <h2>⚠️ Letras que se confunden</h2><div class="list">${CONFUSING_LETTERS.map(([a, b, why]) => `<div class="item" style="cursor:default"><span class="grow"><b>${a} vs ${b}</b><div class="sub">${esc(why)}</div></span>${audioBtn(a)}${audioBtn(b)}</div>`).join("")}</div>
    <h2>🗣️ Deletrear (to spell)</h2><div class="card"><p>Para deletrear dices el nombre de cada letra: <b>Ana → A-N-A</b> («ei-en-ei»). Si hay dos letras iguales seguidas se dice <b>double</b>: <b>Anna → A, double N, A</b>.</p>
      <div class="row">${audioBtn("How do you spell your name?", { cls: "btn sm", label: "🔊 How do you spell your name?" })}${audioBtn("It's T. O. double R. E. S. Torres.", { cls: "btn sm", label: "🔊 It's T-O-double R-E-S" })}</div></div>
    <div class="sticky-foot"><button class="btn primary big" data-go>Practicar →</button></div>`);
  on(v, "click", "[data-go]", () => {
    const letters = shuffle(ALPHABET).slice(0, 6).map(([L]) => {
      const conf = CONFUSING_LETTERS.find((c) => c[0] === L || c[1] === L);
      const others = shuffle(ALPHABET.filter((x) => x[0] !== L)).slice(0, 2).map((x) => x[0]);
      const opts = conf ? [L, conf[0] === L ? conf[1] : conf[0], others[0]] : [L, ...others];
      return { type: "listen", prompt: L, options: shuffle([...new Set(opts)]), answer: L, skill: "sk.listening", section: "Letters" };
    });
    const words = ["cat", "dog", "pen", "red", "bus", "map", "sun", "egg"];
    const spell = shuffle(words).slice(0, 4).map((w) => ({ type: "listen", prompt: w.toUpperCase().split("").join(". ") + ".", options: shuffle([w, ...shuffle(words.filter((x) => x !== w)).slice(0, 2)]), answer: w, skill: "sk.listening", section: "Spelling" }));
    runExercises({ title: "The alphabet", items: [...letters, ...spell], back: `#/unit/${l.unit}`, onDone: (r) => {
      const stars = lessonDone(l, r.score, 300);
      finishScreen({ title: r.score >= 0.7 ? "You know the alphabet!" : "Good start — practice the letters again", emoji: "🔤", stars, lines: [["Correct", `${r.ok}/${r.total}`]], next: `#/unit/${l.unit}`, nextLabel: "Next lesson" });
    } });
  });
}

function phrasesLesson(l) {
  const u = UNIT_BY_ID[l.unit];
  const list = [...u.phrases, ...(u.id === "s-2" ? SURVIVAL : [])];
  const v = render(`${backLink(`#/unit/${l.unit}`, "Unit")}<div class="muted small">UNIDAD ${esc(u.id.toUpperCase())} · FRASES ÚTILES</div><h1>💬 Useful phrases</h1>
    <p class="muted">Frases completas que puedes usar tal cual en la vida real. Aprenderlas "en bloque" te hace hablar más rápido y natural.</p>
    ${howTo("Qué hacer", ["Escucha cada frase con 🔊 (🐢 = despacio).", "Repítela en voz alta 2 o 3 veces, imitando la entonación.", "Fíjate en la traducción, pero intenta recordar la frase completa en inglés.", "Luego practica: significado, reconocimiento y habla."], { open: true })}
    <div class="list">${list.map(([en, es]) => `<div class="item" style="cursor:default"><span class="grow"><b>${esc(en)}</b>${tr(es)}</span>${audioBtn(en)}${audioBtn(en, { label: "🐢", slow: true })}</div>`).join("")}</div>
    <div class="sticky-foot"><button class="btn primary big" data-go>Practicar →</button></div>`);
  on(v, "click", "[data-go]", () => {
    const pick = shuffle(list).slice(0, Math.min(8, list.length));
    const items = [
      ...pick.slice(0, 4).map(([en, es]) => ({ type: "choose", prompt: `“${en}” means…`, options: shuffle([es, ...shuffle(list.filter((x) => x[1] !== es)).slice(0, 2).map((x) => x[1])]), answer: es, skill: "sk.speaking", section: "Meaning" })),
      ...pick.slice(4, 8).map(([en, es]) => ({ type: "choose", prompt: `How do you say: “${es}”?`, options: shuffle([en, ...shuffle(list.filter((x) => x[0] !== en)).slice(0, 2).map((x) => x[0])]), answer: en, skill: "sk.speaking", section: "Recall" })),
      ...pick.slice(0, 2).map(([en, es]) => ({ type: "speak", prompt: en, answer: en, es, skill: "sk.speaking", section: "Speak" })),
    ];
    runExercises({ title: "Useful phrases", items, back: `#/unit/${l.unit}`, onDone: (r) => {
      const stars = lessonDone(l, r.score, 300);
      finishScreen({ title: "Phrases learned!", emoji: "💬", stars, lines: [["Correct", `${r.ok}/${r.total}`], ["Phrases", list.length]], next: `#/unit/${l.unit}`, nextLabel: "Next lesson" });
    } });
  });
}

// Examen de unidad: gramática + vocabulario + frases de la unidad. Aprobado ≥ 70 %.
export function unitTestItems(u) {
  const items = [];
  for (const le of u.lessons) {
    if (le.kind === "grammar") items.push(...reviewSet(C.grammarById[le.ref], 4).map((x) => ({ ...x, section: "Grammar" })));
    if (le.kind === "vocab") {
      const t = C.topicById[le.ref];
      const words = t.words.map((id) => C.wordById[id]).filter(Boolean);
      shuffle(words).slice(0, 3).forEach((w, i) => items.push({ ...vocabExercise(w, ["meaning", "reverse", "gap"][i % 3], words), section: "Vocabulary" }));
    }
    if (le.kind === "alphabet") shuffle(ALPHABET).slice(0, 3).forEach(([L]) => items.push({ type: "listen", prompt: L, options: shuffle([L, ...shuffle(ALPHABET.filter((x) => x[0] !== L)).slice(0, 2).map((x) => x[0])]), answer: L, section: "Letters", skill: "sk.listening" }));
  }
  const ph = shuffle(u.phrases).slice(0, 3);
  ph.forEach(([en, es]) => {
    const others = shuffle(u.phrases.filter((x) => x[0] !== en)).slice(0, 2).map((x) => x[0]);
    if (others.length) items.push({ type: "choose", prompt: `How do you say: “${es}”?`, options: shuffle([en, ...others]), answer: en, section: "Phrases" });
  });
  return shuffle(items).slice(0, 15);
}

function unitTest(l) {
  const u = UNIT_BY_ID[l.unit];
  const s = store.state;
  const prev = s.lessons[l.id];
  const v = render(`${backLink(`#/unit/${l.unit}`, "Unit")}<div class="muted small">UNIDAD ${esc(u.id.toUpperCase())}</div><h1>📝 Unit test: ${esc(u.title)}</h1>
    <div class="card"><table class="t"><tr><td>Preguntas</td><td><b>hasta 15</b></td></tr><tr><td>Tiempo aproximado</td><td><b>10 minutos</b></td></tr><tr><td>Para aprobar</td><td><b>70 %</b></td></tr>${prev ? `<tr><td>Tu mejor resultado</td><td><b>${pct(prev.best)}%</b></td></tr>` : ""}</table></div>
    ${howTo("Instrucciones del examen", ["Lee cada pregunta con calma. Hay preguntas de gramática, vocabulario y frases de la unidad.", "Después de cada respuesta verás si es correcta y por qué.", "Si no apruebas, repasa las lecciones marcadas y vuelve a intentarlo: no hay límite de intentos.", "Aprobar el examen completa la unidad y actualiza tu English Brain."], { open: true })}
    <div class="sticky-foot"><button class="btn primary big" data-go>Empezar el examen</button></div>`);
  on(v, "click", "[data-go]", () => {
    const t0 = Date.now();
    runExercises({ title: `Unit test · ${u.title}`, items: unitTestItems(u), back: `#/unit/${l.unit}`, onDone: (r) => {
      const pass = r.score >= PASS_MARK;
      const secs = sectionScores(r.results);
      s.tests.push({ t: Date.now(), kind: "unit", ref: u.id, title: `Unit test · ${u.title}`, score: Math.round(r.score * 100), pass, sections: secs });
      store.save();
      activity("exam", { unit: u.id, score: r.score, sec: Math.round((Date.now() - t0) / 1000) });
      if (pass) lessonDone(l, r.score, Math.round((Date.now() - t0) / 1000));
      finishScreen({ title: pass ? "Unit test passed! 🎉" : "Not yet — let's review and try again", emoji: pass ? "🏆" : "📘", stars: pass ? (r.score >= 0.9 ? 3 : 2) : 0,
        lines: [["Score", `${Math.round(r.score * 100)}%`], ["Result", pass ? "PASSED (≥ 70%)" : "Try again (< 70%)"], ...Object.entries(secs).map(([k, x]) => [k, `${x.ok}/${x.n}`])],
        next: pass ? `#/unit/${l.unit}` : `#/unit/${l.unit}`, nextLabel: pass ? "Back to the unit" : "Review the unit" });
    } });
  });
}
