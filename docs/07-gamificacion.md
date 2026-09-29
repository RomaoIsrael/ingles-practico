# 07 · Gamificación y motivación

> Puntos 93–97, 134, 138, 142, 156 y 189.14. Implementación: `js/engine/gamification.js`.

## Principios

1. **Aprender es el objetivo**; las recompensas acompañan (sección 138). El nivel CEFR nunca se compra con XP.
2. **Sin vidas ni bloqueos** (sección 97): equivocarse da XP de esfuerzo (1 XP) y abre una explicación.
3. **Feedback adulto y motivador** (sección 134): "Great improvement.", "You're getting more accurate.", "Let's reinforce this one more time." — nunca mensajes infantiles.

## Economía

| Elemento | Regla |
|----------|-------|
| **XP** | +10 acierto de producción (escribir/decir), +6 acierto de reconocimiento, +1 intento fallido, +20 lección completada, +5 palabra repasada, +2 por minuto de speaking |
| **Nivel de jugador** | nivel n requiere `50·n·(n+1)` XP acumulados (independiente del CEFR) |
| **Monedas** | 1 por cada 10 XP; se usan para comprar **protectores de racha** (50 monedas) |
| **Estrellas** | por lección: ★ completar · ★★ ≥ 70 % · ★★★ ≥ 90 % |
| **Racha** | días consecutivos con ≥ 1 actividad; 1 protector gratis por semana cubre un día perdido |
| **Reto diario** | 1 al día, elegido de forma determinista por fecha (Learn 10 words · Speak for 5 minutes · Practice 3 sounds · Complete one grammar lesson · Review 20 words · Read one text · Write 5 sentences) |
| **Misión semanal** | 5 misiones de lunes a domingo (Speak 30 min · Learn 50 words · Complete 5 lessons · Read 3 stories · Write 2 emails) |

## Insignias (sección 156)

First Lesson · First Conversation · 100 Words · 500 Words · 1000 Words · 7-Day Streak · 30-Day Streak · 30 Minutes Speaking · 5 Hours Speaking · First Professional Meeting · First Email · Placement Done · A2 Reached · B1 Reached · B2 Reached · Mistake Hunter (10 errores corregidos) · Perfect Lesson (100 %) · Night Owl / Early Bird · Pronunciation Pro (90 % en un sonido) · Grammar Master (primer concepto MASTERED).

## Minijuegos (sección 93)

| Juego | Mecánica | Concepto que alimenta |
|-------|----------|-----------------------|
| Word Match | Emparejar inglés–español contra reloj | `v.*` |
| Sentence Builder | Ordenar palabras | `g.*` |
| Listening Challenge | Oír una frase y elegir cuál fue | `sk.listening` |
| Vocabulary Race | 60 s de opción múltiple rápida | `v.*` |
| Grammar Puzzle | Completar huecos de temas mezclados (interleaving) | `g.*` |
| Pronunciation Challenge | Decir palabras difíciles con el micrófono | `pr.*` |
| Word Detective | Encontrar la frase con el error | `g.*`, patrones |
| Memory Vocabulary | Parejas de cartas (palabra ↔ emoji) | `v.*` |

Todas las respuestas de los juegos también escriben evidencias en el Brain: jugar es practicar.

## Notificaciones (sección 124)

Máximo 1 aviso al día, solo si el usuario los activa: "Your 5-minute English lesson is ready.", "You have 12 words ready for review.", "You're close to reaching B2." En la Etapa A se muestran dentro de la app al abrirla (y como notificación del sistema si se concedió permiso); en la Etapa B, notificaciones push programadas.
