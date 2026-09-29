# Inglés Práctico · Your AI English Coach 🌟

App para aprender inglés desde A1 hasta C2 que funciona como un profesor personal: sabe lo que sabes (**My English Brain**), detecta lo que estás olvidando y te dice cada día *"This is what you should learn today"*.

**Abrir la app:** https://romaoisrael.github.io/ingles-practico/ (después de activar GitHub Pages, ver abajo)

## Qué incluye

- **Onboarding + prueba de nivel adaptativa**: gramática, vocabulario, lectura, listening, writing y speaking, con un nivel por cada habilidad.
- **My English Brain**: dominio real de cada concepto (NEW → MASTERED), olvido inteligente, Knowledge Map y radar de habilidades. El nivel CEFR sube por dominio comprobado, no por XP.
- **Plan diario** del tamaño de tu tiempo (5–60 min), recomendaciones del coach y Smart Review.
- **Currículo A1–C2**: 45 temas de gramática con apuntes completos, 538 palabras (Starter + generales + 13 bancos profesionales), 41 unidades con examen, 13 lecturas y 25 conversaciones.
- **Corrección explicada**: 54 reglas para errores típicos de hispanohablantes, que explican qué pasó, por qué, la forma correcta y te dan ejercicios nuevos. Todo se guarda en *My Mistakes*.
- **Speaking**: role plays con personajes, Real Life/Story Mode, HELP en 4 niveles, evaluación, "Better way to say it", entrevista de trabajo (modos candidato y reclutador), pronunciación, shadowing y modo manos libres.
- **Inglés profesional**: Business, Meetings, Presentations, Negotiation, Engineering, Oil & Gas, QA/QC, Audit, Energy, HR, Legal (Clause Trainer, Plain English), HR & Employment Law, Finance, Medicine, Tech, Procurement y Career (CV, LinkedIn, STAR).
- **Gamificación sana**: XP, monedas, estrellas, racha con protector, 21 insignias, reto diario, misión semanal y 8 minijuegos. No hay vidas ni bloqueos.
- **Plataforma**: PWA que funciona sin conexión, modo claro/oscuro/sistema, accesibilidad (tamaño de texto, alto contraste, animaciones reducidas), privacidad (exportar y borrar datos), búsqueda, favoritos, notas y paquetes de contenido JSON (CMS ligero).
- **IA opcional (Claude)**: conversación libre, versiones natural y profesional de tus textos, explicaciones abiertas, Document Lab y fotos. Sin IA la app funciona completa. La clave API la pones tú en Ajustes y solo se guarda en tu dispositivo.

## Novedades v0.2 · curso completo desde cero

- **Nivel Starter (desde cero):** alfabeto y deletreo, saludos e inglés de supervivencia, números, colores, días y meses, y tus primeras 100 palabras (cuerpo, animales, trabajos, lugares, verbos básicos).
- **Gramática explicada a fondo:** los 45 temas tienen apuntes por secciones: qué es, tabla de la forma (afirmativo/negativo/pregunta/respuestas cortas), cuándo se usa (con audio), ortografía, palabras señal, errores comunes, comparación con el español y trucos para recordar. Se pueden imprimir.
- **Lecciones paso a paso (diapositivas):** situación → ejemplos → regla → usos → errores y trucos → práctica → habla → reto.
- **Unidades ampliadas:** cada unidad muestra sus objetivos ("Al terminar podrás…"), qué vas a estudiar, frases útiles y termina con un **examen de unidad** (aprobado ≥ 70 %).
- **Instrucciones claras** en cada ejercicio y actividad, con ejemplo, y una caja "📝 Cómo se hace" en cada sección.
- **Test Center:** test de nivel tipo **EF SET** (Reading + Listening adaptativos, puntuación 0–100 y nivel CEFR), tests por nivel tipo **GoFluent** (gramática, vocabulario y situaciones de trabajo), test de inglés de negocios, prueba rápida, exámenes de unidad, historial y certificado imprimible.
- **Temario:** el curso organizado como una materia de estudio, nivel por nivel, con objetivos, gramática, vocabulario, frases, habilidades y evaluación de cada unidad.

## Documentación de diseño

Empieza por [`docs/00-indice.md`](docs/00-indice.md). Ahí están la arquitectura, el sitemap, los flujos, el algoritmo del Brain y de repetición espaciada, el modelo de datos (`docs/schema.sql`) y la tabla que muestra el estado de cada una de las 190 secciones del documento original: qué está hecho y qué queda para después, y por qué.

## Desarrollo

No hay paso de compilación: son HTML, CSS y módulos ES.

```bash
npm start            # servidor local en http://localhost:8080
npm test             # pruebas del motor y validación de contenido (node --test)
npm run smoke        # recorrido completo en navegador (requiere Playwright y el servidor)
npm run sw           # regenera sw.js tras añadir o renombrar archivos
```

Estructura: `js/engine/` (motor puro y testeable), `js/content/` (contenido original), `js/ui/` (pantallas), `js/services/` (voz, IA, tutor) y `docs/`.

## Publicar en GitHub Pages

En GitHub, entra a **Settings → Pages**. En *Deploy from a branch*, elige la rama y la carpeta `/ (root)`.

---
Todo el contenido es original, inspirado en buenas prácticas pedagógicas. No copia libros ni exámenes oficiales. Las rutas de Law, Medicine y Finance enseñan el idioma y no son asesoramiento profesional.
