/**
 * DEBUG SERVICE FOR P1.4 DATA ISSUES
 * 
 * This service tests the complete data flow without UI abstractions.
 * Use this to verify:
 * 1. Can we SELECT language data?
 * 2. Are specs fields populated in the database?
 * 3. Can we UPDATE the language?
 * 4. Are RLS policies allowing operations?
 * 5. Is data mapping working correctly?
 */

import { supabase } from './supabaseClient';

export interface DebugResult {
  step: string;
  success: boolean;
  data?: any;
  error?: {
    code?: string;
    message?: string;
    hint?: string;
    details?: string;
  };
  notes?: string;
}

const results: DebugResult[] = [];

const log = (step: string, success: boolean, data?: any, error?: any, notes?: string) => {
  results.push({
    step,
    success,
    data,
    error: error
      ? {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details,
        }
      : undefined,
    notes,
  });
  
  console.log(`\n📋 STEP: ${step}`);
  console.log(`   Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (data) console.log('   Data:', data);
  if (error) {
    console.log(`   Error Code: ${error.code}`);
    console.log(`   Error: ${error.message}`);
    if (error.hint) console.log(`   Hint: ${error.hint}`);
    if (error.details) console.log(`   Details: ${error.details}`);
  }
  if (notes) console.log(`   Notes: ${notes}`);
};

export const debugLanguageDataFlow = async (languageId: string) => {
  console.log('========================================');
  console.log('🔍 DEBUG: Language Data Flow Test');
  console.log('========================================');
  console.log(`Testing language ID: ${languageId}\n`);

  results.length = 0; // Clear results

  try {
    // STEP 1: Get current user
    console.log('STEP 1: Getting current user...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      log('Get Current User', false, undefined, userError, 'Not authenticated');
      return results;
    }
    const userId = userData.user.id;
    log('Get Current User', true, { userId, email: userData.user.email }, undefined);

    // STEP 2: Check if user exists in public.users table
    console.log('\nSTEP 2: Checking if user exists in public.users...');
    const { data: userRecord, error: userCheckError } = await supabase
      .from('users')
      .select('id, auth_id, email, display_name')
      .eq('auth_id', userId)
      .single();

    if (userCheckError) {
      log('Check User in public.users', false, undefined, userCheckError, 'User might not exist in public.users table');
    } else {
      log('Check User in public.users', true, userRecord);
    }

    // STEP 3: SELECT language with ALL columns (including specs)
    console.log('\nSTEP 3: SELECT language with all columns...');
    const { data: langData, error: langError } = await supabase
      .from('languages')
      .select('*')
      .eq('id', languageId)
      .single();

    if (langError) {
      log('SELECT Language (All Columns)', false, undefined, langError, 'Cannot fetch language - check RLS');
      return results;
    }

    log('SELECT Language (All Columns)', true, langData, undefined, `Fetched language: ${langData.name}`);

    // STEP 4: Verify spec columns are populated
    console.log('\nSTEP 4: Checking if spec columns have values...');
    const specFields = [
      'alphabet_script',
      'writing_direction',
      'word_order',
      'depth_level',
      'case_sensitive',
      'vowel_count',
      'consonant_count',
    ];

    const specStatus = specFields.reduce(
      (acc, field) => {
        const value = langData[field];
        acc[field] = { value, hasValue: value !== null && value !== undefined };
        return acc;
      },
      {} as Record<string, { value: any; hasValue: boolean }>
    );

    log(
      'Spec Fields Check',
      true,
      specStatus,
      undefined,
      `${Object.values(specStatus).filter(s => s.hasValue).length}/${specFields.length} spec fields populated`
    );

    // STEP 5: Attempt UPDATE with one simple change
    console.log('\nSTEP 5: Attempting UPDATE (change description)...');
    const newDescription = `Test update at ${new Date().toISOString()}`;
    const { data: updateData, error: updateError } = await supabase
      .from('languages')
      .update({
        description: newDescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', languageId)
      .select('*')
      .single();

    if (updateError) {
      log('UPDATE Language', false, undefined, updateError, 'UPDATE failed - check RLS permissions and ownership');
    } else {
      log('UPDATE Language', true, updateData, undefined, 'UPDATE succeeded');

      // STEP 6: Verify UPDATE persisted
      console.log('\nSTEP 6: Verifying UPDATE persisted...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('languages')
        .select('description, updated_at')
        .eq('id', languageId)
        .single();

      if (verifyError) {
        log('Verify UPDATE', false, undefined, verifyError);
      } else {
        const persisted = verifyData.description === newDescription;
        log(
          'Verify UPDATE',
          persisted,
          verifyData,
          undefined,
          `UPDATE ${persisted ? 'persisted correctly' : 'NOT persisted - data mismatch'}`
        );
      }
    }

    // STEP 7: Check RLS context
    console.log('\nSTEP 7: Checking RLS context...');
    const { data: rls, error: rlsError } = await supabase.rpc('check_rls_context', {
      language_id: languageId,
    }).single();

    if (rlsError && rlsError.code !== 'PGRST201') {
      // Ignore if function doesn't exist (PGRST201)
      log('Check RLS Context', false, undefined, rlsError, 'RLS debug function not available');
    } else if (rls) {
      log('Check RLS Context', true, rls);
    }

    // STEP 8: Map data and check mapping function
    console.log('\nSTEP 8: Testing data mapping...');
    try {
      // Import at runtime to avoid circular dependencies
      const module = await import('./languageService');
      const mapFunc = (module as any).mapDatabaseLanguageToLanguage;
      
      if (!mapFunc) {
        log(
          'Map Database to Language Type',
          false,
          undefined,
          undefined,
          'Mapping function not exported from languageService'
        );
      } else {
        const mappedLanguage = mapFunc(langData);
        log('Map Database to Language Type', true, mappedLanguage, undefined, 'Mapping function works');
      }
    } catch (mappingError) {
      log(
        'Map Database to Language Type',
        false,
        undefined,
        mappingError as any,
        'Mapping function import failed'
      );
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    log('General Test', false, undefined, err as any, 'Unexpected error occurred');
  }

  // FINAL SUMMARY
  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log('\nDetailed Results:');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.step}: ${r.success ? '✅' : '❌'}`);
  });

  return results;
};

