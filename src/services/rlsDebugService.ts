/**
 * RLS DEBUGGING UTILITIES
 * 
 * These functions help debug RLS policy issues with UPDATE + SELECT
 */

import { supabase } from './supabaseClient';

/**
 * Populate spec columns with test data
 */
export const populateTestSpecs = async (languageId: string) => {
  console.log('\n🔍 [RLS DEBUG] Populating test spec data...');
  
  const { data, error } = await supabase
    .from('languages')
    .update({
      alphabet_script: 'Latin',
      writing_direction: 'ltr',
      word_order: 'SVO',
      depth_level: 'realistic',
      case_sensitive: true,
      vowel_count: 5,
      consonant_count: 21,
      updated_at: new Date().toISOString(),
    })
    .eq('id', languageId)
    .select('id, alphabet_script, writing_direction, word_order, depth_level, case_sensitive, vowel_count, consonant_count')
    .single();

  if (error) {
    console.error('❌ Failed to populate specs:', error.code, error.message);
    
    // Try refetch if PGRST204
    if (error.code === 'PGRST204') {
      console.log('Attempting refetch after PGRST204...');
      const { data: refetchData, error: refetchError } = await supabase
        .from('languages')
        .select('id, alphabet_script, writing_direction, word_order, depth_level, case_sensitive, vowel_count, consonant_count')
        .eq('id', languageId)
        .single();

      if (refetchError) {
        console.error('❌ Refetch failed:', refetchError.message);
        return { success: false, error: refetchError };
      }

      console.log('✅ Specs populated and refetched:', refetchData);
      return { success: true, data: refetchData };
    }

    return { success: false, error };
  }

  console.log('✅ Specs populated successfully:', data);
  return { success: true, data };
};

/**
 * Test whether the current user can SELECT a language they own
 */
export const testRLSSelect = async (languageId: string) => {
  console.log('\n🔍 [RLS DEBUG] Testing SELECT access...');
  
  const { data, error } = await supabase
    .from('languages')
    .select('id, name, owner_id, alphabet_script, writing_direction')
    .eq('id', languageId)
    .single();

  if (error) {
    console.error('❌ SELECT failed:', error.code, error.message);
    return { success: false, error };
  }

  console.log('✅ SELECT succeeded. Data:', data);
  return { success: true, data };
};

/**
 * Test whether the current user can UPDATE a language they own
 */
export const testRLSUpdate = async (languageId: string) => {
  console.log('\n🔍 [RLS DEBUG] Testing UPDATE access...');
  
  const timestamp = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('languages')
    .update({
      description: `RLS test update at ${timestamp}`,
      updated_at: timestamp,
    })
    .eq('id', languageId)
    .select('id, name, description, updated_at')
    .single();

  if (error) {
    console.error('❌ UPDATE failed:', error.code, error.message);
    return { success: false, error };
  }

  console.log('✅ UPDATE succeeded. Updated data:', data);
  return { success: true, data };
};

/**
 * Fetch raw database row to see what columns actually have values
 */
export const inspectDatabaseRow = async (languageId: string) => {
  console.log('\n🔍 [RLS DEBUG] Inspecting raw database row...');
  
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (error) {
    console.error('❌ Query failed:', error);
    return { success: false, error };
  }

  if (!data) {
    console.error('❌ No data returned');
    return { success: false };
  }

  // Print each column and its value
  console.log('Row data:');
  Object.entries(data).forEach(([key, value]) => {
    const displayValue = value === null ? 'NULL ⚠️' : value === undefined ? 'UNDEFINED ⚠️' : value;
    console.log(`  ${key}: ${displayValue}`);
  });

  // Specifically check spec columns
  console.log('\nSpec columns:');
  const specColumns = [
    'alphabet_script',
    'writing_direction',
    'word_order',
    'depth_level',
    'case_sensitive',
    'vowel_count',
    'consonant_count',
  ];
  
  specColumns.forEach(col => {
    const value = (data as any)[col];
    console.log(`  ${col}: ${value === null ? 'NULL ⚠️' : value === undefined ? 'UNDEFINED ⚠️' : value}`);
  });

  return { success: true, data };
};

/**
 * Test UPDATE + SELECT workflow that mimics what updateLanguage() does
 */
export const testUpdateSelectWorkflow = async (languageId: string) => {
  console.log('\n🔍 [RLS DEBUG] Testing UPDATE + SELECT workflow...');
  
  const testDescription = `Workflow test at ${new Date().toISOString()}`;
  
  // Step 1: Try UPDATE with SELECT
  console.log('\n  Step 1: Attempting UPDATE ... SELECT...');
  const { data: updateData, error: updateError } = await supabase
    .from('languages')
    .update({
      description: testDescription,
      updated_at: new Date().toISOString(),
    })
    .eq('id', languageId)
    .select('*')
    .single();

  if (updateError) {
    console.error('  ❌ UPDATE ... SELECT failed:', updateError.code, updateError.message);
    
    // Step 2: If PGRST204, try separate SELECT
    if (updateError.code === 'PGRST204') {
      console.log('\n  Step 2: PGRST204 detected, trying separate SELECT...');
      
      const { data: selectData, error: selectError } = await supabase
        .from('languages')
        .select('*')
        .eq('id', languageId)
        .single();

      if (selectError) {
        console.error('  ❌ Separate SELECT failed:', selectError.message);
        return { success: false, error: selectError };
      }

      console.log('  ✅ Separate SELECT succeeded');
      return { success: true, data: selectData, workaround: 'Used separate SELECT after UPDATE' };
    }

    return { success: false, error: updateError };
  }

  console.log('  ✅ UPDATE ... SELECT succeeded');
  return { success: true, data: updateData };
};

/**
 * Comprehensive RLS test suite
 */
export const runComprehensiveRLSTest = async (languageId: string) => {
  console.log('\n========================================');
  console.log('🔐 COMPREHENSIVE RLS TEST SUITE');
  console.log('========================================');

  const results = {
    select: await testRLSSelect(languageId),
    update: await testRLSUpdate(languageId),
    inspect: await inspectDatabaseRow(languageId),
    workflow: await testUpdateSelectWorkflow(languageId),
  };

  console.log('\n========================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================================');
  
  console.log(`SELECT access: ${results.select.success ? '✅ OK' : '❌ FAILED'}`);
  console.log(`UPDATE access: ${results.update.success ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Data inspection: ${results.inspect.success ? '✅ OK' : '❌ FAILED'}`);
  console.log(`UPDATE+SELECT workflow: ${results.workflow.success ? '✅ OK' : '❌ FAILED'}`);
  
  if (results.workflow.workaround) {
    console.log(`  Workaround: ${results.workflow.workaround}`);
  }

  return results;
};
