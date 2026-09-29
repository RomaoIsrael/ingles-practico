# 08 · MVP, fases y trazabilidad de las 190 secciones

> Puntos 188, 189.15, 189.16 y "No eliminar ninguna funcionalidad sin justificar técnicamente la decisión".

## 1. Orden de desarrollo (sección 188) y dónde estamos

| Fase | Contenido | Estado en este repositorio |
|------|-----------|----------------------------|
| 1 · Product Design | usuarios, propuesta de valor, metodología, journey, feature map | ✅ `docs/01-producto.md` |
| 2 · UX/UI | arquitectura de información, flujos, wireframes, design system, navegación | ✅ `docs/03-ux.md` + implementación real (sirve de wireframe navegable) |
| 3 · MVP | registro, prueba de nivel, lecciones A1–B1, vocabulario, gramática, SRS, tutor, conversación básica, progreso | ✅ completo |
| 4 · Speaking | reconocimiento de voz, pronunciación, role play, conversación IA | ✅ con Web Speech API + Claude opcional (🟡 análisis fonético real → Etapa B) |
| 5 · Professional English | Engineering, Oil & Gas, QA/QC, HR, Law, Business (+ Energy, Audit, Finance, Medicine, Tech, Procurement, Career) | ✅ vocabulario, frases, correos, cláusulas y role plays |
| 6 · Advanced Personalization | My English Brain, adaptativo, olvido inteligente, plan diario IA, analítica | ✅ (motor local; el plan no necesita IA) |
| 7 · Gamification | XP, logros, retos, racha, juegos | ✅ |
| 8 · Premium | IA avanzada, Document Lab, certificaciones, offline, analítica avanzada | 🟡 Document Lab, offline y analítica ✅; certificaciones y pagos 🔜 |

Se adelantaron partes de las fases 4–8 porque, al ser locales y sin coste de servidor, eran baratas de construir sobre el mismo motor. Lo que depende de servidor, pagos o contenido masivo validado quedó para la Etapa B.

## 2. MVP vs. futuro (189.15–189.16)

**MVP (hecho)**: todo lo marcado ✅ abajo.
**Futuro (Etapa B)**, con la razón técnica:

| Función | Por qué no está en el MVP | Qué se preparó ya |
|---------|---------------------------|--------------------|
| Login con Email / Google / Apple (172) | Requiere backend de autenticación y dominio verificado; en una PWA estática no hay dónde guardar cuentas de forma segura. | Modo invitado + exportar/importar progreso; modelo `users`/`profiles` en `schema.sql`. |
| Sincronización entre dispositivos (125) | Necesita servidor. | Estado versionado con migraciones; diseño de cola de eventos en `02-arquitectura.md`. |
| Pagos / Premium (131–132) | Requiere Stripe/App Store y cuentas. | `docs` define planes; el MVP deja todo desbloqueado (beta). |
| IA sin clave del usuario | Poner una clave en el cliente la expondría. | `services/ai.js` aislado; en Etapa B se cambia por un `ai-gateway`. |
| Análisis fonético real (35, 177) | Web Speech solo da texto + confianza, no fonemas ni prosodia. | Puntuación por palabras + confianza; interfaz lista para un servicio de pronunciación. |
| Notificaciones push programadas (124) | Push real requiere servidor y claves VAPID. | Aviso diario dentro de la app + notificación local al abrir (máx. 1/día). |
| Certificaciones IELTS/TOEFL/Cambridge/TOEIC (103) | Necesitan bancos grandes de ítems originales validados y corrección de speaking/writing calibrada; hacerlo mal da una falsa sensación de preparación. | Exámenes de nivel y evaluación semanal con el mismo motor; los tipos de tarea ya existen (lectura, listening, writing, speaking). |
| Videos con subtítulos interactivos (148) | Se necesitan videos con licencia. | Audio con transcripción tocable (listening "Answer questions" + Smart Reading). |
| CMS web para administradores (130, 179) | Requiere backend y roles. | Paquetes de contenido JSON importables y validados (formato abajo). |
| Profesores en vivo, clases grupales, amigos, leaderboards, modo corporativo, dashboard docente (180–182) | Requieren cuentas, backend y moderación. | Tablas `organizations`, `assignments`, roles en `schema.sql`. |
| Analítica de producto (DAU, retención, conversión) (178) | Enviar datos de uso requiere backend y consentimiento. | Registro local de eventos (`log`) con el formato que usaría la tabla `events`. |
| OCR sin IA para Camera Mode (113) | Tesseract.js pesa varios MB y funciona mal con fotos de celular. | Camera Mode con visión de Claude cuando la IA está activa; sin IA, se pide pegar el texto. |

