import { GoogleGenAI, Type } from "@google/genai";
import { EmployeeFormData } from "../types";

export const generateMockData = async (): Promise<EmployeeFormData[]> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 5 realistic dummy employee records for a tech company.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            department: { type: Type.STRING },
            email: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["Active", "Inactive", "On Leave"] },
          },
          required: ["name", "role", "department", "email", "status"],
        },
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as EmployeeFormData[];
  }
  
  return [];
};
