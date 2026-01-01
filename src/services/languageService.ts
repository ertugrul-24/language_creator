import { supabase } from './supabaseClient';
import { logSpecsChange } from './activityService';
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

  console.error("🔥 CREATE LANGUAGE FUNCTION IS RUNNING 🔥");
  alert("CREATE LANGUAGE CALLED");

  console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "SUPABASE KEY:",
    import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10)
  );

  try {
    console.log('[createLanguage] Starting with userId:', userId, 'name:', input.name);

    
    // ========================================================================
    // STEP 0: ENSURE USER EXISTS IN USERS TABLE
    // This is CRITICAL for RLS policies to work correctly.
    // Supabase doesn't automatically create a public.users row when someone 
    // signs up via auth - there's a trigger to handle this, but we check here
    // as a safety measure to ensure the user exists before creating language.
    // ========================================================================
    console.log('[createLanguage] ⚠️  Ensuring user exists in users table...');
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (userCheckError) {
      if (userCheckError.code === 'PGRST116') {
        // User not found in public.users table
        console.warn('[createLanguage] User not found in users table - attempting to create entry...');
        
        // Try to get email from auth context if available
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        const { error: insertUserError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: userId,
              email: authUser?.email || `user-${userId}@placeholder.com`,
              display_name: authUser?.user_metadata?.display_name || 'User',
            },
          ]);

        if (insertUserError) {
          console.error('[createLanguage] ⚠️  Failed to create user entry:', insertUserError);
          // Don't throw - the trigger may have already handled this
          // or the user may already exist (race condition)
        } else {
          console.log('[createLanguage] ✅ User entry created successfully');
        }
      } else {
        // Other error occurred
        console.error('[createLanguage] Unexpected error checking user:', userCheckError);
        throw new Error(`User check failed: ${userCheckError.message}`);
      }
    } else {
      console.log('[createLanguage] ✅ User already exists in users table:', userCheck?.id);
    }

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
    // CRITICAL: Must insert ALL spec fields + visibility to avoid NULL values
    // NULL values cause "Unspecified" display and persistence issues
    // ========================================================================
    console.log('[createLanguage] No duplicates found. Preparing insert data...');

    const languageData: any = {
      owner_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      icon_url: input.icon || '🌍',
      visibility: 'private', // Default: only owner can see
      
      // SPEC FIELDS: Must be set to avoid NULL values
      alphabet_script: specs?.alphabetScript || null,
      writing_direction: specs?.writingDirection || 'ltr',
      word_order: specs?.wordOrder || null,
      case_sensitive: specs?.caseSensitive ?? false,
      phoneme_count: specs?.phonemeSet?.length || null,
      depth_level: specs?.depthLevel || 'realistic',
    };

    console.log('[createLanguage] ⚠️  FULL INSERT PAYLOAD (all fields):');
    console.log(JSON.stringify(languageData, null, 2));
    
    if (specs) {
      console.log('[createLanguage] Specs provided:', {
        alphabetScript: specs.alphabetScript,
        writingDirection: specs.writingDirection,
        phonemeCount: specs.phonemeSet?.length || 0,
        depthLevel: specs.depthLevel,
        wordOrder: specs.wordOrder,
      });
      console.log('[createLanguage] ✅ Specs WILL be persisted to database (not deferred)');
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
      console.error('[createLanguage] ❌ Language insert error:', error);
      console.error('[createLanguage] Error code:', error.code);
      console.error('[createLanguage] Error message:', error.message);
      
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
    console.log('[createLanguage] ✅ Language inserted successfully. ID:', languageId);

    // ========================================================================
    // STEP 5: ADD USER AS OWNER IN COLLABORATORS TABLE
    // CRITICAL: language_collaborators.user_id references public.users.id
    // NOT auth.users.id, so we must fetch the correct user ID first
    // ========================================================================
    console.log('[createLanguage] Fetching correct user ID from public.users...');
    const { data: dbUser, error: dbUserError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (dbUserError || !dbUser) {
      console.error('[createLanguage] ❌ CRITICAL: User not found in public.users table');
      console.error('[createLanguage] Error:', dbUserError?.message);
      console.error('[createLanguage] auth_id searched:', userId);
      console.warn('[createLanguage] ⚠️  Language was created successfully, but cannot add collaborator');
      console.warn('[createLanguage] User must exist in public.users table');
      // Still return the language - it was created successfully
      return data as Language;
    }

    console.log('[createLanguage] ✅ Found user in public.users. ID:', dbUser.id);
    
    console.log('[createLanguage] Adding user as collaborator with role="owner"...');
    const { data: collabData, error: collabError } = await supabase
      .from('language_collaborators')
      .insert([
        {
          language_id: languageId,
          user_id: userId,  // Use auth.uid, NOT (public.users.id)
          role: 'owner',
        },
      ])
      .select()
      .single();

    if (collabError) {
      console.error('[createLanguage] ❌ Collaborator insert error:', collabError);
      console.error('[createLanguage] Error code:', collabError.code);
      console.error('[createLanguage] Error message:', collabError.message);
      console.error('[createLanguage] Language still created successfully at ID:', languageId);
      console.error('[createLanguage] But collaborator entry failed - this may affect dashboard visibility');
      // Do NOT throw - language was created successfully
      // Collaborator insert failure is not fatal
    } else {
      console.log('[createLanguage] ✅ Collaborator added successfully');
      console.log('[createLanguage] Collaborator row:', collabData);
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
    console.log('[createLanguage] ✅ COMPLETE! Language creation finished successfully');
    return data as Language;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create language';
    console.error('[createLanguage] ❌ EXCEPTION CAUGHT:', message);
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
/**
 * Map database columns to Language type with nested specs
 * Database stores specs as individual columns; API returns nested object
 */
/**
 * REVERSE MAPPER: Convert Language type to database update payload
 * 
 * This is the inverse of mapDatabaseLanguageToLanguage().
 * It converts from TypeScript Language type with nested specs
 * to flat database columns with snake_case names.
 * 
 * Example:
 * Input: { name: "French", specs: { alphabetScript: "Latin" } }
 * Output: { name: "French", alphabet_script: "Latin" }
 */
const mapLanguageToDatabaseUpdate = (
  updates: Partial<CreateLanguageInput> & Partial<{ visibility: string; specs?: Partial<LanguageSpecs>; case_sensitive?: boolean; phoneme_count?: number }>
): Record<string, any> => {
  const dbUpdates: any = {
    updated_at: new Date().toISOString(),
  };

  console.log('[mapLanguageToDatabaseUpdate] Input updates:', updates);

  // Map simple fields (name, description, icon, visibility, case_sensitive, phoneme_count)
  if ('name' in updates && updates.name !== undefined) {
    dbUpdates.name = updates.name;
    console.log('[mapLanguageToDatabaseUpdate] Mapped name:', updates.name);
  }
  if ('description' in updates && updates.description !== undefined) {
    dbUpdates.description = updates.description;
    console.log('[mapLanguageToDatabaseUpdate] Mapped description:', updates.description);
  }
  if ('icon' in updates && updates.icon !== undefined) {
    dbUpdates.icon_url = updates.icon; // ← KEY: 'icon' → 'icon_url'
    console.log('[mapLanguageToDatabaseUpdate] Mapped icon → icon_url:', updates.icon);
  }
  if ('visibility' in updates && updates.visibility !== undefined) {
    dbUpdates.visibility = updates.visibility;
    console.log('[mapLanguageToDatabaseUpdate] Mapped visibility:', updates.visibility);
  }
  if ('case_sensitive' in updates && updates.case_sensitive !== undefined) {
    dbUpdates.case_sensitive = updates.case_sensitive;
    console.log('[mapLanguageToDatabaseUpdate] Mapped case_sensitive:', updates.case_sensitive);
  }
  if ('phoneme_count' in updates && updates.phoneme_count !== undefined) {
    dbUpdates.phoneme_count = updates.phoneme_count;
    console.log('[mapLanguageToDatabaseUpdate] Mapped phoneme_count:', updates.phoneme_count);
  }

  // Map specs (nested object → individual columns)
  // CRITICAL: Only map specs that are explicitly provided (not undefined)
  if (updates.specs && typeof updates.specs === 'object') {
    console.log('[mapLanguageToDatabaseUpdate] Processing specs:', updates.specs);
    
    // Only set spec fields if they have a value, otherwise leave them untouched in DB
    if (updates.specs.alphabetScript) {
      dbUpdates.alphabet_script = updates.specs.alphabetScript; // ← KEY: alphabetScript → alphabet_script
      console.log('[mapLanguageToDatabaseUpdate] Mapped alphabetScript → alphabet_script:', updates.specs.alphabetScript);
    }
    if (updates.specs.writingDirection) {
      dbUpdates.writing_direction = updates.specs.writingDirection; // ← KEY: writingDirection → writing_direction
      console.log('[mapLanguageToDatabaseUpdate] Mapped writingDirection → writing_direction:', updates.specs.writingDirection);
    }
    if (updates.specs.wordOrder) {
      dbUpdates.word_order = updates.specs.wordOrder; // ← KEY: wordOrder → word_order
      console.log('[mapLanguageToDatabaseUpdate] Mapped wordOrder → word_order:', updates.specs.wordOrder);
    }
    if (updates.specs.depthLevel) {
      dbUpdates.depth_level = updates.specs.depthLevel; // ← KEY: depthLevel → depth_level
      console.log('[mapLanguageToDatabaseUpdate] Mapped depthLevel → depth_level:', updates.specs.depthLevel);
    }
    if (updates.specs.phonemeSet !== undefined) {
      dbUpdates.phoneme_set = updates.specs.phonemeSet; // ← KEY: phonemeSet → phoneme_set
      console.log('[mapLanguageToDatabaseUpdate] Mapped phonemeSet → phoneme_set:', updates.specs.phonemeSet);
    }
  }

  console.log('[mapLanguageToDatabaseUpdate] FINAL OUTPUT (ready for Supabase):', dbUpdates);
  return dbUpdates;
};

const mapDatabaseLanguageToLanguage = (dbData: any): Language => {
  console.log('[mapDatabaseLanguageToLanguage] Input database data:', {
    id: dbData.id,
    alphabet_script: dbData.alphabet_script,
    writing_direction: dbData.writing_direction,
    word_order: dbData.word_order,
    depth_level: dbData.depth_level,
    case_sensitive: dbData.case_sensitive,
    phoneme_count: dbData.phoneme_count,
  });

  const result: Language = {
    id: dbData.id,
    owner_id: dbData.owner_id,
    name: dbData.name,
    description: dbData.description,
    icon: dbData.icon || '🌍', // fallback
    icon_url: dbData.icon_url,
    cover_image_url: dbData.cover_image_url,
    visibility: dbData.visibility as 'private' | 'friends' | 'public' | undefined,
    specs: {
      alphabetScript: dbData.alphabet_script,
      writingDirection: dbData.writing_direction as 'ltr' | 'rtl' | 'boustrophedon' | undefined,
      wordOrder: dbData.word_order,
      depthLevel: dbData.depth_level as 'realistic' | 'simplified' | undefined,
      phonemeSet: dbData.phoneme_set || [], // Will be fetched from phonemes table if needed
    },
    total_words: dbData.total_words || 0,
    total_rules: dbData.total_rules || 0,
    total_contributors: dbData.total_contributors || 1,
    phoneme_count: dbData.phoneme_count,
    case_sensitive: dbData.case_sensitive || false,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at,
  };

  console.log('[mapDatabaseLanguageToLanguage] Output Language type:', {
    specs: result.specs,
    case_sensitive: result.case_sensitive,
    phoneme_count: result.phoneme_count,
  });

  return result;
};

export const getLanguage = async (languageId: string) => {
  try {
    console.log('[getLanguage] Fetching language:', languageId);

    // Simple query - just get the language data
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('id', languageId)
      .single();

    if (error) {
      console.error('[getLanguage] Error:', error.code, error.message);
      if (error.code === 'PGRST116') {
        throw new Error('Language not found');
      }
      throw new Error(`Failed to fetch language: ${error.message}`);
    }

    console.log('[getLanguage] Successfully fetched language:', languageId);
    return mapDatabaseLanguageToLanguage(data);
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
  updates: Partial<CreateLanguageInput> & Partial<{ visibility: string; specs?: Partial<LanguageSpecs>; case_sensitive?: boolean; phoneme_count?: number }>
) => {
  try {
    console.log('[updateLanguage] Starting update for language:', languageId);
    console.log('[updateLanguage] Received updates:', updates);

    // Use the dedicated reverse mapper to convert Language → DB columns
    const dbUpdates = mapLanguageToDatabaseUpdate(updates);

    console.log('[updateLanguage] UPDATE payload keys:', Object.keys(dbUpdates));
    console.log('[updateLanguage] UPDATE payload values:', {
      name: dbUpdates.name,
      description: dbUpdates.description,
      icon_url: dbUpdates.icon_url,
      visibility: dbUpdates.visibility,
      alphabet_script: dbUpdates.alphabet_script,
      writing_direction: dbUpdates.writing_direction,
      word_order: dbUpdates.word_order,
      depth_level: dbUpdates.depth_level,
      case_sensitive: dbUpdates.case_sensitive,
      updated_at: dbUpdates.updated_at,
    });

    // Verify we have something to update (more than just updated_at)
    const updateFieldCount = Object.keys(dbUpdates).length - 1; // -1 for updated_at
    if (updateFieldCount === 0) {
      console.warn('[updateLanguage] ⚠️  No fields to update (only updated_at)');
      // Still execute to at least update the timestamp
    }

    // Attempt UPDATE with SELECT
    console.log('[updateLanguage] Executing Supabase UPDATE...');
    const { data, error } = await supabase
      .from('languages')
      .update(dbUpdates)
      .eq('id', languageId)
      .select('*')
      .single();

    if (error) {
      console.error('[updateLanguage] ERROR CODE:', error.code);
      console.error('[updateLanguage] ERROR MESSAGE:', error.message);
      console.error('[updateLanguage] Full error object:', error);
      
      // PGRST204 means UPDATE succeeded but SELECT returned 0 rows
      // This is likely an RLS issue - UPDATE succeeded but can't SELECT the result
      if (error.code === 'PGRST204') {
        console.warn('[updateLanguage] UPDATE likely succeeded but SELECT blocked by RLS');
        console.log('[updateLanguage] Attempting to fetch updated language separately...');
        
        // Try to fetch the updated language with a fresh query
        const { data: refetchData, error: refetchError } = await supabase
          .from('languages')
          .select('*')
          .eq('id', languageId)
          .single();

        if (refetchError) {
          console.error('[updateLanguage] REFETCH ERROR:', refetchError.code, refetchError.message);
          throw new Error(`Update succeeded but could not fetch updated data: ${refetchError.message}`);
        }

        if (!refetchData) {
          throw new Error('Update succeeded but refetch returned no data');
        }

        console.log('[updateLanguage] ✅ Refetch successful, data from database:');
        console.log('  name:', refetchData.name);
        console.log('  description:', refetchData.description);
        console.log('  visibility:', refetchData.visibility);
        console.log('  updated_at:', refetchData.updated_at);

        const mapped = mapDatabaseLanguageToLanguage(refetchData);
        console.log('[updateLanguage] ✅ Successfully updated language:', languageId);
        return mapped;
      }

      // Other errors
      if (error.code === 'PGRST116') {
        throw new Error('Language not found or you do not have permission to update it');
      }
      throw new Error(`Failed to update language: ${error.message} (${error.code})`);
    }

    if (!data) {
      console.error('[updateLanguage] UPDATE returned null data');
      throw new Error('Update succeeded but returned no data');
    }

    console.log('[updateLanguage] Raw data returned from database:');
    console.log('  id:', data.id);
    console.log('  name:', data.name);
    console.log('  description:', data.description);
    console.log('  icon_url:', data.icon_url);
    console.log('  visibility:', data.visibility);
    console.log('  alphabet_script:', data.alphabet_script);
    console.log('  writing_direction:', data.writing_direction);
    console.log('  word_order:', data.word_order);
    console.log('  depth_level:', data.depth_level);
    console.log('  case_sensitive:', data.case_sensitive);
    console.log('  updated_at:', data.updated_at);

    const mapped = mapDatabaseLanguageToLanguage(data);
    console.log('[updateLanguage] Mapped result:', {
      name: mapped.name,
      description: mapped.description,
      visibility: mapped.visibility,
      specs: mapped.specs,
    });
    console.log('[updateLanguage] ✅ Successfully updated language:', languageId);

    // Log activity if specs were changed
    if (updates.specs) {
      try {
        const auth = await supabase.auth.getUser();
        if (auth.data.user) {
          await logSpecsChange(
            auth.data.user.id,
            languageId,
            {}, // Old specs - we don't have them here, but could enhance this
            updates.specs
          );
        }
      } catch (logErr) {
        // Don't fail the update if activity logging fails
        console.warn('[updateLanguage] Activity logging failed (non-critical):', logErr);
      }
    }

    return mapped;
  } catch (err) {
    console.error('[updateLanguage] ❌ Unexpected error:', err);
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

/**
 * Get languages the user collaborates on (not created by them)
 * Queries language_collaborators table and joins with languages
 * 
 * @param userId - The user's ID
 * @returns Array of Language objects with collaboration metadata
 * @throws Error if query fails
 */
export const getCollaboratedLanguages = async (userId: string) => {
  try {
    console.log('[getCollaboratedLanguages] Starting query with userId:', userId);

    // Step 1: Get all collaboration records for this user
    const { data: collaborations, error: collabError } = await supabase
      .from('language_collaborators')
      .select('role, language_id')
      .eq('user_id', userId);

    if (collabError) {
      console.error('[getCollaboratedLanguages] Collaborations query error:', collabError);
      throw new Error(`Failed to fetch collaborations: ${collabError.message}`);
    }

    if (!collaborations || collaborations.length === 0) {
      console.log('[getCollaboratedLanguages] User has no collaborations');
      return [];
    }

    // Step 2: Get the language IDs for languages NOT owned by this user
    const languageIds = collaborations.map((c: any) => c.language_id);
    console.log('[getCollaboratedLanguages] Found', languageIds.length, 'collaboration entries');

    // Step 3: Fetch language details for those IDs, excluding ones they own
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('*')
      .in('id', languageIds)
      .neq('owner_id', userId);

    if (langError) {
      console.error('[getCollaboratedLanguages] Languages query error:', langError);
      throw new Error(`Failed to fetch languages: ${langError.message}`);
    }

    // Step 4: Map back the roles from collaboration records
    const collaboratedLanguages = (languages || []).map((lang) => {
      const collab = collaborations.find((c: any) => c.language_id === lang.id);
      return {
        ...lang as Language,
        collaboratorRole: collab?.role || 'viewer', // Add role metadata for UI
      };
    });

    console.log('[getCollaboratedLanguages] Query successful, received:', collaboratedLanguages.length, 'collaborated languages');
    return collaboratedLanguages as (Language & { collaboratorRole: string })[];
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Get collaborated languages error';
    console.error('[getCollaboratedLanguages]', message);
    throw err;
  }
};

/**
 * Get all languages for a user (created + collaborated)
 * Returns languages with metadata indicating ownership/role
 * 
 * @param userId - The user's ID
 * @returns Combined array with ownership/role metadata
 * @throws Error if query fails
 */
export const getAllUserLanguages = async (userId: string) => {
  try {
    console.log('[getAllUserLanguages] Starting query with userId:', userId);

    // Fetch both created and collaborated languages in parallel
    const [createdLanguages, collaboratedLanguages] = await Promise.all([
      getUserLanguages(userId),
      getCollaboratedLanguages(userId),
    ]);

    // Add metadata to created languages
    const created = createdLanguages.map((lang) => ({
      ...lang,
      userRole: 'owner' as const,
      type: 'created' as const,
    }));

    // Add metadata to collaborated languages
    const collaborated = collaboratedLanguages.map((lang) => ({
      ...lang,
      userRole: lang.collaboratorRole as 'editor' | 'viewer',
      type: 'collaborated' as const,
    }));

    const all = [...created, ...collaborated];
    console.log('[getAllUserLanguages] Total languages:', all.length, '(created:', created.length, ', collaborated:', collaborated.length, ')');

    return all;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Get all user languages error';
    console.error('[getAllUserLanguages]', message);
    throw err;
  }
};
