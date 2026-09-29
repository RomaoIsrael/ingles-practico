// Currículo A1–C2: nivel → etapa (ruta visual) → unidad → lecciones (secciones 3, 15, 16).
// Tipos de lección: grammar · vocab · talk · read · pron
export const STAGES = [
  { id: "start", title: "START", icon: "🚩", level: "A1" },
  { id: "foundations", title: "English Foundations", icon: "🧱", level: "A1" },
  { id: "basic-conv", title: "Basic Conversation", icon: "💬", level: "A1" },
  { id: "grammar-found", title: "Grammar Foundations", icon: "🧩", level: "A2" },
  { id: "everyday", title: "Everyday English", icon: "🏙️", level: "A2" },
  { id: "travel", title: "Travel", icon: "✈️", level: "A2" },
  { id: "inter-conv", title: "Intermediate Conversation", icon: "🗣️", level: "B1" },
  { id: "professional", title: "Professional English", icon: "💼", level: "B1" },
  { id: "advanced", title: "Advanced English", icon: "🚀", level: "B2" },
  { id: "fluency", title: "Fluency", icon: "🌊", level: "C1" },
  { id: "c2", title: "C2 MASTER", icon: "👑", level: "C2" },
];

const U = (id, level, stage, title, es, lessons) => ({ id, level, stage, title, es, lessons: lessons.map(([kind, ref]) => ({ id: `${id}:${kind}:${ref}`, kind, ref, unit: id })) });

