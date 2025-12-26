# LinguaFabric - Memory Bank & Architecture

## Project Vision
**LinguaFabric** is a collaborative language creation platform where users design custom languages by specifying linguistic parameters, build dictionaries and grammar rules, create courses to teach others, and collaborate with friends through invitations and activity tracking.

---

## Core Decisions

### 1. Tech Stack
| Component | Choice | Reason |
|-----------|--------|--------|
| **Frontend** | React 18 + TypeScript | Component-based, scalable, strong typing |
| **Styling** | Tailwind CSS + Material Symbols | Pre-built dark mode theme provided, responsive design |
| **State Management** | React Context / Zustand | Lightweight, Firebase-friendly |
| **Backend** | Firebase (Firestore + Auth) | MVP speed, real-time updates, scalable, no DevOps |
| **Authentication** | Firebase Auth (Google + Email) | Native OAuth integration, user management |
| **Translation Engine** | DeepL API | Superior quality over Google Translate, language nuance |
| **Hosting** | Vercel (frontend) + Firebase (backend) | Zero-config React deployment, global CDN |
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
├── partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "preposition" | etc.
├── pronunciation: string (IPA notation)
├── audioUrl: string (optional)
├── etymologyNote: string (optional)
├── examples: array[{phrase, translation}]
├── addedBy: string (userId)
├── addedAt: timestamp
├── updatedAt: timestamp
└── approvalStatus: "draft" | "approved" (if collaborative)
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

#### `collaborationInvites` Collection
```
collaborationInvites/{inviteId}
├── senderId: string (userId)
├── recipientId: string (userId)
├── languageId: string
├── role: "editor" | "viewer"
├── createdAt: timestamp
├── expiresAt: timestamp
├── status: "pending" | "accepted" | "declined"
└── message: string (optional)
```

#### `friendships` Collection
```
friendships/{friendshipId}
├── user1Id: string
├── user2Id: string
├── createdAt: timestamp
├── status: "pending" | "accepted"
└── blockedBy: array[string] (userIds who blocked this friendship)
```

---

## Feature Specifications

### 1. Language Creation
**User Flow:**
1. User clicks "New Language"
2. Form: Name, Description, Icon/Cover image
3. **Specs Selection:**
   - Alphabet/Script (dropdown with presets: Latin, Cyrillic, Custom)
   - Writing Direction (LTR, RTL, Boustrophedon)
   - Phoneme Set (add custom IPA symbols with audio)
   - Depth Level (Realistic ⚠️ vs Simplified ⚠️)
   - Word Order (SVO, SOV, VSO, etc.)
   - Case Sensitivity toggle
   - Custom specs (open key-value input)
4. Language created, user redirected to dashboard

**Validation:**
- Language name must be unique per user
- Phoneme set must have at least 5 symbols
- Writing direction must be selected

### 2. Dictionary Management
**User Flow:**
1. User navigates to Language → Dictionary tab
2. **Add Word:**
   - Word (in constructed language)
   - Translation (English)
   - Part of Speech dropdown
   - Pronunciation (IPA)
   - Optional: Audio file upload or TTS
   - Optional: Etymology notes
   - Optional: Example phrases
3. Words displayed in searchable table
4. Edit/Delete by author or language collaborators

**Features:**
- Full-text search across words & translations
- Filter by part of speech
- Export as CSV
- Bulk import from CSV template

### 3. Grammar Rules
**User Flow:**
1. User adds grammar rule with:
   - Rule name & description
   - Category (morphology, phonology, syntax, pragmatics)
   - Pattern (regex or prose description)
   - Examples (3+ input/output pairs with explanation)
2. Rules displayed in organized list
3. Can be published/made viewable to others

### 4. PDF Translation (Phase 3)
**User Flow:**
1. User uploads PDF
2. App extracts text
3. Uses DeepL API + language dictionary for mapping:
   - Known words → use dictionary mapping
   - Unknown words → use DeepL as fallback
4. Presents translation with confidence score
5. User can export translated PDF or save as draft

**Note:** Full accuracy depends on dictionary completeness & grammar rule comprehensiveness

### 5. Course Creation (Phase 2)
**User Flow:**
1. User creates course tied to language
2. Adds lessons (order matters)
3. Each lesson has:
   - Markdown content
   - Flashcards (front/back/images)
   - Optional quiz (multiple choice / fill-in-blank)
