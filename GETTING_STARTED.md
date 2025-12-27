# Phase 0.2 Setup Guide

## Current Status

Phase 0.1 foundation development is complete. The application is ready for backend integration.

**Completed:**
- React 18 + TypeScript application
- Component system with responsive layout
- React Router configuration (5 routes)
- Tailwind CSS styling
- Development environment configured
- Git repository initialized

**Available:** Development server at `localhost:5173`

## Phase 0.2: Backend Setup

The next phase requires backend initialization. Choose between Supabase or Firebase based on project requirements.

### Backend Selection

#### Supabase (Recommended)
- **Cost:** Free (500MB storage, unlimited API calls)
- **Database:** PostgreSQL
- **Best for:** Open-source projects, flexible deployments
- **Self-hosting:** Supported via Docker
- **Setup time:** 15-20 minutes

#### Firebase
- **Cost:** $25-75/month at scale
- **Database:** Firestore (NoSQL)
- **Best for:** Production applications with SLA requirements
- **Self-hosting:** Not available
- **Setup time:** 20-30 minutes

## Setup Instructions

### Supabase Setup

1. **Create Account**
   - Visit https://supabase.com
   - Sign up with GitHub or email

2. **Create Project**
   - Click "New Project"
   - Enter project name: "linguafabric"
   - Set password and region
   - Select Free pricing tier
   - Wait for initialization (2-3 minutes)

3. **Get Credentials**
   - Go to Project Settings → API
   - Copy Project URL
   - Copy anon (public) key

4. **Configure Environment**
   ```bash
   # Copy template
   cp .env.local.example .env.local
   
   # Edit .env.local
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_KEY=your_anon_key
   ```

5. **Verify Connection**
   ```bash
   npm run dev
   # Check browser console for connection status
   ```

### Firebase Setup

1. **Create Project**
   - Visit https://console.firebase.google.com
   - Click "Create a project"
   - Enter project name: "linguafabric"
   - Accept terms and create

2. **Enable Services**
   - Go to Build → Firestore Database
   - Click "Create database"
   - Select region and production mode
   - Wait for initialization

3. **Enable Authentication**
   - Go to Build → Authentication
   - Click "Get Started"
   - Enable Email/Password
   - Enable Google OAuth

4. **Get Configuration**
   - Go to Project Settings
   - Scroll to "Your apps"
   - Click "Firebaseconfig"
   - Copy config object

5. **Configure Environment**
   ```bash
   # Copy template
   cp .env.local.example .env.local
   
   # Edit .env.local with Firebase config
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_APP_ID=...
   ```

6. **Verify Connection**
   ```bash
   npm run dev
   # Check browser console for connection status
   ```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Git workflow
git add .
git commit -m "message"
git push origin main
```

## Troubleshooting

### Dev Server Won't Start
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Environment Variables Not Loading
- Verify file is named `.env.local` (not `.env.local.example`)
- File must be in project root
- Restart dev server after editing

### Backend Connection Fails
- Supabase: Verify Project URL and anon key match
- Firebase: Verify all 4 config values are correct
- Check browser console (F12) for error messages
- Verify firewall isn't blocking API calls

## Completion Criteria

Phase 0.2 is complete when:
- ✅ `.env.local` configured with correct credentials
- ✅ Dev server starts without errors
- ✅ No connection errors in console
- ✅ Backend verified in platform dashboard

## Next Steps

After Phase 0.2 completion:
1. Phase 0.3: Authentication system
2. Phase 0.4: Database schema initialization
3. Phase 1: Core language creation features

## References

- [SETUP.md](SETUP.md) - Detailed backend documentation
- [AGENTS.md](AGENTS.md) - Architecture overview
- [systemPatterns.md](systemPatterns.md) - Development patterns
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
