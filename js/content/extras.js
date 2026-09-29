// Bibliotecas: falsos amigos, phrasal verbs, idioms, colocaciones, US/UK, natural English,
// palabras confusas, Think in English y consignas de escritura (secciones 106-110, 141, 146, 42).

export const FALSE_FRIENDS = [
  ["actually", "en realidad", "actualmente → currently", "Actually, the meeting is tomorrow.", "Currently, I work in Quito."],
  ["embarrassed", "avergonzado", "embarazada → pregnant", "I was embarrassed by my mistake.", "She is pregnant."],
  ["library", "biblioteca", "librería → bookstore", "I study at the library.", "I bought it at the bookstore."],
  ["assist", "ayudar", "asistir → attend", "Can you assist me?", "I attended the meeting."],
  ["eventually", "finalmente, con el tiempo", "eventualmente → possibly / occasionally", "Eventually, we fixed the problem.", "We may possibly need more staff."],
  ["sensible", "sensato", "sensible → sensitive", "That's a sensible decision.", "This is sensitive information."],
  ["realize", "darse cuenta", "realizar → carry out / do", "I realized I was wrong.", "We carried out an inspection."],
  ["carpet", "alfombra", "carpeta → folder", "The carpet is new.", "Put it in the blue folder."],
  ["exit", "salida", "éxito → success", "Use the emergency exit.", "The project was a success."],
  ["large", "grande", "largo → long", "It's a large company.", "It's a long pipeline."],
  ["constipated", "estreñido", "constipado → have a cold", "(médico) He is constipated.", "I have a cold."],
  ["resume (v)", "reanudar", "resumir → summarize", "We'll resume the meeting after lunch.", "Let me summarize the main points."],
  ["discuss", "hablar de, tratar", "discutir (pelear) → argue", "Let's discuss the budget.", "They argued about money."],
  ["attend", "asistir (estar presente)", "atender → serve / deal with", "I'll attend the audit.", "Can you deal with this client?"],
  ["compromise", "acuerdo intermedio / ceder", "compromiso → commitment", "We reached a compromise.", "Thank you for your commitment."],
  ["fabric", "tela", "fábrica → factory", "This fabric is cotton.", "She works in a factory."],
  ["career", "carrera profesional", "carrera universitaria → degree", "I want to grow in my career.", "I have a degree in law."],
  ["advertise", "anunciar (publicidad)", "advertir → warn", "They advertise on TV.", "I warned him about the risk."],
  ["molest", "abusar sexualmente (¡grave!)", "molestar → bother / annoy", "(no usar para «molestar»)", "Sorry to bother you."],
  ["support", "apoyar", "soportar (aguantar) → stand / put up with", "I support your decision.", "I can't stand the noise."],
  ["argument", "discusión, pelea", "argumento (de una historia) → plot", "They had an argument.", "The plot of the movie is simple."],
  ["policy", "política (norma de empresa)", "policía → police", "Read the HR policy.", "Call the police."],
];

