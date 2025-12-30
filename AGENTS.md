# LinguaFabric - Architecture & Learning Guide

## Project Vision

**LinguaFabric** serves two purposes:

1. **Functional Application:** A collaborative platform where users design custom languages, build dictionaries and grammar rules, create courses, and collaborate with friends.

2. **Educational Project:** Demonstrates professional full-stack web development with modern tools. Learn by building a real-world application that scales from free tier ($0/month) to enterprise production.

This project teaches architecture decisions through dual-backend support (Supabase for learning, Firebase for production), showing how the same codebase adapts to different infrastructure.

---

## Core Architectural Decisions

### Philosophy
- **Open-Source First:** MIT license, community-driven development
- **Educational Focus:** Clear patterns for learning, well-documented
- **Flexible Deployment:** Works on free tier ($0) or production ($25-75+/month)
- **Type-Safe:** Full TypeScript strict mode for reliability
- **Scalable:** From hobby project to enterprise application

### Design Principle: Backend Abstraction

The codebase abstracts backend differences, enabling:
```
Same React Code → Supabase Backend (Free) → $0/month
Same React Code → Firebase Backend (Paid) → $25-75/month
```

Choose backend based on needs, not code changes.

---

## Technology Stack: Why These Choices?

## Technology Stack: Why These Choices?

### Frontend Architecture

| Component | Choice | Why | Learning Value |
|-----------|--------|-----|-----------------|
| **Language** | TypeScript (strict mode) | Type safety prevents bugs | Learn static typing benefits |
| **Framework** | React 18 | Component-based, hooks, large ecosystem | Industry standard |
| **Styling** | Tailwind CSS | Utility-first, responsive, dark mode built-in | CSS efficiency, design systems |
| **Routing** | React Router 6 | Client-side SPA routing | Modern web app patterns |
| **Build Tool** | Vite 5 | Fast HMR, optimized production builds | Next-gen tooling |
| **Deployment** | Vercel | Automatic CI/CD, free tier, git integration | Modern DevOps workflows |

**Educational Outcome:** Learn modern frontend development with professional tools used by top companies.

### Backend Options (Choose Based on Need)

#### Option A: Supabase (Free/Learning Path)
- **Cost:** $0/month (free tier includes 500MB storage)
- **Database:** PostgreSQL (SQL, ACID transactions)
- **Real-time:** LISTEN/NOTIFY subscriptions
- **Auth:** Email, Google, GitHub OAuth
- **Self-hosting:** Docker Compose included
- **Educational Value:** 
  - Learn SQL databases (vs NoSQL)
  - Understand relational design
  - Real-time data patterns
  - Open-source infrastructure

#### Option B: Firebase (Production Path)
- **Cost:** $25-75+/month at typical scale
- **Database:** Firestore (NoSQL, schemaless)
- **Real-time:** WebSocket subscriptions
- **Auth:** Google, Email, Phone, etc.
- **Infrastructure:** Google Cloud (automatic scaling)
- **Educational Value:**
  - Learn NoSQL databases (vs SQL)
  - Document-oriented design
  - Scaling considerations
  - Enterprise architecture patterns

**Key Learning:** Same application code, different backend. Demonstrates abstraction layers and architecture flexibility.

---

## Database Schema (Firebase/Firestore)

### Collections Structure

#### `users` Collection
```
users/{userId}
├── email: string
├── displayName: string
├── profileImage: string
├── createdAt: timestamp
├── subscription: "free" | "pro"
├── activityPermissions: "public" | "friends_only" | "private"
└── preferences: object
    ├── defaultLanguageDepth: "realistic" | "simplified"
    └── theme: "dark" | "light"
```

