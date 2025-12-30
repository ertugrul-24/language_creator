# Phase 0.2 - Supabase Setup Complete! 🎉

## Your Credentials ✅

**Project URL:** `https://rstnubexowhxrhndfvya.supabase.co`  
**Anon Key:** `sb_publishable_0_aZyrcqZ4VAxeMyK5anfA_fBaprknt`

Environment variables configured in `.env.local` ✓

---

## Step 2: Initialize Database Schema

Your Supabase project is created! Now we need to set up the database schema. **Copy and paste this SQL into Supabase SQL Editor:**

### 2a. Open Supabase SQL Editor

1. Go to **https://supabase.com** → Your Project → **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 2b. Copy the Schema SQL

Open this file: [`docs/supabase_schema.sql`](../docs/supabase_schema.sql)

**Copy ALL the SQL code** and paste into Supabase SQL Editor.

### 2c. Run the Query

Click the **"Run"** button (or press Ctrl+Enter)

⏳ Wait for it to complete (~30 seconds)

You should see: **✅ "Query succeeded"**

---

## What Was Created

✅ **10 Main Tables:**
- `users` - User profiles
- `languages` - Constructed languages
- `dictionary_entries` - Words in languages
- `grammar_rules` - Grammar rules
- `courses` - Learning courses
- `lessons` - Lessons in courses
- `activity_log` - User activity tracking
- `friendships` - Friend connections
- `collaboration_invites` - Language collaboration
- And supporting tables for phonemes, flashcards, quiz questions, etc.

✅ **Indexes** for fast queries  
✅ **Row-Level Security (RLS)** for data privacy  
✅ **Real-time subscriptions** enabled on key tables  
✅ **Automatic timestamps** with triggers  

---

## Step 3: Configure Authentication (Email + Google OAuth)

### 3a. Email Authentication (Already Enabled ✓)

Email/password auth is enabled by default. Users can sign up with email.

### 3b. Enable Google OAuth

1. Go to **Supabase Dashboard** → **Authentication** (left sidebar)
2. Click **"Providers"** tab
3. Find **"Google"** → Click toggle to enable
4. You'll see: "Google OAuth needs credentials"
5. Click **"Get Google OAuth Credentials"** or go to:
   - https://console.cloud.google.com
   - Create a new project
   - Go to **Credentials** → **OAuth 2.0 Client ID**
   - Type: **Web application**
   - Authorized redirect URIs: Add `https://rstnubexowhxrhndfvya.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
6. Paste them into Supabase Authentication → Google provider
7. Click **"Save"**

💡 **Google OAuth is optional for MVP** - Email authentication is sufficient to launch!

---

## Step 4: Test Connection

We've already created the Supabase client in your code at:
- [`src/services/supabaseClient.ts`](../../src/services/supabaseClient.ts)
- [`src/services/authService.ts`](../../src/services/authService.ts)

### 4a. Install Dependencies

Make sure Node.js and npm are in your PATH. Then run:

```bash
npm install @supabase/supabase-js
```

### 4b. Start Dev Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### 4c. Test Connection

Open browser console (F12) and you should see:
```
✅ Supabase connected
```

If you see errors, check:
- `.env.local` has correct URL and key
- `.env.local` is in `.gitignore` (don't commit credentials!)

---

## Next Steps (Phase 0.3)

Once connection is verified, we'll build:

✅ **Login Page** (`/auth/login`)  
✅ **Signup Page** (`/auth/signup`)  
✅ **Auth Context** for state management  
✅ **Route Protection** (Private routes)  
✅ **Logout** functionality  

---

## Important Security Notes

⚠️ **Never commit `.env.local`** - It's in `.gitignore`

✅ **Anon Key is public** - It's safe to expose (only has read/write via RLS)

✅ **Row-Level Security (RLS)** protects data - Users can only access:
- Their own profiles
- Public languages
- Languages they collaborate on

✅ **Real-time subscriptions** are automatic when schema is set up

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Supabase URL or key missing" | Check `.env.local` has correct values |
| SQL query fails | Copy entire SQL file again, ensure no partial paste |
| "No table named users" | Schema wasn't created. Run SQL query again. |
| Google OAuth won't work | Set Authorized redirect URI correctly in Google Console |
| Node/npm not found | Install Node.js from nodejs.org, restart terminal |

---

## Your Progress

✅ Phase 0.1 - React project  
✅ Phase 0.2 - Supabase configured  
🔄 Phase 0.3 - Authentication system (NEXT)

**Estimated time:** 30 minutes for next phase

---

**Questions?** Check SETUP.md for full backend configuration guide.