export const PHRASAL_VERBS = [
  ["set up", "organizar, instalar", "Can you set up a call with the client?", "business"],
  ["follow up", "hacer seguimiento", "I'll follow up on the invoice.", "business"],
  ["figure out", "averiguar, resolver", "We need to figure out the root cause.", "work"],
  ["call off", "cancelar", "They called off the meeting.", "business"],
  ["put off", "posponer", "Don't put off the inspection.", "work"],
  ["bring up", "mencionar (un tema)", "She brought up an important point.", "meeting"],
  ["carry out", "llevar a cabo", "The team carried out the audit.", "qa"],
  ["find out", "descubrir, enterarse", "I'll find out and let you know.", "daily"],
  ["look into", "investigar, revisar", "We'll look into the complaint.", "hr"],
  ["run out of", "quedarse sin", "We ran out of spare parts.", "oil"],
  ["turn on / off", "encender / apagar", "Turn off the pump before maintenance.", "eng"],
  ["fill in / out", "llenar (formulario)", "Please fill in the form.", "hr"],
  ["go over", "revisar", "Let's go over the contract again.", "law"],
  ["take over", "asumir el control", "She will take over the project.", "business"],
  ["back up", "respaldar; hacer copia", "Always back up your files.", "tech"],
  ["break down", "averiarse; desglosar", "The truck broke down. / Can you break down the costs?", "eng"],
  ["deal with", "ocuparse de", "HR will deal with the issue.", "hr"],
  ["get back to", "responder más tarde", "I'll get back to you tomorrow.", "business"],
  ["point out", "señalar", "The auditor pointed out two issues.", "qa"],
  ["sort out", "resolver, arreglar", "Let's sort out the schedule.", "work"],
  ["catch up", "ponerse al día", "Let's catch up after the meeting.", "daily"],
  ["give up", "rendirse, dejar", "Don't give up!", "daily"],
  ["look forward to", "esperar con ganas", "I look forward to hearing from you.", "business"],
  ["come up with", "idear, proponer", "She came up with a great idea.", "business"],
  ["phase out", "eliminar gradualmente", "We'll phase out the old system.", "tech"],
  ["shut down", "apagar, cerrar (planta)", "They shut down the plant for maintenance.", "oil"],
  ["hand in", "entregar", "Hand in your report by Friday.", "work"],
  ["check in / out", "registrarse / salir (hotel)", "We checked in at 3 p.m.", "travel"],
];

export const IDIOMS = [
  ["break the ice", "romper el hielo", "Let's play a game to break the ice.", "informal"],
  ["get the ball rolling", "poner en marcha", "Let's get the ball rolling on the project.", "neutral"],
  ["on the same page", "estar de acuerdo, alineados", "Let's make sure we're on the same page.", "neutral"],
  ["touch base", "ponerse en contacto brevemente", "Let's touch base next week.", "business"],
  ["a piece of cake", "pan comido", "The test was a piece of cake.", "informal"],
  ["under the weather", "sentirse mal (salud)", "I'm feeling a bit under the weather.", "informal"],
  ["call it a day", "dar por terminado (el día)", "We're tired. Let's call it a day.", "informal"],
  ["back to square one", "volver a empezar", "The design failed, so we're back to square one.", "neutral"],
  ["cut corners", "hacer algo mal para ahorrar", "Never cut corners on safety.", "neutral"],
  ["in the long run", "a largo plazo", "It will save money in the long run.", "neutral"],
  ["think outside the box", "pensar de forma creativa", "We need to think outside the box.", "business"],
  ["the bottom line", "lo esencial / resultado final", "The bottom line is we need more time.", "business"],
  ["hit the ground running", "empezar con todo", "The new engineer hit the ground running.", "business"],
  ["keep someone in the loop", "mantener informado", "Please keep me in the loop.", "business"],
  ["a ballpark figure", "cifra aproximada", "Can you give me a ballpark figure?", "business"],
  ["once in a blue moon", "muy de vez en cuando", "We have audits once in a blue moon.", "informal"],
  ["raise a red flag", "encender una alarma", "These results raise a red flag.", "neutral"],
  ["go the extra mile", "hacer un esfuerzo extra", "She always goes the extra mile.", "neutral"],
  ["learn the ropes", "aprender cómo funciona algo", "It takes time to learn the ropes.", "informal"],
  ["up in the air", "sin decidir", "The date is still up in the air.", "neutral"],
];

export const COLLOCATIONS = [
  ["make a decision", "tomar una decisión"], ["make a mistake", "cometer un error"], ["make progress", "progresar"],
  ["take responsibility", "asumir responsabilidad"], ["take a break", "tomar un descanso"], ["take notes", "tomar notas"],
  ["raise a concern", "plantear una inquietud"], ["raise an issue", "plantear un problema"], ["conduct an audit", "realizar una auditoría"],
  ["carry out an inspection", "realizar una inspección"], ["meet a deadline", "cumplir un plazo"], ["miss a deadline", "incumplir un plazo"],
  ["do business", "hacer negocios"], ["do research", "investigar"], ["do overtime", "hacer horas extra"],
  ["pay attention", "prestar atención"], ["give feedback", "dar retroalimentación"], ["reach an agreement", "llegar a un acuerdo"],
  ["run a meeting", "dirigir una reunión"], ["submit a report", "presentar un informe"], ["sign a contract", "firmar un contrato"],
  ["breach a contract", "incumplir un contrato"], ["file a complaint", "presentar una queja"], ["set a goal", "fijar un objetivo"],
  ["heavy traffic", "tráfico intenso"], ["strong coffee", "café cargado"], ["high risk", "alto riesgo"], ["tight schedule", "agenda apretada"],
];

