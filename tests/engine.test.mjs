// Pruebas del motor de aprendizaje (funciones puras, sin DOM).
import { test } from "node:test";
import assert from "node:assert/strict";
import { DAY, seeded } from "../js/core/util.js";
import { freshState } from "../js/core/store.js";
import { newCard, review, GRADE, cardState, intervalDays, gradeFrom, vocabStats, isForgotten } from "../js/engine/srs.js";
import { record, current, stateOf, forgetting, bucketOf, emptyRec, coverage, seedPrior, readyForExam } from "../js/engine/brain.js";
import { buildPlan, nextLesson, recommendation } from "../js/engine/planner.js";
import { Placement, placementResult, writingLevel } from "../js/engine/placement.js";
import { check, normalize, speechScore, wordDiff } from "../js/engine/grader.js";
import { detect, correct, thirdPerson } from "../js/engine/errors.js";
import { touchStreak, playerLevel, xpForLevel, dailyChallenge } from "../js/engine/gamification.js";
import { lessonSequence, orderItems, makeGrammarExercise } from "../js/engine/exercises.js";
import { C } from "../js/content/registry.js";

const T0 = new Date("2026-09-01T10:00:00").getTime();

test("SRS follows the 1-3-7-15-30-60 ladder with Good answers", () => {
  let c = newCard(T0), t = T0;
  const seen = [];
  for (let i = 0; i < 6; i++) { c = review(c, GRADE.GOOD, t); seen.push(Math.round((c.due - t) / DAY)); t = c.due; }
  assert.deepEqual(seen, [1, 3, 7, 15, 30, 60]);
  assert.equal(cardState(c, t), "MASTERED");
});

test("SRS: Again resets, lowers ease and marks forgotten; Hard shortens", () => {
  let c = review(newCard(T0), GRADE.GOOD, T0);
  c = review(c, GRADE.GOOD, T0 + DAY);
  const again = review(c, GRADE.AGAIN, T0 + 5 * DAY);
  assert.equal(again.step, 0);
  assert.ok(again.ease < c.ease);
  assert.equal(again.lapses, 1);
  assert.ok(isForgotten(again, T0 + 5 * DAY));
  const hard = review(c, GRADE.HARD, T0 + 5 * DAY);
  assert.ok(hard.due - (T0 + 5 * DAY) < intervalDays(c.step + 1, c.ease) * DAY);
  assert.equal(gradeFrom({ correct: true, hints: 1 }), GRADE.HARD);
  assert.equal(gradeFrom({ correct: false }), GRADE.AGAIN);
});

test("vocabStats counts learned, due and mastered", () => {
  const v = { a: review(newCard(T0), GRADE.GOOD, T0), b: newCard(T0) };
  const st = vocabStats(v, T0 + 2 * DAY);
  assert.equal(st.learned, 1);
  assert.equal(st.due, 1);
});

test("Brain: correct answers raise mastery; a single answer is never MASTERED", () => {
  const sk = {};
  record(sk, "g.x", { score: 1, now: T0, ctx: "work", produced: true });
  assert.ok(sk["g.x"].m > 0.4);
  assert.notEqual(stateOf(sk["g.x"], T0), "MASTERED");
});

test("Brain: MASTERED requires contexts, spaced days and production", () => {
  const sk = {};
  let t = T0;
  for (const [ctx, gap] of [["work", 0], ["travel", 0], ["meeting", 0], ["report", 3], ["qa", 3], ["hr", 4], ["daily", 5], ["law", 6]]) {
    t += gap * DAY;
    for (let i = 0; i < 3; i++) record(sk, "g.y", { score: 1, now: t + i * 60000, ctx, produced: true });
  }
  assert.equal(stateOf(sk["g.y"], t), "MASTERED");
  const noProd = {};
  t = T0;
  for (const [ctx, gap] of [["work", 0], ["travel", 3], ["meeting", 3], ["qa", 3], ["hr", 4]]) { t += gap * DAY; for (let i = 0; i < 3; i++) record(noProd, "g.z", { score: 1, now: t + i * 60000, ctx }); }
  assert.equal(stateOf(noProd["g.z"], t), "STRONG");
});

test("Intelligent forgetting: example from section 11 (84% → ~70% after 16 days)", () => {
  const rec = { ...emptyRec(T0), m: 0.84, n: 10, c: 9, stab: 4, last: T0 };
  const now = T0 + 16 * DAY;
  const est = current(rec, now);
  assert.ok(est > 0.66 && est < 0.72, `estimated ${est}`);
  const f = forgetting({ "g.present-perfect": rec }, { "g.present-perfect": "Present Perfect" }, now);
  assert.equal(f[0].label, "Present Perfect");
  assert.equal(f[0].daysAgo, 16);
  assert.equal(bucketOf(rec, now), "Learning");
});

test("CEFR level does not rise with XP: coverage needs real mastery", () => {
  const s = freshState();
  s.game.xp = 100000;
  assert.equal(readyForExam(s, C.catalog).ready, false);
  seedPrior(s, C.catalog, "A2", T0);
  assert.ok(coverage(s, C.catalog, "A1", T0) > 0.5);
  assert.equal(coverage(s, C.catalog, "A2", T0), 0);
});

