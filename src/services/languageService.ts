import { supabase } from './supabaseClient';
import type { Language } from '@/types/database';
import type { LanguageSpecs } from '@/components/LanguageSpecsForm';

interface CreateLanguageInput {
  name: string;
  description: string;
  icon: string;
}

/**
 * Initialize default stats for a new language
 * Used by both Supabase and Firebase implementations
 */
export const initializeLanguageStats = () => ({
  totalWords: 0,
  totalRules: 0,
  totalContributors: 1, // Creator is the first contributor
  lastModified: new Date().toISOString(),
});

/**
 * Create a new language
 * 
 * DUAL-BACKEND SUPPORT:
 * This function is designed to work with both Supabase and Firebase.
 * Currently uses Supabase; Firebase version will follow the same pattern.
 * 
 * @param userId - The user ID creating the language (from auth.users.id)
 * @param input - Basic language information (name, description, icon)
 * @param specs - Optional language specifications (Phase 1.2+ feature)
 * 
 * @returns Created language object with all metadata
 * 
 * @throws Error if validation fails or database operation fails
 * 
 * Process:
 * 1. Validate inputs (required fields, length limits)
 * 2. Check for duplicate language names (per user)
 * 3. Generate unique languageId (automatic via database)
 * 4. Create language record in database
 * 5. Add user as owner in collaborators table
 * 6. Initialize language stats
 * 7. Log activity (future: Phase 1.3+)
 * 8. Return complete language object
 */
