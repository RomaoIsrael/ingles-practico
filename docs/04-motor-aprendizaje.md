# 04 · My English Brain y motor de aprendizaje adaptativo

> Puntos 1, 7–14, 98–100, 136–137, 145, 150–151, 154–155, 164–166, 189.6, 189.9 y 189.10.
> Implementación: `js/engine/brain.js`, `srs.js`, `planner.js`, `placement.js`, `errors.js`, `grader.js`. Pruebas: `tests/`.

## 1. Las tres preguntas

| Pregunta | Quién responde | Dato |
|----------|----------------|------|
| ¿Qué sabe el estudiante? | `brain.current(skill)` | Dominio estimado *hoy* (0–100 %) por concepto |
| ¿Qué está olvidando? | `brain.forgetting()` + `srs.due()` | Conceptos con caída ≥ 10 puntos; palabras vencidas |
| ¿Qué debería aprender ahora? | `planner.buildPlan()` | Bloques priorizados que caben en el tiempo del día |

## 2. Arquitectura de MY ENGLISH BRAIN

### 2.1 Conceptos (nodos)

Cada **concepto** tiene un id con prefijo por categoría:

| Prefijo | Categoría (Knowledge Map) | Ejemplos |
|---------|---------------------------|----------|
| `g.` | Grammar | `g.present-simple`, `g.present-perfect`, `g.prepositions-time` |
| `v.` | Vocabulary (por tema) | `v.food`, `v.travel`, `v.meetings` |
| `sk.` | Habilidades | `sk.speaking`, `sk.listening`, `sk.reading`, `sk.writing` |
| `pr.` | Pronunciation | `pr.th`, `pr.r`, `pr.vb`, `pr.ed`, `pr.s`, `pr.vowels`, `pr.connected` |
| `p.` | Professional English | `p.engineering`, `p.qaqc`, `p.hr`, `p.law`, `p.oilgas`, `p.energy` |
| `b.` | Business English | `b.meetings`, `b.emails`, `b.presentations`, `b.negotiation` |

### 2.2 Registro por concepto

```js
skills["g.present-perfect"] = {
  m: 0.84,          // dominio en el último momento de práctica (0..1)
  n: 23,            // intentos
  c: 19,            // aciertos
  first: 1727000000000, last: 1727600000000,  // timestamps
  stab: 6.5,        // estabilidad de memoria en días (cuánto tarda en caer)
  ctx: ["work","meeting","travel"],  // contextos donde acertó
  days: ["2026-09-10","2026-09-14"], // días distintos con acierto
  prod: true,       // lo produjo activamente (escribió/dijo una frase propia)
  hist: [[t, m], …] // historial compacto para tendencias y gráficas
}
```

### 2.3 Actualización tras cada evidencia

Entrada: `score` ∈ [0,1] (1 acierto, 0 error, 0.5 con pista o errata), tiempo de respuesta, contexto, tipo (reconocer vs producir).

```
cur   = current(skill, ahora)                    // dominio estimado tras el olvido
q     = score · (lento ? 0.85 : 1)                // respuestas muy lentas cuentan menos
α     = max(0.12, 0.45 / √(n+1))                  // aprende rápido al principio, estable después
m'    = cur + α · (q − cur)
stab' = q ≥ 0.8 ? min(365, stab · (hueco ≥ 1 día ? 2.2 : 1.25))
                : max(0.7, stab · 0.55)
```

Así, acertar tras varios días (recuperación espaciada) aumenta mucho la estabilidad; acertar varias veces seguidas en la misma sesión apenas la mueve.

### 2.4 Olvido inteligente (sección 11)

Retención estimada con curva exponencial (misma familia que FSRS): `R = 0.9^(días / stab)` (R = 90 % cuando han pasado `stab` días).

```
current = m · (0.5 + 0.5 · R)
```

El piso de 0.5 refleja que lo aprendido no se pierde del todo. Ejemplo de la sección 11: Present Perfect, m = 84 %, stab = 4 días, 16 días sin practicar → R = 0.9⁴ = 0.66 → current = 84 % × 0.83 = **70 %** → recomendación "5-minute review". La alerta aparece cuando `m − current ≥ 0.10` y `m ≥ 0.5`.

### 2.5 Estados de dominio (sección 14)

| Estado | Condición |
|--------|-----------|
| **NEW** | `n = 0` |
| **LEARNING** | current < 45 % |
| **PRACTICING** | 45 % ≤ current < 70 % |
| **STRONG** | current ≥ 70 % pero sin verificación completa |
| **MASTERED** | current ≥ 88 % **y** acertado en ≥ 3 contextos **y** en ≥ 2 días separados por ≥ 2 días **y** producido activamente |

"Una respuesta correcta no significa dominio": para MASTERED se exige acierto inmediato, en otro contexto, días después y en producción (conversación/escritura/mini challenge).

### 2.6 Knowledge Map (sección 9)

Mapeo de estados a cubetas visuales: NEW → **New**; current < 45 % con intentos → **Weak**; LEARNING/PRACTICING → **Learning**; STRONG → **Strong**; MASTERED → **Mastered**.

### 2.7 Habilidades agregadas y radar (sección 155)

`sk.*` se alimentan de actividades específicas (conversación → speaking; dictado → listening…). El radar muestra 7 ejes: Speaking, Listening, Reading, Writing, Vocabulary (media de `v.*` + % de palabras dominadas), Grammar (media de `g.*` del nivel actual y anteriores), Pronunciation (media de `pr.*`).

### 2.8 Nivel CEFR real (secciones 165–166)

