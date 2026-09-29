// Escenarios de conversación / role play / Real Life Mode (secciones 29-32, 51, 54, 59, 70, 79, 84, 91-92, 152).
// Paso: { ai, es, h: [vocab, estructura, inicio, frase sugerida], go?: [[palabras clave "a|b" (todas deben aparecer), índice destino]], end? }
// Si no hay coincidencia, la conversación sigue al paso siguiente (no se bloquea al estudiante).

const S = (id, title, es, cat, level, character, emoji, goal, steps, extra = {}) => ({ id, title, es, cat, level, character, emoji, goal, steps, ...extra });

export const SCENARIOS = [
  S("airport", "At the airport", "En el aeropuerto", "travel", "A1", "officer", "🛫", "Pass immigration and answer basic questions.", [
    { ai: "Good morning. May I see your passport, please?", es: "Buenos días. ¿Puedo ver su pasaporte, por favor?", h: ["passport, here", "Here is + my + …", "Here is…", "Here is my passport."] },
    { ai: "Thank you. What is the purpose of your visit?", es: "Gracias. ¿Cuál es el propósito de su visita?", h: ["business, tourism, vacation, work", "I'm here for + purpose", "I'm here for…", "I'm here for business."],
      go: [["business|work|meeting|conference", 2], ["tourism|vacation|holiday|visit|family", 3]] },
    { ai: "I see. Which company are you visiting?", es: "Entiendo. ¿Qué empresa va a visitar?", h: ["company, visit, client", "I'm visiting + company", "I'm visiting…", "I'm visiting a client, Energy Solutions."], go: [["", 4]] },
    { ai: "Nice. Is this your first time in the country?", es: "Qué bien. ¿Es su primera vez en el país?", h: ["first time, before", "Yes, it is. / No, I've been here before.", "Yes, it…", "Yes, it is my first time."] },
    { ai: "How long are you staying?", es: "¿Cuánto tiempo se va a quedar?", h: ["days, week, until", "I'm staying for + time", "I'm staying for…", "I'm staying for five days."] },
    { ai: "Where are you staying?", es: "¿Dónde se va a alojar?", h: ["hotel, friend's house", "I'm staying at + place", "I'm staying at…", "I'm staying at the Plaza Hotel."] },
    { ai: "Everything is in order. Enjoy your stay!", es: "Todo está en orden. ¡Disfrute su estancia!", h: ["thank you", "Thank you + have a nice day", "Thank…", "Thank you very much. Have a nice day!"], end: true },
  ], { story: true }),
  S("hotel", "Hotel check-in", "Registro en el hotel", "travel", "A1", "reception", "🏨", "Check in and ask about hotel services.", [
    { ai: "Good evening! Welcome to the Ocean View Hotel. How can I help you?", es: "¡Buenas noches! Bienvenido al hotel Ocean View. ¿En qué puedo ayudarle?", h: ["reservation, check in, name", "I have a reservation + under + name", "I have a…", "Hi, I have a reservation under the name Torres."] },
    { ai: "Let me check… Yes, a double room for three nights. Can I see your ID, please?", es: "Déjeme revisar… Sí, una habitación doble por tres noches. ¿Puedo ver su identificación?", h: ["passport, ID, here", "Here is/Here you are", "Here…", "Sure, here you are."] },
    { ai: "Thank you. Would you like breakfast included? It's fifteen dollars per day.", es: "Gracias. ¿Desea el desayuno incluido? Son quince dólares al día.", h: ["yes please, no thanks", "Yes, please. / No, thank you.", "Yes…", "Yes, please. That sounds good."], go: [["yes|sure|ok|please", 3], ["no|not", 3]] },
    { ai: "Perfect. Your room is 512 on the fifth floor. Do you have any questions?", es: "Perfecto. Su habitación es la 512 en el quinto piso. ¿Tiene alguna pregunta?", h: ["Wi-Fi, password, breakfast time, check-out", "What time is…? / Is there…?", "What time is…", "What time is check-out?"] },
    { ai: "Check-out is at noon, and the Wi-Fi password is on your key card. Anything else?", es: "La salida es al mediodía y la clave del Wi-Fi está en su tarjeta. ¿Algo más?", h: ["no, thank you, that's all", "That's all, thank you.", "That's…", "No, that's all. Thank you!"] },
    { ai: "You're welcome. Enjoy your stay!", es: "De nada. ¡Disfrute su estancia!", h: ["thanks", "Thanks!", "Thanks…", "Thanks, good night!"], end: true },
  ], { story: true }),
  S("restaurant", "At a restaurant", "En un restaurante", "travel", "A1", "waiter", "🍽️", "Order food and drinks and ask for the bill.", [
    { ai: "Hi there! Table for how many?", es: "¡Hola! ¿Mesa para cuántos?", h: ["two, one, four", "A table for + number, please.", "A table for…", "A table for two, please."] },
    { ai: "Great, follow me. Here's the menu. Can I get you something to drink?", es: "Genial, síganme. Aquí está el menú. ¿Les traigo algo de beber?", h: ["water, juice, coffee", "I'd like + drink, please.", "I'd like…", "I'd like a glass of water, please."] },
    { ai: "Sure. Are you ready to order?", es: "Claro. ¿Están listos para pedir?", h: ["chicken, fish, salad, soup", "I'll have + dish / Could I have…?", "I'll have…", "Yes, I'll have the grilled chicken with rice."] },
    { ai: "Good choice. Would you like a dessert?", es: "Buena elección. ¿Desean postre?", h: ["cake, ice cream, no thanks", "Yes, please… / No, thank you.", "No…", "No, thank you. Just the bill, please."], go: [["bill|check|no", 5], ["yes|cake|ice|dessert", 4]] },
    { ai: "Here's your chocolate cake. Enjoy!", es: "Aquí está su pastel de chocolate. ¡Buen provecho!", h: ["thank you, bill", "Thanks. Could we have the bill?", "Thanks…", "Thank you! Could we have the bill, please?"] },
    { ai: "Here's the bill. You can pay by card or cash.", es: "Aquí está la cuenta. Puede pagar con tarjeta o en efectivo.", h: ["card, cash", "I'll pay by + card / in cash", "I'll pay…", "I'll pay by card, please."] },
    { ai: "Thank you! Have a great evening.", es: "¡Gracias! Que tengan una buena noche.", h: ["you too", "You too!", "You…", "Thanks, you too!"], end: true },
  ], { story: true }),
  S("taxi", "Taking a taxi", "Tomando un taxi", "travel", "A2", "driver", "🚕", "Give directions, ask about the price and make small talk.", [
    { ai: "Hi! Where to?", es: "¡Hola! ¿A dónde?", h: ["hotel, airport, downtown, address", "To + place, please.", "To the…", "To the Hilton Hotel downtown, please."] },
    { ai: "Sure. It's about twenty minutes with this traffic. First time in the city?", es: "Claro. Son unos veinte minutos con este tráfico. ¿Primera vez en la ciudad?", h: ["first time, business trip", "Yes, it's… / No, I've been…", "Yes…", "Yes, it's my first time. I'm here on a business trip."] },
    { ai: "Nice! You should try the seafood here. It's amazing.", es: "¡Qué bien! Debería probar los mariscos de aquí. Son increíbles.", h: ["recommend, restaurant", "Can you recommend…?", "Can you…", "Can you recommend a good restaurant?"] },
    { ai: "Sure, try 'La Marea' near the harbor. OK, we're here!", es: "Claro, pruebe «La Marea» cerca del puerto. ¡Bien, llegamos!", h: ["how much, cost", "How much is it?", "How much…", "Great, thanks! How much is it?"] },
    { ai: "That's eighteen dollars.", es: "Son dieciocho dólares.", h: ["here, keep the change, receipt", "Here you are. Can I have a receipt?", "Here…", "Here you are. Keep the change. Can I have a receipt?"] },
    { ai: "Here's your receipt. Have a good day!", es: "Aquí tiene su recibo. ¡Que tenga un buen día!", h: ["thanks", "Thanks, you too!", "Thanks…", "Thanks, you too!"], end: true },
  ]),
  S("supermarket", "At the supermarket", "En el supermercado", "travel", "A1", "cashier", "🛒", "Find products and pay.", [
    { ai: "Hi! Can I help you find something?", es: "¡Hola! ¿Le ayudo a encontrar algo?", h: ["where, milk, bread, water", "Where is/are + product?", "Where is…", "Yes, where is the milk?"] },
    { ai: "It's in aisle four, next to the cheese.", es: "Está en el pasillo cuatro, junto al queso.", h: ["thank you", "Thank you!", "Thank…", "Thank you very much!"] },
    { ai: "Are you ready to check out? Do you need a bag?", es: "¿Listo para pagar? ¿Necesita una bolsa?", h: ["yes please, no thanks, bag", "Yes, please. / No, I have one.", "Yes…", "Yes, please. One bag."] },
    { ai: "That's twelve fifty. Cash or card?", es: "Son doce con cincuenta. ¿Efectivo o tarjeta?", h: ["card, cash", "By card, please.", "By…", "By card, please."] },
    { ai: "All done. Have a nice day!", es: "Listo. ¡Que tenga un buen día!", h: ["you too", "You too!", "You…", "Thanks, you too!"], end: true },
  ]),
  S("doctor", "At the doctor's", "En el médico", "travel", "A2", "doctor", "🩺", "Explain your symptoms and understand advice.", [
    { ai: "Hello, please have a seat. What seems to be the problem?", es: "Hola, tome asiento. ¿Cuál parece ser el problema?", h: ["headache, fever, stomach, pain", "I have + a headache / a fever", "I have…", "I have a bad headache and a fever."] },
    { ai: "I'm sorry to hear that. How long have you had these symptoms?", es: "Lamento escuchar eso. ¿Desde cuándo tiene estos síntomas?", h: ["since, for, days", "For + time / Since + day", "For…", "For two days. Since Monday."] },
    { ai: "Are you taking any medicine at the moment?", es: "¿Está tomando algún medicamento en este momento?", h: ["no, paracetamol, allergy", "No, I'm not. / Yes, I'm taking…", "No…", "No, I'm not taking any medicine."] },
    { ai: "Do you have any allergies?", es: "¿Tiene alguna alergia?", h: ["allergic to, penicillin, no", "I'm allergic to… / No, I don't.", "I'm…", "Yes, I'm allergic to penicillin."] },
    { ai: "OK. It looks like a virus. Rest, drink plenty of water and take this twice a day. Any questions?", es: "Bien. Parece un virus. Descanse, tome mucha agua y tome esto dos veces al día. ¿Preguntas?", h: ["work, how long, when", "Can I…? / How long…?", "Can I…", "Can I go to work tomorrow?"] },
    { ai: "I'd recommend staying home for two days. Come back if you don't feel better.", es: "Le recomiendo quedarse en casa dos días. Vuelva si no se siente mejor.", h: ["thank you, doctor", "Thank you, doctor.", "Thank…", "Thank you, doctor. I will."], end: true },
  ]),
  S("customer-service", "Customer service call", "Llamada a atención al cliente", "travel", "A2", "agent", "🎧", "Explain a problem with an order and get a solution.", [
    { ai: "Thank you for calling. My name is Jordan. How can I help you today?", es: "Gracias por llamar. Me llamo Jordan. ¿En qué puedo ayudarle hoy?", h: ["order, problem, arrived, broken", "I'm calling about + my order", "I'm calling about…", "I'm calling about my order. It arrived damaged."] },
    { ai: "I'm sorry about that. Can I have your order number, please?", es: "Lo siento. ¿Me da su número de pedido?", h: ["number, it's", "It's + number", "It's…", "Sure, it's 4 5 8 2 1."] },
    { ai: "Thank you. Would you prefer a replacement or a refund?", es: "Gracias. ¿Prefiere un reemplazo o un reembolso?", h: ["replacement, refund", "I'd prefer a…", "I'd prefer…", "I'd prefer a replacement, please."] },
    { ai: "Done. You'll receive it in three to five days. Is there anything else?", es: "Listo. Lo recibirá en tres a cinco días. ¿Algo más?", h: ["no, that's all, thanks", "No, that's all. Thank you.", "No…", "No, that's all. Thanks for your help."] },
    { ai: "You're welcome. Have a great day!", es: "De nada. ¡Que tenga un gran día!", h: ["bye", "Bye!", "Bye…", "You too. Bye!"], end: true },
  ]),
  S("office-smalltalk", "Small talk at the office", "Charla informal en la oficina", "work", "A2", "mike", "☕", "Make small talk with a colleague.", [
    { ai: "Hey! How was your weekend?", es: "¡Hola! ¿Qué tal tu fin de semana?", h: ["great, relaxing, visited, went", "It was + adjective. I + past verb…", "It was…", "It was great, thanks. I visited my family."] },
    { ai: "Sounds nice! Did you do anything special?", es: "¡Suena bien! ¿Hiciste algo especial?", h: ["went, watched, played, cooked", "Yes, I went… / Not really, I just…", "Yes, I…", "Yes, I went to the beach with my kids."] },
    { ai: "Lucky you! I stayed home and worked on the project report. How's your week looking?", es: "¡Qué suerte! Yo me quedé en casa trabajando en el informe. ¿Cómo viene tu semana?", h: ["busy, meetings, deadline", "It's quite busy. I have…", "It's…", "It's quite busy. I have three meetings and a deadline on Friday."] },
    { ai: "Same here. Let's grab lunch on Thursday if you're free.", es: "Igual yo. Almorcemos el jueves si estás libre.", h: ["sure, sounds good", "Sounds good! / Sure, why not.", "Sounds…", "Sounds good! See you on Thursday."] },
    { ai: "Great. Have a good day!", es: "Genial. ¡Que tengas buen día!", h: ["you too", "You too!", "You…", "You too, Mike!"], end: true },
  ]),
  S("university", "Talking to a professor", "Hablando con un profesor", "work", "B1", "professor", "🎓", "Ask for an extension and clarify an assignment.", [
    { ai: "Come in. How can I help you?", es: "Adelante. ¿En qué puedo ayudarle?", h: ["assignment, question, extension", "I have a question about…", "I have a…", "I have a question about the final assignment."] },
    { ai: "Sure. What would you like to know?", es: "Claro. ¿Qué quiere saber?", h: ["how many words, deadline, format", "How many…? / When is…?", "How many…", "How many words should the essay be?"] },
    { ai: "Around two thousand words. Anything else?", es: "Alrededor de dos mil palabras. ¿Algo más?", h: ["extension, more time, because", "Would it be possible to…? because…", "Would it be…", "Would it be possible to have a one-week extension? I've been sick."] },
    { ai: "I can give you three extra days. Please send me an email to confirm.", es: "Puedo darle tres días más. Envíeme un correo para confirmar.", h: ["thank you, appreciate", "Thank you, I really appreciate it.", "Thank you…", "Thank you so much. I really appreciate it."], end: true },
  ]),
  S("job-interview", "Job interview (Candidate)", "Entrevista de trabajo (candidato)", "work", "B1", "recruiter", "🧑‍💻", "Answer common interview questions clearly.", [
    { ai: "Hi, thanks for coming. Can you tell me a little about yourself?", es: "Hola, gracias por venir. ¿Me puede contar un poco sobre usted?", h: ["name, experience, years, currently", "I'm a + job with + X years of experience in…", "I'm a…", "I'm a QA engineer with six years of experience in the energy sector."] },
    { ai: "Great. Why are you interested in this position?", es: "Excelente. ¿Por qué le interesa este puesto?", h: ["grow, challenge, company, skills", "I'm interested because…", "I'm interested…", "I'm interested because I want to grow and your company leads the industry."] },
    { ai: "What would you say is your biggest strength?", es: "¿Cuál diría que es su mayor fortaleza?", h: ["organized, problem-solving, teamwork", "My biggest strength is… For example,…", "My biggest…", "My biggest strength is problem-solving. For example, I reduced rework by 20%."] },
    { ai: "Tell me about a time you faced a difficult situation at work.", es: "Cuénteme sobre una situación difícil en el trabajo.", h: ["situation, task, action, result", "STAR: Situation → Task → Action → Result", "Last year,…", "Last year a supplier sent wrong materials. I organized a meeting, found the cause and we fixed it in four days."] },
    { ai: "Very good. Do you have any questions for us?", es: "Muy bien. ¿Tiene alguna pregunta para nosotros?", h: ["team, training, next steps", "Could you tell me more about…? / What are the next steps?", "Could you…", "Could you tell me more about the team and the next steps?"] },
    { ai: "Of course. You'd join a team of eight, and we'll contact you by Friday. Thank you for your time!", es: "Por supuesto. Se uniría a un equipo de ocho y le contactaremos el viernes. ¡Gracias por su tiempo!", h: ["thank you, look forward", "Thank you. I look forward to hearing from you.", "Thank…", "Thank you. I look forward to hearing from you."], end: true },
  ], { pro: "hr" }),
  S("meeting", "Project meeting", "Reunión de proyecto", "pro", "B1", "mike", "🗓️", "Give an update, agree/disagree politely and accept an action.", [
    { ai: "OK everyone, let's get started. Can you give us a quick update on your tasks?", es: "Bien, empecemos. ¿Nos das una actualización rápida de tus tareas?", h: ["finished, working on, on track", "I've finished… / I'm currently working on…", "I've finished…", "Sure. I've finished the drawings and I'm working on the material list."] },
    { ai: "Good. The client wants to bring the deadline forward by one week. What do you think?", es: "Bien. El cliente quiere adelantar la fecha límite una semana. ¿Qué opinas?", h: ["difficult, risk, possible, resources", "I see your point, but… / I think it's possible if…", "I see…", "I see their point, but I think it's risky without more resources."] },
    { ai: "Fair point. What would you need to make it work?", es: "Buen punto. ¿Qué necesitarías para lograrlo?", h: ["another engineer, overtime, approval", "We would need…", "We would need…", "We would need one more engineer and approval for overtime."] },
    { ai: "OK. Can you prepare a short proposal for the client by Wednesday?", es: "Bien. ¿Puedes preparar una propuesta corta para el cliente para el miércoles?", h: ["sure, no problem, send", "Sure, I'll… by…", "Sure, I'll…", "Sure, I'll send it by Wednesday morning."] },
    { ai: "Perfect. Let's summarize: you'll send the proposal, and I'll talk to HR. Anything else?", es: "Perfecto. Resumamos: tú envías la propuesta y yo hablo con RR. HH. ¿Algo más?", h: ["no, that's all, clear", "No, I think we've covered everything.", "No, I…", "No, I think we've covered everything. Thanks."] },
    { ai: "Great. Thanks, everyone!", es: "Genial. ¡Gracias a todos!", h: ["thanks", "Thanks!", "Thanks…", "Thanks, Mike."], end: true },
  ], { pro: "business" }),
  S("presentation", "Presentation practice", "Práctica de presentación", "pro", "B1", "sofia", "🎤", "Open, structure and close a short presentation.", [
    { ai: "The audience is ready. Please open your presentation.", es: "El público está listo. Abre tu presentación.", h: ["good morning, today, talk about", "Good morning, everyone. Today I'm going to talk about…", "Good morning…", "Good morning, everyone. Today I'm going to talk about our quality results."] },
    { ai: "Good start. Now introduce your agenda.", es: "Buen comienzo. Ahora presenta tu agenda.", h: ["first, then, finally", "First,… Then,… Finally,…", "First,…", "First, I'll show the results. Then, the main problems. Finally, our plan."] },
    { ai: "Now explain the chart: sales went from 100 to 150 units.", es: "Ahora explica el gráfico: las ventas pasaron de 100 a 150 unidades.", h: ["increased, rose, from, to", "As you can see, X increased from… to…", "As you can see…", "As you can see, sales increased from 100 to 150 units."] },
    { ai: "Someone asks a question you can't answer right now. What do you say?", es: "Alguien hace una pregunta que no puedes responder ahora. ¿Qué dices?", h: ["good question, find out, get back", "That's a good question. I'll find out and get back to you.", "That's a…", "That's a great question. I'll check and get back to you."] },
    { ai: "Now close your presentation.", es: "Ahora cierra tu presentación.", h: ["to conclude, thank you, questions", "To conclude,… Thank you for your attention.", "To conclude…", "To conclude, quality is improving. Thank you for your attention."] },
    { ai: "Excellent presentation!", es: "¡Excelente presentación!", h: ["thank you", "Thank you!", "Thank…", "Thank you, Sofia!"], end: true },
  ], { pro: "business" }),
  S("salary-negotiation", "Salary negotiation", "Negociación salarial", "pro", "B2", "sarah", "💰", "Negotiate a salary offer politely and firmly.", [
    { ai: "We're happy to offer you the position with a salary of 3,000 dollars per month.", es: "Nos alegra ofrecerle el puesto con un salario de 3.000 dólares al mes.", h: ["thank you, appreciate, expecting", "Thank you for the offer. Based on my experience, I was expecting…", "Thank you…", "Thank you for the offer. Based on my experience, I was expecting around 3,500."] },
    { ai: "I understand. Our budget for this role is quite fixed. What else is important to you?", es: "Entiendo. El presupuesto es bastante fijo. ¿Qué más es importante para usted?", h: ["training, remote work, bonus, vacation", "Would it be possible to include…?", "Would it be…", "Would it be possible to include a training budget and one day of remote work?"] },
    { ai: "We could offer 3,200 plus a training budget. How does that sound?", es: "Podríamos ofrecer 3.200 más presupuesto de formación. ¿Qué le parece?", h: ["sounds fair, accept, in writing", "That sounds fair. Could you send it in writing?", "That sounds…", "That sounds fair. Could you send me the offer in writing?"] },
    { ai: "Of course. I'll email the updated offer today.", es: "Por supuesto. Le envío la oferta actualizada hoy.", h: ["thank you, look forward", "Thank you. I look forward to receiving it.", "Thank…", "Thank you, Sarah. I look forward to joining the team."], end: true },
  ], { pro: "business" }),
  S("supplier-meeting", "Supplier meeting", "Reunión con proveedor", "pro", "B1", "supplier", "🏭", "Negotiate price and lead time with a supplier.", [
    { ai: "Thank you for meeting us. Did you have time to review our quotation?", es: "Gracias por recibirnos. ¿Tuvo tiempo de revisar nuestra cotización?", h: ["yes, reviewed, price, high", "Yes, we did. However, the price is…", "Yes, we…", "Yes, we did. However, the price is above our budget."] },
    { ai: "I see. What price did you have in mind?", es: "Entiendo. ¿Qué precio tenía en mente?", h: ["discount, percent, volume", "We were hoping for a X% discount.", "We were hoping…", "We were hoping for a 10% discount, because the order is large."] },
    { ai: "We could offer 5% if you order 500 units. What about the delivery time?", es: "Podríamos ofrecer 5 % si piden 500 unidades. ¿Y el plazo de entrega?", h: ["lead time, weeks, faster, need", "We need the delivery in… weeks.", "We need…", "We need the delivery in four weeks, not six."] },
    { ai: "Four weeks is difficult, but possible with a small extra cost. Is that acceptable?", es: "Cuatro semanas es difícil pero posible con un pequeño costo extra. ¿Es aceptable?", h: ["acceptable, if, provided that", "We can accept that, provided that…", "We can accept…", "We can accept that, provided that the 5% discount stays."] },
    { ai: "Agreed. I'll send the revised quotation tomorrow.", es: "De acuerdo. Enviaré la cotización revisada mañana.", h: ["great, thanks, look forward", "Great. We look forward to it.", "Great…", "Great, thank you. We look forward to it."], end: true },
  ], { pro: "procurement" }),
  S("equipment-failure", "Client asks about equipment failure", "Cliente pregunta por falla de equipo", "pro", "B1", "client", "⚙️", "Explain a technical failure, its cause and the action plan.", [
    { ai: "Alex told me the compressor stopped last night. What happened exactly?", es: "Alex me dijo que el compresor se detuvo anoche. ¿Qué pasó exactamente?", h: ["stopped, overheating, alarm, at", "The compressor stopped at… because…", "The compressor…", "The compressor stopped at 2 a.m. because it was overheating."] },
    { ai: "Why was it overheating?", es: "¿Por qué se sobrecalentó?", h: ["cooling fan, failed, damaged, blocked", "We found that the… was…", "We found…", "We found that the cooling fan was damaged."] },
    { ai: "How long will it take to fix?", es: "¿Cuánto tomará repararlo?", h: ["replace, spare part, hours, days", "We need to replace… It will take…", "We need to…", "We need to replace the fan. It will take about six hours."] },
    { ai: "How can we prevent this from happening again?", es: "¿Cómo evitamos que vuelva a pasar?", h: ["inspection, maintenance, monitor, weekly", "We will + preventive action", "We will…", "We will add a weekly fan inspection to the maintenance plan."] },
    { ai: "OK. Please send me a short incident report today.", es: "Bien. Envíeme un informe breve del incidente hoy.", h: ["of course, send, by", "Of course. I'll send it by…", "Of course…", "Of course. I'll send it by 5 p.m."], end: true },
  ], { pro: "engineering" }),
  S("engineer-supervisor", "Engineer + Supervisor", "Ingeniero + supervisor", "pro", "B1", "alex", "👷", "Report progress and a problem to your supervisor.", [
    { ai: "Morning. How's the installation going?", es: "Buen día. ¿Cómo va la instalación?", h: ["on schedule, behind, finished, percent", "It's on schedule. We've finished…", "It's…", "It's on schedule. We've finished 70% of the piping."] },
    { ai: "Any problems I should know about?", es: "¿Algún problema que deba saber?", h: ["drawing, mismatch, missing, delay", "Yes, there's a problem with…", "Yes, there's…", "Yes, there's a mismatch between the drawing and the valve size."] },
    { ai: "That's serious. What do you suggest?", es: "Eso es serio. ¿Qué sugieres?", h: ["check, designer, revision, hold", "I suggest we…", "I suggest…", "I suggest we stop that line and ask the designer for a revision."] },
    { ai: "Agreed. Keep me updated.", es: "De acuerdo. Mantenme informado.", h: ["will do, update, today", "Will do. I'll update you…", "Will do…", "Will do. I'll update you this afternoon."], end: true },
  ], { pro: "engineering" }),
  S("shutdown-report", "Plant shutdown report", "Informe de parada de planta", "pro", "B1", "alex", "🛢️", "Report the status of a shutdown to operations.", [
    { ai: "We're in day three of the shutdown. What's the status of the pump overhaul?", es: "Estamos en el día tres de la parada. ¿Cuál es el estado del overhaul de la bomba?", h: ["completed, pending, seals, bearings", "We have completed… The … is still pending.", "We have…", "We have completed the pump overhaul. The seal test is still pending."] },
    { ai: "Did you find any corrosion in the pipeline?", es: "¿Encontraron corrosión en la tubería?", h: ["corrosion, section, thickness, minor", "Yes, we found… in…", "Yes, we…", "Yes, we found minor corrosion in section B, but the thickness is acceptable."] },
    { ai: "Will we restart on schedule?", es: "¿Arrancaremos según el cronograma?", h: ["on schedule, if, permit, test", "Yes, if… / I'm afraid…", "Yes, if…", "Yes, if the pressure test is successful tomorrow."] },
    { ai: "Great. Send me the updated shutdown report tonight.", es: "Genial. Envíame el informe actualizado esta noche.", h: ["sure, send", "Sure, I'll send it tonight.", "Sure…", "Sure, I'll send it before 9 p.m."], end: true },
  ], { pro: "oilgas" }),
  S("inspection-rejected", "Client asks why an inspection was rejected", "Cliente pregunta por qué se rechazó una inspección", "pro", "B1", "client", "✅", "Explain a rejection with evidence and propose next steps.", [
    { ai: "I heard the inspection of spool 12 was rejected. Why?", es: "Supe que la inspección del spool 12 fue rechazada. ¿Por qué?", h: ["porosity, weld, acceptance criteria", "It was rejected because…", "It was rejected…", "It was rejected because we found porosity in weld W-12."] },
    { ai: "Is that really outside the acceptance criteria?", es: "¿Eso está realmente fuera de los criterios de aceptación?", h: ["yes, according to, procedure, standard", "Yes. According to the procedure,…", "Yes. According…", "Yes. According to the approved procedure, the porosity exceeds the limit."] },
    { ai: "What's the next step?", es: "¿Cuál es el siguiente paso?", h: ["NCR, repair, re-inspect", "We have raised an NCR. The supplier will…", "We have…", "We have raised an NCR. The supplier will repair the weld and we'll re-inspect it."] },
    { ai: "Will this delay the project?", es: "¿Esto retrasará el proyecto?", h: ["one day, no impact, critical path", "It will delay… by… / It won't affect…", "It will…", "It will delay this spool by two days, but it won't affect the critical path."] },
    { ai: "OK. Please keep me informed.", es: "Bien. Manténgame informado.", h: ["of course, update, NCR closed", "Of course. I'll update you when…", "Of course…", "Of course. I'll update you when the NCR is closed."], end: true },
  ], { pro: "qaqc" }),
  S("inspector-supplier", "Inspector + Supplier", "Inspector + proveedor", "pro", "B1", "supplier", "🏭", "Request documents and discuss a hold point.", [
    { ai: "Welcome to our workshop. The vessel is ready for the hydrotest.", es: "Bienvenido a nuestro taller. El recipiente está listo para la prueba hidrostática.", h: ["before, documents, MTR, calibration", "Before we start, could you show me…?", "Before we start…", "Before we start, could you show me the MTRs and the gauge calibration certificates?"] },
    { ai: "Here they are. Everything is in order.", es: "Aquí están. Todo está en orden.", h: ["expired, certificate, gauge", "I'm afraid this… has expired.", "I'm afraid…", "I'm afraid the calibration certificate for this gauge has expired."] },
    { ai: "Oh, I'm sorry. We have another calibrated gauge. Can we continue?", es: "Lo siento. Tenemos otro manómetro calibrado. ¿Podemos continuar?", h: ["yes, if, certificate, hold point", "Yes, provided that…", "Yes, provided…", "Yes, provided that you show me its valid certificate. This is a hold point."] },
    { ai: "Of course. Here's the certificate.", es: "Por supuesto. Aquí está el certificado.", h: ["thank you, proceed, start", "Thank you. We can proceed.", "Thank you…", "Thank you. Everything is OK now. We can proceed with the test."], end: true },
  ], { pro: "qaqc" }),
  S("audit-interview", "Auditor + Employee", "Auditor + empleado", "pro", "B1", "daniel", "🔍", "Answer audit questions and provide evidence.", [
    { ai: "Good morning. Could you walk me through how you control documents here?", es: "Buen día. ¿Podría explicarme cómo controlan los documentos aquí?", h: ["system, approved, revision, stored", "We use… All documents are…", "We use…", "We use an electronic system. All documents are reviewed and approved before use."] },
    { ai: "Can you show me evidence that this procedure is the latest revision?", es: "¿Puede mostrarme evidencia de que este procedimiento es la última revisión?", h: ["here, revision, list, master", "Here's… It shows that…", "Here's…", "Here's the master list. It shows that revision C is current."] },
    { ai: "I see an obsolete copy at the workstation. How do you explain that?", es: "Veo una copia obsoleta en el puesto de trabajo. ¿Cómo lo explica?", h: ["mistake, remove, immediately, check", "You're right. We'll… immediately.", "You're right…", "You're right. We'll remove it immediately and check the other workstations."] },
    { ai: "I'll record it as a minor nonconformity. Please send a corrective action plan within 30 days.", es: "Lo registraré como no conformidad menor. Envíe un plan de acción correctiva en 30 días.", h: ["understood, root cause, will send", "Understood. We'll analyze the root cause and…", "Understood…", "Understood. We'll analyze the root cause and send the plan within 30 days."], end: true },
  ], { pro: "audit" }),
  S("leave-clarification", "Employee asks HR about leave", "Empleado consulta a RR. HH. sobre licencias", "pro", "B1", "employee", "🏖️", "As HR, explain the leave policy clearly and kindly.", [
    { ai: "Hi! I'm Luis from maintenance. How many days of vacation do I have this year?", es: "Hola, soy Luis de mantenimiento. ¿Cuántos días de vacaciones tengo este año?", h: ["days, entitled, according to, policy", "You're entitled to… days per year.", "You're entitled…", "You're entitled to 15 days per year, according to the policy."] },
    { ai: "OK. And can I take them all in December?", es: "Bien. ¿Y puedo tomarlas todas en diciembre?", h: ["approval, manager, advance, request", "You can, but you need… / You have to request…", "You can, but…", "You can, but you need your manager's approval and you must request it one month in advance."] },
    { ai: "What happens if I get sick during my vacation?", es: "¿Qué pasa si me enfermo durante mis vacaciones?", h: ["medical certificate, sick leave, days", "If you get sick, you should… and those days…", "If you get sick…", "If you get sick, send a medical certificate and those days will count as sick leave."] },
    { ai: "Great, thank you. That's very clear.", es: "Genial, gracias. Está muy claro.", h: ["welcome, questions, email", "You're welcome. If you have more questions…", "You're welcome…", "You're welcome. If you have more questions, just email me."], end: true },
  ], { pro: "hr" }),
  S("employee-complaint", "Employee complaint", "Queja de un empleado", "pro", "B2", "employee", "📣", "Listen to a complaint, show empathy and explain the process.", [
    { ai: "I need to talk to you. My supervisor keeps shouting at me in front of the team.", es: "Necesito hablar con usted. Mi supervisor me grita delante del equipo.", h: ["sorry, understand, thank you for telling", "I'm sorry to hear that. Thank you for…", "I'm sorry…", "I'm sorry to hear that. Thank you for telling me."] },
    { ai: "It's been happening for two months. I don't know what to do.", es: "Pasa desde hace dos meses. No sé qué hacer.", h: ["examples, dates, witnesses", "Could you give me some examples…?", "Could you…", "Could you give me some specific examples, with dates?"] },
    { ai: "Yes, last Monday and last Thursday in the morning meeting. Two colleagues were there.", es: "Sí, el lunes pasado y el jueves en la reunión de la mañana. Dos colegas estaban presentes.", h: ["confidential, investigation, process", "This will be confidential. We will…", "This will…", "This conversation is confidential. We will open an investigation and talk to the witnesses."] },
    { ai: "Will I get in trouble for complaining?", es: "¿Tendré problemas por quejarme?", h: ["no, protected, retaliation, policy", "No. Our policy protects…", "No. Our policy…", "No. Our policy protects employees who raise concerns in good faith."], end: true },
  ], { pro: "hrlaw" }),
  S("disciplinary-meeting", "Disciplinary meeting", "Reunión disciplinaria", "pro", "B2", "employee", "⚖️", "Conduct a fair, formal disciplinary meeting.", [
    { ai: "Good afternoon. I was told this meeting is about my attendance?", es: "Buenas tardes. Me dijeron que esta reunión es sobre mi asistencia.", h: ["purpose, discuss, absences, policy", "Yes. The purpose of this meeting is to discuss…", "Yes. The purpose…", "Yes. The purpose of this meeting is to discuss your recent absences."] },
    { ai: "I know I've missed some days. I've had some family problems.", es: "Sé que he faltado algunos días. He tenido problemas familiares.", h: ["understand, support, however, rules", "I understand. However,…", "I understand…", "I understand, and we want to support you. However, you didn't notify your supervisor."] },
    { ai: "What happens now?", es: "¿Qué pasa ahora?", h: ["written warning, improvement, review, weeks", "We will issue… and review… in…", "We will…", "We will issue a written warning and review your attendance in eight weeks."] },
    { ai: "OK. Can I get some help with my situation?", es: "Bien. ¿Puedo recibir ayuda con mi situación?", h: ["employee assistance, flexible hours, talk", "Of course. We can offer…", "Of course…", "Of course. We can offer flexible hours and our employee assistance program."], end: true },
  ], { pro: "hrlaw" }),
  S("contract-change", "Supplier requests contract changes", "Proveedor solicita cambios al contrato", "pro", "B2", "emma", "📝", "Discuss a requested change to a contract clause.", [
    { ai: "The supplier wants to change clause 9 to limit their liability to 10% of the contract value.", es: "El proveedor quiere cambiar la cláusula 9 para limitar su responsabilidad al 10 % del valor del contrato.", h: ["too low, risk, propose, cap", "That seems too low. I'd propose…", "That seems…", "That seems too low. I'd propose a cap equal to 100% of the contract value."] },
    { ai: "They say 100% is not market standard. Is there a middle ground?", es: "Dicen que 100 % no es estándar de mercado. ¿Hay un punto medio?", h: ["accept, provided that, exclude, negligence", "We could accept…, provided that…", "We could accept…", "We could accept 50%, provided that gross negligence is excluded from the cap."] },
    { ai: "Good idea. How should we communicate this?", es: "Buena idea. ¿Cómo lo comunicamos?", h: ["email, redline, amendment, meeting", "I'll send… and suggest…", "I'll send…", "I'll send a redline of clause 9 and suggest a call on Thursday."] },
    { ai: "Perfect. Remember: any amendment must be in writing and signed by both parties.", es: "Perfecto. Recuerda: toda modificación debe ser por escrito y firmada por ambas partes.", h: ["of course, noted, in writing", "Of course. Noted.", "Of course…", "Of course. I'll make sure it's in writing."], end: true },
  ], { pro: "law" }),
  S("networking", "Networking event", "Evento de networking", "pro", "B1", "ceo", "🥂", "Introduce yourself and build a professional connection.", [
    { ai: "Hi, I don't think we've met. I'm Olivia, CEO of GreenGrid.", es: "Hola, creo que no nos conocemos. Soy Olivia, CEO de GreenGrid.", h: ["nice to meet you, I'm, work at", "Nice to meet you. I'm… I work at…", "Nice to meet…", "Nice to meet you, Olivia. I'm Carla. I work at PetroAndes as a project engineer."] },
    { ai: "Interesting! What kind of projects are you working on?", es: "¡Interesante! ¿En qué proyectos trabajas?", h: ["currently, working on, pipeline, solar", "I'm currently working on…", "I'm currently…", "I'm currently working on a pipeline expansion and a small solar project."] },
    { ai: "We're looking for partners in solar. Would you be interested in talking more?", es: "Buscamos socios en solar. ¿Te interesaría conversar más?", h: ["definitely, connect, LinkedIn, card", "Definitely. Shall we connect on…?", "Definitely…", "Definitely. Shall we connect on LinkedIn? Here's my card."] },
    { ai: "Great, I'll send you a message this week.", es: "Genial, te enviaré un mensaje esta semana.", h: ["look forward, pleasure", "I look forward to it. It was a pleasure.", "I look forward…", "I look forward to it. It was a pleasure meeting you."], end: true },
  ], { pro: "career" }),
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

// Niveles de conversación (sección 29)
export const CONV_LEVELS = [
  { n: 1, title: "Very slow A1 English", rate: 0.7, es: "Inglés A1 muy lento" },
  { n: 2, title: "Simple conversations", rate: 0.85, es: "Conversaciones simples" },
  { n: 3, title: "Normal intermediate conversation", rate: 1, es: "Conversación intermedia normal" },
  { n: 4, title: "Natural conversation", rate: 1.05, es: "Conversación natural" },
  { n: 5, title: "Idioms + phrasal verbs", rate: 1.1, es: "Modismos y phrasal verbs" },
  { n: 6, title: "Professional English", rate: 1, es: "Inglés profesional" },
  { n: 7, title: "Advanced / near-native", rate: 1.15, es: "Avanzado / casi nativo" },
];
