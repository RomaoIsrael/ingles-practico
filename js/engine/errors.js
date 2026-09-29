// Detección local de errores típicos de hispanohablantes (secciones 23-25, 136, 145-146).
// Cada regla: qué pasó, por qué, forma correcta, regla, ejemplos y tema de práctica relacionado.

const V3_IRREG = { have: "has", do: "does", go: "goes", be: "is" };
export function thirdPerson(v) {
  v = v.toLowerCase();
  if (V3_IRREG[v]) return V3_IRREG[v];
  if (/(s|sh|ch|x|z|o)$/.test(v)) return v + "es";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ies";
  return v + "s";
}

export const PAST = {
  go: "went", have: "had", do: "did", see: "saw", eat: "ate", work: "worked", am: "was", is: "was", are: "were",
  buy: "bought", make: "made", take: "took", come: "came", get: "got", visit: "visited", play: "played",
  watch: "watched", meet: "met", write: "wrote", send: "sent", travel: "traveled", call: "called", start: "started",
  finish: "finished", speak: "spoke", give: "gave", find: "found", tell: "told", leave: "left", begin: "began",
  know: "knew", think: "thought", say: "said", drink: "drank", pay: "paid", feel: "felt", understand: "understood",
  bring: "brought", inspect: "inspected", check: "checked", sign: "signed", review: "reviewed",
};
export const BASE_FROM_PAST = Object.fromEntries(Object.entries(PAST).filter(([b]) => !["am", "is", "are"].includes(b)).map(([b, p]) => [p, b]));

const VERBS_3P = "go|do|have|want|work|like|live|need|play|watch|eat|drink|study|speak|make|take|come|get|know|think|say|see|use|read|write|run|teach|finish|start|help|love|try|call|send|check|visit|open|close|buy|pay|travel|cook|wash|leave|begin|feel|look|sleep|walk|drive|wear|listen|understand|remember|prefer|manage|lead|review|inspect|prepare|explain|report|approve|coordinate|supervise|arrive|enjoy|hate|mean|cost|seem";
const AUX_BEFORE = "(?<!\\b(?:does|did|do|can|could|will|would|should|must|might|may|let|make|made|help|to|doesn't|didn't|won't|can't|cannot|shall|and)\\s)";
const PAST_IRREG = "went|saw|came|did|had|made|took|got|knew|thought|said|ate|drank|wrote|bought|paid|sent|left|began|felt|spoke|gave|found|told|understood|met|brought|worked|played|visited|watched|called|started|finished|checked|signed";
const PROFESSIONS = "engineer|doctor|teacher|lawyer|nurse|student|manager|inspector|accountant|architect|designer|developer|programmer|auditor|supervisor|technician|electrician|mechanic|operator|driver|secretary|assistant|consultant|analyst|economist|chef|waiter|pilot|recruiter|geologist|chemist|scientist|journalist|dentist|pharmacist|salesperson|receptionist";
const DAYS = "monday|tuesday|wednesday|thursday|friday|saturday|sunday";
const MONTHS = "january|february|april|june|july|august|september|october|november|december";
const LANGS = "english|spanish|french|german|portuguese|italian|chinese|japanese|american|british|european|ecuadorian|mexican|colombian|peruvian|chilean|argentinian|venezuelan";
const OBJ = { i: "me", you: "you", he: "him", she: "her", it: "it", we: "us", they: "them" };
const BE = { i: "am", you: "are", we: "are", they: "are", he: "is", she: "is", it: "is" };
const PP = { work: "worked", live: "lived", study: "studied", know: "known", am: "been", are: "been", is: "been" };

const cap = (orig, rep) => (orig && orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase() ? rep[0].toUpperCase() + rep.slice(1) : rep);

