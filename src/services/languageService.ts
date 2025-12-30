import { supabase } from './supabaseClient';
import type { Language } from '@/types/database';

interface CreateLanguageInput {
  name: string;
  description: string;
  icon: string;
  coverImage?: string; // base64 encoded
}

/**
 * Create a new language
 */
export const createLanguage = async (
  userId: string,
  input: CreateLanguageInput
): Promise<Language> => {
  try {
    // Check if language name is unique for this user
    const { data: existing, error: checkError } = await supabase
      .from('languages')
      .select('id')
      .eq('owner_id', userId)
      .eq('name', input.name)
      .single();

    if (existing && !checkError) {
      throw new Error('You already have a language with this name');
    }

    // Prepare language data
    const languageData = {
      owner_id: userId,
      name: input.name,
      description: input.description,
      visibility: 'private' as const,
      specs: {
        alphabetScript: 'Latin',
        writingDirection: 'ltr' as const,
        phonemeSet: [],
        depthLevel: 'realistic' as const,
        wordOrder: 'SVO',
        caseSensitive: true,
        vowelCount: 0,
        consonantCount: 0,
        customSpecs: {},
      },
      stats: {
        totalWords: 0,
        totalRules: 0,
        totalContributors: 1,
        lastModified: new Date().toISOString(),
      },
      metadata: {
        icon: input.icon,
        coverImage: input.coverImage || null,
        tags: [],
      },
      collaborators: [
        {
          userId,
          role: 'owner' as const,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert into database
    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create language');
    }

    return data as Language;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create language';
    console.error('Create language error:', err);
    throw new Error(message);
  }
};

/**
 * Get all languages for the current user
 */
export const getUserLanguages = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as Language[];
  } catch (err) {
    console.error('Get user languages error:', err);
    throw err;
  }
};

/**
 * Get a single language by ID
 */
export const getLanguage = async (languageId: string) => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('id', languageId)
      .single();

    if (error) throw error;

    return data as Language;
  } catch (err) {
    console.error('Get language error:', err);
    throw err;
  }
};

/**
 * Update a language
 */
export const updateLanguage = async (
  languageId: string,
  updates: Partial<CreateLanguageInput>
) => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', languageId)
      .select()
      .single();

    if (error) throw error;

    return data as Language;
  } catch (err) {
    console.error('Update language error:', err);
    throw err;
  }
};

/**
 * Delete a language
 */
export const deleteLanguage = async (languageId: string) => {
  try {
    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('id', languageId);

    if (error) throw error;
  } catch (err) {
    console.error('Delete language error:', err);
    throw err;
  }
};
