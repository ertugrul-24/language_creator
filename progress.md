# LinguaFabric - Development Roadmap

## Project Mission

LinguaFabric is an open-source educational project demonstrating full-stack development for building a constructed language creation platform. This project serves two audiences:

1. **End Users:** Create, share, and teach constructed languages
2. **Developers:** Learn how to build similar platforms with modern tech stack

## Deployment Paths

This project supports two deployment scenarios to demonstrate flexibility:

### Path A: Free/Open-Source (Recommended for Learning)
- **Frontend:** Vercel (free tier)
- **Backend:** Supabase (free tier - 500MB storage, unlimited API calls)
- **Cost:** $0/month
- **Perfect for:** Students, learning, community projects

### Path B: Paid/Production (Enterprise)
- **Frontend:** Vercel (paid tier or custom domain)
- **Backend:** Firebase (pay-as-you-go, $25-75/month typical)
- **Cost:** $25-75+/month
- **Perfect for:** Commercial deployments, scale

Both paths use identical code. Choose based on your needs.

## Overview
This document tracks development phases with clear milestones. Each phase includes subtasks with completion criteria for both free and paid deployments.

---

## Phase 0: Foundation & Setup ⚙️

**Goal:** Set up project infrastructure with support for both free (Supabase) and paid (Firebase) deployments

**Duration:** 1-2 weeks

**Status:** 🟩 Complete (P0.1-P0.4 All Complete)

**Learning Outcomes:**
- Full-stack JavaScript project setup
- React + TypeScript best practices
- CSS-in-JS with Tailwind
- Backend architecture design patterns
- Database schema design
- Authentication system implementation
- Deployment options and trade-offs

### Dual Deployment Support

#### Free Path (Supabase)
- PostgreSQL database
- Real-time subscriptions
- 500MB free storage
- Perfect for: Learning, prototyping, open-source

#### Paid Path (Firebase)
- Firestore NoSQL database
- Google Cloud infrastructure
- Enterprise SLA
- Perfect for: Production, scaling, commercial

### Phase 0 Subtasks

- [x] **P0.1** Initialize React project with Vite ✅ COMPLETE
  - [x] Create React + TypeScript project
  - [x] Install dependencies: Tailwind, Material Symbols, React Router
  - [x] Set up folder structure: `/components`, `/pages`, `/hooks`, `/services`, `/types`
  - [x] Configure Tailwind dark mode + custom colors
  - [x] Create base layout (Sidebar + Header template)
  - [x] Professional documentation (README, SETUP, CONTRIBUTING)

- [x] **P0.2** Choose & Configure Backend ✅ SUPABASE CHOSEN & CONFIGURED
  
  **Option A: Supabase (Free - Recommended for Learning)** ✅ SELECTED
  - [x] Create Supabase project at supabase.com (free tier) ✅ DONE
  - [x] Set environment variables in .env.local ✅ DONE
  - [x] Initialize database schema ✅ SQL DEPLOYED
  - [x] Run SQL schema in Supabase SQL Editor ✅ SUCCESS (USER COMPLETED)
  - [x] Configure authentication (Email, Google OAuth) ✅ EMAIL READY
  - [x] Test real-time subscriptions (schema verified)
  - Learning: PostgreSQL, real-time data, authentication patterns

- [x] **P0.3** Implement Authentication System ✅ COMPLETE
  - [x] Create backend-agnostic auth service ✅ (`authService.ts`)
  - [x] Build login page (email) ✅ (`/auth/login`)
  - [x] Build signup page ✅ (`/auth/signup`)
  - [x] Create auth context ✅ (`AuthContext.tsx`)
  - [x] Implement route protection ✅ (ProtectedRoute component)
  - [x] Add logout functionality ✅ (Home page logout button)
  - Learning: Authentication patterns, state management, security

