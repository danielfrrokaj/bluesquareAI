import "server-only";
import { GoogleGenAI } from "@google/genai";

// Gemini through its API key (GEMINI_API_KEY). Used for structured jobs such as mapping imported columns.

export const aiEnabled = () => !!process.env.GEMINI_API_KEY?.trim();

const shared = globalThis as typeof globalThis & { __bsaGemini?: GoogleGenAI };

/** Asks Gemini for JSON matching `schema` (a JSON Schema). Throws when the call or the JSON fails. */
export async function generateJson<T>(prompt: string, schema: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  shared.__bsaGemini ??= new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });
  const res = await shared.__bsaGemini.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseJsonSchema: schema, temperature: 0 },
  });
  if (!res.text) throw new Error("Gemini returned no answer.");
  return JSON.parse(res.text) as T;
}
