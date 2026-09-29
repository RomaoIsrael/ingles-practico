// Arranque de la app: estado, contenido, preferencias, rutas, navegación y modo offline.
import { store } from "./core/store.js";
import { loadContent } from "./content/registry.js";
import { dispatch } from "./ui/app.js";
import { applyPrefs } from "./ui/prefs.js";
import { wireGlobalAudio, toast, confetti } from "./ui/components.js";
import { onBadge } from "./core/actions.js";
import { registerOnboarding } from "./ui/screens/onboarding.js";
import { registerPlacement } from "./ui/screens/placement.js";
import { registerHome } from "./ui/screens/home.js";
import { registerLearn } from "./ui/screens/learn.js";
import { registerVocab } from "./ui/screens/vocab.js";
import { registerSkills } from "./ui/screens/skills.js";
import { registerMistakes } from "./ui/screens/mistakes.js";
import { registerLibrary } from "./ui/screens/library.js";
import { registerSpeak } from "./ui/screens/speak.js";
import { registerPro } from "./ui/screens/pro.js";
import { registerProfile } from "./ui/screens/profile.js";
import { openAsk } from "./ui/screens/ask.js";
import { notice } from "./engine/planner.js";
import { C } from "./content/registry.js";
import { dayKey } from "./core/util.js";

store.load();
loadContent(store.state.packs);
applyPrefs();
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyPrefs);

[registerOnboarding, registerPlacement, registerHome, registerLearn, registerVocab, registerSkills, registerMistakes, registerLibrary, registerSpeak, registerPro, registerProfile].forEach((r) => r());

wireGlobalAudio();
onBadge((b) => { toast(`🏅 Achievement unlocked: ${b.title}`, 3500); confetti(); });
document.getElementById("ask").addEventListener("click", () => openAsk());
window.addEventListener("hashchange", dispatch);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.getElementById("sheet")?.remove(); });
dispatch();

// Streak visible en la cabecera
const streakEl = document.getElementById("streak");
const paintStreak = () => { streakEl.textContent = `🔥 ${store.state.game.streak}`; };
store.listeners.add(paintStreak);
paintStreak();

// Aviso diario (sección 124): como máximo una notificación del sistema por día, solo si el usuario la activó
try {
  const s = store.state;
  if (s.settings.notifications && "Notification" in window && Notification.permission === "granted" && s.profile.onboarded && localStorage.getItem("ip.lastNotice") !== dayKey()) {
    localStorage.setItem("ip.lastNotice", dayKey());
    setTimeout(() => navigator.serviceWorker?.ready.then((reg) => reg.showNotification("Inglés Práctico", { body: notice(s, C), icon: "icons/icon-192.png", tag: "daily" })).catch(() => {}), 3000);
  }
} catch { /* notificaciones no disponibles */ }

// Modo offline (sección 125)
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
window.addEventListener("offline", () => toast("Offline mode: lessons and reviews keep working."));
