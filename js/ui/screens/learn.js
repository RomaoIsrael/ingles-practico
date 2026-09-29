// LEARN (secciones 15-16, 120, 144, 161-164): niveles, ruta visual, unidades, lecciones y fichas de gramática.
import { esc, LEVELS, levelIndex, pct, shuffle } from "../../core/util.js";
import { store } from "../../core/store.js";
import { C } from "../../content/registry.js";
import { STAGES, UNITS, LESSON_BY_ID } from "../../content/curriculum.js";
import { ROUTES } from "../../content/professional.js";
import { current, stateOf, readyForExam, coverage } from "../../engine/brain.js";
import { lessonSequence, reviewSet, vocabLessonSequence, profContexts, checkChallenge } from "../../engine/exercises.js";
import { lessonTitle } from "../../engine/planner.js";
import { lessonDone, analyzeText, addWord, answer } from "../../core/actions.js";
import { render, on, progressBar, statePill, audioBtn, tr, $, toast, backLink, openSheet, howTo, deepSections } from "../components.js";
import { lessonExtras } from "./lessons-extra.js";
import { route, go, finishScreen, session } from "../app.js";
import { runExercises, ruleText } from "../runner.js";
import { explainLang } from "../../services/tutor.js";
import { openAsk } from "./ask.js";
import { aiReady, ask as aiAsk, friendlyError } from "../../services/ai.js";
import { systemPrompt } from "../../services/tutor.js";

const KIND_ICON = { grammar: "🧩", vocab: "📚", talk: "🗣️", read: "📖", pron: "👄", alphabet: "🔤", phrases: "💬", test: "📝" };
const KIND_ES = { grammar: "Gramática", vocab: "Vocabulario", talk: "Conversación", read: "Lectura", pron: "Pronunciación", alphabet: "Alfabeto", phrases: "Frases útiles", test: "Examen de unidad" };

