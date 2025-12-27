# LinguaFabric - Project Progress & Phases

## 📋 Documentation Status

**All documentation files recovered and in place (Dec 27, 2025):**
- ✅ AGENTS.md - Architecture & tech decisions
- ✅ systemPatterns.md - Code patterns & conventions
- ✅ projectbrief.md - Business strategy & roadmap
- ✅ productContext.md - User research & UX design
- ✅ README.md - GitHub documentation
- ✅ progress.md - This file (phase tracking)

**Important:** These files will NOT be modified during future phase implementations per user request.

## Overview
This document tracks project phases, milestones, and task completion. Each phase has clear success criteria and subtasks.

---

## Phase 0: Foundation & Setup ⚙️

**Goal:** Set up project infrastructure, authentication, and database schema  
**Duration:** 1-2 weeks  
**Status:** 🟨 In Progress

### Phase 0 Subtasks

- [x] **P0.1** Initialize React project with Vite
  - [x] Create React + TypeScript project
  - [x] Install dependencies: Tailwind, Material Symbols, React Router
  - [x] Set up folder structure: `/components`, `/pages`, `/hooks`, `/services`, `/types`
  - [x] Configure Tailwind dark mode + custom colors
  - [x] Create base layout (Sidebar + Header template from design)

- [ ] **P0.2** Set up Firebase project
  - [ ] Create Firebase project (console.firebase.google.com)
  - [ ] Enable Firestore Database (production mode)
  - [ ] Enable Firebase Authentication (Google OAuth + Email/Password)
  - [ ] Download Firebase config and add to `.env.local`
  - [ ] Create Firestore security rules file

- [ ] **P0.3** Implement authentication system
  - [ ] Create Firebase auth service (`/services/authService.ts`)
  - [ ] Build login page (email + Google OAuth)
  - [ ] Build signup page (with email verification)
  - [ ] Create auth context/state management
  - [ ] Implement route protection (PrivateRoute component)
  - [ ] Add logout functionality

- [ ] **P0.4** Design & implement Firestore schema
  - [ ] Create Firestore collections (users, languages, collaborationInvites, friendships)
  - [ ] Set up subcollections (dictionaries, grammarRules, courses, activity)
  - [ ] Write Firestore security rules
  - [ ] Create TypeScript types/interfaces for all collections
  - [ ] Test database structure with sample data

- [ ] **P0.5** Set up development environment
  - [ ] Create `.env.local` template with Firebase config
  - [ ] Set up ESLint + Prettier
  - [ ] Configure Git repository
  - [ ] Create `.gitignore`
  - [ ] Add GitHub Actions workflow for basic linting

- [ ] **P0.6** Deploy base infrastructure
  - [ ] Deploy Firebase project
  - [ ] Set up Vercel deployment for frontend (optional for P0)
  - [ ] Test auth flow end-to-end

**P0 Success Criteria:**
✅ Users can sign up/login with Google or email  
✅ Firebase Firestore is initialized and secured  
✅ User data persists in Firestore  
✅ Dashboard shell loads after login  

---

## Phase 1: Core Language Creation 🗣️

**Goal:** Users can create languages with full specs, view/edit language details  
**Duration:** 2-3 weeks  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 0 complete

### Phase 1 Subtasks

- [ ] **P1.1** Build language creation form
  - [ ] Create "New Language" modal/page
  - [ ] Form fields: Name, Description, Icon, Cover Image upload
  - [ ] Field validation (name unique per user, required fields)
  - [ ] Test form submission flow

- [ ] **P1.2** Implement language specs configuration
  - [ ] Build specs form section with fields:
    - [ ] Alphabet/Script (dropdown: Latin, Cyrillic, Custom)
    - [ ] Writing Direction (dropdown: LTR, RTL, Boustrophedon)
    - [ ] Phoneme Set (dynamic input for IPA symbols)
    - [ ] Depth Level (toggle: Realistic ↔ Simplified + warning modal)
    - [ ] Word Order (dropdown: SVO, SOV, VSO, etc.)
    - [ ] Case Sensitivity (toggle)
    - [ ] Custom Specs (key-value dynamic inputs)
  - [ ] Phoneme IPA input with audio file upload support
  - [ ] Form validation (minimum phoneme count, etc.)

- [ ] **P1.3** Create language in Firestore
  - [ ] Write `createLanguage()` Firebase function
  - [ ] Store language specs in Firestore
  - [ ] Generate unique languageId
  - [ ] Set owner and collaborators array
  - [ ] Initialize stats object
  - [ ] Handle errors gracefully

- [ ] **P1.4** Build language dashboard/detail page
  - [ ] Create `/languages/{languageId}` page
  - [ ] Display language header: name, icon, owner, creation date
  - [ ] Show language stats: total words, total rules, contributors count
  - [ ] Create tabs: Overview | Dictionary | Rules | Courses
  - [ ] Overview tab shows specs in expandable sections
  - [ ] Edit language button (owner/editor only)
  - [ ] Language visibility settings (private/friends/public)

- [ ] **P1.5** Build languages list page
  - [ ] Create `/languages` page
  - [ ] List user's created languages with cards (name, icon, stats, last modified)
  - [ ] List languages collaborator on (with role badge)
  - [ ] Add filter: Created by me vs Collaborating on
  - [ ] Add sort: Recently modified, Alphabetical
  - [ ] "New Language" button prominent at top
  - [ ] Responsive grid layout

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

**P1 Success Criteria:**
✅ Users can create a language with all specs  
✅ Language details page displays correctly  
✅ Users can see list of their languages  
✅ Specs are stored and retrievable from Firestore  
✅ Edit language works for owner/editors  

---

## Phase 2: Dictionary & Grammar Rules 📚

**Goal:** Users can add words, define rules, create flashcard courses  
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

- [ ] **P2.3** Implement word CRUD in Firestore
  - [ ] Write `addWord()` Firebase function
  - [ ] Write `updateWord()` Firebase function
  - [ ] Write `deleteWord()` Firebase function
  - [ ] Write `getWords()` query (paginated, searchable)
  - [ ] Update language stats (totalWords) on add/delete
  - [ ] Only owner/editor can delete words

- [ ] **P2.4** Build inline word editing
  - [ ] Edit button on each word row → opens modal
  - [ ] Form pre-fills with existing data
  - [ ] Save changes to Firestore
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

- [ ] **P2.7** Implement rule CRUD in Firestore
  - [ ] Write Firebase functions for add/update/delete/get
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

- [ ] **P2.10** Implement course CRUD in Firestore
  - [ ] Write Firebase functions for create/update/delete
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

**Last Updated:** December 27, 2025  
**Current Phase:** Phase 0.1 ✅ Complete  
**Next Milestone:** Phase 0.2 - Firebase Setup & Authentication  

### What's Completed
- ✅ React + TypeScript project initialized
- ✅ Tailwind CSS configured with dark mode
- ✅ Folder structure created
- ✅ Base layout components (Header, Sidebar, PageShell)
- ✅ Placeholder pages for all main sections
- ✅ React Router configured
- ✅ Path aliases (@/) set up

### What's Next
- 🔄 Phase 0.2: Firebase project setup
- 🔄 Phase 0.3: Authentication system
- 🔄 Phase 0.4: Firestore schema & types

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
