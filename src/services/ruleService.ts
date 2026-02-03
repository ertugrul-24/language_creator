import { supabase } from '@/services/supabaseClient';
import { updateLanguageStats } from '@/services/languageService';

interface GrammarRule {
  id: string;
  name: string;
  description: string;
  category: string;
  rule_type: string;
  pattern?: string;
  owner_id?: string;
  created_at?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
}

interface AddRuleInput {
  languageId: string;
  name: string;
  description: string;
  category: string;
  ruleType: string;
  pattern: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  userId: string;
  userEmail: string;
}

/**
 * Get all grammar rules for a language with optional filtering
 */
export const getRules = async (
  languageId: string,
  options?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ rules: GrammarRule[]; total: number; error: string | null }> => {
  try {
    console.log('🔍 [ruleService.getRules] Fetching rules for language:', languageId);

    let query = supabase
      .from('grammar_rules')
      .select('*', { count: 'exact' })
      .eq('language_id', languageId)
      .order('created_at', { ascending: false });

    // Apply category filter
    if (options?.category) {
      query = query.eq('category', options.category);
    }

    // Apply search
    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }

    // Apply pagination
    if (options?.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [ruleService.getRules] Query error:', error);
      throw error;
    }

    console.log(`✅ [ruleService.getRules] Fetched ${data?.length || 0} rules`);
    return {
      rules: data || [],
      total: count || 0,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch rules';
    console.error('❌ [ruleService.getRules] Error:', message);
    return {
      rules: [],
      total: 0,
      error: message,
    };
  }
};

/**
 * Add a new grammar rule
 */
export const addRule = async (input: AddRuleInput): Promise<{ success: boolean; ruleId?: string; error: string | null }> => {
  try {
    console.log('📝 [ruleService.addRule] Adding rule:', input.name, 'to language:', input.languageId);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ [ruleService.addRule] Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }

    console.log('✅ [ruleService.addRule] User authenticated:', user.id);

    const payload = {
      language_id: input.languageId,
      owner_id: user.id,
      name: input.name,
      description: input.description,
      category: input.category,
      rule_type: input.ruleType,
      pattern: input.pattern || null,
      examples: input.examples || [],
    };

    console.log('📤 [ruleService.addRule] Sending payload to Supabase:', payload);

    // Validate payload
    console.log('[ruleService.addRule] Payload validation:');
    console.log('  language_id:', payload.language_id, payload.language_id ? 'OK' : 'NULL');
    console.log('  owner_id:', payload.owner_id, payload.owner_id ? 'OK' : 'NULL');
    console.log('  name:', payload.name, payload.name ? 'OK' : 'EMPTY');
    console.log('  category:', payload.category, payload.category ? 'OK' : 'EMPTY');
    console.log('  rule_type:', payload.rule_type, payload.rule_type ? 'OK' : 'EMPTY');
    console.log('  examples (count):', Array.isArray(payload.examples) ? payload.examples.length : 'NOT_ARRAY');

    const { data, error } = await supabase
      .from('grammar_rules')
      .insert([payload])
      .select('*')
      .single();

    // Log FULL Supabase response
    console.log('📥 [ruleService.addRule] Supabase response:', {
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
      console.error('❌ [ruleService.addRule] Insert error:', error.message);
      throw error;
    }

    if (!data || !data.id) {
      console.error('❌ [ruleService.addRule] Insert returned no data');
      throw new Error('Insert succeeded but returned empty response');
    }

    console.log('✅ [ruleService.addRule] Rule persisted:', data.id);

    // Update language stats
    console.log('📊 [ruleService.addRule] Updating language stats...');
    const statsResult = await updateLanguageStats(input.languageId);
    if (statsResult.error) {
      console.warn('⚠️  [ruleService.addRule] Stats update failed (non-critical):', statsResult.error);
    } else {
      console.log('✅ [ruleService.addRule] Language stats updated');
    }

    return { success: true, ruleId: data.id, error: null };
  } catch (err) {
    console.error('❌ [ruleService.addRule] Exception caught');
    
    let message = 'Failed to add rule';
    let errorDetails = '';

    // Log the raw error
    console.error('   Raw error:', err);
    console.error('   Error type:', (err as any)?.constructor?.name);

    // Extract message
    if (err instanceof Error) {
      message = err.message;
      console.error('   Error message:', message);
    }

    // Extract Supabase error details
    if (typeof err === 'object' && err !== null) {
      const supabaseErr = err as any;
      console.error('   Supabase error code:', supabaseErr.code);
      console.error('   Supabase error status:', supabaseErr.status);
      console.error('   Supabase error details:', supabaseErr.details);
      console.error('   Supabase error hint:', supabaseErr.hint);
      
      // Build user-friendly message
      if (supabaseErr.code === 'PGRST204') {
        errorDetails = `[PGRST204] Table or column not found. Verify schema: https://app.supabase.com`;
      } else if (supabaseErr.code === 'PGRST301') {
        errorDetails = `[PGRST301] JWT claims do not match RLS policy. User not authenticated or RLS policy mismatch.`;
      } else if (supabaseErr.message) {
        errorDetails = `[${supabaseErr.code || 'ERROR'}] ${supabaseErr.message}`;
        if (supabaseErr.details) errorDetails += ` | ${supabaseErr.details}`;
        if (supabaseErr.hint) errorDetails += ` | Hint: ${supabaseErr.hint}`;
      }
    }

    const fullMessage = errorDetails || message;
    console.error('❌ [ruleService.addRule] Final error to user:', fullMessage);
    
    return { success: false, error: fullMessage };
  }
};

