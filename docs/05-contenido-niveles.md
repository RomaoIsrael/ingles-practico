# 05 · Estructura de niveles A1–C2 y contenido

> Puntos 3, 15–22, 40, 44–90, 103–111, 140–147, 153, 167–168 y 189.7.
> Implementación: `js/content/curriculum.js`, `grammar.js`, `vocab.js`, `professional.js`, `scenarios.js`, `reading.js`, `pronunciation.js`, `extras.js`.

## 1. Jerarquía

```
Nivel CEFR ─► Módulo (etapa de la ruta visual) ─► Unidad ─► Lección (3–15 min) ─► Ejercicios
                                                        └─► Conversación · Repaso · Examen de nivel
```

Cada **lección** sigue la estructura de la sección 16: **Learn → Example → Practice → Speak → Review → Mini Challenge**.
Tipos de lección: `grammar` (tema de gramática), `vocab` (grupo de palabras), `talk` (role play), `read` (lectura), `listen` (audio), `pron` (sonido).

## 2. Ruta visual (sección 15) y niveles

| Etapa de la ruta | Nivel | Unidades (resumen) | Gramática |
|------------------|-------|--------------------|-----------|
| START → **English Foundations** | A1 | Hello! · People & jobs · Family & things · Around me | be, pronouns, articles, plurals, possessives, there is/are |
| **Basic Conversation** | A1 | My day · Food & likes · Right now · Where & when · I can do it · Questions | present simple, have/has, present continuous, prepositions, can, question words |
| **Grammar Foundations** | A2 | Yesterday · Stories · Plans · Predictions | past simple, past continuous, going to, will |
| **Everyday English** | A2 | Comparing · Shopping & quantities · Rules · Experiences · Connecting ideas | comparatives, superlatives, countable/uncountable, obligation, present perfect (experiences), conjunctions |
| **Travel** | A1–A2 | Airport · Hotel · Restaurant · Taxi · Doctor | (repaso en contexto) |
| **Intermediate Conversation** | B1 | Up to now · Longer actions · Before that · If… · Imagine · Habits in the past | present perfect (for/since/yet), present perfect continuous, past perfect, 1st/2nd conditional, used to |
| **Professional English** | B1 | Processes · Describing things · Verb patterns · Phrasal verbs at work | passive, relative clauses, gerunds/infinitives, phrasal verbs |
| **Advanced English** | B2 | Reporting · Regrets · Deduction · Contrast · Getting things done | reported speech, 3rd conditional, wish, modals of deduction, linking contrast, causative |
| **Fluency** | C1 | Emphasis · Style | inversion, mixed conditionals, cleft sentences, participle clauses |
| **C2 MASTER** | C2 | Academic & professional writing | academic structures, advanced writing structures, formal subjunctive |

A1–B1 tienen el contenido completo del MVP. B2–C2 incluyen todos los temas del roadmap (sección 21) con explicación en inglés y ejercicios de muestra; en la Etapa B se amplían desde el CMS.

## 3. Grammar roadmap completo (sección 21)

Todos los temas pedidos están presentes en `grammar.js`:

| Tema del prompt | id | Nivel |
|-----------------|----|-------|
| Verb to be | `g.be` | A1 |
| Pronouns | `g.pronouns` | A1 |
| Articles | `g.articles` | A1 |
| Plural nouns | `g.plurals` | A1 |
| Possessives | `g.possessives` | A1 |
| There is / There are | `g.there-is` | A1 |
| Have / Has | `g.have-has` | A1 |
| Present Simple | `g.present-simple` | A1 |
| Present Continuous | `g.present-continuous` | A1 |
| Prepositions | `g.prepositions` | A1 |
| Modals (can) | `g.can` | A1 |
| (Question words) | `g.questions` | A1 |
| Past Simple | `g.past-simple` | A2 |
| Past Continuous | `g.past-continuous` | A2 |
| Future forms: Going to | `g.going-to` | A2 |
| Future forms: Will | `g.will` | A2 |
| Comparatives | `g.comparatives` | A2 |
| Superlatives | `g.superlatives` | A2 |
| (Countable / uncountable) | `g.quantifiers` | A2 |
| Modals (obligation/advice) | `g.modals-obligation` | A2 |
| Present Perfect (experiences) | `g.present-perfect` | A2 |
| Conjunctions | `g.conjunctions` | A2 |
| Present Perfect (for/since/yet) | `g.present-perfect-2` | B1 |
| Present Perfect Continuous | `g.present-perfect-continuous` | B1 |
| Past Perfect | `g.past-perfect` | B1 |
| Conditionals (1st) | `g.first-conditional` | B1 |
| Conditionals (2nd) | `g.second-conditional` | B1 |
| (Used to) | `g.used-to` | B1 |
| Passive Voice | `g.passive` | B1 |
| Relative Clauses | `g.relative-clauses` | B1 |
| Gerunds / Infinitives | `g.gerunds-infinitives` | B1 |
| Phrasal Verbs | `g.phrasal-verbs` | B1 |
| Reported Speech | `g.reported-speech` | B2 |
| Advanced Conditionals (3rd) | `g.third-conditional` | B2 |
| (Wish) | `g.wish` | B2 |
| (Modals of deduction) | `g.modals-deduction` | B2 |
| (Linking: contrast) | `g.linking` | B2 |
| (Causative) | `g.causative` | B2 |
| Inversion | `g.inversion` | C1 |
| Advanced Conditionals (mixed) | `g.mixed-conditionals` | C1 |
| (Cleft sentences) | `g.cleft` | C1 |
| (Participle clauses) | `g.participle-clauses` | C1 |
| Academic Structures | `g.academic` | C2 |
| Advanced Writing Structures | `g.advanced-writing` | C2 |
| (Formal subjunctive) | `g.subjunctive` | C2 |