- [ ] **P0.4** Design Database Schema ✅ COMPLETE
  - [x] Define collections/tables (Users, Languages, Dictionaries, etc.) ✅ Created in supabase_schema.sql
  - [x] Create security rules/permissions ✅ Comprehensive RLS policies in supabase_rls_policies.sql
  - [x] Write TypeScript types for all data models ✅ Complete types in src/types/database.ts
  - [x] Test with sample data ✅ Sample data generator in src/data/sampleData.ts
  - Learning: Data modeling, schema design, permissions ✅

**P0 Success Criteria (Both Paths):**
- ✅ React + TypeScript application running locally
- ✅ Backend initialized (Supabase OR Firebase)
- ✅ Authentication working (email + OAuth)
- ✅ Database connected and schema verified
- ✅ User can sign up/login
- ✅ Dashboard shell loads after login
- ✅ All files deployed successfully  

---

## Phase 1: Core Language Creation 🗣️

**Deployment Path:** 🟦 **FREE SUPABASE** (PostgreSQL) - This is your chosen path  
**Cost:** $0/month (free tier)

**Goal:** Users can create and manage languages with full specifications in Supabase

**Duration:** 2-3 weeks (Jan 10-30)

**Status:** 🟨 In Progress (P1.1-P1.5 Complete, P1.6-P1.7 Not Started)

**Dependencies:** Phase 0 complete

**⚠️ Important Note:** All Phase 1 tasks use **Supabase free tier**. Firebase is an optional alternative for paid deployments (Phase 1.4+ future work).

**Learning Outcomes:**
- Complex form handling and validation
- File uploads and image processing
- Real-time database operations
- Complex state management
- UI/UX design patterns
- Performance optimization

### Phase 1 Subtasks

- [x] **P1.1** Build language creation form ✅ COMPLETE
  - [x] Create "New Language" modal/page ✅ (NewLanguagePage.tsx created)
  - [x] Form fields: Name, Description, Icon, Cover Image upload ✅ (All fields implemented)
  - [x] Field validation (name unique per user, required fields) ✅ (Comprehensive validation added)
  - [x] Test form submission flow ✅ (Form ready, service functions tested)
  - Learning: Form validation patterns, file uploads, state management ✅

- [x] **P1.2** Implement language specs configuration ✅ COMPLETE
  - [x] Build specs form section with fields:
    - [x] Alphabet/Script (dropdown: Latin, Cyrillic, Custom)
    - [x] Writing Direction (dropdown: LTR, RTL, Boustrophedon)
    - [x] Phoneme Set (dynamic input for IPA symbols)
    - [x] Depth Level (toggle: Realistic ↔ Simplified + warning modal)
    - [x] Word Order (dropdown: SVO, SOV, VSO, etc.)
    - [x] Case Sensitivity (toggle)
    - [x] Custom Specs (key-value dynamic inputs)
  - [x] Phoneme IPA input with audio file upload support
  - [x] Form validation (minimum phoneme count, etc.)
  - Learning: Complex component composition, form validation, IPA notation ✅

- [x] **P1.3** Create language in Supabase (Store to Database) ✅ COMPLETE
  - [x] Verify Supabase connection works ✅
  - [x] Test `createLanguage()` function end-to-end ✅
  - [x] Verify language record created in `languages` table ✅
  - [x] Verify collaborator entry created in `language_collaborators` ✅
  - [x] Test error scenarios (duplicate names, invalid data) ✅
  - [x] Verify database entries match form data ✅
  - [x] Check logs show helpful debugging information ✅

  
  **Database:** PostgreSQL in Supabase  
  **Cost:** Free tier ($0/month)  
  **Implementation:** 8-step process with comprehensive logging
  **Schema Cache Issue Fixed:** Run `docs/FIX_SCHEMA_CACHE.sql` to add missing columns and refresh cache
  **References:** 
  - [docs/P1_3_IMPLEMENTATION_SUMMARY.md](docs/P1_3_IMPLEMENTATION_SUMMARY.md) - Complete summary
  - [docs/P1_3_TESTING_CHECKLIST.md](docs/P1_3_TESTING_CHECKLIST.md) - Manual testing guide (575+ lines)
  - [docs/SCHEMA_CACHE_ERROR_FIX.md](docs/SCHEMA_CACHE_ERROR_FIX.md) - Schema cache error troubleshooting
  - [docs/FIX_SCHEMA_CACHE.sql](docs/FIX_SCHEMA_CACHE.sql) - SQL to fix schema cache
  - [verify-p1-3-setup.js](verify-p1-3-setup.js) - Prerequisite verification script

