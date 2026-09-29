// Voz: Text-to-Speech y Speech-to-Text con la Web Speech API (secciones 37, 114, 177).
// Si el navegador no lo soporta, la app ofrece siempre la alternativa escrita.
let voices = [];
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
function loadVoices() { if (synth) voices = synth.getVoices(); }
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

export const ttsAvailable = () => !!synth;

function pickVoice(accent) {
  const lang = accent === "uk" ? "en-GB" : "en-US";
  const exact = voices.filter((v) => v.lang === lang || v.lang.replace("_", "-") === lang);
  const pref = exact.find((v) => /natural|neural|premium|enhanced|google|samantha|daniel|serena/i.test(v.name)) || exact[0];
  return pref || voices.find((v) => v.lang.startsWith("en")) || null;
}

export function cleanForSpeech(text) {
  return String(text).replace(/\s*\/[^/\s][^/]*\//g, "").replace(/[↗↘]/g, "").replace(/_{2,}/g, "blank");
}

export function speak(text, { rate = 1, accent = "us" } = {}) {
  return new Promise((resolve) => {
    if (!synth) return resolve(false);
    synth.cancel();
    const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
    const v = pickVoice(accent);
    if (v) u.voice = v;
    u.lang = accent === "uk" ? "en-GB" : "en-US";
    u.rate = rate;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    synth.speak(u);
  });
}
export const stopSpeaking = () => synth && synth.cancel();

const Rec = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const sttAvailable = () => !!Rec;

let active = null;
// Devuelve { transcript, confidence, sec }. onInterim recibe el texto parcial.
export function listen({ accent = "us", onInterim = () => {}, maxSec = 30 } = {}) {
  return new Promise((resolve, reject) => {
    if (!Rec) return reject(new Error("unsupported"));
    if (active) try { active.abort(); } catch {}
    const r = new Rec();
    active = r;
    r.lang = accent === "uk" ? "en-GB" : "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    const t0 = Date.now();
    let finalText = "", conf = 0, gotFinal = false;
    const timer = setTimeout(() => { try { r.stop(); } catch {} }, maxSec * 1000);
    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res.isFinal) { finalText += res[0].transcript; conf = res[0].confidence || 0.8; gotFinal = true; }
        else interim += res[0].transcript;
      }
      onInterim(finalText + interim);
    };
    r.onerror = (e) => { clearTimeout(timer); active = null; reject(new Error(e.error || "error")); };
    r.onend = () => {
      clearTimeout(timer); active = null;
      resolve({ transcript: finalText.trim(), confidence: gotFinal ? conf : 0, sec: (Date.now() - t0) / 1000 });
    };
    try { r.start(); } catch (e) { reject(e); }
  });
}
export function stopListening() { if (active) try { active.stop(); } catch {} }
