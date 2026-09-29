// Registro inicial corto y visual: una pregunta por pantalla (secciones 4-6, 85-86, 172-173).
import { esc } from "../../core/util.js";
import { store } from "../../core/store.js";
import { render, on, progressBar, toast, $ } from "../components.js";
import { route, go } from "../app.js";

const LANGS = [["es", "🇪🇸", "Español"], ["pt", "🇧🇷", "Português"], ["fr", "🇫🇷", "Français"], ["it", "🇮🇹", "Italiano"], ["de", "🇩🇪", "Deutsch"], ["other", "🌐", "Other"]];
export const GOALS = ["Travel", "Work", "University", "Conversation", "Business", "Professional Development", "Certification", "Immigration", "Personal Improvement", "Engineering", "Oil & Gas", "Energy", "Human Resources", "Law", "Finance", "Technology", "Medicine", "Tourism", "Other"];
export const PROFESSIONS = ["Engineering", "Oil & Gas", "Energy", "QA/QC", "Human Resources", "Law", "Finance", "Technology", "Medicine", "Business", "Tourism", "Procurement", "Auditing"];
const MINUTES = [5, 10, 15, 20, 30, 45, 60];
const STEPS = 7;

function frame(step, title, sub, body, { next = true, skip = false } = {}) {
  return render(`
    <div class="ex-head">${step > 1 ? `<a class="iconbtn" href="#/onboarding/${step - 1}" aria-label="Atrás">←</a>` : `<a class="iconbtn" href="#/welcome" aria-label="Atrás">←</a>`}${progressBar(step / STEPS)}<span class="small muted">${step}/${STEPS}</span></div>
    <h1>${title}</h1><p class="muted">${sub}</p>
    ${body}
    <div class="sticky-foot stack">${next ? `<button class="btn primary big" data-next>Continue</button>` : ""}${skip ? `<button class="btn ghost big" data-next>Skip</button>` : ""}</div>`);
}

