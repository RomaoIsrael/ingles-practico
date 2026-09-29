// Preparación de exámenes internacionales (sección 103). Se describen los FORMATOS públicos de cada examen
// y se ofrecen ejercicios ORIGINALES en ese formato. No es material oficial ni lo reemplaza.

const TFNG_PASSAGE = "Solar panels convert sunlight into electricity. The first practical solar cell was built in 1954 and had an efficiency of about 6%. Modern commercial panels typically reach efficiencies of 18–22%. Although prices have fallen dramatically over the last decade, installation costs still vary widely between countries.";

export const EXAMS = [
  {
    id: "ielts", name: "IELTS", icon: "🇬🇧", levels: "B1–C2 (bandas 1–9)", who: "Estudios universitarios, migración y trabajo (Reino Unido, Australia, Canadá…).",
    format: [["Listening", "30 min (4 partes, 40 preguntas)", "Conversaciones y monólogos: completar formularios, opción múltiple, mapas."], ["Reading", "60 min (3 textos, 40 preguntas)", "True / False / Not Given, emparejar encabezados, completar frases."], ["Writing", "60 min (2 tareas)", "Task 1: describir un gráfico (Academic) o escribir una carta (General). Task 2: ensayo de opinión (250 palabras)."], ["Speaking", "11–14 min (3 partes)", "Part 1: preguntas personales. Part 2: hablar 2 min sobre una tarjeta. Part 3: discusión abstracta."]],
    scale: "Banda 5 ≈ B1 · 6–6.5 ≈ B2 · 7–8 ≈ C1 · 8.5–9 ≈ C2",
    tips: ["En Task 2 responde exactamente a la pregunta y da tu opinión clara en la introducción.", "Usa párrafos: introducción, 2 párrafos de desarrollo con ejemplos, conclusión.", "En Speaking Part 2 usa el minuto de preparación para anotar 4–5 palabras clave (qué, cuándo, dónde, por qué, cómo te sentiste).", "True / False / Not Given: 'Not Given' significa que el texto no dice nada al respecto; no uses tu conocimiento general.", "Controla el tiempo: 20 min para Task 1 y 40 min para Task 2."],
    practice: {
      choose: [
        { passage: TFNG_PASSAGE, prompt: "The first practical solar cell was built in 1954.", options: ["True", "False", "Not Given"], answer: "True", section: "Reading · T/F/NG" },
        { passage: TFNG_PASSAGE, prompt: "The first solar cell had an efficiency of 18%.", options: ["True", "False", "Not Given"], answer: "False", section: "Reading · T/F/NG" },
        { passage: TFNG_PASSAGE, prompt: "Germany has the cheapest installation costs in the world.", options: ["True", "False", "Not Given"], answer: "Not Given", section: "Reading · T/F/NG" },
        { passage: TFNG_PASSAGE, prompt: "Solar panel prices have decreased in recent years.", options: ["True", "False", "Not Given"], answer: "True", section: "Reading · T/F/NG" },
        { prompt: "Choose the best linking word for an IELTS essay: “___, some people argue that remote work harms teamwork.”", options: ["On the other hand", "Because", "So"], answer: "On the other hand", section: "Writing · cohesion" },
        { prompt: "Which sentence best describes a graph trend?", options: ["The number of users rose steadily between 2015 and 2020.", "The users were many in 2020.", "It was up a lot."], answer: "The number of users rose steadily between 2015 and 2020.", section: "Writing Task 1" },
        { prompt: "Which is the most appropriate way to give an opinion in Task 2?", options: ["I strongly believe that governments should invest more in public transport.", "I think maybe it's good, I don't know.", "Everybody knows it's true."], answer: "I strongly believe that governments should invest more in public transport.", section: "Writing Task 2" },
      ],
      writing: [
        { id: "ielts-t2-1", type: "IELTS Writing Task 2", level: "B2", prompt: "Some people believe that working from home benefits both employees and companies. Others think it has more disadvantages. Discuss both views and give your own opinion.", es: "Ensayo de opinión: discute ambos puntos de vista y da tu opinión (mín. 250 palabras, 40 min).", min: 250 },
        { id: "ielts-t1-1", type: "IELTS Writing Task 1", level: "B2", prompt: "The table shows electricity generated from renewable sources in a country (in TWh): 2010 — Hydro 30, Wind 5, Solar 1; 2020 — Hydro 32, Wind 18, Solar 12. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", es: "Describe la tabla: tendencias principales y comparaciones (mín. 150 palabras, 20 min).", min: 150 },
      ],
      speaking: [
        { part: "Part 1", prep: 0, time: 30, q: "Do you work or are you a student? What do you like about it?" },
        { part: "Part 1", prep: 0, time: 30, q: "How do you usually spend your weekends?" },
        { part: "Part 2", prep: 60, time: 120, q: "Describe a skill you learned that has been useful for you. You should say: what the skill is, when and how you learned it, why it has been useful, and explain how you felt when you first used it." },
        { part: "Part 3", prep: 0, time: 60, q: "Do you think schools should teach more practical skills? Why or why not?" },
      ],
    },
  },
  {
    id: "toefl", name: "TOEFL iBT", icon: "🇺🇸", levels: "B1–C2 (0–120 puntos)", who: "Universidades de EE. UU. y de muchos otros países.",
    format: [["Reading", "≈ 35 min", "Textos académicos con preguntas de vocabulario, inferencia y resumen."], ["Listening", "≈ 36 min", "Clases universitarias y conversaciones en el campus."], ["Speaking", "≈ 16 min (4 tareas)", "1 independiente (opinión) + 3 integradas (leer/escuchar y hablar)."], ["Writing", "≈ 29 min (2 tareas)", "Integrada (leer + escuchar + escribir) y 'Academic Discussion'."]],
    scale: "42–71 ≈ B1 · 72–94 ≈ B2 · 95–113 ≈ C1 · 114–120 ≈ C2",
    tips: ["En tareas integradas, toma notas en dos columnas: lo que dice el texto / lo que dice el audio.", "En Speaking, estructura: opinión → razón 1 + ejemplo → razón 2 + ejemplo.", "Practica con temporizador: 15 s para preparar y 45 s para hablar.", "Vocabulario académico: analyze, significant, consequently, whereas…"],
    practice: {
      choose: [
        { prompt: "In the lecture, the professor says the theory is “far from conclusive”. This means the theory is:", options: ["not yet proven", "completely wrong", "easy to understand"], answer: "not yet proven", section: "Listening · attitude" },
        { prompt: "The word “consequently” in a reading passage is closest in meaning to:", options: ["as a result", "however", "previously"], answer: "as a result", section: "Reading · vocabulary" },
        { prompt: "Which is the best way to start a TOEFL independent speaking answer?", options: ["In my opinion, studying in a group is more effective for two reasons.", "Umm, I don't know, maybe group.", "Groups are groups."], answer: "In my opinion, studying in a group is more effective for two reasons.", section: "Speaking" },
        { prompt: "A student says: “I can't make it to the review session.” This means:", options: ["She can't attend.", "She can't organize it.", "She can't find the room."], answer: "She can't attend.", section: "Listening · campus" },
        { prompt: "Choose the best academic synonym for “show” in: “The data ___ a clear trend.”", options: ["indicate", "tell", "do"], answer: "indicate", section: "Writing · academic" },
      ],
      writing: [
        { id: "toefl-disc-1", type: "TOEFL Academic Discussion", level: "B2", prompt: "Your professor asks: 'Should universities require all students to take at least one course in computer programming?' Two classmates disagree. Write a post giving your opinion and supporting it with reasons and examples.", es: "Escribe una publicación con tu opinión y razones (mín. 100 palabras, 10 min).", min: 100 },
      ],
      speaking: [
        { part: "Independent", prep: 15, time: 45, q: "Some people prefer to work for a large company; others prefer a small company. Which do you prefer and why?" },
        { part: "Independent", prep: 15, time: 45, q: "Do you agree or disagree: It is better to plan a trip carefully than to travel without a plan?" },
      ],
    },
  },
  {
    id: "toeic", name: "TOEIC Listening & Reading", icon: "💼", levels: "A1–C1 (10–990 puntos)", who: "Empresas: mide el inglés en contextos de trabajo.",
    format: [["Listening", "45 min (100 preguntas)", "Fotografías, pregunta-respuesta, conversaciones y charlas en el trabajo."], ["Reading", "75 min (100 preguntas)", "Part 5: frases incompletas (gramática y vocabulario). Part 6: completar textos. Part 7: correos, anuncios y documentos."]],
    scale: "225–545 ≈ A2–B1 · 550–780 ≈ B1–B2 · 785–940 ≈ B2–C1 · 945+ ≈ C1",
    tips: ["Part 5: lee primero las opciones: ¿es gramática (forma de la palabra) o vocabulario?", "No te quedes en una pregunta difícil; son muchas y el tiempo es clave.", "Part 7: lee las preguntas antes que el texto y busca palabras clave.", "Aprende familias de palabras: decide / decision / decisive / decisively."],
    practice: {
      choose: [
        { prompt: "The new policy will take effect ___ January 1.", options: ["on", "in", "at"], answer: "on", section: "Part 5 · prepositions" },
        { prompt: "Ms. Lee asked all staff to submit their expense reports ___ Friday.", options: ["by", "until", "since"], answer: "by", section: "Part 5 · prepositions" },
        { prompt: "The manager was very ___ with the team's performance this quarter.", options: ["satisfied", "satisfying", "satisfaction"], answer: "satisfied", section: "Part 5 · word form" },
        { prompt: "Please ___ the attached document and send your comments.", options: ["review", "reviewer", "reviewing"], answer: "review", section: "Part 5 · word form" },
        { prompt: "Due to high demand, the product is currently out of ___.", options: ["stock", "store", "storage"], answer: "stock", section: "Part 5 · vocabulary" },
        { prompt: "Applicants must have ___ three years of experience in sales.", options: ["at least", "at last", "at all"], answer: "at least", section: "Part 5 · vocabulary" },
        { prompt: "The conference room has been ___ for the client meeting.", options: ["reserved", "reserving", "reserve"], answer: "reserved", section: "Part 5 · passive" },
        { prompt: "Neither the manager ___ his assistant was available.", options: ["nor", "or", "and"], answer: "nor", section: "Part 5 · conjunctions" },
        { passage: "NOTICE: The staff cafeteria will be closed on Friday, March 14, for maintenance. Employees may use the café on the ground floor of Building B, which will offer a 10% discount with a staff ID.", prompt: "What will employees receive at the café in Building B?", options: ["A discount", "A free lunch", "A new ID"], answer: "A discount", section: "Part 7 · reading" },
        { passage: "NOTICE: The staff cafeteria will be closed on Friday, March 14, for maintenance. Employees may use the café on the ground floor of Building B, which will offer a 10% discount with a staff ID.", prompt: "Why will the cafeteria be closed?", options: ["For maintenance", "For a holiday", "For a staff party"], answer: "For maintenance", section: "Part 7 · reading" },
      ],
      writing: [],
      speaking: [],
    },
  },
  {
    id: "cambridge", name: "Cambridge B2 First / C1 Advanced", icon: "🎓", levels: "B2 (First) · C1 (Advanced)", who: "Certificado permanente muy reconocido por empresas y universidades.",
    format: [["Reading & Use of English", "75–90 min (7–8 partes)", "Open cloze, word formation, key word transformations, textos con opción múltiple."], ["Writing", "80–90 min (2 tareas)", "Ensayo obligatorio + una tarea a elegir (artículo, email, informe, reseña, propuesta)."], ["Listening", "40 min (4 partes)", "Opción múltiple, completar frases, emparejar."], ["Speaking", "14–15 min (en parejas)", "Entrevista, comparar fotos, tarea colaborativa y discusión."]],
    scale: "Cambridge English Scale: 160–179 ≈ B2 · 180–199 ≈ C1 · 200–230 ≈ C2",
    tips: ["Word formation: identifica qué tipo de palabra falta (sustantivo, adjetivo, adverbio) y si es positiva o negativa (un-, in-, dis-).", "Key word transformations: NO cambies la palabra clave y usa entre 2 y 5 palabras (First) o 3–6 (Advanced).", "Open cloze: suelen faltar palabras gramaticales (preposiciones, artículos, auxiliares, conectores).", "Speaking: interactúa con tu compañero (What do you think? I agree up to a point…)."],
    practice: {
      type: [
        { prompt: "Open cloze: She has lived in Quito ___ she was a child.", answer: "since", hint: "", section: "Use of English · open cloze" },
        { prompt: "Open cloze: ___ the heavy rain, the match went ahead.", answer: "Despite", alts: ["In spite of"], hint: "", section: "Use of English · open cloze" },
        { prompt: "Open cloze: This is the ___ interesting book I have ever read.", answer: "most", hint: "", section: "Use of English · open cloze" },
        { prompt: "Word formation: The ___ of the new system took six months. (IMPLEMENT)", answer: "implementation", hint: "IMPLEMENT", section: "Use of English · word formation" },
        { prompt: "Word formation: It was completely ___ to finish the work in one day. (POSSIBLE)", answer: "impossible", hint: "POSSIBLE", section: "Use of English · word formation" },
        { prompt: "Word formation: She answered the question very ___. (CONFIDENT)", answer: "confidently", hint: "CONFIDENT", section: "Use of English · word formation" },
        { prompt: "Word formation: There has been a significant ___ in sales. (GROW)", answer: "growth", hint: "GROW", section: "Use of English · word formation" },
        { prompt: "Key word transformation — 'I haven't seen Tom for three years.' (LAST) → I ___ three years ago.", answer: "last saw Tom", hint: "LAST", section: "Use of English · transformation" },
        { prompt: "Key word transformation — 'It's a pity I didn't study harder.' (WISH) → I ___ harder.", answer: "wish I had studied", alts: ["wish I'd studied"], hint: "WISH", section: "Use of English · transformation" },
        { prompt: "Key word transformation — 'They say the company is losing money.' (SAID) → The company ___ money.", answer: "is said to be losing", hint: "SAID", section: "Use of English · transformation" },
        { prompt: "Key word transformation — 'We didn't go because it rained.' (IF) → We would have gone ___ rained.", answer: "if it hadn't", alts: ["if it had not"], hint: "IF", section: "Use of English · transformation" },
      ],
      choose: [
        { prompt: "Multiple-choice cloze: The company decided to ___ the project due to lack of funds.", options: ["abandon", "abolish", "absent"], answer: "abandon", section: "Use of English · MC cloze" },
        { prompt: "Multiple-choice cloze: She ___ a lot of effort into the presentation.", options: ["put", "made", "did"], answer: "put", section: "Use of English · collocation" },
      ],
      writing: [
        { id: "cam-essay-1", type: "Cambridge Essay", level: "B2", prompt: "Essay: 'Every young person should spend a year working before going to university.' Do you agree? Write about: 1) experience, 2) money, 3) your own idea.", es: "Ensayo de 140–190 palabras (First) usando las dos ideas dadas y una propia.", min: 140 },
        { id: "cam-proposal-1", type: "Cambridge Proposal (C1)", level: "C1", prompt: "Your manager wants to improve employee wellbeing. Write a proposal describing the current situation, suggesting two improvements and explaining how they would benefit the company.", es: "Propuesta formal con títulos (220–260 palabras, C1 Advanced).", min: 220 },
      ],
      speaking: [
        { part: "Long turn", prep: 10, time: 60, q: "Compare two ways of travelling to work: by bicycle and by car. Say what the advantages and disadvantages of each are." },
        { part: "Discussion", prep: 0, time: 60, q: "Some people say technology makes us less sociable. To what extent do you agree?" },
      ],
    },
  },
];

export const EXAM_BY_ID = Object.fromEntries(EXAMS.map((e) => [e.id, e]));
