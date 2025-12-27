# LinguaFabric - Memory Bank & Architecture

## Project Vision
**LinguaFabric** is a collaborative language creation platform where users design custom languages by specifying linguistic parameters, build dictionaries and grammar rules, create courses to teach others, and collaborate with friends through invitations and activity tracking.

---

## Core Decisions

### 1. Tech Stack
| Component | Choice | Reason |
|-----------|--------|--------|
| **Frontend** | React 18 + TypeScript | Component-based, scalable, strong typing |
| **Styling** | Tailwind CSS + Material Symbols | Pre-built dark mode theme, responsive design |
| **State Management** | React Context / Zustand | Lightweight, Firebase-friendly |
| **Backend** | Firebase (Firestore + Auth) | MVP speed, real-time updates, scalable, no DevOps |
| **Authentication** | Firebase Auth (Google + Email) | Native OAuth integration, user management |
| **Translation Engine** | DeepL API | Superior quality, language nuance |
| **Hosting** | Vercel (frontend) + Firebase (backend) | Zero-config deployment |
| **Future: PWA** | Service Workers + Web App Manifest | Offline support, installable app |

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
