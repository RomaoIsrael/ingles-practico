// IA opcional con Claude (secciones 26-28, 43, 113, 133, 176).
// Etapa A: la clave API la pone el usuario y se guarda solo en su dispositivo.
// Etapa B: estas llamadas pasan a un ai-gateway en el servidor (ver docs/02-arquitectura.md).
import { store } from "../core/store.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
let client = null, clientKey = "";

export function aiReady() {
  const ai = store.state.settings.ai;
  return !!(ai.enabled && ai.apiKey && navigator.onLine !== false);
}

async function getClient() {
  const { apiKey } = store.state.settings.ai;
  if (client && clientKey === apiKey) return client;
  const mod = await import(/* @vite-ignore */ SDK_URL);
  const Anthropic = mod.default || mod.Anthropic;
  client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  clientKey = apiKey;
  return client;
}

function model() { return store.state.settings.ai.model || "claude-opus-5-5"; }

function textOf(msg) {
  if (msg.stop_reason === "refusal") throw new Error("The AI declined this request. Try rephrasing it.");
  return msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

// Conversación con streaming. messages: [{role:'user'|'assistant', content}]
export async function chat({ system, messages, effort = "low", maxTokens = 600, onText } = {}) {
  const c = await getClient();
  const stream = c.beta.messages.stream({
    model: model(),
    max_tokens: maxTokens,
    system,
    messages: trimHistory(messages),
    output_config: { effort },
    betas: [FALLBACK_BETA],
    fallbacks: "default",
  });
  if (onText) stream.on("text", onText);
  return textOf(await stream.finalMessage());
}

// Respuesta JSON validada por esquema (corrección de escritura, evaluación de conversación)
export async function structured({ system, prompt, schema, effort = "medium", maxTokens = 1500, images = [] }) {
  const c = await getClient();
  const content = [...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.type, data: img.data } })), { type: "text", text: prompt }];
  const msg = await c.beta.messages.create({
    model: model(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
    output_config: { effort, format: { type: "json_schema", schema } },
    betas: [FALLBACK_BETA],
    fallbacks: "default",
  });
  return JSON.parse(textOf(msg));
}

// Texto simple (explicaciones, lección personalizada, fotos)
export async function ask({ system, prompt, effort = "low", maxTokens = 900, images = [], onText }) {
  const content = [...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.type, data: img.data } })), { type: "text", text: prompt }];
  return chat({ system, messages: [{ role: "user", content }], effort, maxTokens, onText });
}

// Control de costes: solo los últimos 12 turnos; debe terminar con un turno del usuario
function trimHistory(messages) {
  let m = messages.slice(-12);
  while (m.length && m[0].role !== "user") m = m.slice(1);
  return m;
}

export function friendlyError(e) {
  const msg = String(e?.message || e);
  if (/401|authentication|api key/i.test(msg)) return "La clave API no es válida. Revísala en Perfil → Ajustes → IA.";
  if (/429|rate/i.test(msg)) return "Demasiadas solicitudes seguidas. Espera un momento.";
  if (/import|fetch|network|Failed/i.test(msg)) return "No hay conexión con el servicio de IA. Revisa tu internet.";
  return msg;
}