export function registerLearn() {
  route("/learn", () => go(`#/learn/${store.state.levels.overall}`));

  route("/learn/:tab", ({ tab }) => {
    const s = store.state;
    const tabs = `<div class="tabs">${[...LEVELS, "PRO"].map((l) => `<a class="chip ${l === tab ? "on" : ""}" href="#/learn/${l}">${l === "PRO" ? "💼 Professional" : l}</a>`).join("")}</div>`;
    if (tab === "PRO") {
      render(`<h1>Learn</h1>${tabs}<h2>Professional English</h2><p class="muted small">Combina inglés general + inglés de tu profesión.</p>
        <div class="grid2">${ROUTES.map((r) => `<a class="tile" href="#/pro/${r.id}"><span class="em">${r.icon}</span><b>${esc(r.title)}</b><span>${esc(r.es)}</span></a>`).join("")}</div>`);
      return;
    }
    const units = UNITS.filter((u) => u.level === tab);
    const stages = STAGES.filter((st) => units.some((u) => u.stage === st.id) || (st.id === "start" && tab === "A1"));
    const { coverage: cov, ready } = readyForExam(s, C.catalog);
    const isCur = tab === s.levels.overall;
    const covTab = coverage(s, C.catalog, tab);
    render(`<h1>Learn</h1>${tabs}
      <div class="row" style="margin-top:10px"><a class="btn sm" href="#/syllabus/${tab}">📖 Temario ${tab}</a><a class="btn sm" href="#/tests">📝 Test Center</a><a class="btn sm" href="#/grammar">🧩 Apuntes</a></div>
      <div class="card soft" style="margin-top:12px"><div class="row between"><b>${tab} ${{ A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Proficiency" }[tab]}</b><span class="small muted">Real mastery ${pct(covTab)}%</span></div>${progressBar(covTab)}
        ${isCur ? `<div class="row" style="margin-top:10px"><a class="btn sm ${ready ? "primary" : ""}" href="#/exam/${tab}">${ready ? "🏆 Take the level exam" : `🔒 Level exam at 70% (${pct(cov)}%)`}</a></div>` : ""}</div>
      <div class="path" style="margin-top:16px">${stages.map((st) => {
        const us = units.filter((u) => u.stage === st.id);
        const all = us.flatMap((u) => u.lessons), done = all.filter((l) => s.lessons[l.id]?.done).length;
        const cls = all.length && done === all.length ? "done" : done ? "now" : "";
        return `<div class="stage ${cls}"><div class="dot">${st.icon}</div><h3 style="padding-top:14px">${esc(st.title)}</h3>
          ${st.id === "start" ? `<div class="muted small">¿Empiezas desde cero? Aquí aprendes el alfabeto, los números, los saludos y tus primeras 100 palabras.</div>` : ""}
          <div class="list">${us.map((u) => {
            const ud = u.lessons.filter((l) => s.lessons[l.id]?.done).length;
            return `<a class="item" href="#/unit/${u.id}"><span class="em">${ud === u.lessons.length ? "✅" : KIND_ICON[u.lessons[0].kind]}</span><span class="grow"><span class="title">${esc(u.title)}</span><div class="sub">${esc(u.es)} · ${ud}/${u.lessons.length}</div>${progressBar(ud / u.lessons.length, true)}</span></a>`;
          }).join("")}</div></div>`;
      }).join("")}
      <div class="stage"><div class="dot">${tab === "C2" ? "👑" : "⬇️"}</div><h3 style="padding-top:14px">${tab === "C2" ? "C2 MASTER" : `Next: ${LEVELS[levelIndex(tab) + 1]}`}</h3></div></div>`);
  });

  route("/unit/:id", ({ id }) => {
    const u = UNITS.find((x) => x.id === id);
    if (!u) return go("#/learn");
    const s = store.state;
    const done = u.lessons.filter((l) => s.lessons[l.id]?.done).length;
    const next = u.lessons.find((l) => !s.lessons[l.id]?.done);
    render(`${backLink(`#/learn/${u.level}`, u.level)}<div class="muted small">UNIDAD ${esc(u.id.toUpperCase())} · ${u.level}</div><h1>${esc(u.title)}</h1><p class="muted">${esc(u.es)}</p>
      ${progressBar(done / u.lessons.length)}<div class="small muted" style="margin:4px 0 12px">${done}/${u.lessons.length} lecciones completadas</div>
      ${u.goals.length ? `<div class="card"><h3>🎯 Al terminar esta unidad podrás…</h3>${u.goals.map((g) => `<div class="goal">✅ <span>${esc(g)}</span></div>`).join("")}</div>` : ""}
      ${u.learn.length ? `<div class="card"><h3>📚 Qué vas a estudiar</h3><ul>${u.learn.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      ${howTo("Cómo estudiar esta unidad", ["Haz las lecciones <b>en orden</b>, de arriba hacia abajo.", "En cada lección: primero <b>lee y escucha</b> la explicación, luego <b>practica</b> y por último <b>habla</b>.", "Si fallas, lee la explicación del error: aprender de los errores es parte del método.", "Termina con el <b>examen de unidad</b> (aprobado ≥ 70 %). Si no apruebas, repasa y vuelve a intentarlo."])}
      ${next ? `<a class="btn primary big" href="#/lesson/${encodeURIComponent(next.id)}" style="margin-bottom:12px">▶ Continuar: ${esc(lessonTitle(next, C))}</a>` : `<div class="banner">🏆 ¡Unidad completada!</div>`}
      <h2>Lecciones</h2><div class="list">${u.lessons.map((l, i) => {
        const st = s.lessons[l.id];
        return `<a class="item" href="#/lesson/${encodeURIComponent(l.id)}"><span class="em">${st?.done ? "✅" : KIND_ICON[l.kind]}</span><span class="grow"><span class="title">${i + 1}. ${esc(lessonTitle(l, C))}</span><div class="sub">${KIND_ES[l.kind]} · ${st ? "★".repeat(st.stars) + "☆".repeat(3 - st.stars) : l.kind === "test" ? "10 min" : "5–12 min"}</div></span>▶</a>`;
      }).join("")}</div>`);
  });

  route("/lesson/:id", ({ id }) => {
    const l = LESSON_BY_ID[id];
    if (!l) return go("#/learn");
    session.lesson = l;
    if (l.kind === "grammar") return grammarLesson(l);
    if (l.kind === "vocab") return vocabLesson(l);
    if (l.kind === "talk") return go(`#/roleplay/${l.ref}`);
    if (l.kind === "read") return go(`#/read/${l.ref}`);
    if (l.kind === "pron") return go(`#/pron/${l.ref}`);
    return lessonExtras(l);
  });

  // Lista y ficha de gramática
  route("/grammar", () => {
    const s = store.state;
    render(`${backLink("#/practice", "Practice")}<h1>Grammar</h1><p class="muted small">Toca un tema para ver la regla, practicar o dominarlo.</p>
      ${LEVELS.map((L) => `<h2>${L}</h2><div class="list">${C.grammar.filter((g) => g.level === L).map((g) => {
        const r = s.skills[g.id];
        return `<a class="item" href="#/grammar/${g.id}"><span class="em">${g.icon}</span><span class="grow"><span class="title">${esc(g.title)}</span><div class="sub">${esc(g.es)}</div>${r ? progressBar(current(r), true) : ""}</span>${statePill(stateOf(r))}</a>`;
      }).join("")}</div>`).join("")}`);
  });

  route("/grammar/:id", ({ id }) => grammarCard(id));
  route("/grammar/:id/practice", ({ id }) => grammarPractice(id, false));
  route("/grammar/:id/master", ({ id }) => grammarPractice(id, true));
}

function ruleBlock(g, simple = false) {
  const lang = explainLang();
  if (simple) return `<div class="feedback info"><h4>💡 Explain more simply</h4>${esc(lang === "en" ? g.simple.en : g.simple.es)}</div>`;
  const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  return `${lang !== "en" ? list(g.rule.es) : ""}${lang !== "es" ? `<div class="${lang === "both" ? "muted small" : ""}">${list(g.rule.en)}</div>` : ""}<div class="card soft small"><b>Pattern:</b> ${esc(g.pattern || "")}</div>`;
}

function examplesBlock(list) {
  return `<div class="list">${list.map(([en, es]) => `<div class="item" style="cursor:default"><span class="grow"><b>${esc(en)}</b>${tr(es)}</span>${audioBtn(en)}</div>`).join("")}</div>`;
}

// Ficha de gramática: Learn in context + botones Explain simply / More examples / Practice this / Master this
function grammarCard(id) {
  const g = C.grammarById[id];
  if (!g) return go("#/grammar");
  const s = store.state, r = s.skills[g.id];
  const fav = s.favorites.some((f) => f.id === g.id);
  const v = render(`${backLink("#/grammar", "Grammar")}
    <div class="row between"><h1>${g.icon} ${esc(g.title)}</h1>${statePill(stateOf(r))}</div>
    <p class="muted">${esc(g.es)} · ${g.level}${r ? ` · Mastery ${pct(current(r))}%` : ""}</p>
    <div class="card"><div style="font-size:2rem">${g.situation.emoji}</div><b>${esc(g.situation.en)}</b>${tr(g.situation.es)}</div>
    <h2>Examples</h2>${examplesBlock(g.examples)}
    ${g.deep ? `<div class="tabs no-print" style="margin:14px 0 4px">${deepSections(g).map((x) => `<a class="chip" href="javascript:void 0" data-jump="${x.id}">${x.icon} ${esc(x.title.split(" (")[0])}</a>`).join("")}</div>
      ${deepSections(g).map((x) => `<div class="card section-card" id="sec-${x.id}"><h2>${x.icon} ${esc(x.title)}</h2>${x.html}</div>`).join("")}
      <div class="card soft"><h3>📌 Resumen de la regla</h3>${ruleBlock(g)}</div>` : `<h2>Rule</h2><div class="card" id="rule">${ruleBlock(g)}</div>`}
    <div class="controls no-print">
      <button class="btn sm" data-print>🖨️ Print notes</button>
      <button class="btn sm" data-simple>💡 Explain More Simply</button>
      <button class="btn sm" data-more>➕ More Examples</button>
      <a class="btn sm primary" href="#/grammar/${g.id}/practice">🎯 Practice This</a>
      <a class="btn sm" href="#/grammar/${g.id}/master">🏆 Master This</a>
      <button class="btn sm" data-ask>🙋 Ask</button>
      <button class="btn sm" data-fav>${fav ? "★ Saved" : "☆ Favorite"}</button>
      <button class="btn sm" data-note>📝 Note</button>
    </div><div id="extra"></div>`);
  on(v, "click", "[data-simple]", () => { $("#extra", v).innerHTML = ruleBlock(g, true); $("#extra", v).scrollIntoView({ behavior: "smooth" }); });
  on(v, "click", "[data-jump]", (el) => v.querySelector(`#sec-${el.dataset.jump}`)?.scrollIntoView({ behavior: "smooth" }));
  on(v, "click", "[data-print]", () => window.print());
  on(v, "click", "[data-more]", async () => {
    const box = $("#extra", v);
    const prof = profContexts(s.profile);
    const items = shuffle(g.items).sort((a, b) => (prof.includes(b[3]) ? 1 : 0) - (prof.includes(a[3]) ? 1 : 0)).slice(0, 3);
    const { fullSentence } = await import("../../content/grammar.js");
    box.innerHTML = `<h2>More examples</h2>${examplesBlock([...g.more, ...items.map((it) => [fullSentence(it), it[4]])])}`;
  });
  on(v, "click", "[data-ask]", () => openAsk(`Explain ${g.title} with examples.`));
  on(v, "click", "[data-fav]", () => { toggleFav({ type: "grammar", id: g.id, label: g.title }); grammarCard(id); });
  on(v, "click", "[data-note]", () => noteSheet(g.id, g.title));
}

export function toggleFav(item) {
  const s = store.state, i = s.favorites.findIndex((f) => f.id === item.id);
  if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push(item);
  store.save();
  toast(i >= 0 ? "Removed from favorites" : "Saved to favorites ★");
}

export function noteSheet(ref, label) {
  const sh = openSheet(`<h2>📝 Note · ${esc(label)}</h2><textarea class="inp" id="nt" rows="5" placeholder="Write your own note…"></textarea><div class="row" style="margin-top:10px"><button class="btn primary" data-save>Save</button><button class="btn ghost" data-close>Cancel</button></div>`);
  sh.querySelector("[data-save]").addEventListener("click", () => {
    const text = sh.querySelector("#nt").value.trim();
    if (text) { store.state.notes.push({ id: Date.now().toString(36), t: Date.now(), text, ref, label }); store.save(); toast("Note saved"); }
    document.getElementById("sheet").remove();
  });
}

function grammarPractice(id, master) {
  const g = C.grammarById[id];
  const s = store.state;
  const prof = profContexts(s.profile), recent = s.skills[id]?.ctx || [];
  const items = master
    ? [...lessonSequence(g, { prof, recent, easy: true }), ...reviewSet(g, 6, { prof, recent })]
    : reviewSet(g, 6, { prof, recent });
  runExercises({
    title: `${master ? "Master" : "Practice"}: ${g.title}`, items, back: `#/grammar/${id}`,
    onDone: ({ ok, total, score }) => finishScreen({
      title: score >= 0.8 ? "Great improvement." : "Let's reinforce this one more time.", emoji: score >= 0.8 ? "💪" : "🔁",
      lines: [["Correct", `${ok}/${total}`], [g.title, `${pct(current(s.skills[id]))}% · ${stateOf(s.skills[id])}`]], next: `#/grammar/${id}`, nextLabel: "Back to the topic",
    }),
  });
}

// ── Lección de gramática: Learn → Example → Practice → Speak → Review → Mini Challenge ──
function grammarLesson(l) {
  const g = C.grammarById[l.ref];
  const s = store.state;
  const pref = s.prefs[g.id];
  const t0 = Date.now();
  // Diapositivas: Situación → Ejemplos → apuntes por secciones → Resumen → Práctica
  const deep = deepSections(g);
  const slides = [
    { icon: "🎬", title: "1 · La situación", html: `<div class="card"><div style="font-size:2.6rem">${g.situation.emoji}</div><p class="lead"><b>${esc(g.situation.en)}</b></p>${tr(g.situation.es)}</div><p class="muted small">Primero vemos el idioma en una situación real. Después entenderemos la regla.</p>` },
    { icon: "👀", title: "2 · Mira los ejemplos", html: `${howTo("Qué hacer", ["Pulsa 🔊 y escucha cada frase.", "Repite en voz alta.", "Fíjate en las palabras que cambian: ahí está la regla."], { open: true })}${examplesBlock(g.examples)}` },
    ...(deep.length ? groupDeep(deep) : [{ icon: "📏", title: "3 · La regla", html: ruleBlock(pref === "hard" ? g : g) }]),
    { icon: "📌", title: "Resumen", html: `<div class="card">${ruleBlock(g)}</div>${pref === "hard" ? ruleBlock(g, true) : ""}<p class="muted small">Ahora vamos a practicar: primero reconocer, después escribir y al final hablar.</p>` },
  ];
  let k = 0;
  const show = () => {
    const sl = slides[k];
    const v = render(`${backLink(`#/unit/${l.unit}`, "Unit")}
      <div class="muted small">LEARN · ${g.level} · ${esc(g.title)}</div>
      <div class="steps" aria-label="Paso ${k + 1} de ${slides.length}">${slides.map((_, i) => `<i class="${i === k ? "on" : ""}"></i>`).join("")}</div>
      <h1>${sl.icon} ${esc(sl.title)}</h1>${k === 0 ? `<div class="small muted">${esc(g.es)}</div>` : ""}
      ${sl.html}
      <div class="controls"><button class="btn sm" data-simple>💡 Explain More Simply</button><button class="btn sm" data-ask>🙋 Ask</button>${k === 0 ? `<button class="btn sm" data-know>✔ I already know this</button>` : ""}</div><div id="simple"></div>
      <div class="sticky-foot row" style="flex-wrap:nowrap">${k ? `<button class="btn big" data-prev style="width:auto">←</button>` : ""}<button class="btn primary big" data-next>${k < slides.length - 1 ? "Siguiente →" : "¡A practicar! →"}</button></div>`);
    on(v, "click", "[data-simple]", () => ($("#simple", v).innerHTML = ruleBlock(g, true)));
    on(v, "click", "[data-ask]", () => openAsk(`Explain ${g.title} with examples.`));
    on(v, "click", "[data-know]", () => quickCheck(l, g));
    on(v, "click", "[data-prev]", () => { k--; show(); });
    on(v, "click", "[data-next]", () => { if (k < slides.length - 1) { k++; show(); } else practice(); });
  };
  const practice = () => {
    const prof = profContexts(s.profile), recent = s.skills[g.id]?.ctx || [];
    const items = lessonSequence(g, { prof, recent, hard: pref === "hard", easy: pref === "easy" });
    // Review: interleaving con un tema ya estudiado
    const studied = C.grammar.filter((x) => x.id !== g.id && s.skills[x.id]?.n);
    if (studied.length) items.push(...reviewSet(shuffle(studied)[0], 2, { prof }));
    runExercises({ title: g.title, items, back: `#/unit/${l.unit}`, onDone: (res) => challenge(l, g, res, t0) });
  };
  show();
}

// Agrupa los apuntes en 3–4 diapositivas digeribles
function groupDeep(deep) {
  const by = Object.fromEntries(deep.map((d) => [d.id, d]));
  const card = (d) => (d ? `<div class="card"><h3>${d.icon} ${esc(d.title)}</h3>${d.html}</div>` : "");
  const out = [{ icon: "💡", title: "3 · Entiende la regla", html: card(by.intro) + card(by.form) }];
  if (by.uses) out.push({ icon: "🎯", title: "4 · ¿Cuándo se usa?", html: card(by.uses) + card(by.signals) + card(by.spelling) });
  if (by.mistakes || by.spanish || by.tips) out.push({ icon: "⚠️", title: "5 · Errores comunes y trucos", html: card(by.mistakes) + card(by.spanish) + card(by.tips) });
  return out;
}

function quickCheck(l, g) {
  runExercises({
    title: `Quick check: ${g.title}`, items: reviewSet(g, 3), back: `#/lesson/${encodeURIComponent(l.id)}`,
    onDone: ({ ok, total, score }) => {
      if (ok >= 2) {
        const stars = lessonDone(l, score, 60);
        finishScreen({ title: "You already know this!", emoji: "⚡", stars, lines: [["Quick check", `${ok}/${total}`], ["Status", "Lesson completed"]], next: `#/unit/${l.unit}` });
      } else finishScreen({ title: "Let's learn it properly", emoji: "📘", lines: [["Quick check", `${ok}/${total}`]], next: `#/lesson/${encodeURIComponent(l.id)}`, nextLabel: "Start the lesson" });
    },
  });
}

function challenge(l, g, res, t0) {
  const s = store.state;
  const v = render(`<div class="muted small">MINI CHALLENGE</div><h1>🎯 Your turn</h1>
    <div class="card"><b>${esc(g.challenge.en)}</b>${tr(g.challenge.es)}</div>
    <textarea class="inp" id="ch" rows="4" placeholder="Write here in English…" style="margin-top:12px"></textarea><div id="fb"></div>
    <div class="sticky-foot stack"><button class="btn primary big" data-check>Check</button><button class="btn ghost" data-skip>Skip challenge</button></div>`);
  let checked = false;
  on(v, "click", "[data-skip]", () => controls(l, g, res, t0));
  on(v, "click", "[data-check]", async (btn) => {
    if (checked) return controls(l, g, res, t0);
    const text = $("#ch", v).value.trim();
    if (!text) return;
    checked = true;
    const errs = analyzeText(text, "challenge");
    const usesTarget = checkChallenge(g, text);
    const ok = usesTarget && errs.filter((e) => e.cat !== "Writing").length === 0;
    answer({ concept: g.id, ok, score: ok ? 1 : usesTarget ? 0.5 : 0.3, type: "type", ctx: "challenge", skill: "sk.writing" });
    const { correct } = await import("../../engine/errors.js");
    $("#fb", v).innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><h4>${ok ? "✅ Excellent — correct and natural." : errs.length ? "Almost correct — let's polish it:" : `Good sentence! Now try to use the target structure (${esc(g.pattern || g.title)}).`}</h4>
      ${errs.map((e) => `<div>• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b><div class="small muted">${esc(explainLang() === "en" ? e.en : e.es)}</div></div>`).join("")}
      ${errs.length ? `<div class="small muted" style="margin-top:6px">Corrected:</div><b>${esc(correct(text))}</b>` : ""}
      ${aiReady() ? `<div id="ai" class="small muted" style="margin-top:8px">✨ Asking your AI teacher for a more natural version…</div>` : ""}</div>`;
    btn.textContent = "Continue";
    if (aiReady()) {
      try {
        const out = await aiAsk({ system: systemPrompt(), prompt: `The student wrote this sentence for the challenge "${g.challenge.en}" (topic: ${g.title}):\n"${text}"\nGive: 1) Corrected, 2) Natural version, 3) one short tip. Max 60 words.` });
        $("#ai", v).innerHTML = `<div style="white-space:pre-wrap;color:var(--text)">${esc(out)}</div>`;
      } catch (e) { $("#ai", v).textContent = friendlyError(e); }
    }
  });
}

// Controles del usuario (sección 137)
function controls(l, g, res, t0) {
  const s = store.state;
  const stars = lessonDone(l, res.score, Math.round((Date.now() - t0) / 1000));
  const v = finishScreen({
    title: res.score >= 0.9 ? "Excellent lesson!" : res.score >= 0.7 ? "Great improvement." : "Good effort — we'll review this soon.",
    emoji: res.score >= 0.7 ? "🎉" : "💪", stars,
    lines: [["Correct answers", `${res.ok}/${res.total}`], [g.title, `${pct(current(s.skills[g.id]))}% · ${stateOf(s.skills[g.id])}`]],
    next: `#/unit/${l.unit}`, nextLabel: "Next lesson",
    extra: `<div class="card"><b>How was this lesson?</b><div class="controls">
      <button class="btn sm" data-pref="easy">😎 Too easy</button><button class="btn sm" data-pref="hard">😵 Too difficult</button>
      <a class="btn sm" href="#/grammar/${g.id}">🔁 Explain again</a><a class="btn sm" href="#/grammar/${g.id}/practice">➕ Practice more</a><a class="btn sm" href="#/grammar/${g.id}/master">🏆 Master this</a><a class="btn sm" href="#/unit/${l.unit}">⏭ Skip</a></div></div>`,
  });
  on(v, "click", "[data-pref]", (el) => { s.prefs[g.id] = el.dataset.pref; store.save(); toast(el.dataset.pref === "easy" ? "Next time: more production, less recognition." : "Next time: more examples and simpler explanations."); });
}