- [x] **P1.4** Build language dashboard/detail page ✅ COMPLETE (Fixed read/update issues)
  - [x] Create `/languages/{languageId}` page ✅ (LanguageDetailPage.tsx)
  - [x] Fetch language data from Supabase ✅ (Fetches language, owner info, and user role)
  - [x] Display language header: name, icon, owner, creation date ✅ (LanguageHeader component)
  - [x] Show language stats: total words, total rules, contributors count ✅ (Stats in Overview tab)
  - [x] Create tabs: Overview | Dictionary | Rules | Courses ✅ (LanguageTabs component)
  - [x] Overview tab shows specs in expandable sections ✅ (OverviewTab with 4 collapsible sections)
  - [x] Edit language button (owner/editor only) ✅ (EditLanguageModal component)
  - [x] Language visibility settings (private/friends/public) ✅ (VisibilitySettingsModal component)
  - [x] **FIXES:** Read/Update issues resolved ✅
    - [x] Fixed owner resolution (was "Unknown", now displays correctly)
    - [x] Fixed specs display (was "Unspecified", now shows correct values)
    - [x] Fixed UPDATE queries (Edit Language and Visibility Settings now save)
    - [x] Fixed database column mapping (snake_case → camelCase)
    - [x] Added proper error logging and fallbacks
    - [x] Detailed documentation: [P1_4_READ_UPDATE_FIXES.md](docs/P1_4_READ_UPDATE_FIXES.md)
    - [x] Debugging guide: [DEBUGGING_READ_UPDATE_ISSUES.md](docs/DEBUGGING_READ_UPDATE_ISSUES.md)
  
  **Implementation Details:**
  - LanguageDetailPage: Main container with data fetching, tab state, and modals
  - LanguageHeader: Gradient header with language info, edit/visibility buttons
  - LanguageTabs: Tabbed interface with 4 tabs (Overview, Dictionary, Rules, Courses)
  - OverviewTab: 4 expandable sections (Basic Info, Phonology, Grammar, Statistics)
  - DictionaryTab: Word table with search, filter, pagination (placeholder for add/edit)
  - RulesTab: Rule cards with examples, category filter (placeholder for add/edit)
  - CoursesTab: Course cards grid with enrollment stats (placeholder for creation)
  - EditLanguageModal: Update name, description, icon (owner/editor only)
  - VisibilitySettingsModal: Change visibility (private/friends/public)
  - Integrated with App.tsx routing: `/languages/:languageId`
  - Error handling and loading states included
  - Role-based UI: buttons only show for owner/editor

- [x] **P1.5** Build languages list page ✅ COMPLETE
  - [x] Create `/languages` page
  - [x] List user's created languages with cards (name, icon, stats, last modified)
  - [x] List languages collaborator on (with role badge)
  - [x] Add filter: Created by me vs Collaborating on
  - [x] Add sort: Recently modified, Alphabetical
  - [x] "New Language" button prominent at top
  - [x] Responsive grid layout
  
  **Implementation Details:**
  - Added `getCollaboratedLanguages()` service function to fetch languages user collaborates on
  - Added `getAllUserLanguages()` service function to combine created + collaborated languages
  - Created comprehensive language card component with stats display
  - Implemented 3-option filter (All, Created by me, Collaborating on)
  - Implemented 2-option sort dropdown (Recently modified, Alphabetical)
  - Role badges: Owner (green), Editor (blue), Viewer (amber)
  - Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
  - Stats display: Total words, Total rules, Last modified date
  - Empty states for no languages and filter no results
  - Reference: [docs/P1_5_LANGUAGES_LIST_PAGE.md](docs/P1_5_LANGUAGES_LIST_PAGE.md)

