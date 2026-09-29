// Prueba de humo en navegador real (Playwright): recorre el onboarding, la prueba de nivel,
// una lección completa, conversación y todas las pantallas, fallando ante cualquier error de JS.
// Uso: npx http-server -p 8080 . & node tests/smoke.e2e.mjs [http://localhost:8080] [carpeta-capturas]
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:8080";
const SHOTS = process.argv[3] || "";
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => errors.push(`pageerror @ ${page.url()}: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error" && !/favicon|ERR_|net::/.test(m.text())) errors.push(`console @ ${page.url()}: ${m.text()}`); });
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }); };
const go = async (hash) => { await page.goto(`${BASE}/#${hash}`); await page.waitForTimeout(250); };
const click = async (sel) => { await page.locator(sel).first().click(); await page.waitForTimeout(150); };

// Responde el ejercicio visible (a veces bien, a veces mal) hasta terminar el runner
async function solveRunner(max = 60) {
  for (let n = 0; n < max; n++) {
    if (!(await page.locator("#check").count())) return;
    const btn = page.locator("#check");
    if (await page.locator(".opt").count()) await page.locator(".opt").nth(n % 2).click();
    else if (await page.locator("#pool .tok").count()) { const k = await page.locator("#pool .tok").count(); for (let i = 0; i < k; i++) await page.locator("#pool .tok").nth(i).click(); }
    else if (await page.locator("#ans").count()) await page.locator("#ans").fill(n % 3 ? "I am agree" : "is");
    else if (await page.locator("[data-selfsaid]").count()) { await click("[data-selfsaid]"); }
    else if (await page.locator("[data-skip]").count()) { await click("[data-skip]"); continue; }
    if (await btn.isEnabled()) await btn.click();
    await page.waitForTimeout(80);
    if (await page.locator("#check").count() && (await page.locator("#check").textContent()).includes("Continue")) await page.locator("#check").click();
    await page.waitForTimeout(80);
  }
}

await go("/welcome"); await shot("01-welcome");
await click('a[href="#/onboarding/1"]');
await click('[data-lang="es"]');
await click('[data-goal="Work"]'); await click('[data-goal="Travel"]'); await shot("02-goals"); await click("[data-next]");
await click('[data-lvl="some"]');
await click('[data-min="15"]');
await click('[data-acc="us"] .title');
await click('[data-prof="primary"][data-v="Engineering"]'); await click('[data-prof="secondary"][data-v="QA/QC"]'); await shot("03-professions"); await click("[data-next]");
await page.fill("#name", "Lucía"); await click("[data-next]");
// Prueba de nivel
await click("[data-start]");
for (let i = 0; i < 12; i++) { await page.locator(".opt").first().click(); await page.waitForTimeout(60); }
await shot("04-placement");
await page.fill("#w", "I am an engineer. I work in a company since 2019. Last week I went to Quito because we had an audit.");
await click("[data-next]");
if (await page.locator("[data-skip]").count()) await click("[data-skip]");
await shot("05-placement-result");
await click('a[href="#/home"]');
await page.waitForTimeout(300); await shot("06-home");

// Lección de gramática completa
await go("/lesson/" + encodeURIComponent("a1-5:grammar:g.present-simple")); await shot("07-lesson-learn");
await click("[data-simple]");
await click("[data-go]");
await solveRunner(); await shot("08-challenge");
await page.fill("#ch", "He go to work every day and she work in a bank.");
await click("[data-check]"); await shot("09-challenge-fb");
await click("[data-check]"); await shot("10-lesson-done");
// Lección de vocabulario
await go("/lesson/" + encodeURIComponent("a1-6:vocab:food"));
for (let i = 0; i < 6; i++) if (await page.locator("[data-next]").count()) await click("[data-next]");
await solveRunner();
// Conversación guiada
await go("/roleplay/airport"); await shot("11-roleplay");
for (const t of ["Here is my passport.", "I'm here for business.", "I'm visiting a client.", "I'm staying for five days.", "I'm staying at the Plaza Hotel.", "Thank you very much."]) {
  if (!(await page.locator("#msg").count())) break;
  await page.fill("#msg", t); await click("[data-send]"); await page.waitForTimeout(700);
}
if (await page.locator("[data-help]").count()) await click("[data-help]");
if (await page.locator("[data-end]").count()) await click("[data-end]");
await page.waitForTimeout(300); await shot("12-roleplay-eval");

// Recorrido de todas las pantallas
const routes = ["/home", "/learn/A1", "/learn/B2", "/learn/PRO", "/unit/a1-1", "/grammar", "/grammar/g.present-perfect", "/practice", "/vocab", "/vocab/topic/qa-core", "/word/w.inspection", "/dictionary", "/review", "/listening", "/reading", "/read/r.b1-incident", "/writing", "/writing/w.email-request", "/email", "/pronunciation", "/pron/pr.th", "/shadowing", "/mistakes", "/smart-review", "/games", "/game/match", "/game/memory", "/game/race", "/think", "/translate", "/library/falsefriends", "/library/phrasal", "/library/idioms", "/library/collocations", "/library/usuk", "/library/natural", "/doclab", "/speak", "/talk", "/interview", "/interview/candidate/behavioral", "/interview/recruiter/basic", "/fluency", "/pro", "/pro/qaqc", "/pro/law", "/pro/hr", "/pro/career", "/phrases/meeting", "/clauses", "/plain", "/cv", "/linkedin", "/profile", "/brain", "/brain?cat=grammar", "/map", "/reports", "/achievements", "/goals", "/favorites", "/settings", "/privacy", "/search", "/exam/A2", "/exam/weekly", "/plan/done"];
for (const r of routes) { await go(r); if (["/home", "/map", "/brain", "/reports", "/profile", "/pro/qaqc", "/speak", "/practice"].includes(r)) await shot("r" + r.replace(/[/?=]/g, "_")); }

// Writing coach y Ask
await go("/writing/w.email-request");
await page.fill("#t", "Dear Mr. Chen,\n\nI want that you send a quotation for 200 helmets. Is necessary for the project.\n\nBest regards,\nAna");
await click("[data-check]"); await shot("13-writing");
await go("/home"); await click("#ask");
await page.fill("#q", "Is this correct: He don't like coffee"); await click("[data-send]"); await page.waitForTimeout(200); await shot("14-ask");
await page.fill("#q", "What is the difference between make and do?"); await click("[data-send]");
await page.fill("#q", "present perfect"); await click("[data-send]");
await page.keyboard.press("Escape");

// Tema oscuro
await go("/settings"); await click('[data-set="theme"][data-val="dark"]'); await go("/home"); await shot("15-dark");
// Plan diario
await click("[data-plan]"); await page.waitForTimeout(300);

await browser.close();
if (errors.length) { console.error(`✖ ${errors.length} errors:\n` + [...new Set(errors)].join("\n")); process.exit(1); }
console.log("✔ smoke test passed");
