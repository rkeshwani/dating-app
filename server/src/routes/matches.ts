import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateMatches } from '../services/matchService';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

router.use(ensureAuthenticated);

/**
 * POST /matches/generate
 * Manually trigger match generation for the current user.
 */
router.post('/generate', async (req, res) => {
    const userId = (req.user as any).id;
    try {
        // Trigger in background
        generateMatches(userId).catch(err => console.error("Manual match generation failed:", err));
        res.json({ message: "Match generation started in background." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * GET /matches/recommendations
 * Retrieve generated matches.
 * Query Params:
 *  - type: 'one_way' | 'two_way' (default: 'one_way')
 */
router.get('/recommendations', async (req, res) => {
    const userId = (req.user as any).id;
    const type = (req.query.type as string) || 'one_way';

    if (type !== 'one_way' && type !== 'two_way') {
        return res.status(400).json({ message: "Invalid type. Must be 'one_way' or 'two_way'." });
    }

    try {
        const recommendations = await prisma.matchRecommendation.findMany({
            where: {
                sourceUserId: userId,
                algorithm: type
            },
            include: {
                targetUser: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        gender: true,
                        location: true,
                        jobTitle: true,
                        bio: true,
                        interests: true,
                        photoUrl: true
                    }
                }
            },
            orderBy: {
                score: 'desc'
            }
        });

        // Parse JSON fields for the frontend
        const parsedRecommendations = recommendations.map(rec => ({
            ...rec,
            matchFactors: rec.matchFactors ? JSON.parse(rec.matchFactors) : null,
            targetUser: {
                ...rec.targetUser,
                interests: rec.targetUser.interests ? JSON.parse(rec.targetUser.interests) : []
            }
        }));

        res.json(parsedRecommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