4. Publish to make shareable
5. Track enrollment & completion

**Learner Flow:**
1. Discover/enroll in course
2. Study lessons sequentially
3. Review flashcards with spaced repetition
4. Track progress with activity heatmap

### 6. Collaboration & Friends
**Invitation System:**
1. Language owner invites friend by email/username
2. Invite expires in 30 days or upon acceptance
3. Invitee becomes "editor" or "viewer"
4. All contributions tracked with userId

**Activity Feed:**
1. User sees all their activities (configurable privacy)
2. Friend activity visible based on permission settings
3. Activity types: language created, words added, rules added, course published, milestones hit
4. Heatmap showing activity over last 30 days (like GitHub)

**Friend Management:**
- Add friends by username/email
- View friend activity (if permissions allow)
- Block/unblock
- Activity permission levels:
  - Public: Everyone sees
  - Friends Only: Only accepted friends see
  - Private: Nobody sees activity

---

## UI/UX Guidelines

### Design System (Already Provided)
- **Color Scheme:** Dark mode (primary #137fec)
- **Font:** Inter display family
- **Components:** Material Symbols for icons
- **Responsive:** Mobile-first with Tailwind
- **Sidebar:** Left nav (Sidebar.tsx), Top header (Header.tsx)
- **Right Sidebar:** Activity & learning progress (optional on mobile)

### Key Screens
1. **Dashboard** (Provided template)
   - Welcome message with user stats
   - Active projects cards (in-progress languages)
   - Quick action buttons (Add Word, New Rule, Phonology, Export PDF)
   - Activity heatmap (30 days)
   - Friend activity feed (right sidebar)

2. **Language Editor**
   - Tabs: Overview | Dictionary | Rules | Courses
   - Specs visible in sidebar or modal

3. **Dictionary Page**
   - Search bar + filters (part of speech, added by)
   - Word table with inline edit/delete
   - Add word button opens modal form

4. **Settings**
   - Activity permissions (public/friends/private)
   - Language visibility settings
   - Account settings
   - Collaboration management (pending invites, invited users)

---

## API Integrations

### DeepL Translation Engine
**Endpoint:** `https://api-free.deepl.com/v1/translate` (or pro)
**Authentication:** API Key in `.env.local`
**Usage:** Fallback translation for unknown words in PDF translation feature
**Rate Limits:** Check DeepL documentation for free tier

**Implementation:**
```typescript
// Example usage
const translateText = async (text: string, targetLang: string) => {
  const response = await fetch("https://api-free.deepl.com/v1/translate", {
    method: "POST",
    headers: { "Authorization": `DeepL-Auth-Key ${process.env.REACT_APP_DEEPL_API_KEY}` },
    body: new URLSearchParams({
      text,
      target_lang: targetLang,
      source_lang: "EN"
    })
  });
  return response.json();
};
```

### Firebase Authentication
**Setup:** Google OAuth + Email/Password
**Scopes:** Basic profile, email

### Firebase Firestore
**Regions:** us-central1 (or regional preference)
**Security Rules:** See security-rules.txt (to be created in Phase 0)

---

## Development Priorities

1. **Phase 0 (Setup):** Project scaffold, Firebase setup, auth
2. **Phase 1 (Core):** Language creation, specs, basic UI
3. **Phase 2 (Dictionary):** Word management, rules, courses (flashcards only)
4. **Phase 3 (Social):** Collaboration, activity feed, PDF translation

---

## Known Constraints & Future Considerations

### Current (MVP)
- ⚠️ Simplified language mode has accuracy warnings
- ⚠️ PDF translation only works if dictionary is comprehensive
- ⚠️ Grammar rules are informational (not enforced during translation)
- No real-time collaborative editing (Phase 4)
- No mobile app yet (PWA in roadmap)

### Future Enhancements
- Real-time collaborative editing (WebSockets/OT)
- Mobile app (React Native)
- Advanced translation engine (ML-based)
- Phonology testing tools
- Community language marketplace
- Gamification (badges, leaderboards)

---

## Developer Notes

- Keep all Firebase queries indexed (Firestore console)
- Use React Context for user/language state
- Implement error boundaries for better UX
- Add loading skeletons for Firestore fetches
- Consider pagination for large dictionaries (500+)
- Validate all user inputs client-side + server-side (Firestore rules)

---

**Last Updated:** December 26, 2025
**Current Phase:** Planning → Phase 0 Setup