export const US_UK = [
  ["apartment", "flat", "departamento"], ["elevator", "lift", "ascensor"], ["vacation", "holiday", "vacaciones"],
  ["truck", "lorry", "camión"], ["gas", "petrol", "gasolina"], ["cookie", "biscuit", "galleta"], ["fries", "chips", "papas fritas"],
  ["chips", "crisps", "papas de funda"], ["subway", "underground / tube", "metro"], ["line", "queue", "fila"],
  ["check (restaurant)", "bill", "cuenta"], ["resume", "CV", "currículum"], ["cell phone", "mobile phone", "celular"],
  ["pants", "trousers", "pantalones"], ["sidewalk", "pavement", "vereda"], ["parking lot", "car park", "estacionamiento"],
  ["first floor", "ground floor", "planta baja"], ["zip code", "postcode", "código postal"], ["color", "colour", "color (ortografía)"],
  ["organize", "organise", "organizar (ortografía)"], ["center", "centre", "centro (ortografía)"], ["program", "programme", "programa"],
];

// Textbook vs Correct vs Natural vs Professional (sección 110)
export const NATURAL = [
  { situation: "Pedir que envíen un informe", textbook: "I want that you send me the report.", correct: "I want you to send me the report.", natural: "Could you send me the report?", professional: "Would you mind sending me the report by Friday?" },
  { situation: "No entendiste", textbook: "I don't understand what you say.", correct: "I don't understand what you're saying.", natural: "Sorry, I didn't catch that.", professional: "Could you clarify what you mean by that?" },
  { situation: "Estar en desacuerdo", textbook: "You are wrong.", correct: "I don't agree with you.", natural: "I'm not sure about that.", professional: "I see your point, but I have a different view." },
  { situation: "Llegar tarde", textbook: "Excuse me for the delay.", correct: "Sorry I'm late.", natural: "Sorry I'm late — traffic was crazy.", professional: "Apologies for the delay. Shall we get started?" },
  { situation: "Preguntar el precio", textbook: "What is the price of this?", correct: "How much is this?", natural: "How much is it?", professional: "Could you send us a quotation?" },
  { situation: "Terminar un correo", textbook: "I wait for your answer.", correct: "I am waiting for your answer.", natural: "Talk soon!", professional: "I look forward to hearing from you." },
  { situation: "Tener un problema", textbook: "There is a problem with the machine.", correct: "The machine has a problem.", natural: "The machine isn't working.", professional: "We've identified an issue with the equipment." },
  { situation: "Pedir ayuda", textbook: "Help me, please.", correct: "Can you help me?", natural: "Could you give me a hand?", professional: "Would you be able to assist with this?" },
];

