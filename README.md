<<<<<<< HEAD
# LinguaFabric 🗣️

> A collaborative language creation platform where users design custom languages, build dictionaries and grammar rules, create courses to teach others, and collaborate with friends.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Phase](https://img.shields.io/badge/phase-0%20Setup-yellow)]()
[![Status](https://img.shields.io/badge/status-In%20Development-orange)]()

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Phases](#development-phases)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

LinguaFabric is a full-stack web application that empowers creators to design constructed languages (conlangs) with professional linguistic depth or simplified modes. Users can:

- **Create languages** with custom specifications (alphabet, grammar, phonetics, writing direction)
- **Build dictionaries** with words, translations, pronunciation, and etymologies
- **Define grammar rules** with linguistic patterns and examples
- **Create courses** with lessons, flashcards, and quizzes to teach their languages
- **Collaborate** with friends through invitations and permission management
- **Track activity** with a 30-day heatmap and social feed
- **Translate PDFs** using a hybrid dictionary + DeepL engine

### Target Users

- **Conlang Creators:** Writers, game designers, worldbuilders
- **Language Educators:** Teachers creating educational content
- **Language Enthusiasts:** Students learning constructed languages
- **Collaborative Creators:** Teams building languages together

---

## Features

### Phase 1: Core Language Creation (Current)
- ✅ User authentication (Google OAuth + Email)
- ✅ Language creation with full specifications
- ✅ Language dashboard with stats
- ✅ Language visibility & permissions
- 🔄 **In Progress:** Collaborative language management

### Phase 2: Dictionary & Grammar (Planned)
- 📅 Add/edit/delete words with IPA pronunciation
- 📅 Search and filter dictionary
- 📅 Grammar rule creation with examples
- 📅 Flashcard course builder
- 📅 Course learner interface

### Phase 3: Social & Translation (Planned)
- 📅 Collaboration invitations & permissions
- 📅 Friend activity feed
- 📅 Privacy & permission settings
- 📅 PDF translation (dictionary + DeepL)
- 📅 PDF export functionality

### Phase 4+: Advanced Features (Future)
- 🚀 Real-time collaborative editing
- 🚀 Phonology testing tools
- 🚀 Mobile app (React Native)
- 🚀 Community language marketplace
- 🚀 Gamification & achievements

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI & component logic |
| **Styling** | Tailwind CSS + Material Symbols | Responsive dark-mode design |
| **State** | React Context + Zustand | Global state management |
| **Backend** | Firebase Firestore | NoSQL database |
| **Auth** | Firebase Authentication | Google OAuth + Email |
| **Translation** | DeepL API | PDF translation fallback |
| **Hosting** | Vercel + Firebase | Frontend + backend deployment |

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account (https://firebase.google.com)
- DeepL API key (https://www.deepl.com/docs-api)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lingua-fabric.git
   cd lingua-fabric
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase config and DeepL API key:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_DEEPL_API_KEY=your_deepl_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication** → Google & Email/Password
5. Copy your config to `.env.local`
6. Apply Firestore security rules (see `firestore-rules.txt`)

### Deploy to Vercel

```bash
npm run build
vercel deploy
```

---

## Project Structure

```
lingua-fabric/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Login, signup, auth forms
│   │   ├── layout/         # Sidebar, header, shells
│   │   ├── language/       # Language creation, editor
│   │   ├── dictionary/     # Word management
│   │   ├── grammar/        # Grammar rules
│   │   └── common/         # Buttons, modals, inputs
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── LanguageDetail.tsx
│   │   ├── Dictionary.tsx
│   │   ├── Grammar.tsx
│   │   ├── Courses.tsx
│   │   ├── Settings.tsx
│   │   └── Activity.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLanguage.ts
│   │   └── useFriends.ts
│   ├── services/           # External services
│   │   ├── authService.ts
│   │   ├── languageService.ts
│   │   ├── dictionaryService.ts
│   │   ├── grammarService.ts
│   │   └── translationService.ts
│   ├── context/            # React context providers
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── README.md               # This file
├── AGENTS.md               # Architecture & memory bank
├── progress.md             # Phase tracking & roadmap
├── systemPatterns.md       # Code patterns & conventions
├── projectbrief.md         # Executive summary
├── productContext.md       # Product strategy
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Development Phases

See [progress.md](progress.md) for detailed phase breakdown with tasks and timelines.

### Quick Timeline
- **Phase 0** (Dec 26 - Jan 9): Setup & Firebase ⚙️
- **Phase 1** (Jan 10 - Jan 30): Core language creation 🗣️
- **Phase 2** (Jan 31 - Feb 20): Dictionary & grammar 📚
- **Phase 3** (Feb 21 - Mar 20): Collaboration & translation 🤝
- **MVP Launch:** March 20, 2025

---

## Development Guidelines

### Code Style

- Use TypeScript for all `.ts` and `.tsx` files
- Follow functional component patterns with hooks
- Use Material Symbols for all icons
- Follow Tailwind class ordering (layout → box-model → text → effects)

### Naming Conventions

```typescript
// Components: PascalCase
const LanguageEditor = () => {}

// Functions: camelCase
const fetchLanguageData = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_WORDS_PER_PAGE = 50

// Types/Interfaces: PascalCase
interface Language {}
type LanguageSpecs = {}

// Files: kebab-case (components), camelCase (services)
// src/components/LanguageEditor/LanguageEditor.tsx
// src/services/languageService.ts
```

### Component Structure

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

/**
 * MyComponent - Brief description
 * @param {MyComponentProps} props
 */
export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col gap-4">
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Firebase Patterns

All Firebase operations should use service functions:

```typescript
// In languageService.ts
export const createLanguage = async (userId: string, languageData: LanguageCreateInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'languages'), {
      ...languageData,
      ownerId: userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating language:', error);
    throw error;
  }
};

// In component
const handleCreateLanguage = async (data: LanguageCreateInput) => {
  try {
    const languageId = await createLanguage(user.uid, data);
    navigate(`/languages/${languageId}`);
  } catch (error) {
    setError('Failed to create language');
  }
};
```

---

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
npm run test
```

### End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

### Manual Testing Checklist

See [TESTING.md](TESTING.md) (to be created in Phase 1)

---

## Contributing

We're not currently accepting external contributions, but feedback is welcome!

**To report issues:**
1. Check [existing issues](../../issues)
2. Open a new issue with clear description & steps to reproduce

**Development Setup:**
1. Fork the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes following [systemPatterns.md](systemPatterns.md)
4. Commit: `git commit -m "feat: add new feature"`
5. Push & open PR

---

## Performance Optimization

### Current Metrics
- Initial load: < 3s (target)
- Time to interactive: < 5s
- Lighthouse Score: 85+

### Optimization Strategies
- Code splitting by route
- Image optimization (WebP, lazy loading)
- Firestore query indexing
- Pagination for large datasets (500+)
- React.memo for expensive components

---

## Security

- All Firebase communication is encrypted (HTTPS)
- Firestore security rules enforce user permissions
- Environment variables never committed to git
- Input validation on all forms
- XSS protection via React's default escaping

See [SECURITY.md](SECURITY.md) for detailed security policy.

---

## Roadmap

- **Phase 1 (Current):** Core language creation
- **Phase 2:** Dictionary & grammar rules
- **Phase 3:** Collaboration & translation
- **Phase 4:** Real-time editing, mobile app
- **Future:** AI-powered language analysis, community marketplace

---

## Troubleshooting

### Firebase Connection Issues
```
Error: Permission denied reading document
→ Check Firestore security rules in Firebase Console
→ Ensure user is authenticated
```

### Tailwind Styles Not Applied
```
→ Run: npm run build
→ Clear browser cache (Ctrl+Shift+Delete)
→ Restart dev server
```

### DeepL API Errors
```
→ Check API key in .env.local
→ Verify DeepL account has API access
→ Check rate limits (50/month for free tier)
```

---

## Resources

- [React Documentation](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Constructed Language Community](https://conlang.org)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors

- **Ertuğrul** - Creator & Developer

## Acknowledgments

- Firebase for backend infrastructure
- Tailwind CSS for design system
- DeepL for translation API
- React community for resources

---

## Support

For questions or issues:
- 📧 Email: your-email@example.com
- 💬 GitHub Discussions: [Start a discussion](../../discussions)
- 🐛 Bug Reports: [Open an issue](../../issues)

---

**Last Updated:** December 26, 2025  
**Current Phase:** Phase 0 - Setup  
**Next Milestone:** Complete Firebase initialization
=======
# language_creator
This is a language creator app.
>>>>>>> 28c0f762b7ef0012812f9977366ebc5f2e5da2e5
