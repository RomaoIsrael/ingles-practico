// Regenera sw.js con la lista completa de archivos para que TODO funcione offline (sección 125).
// Uso: node tools/gen-sw.mjs   (ejecútalo después de añadir o renombrar archivos)
import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
const root = new URL("..", import.meta.url).pathname;
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(relative(root, p)); } };
["js", "css", "icons"].forEach((d) => walk(join(root, d)));
files.push("index.html", "manifest.json");
files.sort();
const hash = createHash("sha1"); files.forEach((f) => hash.update(readFileSync(join(root, f))));
const version = hash.digest("hex").slice(0, 10);
const sw = `/* Service worker generado por tools/gen-sw.mjs — no editar a mano. */
const CACHE = "ingles-practico-${version}";
const FILES = ${JSON.stringify(["./", ...files.map((f) => "./" + f)], null, 1)};

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
`;
writeFileSync(join(root, "sw.js"), sw);
console.log(`sw.js: ${files.length} files, cache ${version}`);
