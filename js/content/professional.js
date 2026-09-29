// Rutas de inglés profesional (secciones 45-90, 152, 168). Contenido original.

export const DISCLAIMER = {
  es: "Esta ruta enseña el idioma y el vocabulario de la profesión. No es asesoramiento legal, médico ni financiero.",
  en: "This route teaches professional language. It is not legal, medical or financial advice.",
};

// Frases por función comunicativa. [inglés, español, registro]
export const PHRASES = {
  meeting: { title: "Meeting English", icon: "🗓️", groups: [
    ["Opening a meeting", [["Shall we get started?", "¿Empezamos?", "neutral"], ["Thanks for coming. The purpose of today's meeting is to…", "Gracias por venir. El objetivo de la reunión de hoy es…", "formal"], ["Let's go through the agenda.", "Repasemos el orden del día.", "neutral"]]],
    ["Giving opinions", [["In my opinion, we should…", "En mi opinión, deberíamos…", "neutral"], ["I think the main issue is…", "Creo que el problema principal es…", "neutral"], ["From a technical point of view,…", "Desde el punto de vista técnico,…", "formal"]]],
    ["Agreeing", [["I completely agree.", "Estoy totalmente de acuerdo.", "neutral"], ["That's a good point.", "Buen punto.", "neutral"], ["You're absolutely right.", "Tienes toda la razón.", "neutral"]]],
    ["Disagreeing politely", [["I see your point, but…", "Entiendo tu punto, pero…", "neutral"], ["I'm not sure I agree with that.", "No estoy seguro de estar de acuerdo.", "formal"], ["I'm afraid I have a different view.", "Me temo que tengo una opinión diferente.", "formal"]]],
    ["Interrupting", [["Sorry to interrupt, but…", "Perdón por interrumpir, pero…", "neutral"], ["Could I just add something?", "¿Puedo añadir algo?", "formal"], ["If I may come in here…", "Si me permiten intervenir…", "formal"]]],
    ["Asking for clarification", [["Could you clarify what you mean by…?", "¿Podrías aclarar qué quieres decir con…?", "formal"], ["Sorry, I didn't quite catch that.", "Perdón, no te entendí bien.", "neutral"], ["Do you mean that…?", "¿Quieres decir que…?", "neutral"]]],
    ["Summarizing", [["So, to sum up,…", "Entonces, para resumir,…", "neutral"], ["Let me summarize the main points.", "Permítanme resumir los puntos principales.", "formal"], ["So we've agreed that…", "Entonces hemos acordado que…", "neutral"]]],
    ["Assigning actions", [["Who's going to take care of this?", "¿Quién se va a encargar de esto?", "neutral"], ["Ana, could you follow up with the supplier?", "Ana, ¿podrías hacer seguimiento con el proveedor?", "neutral"], ["Let's set a deadline for this action.", "Pongamos una fecha límite para esta acción.", "neutral"]]],
    ["Closing meetings", [["I think we've covered everything.", "Creo que hemos cubierto todo.", "neutral"], ["Thanks, everyone. I'll send the minutes today.", "Gracias a todos. Enviaré el acta hoy.", "neutral"], ["Let's meet again next week.", "Reunámonos de nuevo la próxima semana.", "neutral"]]],
  ]},
  presentation: { title: "Presentation Coach", icon: "🎤", groups: [
    ["Opening", [["Good morning, everyone. Thank you for being here.", "Buenos días a todos. Gracias por estar aquí.", "formal"], ["Today I'm going to talk about…", "Hoy voy a hablar sobre…", "neutral"]]],
    ["Introducing the agenda", [["My presentation has three parts.", "Mi presentación tiene tres partes.", "neutral"], ["First, I'll…, then…, and finally…", "Primero…, luego… y finalmente…", "neutral"]]],
    ["Transitions", [["Let's move on to…", "Pasemos a…", "neutral"], ["That brings me to my next point.", "Eso me lleva al siguiente punto.", "formal"]]],
    ["Explaining charts", [["As you can see in this chart,…", "Como pueden ver en este gráfico,…", "neutral"], ["Sales rose sharply in March.", "Las ventas subieron bruscamente en marzo.", "neutral"], ["The figure remained stable.", "La cifra se mantuvo estable.", "neutral"]]],
    ["Emphasizing points", [["I'd like to highlight that…", "Me gustaría destacar que…", "formal"], ["The key point here is…", "El punto clave aquí es…", "neutral"]]],
    ["Answering questions", [["That's a great question.", "Excelente pregunta.", "neutral"], ["I'm not sure, but I'll find out and get back to you.", "No estoy seguro, pero lo averiguaré y le responderé.", "formal"]]],
    ["Closing", [["To conclude,…", "Para concluir,…", "formal"], ["Thank you for your attention. Any questions?", "Gracias por su atención. ¿Alguna pregunta?", "neutral"]]],
  ]},
  negotiation: { title: "Negotiation English", icon: "🤝", groups: [
    ["Commercial negotiation", [["We're looking for a long-term partnership.", "Buscamos una alianza a largo plazo.", "formal"], ["Could you offer a volume discount?", "¿Podrían ofrecer un descuento por volumen?", "neutral"]]],
    ["Salary negotiation", [["Based on my experience, I was expecting a salary in the range of…", "Según mi experiencia, esperaba un salario en el rango de…", "formal"], ["Is there any flexibility on the base salary?", "¿Hay flexibilidad en el salario base?", "formal"]]],
    ["Supplier negotiation", [["If you can reduce the lead time, we can increase the order.", "Si pueden reducir el plazo de entrega, podemos aumentar el pedido.", "neutral"], ["That price is above our budget.", "Ese precio supera nuestro presupuesto.", "neutral"]]],
    ["Contract negotiation", [["We'd like to propose an amendment to clause 8.", "Quisiéramos proponer una modificación a la cláusula 8.", "formal"], ["We can accept that, provided that…", "Podemos aceptarlo, siempre que…", "formal"]]],
    ["Technical negotiation", [["The specification requires X, but we can offer an equivalent.", "La especificación exige X, pero podemos ofrecer un equivalente.", "formal"], ["Would you accept a deviation if we provide test results?", "¿Aceptarían una desviación si entregamos resultados de prueba?", "formal"]]],
  ]},
  audit: { title: "Audit English", icon: "🔍", groups: [
    ["Opening meeting", [["The scope of this audit covers production and storage.", "El alcance de esta auditoría cubre producción y almacenamiento.", "formal"], ["We'll present our findings at the closing meeting.", "Presentaremos nuestros hallazgos en la reunión de cierre.", "formal"]]],
    ["Audit questions", [["Could you walk me through the process?", "¿Podría explicarme el proceso paso a paso?", "neutral"], ["How do you control this document?", "¿Cómo controlan este documento?", "neutral"]]],
    ["Evidence request", [["Could you show me the records for last month?", "¿Podría mostrarme los registros del mes pasado?", "formal"], ["Do you have evidence of training?", "¿Tiene evidencia de la capacitación?", "neutral"]]],
    ["Findings & observations", [["This is an observation, not a nonconformity.", "Esto es una observación, no una no conformidad.", "formal"], ["We identified a minor nonconformity in…", "Identificamos una no conformidad menor en…", "formal"]]],
    ["Corrective actions", [["What is the root cause?", "¿Cuál es la causa raíz?", "neutral"], ["Please submit a corrective action plan within 30 days.", "Por favor presente un plan de acción correctiva en 30 días.", "formal"]]],
    ["Closing meeting", [["Thank you for your cooperation.", "Gracias por su colaboración.", "formal"], ["Overall, the system is effective.", "En general, el sistema es eficaz.", "formal"]]],
  ]},
  phone: { title: "Phone calls", icon: "📞", groups: [
    ["Starting a call", [["Hi, this is Ana from QualiTech. Is this a good time?", "Hola, habla Ana de QualiTech. ¿Es buen momento?", "neutral"], ["I'm calling about…", "Llamo por…", "neutral"]]],
    ["Problems", [["Sorry, you're breaking up.", "Perdón, se corta.", "neutral"], ["Could you speak a little more slowly?", "¿Podría hablar un poco más despacio?", "neutral"]]],
    ["Ending", [["I'll send you an email to confirm.", "Le enviaré un correo para confirmar.", "neutral"], ["Thanks for your time. Bye.", "Gracias por su tiempo. Adiós.", "neutral"]]],
  ]},
};

