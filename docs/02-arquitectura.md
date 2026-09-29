# 02 · Arquitectura funcional y técnica

> Puntos 129, 133, 175–177, 189.2, 189.11, 189.12 y 189.19.

## 1. Decisión de arquitectura: *local-first* en dos etapas

| Etapa | Qué es | Por qué |
|-------|--------|---------|
| **Etapa A (este repositorio)** | PWA estática (HTML + CSS + módulos ES, sin paso de compilación), publicada en GitHub Pages. Todo el motor de aprendizaje corre en el dispositivo; los datos viven en `localStorage`. IA opcional con la clave API del propio usuario. | Permite validar la pedagogía y la experiencia **hoy**, sin servidores ni costes, offline, en cualquier celular. Es el mismo formato que tus otras apps (`calculadora-animales`). |
| **Etapa B (escalado)** | Mismo front + backend (API + Postgres + servicios de IA y voz) con cuentas, sincronización, pagos, CMS web, analítica de producto y modo corporativo. | Necesario para login Google/Apple, premium, profesores, empresas y para no exponer claves de IA en el cliente. |

La clave: **los módulos del motor (`js/engine/*`) son funciones puras** (entrada: estado; salida: nuevo estado/decisión). Se pueden ejecutar tal cual en un servidor Node en la Etapa B; no dependen del DOM.

## 2. Módulos (sección 129) y dónde viven

| Módulo | Etapa A (archivo) | Etapa B |
|--------|-------------------|---------|
| Authentication | Modo invitado (`core/store.js`) + exportar/importar progreso | Servicio Auth (email, Google, Apple) — p. ej. Supabase Auth / Firebase Auth |
| User Profile | `core/store.js` (`profile`, `settings`) | Tabla `profiles` |
| Learning Engine | `engine/brain.js`, `engine/planner.js`, `engine/exercises.js` | Mismo código en servicio `learning-api` |
| AI Tutor | `services/tutor.js` (local) + `services/ai.js` (Claude opcional) | `ai-gateway` en servidor (clave protegida, límites por plan, caché) |
| AI Conversation | `ui/screens/speak.js` + `content/scenarios.js` + `services/ai.js` | `ai-gateway` con streaming |
| Speech Recognition | `services/speech.js` (Web Speech API) | STT en servidor (p. ej. Whisper / Deepgram) para navegadores sin soporte |
| Text-to-Speech | `services/speech.js` (speechSynthesis, voces en-US/en-GB) | TTS neural con caché de audio por frase |
| Pronunciation Analysis | `services/speech.js` (alineación palabra a palabra sobre la transcripción) | Evaluación fonética (GOP) por fonema |
| Grammar Engine | `engine/errors.js` (reglas) + `engine/grader.js` | Igual + verificación IA para casos abiertos |
| Vocabulary Engine | `content/vocab.js` + `engine/srs.js` | Tabla `vocabulary` + `reviews` |
| Spaced Repetition | `engine/srs.js` | Mismo código (cálculo local, sin IA) |
| Professional Learning | `content/professional.js` | Paquetes de contenido desde CMS |
| Gamification | `engine/gamification.js` | Mismo código + tablas `achievements`, leaderboards |
| Analytics | `engine/analytics.js` (reportes del usuario) | + analítica de producto (DAU, retención, conversión) |
| Notifications | Avisos dentro de la app + `Notification` local | Web Push / FCM / APNs |
| Payments | `core/plan.js` (feature flags FREE/PREMIUM, todo desbloqueado en beta) | Stripe / App Store / Google Play |
| CMS | Paquetes de contenido JSON importables (`content/registry.js`) | Panel web de administración |
| Offline Sync | `sw.js` (todo el contenido es offline) | Cola de eventos + sincronización al reconectar |

## 3. Diagrama (Etapa A)

