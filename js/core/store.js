// Estado del estudiante (local-first). Un único documento JSON en localStorage.
import { dayKey } from "./util.js";

const KEY = "ip.v1";
export const VERSION = 1;

export function freshState() {
  return {
    version: VERSION,
    profile: {
      name: "", nativeLang: "es", goals: [], selfLevel: "", dailyMinutes: 15, accent: "us",
      professions: { primary: "", secondary: "", extra: [], custom: "" },
      targetLevel: "B2", createdAt: Date.now(), onboarded: false, placementDone: false,
    },
    settings: {
      theme: "system", textSize: 1, highContrast: false, reducedMotion: false, immersion: false,
      captions: true, audioRate: 1, explainLang: "auto", convLevel: 2, notifications: false,
      ai: { enabled: false, apiKey: "", model: "claude-opus-5-5" },
    },
    levels: {
      overall: "A1", grammar: "A1", vocabulary: "A1", reading: "A1", listening: "A1",
      writing: "A1", speaking: "A1", pronunciation: "A1", history: [], lastAssessment: 0,
    },
    skills: {}, vocab: {}, lessons: {}, mistakes: [], patterns: {}, log: [], speaking: {},
    game: { xp: 0, coins: 0, streak: 0, best: 0, lastDay: "", freezes: 1, freezeWeek: "", badges: {}, dailyDone: {}, },
    daily: { date: "", blocks: [], done: [] },
    conversations: [], favorites: [], notes: [], prefs: {}, packs: [], writings: 0, emails: 0, tests: [],
  };
}

function migrate(s) {
  const base = freshState();
  // Rellena claves nuevas sin perder datos (migración aditiva)
  const merge = (dst, src) => {
    for (const k of Object.keys(src)) {
      if (dst[k] === undefined) dst[k] = src[k];
      else if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k]) && typeof dst[k] === "object") merge(dst[k], src[k]);
    }
  };
  merge(s, base);
  s.version = VERSION;
  return s;
}

let backend = null;
try { backend = globalThis.localStorage || null; } catch { backend = null; }

export const store = {
  state: freshState(),
  listeners: new Set(),
  load() {
    try {
      const raw = backend && backend.getItem(KEY);
      if (raw) this.state = migrate(JSON.parse(raw));
    } catch { this.state = freshState(); }
    return this.state;
  },
  save() {
    const s = this.state;
    if (s.log.length > 3000) s.log = s.log.slice(-3000);
    if (s.mistakes.length > 300) s.mistakes = s.mistakes.slice(-300);
    if (s.conversations.length > 30) s.conversations = s.conversations.slice(-30);
    try { backend && backend.setItem(KEY, JSON.stringify(s)); } catch { /* almacenamiento lleno o bloqueado */ }
    this.listeners.forEach((f) => f(s));
  },
  reset() { this.state = freshState(); this.save(); },
  exportJSON() { return JSON.stringify(this.state, null, 1); },
  importJSON(text) {
    const s = JSON.parse(text);
    if (!s || typeof s !== "object" || !s.profile) throw new Error("Archivo no válido");
    this.state = migrate(s);
    this.save();
  },
  // Privacidad (sección 127)
  deleteConversations() { this.state.conversations = []; this.save(); },
  deleteHistory() {
    const keep = { profile: this.state.profile, settings: this.state.settings };
    this.state = Object.assign(freshState(), keep);
    this.save();
  },
  deleteAll() {
    try { backend && backend.removeItem(KEY); } catch {}
    this.state = freshState();
  },
};

// Registro de actividad para reportes (tiempo de estudio, aciertos, XP)
export function logEvent(s, ev) {
  s.log.push({ t: Date.now(), d: dayKey(), ...ev });
}