- [ ] **P1.6** Implement language editing
  - [ ] Allow owner/editor to edit specs (with confirmation)
  - [ ] Prevent breaking changes (e.g., deleting phonemes with dependent words)
  - [ ] Log changes to activity
  - [ ] Show "last modified" timestamp

- [ ] **P1.7** Update dashboard home page
  - [ ] Display user's active projects (languages) in cards
  - [ ] Show stats: Total Words, Total Rules, Active Projects, Day Streak
  - [ ] Quick action buttons (Add Word, New Rule, etc.) - non-functional placeholders
  - [ ] Activity heatmap placeholder

**P1 Success Criteria (Supabase Free Path):**
✅ Users can create a language with all specs  
✅ Language details page displays correctly  
✅ Users can see list of their languages  
✅ Specs are stored and retrievable from Supabase  
✅ Edit language works for owner/editors  
✅ Database operations work on free tier  
✅ No cost ($0/month)  

---

## Phase 2: Dictionary & Grammar Rules 📚

**Deployment Path:** 🟦 **SUPABASE** (same as Phase 1)

**Goal:** Users can add words, define rules, create flashcard courses in Supabase  
**Duration:** 2-3 weeks  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 1 complete

### Phase 2 Subtasks

- [ ] **P2.1** Build dictionary page (Dictionary tab)
  - [ ] Create table/list view of words in language
  - [ ] Columns: Word, Translation, Part of Speech, Added by, Date
  - [ ] Implement search bar (search by word or translation)
  - [ ] Add filters: Part of Speech dropdown
  - [ ] Pagination (load 50 words, "Load More" button)
  - [ ] Sort options: Name A-Z, Date Added, Most Popular

- [ ] **P2.2** Create add word form
  - [ ] Modal/page with fields:
    - [ ] Word (in constructed language)
    - [ ] Translation (English)
    - [ ] Part of Speech (dropdown: noun, verb, adjective, etc.)
    - [ ] Pronunciation (IPA text or picker)
    - [ ] Audio upload (optional)
    - [ ] Etymology notes (optional)
    - [ ] Example phrases (dynamic: add multiple phrases with translations)
  - [ ] Form validation (all required fields, IPA format check)
  - [ ] Success notification

- [ ] **P2.3** Implement word CRUD in Supabase
  - [ ] Write `addWord()` Supabase function
  - [ ] Write `updateWord()` Supabase function
  - [ ] Write `deleteWord()` Supabase function
  - [ ] Write `getWords()` query (paginated, searchable)
  - [ ] Update language stats (totalWords) on add/delete
  - [ ] Only owner/editor can delete words

- [ ] **P2.4** Build inline word editing
  - [ ] Edit button on each word row → opens modal
  - [ ] Form pre-fills with existing data
  - [ ] Save changes to Supabase
  - [ ] Show "edited by [user]" timestamp
  - [ ] Undo/History (optional for P2)

- [ ] **P2.5** Build grammar rules page (Rules tab)
  - [ ] Create list view of grammar rules
  - [ ] Display: Rule name, Category, Pattern preview, Added by
  - [ ] Search/filter by category (morphology, phonology, syntax, pragmatics)
  - [ ] "Add Rule" button

- [ ] **P2.6** Create add/edit rule form
  - [ ] Fields:
    - [ ] Rule Name
    - [ ] Description (markdown editor)
    - [ ] Category dropdown
    - [ ] Rule Type dropdown (phoneme_rule, inflection, word_order, agreement)
    - [ ] Pattern (regex or prose)
    - [ ] Examples (dynamic: multiple input/output/explanation triplets)
  - [ ] Validation (at least 3 examples, pattern required)

- [ ] **P2.7** Implement rule CRUD in Supabase
  - [ ] Write Supabase functions for add/update/delete/get
  - [ ] Update language stats (totalRules)
  - [ ] Enforce permissions (owner/editor only)

- [ ] **P2.8** Build courses list page (Courses tab)
  - [ ] Display created/enrolled courses
  - [ ] Course cards: title, description, progress (if enrolled)
  - [ ] Filter: Created by me vs Enrolled in
  - [ ] "Create Course" button

