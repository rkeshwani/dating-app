import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './config/passport';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import aiRoutes from './routes/ai';
import matchRoutes from './routes/matches';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for secure cookies behind load balancer (Render)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline might be needed for some React setups, refine if possible
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"], // Allow images from https sources (social logins, etc)
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173']
    }
  }
}));

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});
app.use('/auth', authLimiter);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error("CRITICAL: SESSION_SECRET must be set in production environment.");
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Required for secure cookies behind Render load balancer
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site (Render), 'lax' for local
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', aiRoutes);

// Serve static files from the client app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const clientBuildPath = path.join(__dirname, '../../client/dist/index.html');
  // Check if file exists, if not send API running message (dev mode fallback)
  res.sendFile(clientBuildPath, (err) => {
    if (err) {
      res.send('API is running. (Client build not found at ' + clientBuildPath + ')');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