export function registerOnboarding() {
  route("/welcome", () => {
    const v = render(`
      <div class="card hero" style="margin-top:10px;padding:26px 20px">
        <div style="font-size:3rem">🌟</div>
        <h1 style="color:#fff">Learn English that fits your life</h1>
        <p class="muted">Tu profesor personal de inglés: sabe lo que sabes, lo que estás olvidando y lo que debes aprender hoy.</p>
        <div class="row small" style="margin:10px 0 16px;gap:14px"><span>🧠 My English Brain</span><span>🗣️ Speaking</span><span>💼 Professional English</span></div>
        <a class="btn hero big" href="#/onboarding/1">Start</a>
      </div>
      <div class="card soft small"><b>Guest mode:</b> tu progreso se guarda en este dispositivo. Puedes exportarlo o importarlo cuando quieras.
        <div class="row" style="margin-top:10px"><label class="btn sm">📥 I already have progress (import)<input type="file" accept="application/json" hidden id="imp"></label></div>
        <div class="small muted" style="margin-top:8px">Email · Google · Apple: disponibles cuando se active la cuenta en la nube (ver docs, Etapa B).</div>
      </div>`);
    $("#imp", v).addEventListener("change", async (e) => {
      try { store.importJSON(await e.target.files[0].text()); toast("Progress imported ✔"); go("#/home"); } catch (err) { toast("Invalid file: " + err.message); }
    });
  });

  route("/onboarding/:step", ({ step }) => {
    const s = store.state, p = s.profile;
    const n = +step;
    let v;
    if (n === 1) {
      v = frame(1, "What is your native language?", "¿Cuál es tu idioma nativo?", `<div class="list">${LANGS.map(([k, f, l]) => `<button class="item ${p.nativeLang === k ? "sel" : ""}" data-lang="${k}" aria-pressed="${p.nativeLang === k}"><span class="em">${f}</span><span class="grow title">${l}</span>${p.nativeLang === k ? "✔" : ""}</button>`).join("")}</div>`);
      on(v, "click", "[data-lang]", (el) => { p.nativeLang = el.dataset.lang; store.save(); go("#/onboarding/2"); });
    } else if (n === 2) {
      v = frame(2, "Why are you learning English?", "Elige uno o varios objetivos.", `<div class="chips">${GOALS.map((g) => `<button class="chip ${p.goals.includes(g) ? "on" : ""}" data-goal="${esc(g)}" aria-pressed="${p.goals.includes(g)}">${esc(g)}</button>`).join("")}</div>`);
      on(v, "click", "[data-goal]", (el) => {
        const g = el.dataset.goal, i = p.goals.indexOf(g);
        if (i >= 0) p.goals.splice(i, 1); else p.goals.push(g);
        el.classList.toggle("on"); store.save();
      });
    } else if (n === 3) {
      const opts = [["beginner", "🌱", "I am a complete beginner", "Empiezo desde A1"], ["some", "📈", "I already know some English", "Haré una prueba de nivel (8–12 min)"], ["unsure", "🤔", "I'm not sure", "La prueba de nivel lo decidirá"]];
      v = frame(3, "What is your current level?", "¿Cuál es tu nivel actual?", `<div class="list">${opts.map(([k, e, t, d]) => `<button class="item" data-lvl="${k}"><span class="em">${e}</span><span class="grow"><span class="title">${t}</span><div class="sub">${d}</div></span>${p.selfLevel === k ? "✔" : ""}</button>`).join("")}</div>`, { next: false });
      on(v, "click", "[data-lvl]", (el) => { p.selfLevel = el.dataset.lvl; store.save(); go("#/onboarding/4"); });
    } else if (n === 4) {
      v = frame(4, "How much time can you study?", "Crearemos una rutina diaria de ese tamaño.", `<div class="grid3">${MINUTES.map((m) => `<button class="tile ${p.dailyMinutes === m ? "sel" : ""}" data-min="${m}" style="${p.dailyMinutes === m ? "border-color:var(--primary);border-width:2px" : ""}"><b style="font-size:1.4rem">${m}</b><span>min / day</span></button>`).join("")}</div>`, { next: false });
      on(v, "click", "[data-min]", (el) => { p.dailyMinutes = +el.dataset.min; store.save(); go("#/onboarding/5"); });
    } else if (n === 5) {
      v = frame(5, "What English accent do you prefer?", "Afecta a la voz de los audios y a las variantes de vocabulario.", `<div class="list">
        <div class="item" data-acc="us"><span class="em">🇺🇸</span><span class="grow"><span class="title">American English</span><div class="sub">apartment · elevator · vacation</div></span><button class="iconbtn" data-listen="us" aria-label="Escuchar">🔊</button></div>
        <div class="item" data-acc="uk"><span class="em">🇬🇧</span><span class="grow"><span class="title">British English</span><div class="sub">flat · lift · holiday</div></span><button class="iconbtn" data-listen="uk" aria-label="Escuchar">🔊</button></div></div>`, { next: false });
      on(v, "click", "[data-listen]", async (el, ev) => {
        ev.stopPropagation();
        const { speak } = await import("../../services/speech.js");
        speak("Hello! I'm going on vacation next week.", { accent: el.dataset.listen });
      });
      on(v, "click", "[data-acc]", (el, ev) => { if (ev.target.closest("[data-listen]")) return; p.accent = el.dataset.acc; store.save(); go("#/onboarding/6"); });
    } else if (n === 6) {
      const pr = p.professions;
      const chips = (field, multi) => `<div class="chips">${PROFESSIONS.map((x) => { const on = multi ? pr.extra.includes(x) : pr[field] === x; return `<button class="chip ${on ? "on" : ""}" data-prof="${field}" data-v="${esc(x)}">${esc(x)}</button>`; }).join("")}</div>`;
      v = frame(6, "What professional areas interest you?", "Aprenderás inglés general + inglés de tu profesión (puedes combinar varias).", `
        <h3>Primary profession</h3>${chips("primary")}
        <h3 style="margin-top:14px">Secondary</h3>${chips("secondary")}
        <h3 style="margin-top:14px">Additional interests</h3>${chips("extra", true)}
        <h3 style="margin-top:14px">My profession is…</h3><input class="inp" id="custom" value="${esc(pr.custom)}" placeholder="e.g. Pipeline integrity engineer">`, { skip: false });
      on(v, "click", "[data-prof]", (el) => {
        const f = el.dataset.prof, val = el.dataset.v;
        if (f === "extra") { const i = pr.extra.indexOf(val); if (i >= 0) pr.extra.splice(i, 1); else pr.extra.push(val); }
        else pr[f] = pr[f] === val ? "" : val;
        store.save(); go("#/onboarding/6");
      });
      $("#custom", v).addEventListener("change", (e) => { pr.custom = e.target.value.trim(); store.save(); });
    } else {
      v = frame(7, "Almost ready!", "¿Cómo quieres que te llame? (opcional)", `<input class="inp" id="name" value="${esc(p.name)}" placeholder="Your name" autocomplete="given-name">
        <div class="card soft" style="margin-top:14px"><b>Your plan</b><div class="muted small">${p.dailyMinutes} min/day · ${p.accent === "uk" ? "British" : "American"} English · ${esc([p.professions.primary, p.professions.secondary, ...p.professions.extra].filter(Boolean).join(" + ") || "General English")}</div></div>`);
      $("#name", v).addEventListener("input", (e) => { p.name = e.target.value.trim(); store.save(); });
      on(v, "click", "[data-next]", () => {
        if (p.selfLevel === "beginner") {
          p.onboarded = true; p.placementDone = false;
          s.levels.history.push({ t: Date.now(), overall: "A1" });
          store.save(); go("#/home");
        } else go("#/placement");
      });
      return;
    }
    on(v, "click", "[data-next]", () => go(`#/onboarding/${n + 1}`));
  });
}