```
index.html ─► js/main.js (router por hash, navegación inferior, tema)
                 │
   ┌─────────────┼──────────────────────────────┐
   │ ui/screens/*  (Home, Learn, Practice, Speak, Profile, Lesson, …)
   │ ui/components.js (cards, barras, radar SVG, burbujas, audio)
   └─────────────┬──────────────────────────────┘
                 │ llaman a
   ┌─────────────▼──────────────┐   ┌───────────────────────────┐
   │ engine/  (puro, testeable) │   │ services/                 │
   │  brain  srs  planner       │   │  speech (STT/TTS)         │
   │  grader errors exercises   │   │  ai (Claude, opcional)    │
   │  placement gamification    │   │  tutor (Ask My Teacher)   │
   │  analytics                 │   └───────────────────────────┘
   └─────────────┬──────────────┘
                 │ lee
   content/*  (currículo, gramática, vocabulario, escenarios, lecturas…)
                 │
   core/store.js ─► localStorage  ("ip.v1")       sw.js ─► caché offline
```

## 4. Tecnologías recomendadas (189.19)

| Capa | Etapa A (implementado) | Etapa B (recomendado) | Justificación |
|------|------------------------|-----------------------|---------------|
| Front | HTML/CSS/JS módulos ES, sin frameworks | Migrar a **React + TypeScript** (Vite) o **React Native/Expo** si se publican apps nativas | Etapa A prioriza cero dependencias y offline. En Etapa B el tipado y los componentes compartidos compensan. |
| Gráficas | SVG propio (radar, barras, líneas) | Igual o Recharts | Sin dependencias externas; funciona offline. |
| Voz | Web Speech API | Whisper/Deepgram (STT), Azure/ElevenLabs/Google (TTS), Azure Pronunciation Assessment | Web Speech es gratis pero depende del navegador. |
| IA | Claude API (`claude-opus-5-5`) vía SDK oficial `@anthropic-ai/sdk` cargado solo al activar la IA | Mismo SDK en servidor (Node) | Ver §5. |
| Backend | — | Node/TypeScript (Fastify) o Supabase (Postgres + Auth + Storage + Edge Functions) | Escalable, separado por dominios (§6). |
| Base de datos | localStorage (JSON) | PostgreSQL (esquema en `docs/schema.sql`) | Relacional para progreso + JSONB para contenido. |
| Pruebas | `node --test` sobre el motor + prueba de humo con Playwright | + CI en GitHub Actions | |
| Hosting | GitHub Pages | Vercel/Netlify (front) + Supabase/Fly.io (API) | |

## 5. Arquitectura de IA (secciones 26–28, 133, 136, 176)

### Principio: IA solo donde aporta valor real

| Tarea | ¿IA? | Cómo se resuelve |
|-------|------|------------------|
| Repetición espaciada, XP, rachas, cálculo de dominio y olvido, plan diario | **No** | Algoritmos locales (`engine/*`) |
| Calificar opción múltiple, huecos, orden de palabras, traducción cerrada | **No** | `grader.js` (normalización + contracciones + tolerancia a erratas) |
| Detectar errores típicos (he go, I am agree, depend of…) | **No** | 54 reglas en `errors.js` con explicación en español/inglés |
| Role plays guiados | **No** (con IA opcional) | Guiones ramificados por palabras clave |
| Conversación libre, entrevistas abiertas, corrección de textos largos, "¿cómo lo diría un nativo?", explicar documentos/fotos | **Sí** | Claude con contexto limitado |

### Contexto limitado del estudiante

Cada llamada envía solo un **resumen compacto** (≈150 tokens) generado por `brain.summary()`:

```
Student: native Spanish, level A2 (grammar A2, speaking A1), goal Work,
profession Engineering + QA/QC. Weak: present-perfect (48%), prepositions (61%).
Frequent mistakes: third-person-s (7), articles (4). Conversation level 2.
```

Nunca se envía el historial completo, ni el nombre, ni correos. La **memoria educativa** (sección 136) se mantiene localmente como conteo de patrones de error; la IA la recibe resumida.

### Reglas del sistema (prompt del tutor)

