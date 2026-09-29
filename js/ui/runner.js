// Ejecutor de ejercicios con corrección inteligente (secciones 13, 24-25, 149) y adaptación de dificultad (sección 10).
import { esc, shuffle, pick } from "../core/util.js";
import { store } from "../core/store.js";
import { C } from "../content/registry.js";
import { check, normalize, wordDiff, speechScore } from "../engine/grader.js";
import { detect } from "../engine/errors.js";
import { makeGrammarExercise, recallHints, isProduction } from "../engine/exercises.js";
import { answer, wordResult, recordMistake, speakTime, markMistakeFixed } from "../core/actions.js";
import { PRAISE, ENCOURAGE } from "../engine/gamification.js";
import { render, on, progressBar, audioBtn, tr, $ } from "./components.js";
import { speak, listen, sttAvailable, stopListening } from "../services/speech.js";
import { explainLang } from "../services/tutor.js";
import { openAsk } from "./screens/ask.js";

const TYPE_LABEL = {
  choose: "Choose the correct option", type: "Complete the sentence", order: "Put the words in order", translate: "Translate into English",
  speak: "Say it out loud", say: "Say the word", fix: "Correct the mistake", recall: "What is this?", meaning: "What does it mean?",
  reverse: "How do you say it in English?", listen: "Listen and choose", gap: "Complete with the right word",
};

export function ruleText(topic) {
  if (!topic) return "";
  const lang = explainLang();
  const lines = lang === "en" ? topic.rule.en : topic.rule.es;
  return lines[0] + (lang === "both" && topic.rule.en[0] ? ` <span class="muted">(${esc(topic.rule.en[0])})</span>` : "");
}