## 3. Trazabilidad completa (secciones 1–190)

Leyenda: ✅ implementado · 🟡 parcial / versión local · 🔜 fase futura (ver tabla anterior) · 📄 documento de diseño.

| § | Tema | Estado | Dónde |
|---|------|--------|-------|
| 1 | Las 3 preguntas | ✅ | `engine/brain.js`, `engine/planner.js` |
| 2 | Metodología | ✅📄 | `docs/01`, estructura de lecciones |
| 3 | Niveles A1–C2 | ✅ | `content/curriculum.js` |
| 4 | Registro inicial (6 preguntas) | ✅ | `ui/screens/onboarding.js` |
| 5 | Objetivos | ✅ | onboarding paso 2 |
| 6 | Tiempo de estudio | ✅ | onboarding paso 4, plan diario |
| 7 | Prueba de nivel (7 habilidades) | ✅ | `engine/placement.js`, `screens/placement.js` |
| 8 | My English Brain | ✅ | `engine/brain.js`, `#/brain` |
| 9 | Knowledge Map | ✅ | `#/map` |
| 10 | Motor adaptativo | ✅ | runner (reconocimiento↔producción), planner, preferencias |
| 11 | Olvido inteligente | ✅ | `brain.forgetting`, Home, `#/brain` |
| 12 | Repetición espaciada | ✅ | `engine/srs.js` |
| 13 | Active recall | ✅ | ejercicio `recall` con pistas |
| 14 | Estados de dominio | ✅ | `brain.stateOf` |
| 15 | Ruta visual | ✅ | `#/learn/:nivel` |
| 16 | Estructura de lección | ✅ | `screens/learn.js` |
| 17–19 | Vocabulario, categorías, ficha | ✅ | `content/vocab.js`, `pro-vocab.js`, `#/word/:id` |
| 20 | My Vocabulary | ✅ | `#/vocab` |
| 21 | Grammar roadmap | ✅ | 45 temas A1–C2 |
| 22 | Explicaciones por nivel | ✅ | `tutor.explainLang` + Ajustes |
| 23 | My Mistakes | ✅ | `#/mistakes` |
| 24–25 | Corrección inteligente + 2 ejercicios | ✅ | `ui/runner.js`, `engine/errors.js` |
| 26–27 | AI Teacher / ASK | ✅ | `services/tutor.js`, `screens/ask.js` (local + Claude) |
| 28 | Talk with AI | ✅ | `#/talk` (IA; sin IA, modo local SPEAKY) |
| 29 | 7 niveles de conversación | ✅ | Speak |
| 30 | Escenarios | ✅ | 25 escenarios en `content/scenarios.js` |
| 31 | Role Play con personajes | ✅ | `content/characters.js` |
| 32 | HELP 4 pistas | ✅ | role play |
| 33 | Evaluación de conversación | ✅ | 6–7 métricas |
| 34 | Better way to say it | ✅ | fin de role play |
| 35–36 | Pronunciation Coach, sonidos | ✅🟡 | 8 sonidos; análisis por reconocimiento de voz |
| 37 | Velocidad 0.5–1.25x | ✅ | selector global |
| 38 | Shadowing | ✅ | `#/shadowing` |
| 39 | Listening | ✅ | 6 modos |
| 40–41 | Reading + Smart Reading | ✅ | 13 textos A1–C2 |
| 42–43 | Writing Coach + corrección | ✅ | original/corregido local; natural/profesional con IA |
| 44 | General English | ✅ | temas de vocabulario + escenarios |
| 45–49 | Business, Meetings, Presentations, Email, Negotiation | ✅ | `content/professional.js` |
| 50–51 | Engineering + role plays | ✅ | ruta + escenarios |
| 52 | Oil & Gas | ✅ | |
| 53–54 | QA/QC + simulaciones | ✅ | |
| 55 | Audit English | ✅ | |
| 56 | Energy | ✅ | |
| 57–70 | HR (reclutamiento, entrevista IA, STAR, onboarding, desempeño, relaciones, políticas, compensación, L&D, emails, role plays) | ✅ | ruta HR + `#/interview` |
| 71–84 | Legal (vocabulario, sistemas, contratos, Clause Trainer, Plain English, legal writing/emails, negociación, litigio, societario, laboral, compliance, HR+Legal) | ✅ | ruta Law + HR & Employment Law |
| 85–86 | Profesión personalizada | ✅ | onboarding + "Create my Professional English" |
| 87 | Professional Dashboard | ✅ | `#/pro` |
| 88–90 | Career, CV, LinkedIn | ✅ | `#/cv`, `#/linkedin` |
| 91–92 | Real Life / Story Mode | ✅ | escenarios con ramas (`story: true`) |
| 93 | 8 minijuegos | ✅ | `#/games` |
| 94–95 | Reto diario, misión semanal | ✅ | `engine/gamification.js` |
| 96–97 | Gamificación sin frustración | ✅ | sin vidas, protector de racha |
| 98–100 | Today's Plan, recomendaciones, Smart Review | ✅ | |
| 101–102 | Reportes semanal/mensual | ✅ | `#/reports` |
| 103 | Certificaciones | ✅🟡 | `#/exams`: IELTS, TOEFL, TOEIC y Cambridge (formato, estrategias y práctica original); los bancos completos de simulacros se amplían en la Etapa B |
| 104 | Exámenes periódicos | ✅ | `#/exam/:nivel`, `#/exam/weekly` |
| 105 | Immersion Mode | ✅ | Ajustes |
| 106 | US vs UK | ✅ | acento + biblioteca |
| 107–110 | Phrasal verbs, idioms, collocations, natural English | ✅ | `#/library/*` |
| 111 | Diccionario | ✅ | `#/dictionary` |
| 112 | Document English Lab | ✅ | `#/doclab` |
| 113 | Camera Learning | 🟡 | con IA (visión) |
| 114 | Voice Mode | ✅ | modo manos libres en conversaciones |
| 115–116 | Personajes | ✅ | 6 coaches + 6 profesionales + 13 de escenarios |
| 117–119 | Diseño, Home, navegación | ✅ | |
| 120–123 | Learn, Practice, Speak, Profile | ✅ | |
| 124 | Notificaciones | 🟡 | ver §2 |
| 125 | Offline | ✅ | `sw.js` (sin sincronización → 🔜) |
| 126 | Accesibilidad | ✅ | tamaño de texto, alto contraste, animaciones reducidas, ARIA |
| 127 | Privacidad | ✅ | `#/privacy` |
| 128 | Modelo de datos | ✅📄 | `docs/06`, `core/store.js` |
| 129 | Arquitectura por módulos | ✅📄 | `docs/02` |
| 130 | CMS | 🟡 | paquetes JSON |
| 131–132 | Free / Premium | 🔜 | |
| 133 | IA con contexto limitado, sin inventar reglas | ✅ | `brain.summary`, `tutor.systemPrompt` |
| 134 | Feedback positivo adulto | ✅ | `PRAISE`/`ENCOURAGE` |
| 135 | Ejemplos por profesión | ✅ | contextos de ítems + `profContexts` |
| 136 | Memoria de patrones | ✅ | `state.patterns` |
| 137 | Controles del usuario | ✅ | fin de lección |
| 138 | Motivación real | ✅ | nivel por dominio, no por XP |
| 139 | Primera semana | ✅ | planner |
| 140 | Fluency Path | ✅ | `#/fluency` |
| 141 | Think in English | ✅ | `#/think` |
| 142 | Speaking timer | ✅ | Speak + role play |
| 143 | Frecuencia | ✅ | orden por `freq` |
| 144 | Gramática en contexto | ✅ | situación → ejemplos → regla → práctica |
| 145 | Detección de patrones | ✅ | 54 reglas |
| 146 | Falsos amigos | ✅ | 22 entradas + regla `assist-attend` |
| 147 | Translation trainer | ✅ | `#/translate` |
| 148 | Subtítulos interactivos | 🟡 | audio + transcripción; video 🔜 |
| 149 | Micrófono en ejercicios | ✅ | ejercicios `speak`/`say` |
| 150 | Motor de decisión diaria | ✅ | `buildPlan` |
| 151 | Repaso contextual | ✅ | `orderItems` |
| 152 | Role play profesional | ✅ | 4 ejemplos pedidos incluidos |
| 153 | Bancos especializados | ✅ | 13 áreas |
| 154 | Analítica de aprendizaje | ✅ | tendencias en reportes |
| 155 | Skill radar | ✅ | Perfil |
| 156 | Logros | ✅ | 21 insignias |
| 157–159 | Búsqueda, favoritos, notas | ✅ | |
| 160 | Generador de lecciones IA | ✅ | Mistakes (con IA) |
| 161–164 | Explain simply, More examples, Practice this, Master this | ✅ | ficha de gramática |
| 165 | Progreso real | ✅ | `coverage` + examen |
| 166 | Reevaluación | ✅ | Reports |
| 167 | Calidad de contenido | ✅ | `tests/content.test.mjs` |
| 168 | Seguridad profesional | ✅ | avisos + prompt |
| 169 | Design system | ✅ | `ui/components.js`, `css/app.css` |
| 170 | Modo oscuro | ✅ | |
| 171 | Responsive | ✅ | móvil → escritorio |
| 172 | Login | 🟡 | modo invitado (resto 🔜) |
| 173 | Onboarding corto | ✅ | |
| 174–175 | Base de datos, backend | 📄 | `schema.sql`, `docs/02` |
| 176 | Control de costes IA | ✅ | todo lo determinista es local |
| 177 | STT/TTS/pronunciación | ✅🟡 | Web Speech |
| 178 | Analítica de producto | 🔜 | |
| 179 | Contenido sin tocar código | 🟡 | paquetes JSON |
| 180–182 | Futuro, corporativo, docentes | 🔜📄 | |
| 183–187 | Visión y principios | ✅ | |
| 188–189 | Orden y primera tarea | ✅📄 | estos documentos |
| 190 | Objetivo final | — | "This is what you should learn today" en Home |

