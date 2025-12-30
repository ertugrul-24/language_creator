/**
 * LinguaFabric Database Types
 * 
 * Comprehensive TypeScript interfaces for all Supabase tables and relationships.
 * These types ensure type safety across the application and serve as documentation
 * for the data model architecture.
 * 
 * Learning Goals:
 * - Understand relational data modeling
 * - Learn how to structure TypeScript for backend data
 * - Practice creating reusable, well-documented types
 */

// ============================================================================
// USERS TABLE
// ============================================================================

export interface User {
  id: string; // UUID - Primary key
  auth_id: string; // FK to auth.users
  email: string; // Unique email
  display_name?: string; // User's display name
  profile_image_url?: string; // Avatar/profile picture URL
  activity_permissions: 'public' | 'friends_only' | 'private'; // Privacy level
  theme: 'dark' | 'light'; // UI theme preference
  default_language_depth: 'realistic' | 'simplified'; // Default language complexity
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface UserProfile extends Omit<User, 'auth_id'> {
  // Extended user data for UI display
  languageCount?: number; // Number of languages owned
  collaboratingCount?: number; // Number of languages collaborating on
  friendCount?: number; // Number of friends
}

// ============================================================================
// LANGUAGES TABLE
// ============================================================================

export interface Language {
  id: string; // UUID - Primary key
  owner_id: string; // FK to users.id
  name: string; // Language name (required)
  description: string; // Long-form description
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  visibility: 'private' | 'friends' | 'public'; // Visibility level
  specs: LanguageSpecs; // JSONB - Language specifications
  stats: LanguageStats; // JSONB - Aggregated statistics
  metadata: LanguageMetadata; // JSONB - UI metadata
}

export interface LanguageSpecs {
  alphabetScript: string; // e.g., "Latin", "Cyrillic", "Custom"
  writingDirection: 'ltr' | 'rtl' | 'boustrophedon'; // Writing direction
  phonemeSet: Phoneme[]; // Array of phonemes
  depthLevel: 'realistic' | 'simplified'; // Realism level
  wordOrder: string; // e.g., "SVO", "SOV", "VSO"
  caseSensitive: boolean; // Case matters in language
  vowelCount: number; // Number of vowel phonemes
  consonantCount: number; // Number of consonant phonemes
  customSpecs: Record<string, unknown>; // User-defined key-value pairs
}

export interface Phoneme {
  symbol: string; // Character/symbol for phoneme
  ipa: string; // IPA notation
  audioUrl?: string; // Optional audio file URL
  type?: 'vowel' | 'consonant'; // Phoneme classification
}

export interface LanguageStats {
  totalWords: number; // Total dictionary entries
  totalRules: number; // Total grammar rules
  totalContributors: number; // Number of collaborators
  lastModified: string; // ISO 8601 timestamp of last edit
}

export interface LanguageMetadata {
  icon: string; // Material Symbols icon name
  coverImage?: string; // Cover image URL
  tags: string[]; // User tags (e.g., "constructed", "inspired-by-elvish")
  backgroundColor?: string; // Tailwind color for UI
}

// ============================================================================
// LANGUAGE COLLABORATORS (Join Table)
// ============================================================================

export interface LanguageCollaborator {
  id: string; // UUID - Primary key
  language_id: string; // FK to languages.id
  user_id: string; // FK to users.id
  role: 'owner' | 'editor' | 'viewer'; // Permission level
  joined_at: string; // ISO 8601 timestamp
}

// ============================================================================
// DICTIONARIES / WORDS
// ============================================================================

export interface DictionaryEntry {
  id: string; // UUID - Primary key
  language_id: string; // FK to languages.id
  word: string; // Word in constructed language
  translation: string; // English translation
  part_of_speech: PartOfSpeech; // Word category
  pronunciation: string; // IPA notation
  audio_url?: string; // Optional pronunciation audio
  etymology_note?: string; // Word origin/derivation notes
  examples: Example[]; // Usage examples
  added_by: string; // FK to users.id
  added_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  approval_status: 'draft' | 'approved'; // Content moderation status
}

export type PartOfSpeech = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'pronoun' 
  | 'preposition' 
  | 'conjunction' 
  | 'interjection' 
  | 'particle' 
  | 'other';

export interface Example {
  phrase: string; // Example phrase in constructed language
  translation: string; // English translation of phrase
  context?: string; // Additional context
}

// ============================================================================
// GRAMMAR RULES
// ============================================================================

export interface GrammarRule {
  id: string; // UUID - Primary key
  language_id: string; // FK to languages.id
  name: string; // Rule name (e.g., "Plural Formation")
  description: string; // Detailed explanation
  category: RuleCategory; // Linguistic category
  rule_type: RuleType; // Type of rule
  pattern: string; // Regex pattern or prose description
  examples: RuleExample[]; // Usage examples
  added_by: string; // FK to users.id
  added_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  approval_status: 'draft' | 'approved'; // Content moderation status
}

export type RuleCategory = 'morphology' | 'phonology' | 'syntax' | 'pragmatics';

export type RuleType = 'phoneme_rule' | 'inflection' | 'word_order' | 'agreement';

export interface RuleExample {
  input: string; // Input text before rule application
  output: string; // Output text after rule application
  explanation: string; // Explanation of transformation
}

// ============================================================================
// COURSES & LESSONS
// ============================================================================

export interface Course {
  id: string; // UUID - Primary key
  language_id: string; // FK to languages.id
  title: string; // Course title
  description: string; // Course description
  created_at: string; // ISO 8601 timestamp
  creator_id: string; // FK to users.id
  visibility: 'private' | 'public'; // Course visibility
  lessons: Lesson[]; // Array of lessons (normalized in separate table)
  enrolled_users: CourseEnrollment[]; // Enrollment records (normalized in separate table)
  stats: CourseStats; // Aggregated statistics
}

export interface CourseStats {
  totalEnrolled: number; // Number of enrolled users
  averageCompletion: number; // Average progress percentage
  totalLessons: number; // Number of lessons
}

export interface Lesson {
  id: string; // UUID - Primary key
  course_id: string; // FK to courses.id
  title: string; // Lesson title
  order: number; // Lesson sequence number
  type: 'vocab' | 'grammar' | 'pronunciation' | 'mixed'; // Lesson focus
  content: string; // Markdown content
  flashcards: Flashcard[]; // Array of flashcards
  quiz?: Quiz; // Optional quiz
}

export interface Flashcard {
  id: string; // UUID - Primary key
  lesson_id: string; // FK to lessons.id
  front_text: string; // Front side (question)
  back_text: string; // Back side (answer)
  image_url?: string; // Optional image
  order: number; // Card sequence
}

export interface Quiz {
  id: string; // UUID - Primary key
  lesson_id: string; // FK to lessons.id
  questions: QuizQuestion[]; // Array of questions
  passingScore: number; // Percentage needed to pass (0-100)
}

export interface QuizQuestion {
  id: string; // UUID
  question: string; // Question text
  questionType: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[]; // For multiple choice
  correctAnswer: string; // Correct answer(s)
  explanation?: string; // Explanation of correct answer
}

export interface CourseEnrollment {
  id: string; // UUID - Primary key
  course_id: string; // FK to courses.id
  user_id: string; // FK to users.id
  enrolled_at: string; // ISO 8601 timestamp
  completed_lessons: string[]; // Array of completed lesson IDs
  progress: number; // Completion percentage (0-100)
  completed_at?: string; // ISO 8601 timestamp when course finished
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export interface Activity {
  id: string; // UUID - Primary key
  user_id: string; // FK to users.id
  type: ActivityType; // Type of activity
  timestamp: string; // ISO 8601 timestamp
  language_id?: string; // FK to languages.id (if applicable)
  description: string; // Human-readable description
  metadata: Record<string, unknown>; // Additional data (varies by type)
  visibility: 'public' | 'friends_only' | 'private'; // Privacy level
}

export type ActivityType = 
  | 'language_created' 
  | 'word_added' 
  | 'rule_added' 
  | 'course_created' 
  | 'course_completed' 
  | 'collaboration_started';

// ============================================================================
// FRIENDSHIPS
// ============================================================================

export interface Friendship {
  id: string; // UUID - Primary key
  user_id_1: string; // FK to users.id (requester)
  user_id_2: string; // FK to users.id (recipient)
  status: 'pending' | 'accepted' | 'blocked'; // Friendship status
  created_at: string; // ISO 8601 timestamp
  accepted_at?: string; // ISO 8601 timestamp when accepted
}

// ============================================================================
// COLLABORATION INVITATIONS
// ============================================================================

export interface CollaborationInvite {
  id: string; // UUID - Primary key
  language_id: string; // FK to languages.id
  inviter_id: string; // FK to users.id (who sent invite)
  invitee_email: string; // Email of invited user
  role: 'editor' | 'viewer'; // Role if accepted
  message?: string; // Optional invitation message
  status: 'pending' | 'accepted' | 'declined'; // Invitation status
  created_at: string; // ISO 8601 timestamp
  responded_at?: string; // ISO 8601 timestamp when responded
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  pageSize: number;
}

export interface SupabaseError {
  code: string; // Error code
  message: string; // Error message
  details?: string; // Additional details
}

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>; Update: Partial<User> };
      languages: { Row: Language; Insert: Omit<Language, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Language> };
      language_collaborators: { Row: LanguageCollaborator; Insert: Omit<LanguageCollaborator, 'id'>; Update: Partial<LanguageCollaborator> };
      dictionary_entries: { Row: DictionaryEntry; Insert: Omit<DictionaryEntry, 'id' | 'added_at' | 'updated_at'>; Update: Partial<DictionaryEntry> };
      grammar_rules: { Row: GrammarRule; Insert: Omit<GrammarRule, 'id' | 'added_at' | 'updated_at'>; Update: Partial<GrammarRule> };
      courses: { Row: Course; Insert: Omit<Course, 'id' | 'created_at'>; Update: Partial<Course> };
      lessons: { Row: Lesson; Insert: Omit<Lesson, 'id'>; Update: Partial<Lesson> };
      flashcards: { Row: Flashcard; Insert: Omit<Flashcard, 'id'>; Update: Partial<Flashcard> };
      course_enrollments: { Row: CourseEnrollment; Insert: Omit<CourseEnrollment, 'id' | 'enrolled_at'>; Update: Partial<CourseEnrollment> };
      activity: { Row: Activity; Insert: Omit<Activity, 'id'>; Update: Partial<Activity> };
      friendships: { Row: Friendship; Insert: Omit<Friendship, 'id' | 'created_at'>; Update: Partial<Friendship> };
      collaboration_invites: { Row: CollaborationInvite; Insert: Omit<CollaborationInvite, 'id' | 'created_at'>; Update: Partial<CollaborationInvite> };
    };
  };
};
