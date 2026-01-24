import { supabase } from '@/services/supabaseClient';

interface DictionaryWord {
  id: string;
  word: string;
  translation: string;
  part_of_speech: string;
  pronunciation?: string;
  added_by?: string;
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
    let query = supabase
      .from('dictionaries')
      .select('*', { count: 'exact' })
      .eq('language_id', languageId)
      .eq('approval_status', 'approved')
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

    if (error) throw error;

    return {
      words: data || [],
      total: count || 0,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch words';
    console.error('❌ Error fetching words:', message);
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
    console.log('[wordService] Adding word:', input.word);

    const { data, error } = await supabase
      .from('dictionaries')
      .insert([
        {
          language_id: input.languageId,
          word: input.word,
          translation: input.translation,
          part_of_speech: input.partOfSpeech,
          pronunciation: input.pronunciation || null,
          etymology_note: input.etymologyNote || null,
          examples: input.examples || [],
          added_by: input.userEmail,
          approval_status: 'approved',
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    console.log('✅ Word added:', data.id);
    return { success: true, wordId: data.id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add word';
    console.error('❌ Error adding word:', message);
    return { success: false, error: message };
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
    console.log('[wordService] Updating word:', wordId);

    const updateData: Record<string, any> = {};
    if (updates.word) updateData.word = updates.word;
    if (updates.translation) updateData.translation = updates.translation;
    if (updates.partOfSpeech) updateData.part_of_speech = updates.partOfSpeech;
    if (updates.pronunciation) updateData.pronunciation = updates.pronunciation;
    if (updates.etymologyNote) updateData.etymology_note = updates.etymologyNote;
    if (updates.examples) updateData.examples = updates.examples;

    const { error } = await supabase
      .from('dictionaries')
      .update(updateData)
      .eq('id', wordId);

    if (error) throw error;

    console.log('✅ Word updated:', wordId);
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update word';
    console.error('❌ Error updating word:', message);
    return { success: false, error: message };
  }
};

/**
 * Delete a word from the dictionary
 */
export const deleteWord = async (wordId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('[wordService] Deleting word:', wordId);

    const { error } = await supabase
      .from('dictionaries')
      .delete()
      .eq('id', wordId);

    if (error) throw error;

    console.log('✅ Word deleted:', wordId);
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete word';
    console.error('❌ Error deleting word:', message);
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
    const { data, error } = await supabase
      .from('dictionaries')
      .select('part_of_speech', { count: 'exact' })
      .eq('language_id', languageId)
      .eq('approval_status', 'approved');

    if (error) throw error;

    const uniquePOS = [...new Set(data?.map((d) => d.part_of_speech) || [])].sort();
    return { pos: uniquePOS, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch parts of speech';
    console.error('❌ Error fetching parts of speech:', message);
    return { pos: [], error: message };
  }
};
