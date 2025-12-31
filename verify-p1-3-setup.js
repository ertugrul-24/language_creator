#!/usr/bin/env node

/**
 * P1.3 Setup Verification Script
 * 
 * Helps verify all prerequisites for Phase 1.3 testing are met
 * Run: node verify-p1-3-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n===========================================');
console.log('Phase 1.3 Setup Verification');
console.log('===========================================\n');

let passed = 0;
let failed = 0;

// Helper function
function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// Check 1: .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);
check(
  '.env.local file exists',
  envExists,
  envExists ? 'Found: ' + envPath : 'Missing: Create .env.local with Supabase credentials'
);

// Check 2: Environment variables
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  check(
    'VITE_SUPABASE_URL configured',
    hasUrl,
    hasUrl ? 'Found in .env.local' : 'Add: VITE_SUPABASE_URL=https://xxx.supabase.co'
  );
  
  check(
    'VITE_SUPABASE_ANON_KEY configured',
    hasKey,
    hasKey ? 'Found in .env.local' : 'Add: VITE_SUPABASE_ANON_KEY=your-key'
  );
}

// Check 3: Key source files exist
const files = [
  'src/services/supabaseClient.ts',
  'src/services/languageService.ts',
  'src/pages/NewLanguagePage.tsx',
  'src/components/LanguageSpecsForm.tsx',
  'src/utils/specsValidation.ts',
];

console.log('\n📁 Key Source Files:');
files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(file, exists);
});

// Check 4: Database files exist
const dbFiles = [
  'sql/supabase_schema.sql',
  'sql/supabase_rls_policies.sql',
];

console.log('\n🗄️  Database Files:');
dbFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(file, exists);
});

// Check 5: package.json has @supabase/supabase-js
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  const hasSupabase = packageContent.includes('@supabase/supabase-js');
  check(
    '@supabase/supabase-js dependency installed',
    hasSupabase,
    hasSupabase ? 'Ready to use' : 'Run: npm install @supabase/supabase-js'
  );
}

// Check 6: Documentation files exist
const docFiles = [
  'docs/P1.3_IMPLEMENTATION_GUIDE.md',
  'docs/P1_3_TESTING_CHECKLIST.md',
  'docs/DEPLOYMENT_PATHS.md',
];

console.log('\n📖 Documentation:');
docFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(file, exists);
});

// Summary
console.log('\n===========================================');
console.log('Summary');
console.log('===========================================\n');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}\n`);

if (failed === 0) {
  console.log('🎉 All checks passed! Ready for Phase 1.3 testing.\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:5173');
  console.log('3. Login with test account');
  console.log('4. Navigate to: Create Language');
  console.log('5. Follow: docs/P1_3_TESTING_CHECKLIST.md\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the issues above before testing.\n');
  process.exit(1);
}
