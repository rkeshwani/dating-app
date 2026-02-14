import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/admin';

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin check to all routes in this router
router.use(requireAdmin);

router.get('/dashboard', async (req, res) => {
    try {
        const userCount = await prisma.user.count();

        // Count total match recommendations (since we don't have explicit "swipes" yet)
        // This serves as a proxy for activity
        const matchCount = await prisma.matchRecommendation.count();

        // Average match score
        const aggregate = await prisma.matchRecommendation.aggregate({
            _avg: {
                score: true
            }
        });

        // Count users who have completed onboarding
        const onboardedUserCount = await prisma.user.count({
            where: { onboardingCompleted: true }
        });

        res.json({
            userCount,
            activeUserCount: onboardedUserCount,
            matchCount,
            avgMatchScore: aggregate._avg.score ? Math.round(aggregate._avg.score) : 0,
        });
    } catch (error) {
        console.error('Error fetching admin dashboard metrics:', error);
        res.status(500).json({ message: 'Server error fetching metrics' });
    }
});

export default router;
