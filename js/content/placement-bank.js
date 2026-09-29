// Ítems originales de lectura y listening para la prueba de nivel (sección 7).
// Gramática y vocabulario se toman del contenido de cada nivel (ver engine/placement.js).
export const READING_ITEMS = [
  { level: "A1", passage: "My name is Tom. I am from Canada. I have a sister. Her name is Lucy.", q: "Who is Lucy?", a: "Tom's sister", d: ["Tom's mother", "Tom's friend"] },
  { level: "A1", passage: "The shop opens at 9 a.m. and closes at 6 p.m. It is closed on Sundays.", q: "When is the shop closed?", a: "On Sundays", d: ["At 9 a.m.", "On Saturdays"] },
  { level: "A2", passage: "Last week I started a new job. The first day was difficult because I didn't know anyone, but my colleagues were very helpful.", q: "Why was the first day difficult?", a: "He didn't know anyone.", d: ["His colleagues weren't helpful.", "The job was boring."] },
  { level: "A2", passage: "Please note: the 8:15 train to Boston is delayed by 20 minutes. Passengers can take the 8:30 express instead.", q: "What can passengers do?", a: "Take the 8:30 express.", d: ["Wait until 9:15.", "Go to Boston by bus."] },
  { level: "B1", passage: "Although the new software was expensive, the company decided to buy it because it would reduce the time spent on reports by almost half.", q: "Why did the company buy the software?", a: "It would save time on reports.", d: ["It was cheap.", "The old software was broken."] },
  { level: "B1", passage: "Employees who wish to work remotely must submit a request to their manager at least one week in advance.", q: "What must employees do?", a: "Ask their manager a week before.", d: ["Work remotely every week.", "Tell HR the same day."] },
  { level: "B2", passage: "The audit revealed no major nonconformities; however, the auditors noted that several records were incomplete, which could become a significant risk if left unaddressed.", q: "What did the auditors say about the records?", a: "Some were incomplete and could become a risk.", d: ["They were perfect.", "They caused a major nonconformity."] },
  { level: "B2", passage: "Had the supplier informed us earlier about the shortage, we could have found an alternative source and avoided the delay.", q: "What does the writer imply?", a: "The supplier informed them too late.", d: ["There was no delay.", "They found an alternative source."] },
  { level: "C1", passage: "While the merger was initially hailed as a strategic masterstroke, subsequent integration problems have led analysts to question whether the projected synergies were ever realistic.", q: "What do analysts now question?", a: "Whether the expected benefits were realistic.", d: ["Whether the merger happened.", "Whether the integration was fast."] },
];

export const LISTENING_ITEMS = [
  { level: "A1", audio: "Hello, my name is Maria. I'm a teacher.", q: "What is Maria's job?", a: "Teacher", d: ["Doctor", "Student"] },
  { level: "A1", audio: "The meeting is on Tuesday at ten.", q: "When is the meeting?", a: "Tuesday at 10", d: ["Thursday at 2", "Tuesday at 12"] },
  { level: "A2", audio: "I'm sorry, I can't come tomorrow because I have a doctor's appointment.", q: "Why can't the speaker come?", a: "A doctor's appointment", d: ["A meeting", "A trip"] },
  { level: "A2", audio: "Take the second street on the left, and the hotel is next to the bank.", q: "Where is the hotel?", a: "Next to the bank", d: ["On the right", "Opposite the station"] },
  { level: "B1", audio: "We've already finished the inspection, but we're still waiting for the lab results before we can release the batch.", q: "What are they waiting for?", a: "The lab results", d: ["The inspection", "The batch"] },
  { level: "B1", audio: "If the supplier doesn't confirm the delivery date by Friday, we'll have to look for another option.", q: "What happens if the supplier doesn't confirm?", a: "They'll look for another option.", d: ["They'll cancel the project.", "They'll wait until Monday."] },
  { level: "B2", audio: "To be honest, the figures look promising, but I'd rather wait for the final report before committing to such a large investment.", q: "What does the speaker want to do?", a: "Wait for the final report", d: ["Invest immediately", "Reject the figures"] },
  { level: "C1", audio: "Not only did the new process cut lead times, but it also freed up the team to focus on continuous improvement initiatives.", q: "What was a second benefit?", a: "The team could focus on improvement.", d: ["Costs went up.", "Lead times increased."] },
];

// Frases para la parte de speaking / pronunciación (se leen en voz alta)
export const SPEAKING_ITEMS = [
  { level: "A1", text: "I work in an office in the city." },
  { level: "B1", text: "I've been working here for three years, and I really enjoy it." },
];

export const WRITING_ITEM = { prompt: "Write 3–5 sentences about your job or studies and what you did last week.", es: "Escribe 3–5 frases sobre tu trabajo o estudios y lo que hiciste la semana pasada." };
