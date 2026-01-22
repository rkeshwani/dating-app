/**
 * Portions of this recommendation logic are inspired by the x-algorithm (Phoenix) by xAI.
 * Licensed under the Apache License, Version 2.0.
 * See: https://github.com/xai-org/x-algorithm
 */

import { PrismaClient, User } from '@prisma/client';
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
    sourceSwipeProbability: { type: Type.INTEGER, description: "Probability (0-100) that the Source user will swipe right on the Target." },
    targetSwipeProbability: { type: Type.INTEGER, description: "Probability (0-100) that the Target user will swipe right on the Source." },
    reasoning: { type: Type.STRING, description: "Reasoning for the predicted probabilities." },
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
  required: ["sourceSwipeProbability", "targetSwipeProbability", "reasoning", "matchFactors"]
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
    // Exclude users already scored for this source user to allow paginating through the pool.
    const candidates = await prisma.user.findMany({
      where: {
        id: { not: userId },
        // Apply age range preference of the source user
        age: {
          gte: sourceUser.ageRangeMin || 18,
          lte: sourceUser.ageRangeMax || 100,
        },
        // Exclude candidates who already have a recommendation from this source user
        matchRecommendationsAsTarget: {
            none: {
                sourceUserId: userId
            }
        }
      }
    });

    // 2. Filter & Sort by Distance
    let filteredCandidates = candidates.filter((c: User) => {
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
    const candidatesWithDistance = filteredCandidates.map((c: User) => {
        let distance = 999999;
        if (sourceUser.latitude && sourceUser.longitude && c.latitude && c.longitude) {
            distance = getDistance(sourceUser.latitude, sourceUser.longitude, c.latitude, c.longitude);
        }
        return { ...c, distance };
    });

    // Sort by distance
    candidatesWithDistance.sort((a: User & { distance: number }, b: User & { distance: number }) => a.distance - b.distance);

    // 3. Take top 10 (Pagination/Limit)
    const topCandidates = candidatesWithDistance.slice(0, 10);

    console.log(`Found ${topCandidates.length} new candidates to score.`);

    // 4. Score with LLM (Phoenix-inspired engagement prediction)
    for (const targetUser of topCandidates) {
        const parts: Part[] = [];

        // Structure inputs as Feature Sets
        parts.push({
            text: `
          Act as a recommendation system. You are predicting the probability of a specific engagement: a "Swipe Right".

          Analyze the compatibility between the Source User and Candidate User based on their profile features.

          **Source User Features (The one browsing):**
          - Name: ${sourceUser.name}
          - Age: ${sourceUser.age}
          - Gender: ${sourceUser.gender}
          - Job Title: ${sourceUser.jobTitle}
          - Bio: "${sourceUser.bio}"
          - Interests: ${sourceUser.interests}
          - Looking For: "${sourceUser.lookingForDescription}"
          - Interested In (Gender): ${sourceUser.interestedIn}

          **Candidate User Features (The profile being viewed):**
          - Name: ${targetUser.name}
          - Age: ${targetUser.age}
          - Gender: ${targetUser.gender}
          - Job Title: ${targetUser.jobTitle}
          - Bio: "${targetUser.bio}"
          - Interests: ${targetUser.interests}
          - Looking For: "${targetUser.lookingForDescription}"

          **Task:**
          Predict the probability (0-100) of a "Swipe Right" action in both directions.

          1. **sourceSwipeProbability**: What is the probability the Source User will swipe right on the Candidate? Consider if the Candidate matches the Source's "Looking For" and preferences.
          2. **targetSwipeProbability**: What is the probability the Candidate User will swipe right on the Source? Consider if the Source matches the Candidate's "Looking For" and preferences.
          3. **Match Factors**: Extract key reasons for these predictions.

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
                model: "gemini-2.5-flash-lite",
                contents: parts,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: matchSchema,
                },
            });

            const text = response.text;
            if (text) {
                const result = JSON.parse(text);

                // Calculate Scores
                const sourceProb = result.sourceSwipeProbability || 0;
                const targetProb = result.targetSwipeProbability || 0;

                // One-Way Score is simply the probability Source likes Target
                const oneWayScore = sourceProb;

                // Two-Way Score is the joint probability (Source likes Target AND Target likes Source)
                // Normalize: (P(A) * P(B)) / 100 to keep it on 0-100 scale
                const twoWayScore = Math.round((sourceProb * targetProb) / 100);

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
                        score: oneWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors),
                        updatedAt: new Date()
                    },
                    create: {
                        sourceUserId: sourceUser.id,
                        targetUserId: targetUser.id,
                        algorithm: 'one_way',
                        score: oneWayScore,
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
                        score: twoWayScore,
                        reasoning: result.reasoning,
                        matchFactors: JSON.stringify(result.matchFactors),
                        updatedAt: new Date()
                    },
                    create: {
                        sourceUserId: sourceUser.id,
                        targetUserId: targetUser.id,
                        algorithm: 'two_way',
                        score: twoWayScore,
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
