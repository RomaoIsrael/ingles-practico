// Utilidades sin dependencias del DOM (se usan también en las pruebas con Node).

export const DAY = 86400000;
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const levelIndex = (l) => Math.max(0, LEVELS.indexOf(l));

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Fecha local YYYY-MM-DD
export function dayKey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function daysBetween(a, b) {
  return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / DAY);
}
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const pct = (x) => Math.round(clamp(x, 0, 1) * 100);

// Generador pseudoaleatorio con semilla (reto diario determinista, pruebas reproducibles)
export function seeded(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Distancia de edición (caracteres o arreglos de palabras)
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function words(s) {
  return String(s).toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9']+/g) || [];
}

export function greeting(t = Date.now()) {
  const h = new Date(t).getHours();
  return h < 12 ? "Good morning" : h < 19 ? "Good afternoon" : "Good evening";
}

export function fmtMin(sec) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}