// Palabras confusas para Ask My Teacher ("What is the difference between…?")
export const CONFUSABLES = [
  { a: "make", b: "do", es: "Make = crear/producir (make a decision, make a mistake). Do = realizar tareas/actividades (do homework, do business).", ex: ["I made a mistake.", "I did my homework."] },
  { a: "say", b: "tell", es: "Say + lo dicho (say hello). Tell + persona (tell me, tell her the truth).", ex: ["She said she was busy.", "She told me she was busy."] },
  { a: "since", b: "for", es: "Since + punto de inicio (since 2020). For + duración (for three years).", ex: ["I've worked here since 2020.", "I've worked here for five years."] },
  { a: "much", b: "many", es: "Much + incontables (much time). Many + contables en plural (many people).", ex: ["How much water?", "How many valves?"] },
  { a: "in", b: "on", es: "In + meses, años, ciudades, espacios cerrados. On + días, fechas, superficies.", ex: ["in July", "on Monday"] },
  { a: "at", b: "in", es: "At + punto concreto u hora (at the airport, at 5). In + dentro / ciudad / período (in the room, in Quito).", ex: ["at the station", "in Madrid"] },
  { a: "borrow", b: "lend", es: "Borrow = pedir prestado (tú recibes). Lend = prestar (tú das).", ex: ["Can I borrow your pen?", "Can you lend me your pen?"] },
  { a: "bored", b: "boring", es: "-ed = cómo te sientes (I'm bored). -ing = cómo es algo (the movie is boring).", ex: ["I'm bored.", "This meeting is boring."] },
  { a: "look", b: "see", es: "Look (at) = mirar con intención. See = ver (percibir).", ex: ["Look at this chart.", "I can see the problem."] },
  { a: "hear", b: "listen", es: "Hear = oír (sin intención). Listen (to) = escuchar con atención.", ex: ["I heard a noise.", "Listen to me."] },
  { a: "remember", b: "remind", es: "Remember = recordar tú. Remind = hacer que otro recuerde.", ex: ["I remember the meeting.", "Remind me about the meeting."] },
  { a: "fun", b: "funny", es: "Fun = divertido (pasarla bien). Funny = gracioso (da risa).", ex: ["The party was fun.", "The joke was funny."] },
  { a: "economic", b: "economical", es: "Economic = relacionado con la economía. Economical = que ahorra dinero.", ex: ["economic growth", "an economical car"] },
  { a: "ensure", b: "insure", es: "Ensure = asegurar(se) de algo. Insure = contratar un seguro.", ex: ["Ensure the valve is closed.", "Insure the equipment."] },
  { a: "affect", b: "effect", es: "Affect (verbo) = afectar. Effect (sustantivo) = efecto.", ex: ["Delays affect the budget.", "The effect was positive."] },
];

// Think in English (sección 141): situación sin español → responder directo en inglés
export const THINK = [
  { emoji: "☕", prompt: "You are in a café. Order something.", sample: "Can I have a coffee, please?", kw: ["coffee|tea|juice|water|have|like"] },
  { emoji: "🌧️", prompt: "Look outside. Describe the weather.", sample: "It's raining and it's cold.", kw: ["rain|sun|cold|hot|cloud|wind"] },
  { emoji: "📅", prompt: "What did you do yesterday?", sample: "Yesterday I worked and then I went to the gym.", kw: ["\\w+ed|went|had|was|saw|did"] },
  { emoji: "🧳", prompt: "You lost your bag at the airport. Tell the agent.", sample: "Excuse me, I lost my bag. It's a black suitcase.", kw: ["lost|bag|suitcase|luggage"] },
  { emoji: "🤒", prompt: "You feel sick. Call your boss.", sample: "Hi, I'm sorry, I'm sick today. I can't come to work.", kw: ["sick|ill|fever|can't|cannot"] },
  { emoji: "🔧", prompt: "A machine is not working. Explain the problem.", sample: "The machine isn't working. It's making a strange noise.", kw: ["not|isn't|broken|working|problem"] },
  { emoji: "🎂", prompt: "Invite a friend to your birthday party.", sample: "Would you like to come to my birthday party on Saturday?", kw: ["come|party|invite|would you"] },
  { emoji: "🗺️", prompt: "A tourist asks for the nearest bank. Give directions.", sample: "Go straight and turn left. The bank is next to the pharmacy.", kw: ["go|turn|left|right|straight|next"] },
  { emoji: "📈", prompt: "Your sales went up this month. Tell your team.", sample: "Great news! Our sales increased by ten percent this month.", kw: ["increase|went up|rose|grew|more"] },
  { emoji: "⏰", prompt: "You're late for a meeting. Apologize.", sample: "Sorry I'm late. The traffic was terrible.", kw: ["sorry|apolog|late"] },
  { emoji: "🦺", prompt: "A visitor enters the plant without a helmet. Tell them.", sample: "Excuse me, you must wear a helmet here.", kw: ["must|have to|need|helmet|wear"] },
  { emoji: "📧", prompt: "Ask a colleague to review your document.", sample: "Could you review my document, please?", kw: ["could|can|would|review|check|look"] },
];

