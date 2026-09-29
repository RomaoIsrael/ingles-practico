// Validación automática de contenido (sección 167).
import { test } from "node:test";
import assert from "node:assert/strict";
import { C } from "../js/content/registry.js";
import { fullSentence } from "../js/content/grammar.js";
import { UNITS, LESSONS } from "../js/content/curriculum.js";
import { ROUTES, EMAILS } from "../js/content/professional.js";
import { SOUND_BY_ID } from "../js/content/pronunciation.js";
import { detect } from "../js/engine/errors.js";
import { LEVELS } from "../js/core/util.js";

test("grammar topics are complete and unique", () => {
  const ids = new Set();
  for (const g of C.grammar) {
    assert.ok(!ids.has(g.id), `duplicate ${g.id}`); ids.add(g.id);
    assert.ok(LEVELS.includes(g.level), g.id);
    assert.ok(g.rule.es.length && g.rule.en.length, `${g.id} needs es+en rules`);
    assert.ok(g.examples.length >= 2, `${g.id} examples`);
    assert.ok(g.items.length >= 4, `${g.id} items`);
    assert.ok(g.simple?.es && g.simple?.en, `${g.id} simple`);
    for (const it of g.items) {
      const [s, a, d, ctx, es] = it;
      assert.equal(s.split("___").length, 2, `${g.id}: exactly one blank in "${s}"`);
      assert.ok(a && !d.includes(a), `${g.id}: distractor equals answer in "${s}"`);
      assert.equal(new Set(d).size, d.length, `${g.id}: duplicate distractors in "${s}"`);
      assert.ok(ctx && es, `${g.id}: context + translation in "${s}"`);
    }
  }
});

test("all roadmap topics from section 21 exist", () => {
  const needed = ["g.be", "g.pronouns", "g.articles", "g.plurals", "g.possessives", "g.there-is", "g.have-has", "g.present-simple", "g.present-continuous", "g.past-simple", "g.past-continuous", "g.present-perfect", "g.present-perfect-continuous", "g.past-perfect", "g.going-to", "g.will", "g.modals-obligation", "g.comparatives", "g.superlatives", "g.first-conditional", "g.second-conditional", "g.third-conditional", "g.passive", "g.reported-speech", "g.relative-clauses", "g.gerunds-infinitives", "g.prepositions", "g.conjunctions", "g.phrasal-verbs", "g.mixed-conditionals", "g.inversion", "g.academic", "g.advanced-writing"];
  for (const id of needed) assert.ok(C.grammarById[id], `missing ${id}`);
});

test("correct grammar sentences do not trigger error rules", () => {
  for (const g of C.grammar) {
    for (const it of g.items) {
      const s = fullSentence(it);
      const errs = detect(s).filter((e) => e.id !== "capital-names");
      assert.deepEqual(errs.map((e) => e.id), [], `${g.id}: "${s}" flagged`);
    }
    for (const [en] of g.examples) {
      const errs = detect(en).filter((e) => e.id !== "capital-names");
      assert.deepEqual(errs.map((e) => e.id), [], `${g.id} example: "${en}" flagged`);
    }
  }
});

