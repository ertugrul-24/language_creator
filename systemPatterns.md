# System Patterns & Architecture

This document describes the architectural patterns, code conventions, and best practices used in LinguaFabric.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Code Patterns](#code-patterns)
- [Firebase Patterns](#firebase-patterns)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Testing Patterns](#testing-patterns)

---

## Architecture Overview

LinguaFabric follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────┐
│         React Components Layer           │ (UI/Views)
│  (Pages, Components, Hooks)              │
├─────────────────────────────────────────┤
│       Context / State Management         │ (Global State)
│  (AuthContext, LanguageContext)          │
├─────────────────────────────────────────┤
│      Services & Business Logic           │ (Business)
│  (authService, languageService, etc.)    │
├─────────────────────────────────────────┤
│   Firebase Firestore + Auth API          │ (Data)
│  (Database, Authentication)              │
└─────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns:** UI, state, and data logic are separated
2. **Single Responsibility:** Each module has one clear purpose
3. **DRY (Don't Repeat Yourself):** Reusable services and components
4. **Type Safety:** Full TypeScript coverage
5. **Testability:** Services are mockable and testable
6. **Performance:** Lazy loading, memoization, pagination

---

## Project Structure

```
src/
├── components/                 # Reusable UI components
│   ├── auth/
│   │   ├── LoginForm.tsx      # Login form component
│   │   ├── SignupForm.tsx     # Signup form component
│   │   └── ProtectedRoute.tsx # Route guard component
│   ├── layout/
│   │   ├── Sidebar.tsx        # Main navigation
│   │   ├── Header.tsx         # Top header
│   │   └── PageShell.tsx      # Common layout wrapper
│   ├── language/
│   │   ├── LanguageCard.tsx   # Language preview card
│   │   ├── LanguageForm.tsx   # Create/edit language form
│   │   └── SpecsEditor.tsx    # Language specs configuration
│   ├── dictionary/
│   │   ├── DictionaryTable.tsx # Words table
│   │   ├── WordForm.tsx       # Add/edit word form
│   │   └── WordSearch.tsx     # Search & filter bar
│   ├── grammar/
│   │   ├── RuleList.tsx       # Grammar rules list
│   │   ├── RuleForm.tsx       # Add/edit rule form
│   │   └── RuleCard.tsx       # Rule preview card
│   ├── common/
│   │   ├── Button.tsx         # Reusable button
│   │   ├── Modal.tsx          # Modal wrapper
│   │   ├── Input.tsx          # Reusable input
│   │   ├── Select.tsx         # Dropdown select
│   │   ├── TextArea.tsx       # Text area input
│   │   ├── Loading.tsx        # Loading spinner
│   │   └── ErrorBoundary.tsx  # Error boundary wrapper
│   └── icons/
│       └── MaterialIcon.tsx   # Material Symbols wrapper
│
├── pages/                      # Page-level components (routed)
│   ├── Dashboard.tsx          # Home/dashboard page
│   ├── LanguageList.tsx       # Languages list page
│   ├── LanguageDetail.tsx     # Language detail/editor page
│   ├── Dictionary.tsx         # Dictionary management page
│   ├── Grammar.tsx            # Grammar rules page
│   ├── Courses.tsx            # Courses list page
│   ├── CourseBuilder.tsx      # Course creator page
│   ├── CourseLearn.tsx        # Course learner page
│   ├── Activity.tsx           # Activity feed page
│   ├── Friends.tsx            # Friends management page
│   ├── Settings.tsx           # User settings page
│   ├── Translate.tsx          # PDF translation page
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Signup page
│   ├── NotFound.tsx           # 404 page
│   └── Error.tsx              # Error page
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts             # Authentication hook
│   ├── useLanguage.ts         # Language data hook
│   ├── useLanguages.ts        # Languages list hook
│   ├── useDictionary.ts       # Dictionary hook
│   ├── useGrammar.ts          # Grammar rules hook
│   ├── useCourses.ts          # Courses hook
│   ├── useActivity.ts         # Activity hook
│   ├── useFriends.ts          # Friends hook
│   ├── useForm.ts             # Form state hook
│   ├── useLocalStorage.ts     # Local storage hook
│   ├── useAsync.ts            # Async data hook
│   └── useDebounce.ts         # Debounce hook
│
├── services/                   # Business logic & API calls
│   ├── authService.ts         # Firebase auth operations
│   ├── languageService.ts     # Language CRUD
│   ├── dictionaryService.ts   # Dictionary word CRUD
│   ├── grammarService.ts      # Grammar rules CRUD
│   ├── courseService.ts       # Courses CRUD
│   ├── activityService.ts     # Activity logging
│   ├── friendService.ts       # Friend management
│   ├── translationService.ts  # Translation engine (DeepL + dict)
│   ├── pdfService.ts          # PDF extraction & export
│   └── firebaseService.ts     # Firebase utilities
│
├── context/                    # React context providers
│   ├── AuthContext.tsx        # Auth state provider
│   ├── LanguageContext.tsx    # Language state provider
│   ├── useAuthContext.ts      # Auth context hook
│   └── useLanguageContext.ts  # Language context hook
│
├── types/                      # TypeScript type definitions
│   ├── index.ts               # Barrel export for all types
│   ├── firebase.ts            # Firebase collection types
│   ├── forms.ts               # Form state types
│   ├── errors.ts              # Error types
│   └── api.ts                 # API response types
│
├── utils/                      # Utility functions
│   ├── formatters.ts          # Format dates, text, etc.
│   ├── validators.ts          # Form validation functions
│   ├── constants.ts           # App-wide constants
│   ├── mappers.ts             # Data transformation
│   └── errors.ts              # Error utilities
│
├── config/                     # Configuration
│   ├── firebase.ts            # Firebase initialization
│   └── deepl.ts               # DeepL API config
│
├── styles/                     # Global styles
│   └── globals.css            # Tailwind + custom CSS
│
├── App.tsx                     # Main app component with routing
├── main.tsx                    # React entry point
└── vite-env.d.ts             # Vite environment types
```

---

## Code Patterns

### 1. Functional Components with Hooks

**Always use functional components** with React Hooks. Class components are not used in this project.

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MyComponentProps {
  title: string;
  onSave?: () => Promise<void>;
}

/**
 * MyComponent - Brief description of what component does
 * @param {MyComponentProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onSave 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSave) {
        await onSave();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button 
        onClick={handleSave}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default MyComponent;
```

### 2. Custom Hooks

Create hooks for reusable logic:

```typescript
import { useState, useEffect } from 'react';
import { fetchLanguageData } from '@/services/languageService';
import { Language } from '@/types';

/**
 * useLanguage - Fetch and manage single language data
 * @param {string} languageId - Language ID to fetch
 * @returns {Object} Language data, loading, error
 */
export const useLanguage = (languageId: string) => {
  const [language, setLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      try {
        setLoading(true);
        const data = await fetchLanguageData(languageId);
        if (isMounted) {
          setLanguage(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
          setLanguage(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLanguage();

    return () => {
      isMounted = false; // Prevent state updates on unmount
    };
  }, [languageId]);

  return { language, loading, error };
};
```

### 3. Props Destructuring with Types

```typescript
// ✅ Good - Typed props interface
interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  onClick,
  isSelected = false,
}) => {
  // ...
};

// ❌ Avoid - Untyped or generic props
export const Card = (props) => {
  // ...
};
```

### 4. Component File Organization

Each component should follow this structure:

```typescript
// 1. Imports
import React from 'react';
import { useYourHook } from '@/hooks';

// 2. Types
interface MyComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. Constants (if needed)
const TIMEOUT_MS = 5000;

// 4. Component
export const MyComponent: React.FC<MyComponentProps> = ({
  prop1,
  prop2,
}) => {
  // Component logic
  return <div>{prop1}</div>;
};

// 5. Export default
export default MyComponent;
```

---

## Firebase Patterns

### 1. Service Functions Pattern

**All Firebase operations** should be in service files, not components:

```typescript
// ✅ Good - Fire base operation in service
// services/languageService.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Language, LanguageCreateInput } from '@/types';

export const createLanguage = async (
  userId: string,
  data: LanguageCreateInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'languages'), {
      ...data,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating language:', error);
    throw new Error('Failed to create language');
  }
};

// ❌ Avoid - Firebase operations in component
export const MyComponent = () => {
  const handleCreate = async () => {
    const docRef = await addDoc(collection(db, 'languages'), {
      // Firebase code directly in component
    });
  };
};
```

### 2. Real-time Listener Pattern

```typescript
// services/languageService.ts
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const subscribeToUserLanguages = (
  userId: string,
  callback: (languages: Language[]) => void
) => {
  const q = query(
    collection(db, 'languages'),
    where('ownerId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const languages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Language[];
      callback(languages);
    },
    (error) => {
      console.error('Error fetching languages:', error);
    }
  );

  return unsubscribe; // Return unsubscribe function
};

// hooks/useLanguages.ts
import { useEffect, useState } from 'react';
import { subscribeToUserLanguages } from '@/services/languageService';

export const useLanguages = (userId: string | null) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserLanguages(userId, (data) => {
      setLanguages(data);
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription
  }, [userId]);

  return { languages, loading };
};
```

### 3. Error Handling Pattern

```typescript
// services/languageService.ts
export const updateLanguage = async (
  languageId: string,
  updates: Partial<Language>
): Promise<void> => {
  try {
    const docRef = doc(db, 'languages', languageId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to edit this language');
      }
      throw new Error(`Firebase error: ${error.code}`);
    }
    throw new Error('Failed to update language');
  }
};

// In component
const handleUpdate = async () => {
  try {
    await updateLanguage(languageId, newData);
    toast.success('Language updated');
  } catch (error) {
    toast.error((error as Error).message);
  }
};
```

---

## State Management

### 1. React Context for Global State

Use Context for **cross-cutting concerns**:

```typescript
// context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError((err as Error).message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
```

```typescript
// hooks/useAuthContext.ts
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// In component
const Dashboard = () => {
  const { user, loading } = useAuthContext();

  if (loading) return <Loading />;
  if (!user) return <Redirect to="/login" />;

  return <div>Welcome, {user.displayName}</div>;
};
```

### 2. Local Component State

Use `useState` for **local component state**:

```typescript
const LanguageForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<LanguageSpecs>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLanguage(user.uid, { name, description, specs });
      // Success
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form JSX */}</form>;
};
```

---

## Error Handling

### 1. Error Boundary Component

```typescript
// components/common/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
            <h2 className="font-bold">Something went wrong</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 2. Try-Catch Pattern