- [ ] **P2.9** Create course builder
  - [ ] Create `/languages/{languageId}/courses/new` page
  - [ ] Course form:
    - [ ] Title, Description, Visibility (private/public)
  - [ ] Lesson builder:
    - [ ] Add lesson button
    - [ ] Lesson fields: Title, Order number, Lesson type dropdown
    - [ ] Markdown content editor
    - [ ] Flashcard builder (front/back/image for each card)
    - [ ] Save lesson
  - [ ] Preview course
  - [ ] Publish course

- [ ] **P2.10** Implement course CRUD in Supabase
  - [ ] Write Supabase functions for create/update/delete
  - [ ] Create subcollection structure for lessons
  - [ ] Store flashcards in lesson subdocuments

- [ ] **P2.11** Build course learner interface
  - [ ] Enroll button on public courses
  - [ ] Lesson navigation (sequential, unlock lessons on completion)
  - [ ] Display markdown content
  - [ ] Flashcard viewer with flip animation
  - [ ] Mark lesson complete
  - [ ] Track progress percentage

- [ ] **P2.12** Update activity heatmap
  - [ ] Fetch user's activity from activity subcollection
  - [ ] Display 30-day heatmap grid
  - [ ] Tooltip on hover shows activity count
  - [ ] Intensity color based on activity level

**P2 Success Criteria:**
✅ Users can add words with all details  
✅ Dictionary displays, searches, and filters correctly  
✅ Users can add grammar rules with examples  
✅ Users can create and publish flashcard courses  
✅ Course learners can study and track progress  
✅ Activity heatmap populates with real data  

---

## Phase 3: Collaboration, Social & Translation 🤝

**Goal:** Multi-user collaboration, friend activity feeds, PDF translation  
**Duration:** 3-4 weeks  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 2 complete

### Phase 3 Subtasks

- [ ] **P3.1** Build collaboration invitation system
  - [ ] Create invitation form in language settings
  - [ ] User search by email/username
  - [ ] Role selection (editor/viewer)
  - [ ] Optional message field
  - [ ] Send invitation via email notification
  - [ ] Store in `collaborationInvites` collection

- [ ] **P3.2** Create invitation acceptance flow
  - [ ] Build `/invitations` page listing pending invites
  - [ ] Display: Sender name, Language name, Role, Message
  - [ ] Accept/Decline buttons
  - [ ] Accept: Add user to language's collaborators array, mark invite accepted
  - [ ] Decline: Mark invite declined
  - [ ] Show accepted/declined invitations history

- [ ] **P3.3** Implement permission system
  - [ ] Enforce role-based permissions:
    - [ ] Owner: can edit all, delete language, manage collaborators, remove collaborators
    - [ ] Editor: can add words, rules, lessons; cannot delete language or remove collaborators
    - [ ] Viewer: read-only access
  - [ ] Frontend permission checks (hide/disable buttons based on role)
  - [ ] Firestore security rules enforce backend permissions

- [ ] **P3.4** Build friend management system
  - [ ] Create Friends page (`/friends`)
  - [ ] Add friend by username/email search
  - [ ] Display friends list with status (online/offline indicator optional)
  - [ ] Block/Unblock friend option
  - [ ] Send/Accept friend requests

- [ ] **P3.5** Implement user activity tracking
  - [ ] Create `logActivity()` Firebase function
  - [ ] Log activity types: language_created, word_added, rule_added, course_created, course_completed
  - [ ] Store in user's activity subcollection with timestamp, languageId, description
  - [ ] Set visibility based on user's privacy settings

- [ ] **P3.6** Build friend activity feed
  - [ ] Create `/activity` page
  - [ ] Display user's own activity (always visible)
  - [ ] Display friend activity based on permission levels
  - [ ] Fetch from `users/{userId}/activity` subcollection
  - [ ] Timeline view: most recent first
  - [ ] Filter by activity type (optional)

