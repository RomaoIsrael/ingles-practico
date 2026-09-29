// Calificación local de respuestas (sin IA, sección 176).
import { levenshtein, words } from "../core/util.js";

const CONTRACTIONS = [
  ["i'm", "i am"], ["you're", "you are"], ["we're", "we are"], ["they're", "they are"],
  ["he's", "he is"], ["she's", "she is"], ["it's", "it is"], ["that's", "that is"], ["there's", "there is"],
  ["what's", "what is"], ["where's", "where is"], ["who's", "who is"], ["how's", "how is"],
  ["isn't", "is not"], ["aren't", "are not"], ["wasn't", "was not"], ["weren't", "were not"],
  ["don't", "do not"], ["doesn't", "does not"], ["didn't", "did not"], ["haven't", "have not"],
  ["hasn't", "has not"], ["hadn't", "had not"], ["won't", "will not"], ["wouldn't", "would not"],
  ["can't", "cannot"], ["couldn't", "could not"], ["shouldn't", "should not"], ["mustn't", "must not"],
  ["i've", "i have"], ["you've", "you have"], ["we've", "we have"], ["they've", "they have"],
  ["i'll", "i will"], ["you'll", "you will"], ["he'll", "he will"], ["she'll", "she will"], ["we'll", "we will"],
  ["they'll", "they will"], ["it'll", "it will"], ["i'd", "i would"], ["you'd", "you would"], ["we'd", "we would"],
  ["they'd", "they would"], ["he'd", "he would"], ["she'd", "she would"], ["let's", "let us"], ["can not", "cannot"],
];

export function normalize(s) {
  let t = " " + String(s).toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ").trim() + " ";
  for (const [a, b] of CONTRACTIONS) t = t.split(" " + a + " ").join(" " + b + " ");
  return t.replace(/\s+/g, " ").trim();
}

// Compara la respuesta con una o varias respuestas aceptadas.
// Devuelve { ok, typo, close, best } — typo: correcto con una errata menor.
export function check(answer, accepted) {
  const list = (Array.isArray(accepted) ? accepted : [accepted]).filter((x) => x != null);
  const a = normalize(answer);
  if (!a) return { ok: false, typo: false, close: false, best: list[0] };
  let best = list[0], bestD = Infinity;
  for (const exp of list) {
    const e = normalize(exp);
    if (a === e) return { ok: true, typo: false, close: true, best: exp };
    const d = levenshtein(a, e);
    if (d < bestD) { bestD = d; best = exp; }
  }
  const e = normalize(best);
  const tol = e.length <= 4 ? 0 : e.length <= 10 ? 1 : Math.max(2, Math.floor(e.length / 12));
  // Una errata no debe cambiar una palabra gramatical clave (go/goes, a/an, in/on)
  const aw = a.split(" "), ew = e.split(" ");
  const sameWordCount = aw.length === ew.length;
  const changedWords = sameWordCount ? ew.filter((w, i) => w !== aw[i]) : ew;
  const onlyLongWordsChanged = sameWordCount && changedWords.every((w, i) => w.length >= 5);
  if (bestD <= tol && onlyLongWordsChanged) return { ok: true, typo: true, close: true, best };
  return { ok: false, typo: false, close: bestD <= Math.max(2, e.length / 6), best };
}

// Diferencias palabra a palabra para mostrar qué cambió (feedback visual)
export function wordDiff(answer, expected) {
  const a = words(answer), e = words(expected);
  const m = a.length, n = e.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    dp[i][j] = a[i] === e[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === e[j]) { out.push({ w: e[j], s: "ok" }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ w: a[i], s: "extra" }); i++; }
    else { out.push({ w: e[j], s: "missing" }); j++; }
  }
  while (i < m) out.push({ w: a[i++], s: "extra" });
  while (j < n) out.push({ w: e[j++], s: "missing" });
  return out;
}

// Puntuación de pronunciación: coincidencia de palabras entre lo reconocido y lo esperado (0..1)
export function speechScore(transcript, expected, confidence = 0.8) {
  const e = words(expected), t = words(transcript);
  if (!e.length) return { score: 0, missed: [] };
  const diff = wordDiff(t.join(" "), e.join(" "));
  const hit = diff.filter((d) => d.s === "ok").length;
  const extra = diff.filter((d) => d.s === "extra").length;
  const missed = diff.filter((d) => d.s === "missing").map((d) => d.w);
  const acc = Math.max(0, (hit - extra * 0.25) / e.length);
  const conf = confidence > 0 ? confidence : 0.8;
  return { score: Math.min(1, acc * (0.85 + 0.15 * conf)), missed };
}

// Nivel aproximado de un texto libre (placement writing / writing coach)
export function textComplexity(text) {
  const w = words(text);
  const sentences = String(text).split(/[.!?]+/).filter((s) => s.trim().split(/\s+/).length >= 2);
  const connectors = w.filter((x) => ["because", "although", "however", "while", "when", "if", "which", "who", "that", "so", "but", "since", "unless", "whereas", "therefore", "moreover", "despite"].includes(x)).length;
  const tenses = new Set();
  const t = " " + w.join(" ") + " ";
  if (/ (am|is|are) \w+ing /.test(t)) tenses.add("cont");
  if (/ (have|has) \w+(ed|en|wn|ne) /.test(t)) tenses.add("perfect");
  if (/ (was|were|did|went|had|\w+ed) /.test(t)) tenses.add("past");
  if (/ (will|going to) /.test(t)) tenses.add("future");
  if (/ (would|could|might) /.test(t)) tenses.add("modal");
  if (/ (been|being) /.test(t)) tenses.add("advanced");
  const unique = new Set(w).size;
  return { words: w.length, sentences: sentences.length, connectors, tenses: tenses.size, lexical: w.length ? unique / w.length : 0 };
}