// Correos modelo (secciones 48, 69, 78). Estructura: saludo · propósito · detalles · petición · cierre
export const EMAILS = [
  { id: "e.request-docs", route: "law", title: "Request documents", es: "Solicitar documentos", subject: "Request for documents – Supply Agreement", body: "Dear Mr. Evans,\n\nI am writing to request the signed copies of the Supply Agreement dated 3 March.\n\nCould you please send them by Friday, 12 April? We need them to complete our internal review.\n\nThank you in advance.\n\nKind regards,\nAna Torres", tone: "formal" },
  { id: "e.contract-review", route: "law", title: "Contract review comments", es: "Comentarios sobre contrato", subject: "Comments on draft agreement", body: "Dear Emma,\n\nThank you for sending the draft agreement. Please find our comments attached.\n\nOur main concern is clause 9.2 (Limitation of Liability). We would like to propose a cap equal to the contract value.\n\nI would be happy to discuss this on a call this week.\n\nBest regards,\nCarlos", tone: "formal" },
  { id: "e.interview-invite", route: "hr", title: "Interview invitation", es: "Invitación a entrevista", subject: "Interview invitation – QA Engineer", body: "Dear Ms. Rivera,\n\nThank you for applying for the QA Engineer position. We are pleased to invite you to an interview on Tuesday, 14 May, at 10:00 a.m.\n\nThe interview will take about 45 minutes and will be held online.\n\nPlease confirm your availability.\n\nBest regards,\nSarah Collins\nHR Manager", tone: "formal" },
  { id: "e.job-offer", route: "hr", title: "Job offer", es: "Oferta de trabajo", subject: "Job offer – Maintenance Supervisor", body: "Dear Mr. López,\n\nWe are delighted to offer you the position of Maintenance Supervisor. Your start date would be 1 July.\n\nPlease find the details of the compensation package attached.\n\nWe look forward to welcoming you to the team.\n\nKind regards,\nSarah Collins", tone: "formal" },
  { id: "e.candidate-rejection", route: "hr", title: "Candidate rejection", es: "Rechazo de candidato", subject: "Your application", body: "Dear Mr. Silva,\n\nThank you for your interest in the Project Engineer position and for the time you spent with us.\n\nAfter careful consideration, we have decided to move forward with another candidate.\n\nWe will keep your details on file for future opportunities.\n\nBest wishes,\nSarah Collins", tone: "formal" },
  { id: "e.leave-approval", route: "hr", title: "Leave approval", es: "Aprobación de licencia", subject: "Leave request approved", body: "Hi Luis,\n\nYour leave request for 10–14 June has been approved.\n\nPlease make sure your tasks are covered before you go.\n\nEnjoy your time off!\n\nBest,\nSarah", tone: "neutral" },
  { id: "e.policy-update", route: "hr", title: "Policy update", es: "Actualización de política", subject: "Update to the remote work policy", body: "Dear all,\n\nPlease note that the remote work policy has been updated. From 1 September, employees may work remotely up to two days per week.\n\nThe full policy is available on the intranet.\n\nIf you have any questions, please contact HR.\n\nKind regards,\nHuman Resources", tone: "formal" },
  { id: "e.training-invite", route: "hr", title: "Training invitation", es: "Invitación a capacitación", subject: "Invitation: Leadership training", body: "Dear team,\n\nWe are pleased to invite you to our leadership training on 20 May, from 9:00 to 13:00, in Room B.\n\nPlease register by 15 May.\n\nBest regards,\nL&D Team", tone: "formal" },
  { id: "e.ncr", route: "qaqc", title: "Non-conformance notification", es: "Notificación de no conformidad", subject: "NCR-045 – Weld porosity on spool 12", body: "Dear Mr. Chen,\n\nDuring today's inspection we found porosity on weld W-12 of spool 12. The weld does not meet the acceptance criteria of the approved procedure.\n\nWe have raised NCR-045 (attached). Please send your proposed corrective action by Thursday.\n\nBest regards,\nDaniel Brooks\nQA/QC Lead", tone: "formal" },
  { id: "e.follow-up", route: "business", title: "Follow-up after a meeting", es: "Seguimiento tras reunión", subject: "Follow-up: project meeting", body: "Hi all,\n\nThanks for your time today. Here is a quick summary of the action items:\n\n1. Mike – update the schedule by Monday.\n2. Ana – confirm the delivery date with the supplier.\n\nLet me know if I missed anything.\n\nBest,\nSofia", tone: "neutral" },
  { id: "e.delay", route: "engineering", title: "Explaining a delay", es: "Explicar un retraso", subject: "Delay in pump installation", body: "Dear Mr. Grant,\n\nI would like to inform you that the pump installation will be delayed by three days because the motor was damaged during transport.\n\nA replacement motor will arrive on Wednesday, and we expect to complete the installation by Friday.\n\nWe apologize for the inconvenience.\n\nBest regards,\nAlex Morgan", tone: "formal" },
];