test("vocabulary entries are complete and examples contain the word", () => {
  for (const w of C.words) {
    assert.ok(w.word && w.es && w.ipa && w.def && w.ex && w.emoji, `incomplete ${w.id}`);
    assert.ok(LEVELS.includes(w.cefr), `cefr ${w.id}`);
    const stem = w.word.toLowerCase().split(/[ (]/)[0].replace(/e$/, "").slice(0, 4);
    assert.ok(w.ex.toLowerCase().includes(stem), `${w.id}: example should use the word ("${w.ex}")`);
  }
  assert.ok(C.words.length >= 350, `only ${C.words.length} words`);
});

test("curriculum references exist", () => {
  const ids = new Set(LESSONS.map((l) => l.id));
  assert.equal(ids.size, LESSONS.length, "lesson ids unique");
  for (const u of UNITS) for (const l of u.lessons) {
    if (l.kind === "grammar") assert.ok(C.grammarById[l.ref], l.id);
    if (l.kind === "vocab") assert.ok(C.topicById[l.ref], l.id);
    if (l.kind === "talk") assert.ok(C.scenarioById[l.ref], l.id);
    if (l.kind === "read") assert.ok(C.readingById[l.ref], l.id);
    if (l.kind === "pron") assert.ok(SOUND_BY_ID[l.ref], l.id);
    assert.ok(["grammar", "vocab", "talk", "read", "pron", "alphabet", "phrases", "test"].includes(l.kind), l.id);
  }
  for (const g of C.grammar) assert.ok(LESSONS.some((l) => l.ref === g.id), `grammar ${g.id} not in curriculum`);
});

test("professional routes reference existing content", () => {
  const emailIds = new Set(EMAILS.map((e) => e.id));
  for (const r of ROUTES) for (const m of r.modules) {
    for (const v of m.vocab || []) assert.ok(C.topicById[v], `${r.id}: topic ${v}`);
    for (const t of m.talk || []) assert.ok(C.scenarioById[t], `${r.id}: scenario ${t}`);
    for (const e of m.emails || []) assert.ok(emailIds.has(e), `${r.id}: email ${e}`);
  }
});

test("scenario sample answers are free of detectable errors", () => {
  for (const s of C.scenarios) {
    assert.ok(s.steps.at(-1).end, `${s.id} must end`);
    for (const st of s.steps) {
      const sample = st.h[3];
      const errs = detect(sample).filter((e) => e.id !== "capital-names");
      assert.deepEqual(errs.map((e) => e.id), [], `${s.id}: "${sample}"`);
      for (const [, to] of st.go || []) assert.ok(to < s.steps.length, `${s.id}: bad branch`);
    }
  }
});

test("readings have 3 questions with distinct options", () => {
  for (const r of C.readings) {
    assert.ok(r.q.length >= 3, r.id);
    for (const [q, a, d] of r.q) assert.ok(!d.includes(a), `${r.id}: ${q}`);
  }
});

test("every grammar topic has deep study notes, and the ✅ forms are correct", async () => {
  for (const g of C.grammar) {
    const d = g.deep;
    assert.ok(d, `${g.id} has no deep notes`);
    assert.ok(d.intro && d.form?.rows?.length && d.mistakes?.length && d.tips?.length, `${g.id} deep notes incomplete`);
    for (const t of [d.form, d.form2, d.form3].filter(Boolean)) for (const r of t.rows) assert.equal(r.length, t.cols.length, `${g.id}: table row width`);
    for (const [wrong, right] of d.mistakes) {
      const errs = detect(right).filter((e) => e.id !== "capital-names");
      assert.deepEqual(errs.map((e) => e.id), [], `${g.id}: correct form "${right}" flagged`);
    }
  }
});

test("every unit has goals, study contents and ends with a unit test", async () => {
  for (const u of UNITS) {
    assert.ok(u.goals.length >= 1, `${u.id} goals`);
    assert.ok(u.learn.length >= 1, `${u.id} learn`);
    assert.equal(u.lessons.at(-1).kind, "test", `${u.id} ends with test`);
  }
  assert.ok(UNITS.filter((u) => u.stage === "start").length >= 5, "starter units");
});

test("test bank items are well formed", async () => {
  const { TEST_READINGS, TEST_LISTENINGS, BUSINESS_ITEMS } = await import("../js/content/tests-bank.js");
  for (const b of [...TEST_READINGS, ...TEST_LISTENINGS]) for (const [q, a, d] of b.q) assert.ok(!d.includes(a) && d.length >= 2, q);
  for (const b of BUSINESS_ITEMS) assert.ok(!b.d.includes(b.a), b.q);
  for (const L of ["A1", "A2", "B1", "B2", "C1"]) {
    assert.ok(TEST_READINGS.some((r) => r.level === L), `reading ${L}`);
    assert.ok(TEST_LISTENINGS.some((r) => r.level === L), `listening ${L}`);
  }
});
