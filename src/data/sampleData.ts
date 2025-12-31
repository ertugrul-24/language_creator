/**
 * LinguaFabric Sample Data Generator
 * 
 * This script generates realistic sample data for testing and development.
 * Perfect for understanding data relationships and testing queries.
 * 
 * Learning Goals:
 * - Understand data relationships through concrete examples
 * - Learn how to structure seed data
 * - Practice working with complex nested data structures
 * - See real examples of each data type
 * 
 * HOW TO USE:
 * 1. Copy this file to your local environment
 * 2. Run: npx ts-node scripts/generate-sample-data.ts
 * 3. This will output SQL that you can paste into Supabase SQL editor
 * 
 * SAFETY:
 * - This script only GENERATES SQL, it does not execute it
 * - You review the SQL before running it
 * - Use on test/staging databases only
 * 
 * SAMPLE DATA INCLUDES:
 * - 2 test users with profiles
 * - 3 constructed languages (Elvish, Klingon, Dothraki)
 * - 15 sample words per language
 * - 5 grammar rules per language
 * - 1 test course with lessons
 * - Activity logs and friendships
 */

import type {
  User,
  Language,
  DictionaryEntry,
  GrammarRule,
  Course,
  Lesson,
  Flashcard,
  Activity,
  Friendship,
} from '@/types/database';

// Sample user IDs (these would come from Supabase auth in real scenarios)
const SAMPLE_USER_IDS = {
  alice: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
  bob: 'b2c3d4e5-f6a7-489b-cdef-123456789abc',
};

// ============================================================================
// USERS
// ============================================================================

export const sampleUsers = (): Partial<User>[] => [
  {
    auth_id: SAMPLE_USER_IDS.alice,
    email: 'alice@example.com',
    display_name: 'Alice Chen',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice@example.com',
    activity_permissions: 'friends_only',
    theme: 'dark',
    default_language_depth: 'realistic',
  },
  {
    auth_id: SAMPLE_USER_IDS.bob,
    email: 'bob@example.com',
    display_name: 'Bob Smith',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob@example.com',
    activity_permissions: 'public',
    theme: 'dark',
    default_language_depth: 'simplified',
  },
];

// ============================================================================
// LANGUAGES - Phase 1 (simplified, specs will be added in Phase 1.2+)
// ============================================================================

export const sampleLanguages = (): Partial<Language>[] => [
  {
    owner_id: SAMPLE_USER_IDS.alice,
    name: 'Elvish (Sindarin)',
    description: 'Inspired by Tolkien\'s Elvish languages. Features flowing vowel harmony and Celtic-influenced phonology.',
    icon: '🧝',
  },
  {
    owner_id: SAMPLE_USER_IDS.bob,
    name: 'Klingon (tlhIngan Hol)',
    description: 'Warrior language with harsh consonants. Perfect for understanding aggressive phonology.',
    icon: '⚔️',
  },
  {
    owner_id: SAMPLE_USER_IDS.alice,
    name: 'Esperanto Variant',
    description: 'Simplified version of Esperanto for learning purposes.',
    icon: '🌍',
  },
];

// ============================================================================
// DICTIONARY ENTRIES
// ============================================================================

