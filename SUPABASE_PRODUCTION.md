# Supabase Production Configuration Guide

## Environment Variables

### Required Environment Variables

```bash
# Supabase API URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing project
3. Go to **Project Settings** → **API**
4. Copy the following:
   - Project URL
   - anon / public key
   - service_role key (for server-side only)

## Database Schema (Production)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  local_path TEXT NOT NULL,
  has_idea_md BOOLEAN DEFAULT false,
  has_work_plan BOOLEAN DEFAULT false,
  tasks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTz DEFAULT NOW(),
  updated_at TIMESTAMptz DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_name TEXT NOT NULL REFERENCES ideas(name) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  local_path TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMptz DEFAULT NOW(),
  updated_at TIMESTAMptz DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_idea_name ON tasks(idea_name);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON ideas FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ideas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON ideas FOR UPDATE
  USING (true);

CREATE POLICY "Enable update for authenticated users" ON tasks FOR UPDATE
  USING (true);
```

## Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] RLS policies set up
- [ ] Database backup enabled
- [ ] API rate limiting configured
- [ ] SSL/TLS enabled (default in Supabase)
- [ ] Monitoring and alerts set up
- [ ] Database migration tested

## Next.js API Integration

### Client-side API (using anon key)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
```

### Server-side API (using service role key)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createIdea(idea: Partial<Idea>) {
  const { data, error } = await supabaseAdmin
    .from('ideas')
    .insert(idea)
    .select()
  return { data, error }
}
```

## Backup Strategy

- Enable **Point-in-Time Recovery** (PITR)
- Set up **Daily backups** with retention period
- Export database schema regularly
- Monitor storage usage

## Security Considerations

1. **Never commit** `.env.local` or `.env.production` to version control
2. Use **Supabase Vault** or environment variable managers for sensitive data
3. Enable **Two-Factor Authentication (2FA)** on Supabase account
4. Use **service_role key** only on server-side, never expose to client
5. Implement **rate limiting** on API endpoints
6. Set up **email alerts** for suspicious activities

## Monitoring

### Recommended Tools

- **Supabase Dashboard**: Real-time database monitoring
- **Vercel Analytics**: Application performance monitoring
- **Sentry**: Error tracking (optional)
- **LogRocket**: Session replay (optional)

### Key Metrics to Monitor

- API response time
- Database query performance
- Error rates (4xx, 5xx)
- User engagement metrics
- Storage usage

---

*Last updated: 2026-02-10*
*Version: 1.0.0*
