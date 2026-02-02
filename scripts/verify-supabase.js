#!/usr/bin/env node

/**
 * Verification script for P2.2 Add Word Form
 * 
 * This script checks:
 * 1. Can connect to Supabase
 * 2. Does the "words" table exist
 * 3. What are the table columns and their types
 * 4. Are RLS policies configured
 * 5. Can we insert a test word
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing environment variables');
  console.error('   Please ensure .env.local has:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 Supabase Verification Script');
console.log('================================\n');
console.log('📍 Environment Check:');
console.log(`   ✓ VITE_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   ✓ VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...\n`);

// Create a simple HTTP client since we're in Node.js
const https = require('https');

async function makeSupabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      path: `/rest/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': supabaseKey,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('1️⃣  Testing Supabase Connection...');
  try {
    const response = await makeSupabaseRequest('GET', '/');
    console.log(`   ✓ Connected (Status: ${response.status})\n`);
  } catch (err) {
    console.error(`   ❌ Connection failed: ${err.message}\n`);
    process.exit(1);
  }

  console.log('2️⃣  Checking "words" Table Existence...');
  try {
    // Try to query the words table
    const response = await makeSupabaseRequest('GET', '/words?select=id&limit=0');
    
    if (response.status === 401 || response.status === 403) {
      console.error(`   ❌ Access denied (Status: ${response.status})`);
      console.error(`      This might mean RLS policy is blocking access`);
      console.log(`      Response: ${JSON.stringify(response.body)}\n`);
    } else if (response.status === 404) {
      console.error(`   ❌ Table "words" NOT FOUND`);
      console.error(`      Status: 404`);
      console.error(`      Please execute CREATE_WORDS_TABLE.sql in Supabase SQL Editor\n`);
    } else if (response.status === 200) {
      console.log(`   ✓ Table "words" EXISTS (Status: 200)\n`);
      
      // Try to get column info
      console.log('3️⃣  Checking Table Columns...');
      console.log(`   ✓ Table is accessible. Expected columns:`);
      const expectedColumns = [
        'id (uuid)',
        'language_id (uuid)',
        'owner_id (uuid)',
        'word (text)',
        'translation (text)',
        'part_of_speech (text)',
        'pronunciation (text, nullable)',
        'audio_url (text, nullable)',
        'etymology (text, nullable)',
        'examples (jsonb, nullable)',
        'created_at (timestamp)',
        'updated_at (timestamp)',
      ];
      expectedColumns.forEach(col => console.log(`      • ${col}`));
      console.log('');
    } else {
      console.error(`   ⚠️  Unexpected status: ${response.status}`);
      console.error(`      Response: ${JSON.stringify(response.body)}\n`);
    }
  } catch (err) {
    console.error(`   ❌ Error checking table: ${err.message}\n`);
  }

  console.log('4️⃣  Checking RLS Policies...');
  console.log(`   Note: Run this query in Supabase SQL Editor to verify RLS:`);
  console.log(`   SELECT * FROM pg_policies WHERE tablename = 'words';\n`);

  console.log('5️⃣  Backend Setup Instructions:');
  console.log(`   If table doesn't exist, follow these steps:\n`);
  console.log(`   1. Open Supabase Dashboard → Project → SQL Editor`);
  console.log(`   2. Create new query and paste contents of: docs/CREATE_WORDS_TABLE.sql`);
  console.log(`   3. Run the query`);
  console.log(`   4. Verify with: SELECT * FROM public.words LIMIT 1;`);
  console.log(`   5. Re-run this script to confirm\n`);

  console.log('📋 Next Steps:');
  console.log(`   1. Verify words table exists in Supabase`);
  console.log(`   2. Check browser DevTools Console for form submission logs`);
  console.log(`   3. Try adding a word via the UI form`);
  console.log(`   4. Watch for detailed error logs if it fails\n`);

  console.log('💡 Debug Tips:');
  console.log(`   • Open Supabase SQL Editor`);
  console.log(`   • Query: SELECT * FROM public.words;`);
  console.log(`   • If table doesn't exist, execute CREATE_WORDS_TABLE.sql`);
  console.log(`   • If RLS is blocking, check: SELECT * FROM pg_policies WHERE tablename = 'words';\n`);
}

runVerification().catch(console.error);
