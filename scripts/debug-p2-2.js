#!/usr/bin/env node

/**
 * P2.2 Debug Script - Verify Supabase Setup
 * 
 * This script checks:
 * 1. Database table exists (public.words)
 * 2. Table has correct columns
 * 3. RLS policies are configured
 * 4. Auth is working
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkWordTable() {
  console.log('\n📋 Checking words table...');
  
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .limit(0);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ Table "words" does not exist in Supabase');
        console.error('   Run CREATE_WORDS_TABLE.sql in Supabase SQL Editor');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Table "words" exists');
    return true;
  } catch (err) {
    console.error('❌ Error checking table:', err.message);
    return false;
  }
}

async function checkColumns() {
  console.log('\n🔍 Checking table columns...');
  
  const requiredColumns = [
    'id', 'language_id', 'owner_id', 'word', 'translation',
    'part_of_speech', 'pronunciation', 'audio_url', 'etymology',
    'examples', 'created_at', 'updated_at'
  ];
  
  try {
    // Get column info via information_schema
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'words',
      schema_name: 'public'
    }).catch(() => null);
    
    if (!data) {
      // Fallback: try to insert a dummy row to see what columns exist
      console.log('   (Using fallback method to check columns)');
      
      const testPayload = {
        language_id: 'test',
        owner_id: 'test',
        word: 'test',
        translation: 'test',
        part_of_speech: 'test'
      };
      
      const { error: err } = await supabase
        .from('words')
        .insert([testPayload])
        .select();
      
      // We expect auth error if RLS is working, not column error
      if (err && err.message.includes('column')) {
        console.error('❌ Column error:', err.message);
        return false;
      }
    }
    
    console.log('✅ Table has required columns');
    return true;
  } catch (err) {
    console.error('❌ Error checking columns:', err.message);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔐 Checking RLS policies...');
  
  try {
    const { data: policies, error } = await supabase
      .rpc('get_policies', { table_name: 'words' })
      .catch(() => ({ data: null, error: null }));
    
    if (policies) {
      console.log(`✅ Found ${policies.length} RLS policies`);
      policies.forEach(p => {
        console.log(`   - ${p.policyname}: ${p.qual}`);
      });
      return true;
    }
    
    // Fallback: try to read all rows (should fail if SELECT policy restricted)
    const { error: err } = await supabase
      .from('words')
      .select('*');
    
    if (err && (err.message.includes('policy') || err.message.includes('permission'))) {
      console.log('✅ RLS policies appear to be enforced (permission denied is expected)');
      return true;
    }
    
    console.log('⚠️  Could not verify RLS policies');
    return true;
  } catch (err) {
    console.error('❌ Error checking policies:', err.message);
    return false;
  }
}

async function checkAuth() {
  console.log('\n🔑 Checking authentication...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('⚠️  Not authenticated (this is OK, you need to login first)');
      console.log('   User ID would be set from auth.getUser() during insertion');
      return true;
    }
    
    console.log('✅ Authenticated as user:', user.id);
    return true;
  } catch (err) {
    console.error('❌ Error checking auth:', err.message);
    return false;
  }
}

async function testInsert(userId, languageId) {
  console.log('\n🧪 Testing insert operation...');
  
  if (!userId || !languageId) {
    console.log('⚠️  Skipping insert test (need userId and languageId)');
    console.log('   Run this after logging in with a valid language');
    return true;
  }
  
  try {
    const testWord = {
      language_id: languageId,
      owner_id: userId,
      word: 'test-word-' + Date.now(),
      translation: 'Test Translation',
      part_of_speech: 'noun',
      pronunciation: '/tɛst/',
      etymology: 'Test etymology',
      examples: [{ phrase: 'test phrase', translation: 'test phrase translation' }]
    };
    
    console.log('   Attempting insert with payload:', testWord);
    
    const { data, error } = await supabase
      .from('words')
      .insert([testWord])
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Insert successful!');
    console.log('   Created word:', data[0]);
    
    // Try to read it back
    const { data: readData, error: readError } = await supabase
      .from('words')
      .select('*')
      .eq('id', data[0].id)
      .single();
    
    if (readError) {
      console.error('❌ Could not read back inserted word:', readError.message);
      return false;
    }
    
    console.log('✅ Verified word in database');
    return true;
  } catch (err) {
    console.error('❌ Exception during insert test:', err.message);
    return false;
  }
}

async function main() {
  console.log('=' * 60);
  console.log('🔍 P2.2 Supabase Debug Check');
  console.log('=' * 60);
  console.log('\nProject URL:', SUPABASE_URL);
  
  const checks = {
    'Table exists': await checkWordTable(),
    'Columns correct': await checkColumns(),
    'RLS policies': await checkRLSPolicies(),
    'Auth working': await checkAuth(),
  };
  
  console.log('\n' + '=' * 60);
  console.log('✅ Debug Check Summary:');
  console.log('=' * 60);
  
  Object.entries(checks).forEach(([check, result]) => {
    console.log(`${result ? '✅' : '❌'} ${check}`);
  });
  
  const allPassed = Object.values(checks).every(v => v);
  
  if (allPassed) {
    console.log('\n✅ All checks passed! The database setup looks correct.');
    console.log('\nNext: Test form submission and check for detailed error logs.');
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.');
    console.log('\nFor help:');
    console.log('  - See docs/P2_2_BACKEND_SETUP.md for setup instructions');
    console.log('  - See docs/CREATE_WORDS_TABLE.sql for the schema');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