// Cláusulas educativas simplificadas (sección 75) — ejemplos de aprendizaje, no textos legales reales
export const CLAUSES = [
  { id: "c.notwithstanding", title: "Notwithstanding", original: "Notwithstanding anything to the contrary in this Agreement, the Supplier shall remain liable for defects in the Goods.", vocab: [["notwithstanding", "no obstante / sin perjuicio de"], ["to the contrary", "en sentido contrario"], ["shall remain liable", "seguirá siendo responsable"]], meaning: "Aunque otra parte del contrato diga algo distinto, el proveedor sigue siendo responsable de los defectos.", plain: "Even if another part of the agreement says something different, the Supplier is still responsible for defects.", grammar: "shall + base verb expresses a legal obligation; 'notwithstanding' is a formal preposition meaning 'despite'." },
  { id: "c.termination", title: "Termination for convenience", original: "Either Party may terminate this Agreement for convenience upon thirty (30) days' prior written notice to the other Party.", vocab: [["either party", "cualquiera de las partes"], ["terminate", "rescindir / terminar"], ["for convenience", "por conveniencia (sin causa)"], ["prior written notice", "aviso previo por escrito"]], meaning: "Cualquiera de las dos partes puede terminar el contrato sin dar un motivo, avisando por escrito con 30 días de anticipación.", plain: "Both sides can end the contract without a reason if they give 30 days' written notice.", grammar: "may = permission; 'upon' = formal 'on / after'; numbers are written in words and figures." },
  { id: "c.force-majeure", title: "Force majeure", original: "Neither Party shall be liable for any failure or delay in performance caused by events beyond its reasonable control, including natural disasters, war or government action.", vocab: [["neither party", "ninguna de las partes"], ["failure or delay in performance", "incumplimiento o retraso en la ejecución"], ["beyond its reasonable control", "fuera de su control razonable"]], meaning: "Nadie es responsable si no puede cumplir por hechos que no puede controlar (desastres, guerra, decisiones del gobierno).", plain: "Nobody is responsible if something they cannot control stops them from doing their job.", grammar: "Neither … shall be = negative obligation; participle clause 'caused by…' describes the events." },
  { id: "c.confidentiality", title: "Confidentiality", original: "The Receiving Party shall not disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party.", vocab: [["receiving party", "parte receptora"], ["disclose", "revelar / divulgar"], ["third party", "tercero"], ["prior written consent", "consentimiento previo por escrito"]], meaning: "Quien recibe información confidencial no puede compartirla con otros sin permiso escrito previo.", plain: "If you receive secret information, you can't share it with anyone without written permission first.", grammar: "shall not = prohibition; 'without + noun' expresses a condition." },
  { id: "c.governing-law", title: "Governing law", original: "This Agreement shall be governed by and construed in accordance with the laws of the State of New York.", vocab: [["governed by", "regido por"], ["construed", "interpretado"], ["in accordance with", "de conformidad con"]], meaning: "Se aplican e interpretan las leyes de Nueva York.", plain: "New York law applies to this contract and is used to understand it.", grammar: "Passive voice with shall be + past participle; paired verbs (governed and construed) are typical of legal style." },
  { id: "c.indemnity", title: "Indemnification", original: "The Contractor shall indemnify and hold harmless the Company from and against all claims arising out of the Contractor's negligence.", vocab: [["indemnify", "indemnizar"], ["hold harmless", "mantener indemne"], ["arising out of", "derivados de"], ["negligence", "negligencia"]], meaning: "El contratista debe proteger y compensar a la empresa por reclamos causados por la negligencia del contratista.", plain: "If the Contractor is careless and someone makes a claim, the Contractor pays and protects the Company.", grammar: "Legal doublets (indemnify and hold harmless, from and against); 'arising out of' = participle meaning 'caused by'." },
  { id: "c.amendment", title: "Amendments", original: "No amendment to this Agreement shall be effective unless made in writing and signed by authorized representatives of both Parties.", vocab: [["amendment", "modificación"], ["effective", "válido / en vigor"], ["authorized representatives", "representantes autorizados"]], meaning: "Los cambios al contrato solo valen si se hacen por escrito y los firman representantes autorizados de ambas partes.", plain: "Changes only count if they are written down and signed by people allowed to sign for both sides.", grammar: "No … shall be … unless = strong condition; reduced passive 'made in writing'." },
];

