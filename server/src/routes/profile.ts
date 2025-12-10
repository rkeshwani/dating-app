import express from 'express';
import { PrismaClient } from '@prisma/client';

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

// Get current user profile
router.get('/', async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse JSON fields
    const parsedUser = {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
      interestedIn: user.interestedIn ? JSON.parse(user.interestedIn) : [],
      ageRangePreference: {
        min: user.ageRangeMin || 18,
        max: user.ageRangeMax || 100
      }
    };

    res.json(parsedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const {
      name, age, gender, location, jobTitle, bio,
      interests, lookingForDescription, photoUrl,
      interestedIn, ageRangePreference, onboardingCompleted
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age,
        gender,
        location,
        jobTitle,
        bio,
        interests: JSON.stringify(interests || []),
        lookingForDescription,
        photoUrl,
        interestedIn: JSON.stringify(interestedIn || []),
        ageRangeMin: ageRangePreference?.min,
        ageRangeMax: ageRangePreference?.max,
        onboardingCompleted
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
