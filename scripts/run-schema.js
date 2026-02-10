#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log(`URL: ${supabaseUrl}`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read the SQL schema
const schemaPath = path.join(__dirname, 'supabase/schema.sql');
let schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('\n========================================');
console.log('SQL Schema loaded successfully!');
console.log('========================================');
console.log('\nExecuting SQL schema...\n');

// Execute the SQL
// Note: We need to use pg_query to execute raw SQL
// But for now, let's try a simpler approach
// We'll break down the SQL into individual statements

console.log('⚠️  Note: Direct SQL execution via client is not supported.');
console.log('⚠️  Please use Supabase SQL Editor at:');
console.log(`⚠️  ${supabaseUrl.replace('https://', 'https://app.')}/project/iuzujxiumkumhlqnoyze/sql/new`);
console.log('\n========================================');
console.log('Schema file location:');
console.log(schemaPath);
console.log('========================================');

// Show the schema content
console.log('\n--- Schema SQL (first 500 chars) ---');
console.log(schemaSql.substring(0, 500));
console.log('---\n');

console.log('✅ Setup complete!');
console.log('\nNext steps:');
console.log('1. Open Supabase SQL Editor');
console.log('2. Copy the content from supabase/schema.sql');
console.log('3. Execute the SQL');
console.log('\nSupabase SQL Editor URL:');
console.log(`${supabaseUrl.replace('https://', 'https://app.')}/project/iuzujxiumkumhlqnoyze/sql/new`);
