import { supabase } from '@/services/supabaseClient';

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

    const { data, error } = await supabase
      .from('words')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      const errorDetails = {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
        status: (error as any).status,
        fullError: error
      };
      console.error('❌ [wordService.addWord] Insert error:', errorDetails);
      throw error;
    }

    console.log('✅ [wordService.addWord] Word added successfully:', data.id);
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
 */
export const updateWord = async (
  wordId: string,
  updates: Partial<AddWordInput>
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('✏️ [wordService.updateWord] Updating word:', wordId);

    const updateData: Record<string, any> = {};
    if (updates.word) updateData.word = updates.word;
    if (updates.translation) updateData.translation = updates.translation;
    if (updates.partOfSpeech) updateData.part_of_speech = updates.partOfSpeech;
    if (updates.pronunciation) updateData.pronunciation = updates.pronunciation;
    if (updates.etymologyNote) updateData.etymology = updates.etymologyNote;
    if (updates.examples) updateData.examples = updates.examples;

    const { error } = await supabase
      .from('words')
      .update(updateData)
      .eq('id', wordId);

    if (error) {
      console.error('❌ [wordService.updateWord] Update error:', error);
      throw error;
    }

    console.log('✅ [wordService.updateWord] Word updated:', wordId);
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update word';
    console.error('❌ [wordService.updateWord] Error:', message);
    return { success: false, error: message };
  }
};

/**
 * Delete a word from the dictionary
 */
export const deleteWord = async (wordId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('🗑️ [wordService.deleteWord] Deleting word:', wordId);

    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (error) {
      console.error('❌ [wordService.deleteWord] Delete error:', error);
      throw error;
    }

    console.log('✅ [wordService.deleteWord] Word deleted:', wordId);
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete word';
    console.error('❌ [wordService.deleteWord] Error:', message);
    return { success: false, error: message };
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
