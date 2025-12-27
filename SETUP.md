# LinguaFabric Setup Guides

## Quick Start

Choose your backend and follow the appropriate guide.

## Option A: Supabase (Free/Open-Source) ⭐ Recommended

**Perfect for:** Open-source development, community contributions, free tier unlimited

### 1. Create Supabase Project

Visit [supabase.com](https://supabase.com) and sign up

1. Click **"New Project"**
2. Enter project details:
   - **Name:** LinguaFabric
   - **Database password:** Generate strong password
   - **Region:** Closest to you
3. Click **"Create new project"** (wait 2-3 minutes)

### 2. Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_KEY`

### 3. Set Up Environment Variables

Create `.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_anon_key

# Translation (choose one)
VITE_DEEPL_API_KEY=optional
VITE_HUGGINGFACE_API_KEY=optional
```

### 4. Initialize Database Schema

In Supabase Console:

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy and run the SQL from [supabase-schema.sql](./docs/supabase-schema.sql)

### 5. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable:
   - ✅ **Email** - Leave as is (default)
   - ✅ **Google** - Add OAuth credentials (optional)
   - ✅ **GitHub** - Add OAuth credentials (optional)

### 6. Set Up Real-time

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `users`
   - `languages`
   - `dictionaries`
   - `grammar_rules`
   - `courses`

### 7. Run the Project

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## Option B: Firebase (Paid/Enterprise)

**Perfect for:** Production apps, SLA support, easy scaling

### 1. Create Firebase Project

Visit [console.firebase.google.com](https://console.firebase.google.com)

1. Click **"Add project"**
2. Enter project name: **LinguaFabric**
3. Disable Google Analytics
4. Click **"Create project"**

### 2. Enable Firestore

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **Production mode**
4. Select region (us-central1 recommended)
5. Click **"Create"**

### 3. Enable Authentication

1. Go to **Authentication**
2. Click **"Get started"**
3. Enable:
   - **Email/Password** - Toggle ON
   - **Google** - Toggle ON, add OAuth consent screen

### 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"**
3. Click **`</>`** to create web app
4. Name it: **linguafabric-web**
5. Copy the `firebaseConfig` object

### 5. Set Up Environment Variables

Create `.env.local`:

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Translation
VITE_DEEPL_API_KEY=optional
```

### 6. Create Firestore Collections

In Firebase Console:

1. Go to **Firestore Database**
2. Click **"Start collection"**
3. Create these collections:
   - `users`
   - `languages`
   - `collaborationInvites`
   - `friendships`

### 7. Set Firestore Security Rules

1. Go to **Firestore** → **Rules**
2. Replace default with [firebase-rules.txt](./docs/firebase-rules.txt)
3. Click **"Publish"**

### 8. Run the Project

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## Switching Backends

The code supports both backends. To switch:

### Supabase → Firebase

1. Update `.env.local` with Firebase credentials
2. The service layer automatically detects the backend
3. No code changes needed!

### Firebase → Supabase

1. Update `.env.local` with Supabase credentials
2. The service layer automatically detects the backend
3. No code changes needed!

---

## Local Development with Docker

### Run Everything Locally

```bash
docker-compose up -d
```

This starts:
- ✅ Supabase (PostgreSQL + Auth)
- ✅ Frontend (React dev server)
- ✅ pgAdmin (database GUI)

Access:
- Frontend: `http://localhost:5173`
- pgAdmin: `http://localhost:5050`
- Supabase: `http://localhost:54321`

---

## Troubleshooting

### "VITE_SUPABASE_URL is not set"
- Check `.env.local` file exists
- Verify Supabase credentials are correct
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Firebase initialization failed"
- Verify Firebase config in `.env.local`
- Check Project ID matches Firebase Console
- Ensure Firestore is enabled

### "Authentication not working"
- **Supabase:** Check Providers are enabled in Auth
- **Firebase:** Check Email/Password and OAuth are enabled
- Check redirect URLs match your domain

### "Real-time updates not working"
- **Supabase:** Enable replication on tables (see Setup step 6)
- **Firebase:** Firestore real-time is automatic

---

## Next Steps

1. ✅ Backend is set up
2. 📖 Read [ARCHITECTURE.md](../AGENTS.md) for code overview
3. 🏗️ Start with [Phase 0.3](../progress.md) - Authentication
4. 💬 Join discussions for questions

---

**Questions?** Open a GitHub Issue or Discussion! 🚀