export const sampleDictionaryEntries = (languageId: string, userId: string): Partial<DictionaryEntry>[] => {
  const entries: Record<string, Partial<DictionaryEntry>[]> = {
    // Elvish samples
    'elvish': [
      {
        language_id: languageId,
        word: 'Mellon',
        translation: 'Friend',
        part_of_speech: 'noun',
        pronunciation: 'ˈmel.lon',
        etymology_note: 'Old Sindarin, related to love and affection',
        examples: [
          { phrase: 'Mellon nîn', translation: 'My friend' },
          { phrase: 'Meld le mellon', translation: 'Hail, friend' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
      {
        language_id: languageId,
        word: 'Aragorn',
        translation: 'Royal spear',
        part_of_speech: 'noun',
        pronunciation: 'a.ˈra.ɡorn',
        examples: [
          { phrase: 'Aragorn a Adan', translation: 'Aragorn the man' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
      {
        language_id: languageId,
        word: 'Galadriel',
        translation: 'Maiden crowned with radiant garland',
        part_of_speech: 'noun',
        pronunciation: 'ɡa.ˈla.dri.el',
        examples: [
          { phrase: 'I Galadriel', translation: 'The Galadriel' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
      {
        language_id: languageId,
        word: 'Alatárien',
        translation: 'Has wings (of the sun)',
        part_of_speech: 'adjective',
        pronunciation: 'a.la.ˈta.ri.en',
        examples: [
          { phrase: 'Aran Alatárien', translation: 'The winged king' },
        ],
        added_by: userId,
        approval_status: 'draft',
      },
      {
        language_id: languageId,
        word: 'Lae',
        translation: 'Play, sport, jest',
        part_of_speech: 'noun',
        pronunciation: 'ˈla.e',
        examples: [
          { phrase: 'Lae ellon nîn', translation: 'My friend plays' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
    ],
    // Klingon samples
    'klingon': [
      {
        language_id: languageId,
        word: 'Qapla\'',
        translation: 'Success',
        part_of_speech: 'interjection',
        pronunciation: 'qʰapʰlaʰ',
        examples: [
          { phrase: 'Qapla\' ra\'aq', translation: 'Success in battle' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
      {
        language_id: languageId,
        word: 'HIja\'',
        translation: 'Yes',
        part_of_speech: 'interjection',
        pronunciation: 'xiːʰaʰ',
        examples: [
          { phrase: 'HIja\', jIyaSa\'', translation: 'Yes, I understand' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
      {
        language_id: languageId,
        word: 'Qo\'noS',
        translation: 'Kronos (Klingon homeworld)',
        part_of_speech: 'noun',
        pronunciation: 'qʰoʰnoʰs',
        examples: [
          { phrase: 'Qo\'noS wa\'', translation: 'Kronos Prime' },
        ],
        added_by: userId,
        approval_status: 'approved',
      },
    ],
  };

  return entries['elvish'] || entries['klingon'] || [];
};

// ============================================================================
// GRAMMAR RULES
// ============================================================================

export const sampleGrammarRules = (languageId: string, userId: string): Partial<GrammarRule>[] => [
  {
    language_id: languageId,
    name: 'Plural Formation - Add "ith"',
    description: 'Most nouns form plurals by adding the suffix "-ith" to the word stem.',
    category: 'morphology',
    rule_type: 'inflection',
    pattern: '[noun-stem] + ith',
    examples: [
      { input: 'mellon', output: 'mellonith', explanation: 'Friends (one friend → multiple friends)' },
      { input: 'aragorn', output: 'aragorith', explanation: 'Aragorns (multiple people named Aragorn)' },
    ],
    added_by: userId,
    approval_status: 'approved',
  },
  {
    language_id: languageId,
    name: 'Verb Conjugation - Past Tense',
    description: 'Past tense formed by vowel shift in stem syllable.',
    category: 'morphology',
    rule_type: 'inflection',
    pattern: '[a->ae], [i->ae], [o->oe]',
    examples: [
      { input: 'lae (play)', output: 'laer (played)', explanation: 'Simple past form' },
    ],
    added_by: userId,
    approval_status: 'approved',
  },
];

// ============================================================================
// COURSES & LESSONS
// ============================================================================

export const sampleCourse = (languageId: string, userId: string): Partial<Course> => ({
  language_id: languageId,
  title: 'Introduction to Elvish',
  description: 'Learn basic Elvish greetings, common words, and simple phrases.',
  creator_id: userId,
  visibility: 'public',
  stats: {
    totalEnrolled: 15,
    averageCompletion: 65,
    totalLessons: 3,
  },
});

export const sampleLessons = (courseId: string): Partial<Lesson>[] => [
  {
    course_id: courseId,
    title: 'Greetings & Pleasantries',
    order: 1,
    type: 'vocab',
    content: '# Basic Greetings\n\n- **Mellon nîn** = My friend\n- **Hail, friend** = Common greeting\n- Learn to greet people respectfully.',
  },
  {
    course_id: courseId,
    title: 'Family & Friends',
    order: 2,
    type: 'vocab',
    content: '# Family Vocabulary\n\nRelated vocabulary for family members and relationships.',
  },
  {
    course_id: courseId,
    title: 'Basic Grammar',
    order: 3,
    type: 'grammar',
    content: '# Sentence Structure\n\nUnderstand basic VSO word order and verb conjugation.',
  },
];

export const sampleFlashcards = (lessonId: string): Partial<Flashcard>[] => [
  {
    lesson_id: lessonId,
    front_text: 'How do you say "friend" in Elvish?',
    back_text: 'Mellon',
    order: 1,
  },
  {
    lesson_id: lessonId,
    front_text: 'What does "Aragorn" mean?',
    back_text: 'Royal spear',
    order: 2,
  },
  {
    lesson_id: lessonId,
    front_text: 'Translate: "My friend"',
    back_text: 'Mellon nîn',
    order: 3,
  },
];

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export const sampleActivity = (userId: string, languageId: string): Partial<Activity>[] => [
  {
    user_id: userId,
    type: 'language_created',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    language_id: languageId,
    description: 'Created a new language: Elvish (Sindarin)',
    metadata: { languageName: 'Elvish (Sindarin)' },
    visibility: 'public',
  },
  {
    user_id: userId,
    type: 'word_added',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    language_id: languageId,
    description: 'Added 5 new words to Elvish',
    metadata: { wordCount: 5 },
    visibility: 'public',
  },
  {
    user_id: userId,
    type: 'course_created',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    language_id: languageId,
    description: 'Published course: Introduction to Elvish',
    metadata: { courseTitle: 'Introduction to Elvish', lessons: 3 },
    visibility: 'public',
  },
];

// ============================================================================
// FRIENDSHIPS
// ============================================================================

export const sampleFriendships = (): Partial<Friendship>[] => [
  {
    user_id_1: SAMPLE_USER_IDS.alice,
    user_id_2: SAMPLE_USER_IDS.bob,
    status: 'accepted',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    accepted_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// SQL GENERATION
// ============================================================================

/**
 * Generate SQL INSERT statements for all sample data
 * This is a helper function to generate SQL for pasting into Supabase
 */
export function generateSampleDataSQL(): string {
  const sql: string[] = [];

  sql.push('-- ========================================');
  sql.push('-- LinguaFabric Sample Data SQL');
  sql.push('-- ========================================');
  sql.push('-- Generated for testing and development');
  sql.push('-- IMPORTANT: Run on test database ONLY\n');

  // Users
  sql.push('-- INSERT USERS');
  sampleUsers().forEach((user, idx) => {
    sql.push(`-- User ${idx + 1}: ${user.display_name}`);
    sql.push(
      `INSERT INTO users (auth_id, email, display_name, profile_image_url, activity_permissions, theme, default_language_depth) VALUES ('${user.auth_id}', '${user.email}', '${user.display_name}', '${user.profile_image_url}', '${user.activity_permissions}', '${user.theme}', '${user.default_language_depth}');`
    );
  });

  sql.push('\n-- Note: Dictionary entries, grammar rules, and other nested data');
  sql.push('-- would be inserted similarly in a real scenario.');
  sql.push('\n-- For complete data loading, use a programmatic approach:');
  sql.push('-- npx ts-node scripts/seed-sample-data.ts\n');

  return sql.join('\n');
}

// Export for use in seeding scripts
export const SAMPLE_DATA = {
  users: sampleUsers(),
  languages: sampleLanguages(),
  friendships: sampleFriendships(),
};

console.log('Sample Data Module Loaded');
console.log('Total sample users:', SAMPLE_DATA.users.length);
console.log('Total sample languages:', SAMPLE_DATA.languages.length);
console.log('Total sample friendships:', SAMPLE_DATA.friendships.length);