/**
 * SPECIFIC TEST: Can owner UPDATE their language?
 */
export const testOwnerUpdate = async (languageId: string) => {
  console.log('\n🔐 PERMISSION TEST: Owner UPDATE');
  console.log('================================\n');

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('Not authenticated');
      return false;
    }

    // Get language owner
    const { data: lang, error: langError } = await supabase
      .from('languages')
      .select('owner_id, name')
      .eq('id', languageId)
      .single();

    if (langError) {
      console.error('Failed to fetch language:', langError);
      return false;
    }

    console.log(`Language Owner ID: ${lang.owner_id}`);
    console.log(`Current User ID: ${user.user.id}`);
    console.log(`Is Owner: ${lang.owner_id === user.user.id ? 'YES ✅' : 'NO ❌'}`);

    // Try to update
    const { error: updateError } = await supabase
      .from('languages')
      .update({ description: `Updated by owner at ${new Date().toISOString()}` })
      .eq('id', languageId);

    if (updateError) {
      console.error('❌ UPDATE FAILED');
      console.error('Error Code:', updateError.code);
      console.error('Message:', updateError.message);
      return false;
    }

    console.log('✅ UPDATE SUCCEEDED - Owner permissions working');
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};

/**
 * SPECIFIC TEST: Can collaborator UPDATE language?
 */
export const testCollaboratorUpdate = async (languageId: string) => {
  console.log('\n👥 PERMISSION TEST: Collaborator UPDATE');
  console.log('========================================\n');

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('Not authenticated');
      return false;
    }

    // Check collaborator status
    const { data: collab, error: collabError } = await supabase
      .from('language_collaborators')
      .select('user_id, role')
      .eq('language_id', languageId)
      .eq('user_id', user.user.id)
      .single();

    if (collabError && collabError.code !== 'PGRST116') {
      console.error('Failed to check collaborator status:', collabError);
      return false;
    }

    if (collabError?.code === 'PGRST116') {
      console.log('Not a collaborator on this language');
      return false;
    }

    if (!collab) {
      console.log('Collaborator record is empty');
      return false;
    }

    console.log(`Collaborator Role: ${collab.role}`);
    console.log(`Can Edit: ${collab.role === 'editor' || collab.role === 'owner' ? 'YES ✅' : 'NO ❌'}`);

    // Try to update
    const { error: updateError } = await supabase
      .from('languages')
      .update({ description: `Updated by collaborator at ${new Date().toISOString()}` })
      .eq('id', languageId);

    if (updateError) {
      console.error('❌ UPDATE FAILED');
      console.error('Error Code:', updateError.code);
      console.error('Message:', updateError.message);
      return false;
    }

    console.log('✅ UPDATE SUCCEEDED - Collaborator permissions working');
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};