// Plain English (sección 76): expresiones jurídicas → inglés sencillo
export const PLAIN_ENGLISH = [
  ["Notwithstanding anything to the contrary…", "Even if another part of the agreement says something different…"],
  ["In the event that…", "If…"],
  ["Prior to…", "Before…"],
  ["Pursuant to clause 5…", "Under clause 5… / As clause 5 says…"],
  ["The Parties hereby agree…", "Both sides agree…"],
  ["Shall be deemed to be…", "Will be treated as…"],
  ["In accordance with…", "Following… / As required by…"],
  ["Subject to…", "Depending on… / Only if…"],
  ["Hereinafter referred to as 'the Company'", "Called 'the Company' from now on"],
  ["With respect to…", "About…"],
  ["It is incumbent upon the employee to…", "The employee must…"],
  ["Null and void", "Not valid, with no legal effect"],
];

// Career coach (secciones 88-90)
export const CV_VERBS = [
  ["Led", "Lideré", "Led a team of 12 technicians during the plant shutdown."],
  ["Managed", "Gestioné", "Managed a $2M maintenance budget."],
  ["Implemented", "Implementé", "Implemented a new inspection procedure that reduced rework by 30%."],
  ["Developed", "Desarrollé", "Developed a training program for new operators."],
  ["Coordinated", "Coordiné", "Coordinated inspections with three international suppliers."],
  ["Improved", "Mejoré", "Improved on-time delivery from 82% to 95%."],
  ["Reduced", "Reduje", "Reduced overtime costs by 18% in six months."],
  ["Achieved", "Logré", "Achieved ISO 9001 certification in the first audit."],
  ["Supported", "Apoyé", "Supported the HR team in hiring 40 employees."],
  ["Negotiated", "Negocié", "Negotiated supplier contracts saving $150K per year."],
  ["Audited", "Audité", "Audited 25 suppliers against quality requirements."],
];