/**
 * Update a grammar rule
 */
export const updateRule = async (
  ruleId: string,
  updates: Partial<AddRuleInput>
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('========== UPDATE RULE START ==========');
    console.log('updateRule() called with:', { ruleId, updates });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }
    console.log('Current user:', user.id);

    // Fetch rule to verify ownership
    const { data: ruleData, error: fetchError } = await supabase
      .from('grammar_rules')
      .select('id, owner_id, language_id, name')
      .eq('id', ruleId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return { success: false, error: `Rule not found: ${fetchError.message}` };
    }

    console.log('Rule found:', {
      id: ruleData.id,
      name: ruleData.name,
      owner_id: ruleData.owner_id,
      current_user: user.id,
      owner_matches: ruleData.owner_id === user.id,
    });

    if (ruleData.owner_id !== user.id) {
      console.error('Permission denied: user is not the owner');
      return { success: false, error: 'Permission denied: You can only edit your own rules' };
    }

    // Build update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.ruleType !== undefined) updatePayload.rule_type = updates.ruleType;
    if (updates.pattern !== undefined) updatePayload.pattern = updates.pattern || null;
    if (updates.examples !== undefined) updatePayload.examples = updates.examples || [];

    console.log('Update payload:', updatePayload);

    // Execute update
    const { data: updatedData, error: updateError } = await supabase
      .from('grammar_rules')
      .update(updatePayload)
      .eq('id', ruleId)
      .select('*')
      .single();

    if (updateError) {
      console.error('UPDATE FAILED:', updateError);
      throw updateError;
    }

    if (!updatedData) {
      console.error('Update returned no data');
      throw new Error('Update succeeded but returned empty response');
    }

    console.log('Update successful:', updatedData.name);
    console.log('========== UPDATE RULE SUCCESS ==========');
    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to update rule';
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
    console.error('========== UPDATE RULE FAILED ==========');
    console.error('Error:', fullMessage);
    return { success: false, error: fullMessage };
  }
};

/**
 * Delete a grammar rule
 */
export const deleteRule = async (
  ruleId: string,
  languageId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log('========== DELETE RULE START ==========');
    console.log('deleteRule() called with:', { ruleId, languageId });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'User not authenticated' };
    }
    console.log('Current user:', user.id);

    // Fetch rule to verify ownership
    const { data: ruleData, error: fetchError } = await supabase
      .from('grammar_rules')
      .select('id, owner_id, language_id, name')
      .eq('id', ruleId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return { success: false, error: `Rule not found: ${fetchError.message}` };
    }

    console.log('Rule found:', {
      id: ruleData.id,
      name: ruleData.name,
      owner_id: ruleData.owner_id,
      current_user: user.id,
      owner_matches: ruleData.owner_id === user.id,
    });

    if (ruleData.owner_id !== user.id) {
      console.error('Permission denied: user is not the owner');
      return { success: false, error: 'Permission denied: You can only delete your own rules' };
    }

    // Delete the rule
    const { error: deleteError } = await supabase
      .from('grammar_rules')
      .delete()
      .eq('id', ruleId)
      .select('id')
      .single();

    if (deleteError) {
      console.error('DELETE FAILED:', deleteError);
      throw deleteError;
    }

    console.log('Delete successful:', ruleData.name);

    // Update language stats
    console.log('Updating language stats...');
    const statsResult = await updateLanguageStats(languageId);
    if (statsResult.error) {
      console.warn('Stats update failed (non-critical):', statsResult.error);
    } else {
      console.log('Language stats updated');
    }

    console.log('========== DELETE RULE SUCCESS ==========');
    return { success: true, error: null };
  } catch (err) {
    let message = 'Failed to delete rule';
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
    console.error('========== DELETE RULE FAILED ==========');
    console.error('Error:', fullMessage);
    return { success: false, error: fullMessage };
  }
};

/**
 * Get unique categories for a language
 */
export const getRuleCategories = async (languageId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('grammar_rules')
      .select('category')
      .eq('language_id', languageId);

    if (error) throw error;
    
    // Filter unique categories
    const uniqueCategories = [...new Set(data?.map((d: any) => d.category).filter(Boolean) || [])];
    return Array.from(uniqueCategories) as string[];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};
