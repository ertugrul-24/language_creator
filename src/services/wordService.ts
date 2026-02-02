import { supabase } from '@/services/supabaseClient';
import { updateLanguageStats } from '@/services/languageService';

interface DictionaryWord {
  id: string;
  word: string;
  translation: string;
  part_of_speech: string;
  pronunciation?: string;
  owner_id?: string;
  created_at?: string;
}

interface AddWordInput {
  languageId: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  pronunciation?: string;
  etymologyNote?: string;
  examples?: Array<{ phrase: string; translation: string }>;
  userId: string;
  userEmail: string;
}

/**
 * Get all words for a language with optional pagination and filtering
 */
export const getWords = async (
  languageId: string,
  options?: {
    search?: string;
    partOfSpeech?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ words: DictionaryWord[]; total: number; error: string | null }> => {
  try {
    console.log('🔍 [wordService.getWords] Fetching words for language:', languageId);
    
    let query = supabase
      .from('words')
      .select('*', { count: 'exact' })
      .eq('language_id', languageId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.partOfSpeech) {
      query = query.eq('part_of_speech', options.partOfSpeech);
    }

    // Apply search
    if (options?.search) {
      query = query.or(
        `word.ilike.%${options.search}%,translation.ilike.%${options.search}%`
      );
    }

    // Apply pagination
    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [wordService.getWords] Query error:', error);
      throw error;
    }

    console.log('✅ [wordService.getWords] Fetched ${data?.length || 0} words');
    return {
      words: data || [],
      total: count || 0,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch words';
    console.error('❌ [wordService.getWords] Error:', message);
    return {
      words: [],
      total: 0,
      error: message,
    };
  }
};

/**
 * Add a new word to the dictionary
 */
export const addWord = async (input: AddWordInput): Promise<{ success: boolean; wordId?: string; error: string | null }> => {
  try {
    console.log('📝 [wordService.addWord] Adding word:', input.word, 'to language:', input.languageId);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ [wordService.addWord] Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }

    console.log('✅ [wordService.addWord] User authenticated:', user.id);

    const payload = {
      language_id: input.languageId,
      owner_id: user.id,
      word: input.word,
      translation: input.translation,
      part_of_speech: input.partOfSpeech,
      pronunciation: input.pronunciation || null,
      etymology: input.etymologyNote || null,
      examples: input.examples || [],
    };

    console.log('📤 [wordService.addWord] Sending payload to Supabase:', payload);

    // Validate payload
    console.log('[wordService.addWord] Payload validation:');
    console.log('  language_id:', payload.language_id, payload.language_id ? 'OK' : 'NULL');
    console.log('  owner_id:', payload.owner_id, payload.owner_id ? 'OK' : 'NULL');
    console.log('  word:', payload.word, payload.word ? 'OK' : 'EMPTY');
    console.log('  translation:', payload.translation, payload.translation ? 'OK' : 'EMPTY');
    console.log('  part_of_speech:', payload.part_of_speech, payload.part_of_speech ? 'OK' : 'EMPTY');

    const { data, error } = await supabase
      .from('words')
      .insert([payload])
      .select('*')
      .single();

    // Log FULL Supabase response
    console.log('📥 [wordService.addWord] Supabase response:', {
      status: error ? 'ERROR' : 'SUCCESS',
      data,
      error: error ? {
        message: error.message,
        code: (error as any).code,
        status: (error as any).status,
        details: (error as any).details,
        hint: (error as any).hint
      } : null
    });

    if (error) {
      const errorDetails = {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
        status: (error as any).status,
        fullError: error
      };
      console.error('❌ [wordService.addWord] Insert FAILED:', errorDetails);
      throw error;
    }

    if (!data || !data.id) {
      console.error('❌ [wordService.addWord] Insert returned no data!', data);
      throw new Error('Insert succeeded but returned empty response');
    }

    console.log('✅ [wordService.addWord] Word persisted to Supabase:', {
      id: data.id,
      word: data.word,
      translation: data.translation,
      owner_id: data.owner_id,
      language_id: data.language_id,
      created_at: data.created_at
    });

    // Update language stats to reflect new word count
    console.log('📊 [wordService.addWord] Updating language stats...');
    const statsResult = await updateLanguageStats(input.languageId);
    if (statsResult.error) {
      console.warn('⚠️  [wordService.addWord] Stats update failed (non-critical):', statsResult.error);
    } else {
      console.log('✅ [wordService.addWord] Language stats updated');
    }

    return { success: true, wordId: data.id, error: null };
  } catch (err) {
    let message = 'Failed to add word';
    let details = '';
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    // Extract Supabase-specific error details
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      if (supabaseErr.code) details += `[${supabaseErr.code}] `;
      if (supabaseErr.details) details += supabaseErr.details;
      if (supabaseErr.hint) details += ` HINT: ${supabaseErr.hint}`;
    }
    
    const fullMessage = details ? `${message} - ${details}` : message;
    console.error('❌ [wordService.addWord] Full error details:', {
      message,
      details,
      fullMessage,
      originalError: err
    });
    return { success: false, error: fullMessage };
  }
};