## 4. Formato de paquete de contenido (CMS ligero)

```json
{
  "id": "acme-safety-pack",
  "version": 1,
  "grammar": [{
    "id": "g.safety-imperatives", "level": "A2", "title": "Safety instructions", "es": "Instrucciones de seguridad", "icon": "🦺",
    "situation": { "emoji": "🦺", "en": "Site induction.", "es": "Inducción en obra." },
    "examples": [["Wear your helmet.", "Usa tu casco."]],
    "rule": { "es": ["Imperativo = verbo base."], "en": ["Imperative = base verb."] },
    "simple": { "es": "Da órdenes con el verbo base.", "en": "Use the base verb." },
    "items": [["___ your helmet at all times.", "Wear", ["Wears", "Wearing"], "oil", "Usa tu casco siempre."]],
    "challenge": { "en": "Write two safety rules.", "es": "Escribe dos reglas de seguridad.", "check": "^\\s*\\w+" }
  }],
  "vocab": { "safety-extra": { "title": "Safety extra", "es": "Seguridad extra", "icon": "🦺", "area": "hse",
    "words": [["harness", "arnés", "ˈhɑːrnɪs", "safety equipment for working at height", "Always wear a harness above two meters.", "B1", "🧗"]] } },
  "readings": [], "scenarios": []
}
```

