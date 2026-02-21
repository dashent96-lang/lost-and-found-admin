import { GoogleGenAI } from "@google/genai";

export const GeminiService = {
  /**
   * Enhances a student's raw item description into a professional, searchable report.
   * Tailored for the Ambrose Alli University context using Gemini 3 Flash.
   */
  async enhanceDescription(itemTitle: string, rawNotes: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Please refine this report for our campus registry:
        
        Item: ${itemTitle}
        User Notes: ${rawNotes}`,
        config: {
          systemInstruction: "You are a senior administrator at the Ambrose Alli University (AAU) Property Office. Your task is to rewrite student-submitted lost/found descriptions to be professional, objective, and detailed for easier verification by campus security. Mention locations relative to Ekpoma campus landmarks. Use bullet points for key physical characteristics (color, brand, serial numbers, unique markings). Keep it concise but formal.",
          temperature: 0.4,
        },
      });

      return response.text || rawNotes;
    } catch (error) {
      console.error("Gemini AI enhancement failed. Reverting to raw notes.", error);
      return rawNotes;
    }
  }
};