export const RULES = [
  {
    id: "third-person-s", cat: "Verb Tenses", topic: "g.present-simple",
    re: new RegExp(AUX_BEFORE + "\\b(he|she|it)\\s+(" + VERBS_3P + ")\\b", "gi"),
    fix: (m, s, v) => `${s} ${thirdPerson(v)}`,
    es: "Con he / she / it en Present Simple, el verbo lleva -s (o -es).",
    en: "For he / she / it in the Present Simple, the verb usually takes -s.",
    ex: ["He works in an office.", "She goes to work by bus.", "It has two floors."],
  },
  {
    id: "third-person-dont", cat: "Verb Tenses", topic: "g.present-simple",
    re: /\b(he|she|it)\s+(don'?t|do not)\b/gi,
    fix: (m, s) => `${s} doesn't`,
    es: "En negativo con he / she / it se usa doesn't (does not), no don't.",
    en: "Use doesn't (does not) with he / she / it.",
    ex: ["She doesn't like coffee.", "It doesn't work."],
  },
  {
    id: "be-agree", cat: "Grammar", topic: "g.present-simple",
    re: /\b(i|we|they|you)\s*(?:am|are|'m|'re)\s+(agree|disagree)\b/gi,
    fix: (m, s, v) => `${s} ${v.toLowerCase()}`,
    es: "Agree es un verbo, no un adjetivo: se dice I agree (sin am). En español «estoy de acuerdo» lleva «estar», en inglés no.",
    en: "Agree is a verb, so we say I agree, not I am agree.",
    ex: ["I agree with you.", "We don't agree on the budget."],
  },
  {
    id: "have-years", cat: "Grammar", topic: "g.be",
    re: /\b(i|he|she|we|they|you)\s+(?:have|has)\s+(\d{1,3})\s+years(?:\s+old)?\b/gi,
    fix: (m, s, n) => `${s} ${BE[s.toLowerCase()]} ${n} years old`,
    es: "La edad se dice con el verbo be: I am 30 years old (no «tengo 30 años» → I have).",
    en: "We use be for age: I am 30 (years old).",
    ex: ["I am 25 years old.", "She is 40."],
  },
  {
    id: "have-feeling", cat: "Grammar", topic: "g.be",
    re: /\b(i|you|we|they|he|she)\s+(?:have|has)\s+(hungry|thirsty|cold|hot|sleepy|afraid)\b/gi,
    fix: (m, s, a) => `${s} ${BE[s.toLowerCase()]} ${a}`,
    es: "Hambre, sed, frío, calor, sueño y miedo se expresan con be: I am hungry (no «tengo hambre» → have).",
    en: "Use be + adjective: I am hungry / cold / afraid.",
    ex: ["I'm hungry.", "Are you cold?"],
  },
  {
    id: "how-old-have", cat: "Grammar", topic: "g.be",
    re: /\bhow\s+old\s+(?:have|has)\s+(you|he|she|they)\b/gi,
    fix: (m, s) => `how old ${BE[s.toLowerCase()]} ${s}`,
    es: "Para preguntar la edad se usa be: How old are you?",
    en: "Ask about age with be: How old are you?",
    ex: ["How old are you?", "How old is your son?"],
  },
  {
    id: "people-is", cat: "Grammar", topic: "g.plurals",
    re: /\bpeople\s+(is|was|has)\b/gi,
    fix: (m, v) => `people ${{ is: "are", was: "were", has: "have" }[v.toLowerCase()]}`,
    es: "People es plural (= personas): people are, people were, people have.",
    en: "People is plural: people are / were / have.",
    ex: ["People are friendly here.", "Many people were at the meeting."],
  },
  {
    id: "much-countable", cat: "Grammar", topic: "g.quantifiers",
    re: /\bmuch\s+(people|friends|things|cars|books|problems|questions|days|years|employees|workers|reports|meetings|tasks|countries|documents|emails)\b/gi,
    fix: (m, n) => `many ${n}`,
    es: "Con sustantivos contables en plural se usa many, no much.",
    en: "Use many with plural countable nouns.",
    ex: ["How many people work here?", "I don't have many questions."],
  },
  {
    id: "uncountable-plural", cat: "Vocabulary", topic: "g.quantifiers",
    re: /\b(informations|advices|furnitures|equipments|feedbacks|knowledges|researches|evidences|softwares|luggages|baggages|homeworks|machineries)\b/gi,
    fix: (m, w) => w.replace(/s$/i, ""),
    es: "Esta palabra es incontable en inglés: no lleva -s (information, advice, equipment, feedback…). Para contar: a piece of advice.",
    en: "This noun is uncountable: no plural -s. Use a piece of… to count it.",
    ex: ["Thank you for the information.", "Can you give me some advice?", "The equipment is new."],
  },
  {
    id: "article-profession", cat: "Articles", topic: "g.articles",
    re: new RegExp("\\b(i am|i'm|he is|he's|she is|she's|my \\w+ is)\\s+(" + PROFESSIONS + ")\\b", "gi"),
    fix: (m, s, p) => `${s} ${/^[aeiou]/i.test(p) ? "an" : "a"} ${p}`,
    es: "Con profesiones en singular se usa a / an: I am an engineer (en español decimos «soy ingeniero» sin artículo).",
    en: "Use a / an before a singular job: I'm an engineer.",
    ex: ["I'm an engineer.", "She is a lawyer.", "He's an auditor."],
  },
  {
    id: "a-an", cat: "Articles", topic: "g.articles",
    re: /\b(a)\s+(?!(?:uni|use|usu|euro|one|once|ukr|uti|u\.)\w*)(?!(?:is|was|and|or|are|as|at|in|of|on|if)\b)([aeiou]\w*)\b/gi,
    fix: (m, a, w) => `${a[0] === "A" ? "An" : "an"} ${w}`,
    es: "Antes de un sonido vocal se usa an: an engineer, an apple, an hour.",
    en: "Use an before a vowel sound.",
    ex: ["an email", "an inspection", "an hour"],
  },
  {
    id: "an-a", cat: "Articles", topic: "g.articles",
    re: /\b(an)\s+(?!(?:hour|honest|honou?r|heir|mba|mri|sql|hr\b|fbi|ncr|mtr|itp)\w*)([bcdfgjklmnpqrstvwxyz]\w*)\b/gi,
    fix: (m, a, w) => `${a[0] === "A" ? "A" : "a"} ${w}`,
    es: "Antes de un sonido consonante se usa a: a report, a car, a university (suena /ju/).",
    en: "Use a before a consonant sound.",
    ex: ["a report", "a car", "a university"],
  },
  {
    id: "a-hour", cat: "Articles", topic: "g.articles",
    re: /\b(a)\s+(hour|honest|honor|honour)\b/gi,
    fix: (m, a, w) => `${a[0] === "A" ? "An" : "an"} ${w}`,
    es: "La h de hour / honest no se pronuncia: el sonido es vocal, por eso an hour.",
    en: "The h in hour / honest is silent, so we use an.",
    ex: ["an hour", "an honest answer"],
  },
  {
    id: "explain-me", cat: "Prepositions", topic: "g.pronouns",
    re: /\bexplain(s|ed)?\s+(me|us|him|her|them)\b/gi,
    fix: (m, s, o) => `explain${s || ""} to ${o}`,
    es: "Explain necesita to antes de la persona: explain to me (o explain it to me).",
    en: "We explain something TO someone: explain it to me.",
    ex: ["Can you explain it to me?", "She explained the process to us."],
  },
  {
    id: "say-me", cat: "Vocabulary", topic: "g.reported-speech",
    re: /\b(said|say|says)\s+(me|him|her|us|them)\b/gi,
    fix: (m, v, o) => `${{ said: "told", say: "tell", says: "tells" }[v.toLowerCase()]} ${o}`,
    es: "Say no lleva persona directamente. Con persona se usa tell: He told me… / Tell me…",
    en: "Tell + person; say + words. He told me / he said to me.",
    ex: ["She told me the news.", "Tell me more.", "He said that he was busy."],
  },
  {
    id: "depend-of", cat: "Prepositions", topic: "g.prepositions",
    re: /\bdepend(s|ed|ing)?\s+of\b/gi,
    fix: (m, s) => `depend${s || ""} on`,
    es: "En inglés se dice depend on (no «depender de» → of).",
    en: "The correct preposition is depend on.",
    ex: ["It depends on the budget.", "The schedule depends on the supplier."],
  },
  {
    id: "married-with", cat: "Prepositions", topic: "g.prepositions",
    re: /\bmarried\s+with\b/gi,
    fix: () => "married to",
    es: "Se dice married to someone (no «casado con» → with).",
    en: "We say married to someone.",
    ex: ["She is married to an engineer."],
  },
  {
    id: "arrive-to", cat: "Prepositions", topic: "g.prepositions",
    re: /\barriv(e|es|ed|ing)\s+to\b/gi,
    fix: (m, s) => `arriv${s} at`,
    es: "Arrive no va con to: arrive at (un lugar concreto) o arrive in (ciudad/país).",
    en: "Arrive at a place / arrive in a city — never arrive to.",
    ex: ["We arrived at the airport.", "They arrived in London."],
  },
  {
    id: "discuss-about", cat: "Prepositions", topic: "g.prepositions",
    re: /\bdiscuss(es|ed|ing)?\s+about\b/gi,
    fix: (m, s) => `discuss${s || ""}`,
    es: "Discuss no lleva about: discuss the problem.",
    en: "Discuss takes a direct object: discuss the issue (no about).",
    ex: ["Let's discuss the report.", "We discussed the budget."],
  },
  {
    id: "listen-to", cat: "Prepositions", topic: "g.prepositions",
    re: /\blisten(s|ed|ing)?\s+(?!to\b)(music|the\s+radio|the\s+news|me|him|her|us|them|podcasts?)\b/gi,
    fix: (m, s, o) => `listen${s || ""} to ${o}`,
    es: "Listen necesita to antes del objeto: listen to music.",
    en: "Listen to + object.",
    ex: ["I listen to podcasts.", "Please listen to me."],
  },
  {
    id: "go-to-home", cat: "Prepositions", topic: "g.prepositions",
    re: /\b(go|goes|going|went|come|comes|came|get|got|arrive|arrived)\s+to\s+home\b/gi,
    fix: (m, v) => `${v} home`,
    es: "Home no lleva to después de go/come/get/arrive: go home.",
    en: "No preposition before home: go home, get home.",
    ex: ["I go home at six.", "What time did you get home?"],
  },
  {
    id: "enter-to", cat: "Prepositions", topic: "g.prepositions",
    re: /\benter(s|ed|ing)?\s+(to|in|into)\s+(the|a|an|my|our|your)\b/gi,
    fix: (m, s, p, d) => `enter${s || ""} ${d}`,
    es: "Enter no lleva preposición: enter the room.",
    en: "Enter takes a direct object: enter the building.",
    ex: ["Please enter the room.", "Visitors must not enter the area."],
  },
  {
    id: "assist-attend", cat: "Vocabulary", topic: "g.prepositions",
    re: /\bassist(s|ed|ing)?\s+(?:to\s+)?(the\s+|a\s+)?(meeting|class|classes|event|conference|course|training|party|wedding)\b/gi,
    fix: (m, s, d, w) => `attend${s || ""} ${d || ""}${w}`,
    es: "Falso amigo: «asistir a una reunión» es attend a meeting. Assist significa ayudar.",
    en: "False friend: attend a meeting. Assist means help.",
    ex: ["I attended the meeting.", "Can you assist me with this report?"],
  },
  {
    id: "prep-days", cat: "Prepositions", topic: "g.prepositions",
    re: new RegExp("\\b(in|at)\\s+(" + DAYS + ")(s?)\\b", "gi"),
    fix: (m, p, d, s) => `on ${d[0].toUpperCase() + d.slice(1).toLowerCase()}${s}`,
    es: "Con días de la semana se usa on: on Monday.",
    en: "Use on with days: on Monday.",
    ex: ["The meeting is on Monday.", "I don't work on Sundays."],
  },
  {
    id: "prep-months", cat: "Prepositions", topic: "g.prepositions",
    re: new RegExp("\\bon\\s+(" + MONTHS + "|march|may|summer|winter|spring|autumn|fall|(?:19|20)\\d\\d)\\b", "gi"),
    fix: (m, x) => `in ${/^[a-z]/i.test(x) && !/^(summer|winter|spring|autumn|fall)$/i.test(x) ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x}`,
    es: "Con meses, años y estaciones se usa in: in July, in 2025, in summer.",
    en: "Use in with months, years and seasons.",
    ex: ["I was born in 1990.", "The audit is in March."],
  },
  {
    id: "prep-morning", cat: "Prepositions", topic: "g.prepositions",
    re: /\b(at|on)\s+the\s+(morning|afternoon|evening)\b/gi,
    fix: (m, p, x) => `in the ${x}`,
    es: "Se dice in the morning / in the afternoon / in the evening, pero at night.",
    en: "In the morning / afternoon / evening — but at night.",
    ex: ["I study in the morning.", "She works at night."],
  },
  {
    id: "prep-night", cat: "Prepositions", topic: "g.prepositions",
    re: /\b(in|on)\s+the\s+night\b/gi,
    fix: () => "at night",
    es: "Se dice at night (sin the).",
    en: "We say at night.",
    ex: ["I can't sleep at night."],
  },
  {
    id: "prep-weekend", cat: "Prepositions", topic: "g.prepositions",
    re: /\bin\s+the\s+weekend\b/gi,
    fix: () => "on the weekend",
    es: "Se dice on the weekend (inglés americano) o at the weekend (británico).",
    en: "On the weekend (US) / at the weekend (UK).",
    ex: ["What do you do on the weekend?"],
  },
  {
    id: "present-since", cat: "Verb Tenses", topic: "g.present-perfect-2",
    re: /\b(i|we|they)\s+(work|live|study|know|am|are)\s+((?:\w+\s+){0,4}?)since\b/gi,
    fix: (m, s, v, mid) => `${s} have ${PP[v.toLowerCase()]} ${mid}since`,
    es: "Para algo que empezó en el pasado y continúa, se usa Present Perfect: I have worked here since 2020 (no «trabajo aquí desde»).",
    en: "Use the Present Perfect for situations that started in the past and continue now.",
    ex: ["I have lived here since 2019.", "We have known each other for years."],
  },
  {
    id: "since-duration", cat: "Verb Tenses", topic: "g.present-perfect-2",
    re: /\bsince\s+(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|many|several)\s+(years?|months?|weeks?|days?|hours?)\b/gi,
    fix: (m, n, u) => `for ${n} ${u}`,
    es: "For + duración (for three years); since + punto de inicio (since 2020, since Monday).",
    en: "For + a period of time; since + a starting point.",
    ex: ["I've worked here for three years.", "I've worked here since 2021."],
  },
  {
    id: "more-er", cat: "Grammar", topic: "g.comparatives",
    re: /\bmore\s+(better|worse|bigger|smaller|easier|harder|cheaper|faster|older|younger|larger|higher|lower|longer|shorter|safer|newer)\b/gi,
    fix: (m, c) => c,
    es: "No se usa more con un comparativo que ya termina en -er: better, bigger (no more better).",
    en: "Don't use more with -er comparatives.",
    ex: ["This option is better.", "The new pump is bigger."],
  },
  {
    id: "more-short-adj", cat: "Grammar", topic: "g.comparatives",
    re: /\bmore\s+(big|small|cheap|fast|old|young|large|high|low|long|short|easy|hard|good|bad|safe|new)\s+than\b/gi,
    fix: (m, a) => `${{ big: "bigger", small: "smaller", cheap: "cheaper", fast: "faster", old: "older", young: "younger", large: "larger", high: "higher", low: "lower", long: "longer", short: "shorter", easy: "easier", hard: "harder", good: "better", bad: "worse", safe: "safer", new: "newer" }[a.toLowerCase()]} than`,
    es: "Los adjetivos cortos forman el comparativo con -er: bigger than, cheaper than. Good → better, bad → worse.",
    en: "Short adjectives take -er: bigger than. Good → better, bad → worse.",
    ex: ["My car is older than yours.", "This plan is better than the last one."],
  },
  {
    id: "did-past", cat: "Verb Tenses", topic: "g.past-simple",
    re: new RegExp("\\b(didn't|did not|didnt)\\s+(" + PAST_IRREG + ")\\b", "gi"),
    fix: (m, d, v) => `${d} ${BASE_FROM_PAST[v.toLowerCase()] || v}`,
    es: "Después de did / didn't el verbo va en forma base: I didn't go (no didn't went). El pasado ya lo marca did.",
    en: "After did / didn't, use the base verb: didn't go.",
    ex: ["I didn't go to work yesterday.", "She didn't see the email."],
  },
  {
    id: "did-question-past", cat: "Verb Tenses", topic: "g.past-simple",
    re: new RegExp("\\bdid\\s+(you|he|she|it|we|they|i)\\s+(" + PAST_IRREG + ")\\b", "gi"),
    fix: (m, s, v) => `did ${s} ${BASE_FROM_PAST[v.toLowerCase()] || v}`,
    es: "En preguntas con did el verbo va en forma base: Did you go…? (no Did you went…?).",
    en: "In questions with did, use the base verb: Did you go?",
    ex: ["Did you finish the report?", "Where did they go?"],
  },
  {
    id: "past-time-present", cat: "Verb Tenses", topic: "g.past-simple",
    re: /\b(yesterday|last\s+(?:week|month|year|night|weekend|monday|friday)|(?:\d+|two|three|a few)\s+(?:days|weeks|months|years)\s+ago)\b([^.!?]{0,25}?)\b(i|we|they|you|he|she)\s+(go|have|do|see|eat|work|am|is|are|buy|make|take|come|get|visit|play|watch|meet|write|send|travel|call|start|finish|inspect|check|sign|review)\b/gi,
    fix: (m, when, mid, s, v) => `${when}${mid}${s} ${PAST[v.toLowerCase()] || v}`,
    es: "Con yesterday, last week, ago… la acción está terminada en el pasado: usa Past Simple (went, had, worked…).",
    en: "With finished past time (yesterday, last week, ago) use the Past Simple.",
    ex: ["Yesterday I went to the office.", "Two days ago we inspected the valve."],
  },
  {
    id: "present-time-past", cat: "Verb Tenses", topic: "g.past-simple",
    re: /\b(i|we|they|he|she)\s+(go|have|see|eat|buy|make|take|come|get|visit|meet|write|send|travel|call|inspect|sign)\b([^.!?]{0,25}?)\b(yesterday|last\s+(?:week|month|year|night|weekend)|(?:\d+|two|three|a few)\s+(?:days|weeks|months|years)\s+ago)\b/gi,
    fix: (m, s, v, mid, when) => `${s} ${PAST[v.toLowerCase()] || v}${mid}${when}`,
    es: "Con yesterday, last week, ago… usa Past Simple (went, had, saw…).",
    en: "With finished past time use the Past Simple.",
    ex: ["I called the supplier yesterday.", "We met last week."],
  },
  {
    id: "if-will", cat: "Verb Tenses", topic: "g.first-conditional",
    re: /\bif\s+(i|you|he|she|it|we|they)\s+will\s+(\w+)/gi,
    fix: (m, s, v) => `if ${s} ${/^(he|she|it)$/i.test(s) ? thirdPerson(v) : v}`,
    es: "Después de if no se usa will: If it rains, we will stay home. El will va en la otra parte de la frase.",
    en: "Don't use will after if: If it rains, we'll stay.",
    ex: ["If you send it today, I'll review it tomorrow.", "If it rains, we'll cancel."],
  },
  {
    id: "want-that", cat: "Grammar", topic: "g.gerunds-infinitives",
    re: /\b(i|we)\s+want\s+that\s+(you|he|she|they|it)\s+(\w+)/gi,
    fix: (m, s, o, v) => `${s} would like ${OBJ[o.toLowerCase()]} to ${BASE_FROM_PAST[v.toLowerCase()] || v.replace(/s$/, "")}`,
    es: "En inglés no se dice want that you…: se usa want / would like + persona + to + verbo: I'd like you to send the report.",
    en: "Want / would like + object + to-infinitive: I'd like you to send it.",
    ex: ["I'd like you to send the report.", "We want them to check the valve."],
  },
  {
    id: "missing-it", cat: "Word Order", topic: "g.be",
    re: /(^|[.!?]\s+)(is|was)\s+(important|necessary|possible|impossible|difficult|easy|good|bad|true|nice|interesting|dangerous|expensive|cheap|cold|hot|late|early|clear|urgent)\b/gi,
    fix: (m, pre, v, a) => `${pre}${cap(v, "it")} ${v.toLowerCase()} ${a}`,
    es: "En inglés la frase necesita sujeto: It is important… (en español decimos «Es importante» sin sujeto).",
    en: "English sentences need a subject: It is important…",
    ex: ["It is important to check the pressure.", "It was difficult."],
  },
  {
    id: "do-you-can", cat: "Word Order", topic: "g.can",
    re: /\b(do|does|did)\s+(you|he|she|it|we|they|i)\s+can\b/gi,
    fix: (m, d, s) => `can ${s}`,
    es: "Can no necesita do para preguntar: Can you help me?",
    en: "Modal verbs don't use do in questions: Can you…?",
    ex: ["Can you help me?", "Can she come tomorrow?"],
  },
  {
    id: "how-called", cat: "Word Order", topic: "g.questions",
    re: /\bhow\s+(?:is|are)\s+(?:it|this|that)?\s*called\b/gi,
    fix: () => "what is it called",
    es: "«¿Cómo se llama esto?» = What is it called? (con what, no how).",
    en: "What is it called? (not How is it called?)",
    ex: ["What is this tool called?", "What's your company called?"],
  },
  {
    id: "what-means", cat: "Word Order", topic: "g.questions",
    re: /\bwhat\s+means\s+(\w+)/gi,
    fix: (m, w) => `what does ${w} mean`,
    es: "Para preguntar el significado: What does X mean? (con does y mean al final).",
    en: "What does X mean?",
    ex: ["What does 'NCR' mean?", "What does this word mean?"],
  },
  {
    id: "double-negative", cat: "Grammar", topic: "g.quantifiers",
    re: /\b(don't|doesn't|didn't|can't|won't|never)\s+(\w+\s+)?(nothing|nobody|nowhere|none)\b/gi,
    fix: (m, n, v, x) => `${n} ${v || ""}${{ nothing: "anything", nobody: "anybody", nowhere: "anywhere", none: "any" }[x.toLowerCase()]}`,
    es: "En inglés no se usan dos negaciones: I don't know anything (o I know nothing).",
    en: "Avoid double negatives: I don't know anything.",
    ex: ["I don't know anything about it.", "We didn't see anybody."],
  },
  {
    id: "make-do", cat: "Vocabulary", topic: "g.present-simple",
    re: /\b(do|does|did|doing)\s+(a\s+|the\s+)?(mistake|mistakes|decision|decisions|noise|progress|complaint|suggestion|phone call)\b/gi,
    fix: (m, v, a, n) => `${{ do: "make", does: "makes", did: "made", doing: "making" }[v.toLowerCase()]} ${a || ""}${n}`,
    es: "Colocación: make a mistake, make a decision, make progress, make a complaint (no do).",
    en: "Collocation: make a mistake / a decision / progress.",
    ex: ["I made a mistake.", "We need to make a decision."],
  },
  {
    id: "make-question", cat: "Vocabulary", topic: "g.questions",
    re: /\b(make|makes|made|making)\s+(a\s+)?questions?\b/gi,
    fix: (m, v, a) => `${{ make: "ask", makes: "asks", made: "asked", making: "asking" }[v.toLowerCase()]} ${a || ""}${/questions$/i.test(m) ? "questions" : "question"}`,
    es: "«Hacer una pregunta» = ask a question (no make).",
    en: "We ask a question.",
    ex: ["Can I ask a question?"],
  },
  {
    id: "make-photo", cat: "Vocabulary", topic: "g.present-simple",
    re: /\b(make|makes|made|making)\s+(a\s+)?(photo|picture|photos|pictures)\b/gi,
    fix: (m, v, a, p) => `${{ make: "take", makes: "takes", made: "took", making: "taking" }[v.toLowerCase()]} ${a || ""}${p}`,
    es: "«Tomar una foto» = take a photo.",
    en: "We take a photo.",
    ex: ["Can you take a photo of the gauge?"],
  },
  {
    id: "make-homework", cat: "Vocabulary", topic: "g.present-simple",
    re: /\b(make|makes|made|making)\s+(my\s+|the\s+|your\s+|his\s+|her\s+)?(homework|exercise|exercises|sport|sports|the\s+dishes)\b/gi,
    fix: (m, v, a, n) => `${{ make: "do", makes: "does", made: "did", making: "doing" }[v.toLowerCase()]} ${a || ""}${n}`,
    es: "Colocación: do homework, do exercise, do sport(s), do the dishes (no make).",
    en: "Collocation: do homework / exercise / sport.",
    ex: ["I do exercise every morning.", "Did you do your homework?"],
  },
  {
    id: "said-that-me", cat: "Grammar", topic: "g.possessives",
    re: /\bone\s+of\s+(my|the|our|your|his|her|their)\s+(friend|colleague|brother|sister|problem|client|supplier|project|employee|customer)\b(?!s)/gi,
    fix: (m, d, n) => `one of ${d} ${n}s`,
    es: "One of + plural: one of my friends.",
    en: "One of + plural noun: one of my colleagues.",
    ex: ["One of my colleagues is from Chile.", "One of the pumps failed."],
  },
  {
    id: "for-to", cat: "Grammar", topic: "g.gerunds-infinitives",
    re: /\bfor\s+to\s+(\w+)/gi,
    fix: (m, v) => `to ${v}`,
    es: "«Para + verbo» = to + verbo: I study to get a better job (no for to).",
    en: "Purpose: to + verb, not for to.",
    ex: ["I'm learning English to get a better job."],
  },
  {
    id: "like-very-much", cat: "Word Order", topic: "g.present-simple",
    re: /\blike\s+very\s+much\s+(\w+(?:\s+\w+)?)/gi,
    fix: (m, o) => `like ${o} very much`,
    es: "Orden: verbo + objeto + very much: I like coffee very much.",
    en: "Verb + object + very much.",
    ex: ["I like my job very much."],
  },
  {
    id: "speak-well-english", cat: "Word Order", topic: "g.present-simple",
    re: /\b(speak|speaks|spoke)\s+(very\s+)?(well|good|fluently)\s+(english|spanish|french|portuguese|german)\b/gi,
    fix: (m, v, very, adv, l) => `${v} ${l[0].toUpperCase() + l.slice(1).toLowerCase()} ${very || ""}${adv.toLowerCase() === "good" ? "well" : adv}`,
    es: "El objeto va antes del adverbio: I speak English very well (no speak very well English).",
    en: "Verb + object + adverb: speak English very well.",
    ex: ["She speaks English very well."],
  },
  {
    id: "adverb-start", cat: "Word Order", topic: "g.present-simple",
    re: /(^|[.!?]\s+)(always|never)\s*,?\s+(i|you|we|they|he|she)\s+(\w+)/gi,
    fix: (m, pre, adv, s, v) => `${pre}${cap(adv, s.toLowerCase() === "i" ? "I" : s.toLowerCase())} ${adv.toLowerCase()} ${v}`,
    es: "Always / never van normalmente antes del verbo principal: I always check… (no Always I check…).",
    en: "Frequency adverbs usually go before the main verb.",
    ex: ["I always check the pressure first.", "We never work on Sundays."],
  },
  {
    id: "lowercase-i", cat: "Writing", topic: "g.pronouns",
    re: /(^|[^\w'])i(?=\s|'m|'ve|'ll|'d|$)/g, // sensible a mayúsculas: solo "i" minúscula
    fix: (m, pre) => `${pre}I`,
    es: "El pronombre I (yo) siempre se escribe con mayúscula.",
    en: "The pronoun I is always capitalized.",
    ex: ["I think I can do it."],
  },
  {
    id: "capital-names", cat: "Writing", topic: "g.prepositions",
    re: new RegExp("\\b(" + DAYS + "|" + MONTHS + "|" + LANGS + ")\\b", "g"), // sensible a mayúsculas
    fix: (m, w) => w[0].toUpperCase() + w.slice(1),
    es: "En inglés los días, los meses, los idiomas y las nacionalidades van con mayúscula: Monday, July, English.",
    en: "Days, months, languages and nationalities are capitalized.",
    ex: ["I study English on Mondays.", "The audit is in July."],
  },
];

export const RULE_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

// Detecta errores y devuelve correcciones explicadas
export function detect(text) {
  const found = [];
  for (const r of RULES) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(text))) {
      const wrong = m[0];
      const right = cap(wrong.trimStart(), r.fix(...m));
      found.push({ id: r.id, cat: r.cat, topic: r.topic, wrong: wrong.trimStart(), right: right.trimStart(), es: r.es, en: r.en, ex: r.ex, index: m.index });
      if (!r.re.global) break;
      if (m[0].length === 0) r.re.lastIndex++;
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

// Aplica todas las correcciones (se repite porque una corrección puede habilitar otra)
export function correct(text) {
  let out = String(text);
  for (let pass = 0; pass < 3; pass++) {
    const before = out;
    for (const r of RULES) {
      r.re.lastIndex = 0;
      out = out.replace(r.re, (...m) => {
        const wrong = m[0];
        const lead = wrong.match(/^\s*/)[0];
        return lead + cap(wrong.trimStart(), r.fix(...m).trimStart());
      });
    }
    if (out === before) break;
  }
  return out.replace(/\s{2,}/g, " ");
}
