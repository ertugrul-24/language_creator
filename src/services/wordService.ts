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
    console.log('✏️ [wordService.updateWord] Starting update for word:', wordId);
    console.log('  Updates:', updates);

    // Verify word exists and belongs to current user
    const { data: wordData, error: fetchError } = await supabase
      .from('words')
      .select('id, owner_id, language_id')
      .eq('id', wordId)
      .single();

    if (fetchError) {
      console.error('❌ [wordService.updateWord] Fetch error:', fetchError);
      return { success: false, error: 'Word not found or access denied' };
    }

    console.log('✅ [wordService.updateWord] Word found:', {
      id: wordData.id,
      owner_id: wordData.owner_id,
      language_id: wordData.language_id
    });

    // Build update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.word !== undefined) updateData.word = updates.word;
    if (updates.translation !== undefined) updateData.translation = updates.translation;
    if (updates.partOfSpeech !== undefined) updateData.part_of_speech = updates.partOfSpeech;
    if (updates.pronunciation !== undefined) updateData.pronunciation = updates.pronunciation || null;
    if (updates.etymologyNote !== undefined) updateData.etymology = updates.etymologyNote || null;
    if (updates.examples !== undefined) updateData.examples = updates.examples || [];

    console.log('📤 [wordService.updateWord] Sending to Supabase:', {
      wordId,
      updateData,
      updateFields: Object.keys(updateData)
    });

    const { data, error } = await supabase
      .from('words')
      .update(updateData)
      .eq('id', wordId)
      .select('*')
      .single();

    console.log('📥 [wordService.updateWord] Supabase response:', {
      status: error ? 'ERROR' : 'SUCCESS',
      data,
      error: error ? {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint
      } : null
    });

    if (error) {
      console.error('❌ [wordService.updateWord] Update FAILED:', error);
      throw error;
    }

    if (!data) {
      console.error('❌ [wordService.updateWord] Update returned no data');
      throw new Error('Update succeeded but returned empty response');
    }

    console.log('✅ [wordService.updateWord] Word updated successfully:', {
      id: data.id,
      word: data.word,
      translation: data.translation,
      updated_at: data.updated_at
    });

    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to update word';
    let details = '';
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      if (supabaseErr.code) details += `[${supabaseErr.code}] `;
      if (supabaseErr.details) details += supabaseErr.details;
      if (supabaseErr.hint) details += ` HINT: ${supabaseErr.hint}`;
    }
    
    const fullMessage = details ? `${message} - ${details}` : message;
    console.error('❌ [wordService.updateWord] Full error:', {
      message,
      details,
      fullMessage,
      originalError: err
    });
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
    console.log('🗑️ [wordService.deleteWord] Deleting word:', wordId, 'from language:', languageId);

    // First, verify the word exists and belongs to current user
    const { data: wordData, error: fetchError } = await supabase
      .from('words')
      .select('id, owner_id, language_id, word')
      .eq('id', wordId)
      .single();

    if (fetchError) {
      console.error('❌ [wordService.deleteWord] Fetch error:', fetchError);
      return { success: false, error: 'Word not found or access denied' };
    }

    console.log('✅ [wordService.deleteWord] Word found:', {
      id: wordData.id,
      word: wordData.word,
      owner_id: wordData.owner_id,
      language_id: wordData.language_id
    });

    const { data, error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)
      .select('id')
      .single();

    console.log('📥 [wordService.deleteWord] Supabase response:', {
      status: error ? 'ERROR' : 'SUCCESS',
      data,
      error: error ? {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint
      } : null
    });

    if (error) {
      console.error('❌ [wordService.deleteWord] Delete FAILED:', error);
      throw error;
    }

    console.log('✅ [wordService.deleteWord] Word deleted successfully:', wordData.word);

    // Update language stats to reflect removed word
    console.log('📊 [wordService.deleteWord] Updating language stats...');
    const statsResult = await updateLanguageStats(languageId);
    if (statsResult.error) {
      console.warn('⚠️  [wordService.deleteWord] Stats update failed (non-critical):', statsResult.error);
    } else {
      console.log('✅ [wordService.deleteWord] Language stats updated');
    }

    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to delete word';
    let details = '';
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      if (supabaseErr.code) details += `[${supabaseErr.code}] `;
      if (supabaseErr.details) details += supabaseErr.details;
      if (supabaseErr.hint) details += ` HINT: ${supabaseErr.hint}`;
    }
    
    const fullMessage = details ? `${message} - ${details}` : message;
    console.error('❌ [wordService.deleteWord] Full error:', {
      message,
      details,
      fullMessage,
      originalError: err
    });
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
