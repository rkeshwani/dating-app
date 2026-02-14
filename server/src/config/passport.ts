import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as CustomStrategy } from 'passport-custom';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      // Parse JSON fields to match UserProfile interface
      const parsedUser = {
        ...user,
        interests: user.interests ? JSON.parse(user.interests) : [],
        interestedIn: user.interestedIn ? JSON.parse(user.interestedIn) : [],
        ageRangePreference: {
          min: user.ageRangeMin || 18,
          max: user.ageRangeMax || 100
        }
      };
      done(null, parsedUser);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

// Mock Strategy for Dev
passport.use('mock', new CustomStrategy(
  async (req, done) => {
    try {
      // Find or create a mock user
      let user = await prisma.user.findFirst({ where: { email: 'mock@example.com' } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'mock@example.com',
            name: 'Mock User',
            googleId: 'mock-google-id',
            photoUrl: 'https://picsum.photos/400/400',
            onboardingCompleted: false
          }
        });
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0].value,
              name: profile.displayName,
              photoUrl: profile.photos?.[0].value
            }
          });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }));
} else {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google Login will not work.");
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email'],
    proxy: true
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { facebookId: profile.id } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              facebookId: profile.id,
              email: profile.emails?.[0].value,
              name: profile.displayName,
              photoUrl: profile.photos?.[0].value
            }
          });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }));
} else {
  console.warn("FACEBOOK_APP_ID or FACEBOOK_APP_SECRET missing. Facebook Login will not work.");
}
