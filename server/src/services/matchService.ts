import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type, Schema, Part } from "@google/genai";

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to calculate Haversine distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

const matchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    oneWayScore: { type: Type.INTEGER, description: "Score (0-100) indicating how well the Target fits the Source's 'Looking For'." },
    twoWayScore: { type: Type.INTEGER, description: "Score (0-100) indicating bidirectional compatibility." },
    reasoning: { type: Type.STRING, description: "Reasoning for the scores." },
    matchFactors: {
      type: Type.OBJECT,
      description: "Extracted key match factors",
      properties: {
        sharedInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
        personalityMatch: { type: Type.STRING },
        lifestyleCompatibility: { type: Type.STRING }
      }
    }
  },
  required: ["oneWayScore", "twoWayScore", "reasoning", "matchFactors"]
};

function getImagePart(dataUrl: string): Part | null {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }
    return {
        inlineData: {
            mimeType: matches[1],
            data: matches[2]
        }
    };
}

export async function generateMatches(userId: string) {
  try {
    console.log(`Starting match generation for user ${userId}`);
    const sourceUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!sourceUser || !sourceUser.lookingForDescription || !sourceUser.location) {
        console.log("User missing required fields for matching");
        return;
    }

    // 1. Fetch Candidates (Hard Filters)
    const candidates = await prisma.user.findMany({
      where: {
        id: { not: userId },
        // Apply age range preference of the source user
        age: {
          gte: sourceUser.ageRangeMin || 18,
          lte: sourceUser.ageRangeMax || 100,
        },
      }
    });

    // 2. Filter & Sort by Distance
    let filteredCandidates = candidates.filter(c => {
        // Gender Check
        if (sourceUser.interestedIn) {
            try {
                const interestedIn = JSON.parse(sourceUser.interestedIn);
                if (Array.isArray(interestedIn) && interestedIn.length > 0) {
                    if (!c.gender || !interestedIn.includes(c.gender)) return false;
                }
            } catch (e) {
                // ignore parsing error
            }
        }
        return true;
    });

    // Calculate distances if both have location
    const candidatesWithDistance = filteredCandidates.map(c => {
        let distance = 999999;
        if (sourceUser.latitude && sourceUser.longitude && c.latitude && c.longitude) {
            distance = getDistance(sourceUser.latitude, sourceUser.longitude, c.latitude, c.longitude);
        }
        return { ...c, distance };
    });

    // Sort by distance
    candidatesWithDistance.sort((a, b) => a.distance - b.distance);

    // 3. Take top 10 (Pagination/Limit)
    const topCandidates = candidatesWithDistance.slice(0, 10);

    console.log(`Found ${topCandidates.length} candidates to score.`);

    // 4. Score with LLM
    for (const targetUser of topCandidates) {
        const parts: Part[] = [];

        // Add Source User Text
        parts.push({
            text: `
          Analyze the match potential between two users.

          **Source User (The one looking):**
          - Name: ${sourceUser.name}
          - Age: ${sourceUser.age}
          - Gender: ${sourceUser.gender}
          - Bio: "${sourceUser.bio}"
          - Interests: ${sourceUser.interests}
          - Looking For: "${sourceUser.lookingForDescription}"

          **Target User (The candidate):**
          - Name: ${targetUser.name}
          - Age: ${targetUser.age}
          - Gender: ${targetUser.gender}
          - Bio: "${targetUser.bio}"
          - Interests: ${targetUser.interests}

          Determine:
          1. **One-Way Score**: How well does the Target fit what the Source is explicitly looking for?
          2. **Two-Way Score**: How compatible are they bidirectionally (assuming Target is looking for someone like Source)?
          3. **Match Factors**: Extract key factors like shared interests, personality vibe match, etc.

          (See attached images if any for visual vibe check)
            `
        });

        // Add Source Image if Base64
        if (sourceUser.photoUrl) {
            const imgPart = getImagePart(sourceUser.photoUrl);
            if (imgPart) {
                 parts.push({ text: "Source User Photo:" });
                 parts.push(imgPart);
            }
        }

        // Add Target Image if Base64
        if (targetUser.photoUrl) {
            const imgPart = getImagePart(targetUser.photoUrl);
            if (imgPart) {
                 parts.push({ text: "Target User Photo:" });
                 parts.push(imgPart);
            }
        }

        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash", // Corrected model
                contents: parts,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: matchSchema,
                },
            });

            const text = response.text;
            if (text) {
                const result = JSON.parse(text);

                // 5. Store Results (Upsert)
                // One-Way
                await prisma.matchRecommendation.upsert({
                    where: {
                        sourceUserId_targetUserId_algorithm: {
                            sourceUserId: sourceUser.id,
                            targetUserId: targetUser.id,
                            algorithm: 'one_way'
                        }
                    },
                    update: {
                        score: result.oneWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors),
                        updatedAt: new Date()
                    },
                    create: {
                        sourceUserId: sourceUser.id,
                        targetUserId: targetUser.id,
                        algorithm: 'one_way',
                        score: result.oneWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors)
                    }
                });

                // Two-Way
                await prisma.matchRecommendation.upsert({
                    where: {
                        sourceUserId_targetUserId_algorithm: {
                            sourceUserId: sourceUser.id,
                            targetUserId: targetUser.id,
                            algorithm: 'two_way'
                        }
                    },
                    update: {
                        score: result.twoWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors),
                        updatedAt: new Date()
                    },
                    create: {
                        sourceUserId: sourceUser.id,
                        targetUserId: targetUser.id,
                        algorithm: 'two_way',
                        score: result.twoWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors)
                    }
                });
            }

        } catch (e) {
            console.error(`Error scoring match for ${targetUser.id}:`, e);
        }
    }
    console.log("Match generation complete.");

  } catch (error) {
    console.error("Error in generateMatches:", error);
  }
}