export const LINKEDIN = [
  { part: "Headline", tip: "Rol + especialidad + valor. Máx. ~220 caracteres.", example: "QA/QC Engineer | Oil & Gas | Welding Inspection & Supplier Quality | Helping projects deliver right the first time" },
  { part: "About", tip: "3 párrafos cortos: quién eres, logros con números, qué buscas.", example: "I'm a QA/QC engineer with 8 years of experience in oil and gas projects. I've led inspections for pipelines and pressure vessels and reduced non-conformances by 35% on my last project.\n\nI enjoy working with suppliers to solve quality problems early.\n\nI'm currently open to international opportunities." },
  { part: "Experience", tip: "Verbo de acción en pasado + tarea + resultado medible.", example: "• Led welding inspections for a 40 km pipeline project.\n• Implemented a digital ITP tracking system, cutting report time by 50%." },
  { part: "Skills", tip: "Habilidades técnicas + blandas relevantes.", example: "Quality Control · ITP · NDT · ISO 9001 · Supplier Audits · Root Cause Analysis · Technical English" },
  { part: "Networking message", tip: "Breve, personal y con una razón clara.", example: "Hi Maria, I enjoyed your post about supplier audits. I also work in QA/QC in the energy sector and would love to connect and learn from your experience." },
  { part: "Professional post", tip: "Una idea, una historia corta, una pregunta al final.", example: "Last month our team closed 20 NCRs in two weeks. The secret? A 15-minute daily call with the supplier. What's your best tip for closing NCRs faster?" },
];

export const STAR = [
  ["Situation", "Situación", "Describe el contexto: dónde, cuándo, qué pasaba.", "Last year, our main supplier delivered pipes with incorrect certificates."],
  ["Task", "Tarea", "Tu responsabilidad o el objetivo.", "As the QA lead, I had to solve the problem without delaying the project."],
  ["Action", "Acción", "Lo que TÚ hiciste (usa I, verbos de acción en pasado).", "I organized a meeting with the supplier, reviewed the traceability records and requested new MTRs."],
  ["Result", "Resultado", "El resultado, idealmente con números.", "We received the correct documents in four days and the project stayed on schedule."],
];