## 4. Explicaciones según nivel (sección 22)

Cada tema tiene `rule.es` y `rule.en`, `simple` (Explain More Simply) y ejemplos extra (More Examples). Modo de explicación automático: A1–A2 → español (con términos clave en inglés), B1 → inglés + español, B2+ → inglés. Configurable en Settings. En **Immersion Mode** (sección 105) se ocultan traducciones y aparecen con "Show translation".

## 5. Ítems de ejercicio y contexto

Cada ítem de gramática: frase con hueco, respuesta, distractores, **contexto** y traducción al español. Un mismo ítem genera 6 tipos de ejercicio: elegir, escribir el hueco, ordenar palabras, traducir ES→EN, decirlo en voz alta, corregir el error. Contextos: `daily`, `travel`, `work`, `meeting`, `report`, `eng`, `qa`, `hr`, `law`, `biz`, `oil`.

## 6. Vocabulario (secciones 17–20, 143, 153)

Cada palabra: word, IPA, audio (TTS), traducción, definición en inglés, ejemplo, imagen (emoji), sinónimo, antónimo, nivel CEFR, frecuencia (1 = muy frecuente, 3 = especializada), tema, uso profesional y variante británica/americana cuando aplica.

Categorías generales (sección 18): Family, Home, Food, Travel, Work, University, Nature, Technology, Business, Meetings, Health, Sports, Transportation, Emotions, Social English, Shopping, Weather, Time, Clothes, Numbers & basics.
Bancos especializados (secciones 18, 50–58, 153): Engineering, Oil & Gas, Energy, QA/QC, Human Resources, Law, Finance, Medicine, Technology, Project Management, HSE, Procurement, Auditing.

Prioridad por frecuencia (sección 143): las lecciones y repasos introducen primero palabras de frecuencia 1; el vocabulario especializado se desbloquea en las rutas profesionales (recomendadas desde A2).

## 7. Rutas profesionales (secciones 45–90)

| Ruta | Módulos | Personaje | Role plays |
|------|---------|-----------|------------|
| Business English | Meetings · Emails · Presentations · Negotiations · Phone calls · Reports · Networking · Leadership · Problem solving · Decision making · Project updates | Sofia, Mike | Meeting, Supplier meeting, Salary negotiation |
| Meeting English | Opening · Opinions · Agreeing · Disagreeing politely · Interrupting · Clarifying · Summarizing · Actions · Closing | Mike | Project meeting |
| Presentation Coach | Opening · Agenda · Transitions · Charts · Emphasis · Q&A · Closing (práctica por voz) | Sofia | Presentation practice |
| Negotiation | Commercial · Salary · Supplier · Contract · Technical | Sofia, Emma | Supplier / salary negotiation |
| Engineering | Equipment, maintenance, inspection, design, operations, drawings, specifications, failure, testing, installation, commissioning, risk, safety, quality | Alex | Client asks about equipment failure; Engineer + Supervisor |
| Oil & Gas | Drilling, production, well, rig, pipeline, flowline, pressure, valve, pump, corrosion, shutdown, commissioning… | Alex | Shutdown report |
| QA/QC | Inspection, QA/QC, NCR, CAPA, ITP, hold/witness point, MTR, traceability… | Daniel | Client asks why an inspection was rejected; Inspector + Supplier |
| Audit English | Opening meeting · Questions · Evidence · Findings · Observations · Nonconformities · CAPA · Closing meeting | Daniel | Auditor + Employee |
| Energy | Renewables, solar, wind, hydro, geothermal, efficiency, storage, grid, generation, transmission, sustainability | Alex | — |
| English for HR | Recruitment · Onboarding · Performance · Employee relations · Policies · Compensation & benefits · L&D · HR emails | Sarah | Leave clarification; Employee complaint; Candidate interview |
| Legal English | Vocabulario jurídico · sistemas legales · contratos · Clause Trainer · Plain English · Legal writing · Litigation · Corporate · Labor · Compliance | Emma | Supplier requests changes to contract |
| HR & Employment Law | Combinación HR + Legal: terminación, investigación, disciplinario, confidencialidad, renuncia | Sarah + Emma | Disciplinary meeting |
| Career Coach | CV verbs · LinkedIn · Interview · Networking | Sofia | AI Job Interview |

**Aviso (sección 168)**: las rutas de Law, Medicine y Finance enseñan idioma; no sustituyen asesoramiento profesional. El aviso aparece en la cabecera de esas rutas y en el prompt de la IA.

## 8. Lecturas (sección 40)

A1 textos muy cortos · A2 historias cortas · B1 artículos · B2 contenido profesional · C1 material académico · C2 textos complejos. Todas con Smart Reading (tocar palabra → definición, traducción, pronunciación, audio, ejemplo, añadir a vocabulario) y preguntas de comprensión.

## 9. Calidad de contenido (sección 167)

`tests/content.test.mjs` valida automáticamente: cada respuesta encaja en su hueco, los distractores son distintos de la respuesta, cada tema tiene reglas en español e inglés, los niveles CEFR son válidos, los ids son únicos, cada unidad del currículo referencia temas existentes, las palabras tienen traducción/ejemplo y el ejemplo contiene la palabra. La revisión de "natural English" y adecuación profesional es editorial (checklist en `docs/08-mvp-y-fases.md`).
