-- Inglés Práctico · Esquema PostgreSQL para la Etapa B (backend).
-- La Etapa A (PWA local) guarda el mismo modelo en localStorage (ver 06-modelo-de-datos.md).

create extension if not exists "pgcrypto";

-- ───────────── Usuarios y organizaciones ─────────────
create table organizations (            -- modo corporativo / escuelas (secciones 180-182)
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('company','school')),
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  auth_provider text not null check (auth_provider in ('email','google','apple','guest')),
  organization_id uuid references organizations(id),
  role text not null default 'student' check (role in ('student','teacher','admin','org_admin')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text,
  native_language text not null default 'es',
  learning_goals text[] not null default '{}',
  user_level text not null default 'A1' check (user_level in ('A1','A2','B1','B2','C1','C2')),
  target_level text check (target_level in ('A1','A2','B1','B2','C1','C2')),
  daily_goal_minutes int not null default 15 check (daily_goal_minutes in (5,10,15,20,30,45,60)),
  preferred_accent text not null default 'us' check (preferred_accent in ('us','uk')),
  profession_primary text, profession_secondary text, profession_extra text[] default '{}',
  profession_custom text,
  settings jsonb not null default '{}',       -- tema, accesibilidad, inmersión, etc.
  levels jsonb not null default '{}',          -- nivel por habilidad
  updated_at timestamptz not null default now()
);

create table subscriptions (
  user_id uuid primary key references users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium','corporate')),
  provider text, provider_ref text,
  current_period_end timestamptz
);

-- ───────────── Contenido (CMS) ─────────────
create table grammar_topics (
  id text primary key,                     -- 'g.present-perfect'
  level text not null, title text not null, title_es text,
  body jsonb not null,                     -- situación, reglas es/en, ejemplos, ítems
  status text not null default 'draft' check (status in ('draft','review','published')),
  updated_at timestamptz not null default now()
);

create table vocabulary (
  id text primary key,                     -- 'w.inspection'
  word text not null, ipa text, translation_es text, definition text, example text,
  image text, synonym text, antonym text, uk_variant text,
  cefr text not null, frequency smallint not null default 2,
  topic text not null, professional_area text,
  status text not null default 'published'
);
create index on vocabulary (topic);
create index on vocabulary (cefr, frequency);

create table skills (                      -- catálogo de conceptos del Brain
  id text primary key,                     -- 'g.*','v.*','sk.*','pr.*','p.*','b.*'
  category text not null, label text not null, level text
);

create table professional_modules (
  id text primary key, route text not null, title text not null,
  body jsonb not null, sort int not null default 0
);

create table lessons (
  id text primary key, level text not null, unit_id text not null,
  kind text not null check (kind in ('grammar','vocab','talk','read','listen','pron')),
  ref text not null, title text not null, sort int not null default 0,
  status text not null default 'published'
);

create table content_packs (               -- paquetes importables (mismo formato que la Etapa A)
  id text primary key, version int not null, body jsonb not null,
  published_at timestamptz
);

-- ───────────── Aprendizaje ─────────────
create table skill_mastery (               -- MY ENGLISH BRAIN
  user_id uuid references users(id) on delete cascade,
  skill_id text references skills(id),
  mastery real not null, attempts int not null default 0, correct int not null default 0,
  stability_days real not null default 1,
  contexts text[] not null default '{}', correct_days date[] not null default '{}',
  produced boolean not null default false,
  first_at timestamptz, last_at timestamptz,
  primary key (user_id, skill_id)
);

create table vocabulary_reviews (          -- repetición espaciada ("reviews")
  user_id uuid references users(id) on delete cascade,
  word_id text references vocabulary(id),
  step smallint not null default -1, ease real not null default 1,
  due_at timestamptz, reps int not null default 0, lapses int not null default 0,
  last_grade smallint, last_at timestamptz,
  primary key (user_id, word_id)
);
create index on vocabulary_reviews (user_id, due_at);

create table lesson_progress (
  user_id uuid references users(id) on delete cascade,
  lesson_id text references lessons(id),
  completed_at timestamptz, best_score real, stars smallint, times int not null default 0,
  primary key (user_id, lesson_id)
);

create table mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  category text not null, pattern_id text, wrong text not null, correct text,
  explanation text, topic_id text, fixed boolean not null default false,
  created_at timestamptz not null default now()
);
create index on mistakes (user_id, created_at desc);

create table error_patterns (
  user_id uuid references users(id) on delete cascade,
  pattern_id text not null, count int not null default 0, last_at timestamptz,
  primary key (user_id, pattern_id)
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  kind text not null check (kind in ('placement','level_exam','weekly','reassessment')),
  level text, result jsonb not null, created_at timestamptz not null default now()
);

create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  kind text not null, skill_id text, seconds int not null, correct int, total int, xp int,
  created_at timestamptz not null default now()
);

-- ───────────── Speaking e IA ─────────────
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  scenario text, character text, level smallint, evaluation jsonb,
  started_at timestamptz not null default now(), ended_at timestamptz
);
create table conversation_turns (
  id bigserial primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user','ai')), text text not null,
  correction jsonb, created_at timestamptz not null default now()
);

create table pronunciation_attempts (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  target text not null, transcript text, score real, sound_id text,
  audio_url text,                          -- opcional; borrable (sección 127)
  created_at timestamptz not null default now()
);

create table ai_usage (                    -- control de costes (sección 176)
  user_id uuid references users(id) on delete cascade,
  day date not null, requests int not null default 0,
  input_tokens bigint not null default 0, output_tokens bigint not null default 0,
  primary key (user_id, day)
);

-- ───────────── Gamificación ─────────────
create table gamification (
  user_id uuid primary key references users(id) on delete cascade,
  xp int not null default 0, coins int not null default 0,
  streak int not null default 0, best_streak int not null default 0,
  last_active date, streak_freezes smallint not null default 1
);
create table achievements (
  user_id uuid references users(id) on delete cascade,
  badge_id text not null, earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ───────────── Futuro: corporativo / docentes ─────────────
create table assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  assigned_by uuid references users(id), user_id uuid references users(id),
  route text not null, due_at timestamptz
);

-- ───────────── Analítica de producto (sección 178) ─────────────
create table events (
  id bigserial, user_id uuid, name text not null, props jsonb,
  created_at timestamptz not null default now()
) partition by range (created_at);
