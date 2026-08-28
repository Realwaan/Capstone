-- ==========================================================
-- CapstoneFlow: Community & Predictions Database Migration
-- Inspired by cituintramurals-2026 multi-user architecture
-- ==========================================================

-- 1. Profiles Table (Integrated with Supabase Auth or Standalone)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'lead', 'adviser', 'panelist', 'admin')),
  bio TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Discussion Threads
CREATE TABLE IF NOT EXISTS community_threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  project_id TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Replies & Comments
CREATE TABLE IF NOT EXISTS community_replies (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  parent_id TEXT,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Community Thread Likes
CREATE TABLE IF NOT EXISTS community_likes (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- 5. Community Reply Likes
CREATE TABLE IF NOT EXISTS community_reply_likes (
  id TEXT PRIMARY KEY,
  reply_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- 6. Capstone Milestone & Defense Predictions / Polls
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'milestone' CHECK (category IN ('milestone', 'defense', 'awards', 'sprint', 'general')),
  project_id TEXT,
  author_id TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  correct_option_id TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Prediction User Votes
CREATE TABLE IF NOT EXISTS prediction_votes (
  id TEXT PRIMARY KEY,
  prediction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prediction_id, user_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_community_threads_created_at ON community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_threads_author ON community_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_community_threads_project ON community_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_thread ON community_replies(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON community_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_predictions_deadline ON predictions(deadline ASC);
CREATE INDEX IF NOT EXISTS idx_prediction_votes_prediction ON prediction_votes(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_votes_user ON prediction_votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_votes ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert/update" ON profiles FOR ALL USING (true);

CREATE POLICY "Public threads read" ON community_threads FOR SELECT USING (true);
CREATE POLICY "Threads insert/update/delete" ON community_threads FOR ALL USING (true);

CREATE POLICY "Public replies read" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Replies insert/update/delete" ON community_replies FOR ALL USING (true);

CREATE POLICY "Public likes read" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Likes insert/delete" ON community_likes FOR ALL USING (true);

CREATE POLICY "Public reply likes read" ON community_reply_likes FOR SELECT USING (true);
CREATE POLICY "Reply likes insert/delete" ON community_reply_likes FOR ALL USING (true);

CREATE POLICY "Public predictions read" ON predictions FOR SELECT USING (true);
CREATE POLICY "Predictions insert/update/delete" ON predictions FOR ALL USING (true);

CREATE POLICY "Public prediction votes read" ON prediction_votes FOR SELECT USING (true);
CREATE POLICY "Prediction votes insert/update" ON prediction_votes FOR ALL USING (true);
