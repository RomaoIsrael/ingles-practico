/* Service worker generado por tools/gen-sw.mjs — no editar a mano. */
const CACHE = "ingles-practico-72315dd260";
const FILES = [
 "./",
 "./css/app.css",
 "./icons/apple-touch-icon.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/icon-maskable-512.png",
 "./icons/icon.svg",
 "./index.html",
 "./js/content/characters.js",
 "./js/content/curriculum.js",
 "./js/content/extras.js",
 "./js/content/grammar-a1.js",
 "./js/content/grammar-a2.js",
 "./js/content/grammar-adv.js",
 "./js/content/grammar-b1.js",
 "./js/content/grammar-deep-1.js",
 "./js/content/grammar-deep-2.js",
 "./js/content/grammar.js",
 "./js/content/placement-bank.js",
 "./js/content/pro-vocab.js",
 "./js/content/professional.js",
 "./js/content/pronunciation.js",
 "./js/content/reading.js",
 "./js/content/registry.js",
 "./js/content/scenarios.js",
 "./js/content/starter.js",
 "./js/content/syllabus.js",
 "./js/content/tests-bank.js",
 "./js/content/vocab.js",
 "./js/core/actions.js",
 "./js/core/store.js",
 "./js/core/util.js",
 "./js/engine/analytics.js",
 "./js/engine/brain.js",
 "./js/engine/errors.js",
 "./js/engine/exercises.js",
 "./js/engine/gamification.js",
 "./js/engine/grader.js",
 "./js/engine/placement.js",
 "./js/engine/planner.js",
 "./js/engine/srs.js",
 "./js/engine/testing.js",
 "./js/main.js",
 "./js/services/ai.js",
 "./js/services/speech.js",
 "./js/services/tutor.js",
 "./js/ui/app.js",
 "./js/ui/components.js",
 "./js/ui/prefs.js",
 "./js/ui/runner.js",
 "./js/ui/screens/ask.js",
 "./js/ui/screens/home.js",
 "./js/ui/screens/learn.js",
 "./js/ui/screens/lessons-extra.js",
 "./js/ui/screens/library.js",
 "./js/ui/screens/mistakes.js",
 "./js/ui/screens/onboarding.js",
 "./js/ui/screens/placement.js",
 "./js/ui/screens/pro.js",
 "./js/ui/screens/profile.js",
 "./js/ui/screens/skills.js",
 "./js/ui/screens/speak.js",
 "./js/ui/screens/syllabus.js",
 "./js/ui/screens/tests.js",
 "./js/ui/screens/vocab.js",
 "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Archivos propios: primero internet (versión más nueva); sin conexión, la copia guardada.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API de IA y CDN: sin caché
  e.respondWith(caches.open(CACHE).then(async (c) => {
    try {
      const r = await fetch(req, { cache: "no-cache" });
      if (r && r.ok) c.put(req, r.clone());
      return r;
    } catch {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") return (await c.match("./index.html")) || Response.error();
      return Response.error();
    }
  }));
});
self.addEventListener("notificationclick", (e) => { e.notification.close(); e.waitUntil(self.clients.openWindow("./#/home")); });
