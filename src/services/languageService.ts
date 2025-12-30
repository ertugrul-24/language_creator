import { supabase } from './supabaseClient';
import type { Language } from '@/types/database';

interface CreateLanguageInput {
  name: string;
  description: string;
  icon: string;
}

/**
 * Create a new language
 */
export const createLanguage = async (
  userId: string,
  input: CreateLanguageInput
): Promise<Language> => {
  try {
    console.log('[createLanguage] Starting with userId:', userId, 'name:', input.name);
    
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Language name is required');
    }
    if (!input.description || input.description.trim().length === 0) {
      throw new Error('Language description is required');
    }

    // Check if language name is unique for this user
    console.log('[createLanguage] Checking for duplicate names...');
    const { data: existing, error: checkError } = await supabase
      .from('languages')
      .select('id')
      .eq('owner_id', userId)
      .eq('name', input.name.trim());

    if (checkError) {
      console.error('[createLanguage] Error checking for duplicates:', checkError);
      throw new Error(`Duplicate check failed: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      throw new Error('You already have a language with this name');
    }

    console.log('[createLanguage] No duplicates found. Preparing insert data...');

    // Prepare language data - Phase 1 fields ONLY
    // owner_id, name, description, icon
    const languageData = {
      owner_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      icon: input.icon,
    };

    console.log('[createLanguage] Inserting language data:', languageData);

    // Insert into database
    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) {
      console.error('[createLanguage] Insert error:', error);
      console.error('[createLanguage] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to create language: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create language - no data returned from server');
    }

    console.log('[createLanguage] Language inserted successfully. ID:', data.id);

    // Add the user as owner in the collaborators table
    console.log('[createLanguage] Adding user as collaborator...');
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
      console.error('[createLanguage] Collaborator insert error:', collabError);
      console.error('[createLanguage] Error details:', {
        message: collabError.message,
        code: collabError.code,
        details: collabError.details,
        hint: collabError.hint,
      });
      // Note: We continue even if collaborator insert fails, as the language was created
      console.warn('[createLanguage] Warning: Could not add user as collaborator, but language was created');
    } else {
      console.log('[createLanguage] Collaborator added successfully');
    }

    console.log('[createLanguage] Complete! Returning language data');
    return data as Language;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create language';
    console.error('[createLanguage] Exception caught:', message);
    console.error('[createLanguage] Full error:', err);
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
