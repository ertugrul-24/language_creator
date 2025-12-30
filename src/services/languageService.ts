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
    const { data: existing } = await supabase
      .from('languages')
      .select('id')
      .eq('owner_id', userId)
      .eq('name', input.name);

    if (existing && existing.length > 0) {
      throw new Error('You already have a language with this name');
    }

    // Prepare language data - matching the database schema
    const languageData = {
      owner_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      visibility: 'private',
      // Language Specifications
      alphabet_script: 'Latin',
      writing_direction: 'ltr',
      depth_level: 'realistic',
      word_order: 'SVO',
      case_sensitive: false,
      vowel_count: 0,
      consonant_count: 0,
      // Metadata
      icon_url: input.icon,
      cover_image_url: input.coverImage || null,
      tags: [],
      // Stats
      total_words: 0,
      total_rules: 0,
      total_contributors: 1,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create language - no data returned');
    }

    // Add the user as owner in the collaborators table
    const { error: collabError } = await supabase
      .from('language_collaborators')
      .insert([
        {
          language_id: data.id,
          user_id: userId,
          role: 'owner',
        },
      ]);

    if (collabError) {
      console.error('Collaborator insert error:', collabError);
      throw collabError;
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
