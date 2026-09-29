// Generador de ejercicios a partir del contenido (secciones 13, 16, 147, 149, 151, 163).
// Un mismo ítem produce varios tipos de ejercicio; se rotan contextos para evitar repetición.
import { shuffle, words as tokenize } from "../core/util.js";
import { itemObj, fullSentence, hintOf } from "../content/grammar.js";

export const PROF_CTX = {
  Engineering: ["eng"], "Oil & Gas": ["oil", "eng"], Energy: ["eng"], "QA/QC": ["qa"], "Human Resources": ["hr"],
  Law: ["law"], Finance: ["biz"], Business: ["biz", "meeting"], Technology: ["eng"], Tourism: ["travel"],
  Procurement: ["biz"], Auditing: ["qa"], Medicine: ["daily"], Work: ["work", "meeting"], Travel: ["travel"],
};

export function profContexts(profile) {
  const p = profile.professions || {};
  const list = [p.primary, p.secondary, ...(p.extra || []), ...(profile.goals || [])].filter(Boolean);
  return [...new Set(list.flatMap((x) => PROF_CTX[x] || []))];
}

// Ordena ítems: primero contextos profesionales del usuario, luego contextos no usados recientemente
export function orderItems(items, { prof = [], recent = [], rnd = Math.random } = {}) {
  const scored = items.map((it) => {
    const { ctx } = itemObj(it);
    let score = rnd();
    if (prof.includes(ctx)) score += 1.2;
    if (!recent.includes(ctx)) score += 0.6;
    return [score, it];
  });
  return scored.sort((a, b) => b[0] - a[0]).map((x) => x[1]);
}

const PRODUCTION = new Set(["type", "order", "translate", "speak", "fix"]);
export const isProduction = (type) => PRODUCTION.has(type);

export function makeGrammarExercise(topic, it, type, rnd = Math.random) {
  const o = itemObj(it);
  const full = fullSentence(it);
  const base = { concept: topic.id, topic: topic.id, ctx: o.ctx, es: o.es, full, answer: o.a, type, hint: hintOf(it), item: it };
  switch (type) {
    case "choose":
      return { ...base, prompt: o.s, options: shuffle([o.a, ...o.d], rnd) };
    case "type":
      return { ...base, prompt: o.s };
    case "order": {
      const toks = full.replace(/[.?!]$/, "").split(/\s+/);
      return { ...base, prompt: o.es, tokens: shuffle(toks, rnd), answer: full, punct: (full.match(/[.?!]$/) || [""])[0] };
    }
    case "translate":
      return { ...base, prompt: o.es, answer: full };
    case "speak":
      return { ...base, prompt: full, answer: full };
    case "fix": {
      const wrong = o.s.replace(/\s*\([^)]*\)/g, "").replace("___", o.d[0]).replace(/\s+([.,?!])/g, "$1");
      return { ...base, prompt: wrong, wrong, answer: full };
    }
    default:
      return { ...base, type: "choose", prompt: o.s, options: shuffle([o.a, ...o.d], rnd) };
  }
}

// Secuencia de una lección: reconocimiento → producción (sección 16: Practice / Speak)
export function lessonSequence(topic, { prof = [], recent = [], hard = false, easy = false, rnd = Math.random } = {}) {
  const items = orderItems(topic.items, { prof, recent, rnd });
  const plan = easy
    ? ["type", "order", "translate", "fix", "type", "speak"]
    : hard
      ? ["choose", "choose", "choose", "type", "order", "speak"]
      : ["choose", "choose", "type", "order", "translate", "speak"];
  return plan.map((type, i) => makeGrammarExercise(topic, items[i % items.length], type, rnd));
}

// Repaso: mezcla tipos y contextos distintos a los ya vistos (sección 151)
export function reviewSet(topic, n = 4, { prof = [], recent = [], rnd = Math.random } = {}) {
  const items = orderItems(topic.items, { prof, recent, rnd });
  const types = shuffle(["choose", "type", "fix", "order", "translate"], rnd);
  return items.slice(0, n).map((it, i) => makeGrammarExercise(topic, it, types[i % types.length], rnd));
}

// Vocabulario con active recall (sección 13)
export function vocabExercise(word, type, pool, rnd = Math.random) {
  const others = shuffle(pool.filter((w) => w.id !== word.id), rnd).slice(0, 3);
  const base = { concept: "v." + word.topic, wordId: word.id, word, type, answer: word.word };
  switch (type) {
    case "recall": // imagen + definición → escribir la palabra (pistas progresivas)
      return { ...base, prompt: word.def, emoji: word.emoji };
    case "meaning":
      return { ...base, prompt: word.word, options: shuffle([word.es, ...others.map((w) => w.es)], rnd), answer: word.es };
    case "reverse":
      return { ...base, prompt: word.es, options: shuffle([word.word, ...others.map((w) => w.word)], rnd) };
    case "listen":
      return { ...base, prompt: word.word, options: shuffle([word.word, ...others.map((w) => w.word)], rnd) };
    case "gap": {
      const re = new RegExp("\\b" + word.word.split(" ")[0].slice(0, Math.max(3, word.word.length - 2)) + "\\w*", "i");
      const m = word.ex.match(re);
      const gap = m ? word.ex.replace(m[0], "_____") : word.ex;
      return { ...base, prompt: gap, answer: m ? m[0] : word.word, options: shuffle([m ? m[0] : word.word, ...others.map((w) => w.word)], rnd) };
    }
    case "say":
      return { ...base, prompt: word.word };
    default:
      return vocabExercise(word, "meaning", pool, rnd);
  }
}

// Pistas progresivas para recall: 1ª letra · número de letras · traducción · respuesta
export function recallHints(word) {
  const w = word.word;
  return [
    `Starts with "${w[0].toUpperCase()}"`,
    w.replace(/[a-z]/gi, (c, i) => (i === 0 ? c : "_")).split("").join(" ") + `  (${w.replace(/\s/g, "").length} letters)`,
    `Spanish: ${word.es}`,
    `Answer: ${w}`,
  ];
}

export function vocabLessonSequence(words, pool, rnd = Math.random) {
  const out = [];
  words.forEach((w) => out.push(vocabExercise(w, "meaning", pool, rnd)));
  shuffle(words, rnd).forEach((w, i) => out.push(vocabExercise(w, i % 2 ? "recall" : "gap", pool, rnd)));
  shuffle(words, rnd).slice(0, 2).forEach((w) => out.push(vocabExercise(w, "listen", pool, rnd)));
  if (words[0]) out.push(vocabExercise(words[0], "say", pool, rnd));
  return out;
}

// ¿La frase del estudiante usa la estructura objetivo? (Mini Challenge)
export function checkChallenge(topic, text) {
  if (!topic.challenge?.check) return tokenize(text).length >= 3;
  try { return new RegExp(topic.challenge.check, "i").test(text); } catch { return true; }
}
