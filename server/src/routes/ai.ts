import express from 'express';
import { GoogleGenAI, Type, Schema } from "@google/genai";

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

router.use(ensureAuthenticated);

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

router.post('/analyze-profile', async (req, res) => {
  try {
    const { profile, includePhotos } = req.body;

    if (!profile.lookingForDescription || profile.lookingForDescription.length < 5) {
      res.status(400).json({ message: "Please describe who you are looking for to get AI insights." });
      return;
    }

    let contents: any[] = [];

    // Add Image if opted in and available
    if (includePhotos && profile.photoUrl && profile.photoUrl.startsWith('data:image')) {
      const matches = profile.photoUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const prompt = `
      You are a world-class Dating Coach and Profile Optimizer.

      Here is the user's current profile:
      - Name: ${profile.name}
      - Age: ${profile.age}
      - Job: ${profile.jobTitle}
      - Bio: "${profile.bio}"
      - Interests: ${profile.interests.join(", ")}

      Here is who they are LOOKING FOR (Target Match):
      "${profile.lookingForDescription}"

      Analyze the gap between their current profile and what would attract their Target Match.
      Provide constructive, specific feedback to optimize their profile.
      Be honest but encouraging.

      ${includePhotos ? "Also consider their profile photo in your analysis. Does it match the vibe they are going for?" : ""}

      IMPORTANT: For the 'suggestions' array:
      - If you suggest a better Bio, set 'category' to 'Bio' and provide the full new bio in 'exampleRewrite'.
      - If you suggest adding interests, set 'category' to 'Interests' and provide a comma-separated list of interests in 'exampleRewrite' (e.g. "Hiking, Photography").
    `;

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert dating consultant. Your goal is to maximize the user's success rate.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Error analyzing profile:", error);
    res.status(500).json({ message: "Error analyzing profile" });
  }
});

const imageAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hairColor: { type: Type.STRING, description: "Hair color of the person in the image. Keep it simple (e.g., Brown, Blonde, Black)." },
    eyeColor: { type: Type.STRING, description: "Eye color of the person in the image. Keep it simple (e.g., Blue, Brown, Green)." },
    bodyType: { type: Type.STRING, description: "General body type description (e.g., Athletic, Slim, Curvy, Average)." },
  },
  required: ["hairColor", "eyeColor", "bodyType"],
};

router.post('/analyze-image', async (req, res) => {
  try {
    const { base64DataUrl } = req.body;

    if (!base64DataUrl) {
      res.status(400).json({ message: "No image data provided" });
      return;
    }

    // Extract MIME type and base64 data
    const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ message: "Invalid base64 image data" });
      return;
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
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

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Error analyzing image metadata:", error);
    res.status(500).json({ message: "Error analyzing image" });
  }
});

export default router;
