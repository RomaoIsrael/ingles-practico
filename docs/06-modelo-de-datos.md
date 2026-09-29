# 06 · Modelo de datos

> Puntos 128, 174 y 189.8. Etapa A: un documento JSON en `localStorage` (clave `ip.v1`), gestionado por `js/core/store.js`. Etapa B: PostgreSQL (`docs/schema.sql`).

## 1. Campos pedidos (sección 128) → dónde se guardan

| Campo del prompt | Etapa A (`state.…`) | Etapa B (tabla.columna) |
|------------------|---------------------|-------------------------|
| user_level | `levels.overall` | `profiles.user_level` |
| target_level | `profile.targetLevel` | `profiles.target_level` |
| native_language | `profile.nativeLang` | `profiles.native_language` |
| profession | `profile.professions {primary, secondary, extra[], custom}` | `profiles.profession_*`, `user_professional_routes` |
| learning_goal | `profile.goals[]` | `profiles.learning_goals` |
| daily_goal | `profile.dailyMinutes` | `profiles.daily_goal_minutes` |
| preferred_accent | `profile.accent` (`us`/`uk`) | `profiles.preferred_accent` |
| grammar_mastery | `skills["g.*"]` | `skill_mastery` (skill_id `g.*`) |
| vocabulary_mastery | `skills["v.*"]` + `vocab` | `skill_mastery` + `vocabulary_reviews` |
| speaking/listening/reading/writing/pronunciation score | `skills["sk.*"]`, `skills["pr.*"]` | `skill_mastery` |
| words_learned / words_mastered | derivado de `vocab` (estados SRS) | vista `v_vocab_stats` |
| mistakes | `mistakes[]` + `patterns{}` | `mistakes`, `error_patterns` |
| study_time | `log[]` (minutos por actividad) | `study_sessions` |
| streak / XP | `game.streak`, `game.xp` | `gamification` |
| review_schedule | `vocab[id].due`, `skills[id]` (olvido) | `vocabulary_reviews.due_at` |
| lesson_history | `lessons{}` | `lesson_progress` |
| conversation_history | `conversations[]` (últimas 30, borrables) | `conversations`, `conversation_turns` |

## 2. Estado local (Etapa A)

```js
{
  version: 1,
  profile:  { name, nativeLang, goals[], selfLevel, dailyMinutes, accent, professions{primary,secondary,extra[],custom},
              targetLevel, createdAt, onboarded, placementDone },
  settings: { theme, textSize, highContrast, reducedMotion, immersion, captions, audioRate, explainLang,
              convLevel, ai{enabled, apiKey, model}, notifications },
  levels:   { overall, grammar, vocabulary, reading, listening, writing, speaking, pronunciation,
              history[{t, overall}], lastAssessment },
  skills:   { [conceptId]: { m, n, c, first, last, stab, ctx[], days[], prod, hist[[t,m]] } },
  vocab:    { [wordId]: { step, ease, due, reps, lapses, last, lastGrade, added } },
  lessons:  { [lessonId]: { done, best, stars, times } },
  mistakes: [ { id, t, cat, pattern, wrong, right, why, topic, fixed } ],   // máx. 300
  patterns: { [patternId]: { n, last } },
  log:      [ { t, kind, skill, sec, ok, total, xp } ],                  // máx. 3000 eventos
  speaking: { [yyyy-mm-dd]: seconds },
  game:     { xp, coins, streak, best, lastDay, freezes, badges{id:t}, dailyDone{date}, weekly{} },
  daily:    { date, blocks[], done[] },
  conversations: [ { id, t, scenario, turns[], eval } ],
  favorites: [ { type, id, label } ],  notes: [ { id, t, text, ref } ],
  prefs:    { [topicId]: 'easy'|'hard' },
  packs:    [ contentPack ]   // contenido importado (CMS ligero)
}
```

Migraciones: `store.js` tiene `migrate(state)` por número de versión. Exportación/importación como JSON (respaldo manual y cambio de dispositivo, hasta que exista la sincronización de la Etapa B).

## 3. Base de datos de la Etapa B (sección 174)

Tablas: **users, profiles, lessons, skills, vocabulary, grammar_topics, mistakes, reviews (vocabulary_reviews), conversations, pronunciation_attempts, achievements, professional_modules, assessments** + tablas de soporte (skill_mastery, lesson_progress, study_sessions, events, subscriptions, organizations, assignments). SQL completo en [`schema.sql`](schema.sql).

Separación (sección 175): datos de usuario (`users`, `profiles`, `subscriptions`), datos de aprendizaje (`skill_mastery`, `vocabulary_reviews`, `mistakes`, `events`…), contenido (`lessons`, `grammar_topics`, `vocabulary`, `professional_modules`, `content_packs`), IA (`conversations`, `conversation_turns`, `ai_usage`), analítica (`events` particionada por mes) y suscripciones.