```typescript
const handleAsyncOperation = async () => {
  try {
    const result = await someAsyncFunction();
    // Handle success
  } catch (error) {
    if (error instanceof ValidationError) {
      showValidationError(error.message);
    } else if (error instanceof FirebaseError) {
      showFirebaseError(error.code);
    } else {
      showGenericError('An unexpected error occurred');
    }
  }
};
```

---

## Performance Optimization

### 1. Memoization

```typescript
import React, { useMemo, useCallback } from 'react';

const LanguageList = ({ languages }: { languages: Language[] }) => {
  // Memoize expensive calculations
  const stats = useMemo(() => {
    return {
      total: languages.length,
      avgWords: languages.reduce((sum, lang) => sum + lang.stats.totalWords, 0) / languages.length,
    };
  }, [languages]);

  // Memoize callback to prevent unnecessary re-renders
  const handleLanguageSelect = useCallback((languageId: string) => {
    console.log('Selected:', languageId);
  }, []);

  return (
    <div>
      <h2>Total Languages: {stats.total}</h2>
      {languages.map(lang => (
        <LanguageCard
          key={lang.id}
          language={lang}
          onSelect={handleLanguageSelect}
        />
      ))}
    </div>
  );
};

// Memoize components that receive props
interface LanguageCardProps {
  language: Language;
  onSelect: (id: string) => void;
}

const LanguageCard = React.memo(({ language, onSelect }: LanguageCardProps) => {
  return (
    <div onClick={() => onSelect(language.id)} className="cursor-pointer">
      {language.name}
    </div>
  );
});
```

