import { GoogleGenAI, Type } from "@google/genai";
import { MASTER_SYSTEM_PROMPT } from "../constants";
import { UnderwritingResponse } from "../types";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  userInput: string,
  retryCount = 0
): Promise<UnderwritingResponse> {
  const MAX_RETRIES = 5; 
  
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
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

    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text) as UnderwritingResponse;
  } catch (error: any) {
    const errorString = JSON.stringify(error).toLowerCase();
    const isRateLimit = 
      error?.status === 429 || 
      errorString.includes('429') || 
      errorString.includes('resource_exhausted') ||
      errorString.includes('quota');

    if (isRateLimit && retryCount < MAX_RETRIES) {
      // Exponential backoff with jitter: 2s, 4s, 8s, 16s, 32s
      const waitTime = Math.pow(2, retryCount + 1) * 1000 + Math.random() * 1000;
      console.warn(`[AuraLife API] Rate limited. Attempt ${retryCount + 1}/${MAX_RETRIES}. Retrying in ${Math.round(waitTime)}ms...`);
      await sleep(waitTime);
      return processUnderwritingStep(history, userInput, retryCount + 1);
    }

    console.error("[AuraLife API Error]", error);
    throw error;
  }
}