// ── Lección de vocabulario ──
function vocabLesson(l) {
  const t = C.topicById[l.ref];
  const s = store.state;
  const words = t.words.map((id) => C.wordById[id]).filter(Boolean).sort((a, b) => a.freq - b.freq || levelIndex(a.cefr) - levelIndex(b.cefr));
  const batch = words.filter((w) => !s.vocab[w.id]?.reps).slice(0, 6);
  const learn = batch.length ? batch : words.slice(0, 6);
  let k = 0;
  const t0 = Date.now();
  function card() {
    if (k >= learn.length) return practice();
    const w = learn[k];
    const variant = s.profile.accent === "uk" && w.uk ? w.uk : "";
    const v = render(`<div class="ex-head">${backLink(`#/unit/${l.unit}`, "Unit")}${progressBar(k / learn.length)}<span class="small muted">${k + 1}/${learn.length}</span></div>
      <div class="muted small">LEARN · ${esc(t.title)}</div>
      <div class="card center" style="margin-top:10px"><div class="emoji-big">${w.emoji}</div>
        <h1>${esc(w.word)} ${audioBtn(w.word)}</h1>${variant ? `<div class="small">🇬🇧 ${esc(variant)}</div>` : ""}<div class="muted">/${esc(w.ipa)}/ · ${w.cefr}</div>
        ${tr(w.es)}<p>${esc(w.def)}</p><p><i>${esc(w.ex)}</i> ${audioBtn(w.ex, { label: "🔉" })}</p>
        ${w.syn || w.ant ? `<div class="small muted">${w.syn ? `Synonym: <b>${esc(w.syn)}</b>` : ""} ${w.ant ? `· Antonym: <b>${esc(w.ant)}</b>` : ""}</div>` : ""}</div>
      <div class="sticky-foot"><button class="btn primary big" data-next>Next →</button></div>`);
    setTimeout(() => import("../../services/speech.js").then((m) => m.speak(w.word, { accent: s.profile.accent, rate: s.settings.audioRate })), 250);
    on(v, "click", "[data-next]", () => { addWord(w.id); k++; card(); });
  }
  function practice() {
    const pool = words;
    runExercises({
      title: t.title, items: vocabLessonSequence(learn, pool), back: `#/unit/${l.unit}`,
      onDone: (res) => {
        const stars = lessonDone(l, res.score, Math.round((Date.now() - t0) / 1000));
        finishScreen({ title: "New words added to My Vocabulary", emoji: "📚", stars, lines: [["Words learned", learn.length], ["Correct", `${res.ok}/${res.total}`], ["Next review", "tomorrow"]], next: `#/unit/${l.unit}`, nextLabel: "Next lesson" });
      },
    });
  }
  card();
}