// options: { title, items, onDone(results), back, feedbackExtras }
export function runExercises({ title = "Practice", items, onDone, back = "#/practice", source = "practice" }) {
  const queue = [...items];
  const results = [];
  let i = 0, wrongStreak = 0, t0 = Date.now(), cur = null, extras = 0;
  const reinforced = new Set();
  const s = store.state;

  function show() {
    if (i >= queue.length) return finish();
    const ex = queue[i];
    t0 = Date.now();
    ex._hints = 0;
    const v = (cur = render(`
      <div class="ex-head"><a class="iconbtn" href="${back}" aria-label="Salir">✕</a>${progressBar(i / queue.length)}<span class="small muted">${i + 1}/${queue.length}</span></div>
      <div class="muted small">${esc(title)} · ${esc(TYPE_LABEL[ex.type] || "")}</div>
      <div id="ex">${body(ex)}</div>
      <div id="fb"></div>
      <div class="sticky-foot"><button class="btn primary big" id="check" ${needsInput(ex) ? "disabled" : ""}>Check</button></div>`));
    wire(v, ex);
    if (ex.type === "listen") setTimeout(() => say(ex.prompt), 250);
  }

  const needsInput = (ex) => ["choose", "meaning", "reverse", "listen", "gap", "order", "type", "translate", "fix", "recall"].includes(ex.type);
  const say = (t, slow) => speak(t, { rate: slow ? 0.75 : s.settings.audioRate, accent: s.profile.accent });

  function body(ex) {
    const opts = (list) => `<div class="options" role="radiogroup">${list.map((o) => `<button class="opt" role="radio" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
    switch (ex.type) {
      case "choose":
        return `<div class="prompt">${blankify(ex.prompt)}</div>${ex.hint ? `<div class="muted small">(${esc(ex.hint)})</div>` : ""}${opts(ex.options)}`;
      case "gap":
        return `<div class="prompt">${esc(ex.prompt).replace("_____", '<span class="blank"></span>')}</div>${opts(ex.options)}`;
      case "meaning":
        return `<div class="emoji-big">${ex.word.emoji}</div><div class="prompt center">${esc(ex.prompt)} ${audioBtn(ex.prompt)}</div><div class="center muted small">/${esc(ex.word.ipa)}/</div>${opts(ex.options)}`;
      case "reverse":
        return `<div class="emoji-big">${ex.word.emoji}</div><div class="prompt center">${esc(ex.prompt)}</div>${opts(ex.options)}`;
      case "listen":
        return `<div class="center" style="margin:14px 0"><button class="btn primary" data-play>🔊 Play</button> <button class="btn" data-play-slow>🐢 Slow</button></div>${opts(ex.options)}`;
      case "type":
        return `<div class="prompt">${blankify(ex.prompt)}</div>${ex.hint ? `<div class="muted small">(${esc(ex.hint)})</div>` : ""}<input class="inp" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the missing words" aria-label="Respuesta">`;
      case "translate":
        return `<div class="prompt">${esc(ex.prompt)}</div><textarea class="inp" id="ans" rows="2" autocapitalize="sentences" placeholder="Write it in English" aria-label="Traducción"></textarea>`;
      case "fix":
        return `<div class="prompt">❗ ${esc(ex.prompt)}</div><textarea class="inp" id="ans" rows="2" placeholder="Write the correct sentence" aria-label="Frase corregida">${esc(ex.prompt)}</textarea>`;
      case "order":
        return `<div class="muted">${store.state.settings.immersion ? "" : esc(ex.prompt)}</div><div class="tokens" id="built" aria-label="Tu frase"></div><div class="tokens" id="pool" style="border-style:solid;margin-top:8px">${ex.tokens.map((t, k) => `<button class="tok" data-tok="${k}">${esc(t)}</button>`).join("")}</div><div class="row" style="margin-top:8px"><button class="btn sm ghost" data-undo>↩ Undo</button></div>`;
      case "recall":
        return `<div class="emoji-big">${ex.emoji}</div><div class="prompt center" style="font-size:1.05rem">${esc(ex.prompt)}</div><input class="inp" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the word in English" aria-label="Palabra"><div id="hints"></div><button class="btn sm ghost" data-hint style="margin-top:8px">💡 Hint</button>`;
      case "speak":
      case "say":
        return `<div class="prompt">${esc(ex.prompt)} ${audioBtn(ex.prompt)} ${audioBtn(ex.prompt, { label: "🐢", slow: true })}</div>${ex.es ? tr(ex.es) : ""}
          <div class="center" style="margin:18px 0"><button class="mic" data-mic aria-label="Hablar">🎤</button><div class="muted small" id="heard">${sttAvailable() ? "Tap the microphone and read the sentence." : "Your browser can't recognize speech. Read it aloud, then tap “I said it”."}</div></div>
          ${sttAvailable() ? "" : `<button class="btn big" data-selfsaid>✅ I said it</button>`}
          <div class="center"><button class="btn sm ghost" data-skip>Can't speak now → skip</button></div>`;
      default:
        return "";
    }
  }

  function blankify(p) { return esc(p).replace("___", '<span class="blank"></span>'); }

  function wire(v, ex) {
    const btn = $("#check", v);
    let chosen = null, built = [];
    on(v, "click", "[data-opt]", (el) => {
      if (v.dataset.locked) return;
      v.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
      el.classList.add("sel"); chosen = el.dataset.opt; btn.disabled = false;
    });
    on(v, "click", "[data-play]", () => say(ex.prompt));
    on(v, "click", "[data-play-slow]", () => say(ex.prompt, true));
    const ans = $("#ans", v);
    if (ans) {
      ans.addEventListener("input", () => (btn.disabled = !ans.value.trim()));
      ans.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && ans.value.trim()) { e.preventDefault(); btn.click(); } });
      if (ex.type === "fix") btn.disabled = false;
      setTimeout(() => ans.focus(), 50);
    }
    on(v, "click", "[data-tok]", (el) => {
      built.push(+el.dataset.tok); el.classList.add("used");
      $("#built", v).innerHTML = built.map((k) => `<span class="tok">${esc(ex.tokens[k])}</span>`).join("");
      btn.disabled = built.length === 0;
    });
    on(v, "click", "[data-undo]", () => {
      const k = built.pop();
      if (k != null) v.querySelector(`[data-tok="${k}"]`).classList.remove("used");
      $("#built", v).innerHTML = built.map((x) => `<span class="tok">${esc(ex.tokens[x])}</span>`).join("");
      btn.disabled = built.length === 0;
    });
    on(v, "click", "[data-hint]", () => {
      const hs = recallHints(ex.word);
      ex._hints = Math.min(hs.length, ex._hints + 1);
      $("#hints", v).innerHTML = hs.slice(0, ex._hints).map((h) => `<div class="hint">${esc(h)}</div>`).join("");
    });
    on(v, "click", "[data-mic]", async (el) => {
      if (el.classList.contains("rec")) { stopListening(); return; }
      el.classList.add("rec");
      const heard = $("#heard", v);
      try {
        const r = await listen({ accent: s.profile.accent, onInterim: (t) => (heard.textContent = t || "…") });
        el.classList.remove("rec");
        speakTime(r.sec);
        const sc = speechScore(r.transcript, ex.answer, r.confidence);
        grade(ex, { spoken: r.transcript, speechScore: sc });
      } catch (e) {
        el.classList.remove("rec");
        heard.textContent = e.message === "not-allowed" ? "Microphone blocked. Allow it in your browser settings." : "I couldn't hear you. Try again.";
      }
    });
    on(v, "click", "[data-selfsaid]", () => grade(ex, { self: true }));
    on(v, "click", "[data-skip]", () => { i++; show(); });
    btn.addEventListener("click", () => {
      if (v.dataset.locked) { i++; show(); return; }
      if (ex.type === "order") return grade(ex, { text: built.map((k) => ex.tokens[k]).join(" ") + (ex.punct || "") });
      if (ans) return grade(ex, { text: ans.value });
      if (chosen != null) return grade(ex, { text: chosen, chosen });
    });
  }

  function grade(ex, { text = "", chosen = null, spoken = null, speechScore: sc = null, self = false }) {
    const v = cur;
    if (v.dataset.locked) return;
    v.dataset.locked = "1";
    const ms = Date.now() - t0;
    let ok, typo = false, score = null;
    if (spoken != null) { ok = sc.score >= 0.75; score = sc.score; }
    else if (self) { ok = true; score = 0.6; }
    else if (chosen != null) ok = chosen === ex.answer;
    else {
      const accepted = ex.type === "type" ? [ex.answer, ex.full] : [ex.answer];
      const r = check(text, accepted);
      ok = r.ok; typo = r.typo;
      if (!ok && ex.type === "type" && normalize(text) === normalize(ex.answer)) ok = true;
    }
    // Registro en el Brain / SRS
    if (ex.wordId) wordResult(ex.wordId, ex.concept, { ok, hints: ex._hints, ms, typo });
    else answer({ concept: ex.concept, ok, score, ms, ctx: ex.ctx, type: self ? "choose" : ex.type, skill: ex.skill || (ex.type === "speak" || ex.type === "say" ? "sk.speaking" : null), hints: ex._hints, typo });
    results.push({ ex, ok, score: score ?? (ok ? 1 : 0) });

    // Marca opciones
    v.querySelectorAll(".opt").forEach((o) => { if (o.dataset.opt === ex.answer) o.classList.add("right"); else if (o.classList.contains("sel")) o.classList.add("wrong"); });
    const fb = $("#fb", v);
    const topic = C.grammarById[ex.topic];
    const full = ex.full || ex.answer;
    if (ok) {
      wrongStreak = 0;
      if (ex.topic) markMistakeFixed(ex.topic);
      fb.innerHTML = `<div class="feedback ok" role="status"><h4>✅ ${pick(PRAISE)}${typo ? " <span class='small'>(watch the spelling)</span>" : ""}</h4>
        <div>${esc(full)} ${audioBtn(full, { cls: "btn sm" })}</div>${ex.es ? tr(ex.es) : ""}
        ${sc ? `<div class="small">Pronunciation match: <b>${Math.round(sc.score * 100)}%</b>${sc.missed.length ? ` · check: ${esc(sc.missed.join(", "))}` : ""}</div>` : ""}</div>`;
    } else {
      wrongStreak++;
      const userText = spoken ?? text;
      const errs = userText ? detect(userText) : [];
      const diff = userText && !chosen ? wordDiff(userText, full).map((d) => `<span class="${d.s}">${esc(d.w)}</span>`).join(" ") : "";
      const rule = errs[0] ? (explainLang() === "en" ? errs[0].en : errs[0].es) : ruleText(topic);
      const exs = errs[0]?.ex || topic?.examples?.slice(0, 2).map((e) => e[0]) || [];
      fb.innerHTML = `<div class="feedback bad" role="status">
        <h4>${close(userText, full) ? "Almost correct." : pick(ENCOURAGE)}</h4>
        ${userText ? `<div class="small muted">What happened?</div><div class="diff">${diff || esc(userText)}</div>` : ""}
        ${rule ? `<div class="small muted" style="margin-top:8px">Why?</div><div>${rule}</div>` : ""}
        <div class="small muted" style="margin-top:8px">Correct:</div><div><b>${esc(full)}</b> ${audioBtn(full, { cls: "btn sm" })}</div>
        ${ex.word ? `<div class="small">${esc(ex.word.word)} = ${esc(ex.word.es)}</div>` : ""}
        ${exs.length ? `<div class="small muted" style="margin-top:8px">Examples:</div>${exs.map((e) => `<div>• ${esc(e)}</div>`).join("")}` : ""}
        ${sc ? `<div class="small" style="margin-top:6px">I heard: “${esc(spoken || "…")}” · match ${Math.round(sc.score * 100)}%</div>` : ""}
        <div class="controls"><button class="btn sm" data-ask>🙋 Ask my teacher</button>${sc ? `<button class="btn sm" data-retry>🎤 Try again</button>` : ""}</div></div>`;
      on(fb, "click", "[data-ask]", () => openAsk(`Why is it "${full}"${userText ? ` and not "${userText}"` : ""}?`));
      on(fb, "click", "[data-retry]", () => { queue.splice(i + 1, 0, { ...ex }); i++; show(); });
      // Guardar en My Mistakes y generar 2 ejercicios relacionados (sección 25)
      if (topic && !sc) {
        recordMistake({ cat: errs[0]?.cat || catFor(topic), wrong: userText || "(option)", right: full, why: rule.replace(/<[^>]+>/g, ""), topic: topic.id, pattern: errs[0]?.id || "" });
        // Máximo 2 refuerzos por tema y 6 por sesión: evita colas interminables
        if (!reinforced.has(topic.id) && extras < 6) {
          reinforced.add(topic.id);
          const others = topic.items.filter((it) => it !== ex.item);
          const extra = shuffle(others).slice(0, 2).map((it, k) => makeGrammarExercise(topic, it, k ? "type" : "choose"));
          extras += extra.length;
          queue.splice(i + 1, 0, ...extra);
        }
      } else if (ex.wordId && !sc && extras < 6 && !reinforced.has(ex.wordId)) {
        reinforced.add(ex.wordId); extras++;
        queue.push({ ...ex, type: ex.type === "recall" ? "meaning" : "recall", prompt: ex.type === "recall" ? ex.word.word : ex.word.def, emoji: ex.word.emoji, options: ex.type === "recall" ? shuffle([ex.word.es, ...C.words.filter((w) => w.topic === ex.word.topic && w.id !== ex.word.id).slice(0, 3).map((w) => w.es)]) : undefined, answer: ex.type === "recall" ? ex.word.es : ex.word.word });
      }
      // Adaptación: tras 2 errores seguidos, el siguiente de producción pasa a reconocimiento
      const nx = queue[i + 1];
      if (wrongStreak >= 2 && nx && nx.item && isProduction(nx.type) && nx.type !== "speak") queue[i + 1] = makeGrammarExercise(C.grammarById[nx.topic], nx.item, "choose");
    }
    const btn = $("#check", v);
    btn.disabled = false;
    btn.textContent = "Continue";
    btn.focus();
  }

  const close = (a, b) => a && check(a, [b]).close;

  function finish() {
    const ok = results.filter((r) => r.ok).length;
    const score = results.length ? results.reduce((a, r) => a + r.score, 0) / results.length : 0;
    onDone && onDone({ results, ok, total: results.length, score, sec: 0 });
  }

  show();
}

function catFor(topic) {
  if (/prepositions/.test(topic.id)) return "Prepositions";
  if (/articles/.test(topic.id)) return "Articles";
  if (/past|present|perfect|will|going|conditional|continuous|used-to/.test(topic.id)) return "Verb Tenses";
  return "Grammar";
}