Se importa en **Perfil → Ajustes → Content (CMS)**. `validatePack()` rechaza ítems sin hueco `___`, distractores iguales a la respuesta, niveles inválidos o palabras incompletas.

## 5. Checklist editorial (sección 167)

Antes de publicar contenido nuevo: gramática correcta · inglés natural (lo diría un nativo) · nivel CEFR coherente · adecuado al contexto profesional · sin copiar libros ni exámenes oficiales · traducción revisada · ejemplo que usa la palabra · pasa `npm test`.

## 6. Ampliación v0.2 (curso completo desde cero)

| Pedido | Implementación |
|--------|----------------|
| Instrucciones más claras, por secciones | `INSTR` en `ui/runner.js` (qué hacer + ejemplo en cada tipo de ejercicio) y `howTo()` en cada actividad |
| Pruebas como EF / GoFluent | `engine/testing.js` + `content/tests-bank.js` + `ui/screens/tests.js`: test adaptativo Reading + Listening (0–100 ↔ CEFR), tests de nivel A1–C2, Business English, Quick check, exámenes de unidad y certificado. Formatos inspirados en esas plataformas; contenido 100 % original |
| Temas de estudio como materia | `ui/screens/syllabus.js` (Temario por nivel, imprimible) |
| Unidades ampliadas con detalle | `content/syllabus.js`: objetivos Can-do, contenidos y frases por unidad; cada unidad termina con frases útiles + examen |
| Aprender desde cero | Unidades Starter S-1…S-5 (`content/starter.js`): alfabeto, supervivencia, números, colores, días/meses, 100 primeras palabras |
| Reglas gramaticales más profundas | `content/grammar-deep-1.js` y `grammar-deep-2.js`: apuntes completos de los 45 temas, mostrados como diapositivas en las lecciones y como ficha imprimible |
| Muy didáctica | Lección en diapositivas con barra de pasos, ejemplos con audio antes de la regla, errores comunes y trucos, comparación con el español |