// Preguntas de entrevista por tipo (sección 60)
export const INTERVIEW = {
  basic: { title: "Basic Interview", level: "A2", qs: ["Tell me about yourself.", "Where are you from?", "Why do you want this job?", "What are your hobbies?", "What are your strengths?"] },
  professional: { title: "Professional Interview", level: "B1", qs: ["Can you describe your current role?", "What are your main responsibilities?", "Why are you leaving your current job?", "Where do you see yourself in five years?", "What do you know about our company?"] },
  technical: { title: "Technical Interview", level: "B1", qs: ["How would you explain your technical area to a non-expert?", "What tools or software do you use every day?", "Describe a technical problem you solved recently.", "How do you make sure your work meets the required standards?", "What would you do if a test result was outside the specification?"] },
  behavioral: { title: "Behavioral Interview (STAR)", level: "B1", qs: ["Tell me about a time you had a conflict with a colleague.", "Describe a situation where you made a mistake. What did you learn?", "Tell me about a time you worked under pressure.", "Give an example of when you showed leadership.", "Describe a time you had to meet a tight deadline."] },
  managerial: { title: "Managerial Interview", level: "B2", qs: ["How do you motivate your team?", "How do you handle an underperforming employee?", "Describe your leadership style.", "How do you prioritize when everything is urgent?", "Tell me about a difficult decision you made as a manager."] },
  hr: { title: "HR Interview", level: "B1", qs: ["What are your salary expectations?", "When could you start?", "Are you willing to travel?", "How do you handle stress?", "Do you have any questions for us?"] },
};