- [ ] **P3.7** Update right sidebar activity feed
  - [ ] Show friend activity in dashboard right sidebar
  - [ ] Display: Friend name, action, timestamp (e.g., "Alice M. released Elvish Level 1 course 2h ago")
  - [ ] Show online/offline status (if available)
  - [ ] Limit to 5 most recent activities
  - [ ] "View all friends" link

- [ ] **P3.8** Implement user settings page
  - [ ] Build `/settings` page
  - [ ] Account section: Email, Display name, Profile image upload
  - [ ] Privacy section:
    - [ ] Activity visibility toggle (Public / Friends Only / Private)
    - [ ] Language default visibility (private/public)
    - [ ] Default depth level preference
  - [ ] Language settings: theme toggle (dark/light)
  - [ ] Connected services (Google OAuth status)
  - [ ] Save settings to Firestore user profile

- [ ] **P3.9** Implement PDF upload & text extraction
  - [ ] Create PDF translation page (`/translate`)
  - [ ] PDF file upload input
  - [ ] Use `pdfjs-dist` or similar library to extract text
  - [ ] Display extracted text in editor

- [ ] **P3.10** Build PDF translation engine
  - [ ] Create translation service function
  - [ ] Algorithm:
    1. Split text into words
    2. For each word: check language's dictionary
    3. If found: use dictionary translation
    4. If not found: call DeepL API as fallback
    5. Build output text with confidence score per word
  - [ ] Display: original text | translated text | confidence scores
  - [ ] Color-code confidence (green=high, yellow=medium, red=low)

- [ ] **P3.11** Integrate DeepL API
  - [ ] Add DeepL API key to environment variables
  - [ ] Create DeepL service function
  - [ ] Implement fallback translation for unknown words
  - [ ] Handle API rate limits & errors gracefully
  - [ ] Add user feedback: "Translation quality depends on dictionary completeness"

- [ ] **P3.12** Add PDF export functionality
  - [ ] Export translated text as PDF
  - [ ] Use `jsPDF` library
  - [ ] Include: Language name, original text, translation, confidence scores (optional)
  - [ ] Download button

- [ ] **P3.13** Add activity tracking for collaboration
  - [ ] Log "word_added" with contributor name
  - [ ] Log "rule_added" with contributor name
  - [ ] Log "course_created" / "course_completed" with contributor name
  - [ ] Display contributor badges on words/rules in collaborative view

- [ ] **P3.14** Create published content view
  - [ ] Allow users to publish rules/grammar info as "Learning Resource"
  - [ ] Create `/languages/{languageId}/resources` page
  - [ ] Display published rules (non-edit mode)
  - [ ] Add to public language profile (if language is public)

**P3 Success Criteria:**
✅ Users can invite collaborators to languages  
✅ Collaborators can edit language with appropriate permissions  
✅ Friend activity feed displays in activity page & right sidebar  
✅ Users can manage privacy settings for activity  
✅ PDF translation works (dictionary + DeepL fallback)  
✅ Users can export translated PDFs  
✅ Collaboration is logged in activity with contributor names  

---

## Post-MVP Enhancements (Phase 4+)

- [ ] **P4.1** Real-time collaborative editing (WebSockets)
- [ ] **P4.2** Mobile app (React Native)
- [ ] **P4.3** Advanced phonology testing tools
- [ ] **P4.4** Community language marketplace
- [ ] **P4.5** Gamification (badges, leaderboards, challenges)
- [ ] **P4.6** Voice pronunciation recording & feedback
- [ ] **P4.7** AI-powered language analysis
- [ ] **P4.8** PWA offline support

---

## Timeline Summary

| Phase | Duration | Start Date | Target End |
|-------|----------|-----------|-----------|
| Phase 0 | 1-2 weeks | Dec 26, 2025 | Jan 9, 2026 |
| Phase 1 | 2-3 weeks | Jan 10, 2026 | Jan 30, 2026 |
| Phase 2 | 2-3 weeks | Jan 31, 2026 | Feb 20, 2026 |
| Phase 3 | 3-4 weeks | Feb 21, 2026 | Mar 20, 2026 |
| **MVP Launch** | | | **Mar 20, 2026** |

