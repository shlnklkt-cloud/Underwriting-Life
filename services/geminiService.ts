
import { GoogleGenAI, Type } from "@google/genai";
import { MASTER_SYSTEM_PROMPT } from "../constants";
import { UnderwritingResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    agentActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          agentName: { type: Type.STRING },
          status: { type: Type.STRING },
          decision: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ["agentName", "status", "reasoning"],
      },
    },
    nextQuestion: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Clickable options for the user to select from."
    },
    state: {
      type: Type.OBJECT,
      properties: {
        age: { type: Type.NUMBER },
        gender: { type: Type.STRING },
        income: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        term: { type: Type.NUMBER },
        occupation: { type: Type.STRING },
        smokingStatus: { type: Type.STRING },
        diabetes: { type: Type.STRING },
        hbA1c: { type: Type.NUMBER },
        bmi: { type: Type.NUMBER },
        riskRating: { type: Type.STRING },
        riskMultiplier: { type: Type.NUMBER },
        annualPremium: { type: Type.NUMBER },
      },
    },
    showQuote: { type: Type.BOOLEAN },
    complete: { type: Type.BOOLEAN },
  },
  required: ["agentActions", "nextQuestion", "state"],
};

export async function processUnderwritingStep(
  history: { role: string; parts: { text: string }[] }[],
  userInput: string
): Promise<UnderwritingResponse> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: userInput }] }
    ],
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const response = await model;
  return JSON.parse(response.text) as UnderwritingResponse;
}