### 2. Code Splitting

```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/common/Loading';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const LanguageDetail = lazy(() => import('@/pages/LanguageDetail'));
const Translate = lazy(() => import('@/pages/Translate'));

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
      <Route path="/languages/:id" element={<Suspense fallback={<Loading />}><LanguageDetail /></Suspense>} />
      <Route path="/translate" element={<Suspense fallback={<Loading />}><Translate /></Suspense>} />
    </Routes>
  );
};
```

### 3. Pagination Pattern

```typescript
const DictionaryPage = ({ languageId }: { languageId: string }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadWords();
  }, [page]);

  const loadWords = async () => {
    const newWords = await getWords(languageId, page, PAGE_SIZE);
    setWords(prev => page === 0 ? newWords : [...prev, ...newWords]);
    setHasMore(newWords.length === PAGE_SIZE);
  };

  return (
    <div>
      {words.map(word => <WordRow key={word.id} word={word} />)}
      {hasMore && (
        <button onClick={() => setPage(p => p + 1)}>
          Load More
        </button>
      )}
    </div>
  );
};
```

---

## Testing Patterns

### 1. Unit Test Structure

```typescript
// hooks/__tests__/useLanguage.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useLanguage } from '@/hooks/useLanguage';

describe('useLanguage', () => {
  it('should fetch language data', async () => {
    const { result } = renderHook(() => useLanguage('lang-123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.language).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useLanguage('invalid'));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### 2. Component Test Structure

```typescript
// components/language/__tests__/LanguageCard.test.tsx
import { render, screen } from '@testing-library/react';
import { LanguageCard } from '@/components/language/LanguageCard';