export const UNITS = [
  U("a1-1", "A1", "foundations", "Hello!", "¡Hola!", [["grammar", "g.be"], ["vocab", "social"], ["pron", "pr.th"]]),
  U("a1-2", "A1", "foundations", "People & jobs", "Personas y trabajos", [["grammar", "g.pronouns"], ["grammar", "g.articles"], ["vocab", "work"], ["read", "r.a1-team"]]),
  U("a1-3", "A1", "foundations", "Family & things", "Familia y cosas", [["grammar", "g.possessives"], ["grammar", "g.plurals"], ["vocab", "family"]]),
  U("a1-4", "A1", "foundations", "Around me", "A mi alrededor", [["grammar", "g.there-is"], ["vocab", "home"], ["read", "r.a1-hotel"]]),
  U("a1-5", "A1", "basic-conv", "My day", "Mi día", [["grammar", "g.present-simple"], ["vocab", "time"], ["read", "r.a1-ana"]]),
  U("a1-6", "A1", "basic-conv", "Food & likes", "Comida y gustos", [["grammar", "g.have-has"], ["vocab", "food"], ["talk", "restaurant"]]),
  U("a1-7", "A1", "basic-conv", "Right now", "Ahora mismo", [["grammar", "g.present-continuous"], ["vocab", "clothes"], ["pron", "pr.vowels"]]),
  U("a1-8", "A1", "basic-conv", "Where & when", "Dónde y cuándo", [["grammar", "g.prepositions"], ["vocab", "transport"], ["talk", "supermarket"]]),
  U("a1-9", "A1", "basic-conv", "I can do it", "Puedo hacerlo", [["grammar", "g.can"], ["vocab", "sports"], ["pron", "pr.r"]]),
  U("a1-10", "A1", "basic-conv", "Questions", "Preguntas", [["grammar", "g.questions"], ["vocab", "travel"], ["talk", "airport"], ["talk", "hotel"]]),
  U("a2-1", "A2", "grammar-found", "Yesterday", "Ayer", [["grammar", "g.past-simple"], ["vocab", "emotions"], ["read", "r.a2-late"], ["pron", "pr.ed"]]),
  U("a2-2", "A2", "grammar-found", "Stories", "Historias", [["grammar", "g.past-continuous"], ["read", "r.a2-trip"], ["talk", "office-smalltalk"]]),
  U("a2-3", "A2", "grammar-found", "Plans", "Planes", [["grammar", "g.going-to"], ["vocab", "university"]]),
  U("a2-4", "A2", "grammar-found", "Promises & predictions", "Promesas y predicciones", [["grammar", "g.will"], ["talk", "customer-service"]]),
  U("a2-5", "A2", "everyday", "Comparing", "Comparar", [["grammar", "g.comparatives"], ["grammar", "g.superlatives"], ["vocab", "shopping"]]),
  U("a2-6", "A2", "everyday", "Quantities & health", "Cantidades y salud", [["grammar", "g.quantifiers"], ["vocab", "health"], ["talk", "doctor"]]),
  U("a2-7", "A2", "everyday", "Rules", "Reglas", [["grammar", "g.modals-obligation"], ["vocab", "technology"], ["pron", "pr.vb"]]),
  U("a2-8", "A2", "everyday", "Experiences", "Experiencias", [["grammar", "g.present-perfect"], ["vocab", "nature"], ["read", "r.a2-email"]]),
  U("a2-9", "A2", "everyday", "Connecting ideas", "Conectar ideas", [["grammar", "g.conjunctions"], ["pron", "pr.s"]]),
  U("a2-10", "A2", "travel", "On the road", "De viaje", [["vocab", "weather"], ["talk", "taxi"], ["pron", "pr.connected"]]),
  U("b1-1", "B1", "inter-conv", "Up to now", "Hasta ahora", [["grammar", "g.present-perfect-2"], ["vocab", "meetings"], ["talk", "meeting"]]),
  U("b1-2", "B1", "inter-conv", "Longer actions", "Acciones prolongadas", [["grammar", "g.present-perfect-continuous"], ["talk", "university"]]),
  U("b1-3", "B1", "inter-conv", "Before that", "Antes de eso", [["grammar", "g.past-perfect"], ["read", "r.b1-incident"]]),
  U("b1-4", "B1", "inter-conv", "If…", "Si…", [["grammar", "g.first-conditional"], ["grammar", "g.second-conditional"], ["pron", "pr.stress"]]),
  U("b1-5", "B1", "inter-conv", "Old habits", "Viejos hábitos", [["grammar", "g.used-to"], ["read", "r.b1-remote"]]),
  U("b1-6", "B1", "professional", "Processes", "Procesos", [["grammar", "g.passive"], ["vocab", "business"], ["talk", "equipment-failure"]]),
  U("b1-7", "B1", "professional", "Describing things", "Describir cosas", [["grammar", "g.relative-clauses"], ["talk", "supplier-meeting"]]),
  U("b1-8", "B1", "professional", "Verb patterns", "Patrones verbales", [["grammar", "g.gerunds-infinitives"], ["read", "r.b1-interview"], ["talk", "job-interview"]]),
  U("b1-9", "B1", "professional", "Phrasal verbs at work", "Phrasal verbs en el trabajo", [["grammar", "g.phrasal-verbs"], ["talk", "presentation"]]),
  U("b2-1", "B2", "advanced", "Reporting", "Reportar", [["grammar", "g.reported-speech"], ["read", "r.b2-contracts"], ["talk", "salary-negotiation"]]),
  U("b2-2", "B2", "advanced", "Regrets & wishes", "Lamentos y deseos", [["grammar", "g.third-conditional"], ["grammar", "g.wish"]]),
  U("b2-3", "B2", "advanced", "Deduction & contrast", "Deducción y contraste", [["grammar", "g.modals-deduction"], ["grammar", "g.linking"], ["read", "r.b2-quality"]]),
  U("b2-4", "B2", "advanced", "Getting things done", "Lograr que se haga", [["grammar", "g.causative"], ["talk", "contract-change"]]),
  U("c1-1", "C1", "fluency", "Emphasis", "Énfasis", [["grammar", "g.inversion"], ["grammar", "g.mixed-conditionals"], ["read", "r.c1-energy"]]),
  U("c1-2", "C1", "fluency", "Style", "Estilo", [["grammar", "g.cleft"], ["grammar", "g.participle-clauses"], ["talk", "networking"]]),
  U("c2-1", "C2", "c2", "Academic & professional writing", "Escritura académica y profesional", [["grammar", "g.academic"], ["grammar", "g.advanced-writing"], ["grammar", "g.subjunctive"], ["read", "r.c2-language"]]),
];

export const LESSONS = UNITS.flatMap((u) => u.lessons);
export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]));

// Fluency Path (sección 140)
export const FLUENCY_PATH = [
  { id: "understand", title: "Understand", es: "Entender", do: "Listening + Shadowing", route: "#/listening" },
  { id: "build", title: "Build Sentences", es: "Construir frases", do: "Sentence Builder + Translation", route: "#/game/builder" },
  { id: "respond", title: "Respond", es: "Responder", do: "Think in English", route: "#/think" },
  { id: "hold", title: "Hold a Conversation", es: "Mantener una conversación", do: "Role plays A1–A2", route: "#/speak" },
  { id: "explain", title: "Explain Ideas", es: "Explicar ideas", do: "Writing & opinion role plays", route: "#/writing" },
  { id: "professional", title: "Professional Conversation", es: "Conversación profesional", do: "Meetings, interviews, negotiations", route: "#/speak" },
  { id: "fluent", title: "Fluent Communication", es: "Comunicación fluida", do: "Free conversation with AI (levels 4–7)", route: "#/talk" },
];