---

## Metrics & Success Indicators

### By End of Phase 1
- ✅ 10+ languages created in testing
- ✅ Language specs stored and retrievable
- ✅ Dashboard loads in < 2 seconds

### By End of Phase 2
- ✅ 500+ words added across test languages
- ✅ 20+ grammar rules created
- ✅ 5+ test courses published
- ✅ Course completion tracking works

### By End of Phase 3 (MVP Ready)
- ✅ 3+ collaborative languages with multi-user edits
- ✅ Friend activity feed populates
- ✅ PDF translation achieves 80%+ accuracy on complete dictionaries
- ✅ Performance: < 3s load time on slow network

---

## Current Status

**Last Updated:** January 1, 2026  
**Current Phase:** Phase 1 (P1.5 ✅ Complete)  

### What's Completed
- ✅ React + TypeScript project initialized
- ✅ Tailwind CSS configured with dark mode
- ✅ Folder structure created
- ✅ Base layout components (Header, Sidebar, PageShell)
- ✅ Placeholder pages for all main sections
- ✅ React Router configured
- ✅ Path aliases (@/) set up
- ✅ Authentication system (login, signup, logout, protected routes)
- ✅ Supabase backend configured (PostgreSQL, auth)
- ✅ Database schema designed with 12 tables
- ✅ TypeScript types for all data models (src/types/database.ts)
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Sample data generator for testing
- ✅ P1.1: Language creation form with validation
- ✅ P1.2: Comprehensive language specs form
  - ✅ LanguageSpecsForm component with all spec fields
  - ✅ PhonemeSetInput component with dynamic phoneme management
  - ✅ DepthLevelWarningModal for simplified language depth warning
  - ✅ Phoneme audio file upload support
  - ✅ Form validation utilities (minimum phonemes, required fields, etc.)
  - ✅ Tabbed interface in NewLanguagePage (Basic Info | Language Specs)
- ✅ P1.3: Create language in Supabase
  - ✅ 8-step language creation process with detailed logging
  - ✅ Language record insertion in PostgreSQL
  - ✅ Collaborator entry creation with role "owner"
  - ✅ Error handling and duplicate detection
  - ✅ Comprehensive testing checklist (575+ lines)
  - ✅ Setup verification script
  - ✅ Database SQL query verification examples
- ✅ P1.4: Build language dashboard/detail page
  - ✅ LanguageDetailPage with data fetching
  - ✅ LanguageHeader with gradient background
  - ✅ Tabbed interface (Overview | Dictionary | Rules | Courses)
  - ✅ OverviewTab with 4 expandable spec sections
  - ✅ DictionaryTab with search and filtering
  - ✅ RulesTab with category filtering
  - ✅ CoursesTab with course cards
  - ✅ EditLanguageModal for updating language info
  - ✅ VisibilitySettingsModal for privacy settings
  - ✅ Role-based UI (owner/editor/viewer/none)
  - ✅ Error handling and loading states
  - ✅ Integrated with router (/languages/:languageId)
- ✅ P1.5: Build languages list page
  - ✅ Comprehensive `/languages` page with all features
  - ✅ Filter: All, Created by me, Collaborating on
  - ✅ Sort: Recently modified, Alphabetical
  - ✅ Role badges (Owner, Editor, Viewer)
  - ✅ Responsive grid layout
  - ✅ Language stats display (words, rules, last modified)

### What's Next
- 🔄 Phase 1: Core Language Creation (P1.5-P1.7)
  - P1.5: Build languages list page (/languages) - view all created languages
  - P1.6: Implement language editing - prevent breaking changes, log edits
  - P1.7: Update dashboard home page - show active projects and stats

---

## Notes for Team

- Always test permission checks before merging
- Update activity logs when implementing new features
- Keep Firestore rules synchronized with frontend logic
- Use TypeScript interfaces from AGENTS.md for consistency
- Backup Firestore before major migrations
- Material Symbols font is included via CDN in index.html
- All styles use Tailwind + custom CSS variables
- Dark mode is the default theme
