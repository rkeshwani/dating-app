import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, AiAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how well the current profile attracts the described target match.",
    },
    overallVibe: {
      type: Type.STRING,
      description: "A 3-5 word summary of the 'vibe' the current profile gives off.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "The area of improvement (e.g., 'Bio', 'Tone', 'Interests', 'Photos').",
          },
          advice: {
            type: Type.STRING,
            description: "Specific advice on what to change to better attract the target match.",
          },
          exampleRewrite: {
            type: Type.STRING,
            description: "A specific example of how to rewrite a sentence or section.",
          },
          impactScore: {
            type: Type.INTEGER,
            description: "Predicted impact score from 1-10.",
          },
        },
        required: ["category", "advice", "impactScore"],
      },
    },
  },
  required: ["matchScore", "overallVibe", "suggestions"],
};

export const analyzeProfile = async (profile: UserProfile): Promise<AiAnalysisResult> => {
  if (!profile.lookingForDescription || profile.lookingForDescription.length < 5) {
      throw new Error("Please describe who you are looking for to get AI insights.");
  }

  const prompt = `
    You are a world-class Dating Coach and Profile Optimizer.
    
    Here is the user's current profile:
    - Name: ${profile.name}
    - Age: ${profile.age}
    - Job: ${profile.jobTitle}
    - Bio: "${profile.bio}"
    - Interests: ${profile.interests.join(", ")}
    - Hair Color: ${profile.hairColor || "Not specified"}
    - Eye Color: ${profile.eyeColor || "Not specified"}
    - Body Type: ${profile.bodyType || "Not specified"}
    
    Here is who they are LOOKING FOR (Target Match):
    "${profile.lookingForDescription}"
    
    Analyze the gap between their current profile and what would attract their Target Match.
    Provide constructive, specific feedback to optimize their profile.
    Be honest but encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert dating consultant. Your goal is to maximize the user's success rate.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AiAnalysisResult;
  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw error;
  }
};

const imageAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hairColor: { type: Type.STRING, description: "Hair color of the person in the image. Keep it simple (e.g., Brown, Blonde, Black)." },
    eyeColor: { type: Type.STRING, description: "Eye color of the person in the image. Keep it simple (e.g., Blue, Brown, Green)." },
    bodyType: { type: Type.STRING, description: "General body type description (e.g., Athletic, Slim, Curvy, Average)." },
  },
  required: ["hairColor", "eyeColor", "bodyType"],
};

export const analyzeImageMetadata = async (base64DataUrl: string): Promise<{ hairColor: string; eyeColor: string; bodyType: string }> => {
  try {
    // Extract MIME type and base64 data
    const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 image data");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        {
          text: "Analyze this profile picture and extract the physical attributes of the person."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: imageAnalysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI analysis of image");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing image metadata:", error);
    throw error;
  }
};