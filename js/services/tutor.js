// AI English Teacher / Ask My Teacher (secciones 24-27, 133, 161-162).
// Primero responde localmente (gratis, offline); usa la IA solo si aporta valor y está activada.
import { C } from "../content/registry.js";
import { CONFUSABLES, FALSE_FRIENDS, PHRASAL_VERBS, IDIOMS, NATURAL } from "../content/extras.js";
import { detect, correct } from "../engine/errors.js";
import { summary } from "../engine/brain.js";
import { store } from "../core/store.js";
import { levelIndex } from "../core/util.js";

// Idioma de explicación según nivel (sección 22)
export function explainLang() {
  const s = store.state;
  if (s.settings.explainLang !== "auto") return s.settings.explainLang;
  const li = levelIndex(s.levels.overall);
  return li <= 1 ? "es" : li === 2 ? "both" : "en";
}

export function systemPrompt(extra = "") {
  const s = store.state;
  const lang = explainLang();
  return [
    "You are the student's permanent English teacher inside the app 'Inglés Práctico'. You are motivating but professional (never childish).",
    summary(s, C.catalog),
    lang === "es" ? "Explain mainly in Spanish, with English examples." : lang === "both" ? "Explain in simple English and add a short Spanish translation of key points." : "Explain in English.",
    "When correcting, use this order: what happened → why it is incorrect → the correct form → the rule → one example. Keep answers short and scannable.",
    "Never invent grammar rules. If usage varies or you are not sure, say so clearly.",
    "Adapt examples to the student's profession when useful.",
    "You teach language only: for legal, medical or financial topics, teach the vocabulary and make clear it is not professional advice.",
    extra,
  ].filter(Boolean).join("\n");
}

const norm = (x) => String(x).toLowerCase().trim().replace(/[¿?¡!."“”']/g, "");

function lookupWord(w) {
  const q = norm(w);
  const word = C.words.find((x) => x.word.toLowerCase() === q) || C.words.find((x) => x.word.toLowerCase().startsWith(q + " ")) || C.words.find((x) => x.es.toLowerCase().split(/[ /,]/).includes(q));
  if (word) return { kind: "word", word };
  const pv = PHRASAL_VERBS.find((p) => p[0] === q);
  if (pv) return { kind: "phrasal", title: pv[0], es: pv[1], ex: pv[2] };
  const id = IDIOMS.find((p) => p[0] === q);
  if (id) return { kind: "idiom", title: id[0], es: id[1], ex: id[2], reg: id[3] };
  const ff = FALSE_FRIENDS.find((p) => p[0].startsWith(q));
  if (ff) return { kind: "false", title: ff[0], es: ff[1], trap: ff[2], ex: ff[3] };
  return null;
}

function findGrammar(q) {
  const s = norm(q);
  let best = null, bestScore = 0;
  for (const g of C.grammar) {
    const keys = [g.title, g.es, g.id.slice(2).replace(/-/g, " ")].map(norm);
    for (const k of keys) {
      const kw = k.split(/\s+/).filter((w) => w.length > 2);
      const score = kw.filter((w) => s.includes(w)).length / Math.max(1, kw.length);
      if (score > bestScore) { bestScore = score; best = g; }
    }
  }
  return bestScore >= 0.6 ? best : null;
}

// Respuesta local estructurada o null
export function localAnswer(question) {
  const q = question.trim();
  let m;
  if ((m = q.match(/difference between ["']?([\w -]+?)["']? and ["']?([\w -]+?)["']?\??$/i) || q.match(/diferencia entre ["']?([\w -]+?)["']? y ["']?([\w -]+?)["']?\??$/i))) {
    const a = norm(m[1]), b = norm(m[2]);
    const c = CONFUSABLES.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (c) return { kind: "diff", a: c.a, b: c.b, es: c.es, ex: c.ex };
    const wa = lookupWord(a), wb = lookupWord(b);
    if (wa?.word && wb?.word) return { kind: "diff2", a: wa.word, b: wb.word };
  }
  if ((m = q.match(/(?:is (?:this|it) (?:sentence )?correct|es correct[oa]|está bien)\??[:\s]*["“]?(.+?)["”]?$/i)) && m[1].split(" ").length >= 2) {
    return checkSentence(m[1]);
  }
  if ((m = q.match(/(?:how would a native (?:speaker )?say|c[oó]mo lo dir[ií]a un nativo)[:\s]*["“]?(.+?)["”]?\??$/i))) {
    const fixed = correct(m[1]);
    const nat = NATURAL.find((n) => norm(n.textbook) === norm(m[1]) || norm(n.correct) === norm(fixed));
    return { kind: "native", original: m[1], fixed, natural: nat };
  }
  if ((m = q.match(/what does ["']?(.+?)["']? mean|meaning of ["']?(.+?)["']?\??$|qu[eé] significa ["']?(.+?)["']?\??$|what is ["']?(.+?)["']? in english|c[oó]mo se dice ["']?(.+?)["']?(?: en ingl[eé]s)?\??$/i))) {
    const w = m[1] || m[2] || m[3] || m[4] || m[5];
    const r = lookupWord(w);
    if (r) return r;
  }
  if (/^["“]?[A-Za-z][^?]*[.!]["”]?$/.test(q) && q.split(" ").length >= 3) return checkSentence(q.replace(/^["“]|["”]$/g, ""));
  const g = findGrammar(q);
  if (g) return { kind: "grammar", g };
  const single = q.match(/^["']?([a-z][a-z -]{1,25})["']?\??$/i);
  if (single) { const r = lookupWord(single[1]); if (r) return r; }
  return null;
}

export function checkSentence(sentence) {
  const errs = detect(sentence);
  return { kind: "check", sentence, errs, fixed: errs.length ? correct(sentence) : sentence };
}
