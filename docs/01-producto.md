# 01 · Diseño de producto (Fase 1)

> Respuesta a los puntos 1–3 y 189.1 del Prompt Maestro. Nombre de trabajo de la app: **Inglés Práctico** (en la interfaz: *Inglés Práctico · Your AI English Coach*).

## 1. Análisis del documento

El Prompt Maestro describe 190 secciones. Agrupadas por responsabilidad, se reducen a **9 sistemas**:

| # | Sistema | Secciones del prompt |
|---|---------|----------------------|
| 1 | Perfil y onboarding | 4–7, 85–86, 139, 172–173 |
| 2 | **My English Brain** (modelo del estudiante) | 1, 8–11, 14, 136, 145, 154–155, 165, 185 |
| 3 | Motor de aprendizaje (adaptativo + SRS + plan diario) | 10–13, 98–100, 137, 150–151, 160, 164 |
| 4 | Contenido (currículo A1–C2, gramática, vocabulario, lectura, audio) | 3, 15–22, 40, 44, 103–111, 143–147, 167 |
| 5 | Corrección y tutor | 23–27, 34, 43, 133, 161–163 |
| 6 | Speaking (conversación, role play, pronunciación, shadowing) | 28–39, 59–62, 91–92, 114, 140–142, 149 |
| 7 | Inglés profesional | 45–90, 135, 152–153, 168, 186 |
| 8 | Gamificación y motivación | 93–97, 134, 138, 156 |
| 9 | Plataforma (UI, accesibilidad, privacidad, offline, datos, backend, CMS, pagos, analítica, futuro) | 117–132, 157–159, 169–184 |

La conclusión central: **el corazón del producto no es el contenido sino el modelo del estudiante (My English Brain)**. Todo lo demás (plan diario, repasos, recomendaciones, conversaciones, ejemplos profesionales) *lee* de ese modelo y *escribe* en él.

```
          ┌──────────── escribe evidencias ────────────┐
          │                                            │
  Lecciones · Práctica · Conversación · Pronunciación · Exámenes
          ▲                                            │
          │ decide qué mostrar                         ▼
   Motor de decisión diaria ◄──── lee ──── MY ENGLISH BRAIN
   (planner + SRS + olvido)                (dominio por concepto)
```

## 2. Usuarios objetivo

| Persona | Perfil | Necesidad principal | Ruta sugerida |
|---------|--------|---------------------|---------------|
| **Lucía, 34, ingeniera QA/QC** (Ecuador) | Nivel A2 real, lee especificaciones pero no habla | Reuniones con proveedores, reportes de inspección, auditorías | General A2→B1 + Engineering + QA/QC + Oil & Gas |
| **Andrés, 41, jefe de RR. HH.** | B1 de lectura, A2 de speaking | Entrevistas, onboarding, emails a casa matriz | General + HR + HR & Employment Law |
| **Valeria, 29, abogada corporativa** | B1 | Revisar contratos en inglés, llamadas con clientes | Legal English + Contracts + Compliance |
| **Diego, 19, universitario** | A1, principiante total | Aprobar un examen, viajar | General A1→B1 + Travel + (luego) IELTS |
| **Rosa, 55, viajera** | Principiante | Sobrevivir en aeropuertos, hoteles, restaurantes | A1–A2 + Travel + Real Life Mode |

Idioma nativo prioritario: **español** (falsos amigos, errores típicos de hispanohablantes). La arquitectura admite otros idiomas nativos (campo `native_language`), pero el contenido explicativo del MVP está en español.

## 3. Propuesta de valor

> **"Esta aplicación sabe exactamente qué necesito estudiar."**

1. **Sabe lo que sabes**: cada concepto tiene un % de dominio *real* (no XP) con fecha de última práctica, contextos vistos y producción activa.
2. **Sabe lo que olvidas**: estima la caída de cada concepto con el tiempo y lo repasa justo antes de perderlo.
3. **Decide por ti**: cada día arma un plan del tamaño exacto de tu tiempo disponible.
4. **Corrige explicando**: nunca solo "Wrong"; explica qué pasó, por qué, la regla y te da dos ejercicios nuevos.
5. **Te hace hablar**: todo ejercicio importante tiene opción de micrófono; conversaciones y role plays con personajes.
6. **Habla tu profesión**: los ejemplos de gramática se adaptan a tu área (ingeniería, QA/QC, RR. HH., derecho…), y puedes combinar varias rutas.

## 4. Metodología de aprendizaje

Ciclo central (se refleja en la estructura de cada lección y en la navegación):

**LEARN → PRACTICE → SPEAK → MAKE MISTAKES → UNDERSTAND → REVIEW → IMPROVE → MASTER**

