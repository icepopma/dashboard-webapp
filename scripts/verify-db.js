#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Direct configuration (for testing)
const supabaseUrl = 'https://iuzujxiumkumhlqnoyze.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1enVqeGl1bWt1bWhscW5veXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTkzNDIsImV4cCI6MjA4NTk3NTM0Mn0.K3g2JlO4Hhdou6K4ZON9xvqS0b2rD_adaIzDsKqCtwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('========================================');
  console.log('Verifying Supabase Tables');
  console.log('========================================\n');

  try {
    // Test 1: Query ideas table
    console.log('1. Testing "ideas" table...');
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .limit(1);

    if (ideasError) {
      console.error('   ❌ Error:', ideasError.message);
    } else {
      console.log('   ✅ Success! Sample data:', ideas);
      console.log('   📊 Columns:', ideas.length > 0 ? Object.keys(ideas[0]) : 'No data yet');
    }

    // Test 2: Query tasks table
    console.log('\n2. Testing "tasks" table...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (tasksError) {
      console.error('   ❌ Error:', tasksError.message);
    } else {
      console.log('   ✅ Success! Sample data:', tasks);
      console.log('   📊 Columns:', tasks.length > 0 ? Object.keys(tasks[0]) : 'No data yet');
    }

    // Test 3: Check all tables count
    console.log('\n3. Checking table counts...');
    const { count: ideasCount } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true });

    const { count: tasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    const { count: ideaFilesCount } = await supabase
      .from('idea_files')
      .select('*', { count: 'exact', head: true });

    const { count: progressLogsCount } = await supabase
      .from('progress_logs')
      .select('*', { count: 'exact', head: true });

    console.log('   ideas:', ideasCount || 0, 'rows');
    console.log('   idea_files:', ideaFilesCount || 0, 'rows');
    console.log('   tasks:', tasksCount || 0, 'rows');
    console.log('   progress_logs:', progressLogsCount || 0, 'rows');

    console.log('\n========================================');
    console.log('✅ Database verification complete!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyTables();
