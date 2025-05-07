import { GoogleGenerativeAI } from '@google/generative-ai';

// Load your API key from environment
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Function to generate text content using Gemini AI
 * @param {string} prompt - The prompt text to send to the AI
 * @param {Object} options - Additional options like temperature, maxTokens, etc.
 * @returns {Promise<string>} - The generated text response
 */
export async function generateText(prompt, options = {}) {
  try {
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable not set');
    }


    const modelName = "gemini-2.0-flash"
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: modelName,

      generationConfig: {
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        maxOutputTokens: options.maxTokens || 8192,
      },
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini API:', error);
    if (error.status === 404) {
      return JSON.stringify({
        summary: "Unable to access AI model. Please check your API key configuration.",
        strengths: ["Service temporarily unavailable"],
        improvementAreas: ["Check API key configuration"],
        vehicleInsights: "Data not available - AI service unavailable",
        geographicalInsights: "Data not available - AI service unavailable",
        recommendations: ["Verify API key is correct", "Check model availability", "Try again later"],
        trends: "Unable to analyze trends due to service unavailability"
      });
    }
    throw error;
  }
}