/**
 * Update a word in the dictionary
 * Verifies ownership before updating
 */
export const updateWord = async (
  wordId: string,
  updates: Partial<AddWordInput>
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('========== UPDATE WORD START ==========');
    console.log('updateWord() called with:', { wordId, updates });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }
    console.log('Current user:', user.id);

    // Fetch word to verify ownership
    const { data: wordData, error: fetchError } = await supabase
      .from('words')
      .select('id, owner_id, language_id, word')
      .eq('id', wordId)
      .single();

    if (fetchError) {
      console.error('Fetch error (word not found or access denied):', fetchError);
      return { success: false, error: `Word not found: ${fetchError.message}` };
    }

    console.log('Word found:', {
      id: wordData.id,
      word: wordData.word,
      owner_id: wordData.owner_id,
      current_user: user.id,
      owner_matches: wordData.owner_id === user.id
    });

    if (wordData.owner_id !== user.id) {
      console.error('Permission denied: user is not the owner');
      return { success: false, error: 'Permission denied: You can only edit your own words' };
    }

    // Build update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.word !== undefined) updatePayload.word = updates.word;
    if (updates.translation !== undefined) updatePayload.translation = updates.translation;
    if (updates.partOfSpeech !== undefined) updatePayload.part_of_speech = updates.partOfSpeech;
    if (updates.pronunciation !== undefined) updatePayload.pronunciation = updates.pronunciation || null;
    if (updates.etymologyNote !== undefined) updatePayload.etymology = updates.etymologyNote || null;
    if (updates.examples !== undefined) updatePayload.examples = updates.examples || [];

    console.log('Update payload:', updatePayload);

    // Execute update
    const { data: updatedData, error: updateError } = await supabase
      .from('words')
      .update(updatePayload)
      .eq('id', wordId)
      .select('*')
      .single();

    console.log('Supabase response:', {
      success: !updateError,
      data: updatedData,
      error: updateError ? {
        message: updateError.message,
        code: (updateError as any).code,
        details: (updateError as any).details,
        hint: (updateError as any).hint,
        status: (updateError as any).status,
      } : null
    });

    if (updateError) {
      console.error('UPDATE FAILED:', updateError);
      throw updateError;
    }

    if (!updatedData) {
      console.error('Update returned no data');
      throw new Error('Update succeeded but returned empty response');
    }

    console.log('Update successful:', updatedData.word);
    console.log('========== UPDATE WORD SUCCESS ==========');
    return { success: true, error: null };

  } catch (err) {
    let message = 'Failed to update word';
    let details = '';
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      if (supabaseErr.code) details += `Code: ${supabaseErr.code} | `;
      if (supabaseErr.details) details += `Details: ${supabaseErr.details} | `;
      if (supabaseErr.hint) details += `Hint: ${supabaseErr.hint}`;
    }
    
    const fullMessage = details ? `${message} - ${details}` : message;
    console.error('========== UPDATE WORD FAILED ==========');
    console.error('Final error:', fullMessage);
    console.error('Original error:', err);
    return { success: false, error: fullMessage };
  }
};

