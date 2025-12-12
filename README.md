# Aura Match - AI Dating Coach

A full-stack application that uses AI to optimize dating profiles.

## Project Structure

This project is a Monorepo managed by npm workspaces:

- **client**: React/Vite frontend.
- **server**: Node.js/Express backend with Prisma & Passport.js.
- **shared**: Shared TypeScript types.

## Prerequisites

- Node.js (v18+ recommended)
- npm (v7+ for workspaces support)

## Installation

1.  **Install Dependencies**:
    Run this command in the root directory to install dependencies for all workspaces:
    ```bash
    npm install
    ```

2.  **Database Setup (Development)**:
    The project uses SQLite for local development. Initialize the database and client:
    ```bash
    cd server
    npx prisma migrate dev --name init
    ```
    *Note: The database file will be created at `server/prisma/dev.db`.*

## Environment Variables

Create a `.env` file in the `server` directory (`server/.env`) with the following variables:

```env
# Server Configuration
PORT=3000
SESSION_SECRET=your_super_secret_session_key

# Database (Prisma defaults to this for sqlite)
DATABASE_URL="file:./dev.db"

# AI Service (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# OAuth Credentials (Optional for Dev/Mock)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

*Tip: For testing without real OAuth credentials, use the "Mock Login" button on the login page.*

## Running the App

To start both the client and server concurrently from the root:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Authentication

The app supports Google and Facebook login. For development purposes, a **Mock Login** strategy is included:
- Click "Mock Login (Dev Only)" on the login screen.
- This creates/logs in a test user without requiring external API keys.

## Deployment Notes

- **Database**: In production (e.g., Digital Ocean), update `DATABASE_URL` to point to a PostgreSQL instance and ensure the `server/prisma/schema.prisma` provider is updated or environment-switchable.
- **Build**: Run `npm run build` in the root to build both client and shared packages.
