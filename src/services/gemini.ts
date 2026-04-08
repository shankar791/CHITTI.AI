import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini SDK with the environment variable.
// AI Studio automatically injects GEMINI_API_KEY into the environment.
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