| Principio | Cómo se implementa |
|-----------|--------------------|
| Active Recall | Las tarjetas muestran primero la imagen/situación y piden la palabra; la respuesta aparece solo después de intentar (con pistas progresivas). |
| Spaced Repetition | Algoritmo de escalera 1-3-7-15-30-60 días con factor de facilidad (ver `04-motor-aprendizaje.md`). |
| Comprehensible Input | Textos y audios por nivel CEFR, con lectura inteligente (tocar palabra → definición). |
| Shadowing | Modo Listen → Read → Repeat → Compare → Repeat without text. |
| Microlearning | Lecciones de 3–15 min, bloques de 3–10 min en el plan diario. |
| Retrieval Practice | Ejercicios de producción (escribir/decir) antes que reconocimiento. |
| Interleaving | Los repasos mezclan temas; Smart Review nunca es de un solo tema. |
| Contextual Learning | Cada ítem de gramática tiene contexto (viaje, trabajo, reunión, reporte, profesión); los repasos rotan contextos (sección 151). |
| Grammar in Context | Orden fijo en lecciones: **situación → ejemplos → regla → práctica** (sección 144). |
| Adaptive / Personalized | El planner lee el Brain; ejemplos según profesión; dificultad según controles del usuario ("Too easy", "Too difficult"…). |
| Gamification sana | XP, rachas, insignias; sin vidas; el nivel CEFR depende solo del dominio real (sección 165). |

Referencias conceptuales (sin copiar contenido): CEFR/MCER como marco de niveles; la secuencia de gramática sigue el orden habitual de los libros de referencia (Essential/English Grammar in Use, English File, Headway); los formatos de examen (IELTS, TOEFL, Cambridge, TOEIC) solo inspiran tipos de tarea. **Todo el contenido de la app es original.**

## 5. User journey (alto nivel)

```
Descubre la app ─► Abre (sin registro obligatorio: modo invitado)
  ─► Onboarding de 6 preguntas (1 por pantalla)
  ─► ¿Principiante total? ── sí ─► A1 directo
                           └ no ─► Prueba de nivel adaptativa (8–12 min)
  ─► Resultado: nivel general + nivel por habilidad + Brain inicializado
  ─► Primera lección recomendada (3–8 min)  ◄── "This is what you should learn today"
  ─► Primer éxito: XP, racha día 1, primera insignia
  ─► Día 2–7: experiencia de primera semana (sección 139)
  ─► Uso diario: Home ▸ Today's Plan ▸ Start (el plan dura exactamente lo elegido)
  ─► Semanal: Weekly Report + Weekly Assessment ─► ajuste de ruta
  ─► Mensual: Monthly Report + reevaluación de nivel (sección 166)
```

El detalle pantalla a pantalla está en `03-ux.md`.

## 6. Feature map

Leyenda de estado en el MVP entregado en este repositorio: ✅ implementado · 🟡 implementado parcialmente / versión local · 🔜 fase futura (con justificación en `08-mvp-y-fases.md`).

| Área | Funciones | Estado |
|------|-----------|--------|
| Onboarding | 6 preguntas, profesiones primaria/secundaria/adicionales, "My profession is…" | ✅ |
| Nivel | Prueba adaptativa (gramática, vocabulario, lectura, listening, writing, speaking/pronunciación), niveles por habilidad, reevaluación | ✅ |
| Brain | Dominio por concepto, estados NEW→MASTERED, olvido inteligente, mapa de conocimiento, radar | ✅ |
| Motor | Plan diario, recomendaciones, Smart Review, SRS, detección de patrones de error, controles del usuario | ✅ |
| Contenido | A1–B1 completo; B2–C2 con temas y ejercicios de muestra; vocabulario general y profesional; lecturas A1–C2 | ✅ / 🟡 (B2–C2 menos denso) |
| Tutor | Corrección explicada local (reglas), Ask My Teacher local, IA opcional (Claude) | ✅ |
| Speaking | Role plays guiados, Real Life Mode, HELP de 4 niveles, evaluación, "Better way to say it", voz (STT/TTS), entrevista (modo candidato) | ✅ |
| Pronunciación | Sonidos problemáticos, pares mínimos, velocidades 0.5–1.25x, shadowing | ✅ (análisis por reconocimiento de voz, no fonético) |
| Profesional | Business, Meetings, Presentations, Emails, Negotiation, Engineering, Oil & Gas, QA/QC, Audit, Energy, HR (todas sus subrutas), Legal (contratos, Plain English, litigation, corporate, labor, compliance), Career (CV, LinkedIn) | ✅ vocabulario + expresiones + role plays |
| Gamificación | XP, monedas, estrellas, niveles, racha con protector, insignias, reto diario, misión semanal, 8 minijuegos | ✅ |
| Reportes | Semanal y mensual con gráficas | ✅ |
| Plataforma | PWA offline, modo oscuro/claro/sistema, accesibilidad, privacidad, búsqueda, favoritos, notas, paquetes de contenido JSON | ✅ |
| Cuenta en la nube, pagos, profesores en vivo, clases grupales, modo corporativo, dashboard docente, notificaciones push, certificaciones completas | 🔜 |
