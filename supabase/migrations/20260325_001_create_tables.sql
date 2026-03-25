-- GrapplingMap database schema
-- Run this in the Supabase SQL editor

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  membership_status TEXT NOT NULL DEFAULT 'member',
  current_belt TEXT DEFAULT 'white',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technique_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'none',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_key)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_progress_user ON user_progress(user_id);

-- User Notes
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technique_key TEXT NOT NULL,
  note_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_key)
);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own notes" ON user_notes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Success Log
CREATE TABLE IF NOT EXISTS success_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technique_key TEXT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE success_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own success log" ON success_log
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_success_user_date ON success_log(user_id, logged_at DESC);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_tab TEXT DEFAULT 'reference',
  last_selected_node TEXT,
  recent_viewed JSONB DEFAULT '[]',
  last_practiced JSONB DEFAULT '{}',
  videos_watched JSONB DEFAULT '{}',
  current_belt TEXT DEFAULT 'white',
  key_version INTEGER DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