// Writing Coach (sección 42): consignas por tipo y nivel
export const WRITING_PROMPTS = [
  { id: "w.sentences", type: "Sentences", level: "A1", prompt: "Write 3 sentences about yourself (name, job, city).", es: "Escribe 3 frases sobre ti (nombre, trabajo, ciudad).", min: 12 },
  { id: "w.message", type: "Messages", level: "A1", prompt: "Write a short message to a friend inviting them for coffee.", es: "Escribe un mensaje corto invitando a un amigo a tomar café.", min: 12 },
  { id: "w.routine", type: "Sentences", level: "A2", prompt: "Describe your typical workday.", es: "Describe tu día típico de trabajo.", min: 35 },
  { id: "w.story", type: "Stories", level: "A2", prompt: "Write about a memorable trip (past simple).", es: "Escribe sobre un viaje memorable (pasado simple).", min: 45 },
  { id: "w.opinion", type: "Opinions", level: "B1", prompt: "Is remote work better than working in an office? Give your opinion with reasons.", es: "¿Es mejor el trabajo remoto que la oficina? Da tu opinión con razones.", min: 70 },
  { id: "w.report", type: "Reports", level: "B1", prompt: "Write a short incident report: what happened, the cause and the action taken.", es: "Escribe un breve informe de incidente: qué pasó, la causa y la acción tomada.", min: 70 },
  { id: "w.email-request", type: "Emails", level: "B1", prompt: "Write an email to a supplier requesting a quotation for 200 safety helmets.", es: "Escribe un correo a un proveedor solicitando cotización de 200 cascos.", min: 50, email: true },
  { id: "w.email-leave", type: "Emails", level: "A2", prompt: "Write an email to your manager asking for two days of leave.", es: "Escribe un correo a tu jefe pidiendo dos días libres.", min: 40, email: true },
  { id: "w.email-delay", type: "Professional communication", level: "B1", prompt: "Write an email to a client explaining a delay and the new date.", es: "Escribe un correo a un cliente explicando un retraso y la nueva fecha.", min: 60, email: true },
  { id: "w.essay", type: "Essays", level: "B2", prompt: "Write an essay: 'Artificial intelligence will create more jobs than it destroys.' Discuss.", es: "Ensayo: «La IA creará más empleos de los que destruirá». Discute.", min: 180 },
  { id: "w.summary", type: "Professional communication", level: "B2", prompt: "Summarize a recent meeting for people who couldn't attend.", es: "Resume una reunión reciente para quienes no asistieron.", min: 90 },
];

// Reto diario (sección 94) — elegido de forma determinista por fecha
export const DAILY_CHALLENGES = [
  { id: "words10", text: "Learn 10 words", es: "Aprende 10 palabras", kind: "words", target: 10 },
  { id: "speak5", text: "Speak for 5 minutes", es: "Habla durante 5 minutos", kind: "speakMin", target: 5 },
  { id: "sounds3", text: "Practice 3 pronunciation sounds", es: "Practica 3 sonidos", kind: "pron", target: 3 },
  { id: "grammar1", text: "Complete one grammar lesson", es: "Completa una lección de gramática", kind: "grammarLesson", target: 1 },
  { id: "review20", text: "Review 20 words", es: "Repasa 20 palabras", kind: "reviews", target: 20 },
  { id: "read1", text: "Read one text", es: "Lee un texto", kind: "read", target: 1 },
  { id: "write5", text: "Write 5 correct sentences", es: "Escribe 5 frases correctas", kind: "produce", target: 5 },
];

export const WEEKLY_MISSIONS = [
  { id: "speak30", text: "Speak 30 minutes", es: "Habla 30 minutos", kind: "speakMin", target: 30 },
  { id: "words50", text: "Learn 50 words", es: "Aprende 50 palabras", kind: "words", target: 50 },
  { id: "lessons5", text: "Complete 5 lessons", es: "Completa 5 lecciones", kind: "lessons", target: 5 },
  { id: "read3", text: "Read 3 stories", es: "Lee 3 textos", kind: "read", target: 3 },
  { id: "emails2", text: "Write 2 emails", es: "Escribe 2 correos", kind: "emails", target: 2 },
];
