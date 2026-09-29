import A1 from "./grammar-a1.js";
import A2 from "./grammar-a2.js";
import B1 from "./grammar-b1.js";
import ADV from "./grammar-adv.js";
import DEEP1 from "./grammar-deep-1.js";
import DEEP2 from "./grammar-deep-2.js";

const DEEP = { ...DEEP1, ...DEEP2 };
// Cada tema lleva sus apuntes profundos (tabla de forma, usos, ortografía, errores, comparación con el español, trucos)
export const GRAMMAR = [...A1, ...A2, ...B1, ...ADV].map((g) => ({ ...g, deep: DEEP[g.id] || null }));
export const GRAMMAR_BY_ID = Object.fromEntries(GRAMMAR.map((g) => [g.id, g]));

// Ítem → objeto con nombres claros
export function itemObj(it) {
  const [s, a, d, ctx, es] = it;
  return { s, a, d, ctx, es };
}

// Frase completa (sin pistas entre paréntesis) — para ordenar, traducir y decir en voz alta
export function fullSentence(it) {
  const { s, a } = Array.isArray(it) ? itemObj(it) : it;
  return s.replace(/\s*\([^)]*\)/g, "").replace("___", a).replace(/\s+([.,?!])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

export function hintOf(it) {
  const { s } = Array.isArray(it) ? itemObj(it) : it;
  const m = s.match(/\(([^)]*)\)/);
  return m ? m[1] : "";
}
