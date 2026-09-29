// ASK MY TEACHER (sección 27): botón permanente. Respuesta local primero; IA si está activada.
import { esc } from "../../core/util.js";
import { store } from "../../core/store.js";
import { localAnswer, systemPrompt, explainLang } from "../../services/tutor.js";
import { aiReady, chat, friendlyError } from "../../services/ai.js";
import { openSheet, audioBtn, $ } from "../components.js";
import { addWord } from "../../core/actions.js";

const QUICK = ["Why do we say this?", "What does this word mean?", "Is this sentence correct?", "How would a native speaker say this?", "Explain this grammar.", "What is the difference between these words?", "Give me another example."];
const history = [];

export function openAsk(prefill = "") {
  const sh = openSheet(`
    <div class="row between"><h2 style="margin:0">🙋 Ask my teacher</h2><button class="iconbtn" data-close aria-label="Cerrar">✕</button></div>
    <p class="muted small">${aiReady() ? "✨ AI teacher active" : "Respuestas locales (sin IA). Activa la IA en Ajustes para preguntas abiertas."}</p>
    <div class="tabs" style="margin-bottom:10px">${QUICK.map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
    <div id="ans" class="stack"></div>
    <div class="composer" style="margin-top:10px"><textarea class="inp" id="q" rows="2" placeholder='e.g. What does "reliable" mean? · Is this correct: "He go to work"?'>${esc(prefill)}</textarea><button class="btn primary" data-send>Ask</button></div>`);
  const input = $("#q", sh), out = $("#ans", sh);
  sh.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]");
    if (q) { input.value = q.dataset.q.includes("this") || q.dataset.q.includes("these") ? q.dataset.q.replace(/\?$/, ": ") : q.dataset.q; input.focus(); }
    const add = e.target.closest("[data-add]");
    if (add) { addWord(add.dataset.add); add.textContent = "✔ Added"; }
    if (e.target.closest("[data-send]")) send();
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  if (prefill && !prefill.endsWith(": ")) setTimeout(send, 50);

  async function send() {
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    const box = document.createElement("div");
    box.innerHTML = `<div class="bubble me" style="margin-left:auto">${esc(q)}</div>`;
    out.appendChild(box);
    const local = localAnswer(q);
    const a = document.createElement("div");
    a.className = "bubble ai";
    a.style.maxWidth = "100%";
    box.appendChild(a);
    if (local) a.innerHTML = renderLocal(local);
    if (aiReady() && (!local || local.kind === "grammar" || local.kind === "check" || local.kind === "native")) {
      const extra = document.createElement("div");
      extra.className = "bubble ai";
      extra.style.maxWidth = "100%";
      extra.textContent = "…";
      if (local) box.appendChild(extra); else a.replaceWith(extra);
      history.push({ role: "user", content: q });
      try {
        let acc = "";
        const text = await chat({ system: systemPrompt("Answer the student's question as their English teacher. Be concise (max ~120 words), use short lists and examples."), messages: history, onText: (d) => { acc += d; extra.innerHTML = fmt(acc); } });
        extra.innerHTML = fmt(text) + ` ${audioBtn(text.slice(0, 300), { cls: "btn sm" })}`;
        history.push({ role: "assistant", content: text });
      } catch (e) { extra.textContent = friendlyError(e); history.pop(); }
    } else if (!local) {
      a.innerHTML = `No encontré una respuesta local exacta. Prueba con:<ul><li>“What does <i>word</i> mean?”</li><li>“Is this correct: <i>sentence</i>”</li><li>“Difference between make and do”</li><li>El nombre de un tema: “present perfect”, “passive”…</li></ul>O activa la IA en <a href="#/settings" data-close>Ajustes</a>.`;
    }
    a.scrollIntoView({ block: "nearest" });
  }
}

const fmt = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");

function renderLocal(r) {
  const lang = explainLang();
  switch (r.kind) {
    case "word": {
      const w = r.word;
      return `<b style="font-size:1.1rem">${w.emoji} ${esc(w.word)}</b> ${audioBtn(w.word, { cls: "btn sm" })} <span class="muted">/${esc(w.ipa)}/ · ${w.cefr}</span>
        <div>🇪🇸 ${esc(w.es)}</div><div>${esc(w.def)}</div><div><i>${esc(w.ex)}</i></div>
        ${w.syn ? `<div class="small">Synonym: ${esc(w.syn)}</div>` : ""}${w.ant ? `<div class="small">Antonym: ${esc(w.ant)}</div>` : ""}
        <div class="row" style="margin-top:6px"><button class="btn sm" data-add="${w.id}">➕ Add to vocabulary</button><a class="btn sm" href="#/word/${w.id}" data-close>Open card</a></div>`;
    }
    case "phrasal": case "idiom":
      return `<b>${esc(r.title)}</b> ${audioBtn(r.title, { cls: "btn sm" })}<div>🇪🇸 ${esc(r.es)}</div><div><i>${esc(r.ex)}</i></div>${r.reg ? `<div class="small muted">${esc(r.reg)}</div>` : ""}`;
    case "false":
      return `<b>⚠️ False friend: ${esc(r.title)}</b><div>= ${esc(r.es)}</div><div class="small">Cuidado: ${esc(r.trap)}</div><div><i>${esc(r.ex)}</i></div>`;
    case "diff":
      return `<b>${esc(r.a)} vs ${esc(r.b)}</b><div>${esc(r.es)}</div>${r.ex.map((e) => `<div>• ${esc(e)}</div>`).join("")}`;
    case "diff2":
      return `<b>${esc(r.a.word)}</b>: ${esc(r.a.es)} — ${esc(r.a.def)}<br><b>${esc(r.b.word)}</b>: ${esc(r.b.es)} — ${esc(r.b.def)}`;
    case "check":
      if (!r.errs.length) return `✅ No encuentro errores típicos en «${esc(r.sentence)}». ${aiReady() ? "" : "(La revisión local detecta errores frecuentes; para matices, activa la IA.)"}`;
      return `<b>Almost correct.</b>${r.errs.map((e) => `<div style="margin-top:6px">• <s>${esc(e.wrong)}</s> → <b>${esc(e.right)}</b><div class="small">${esc(lang === "en" ? e.en : e.es)}</div><div class="small muted">${e.ex.map(esc).join(" · ")}</div></div>`).join("")}<div style="margin-top:8px">Correct: <b>${esc(r.fixed)}</b> ${audioBtn(r.fixed, { cls: "btn sm" })}</div>`;
    case "native":
      return `<div>Correct: <b>${esc(r.fixed)}</b></div>${r.natural ? `<div>Natural: <b>${esc(r.natural.natural)}</b></div><div>Professional: <b>${esc(r.natural.professional)}</b></div>` : `<div class="small muted">${aiReady() ? "" : "Para una versión nativa personalizada, activa la IA."}</div>`}`;
    case "grammar": {
      const g = r.g;
      const rule = lang === "en" ? g.rule.en : g.rule.es;
      return `<b>${g.icon} ${esc(g.title)}</b> <span class="muted small">${g.level}</span><ul>${rule.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${g.examples.slice(0, 2).map((e) => `<div>• ${esc(e[0])}</div>`).join("")}<a class="btn sm" style="margin-top:6px" href="#/grammar/${g.id}" data-close>Open topic</a>`;
    }
    default:
      return "";
  }
}