#### `languages` Collection
```
languages/{languageId}
├── ownerId: string (userId)
├── name: string
├── description: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── visibility: "private" | "friends" | "public"
├── collaborators: array[{userId, role: "owner" | "editor" | "viewer"}]
├── stats: object
│   ├── totalWords: number
│   ├── totalRules: number
│   ├── totalContributors: number
│   └── lastModified: timestamp
├── specs: object
│   ├── alphabetScript: string (e.g., "Latin", "Cyrillic", "Custom")
│   ├── writingDirection: "ltr" | "rtl" | "boustrophedon"
│   ├── phonemeSet: array[{symbol, ipa, audio_url?}]
│   ├── depthLevel: "realistic" | "simplified" (WARNING attached to simplified)
│   ├── wordOrder: string (e.g., "SVO", "SOV", "VSO")
│   ├── caseSensitive: boolean
│   ├── vowelCount: number
│   ├── consonantCount: number
│   └── customSpecs: object (user-defined key-value pairs)
└── metadata: object
    ├── icon: string
    ├── coverImage: string
    └── tags: array[string]
```

#### `dictionaries` Subcollection (under languages)
```
languages/{languageId}/dictionaries/{wordId}
├── word: string (in constructed language)
├── translation: string (in English or base language)
├── partOfSpeech: "noun" | "verb" | "adjective" | etc.
├── pronunciation: string (IPA notation)
├── audioUrl: string (optional)
├── etymologyNote: string (optional)
├── examples: array[{phrase, translation}]
├── addedBy: string (userId)
├── addedAt: timestamp
├── updatedAt: timestamp
└── approvalStatus: "draft" | "approved"
```

#### `grammarRules` Subcollection (under languages)
```
languages/{languageId}/grammarRules/{ruleId}
├── name: string (e.g., "Plural Formation")
├── description: string
├── category: "morphology" | "phonology" | "syntax" | "pragmatics"
├── ruleType: "phoneme_rule" | "inflection" | "word_order" | "agreement"
├── pattern: string (regex or pattern description)
├── examples: array[{input, output, explanation}]
├── addedBy: string (userId)
├── addedAt: timestamp
├── updatedAt: timestamp
└── approvalStatus: "draft" | "approved"
```

#### `courses` Subcollection (under languages)
```
languages/{languageId}/courses/{courseId}
├── title: string
├── description: string
├── createdAt: timestamp
├── creatorId: string (userId)
├── visibility: "private" | "public"
├── lessons: array[{
│   ├── lessonId: string
│   ├── title: string
│   ├── order: number
│   ├── type: "vocab" | "grammar" | "pronunciation" | "mixed"
│   ├── content: string (markdown)
│   ├── flashcards: array[{frontText, backText, imageUrl?}]
│   └── quiz: object (questions array)
│ }]
├── enrolledUsers: array[{userId, progress, completedAt?}]
└── stats: object
    ├── totalEnrolled: number
    └── averageCompletion: number
```

#### `activity` Subcollection (under users)
```
users/{userId}/activity/{activityId}
├── type: "language_created" | "word_added" | "rule_added" | "course_created" | "course_completed" | "collaboration_started"
├── timestamp: timestamp
├── languageId: string (reference)
├── description: string
├── metadata: object (varies by type)
│   ├── wordCount?: number
│   ├── ruleCount?: number
│   └── collaboratorNames?: array[string]
└── visibility: "public" | "friends_only" | "private"
```

---

## Current Implementation Status

### Phase 0.1 Complete ✅
- React + TypeScript initialized with Vite 5
- Tailwind CSS configured (dark mode enabled)
- Folder structure created
- Base layout components (Header, Sidebar, PageShell)
- React Router configured with path aliases
- Placeholder pages for all main sections

### Phase 0.2 - Next
- Firebase project setup
- Firestore configuration
- Authentication implementation
- Firebase security rules

---

## Developer Notes

- Keep all Firebase queries indexed
- Use React Context for user/language state
- Implement error boundaries for better UX
- Add loading skeletons for Firestore fetches
- Consider pagination for large datasets (500+)
- Validate all user inputs client + server-side

---

**Last Updated:** December 27, 2025  
**Current Phase:** Phase 0.1 ✅ Complete
