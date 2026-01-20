
import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from '../types';

export const getRecommendation = async (
  mergedImageBase64: string,
  gender: string
): Promise<AIRecommendation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this virtual try-on image for a ${gender} user. 
    Evaluate the fit, color contrast with the visible skin tone, and overall aesthetic.
    Return a score (0-100) and a helpful fashion advice message.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: mergedImageBase64.split(',')[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
          required: ['score', 'feedback']
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIRecommendation;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 80,
      feedback: "This look is classic! The AI processing had a hiccup, but you look great in this style."
    };
  }
};