export const createLanguage = async (
  userId: string,
  input: CreateLanguageInput,
  specs?: Partial<LanguageSpecs>
): Promise<Language> => {
  try {
    console.log('[createLanguage] Starting with userId:', userId, 'name:', input.name);
    
    // ========================================================================
    // STEP 1: VALIDATE INPUTS
    // ========================================================================
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Language name is required');
    }
    if (input.name.length > 50) {
      throw new Error('Language name must be less than 50 characters');
    }
    if (!input.description || input.description.trim().length === 0) {
      throw new Error('Language description is required');
    }
    if (input.description.length > 500) {
      throw new Error('Language description must be less than 500 characters');
    }

    // ========================================================================
    // STEP 2: CHECK FOR DUPLICATE LANGUAGE NAMES
    // Ensure unique (owner_id, name) pair per database constraint
    // ========================================================================
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

    // ========================================================================
    // STEP 3: PREPARE LANGUAGE DATA
    // Phase 1: Store basic fields only
    // Phase 1.2+: Will also store specs, stats, metadata in JSONB columns
    // ========================================================================
    console.log('[createLanguage] No duplicates found. Preparing insert data...');

    const languageData = {
      owner_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      icon: input.icon,
      // Phase 1.2+ will add:
      // specs: specs || null,
      // stats: initializeLanguageStats(),
      // metadata: initializeLanguageMetadata(),
    };

    if (specs) {
      console.log('[createLanguage] Specs provided:', {
        alphabetScript: specs.alphabetScript,
        writingDirection: specs.writingDirection,
        phonemeCount: specs.phonemeSet?.length || 0,
        depthLevel: specs.depthLevel,
        wordOrder: specs.wordOrder,
        caseSensitive: specs.caseSensitive,
      });
      console.log('[createLanguage] Note: Specs will be stored in Phase 1.2+ database schema');
    }

    // ========================================================================
    // STEP 4: CREATE LANGUAGE RECORD IN DATABASE
    // Supabase: PostgreSQL INSERT returns auto-generated UUID
    // Firebase: Firestore auto-generates document ID
    // ========================================================================
    console.log('[createLanguage] Inserting language data:', languageData);

    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) {
      console.error('[createLanguage] Insert error:', error);
      // Map Supabase errors to user-friendly messages
      if (error.code === '23505') {
        throw new Error('A language with this name already exists');
      }
      if (error.code === '23502') {
        throw new Error('Missing required language information');
      }
      throw new Error(`Failed to create language: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create language - no data returned from server');
    }

    const languageId = data.id;
    console.log('[createLanguage] Language inserted successfully. ID:', languageId);

    // ========================================================================
    // STEP 5: ADD USER AS OWNER IN COLLABORATORS TABLE
    // Creates entry in language_collaborators junction table
    // Supabase: INSERT into language_collaborators
    // Firebase: Add to subcollection languages/{id}/collaborators
    // ========================================================================
    console.log('[createLanguage] Adding user as collaborator...');
    const { error: collabError } = await supabase
      .from('language_collaborators')
      .insert([
        {
          language_id: languageId,
          user_id: userId,
          role: 'owner',
        },
      ]);

    if (collabError) {
      console.error('[createLanguage] Collaborator insert error:', collabError);
      console.warn('[createLanguage] Warning: Could not add user as collaborator, but language was created');
      // Note: We continue even if collaborator insert fails
      // User can recover from this state by manually adding as owner
    } else {
      console.log('[createLanguage] Collaborator added successfully');
    }

    // ========================================================================
    // STEP 6: INITIALIZE LANGUAGE STATS (Future: Phase 1.3 extension)
    // Will be stored in stats JSONB column or nested object
    // ========================================================================
    const initialStats = initializeLanguageStats();
    console.log('[createLanguage] Initial stats prepared:', initialStats);
    console.log('[createLanguage] Note: Stats will be persisted in Phase 1.3 database update');

    // ========================================================================
    // STEP 7: LOG ACTIVITY (Future: Phase 1.3 extension)
    // Create entry in user activity log
    // ========================================================================
    console.log('[createLanguage] Activity logging deferred to Phase 1.3');
    // Will implement in Phase 1.3:
    // - Create entry in user's activity subcollection
    // - Activity type: "language_created"
    // - Store: languageId, language name, timestamp

    // ========================================================================
    // STEP 8: RETURN COMPLETE LANGUAGE OBJECT
    // ========================================================================
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
 * Get all languages owned by a user
 * 
 * DUAL-BACKEND SUPPORT:
 * - Supabase: SELECT * FROM languages WHERE owner_id = ?
 * - Firebase: Query /languages collection with owner_id filter
 * 
 * @param userId - The user ID to fetch languages for
 * @returns Array of Language objects, sorted by creation date (newest first)
 * @throws Error if query fails
 */
export const getUserLanguages = async (userId: string) => {
  try {
    console.log('[getUserLanguages] Starting query with userId:', userId);

    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getUserLanguages] Query error:', error);
      throw new Error(`Failed to fetch languages: ${error.message}`);
    }

    console.log('[getUserLanguages] Query successful, received:', data?.length || 0, 'languages');
    return data as Language[];
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Get user languages error';
    console.error('[getUserLanguages]', message);
    throw err;
  }
};

/**
 * Get a single language by ID
 * 
 * DUAL-BACKEND SUPPORT:
 * - Supabase: SELECT * FROM languages WHERE id = ?
 * - Firebase: GET /languages/{languageId}
 * 
 * @param languageId - The ID of the language to fetch
 * @returns Language object with full details
 * @throws Error if language not found or query fails
 */
export const getLanguage = async (languageId: string) => {
  try {
    console.log('[getLanguage] Fetching language:', languageId);

    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('id', languageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Language not found');
      }
      throw new Error(`Failed to fetch language: ${error.message}`);
    }

    console.log('[getLanguage] Successfully fetched language:', languageId);
    return data as Language;
  } catch (err) {
    console.error('Get language error:', err);
    throw err;
  }
};

/**
 * Update a language
 * 
 * DUAL-BACKEND SUPPORT:
 * - Supabase: UPDATE languages SET ... WHERE id = ?
 * - Firebase: UPDATE /languages/{languageId}
 * 
 * @param languageId - The ID of the language to update
 * @param updates - Partial Language object with fields to update
 * @returns Updated Language object
 * @throws Error if language not found or update fails
 */
export const updateLanguage = async (
  languageId: string,
  updates: Partial<CreateLanguageInput>
) => {
  try {
    console.log('[updateLanguage] Updating language:', languageId);

    const { data, error } = await supabase
      .from('languages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', languageId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update language: ${error.message}`);
    }

    console.log('[updateLanguage] Successfully updated language:', languageId);
    return data as Language;
  } catch (err) {
    console.error('Update language error:', err);
    throw err;
  }
};

/**
 * Delete a language
 * 
 * DUAL-BACKEND SUPPORT:
 * - Supabase: DELETE FROM languages WHERE id = ?
 * - Firebase: DELETE /languages/{languageId}
 * 
 * NOTE: This operation should be restricted to language owner only.
 * Check permissions before calling this function!
 * 
 * @param languageId - The ID of the language to delete
 * @throws Error if language not found or deletion fails
 */
export const deleteLanguage = async (languageId: string) => {
  try {
    console.log('[deleteLanguage] Deleting language:', languageId);

    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('id', languageId);

    if (error) {
      throw new Error(`Failed to delete language: ${error.message}`);
    }

    console.log('[deleteLanguage] Successfully deleted language:', languageId);
  } catch (err) {
    console.error('Delete language error:', err);
    throw err;
  }
};