test("Daily plan fits the chosen time and prioritizes due reviews and forgotten concepts", () => {
  const s = freshState();
  s.profile.createdAt = T0 - 30 * DAY; s.profile.placementDone = true; s.profile.dailyMinutes = 15;
  s.profile.professions.primary = "QA/QC";
  for (let i = 0; i < 10; i++) s.vocab["w" + i] = review(newCard(T0 - 5 * DAY), GRADE.GOOD, T0 - 5 * DAY);
  s.skills["g.present-perfect"] = { ...emptyRec(T0), m: 0.84, n: 10, c: 9, stab: 3, last: T0 - 16 * DAY, hist: [[T0 - 16 * DAY, 0.84]] };
  const plan = buildPlan(s, C, T0);
  assert.ok(plan.total <= 17, `total ${plan.total}`);
  assert.equal(plan.blocks[0].kind, "review");
  assert.ok(plan.blocks.some((b) => b.kind === "forgot"));
  assert.ok(plan.blocks.some((b) => b.kind === "speak"), "a speaking block is guaranteed at >= 10 min");
  const five = buildPlan({ ...s, profile: { ...s.profile, dailyMinutes: 5 } }, C, T0);
  assert.ok(five.total <= 8);
  assert.ok(recommendation(s, C, T0).text.length > 10);
});

test("First week: day 7 schedules the weekly assessment", () => {
  const s = freshState();
  s.profile.createdAt = T0 - 6 * DAY; s.profile.placementDone = true;
  assert.ok(buildPlan(s, C, T0).blocks.some((b) => b.route === "#/exam/weekly"));
});

test("nextLesson starts at the student's level", () => {
  const s = freshState();
  s.levels.overall = "B1";
  assert.ok(nextLesson(s).unit.startsWith("b1"));
});

test("Placement staircase: always right → high level, always wrong → A1", () => {
  const good = new Placement(C, { rnd: seeded(1) });
  while (!good.done) { const q = good.next(); good.answer(q.answer); }
  const r1 = placementResult(good, "", null);
  assert.ok(["B2", "C1"].includes(r1.overall), r1.overall);
  const bad = new Placement(C, { rnd: seeded(2) });
  while (!bad.done) { bad.next(); bad.answer("__wrong"); }
  assert.equal(placementResult(bad, "", null).overall, "A1");
  assert.equal(writingLevel("I am Ana."), "A1");
  assert.ok(["B1", "B2", "C1"].includes(writingLevel("I have worked as an engineer since 2015. Last year I led a project that reduced costs, although it was difficult. If I had more time, I would study more because English is important for my career.")));
});

test("Grader: contractions, typos and case are handled", () => {
  assert.equal(normalize("I'm  here!"), "i am here");
  assert.ok(check("He doesn't work", ["He does not work"]).ok);
  assert.ok(check("The equipmnet was inspected", ["The equipment was inspected"]).typo);
  assert.equal(check("goes", ["go"]).ok, false);
  assert.equal(check("an", ["a"]).ok, false);
  assert.ok(speechScore("i think it's thursday", "I think it's Thursday.").score > 0.8);
  assert.ok(wordDiff("he go work", "he goes to work").some((d) => d.s === "missing"));
});

test("Smart correction explains the error of section 25", () => {
  const f = detect("He go to work every day.");
  assert.equal(f[0].id, "third-person-s");
  assert.match(f[0].en, /-s/);
  assert.equal(correct("He go to work every day."), "He goes to work every day.");
  assert.equal(thirdPerson("study"), "studies");
  assert.equal(thirdPerson("watch"), "watches");
  assert.equal(correct("I want that you send the report."), "I would like you to send the report.");
});

test("Streak: consecutive days grow, the weekly freeze covers one missed day", () => {
  const s = freshState();
  const d = (n) => new Date("2026-09-07T12:00:00").getTime() + n * DAY; // lunes
  touchStreak(s, d(0)); touchStreak(s, d(1));
  assert.equal(s.game.streak, 2);
  touchStreak(s, d(3)); // se saltó un día
  assert.equal(s.game.streak, 3);
  assert.equal(s.game.freezes, 0);
  touchStreak(s, d(6)); // hueco de 3 días
  assert.equal(s.game.streak, 1);
  assert.equal(playerLevel(0), 1);
  assert.equal(playerLevel(xpForLevel(3)), 3);
  assert.ok(dailyChallenge(s, d(0)).target > 0);
});

test("Exercises prioritize the student's professional contexts", () => {
  const g = C.grammarById["g.passive"];
  const ordered = orderItems(g.items, { prof: ["qa"], rnd: seeded(3) });
  assert.equal(ordered[0][3], "qa");
  const seq = lessonSequence(g, { prof: ["hr"], rnd: seeded(4) });
  assert.equal(seq.length, 6);
  assert.ok(seq.some((e) => e.type === "speak"));
  const order = makeGrammarExercise(g, g.items[0], "order", seeded(5));
  assert.equal(order.tokens.join(" ").length + order.punct.length, order.answer.length);
});
