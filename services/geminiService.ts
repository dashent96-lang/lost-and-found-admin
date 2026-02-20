
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  /**
   * Enhances a student's raw item description into a professional, searchable report.
   * Tailored for the Ambrose Alli University context.
   */
  async enhanceDescription(itemTitle: string, rawNotes: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an assistant for the Ambrose Alli University (AAU) Property Office. 
        A student has submitted a lost/found item report with the following details. 
        Please rewrite it to be professional, descriptive, and easy for the administration to verify.
        Mention that the item was seen/lost within the AAU campus.
        Focus on specific details like color, brand, condition, and any unique markings.
        
        Item Title: ${itemTitle}
        Original Notes: ${rawNotes}`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      });
      return response.text || rawNotes;
    } catch (error) {
      console.error("Gemini AI enhancement failed:", error);
      return rawNotes;
    }
  }
};
