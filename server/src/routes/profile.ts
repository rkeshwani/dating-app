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

// Mock Geocoding Function (Replace with real API in production)
const getCoordinates = (city: string): { lat: number, lon: number } | null => {
    const cityMap: Record<string, { lat: number, lon: number }> = {
        "New York": { lat: 40.7128, lon: -74.0060 },
        "San Francisco": { lat: 37.7749, lon: -122.4194 },
        "London": { lat: 51.5074, lon: -0.1278 },
        "Los Angeles": { lat: 34.0522, lon: -118.2437 },
        "Chicago": { lat: 41.8781, lon: -87.6298 },
        "Austin": { lat: 30.2672, lon: -97.7431 },
        // Add more mock data or return random for testing if city unknown
    };
    return cityMap[city] || null;
}

// Update user profile
router.put('/', async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const {
      name, age, gender, location, jobTitle, bio,
      interests, lookingForDescription, photoUrl,
      interestedIn, ageRangePreference, onboardingCompleted,
      latitude, longitude // Allow direct update if client has it
    } = req.body;

    // Determine Coords
    let lat = latitude;
    let lon = longitude;

    if (!lat && !lon && location) {
        // Try to geocode if location changed and coords not provided
        const coords = getCoordinates(location);
        if (coords) {
            lat = coords.lat;
            lon = coords.lon;
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age,
        gender,
        location,
        latitude: lat,
        longitude: lon,
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

    // Trigger Match Generation in Background
    if (onboardingCompleted) {
        generateMatches(userId).catch(err => console.error("Background match generation failed:", err));
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
