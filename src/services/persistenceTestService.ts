/**
 * DATA PERSISTENCE TEST UTILITIES
 * 
 * Use these functions in the browser console to verify updates actually persist
 */

import { supabase } from './supabaseClient';

/**
 * Manually update a language and verify persistence
 * 
 * Usage in console:
 * import { testDataPersistence } from '@/services/persistenceTestService';
 * await testDataPersistence('language-id-here', { description: 'My new description' });
 */
export const testDataPersistence = async (
  languageId: string,
  updatePayload: Record<string, any>
) => {
  console.log('\n========================================');
  console.log('🧪 DATA PERSISTENCE TEST');
  console.log('========================================\n');

  console.log('Step 1: Get current data from database');
  const { data: before, error: beforeError } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (beforeError) {
    console.error('❌ Failed to fetch:', beforeError);
    return;
  }

  console.log('Current values:');
  console.log('  name:', before.name);
  console.log('  description:', before.description);
  console.log('  visibility:', before.visibility);
  console.log('  updated_at:', before.updated_at);

  console.log('\nStep 2: Execute UPDATE with payload:');
  console.log('  Payload:', updatePayload);

  const { data: updateResult, error: updateError } = await supabase
    .from('languages')
    .update({
      ...updatePayload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', languageId)
    .select('*')
    .single();

  if (updateError) {
    console.error('❌ UPDATE failed:', updateError.code, updateError.message);
    return;
  }

  console.log('✅ UPDATE returned (before refetch):');
  console.log('  name:', updateResult.name);
  console.log('  description:', updateResult.description);
  console.log('  visibility:', updateResult.visibility);
  console.log('  updated_at:', updateResult.updated_at);

  console.log('\nStep 3: Wait 1 second and fetch again (fresh query)');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { data: after, error: afterError } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (afterError) {
    console.error('❌ Refetch failed:', afterError);
    return;
  }

  console.log('✅ Fresh query returned:');
  console.log('  name:', after.name);
  console.log('  description:', after.description);
  console.log('  visibility:', after.visibility);
  console.log('  updated_at:', after.updated_at);

  console.log('\nStep 4: Compare before and after');
  const changes: Record<string, { before: any; after: any }> = {};

  Object.keys(updatePayload).forEach(key => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes[key] = {
        before: before[key],
        after: after[key],
      };
    }
  });

  if (Object.keys(changes).length === 0) {
    console.warn('\n❌ NO CHANGES DETECTED!');
    console.log('The UPDATE executed without error, but the database was not modified!');
    console.log('\nThis means one of:');
    console.log('1. RLS policy blocked the UPDATE');
    console.log('2. The update payload had wrong column names');
    console.log('3. The .eq() filter did not match any rows');
  } else {
    console.log('\n✅ CHANGES PERSISTED:');
    Object.entries(changes).forEach(([key, { before: b, after: a }]) => {
      console.log(`  ${key}: "${b}" → "${a}"`);
    });
  }

  console.log('\n========================================\n');
  return { before, updatePayload, after, changes };
};

/**
 * Check if RLS is blocking updates
 * 
 * Usage:
 * await checkRLSBlockingUpdate('language-id-here');
 */
export const checkRLSBlockingUpdate = async (languageId: string) => {
  console.log('\n🔐 Checking if RLS blocks UPDATE...\n');

  const timestamp = new Date().toISOString();

  // Try a simple UPDATE
  const { data, error } = await supabase
    .from('languages')
    .update({ updated_at: timestamp })
    .eq('id', languageId);

  if (error) {
    console.error('❌ UPDATE failed with error:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    console.log('\nThis is likely an RLS issue');
    return false;
  }

  console.log('✅ UPDATE succeeded (RLS not blocking)');

  // Verify the change persisted
  const { data: check } = await supabase
    .from('languages')
    .select('updated_at')
    .eq('id', languageId)
    .single();

  if (check?.updated_at === timestamp) {
    console.log('✅ Change persisted in database');
    return true;
  } else {
    console.error('❌ UPDATE executed but change did not persist!');
    console.log('  Expected updated_at:', timestamp);
    console.log('  Actual updated_at:', check?.updated_at);
    return false;
  }
};

/**
 * Directly inspect the raw database row
 * 
 * Usage:
 * await inspectRawRow('language-id-here');
 */
export const inspectRawRow = async (languageId: string) => {
  console.log('\n🔍 Raw Database Row Inspection\n');

  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (error) {
    console.error('❌ Query failed:', error);
    return null;
  }

  console.log('All columns:');
  Object.entries(data).forEach(([key, value]) => {
    const displayValue = value === null ? 'NULL' : value === undefined ? 'UNDEFINED' : value;
    console.log(`  ${key}: ${displayValue}`);
  });

  return data;
};