/**
 * Delete a word from the dictionary
 * Only the owner/creator can delete their words (enforced by RLS policies)
 * Updates language stats after deletion
 */
export const deleteWord = async (
  wordId: string,
  languageId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('========== DELETE WORD START ==========');
    console.log('deleteWord() called with:', { wordId, languageId });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }
    console.log('Current user:', user.id);

    // Fetch word to verify ownership
    const { data: wordData, error: fetchError } = await supabase
      .from('words')
      .select('id, owner_id, language_id, word')
      .eq('id', wordId)
      .single();

    if (fetchError) {
      console.error('Fetch error (word not found or access denied):', fetchError);
      return { success: false, error: `Word not found: ${fetchError.message}` };
    }

    console.log('Word found:', {
      id: wordData.id,
      word: wordData.word,
      owner_id: wordData.owner_id,
      current_user: user.id,
      owner_matches: wordData.owner_id === user.id
    });

    if (wordData.owner_id !== user.id) {
      console.error('Permission denied: user is not the owner');
      return { success: false, error: 'Permission denied: You can only delete your own words' };
    }

    // Delete the word
    const { data: deletedData, error: deleteError } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)
      .select('id')
      .single();

    console.log('Delete response:', {
      success: !deleteError,
      data: deletedData,
      error: deleteError ? {
        message: deleteError.message,
        code: (deleteError as any).code,
        details: (deleteError as any).details,
        hint: (deleteError as any).hint,
        status: (deleteError as any).status,
      } : null
    });

    if (deleteError) {
      console.error('DELETE FAILED:', deleteError);
      throw deleteError;
    }

    console.log('Delete successful:', wordData.word);

    // Update language stats
    console.log('Updating language stats...');
    const statsResult = await updateLanguageStats(languageId);
    if (statsResult.error) {
      console.warn('Stats update failed (non-critical):', statsResult.error);
    } else {
      console.log('Language stats updated');
    }

    console.log('========== DELETE WORD SUCCESS ==========');
    return { success: true, error: null };

  } catch (err) {
    let message = 'Failed to delete word';
    let details = '';
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      if (supabaseErr.code) details += `Code: ${supabaseErr.code} | `;
      if (supabaseErr.details) details += `Details: ${supabaseErr.details} | `;
      if (supabaseErr.hint) details += `Hint: ${supabaseErr.hint}`;
    }
    
    const fullMessage = details ? `${message} - ${details}` : message;
    console.error('========== DELETE WORD FAILED ==========');
    console.error('Final error:', fullMessage);
    console.error('Original error:', err);
    return { success: false, error: fullMessage };
  }
};

/**
 * Get parts of speech for a language
 */
export const getPartsOfSpeech = async (
  languageId: string
): Promise<{ pos: string[]; error: string | null }> => {
  try {
    console.log('🏷️ [wordService.getPartsOfSpeech] Fetching POS for language:', languageId);
    
    const { data, error } = await supabase
      .from('words')
      .select('part_of_speech', { count: 'exact' })
      .eq('language_id', languageId);

    if (error) {
      console.error('❌ [wordService.getPartsOfSpeech] Query error:', error);
      throw error;
    }

    const uniquePOS = [...new Set(data?.map((d) => d.part_of_speech) || [])].sort();
    console.log('✅ [wordService.getPartsOfSpeech] Found ${uniquePOS.length} unique POS');
    return { pos: uniquePOS, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch parts of speech';
    console.error('❌ [wordService.getPartsOfSpeech] Error:', message);
    return { pos: [], error: message };
  }
};