// Rutas (cada una: módulos → vocabulario/frases/escenarios/correos)
export const ROUTES = [
  { id: "business", title: "Business English", es: "Inglés de negocios", icon: "📈", character: "sofia", concept: "b.business",
    modules: [
      { title: "Meetings", vocab: ["meetings"], phrases: "meeting", talk: ["meeting"] },
      { title: "Emails", emails: ["e.follow-up"] },
      { title: "Presentations", phrases: "presentation", talk: ["presentation"] },
      { title: "Negotiations", phrases: "negotiation", talk: ["salary-negotiation", "supplier-meeting"] },
      { title: "Phone calls", phrases: "phone" },
      { title: "Reports, networking & project updates", vocab: ["business", "pm"] },
    ] },
  { id: "engineering", title: "English for Engineering", es: "Inglés para ingeniería", icon: "⚙️", character: "alex", concept: "p.engineering",
    modules: [
      { title: "Equipment, maintenance & operations", vocab: ["eng-core"] },
      { title: "Projects", vocab: ["pm"] },
      { title: "Safety", vocab: ["hse"] },
      { title: "Emails", emails: ["e.delay"] },
      { title: "Role plays", talk: ["equipment-failure", "engineer-supervisor"] },
    ] },
  { id: "oilgas", title: "Oil & Gas English", es: "Inglés para petróleo y gas", icon: "🛢️", character: "alex", concept: "p.oilgas",
    modules: [
      { title: "Drilling, production & pipelines", vocab: ["oil-core"] },
      { title: "HSE", vocab: ["hse"] },
      { title: "Role plays", talk: ["shutdown-report"] },
    ] },
  { id: "qaqc", title: "QA/QC English", es: "Inglés para QA/QC", icon: "✅", character: "daniel", concept: "p.qaqc",
    modules: [
      { title: "Inspection & quality", vocab: ["qa-core"] },
      { title: "Documents & control points", vocab: ["qa-docs"] },
      { title: "NCR emails", emails: ["e.ncr"] },
      { title: "Simulations", talk: ["inspection-rejected", "inspector-supplier"] },
    ] },
  { id: "audit", title: "Audit English", es: "Inglés de auditoría", icon: "🔍", character: "daniel", concept: "p.audit",
    modules: [
      { title: "Audit vocabulary", vocab: ["audit"] },
      { title: "Audit phrases", phrases: "audit" },
      { title: "Role play", talk: ["audit-interview"] },
    ] },
  { id: "energy", title: "Energy English", es: "Inglés para energía", icon: "⚡", character: "alex", concept: "p.energy",
    modules: [{ title: "Renewables, grid & efficiency", vocab: ["energy"] }] },
  { id: "hr", title: "English for HR", es: "Inglés para RR. HH.", icon: "🧑‍💼", character: "sarah", concept: "p.hr",
    modules: [
      { title: "Recruitment", vocab: ["hr-recruitment"], talk: ["job-interview"] },
      { title: "Onboarding", vocab: ["hr-onboarding"] },
      { title: "Performance management", vocab: ["hr-performance"] },
      { title: "Employee relations", vocab: ["hr-relations"], talk: ["employee-complaint"] },
      { title: "Policies, compensation & benefits", vocab: ["hr-policies"], talk: ["leave-clarification"] },
      { title: "Learning & development", vocab: ["hr-ld"] },
      { title: "HR email coach", emails: ["e.interview-invite", "e.job-offer", "e.candidate-rejection", "e.training-invite", "e.leave-approval", "e.policy-update"] },
    ] },
  { id: "law", title: "Legal English", es: "Inglés jurídico", icon: "⚖️", character: "emma", concept: "p.law", disclaimer: true,
    modules: [
      { title: "Legal vocabulary", vocab: ["law-core"] },
      { title: "Legal systems", vocab: ["law-systems"] },
      { title: "Contract English", vocab: ["law-contract"], clauses: true },
      { title: "Plain English mode", plain: true },
      { title: "Legal emails", emails: ["e.request-docs", "e.contract-review"] },
      { title: "Litigation", vocab: ["law-litigation"] },
      { title: "Corporate law", vocab: ["law-corporate"] },
      { title: "Contract negotiation", phrases: "negotiation", talk: ["contract-change"] },
    ] },
  { id: "hrlaw", title: "HR & Employment Law English", es: "RR. HH. y derecho laboral", icon: "🏛️", character: "sarah", concept: "p.hrlaw", disclaimer: true,
    modules: [
      { title: "Labor law vocabulary", vocab: ["law-labor"] },
      { title: "Compliance", vocab: ["law-compliance"] },
      { title: "Simulations", talk: ["employee-complaint", "disciplinary-meeting"] },
    ] },
  { id: "finance", title: "Finance English", es: "Inglés para finanzas", icon: "💹", character: "sofia", concept: "p.finance", disclaimer: true,
    modules: [{ title: "Finance vocabulary", vocab: ["finance"] }] },
  { id: "medicine", title: "Medical English", es: "Inglés médico", icon: "🩺", character: "nova", concept: "p.medicine", disclaimer: true,
    modules: [{ title: "Medical vocabulary", vocab: ["medicine", "health"] }, { title: "Role play", talk: ["doctor"] }] },
  { id: "tech", title: "Technology English", es: "Inglés para tecnología", icon: "🖥️", character: "mike", concept: "p.tech",
    modules: [{ title: "IT vocabulary", vocab: ["tech", "technology"] }] },
  { id: "procurement", title: "Procurement English", es: "Inglés para compras", icon: "🛒", character: "sofia", concept: "p.procurement",
    modules: [{ title: "Procurement vocabulary", vocab: ["procurement"] }, { title: "Role play", talk: ["supplier-meeting"] }] },
  { id: "career", title: "Career Coach", es: "Coach de carrera", icon: "🚀", character: "sofia", concept: "b.career",
    modules: [
      { title: "CV English", cv: true },
      { title: "LinkedIn English", linkedin: true },
      { title: "STAR method", star: true },
      { title: "AI Job Interview", interview: true },
      { title: "Networking & career conversation", talk: ["networking"] },
    ] },
];

export const ROUTE_BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

// Relación objetivo/profesión del onboarding → rutas recomendadas
export const PROFESSION_ROUTES = {
  Engineering: ["engineering", "business"], "Oil & Gas": ["oilgas", "engineering"], Energy: ["energy", "engineering"],
  "QA/QC": ["qaqc", "audit"], "Human Resources": ["hr", "hrlaw"], Law: ["law", "hrlaw"], Finance: ["finance", "business"],
  Technology: ["tech", "business"], Medicine: ["medicine"], Business: ["business", "career"], Tourism: ["business"],
  Procurement: ["procurement", "business"], Auditing: ["audit", "qaqc"],
};