describe('LanguageCard', () => {
  const mockLanguage = {
    id: '1',
    name: 'Elvish',
    stats: { totalWords: 100 },
  };

  it('should render language name', () => {
    render(<LanguageCard language={mockLanguage} />);
    expect(screen.getByText('Elvish')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    const { getByRole } = render(
      <LanguageCard language={mockLanguage} onSelect={onSelect} />
    );
    getByRole('button').click();
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

---

## Naming Conventions Summary

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `LanguageEditor.tsx` |
| Functions | camelCase | `fetchLanguageData()` |
| Constants | UPPER_SNAKE_CASE | `MAX_WORDS_PER_PAGE` |
| Types/Interfaces | PascalCase | `interface Language {}` |
| Hooks | camelCase with `use` prefix | `useLanguage()` |
| Booleans | `is`, `has`, `can` prefixes | `isLoading`, `hasError` |
| Files | kebab-case or camelCase | `language-form.tsx` or `languageForm.ts` |

---

## Commit Message Convention

```
<type>: <subject>
<blank line>
<body>

Types:
  feat:     New feature
  fix:      Bug fix
  refactor: Code refactoring (no feature/fix)
  style:    Formatting, missing semicolons, etc.
  test:     Adding or updating tests
  docs:     Documentation changes
  chore:    Dependency updates, CI/CD changes

Example:
  feat: Add PDF translation feature
  
  - Implement DeepL API integration
  - Add dictionary lookup fallback
  - Display translation confidence scores
```

---

**Last Updated:** December 26, 2025