Referencias pedagógicas (solo como inspiración de formato y secuencia, sin copiar contenido): MCER/CEFR y Cambridge English Scale (niveles y descriptores Can-do), secuencia gramatical de libros de texto internacionales, EF SET (test adaptativo de lectura y escucha con escala 0–100), GoFluent (tests por nivel con inglés de negocios), Wall Street English (unidades con objetivos y encuentros de práctica), Duolingo (ruta visual, microlecciones, gamificación).

## 7. Ampliación v0.3 (B2–C2 y exámenes internacionales)

| Área | Antes | Ahora |
|------|-------|-------|
| Temas de gramática | 45 | 54 (9 nuevos B2–C2 con apuntes completos) |
| Ejercicios base de gramática | ≈ 360 | 443 |
| Palabras | 538 | 608 (6 bancos B2–C2) |
| Unidades B2 / C1 / C2 | 4 / 2 / 1 | 8 / 5 / 3 |
| Lecturas / conversaciones | 13 / 25 | 19 / 29 |
| Test adaptativo | hasta C1 | hasta C2 |
| Exámenes internacionales | 🔜 | IELTS, TOEFL, TOEIC, Cambridge (`content/exam-prep.js`, `ui/screens/exams.js`) |

Lo que sigue dependiendo de la Etapa B (servidor) y queda sin cambios: cuentas con Google/Apple, sincronización, pagos, notificaciones push, analítica de producto, CMS web, profesores y modo corporativo (ver §2).