El nivel **no sube por XP**. Para cada nivel L se calcula la *cobertura*: media del `current` de los conceptos de gramática y vocabulario de L (los no practicados cuentan 0). Cuando la cobertura del nivel actual ≥ 70 %, se desbloquea el **examen de nivel**; aprobarlo (≥ 70 %) sube el nivel. Cada 30 días se ofrece una **reevaluación**. Los niveles por habilidad se estiman con la misma cobertura por habilidad.

### 2.9 Memoria de patrones de error (secciones 136, 145)

`errors.js` detecta patrones (third-person-s, artículos, preposiciones de tiempo, tiempos verbales, orden de palabras, falsos amigos, incontables…). Cada detección:
1. se guarda en **My Mistakes** (original, corrección, explicación, categoría),
2. incrementa `patterns[id]` (memoria educativa),
3. penaliza el concepto de gramática asociado,
4. genera 2 ejercicios del tema relacionado (sección 25).

El planner incluye un bloque "Fix your mistakes" cuando un patrón aparece ≥ 2 veces en 7 días, y el resumen enviado a la IA incluye los patrones más frecuentes.

## 3. Repetición espaciada (sección 12)

Escalera base de intervalos: **1 · 3 · 7 · 15 · 30 · 60 días**, luego ×2 × facilidad.

| Respuesta | Efecto |
|-----------|--------|
| Again (no la recordé) | vuelve al peldaño 0; repaso en 10 min dentro de la sesión; facilidad −0.15 (mín. 0.7); `lapses++` |
| Hard | se queda en el peldaño; intervalo × 0.6 |
| Good | sube 1 peldaño |
| Easy | sube 2 peldaños; facilidad +0.1 (máx. 1.4) |

`intervalo = round(escalera[peldaño] × facilidad)` (mínimo 1 día). La calificación se infiere automáticamente del ejercicio (acierto sin pista y rápido = Good/Easy; con pista = Hard; error = Again), así el estudiante no tiene que autoevaluarse.

Estados de palabra (sección 20): **NEW** (sin repasos) · **LEARNING** (peldaño 0–1) · **REVIEW** (peldaño 2–4) · **MASTERED** (peldaño ≥ 5, es decir, intervalo ≥ 60 días). **Forgotten** = última respuesta "Again" o vencida hace más del doble de su intervalo.

## 4. Active recall (sección 13)

Orden en tarjetas de vocabulario: imagen/situación → "What is this?" → intento → pistas progresivas (1ª letra · número de letras · traducción) → respuesta. Cada pista reduce la calificación SRS.

## 5. Motor de decisión diaria (secciones 98–100, 150)

Entradas: nivel, habilidades débiles, conceptos olvidándose, errores recientes, palabras vencidas, tiempo disponible, profesión, objetivo, día de la primera semana.

Candidatos y prioridad:

| Bloque | Prioridad base | Condición |
|--------|----------------|-----------|
| Vocabulary review (SRS) | 100 + vencidas | hay palabras vencidas |
| Forgotten concept review | 85 + caída × 100 | alerta de olvido |
| Fix your mistakes | 78 | patrón ≥ 2 veces / 7 días |
| New lesson (siguiente de la ruta) | 72 | siempre |
| Speaking | 60 + déficit | < 10 min hablados en 7 días |
| Weakest skill (radar) | 55 | habilidad más baja |
| Professional English | 45 (A2+) | hay profesión elegida |
| Pronunciation | 40 | pronunciación < 60 % |

Luego se asignan minutos (3–10 por bloque) hasta completar el tiempo elegido, garantizando **variedad** (máx. 1 bloque por tipo, al menos una actividad de producción si el tiempo ≥ 10 min). Resultado: *Today's Plan* con minutos por bloque y total.

**Primera semana (sección 139)** sustituye la plantilla: D1 evaluación · D2 vocabulario + speaking · D3 gramática · D4 listening · D5 conversación real · D6 repaso · D7 evaluación semanal.

**Recomendación del coach (sección 99)**: se comparan tendencias de 7 días de cada concepto (`hist`) para generar frases como *"You are improving in vocabulary, but your Present Perfect accuracy has decreased."* seguidas de los bloques recomendados.

## 6. Adaptación de dificultad (secciones 10, 137)

- Dentro de un ejercicio: tras 2 errores seguidos se pasa a formato de reconocimiento (opción múltiple); tras 3 aciertos rápidos, a producción (escribir/decir).
- Controles del usuario al final de cada lección: **Too easy** (salta a producción y sube 1 paso el tema siguiente), **Too difficult** (más ejemplos, más reconocimiento, explicación simplificada), **I already know this** (mini prueba de 3 preguntas; si aprueba, el concepto pasa a STRONG), **Explain again**, **Practice more**, **Skip**.

## 7. Repaso contextual (sección 151)

Cada ítem de gramática tiene contexto (`travel`, `work`, `meeting`, `report`, `daily`, `eng`, `hr`, `law`, `qa`, `biz`…). Al repasar un concepto el generador elige primero ítems de contextos **no usados recientemente** y, si hay profesión, prioriza los contextos profesionales del usuario (sección 135).

## 8. Prueba de nivel (sección 7)

Algoritmo en escalera: empieza en A2; cada acierto sube un nivel, cada fallo baja (A1–C1). Se alternan habilidades (gramática, vocabulario, lectura, listening) hasta ~12 ítems. Nivel por habilidad = nivel más alto con ≥ 2/3 de aciertos (mínimo A1). Writing: frase libre evaluada por longitud, variedad de tiempos, conectores y tasa de errores. Speaking/pronunciación: lectura de 2 frases con reconocimiento de voz (opcional). Nivel general = mediana de habilidades. El Brain se inicializa dando dominio previo (60 %, estado STRONG sin verificar) a la gramática de niveles inferiores.
