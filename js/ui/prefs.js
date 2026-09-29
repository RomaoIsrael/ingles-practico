// Aplica tema, tamaño de texto, contraste y animaciones (secciones 126, 170).
import { store } from "../core/store.js";

export function applyPrefs() {
  const st = store.state.settings, root = document.documentElement;
  if (st.theme === "system") root.removeAttribute("data-theme"); else root.dataset.theme = st.theme;
  root.dataset.contrast = st.highContrast ? "high" : "";
  root.dataset.motion = st.reducedMotion ? "reduced" : "";
  root.style.setProperty("--fs", `${17 * (st.textSize || 1)}px`);
  const dark = st.theme === "dark" || (st.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0E0F1E" : "#4F46E5");
}