1. Enseñar inglés; no dar asesoramiento legal, médico ni financiero (sección 168).
2. **No inventar reglas gramaticales**; si hay duda, decirlo ("I'm not completely sure…") (sección 133).
3. Explicar en español para A1–A2, bilingüe en B1, inglés en B2+ (sección 22).
4. Corregir con el formato: qué pasó → por qué → forma correcta → regla → ejemplo (sección 24).
5. Tono profesional y motivador, sin infantilizar (sección 134).

### Detalles de la llamada

- Modelo: `claude-opus-5-5`; `output_config.effort: "low"` para chat (latencia), `"medium"` para correcciones de escritura.
- Respaldo ante rechazos: `betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"`, y comprobación de `stop_reason === "refusal"`.
- Streaming para conversación (`client.beta.messages.stream` + evento `text`).
- En la Etapa A la clave API la aporta el usuario y **solo se guarda en su dispositivo**; el navegador llama directamente a la API (`dangerouslyAllowBrowser: true`). En la Etapa B la clave pasa al servidor (`ai-gateway`) con límites por plan (Free: N conversaciones/día).

### Control de costes (sección 176)

- Todo lo calculable localmente se calcula localmente (tabla anterior).
- Resumen de contexto de tamaño fijo, historial de conversación recortado a los últimos 12 turnos.
- `max_tokens` acotado por tipo de tarea (chat 600, corrección 1500).
- Etapa B: caché de respuestas deterministas (explicaciones de gramática por tema/nivel), prompt caching del system prompt, límites por plan.

## 6. Speech-to-Text y Text-to-Speech (sección 177)

| Función | Implementación Etapa A | Limitaciones | Etapa B |
|---------|------------------------|--------------|---------|
| TTS | `speechSynthesis` con voz `en-US` o `en-GB` según acento preferido; velocidad 0.5x / 0.75x / 1x / 1.25x | La calidad de la voz depende del sistema | TTS neural + caché de mp3 por frase |
| STT | `SpeechRecognition` (Chrome, Edge, Safari) en `en-US`/`en-GB`, con resultados intermedios | No disponible en Firefox; requiere conexión en Chrome | STT en servidor con marcas de tiempo por palabra |
| Pronunciación | Se compara la transcripción con el texto esperado (alineación por distancia de edición de palabras) + confianza del reconocedor → puntuación 0–100 y palabras a mejorar | No evalúa fonemas ni entonación de verdad | Evaluación fonética (precisión, fluidez, completitud, prosodia) |
| Tiempo hablado | Se mide el tiempo con el micrófono activo | | Igual |
| Privacidad | No se guardan grabaciones: solo texto transcrito | | Grabaciones opcionales con borrado (sección 127) |

Si el navegador no soporta reconocimiento de voz, todo ejercicio oral ofrece la alternativa escrita: nunca bloquea al estudiante.

## 7. Backend de la Etapa B (sección 175)

Servicios separados por dominio (se pueden empezar como un monolito modular):

```
            ┌──────────────┐
  App ─────►│ API Gateway  │── auth (JWT) ── rate limit por plan
            └──┬───┬───┬───┘
   ┌───────────┘   │   └──────────────┬────────────────┐
   ▼               ▼                  ▼                ▼
 user-svc      learning-svc        ai-gateway       content-svc (CMS)
 (profiles,    (brain, srs,        (Claude, STT,    (lecciones, vocab,
  settings)     planner, events)    TTS, pronun.)    audio, packs)
   │               │                  │                │
   └──── Postgres ─┴── event log ─────┴── Storage (audio, imágenes)
                         │
                   analytics-svc  ──►  dashboards de producto
                   subscriptions-svc ► Stripe / stores
```

- **Sincronización offline**: el cliente guarda eventos (`answer`, `lesson_complete`, `review`, `speaking_seconds`) en una cola; al reconectar los envía; el servidor recalcula el Brain con el mismo código del motor (idempotente por `event_id`).
- **Escalabilidad**: learning-svc es sin estado (lee/escribe Postgres); ai-gateway escala horizontalmente; contenido servido por CDN.
