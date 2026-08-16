-- ==============================================================================
-- CAPSTONEFLOW PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Execute this script in your Supabase Project's SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    team_name TEXT DEFAULT 'Capstone Team',
    target_defense_date TEXT NOT NULL,
    proposal_defense_date TEXT,
    current_phase_id INT DEFAULT 1,
    overall_progress INT DEFAULT 0,
    github_repo_url TEXT,
    adviser_name TEXT DEFAULT 'Jay Vince Serato',
    adviser_email TEXT,
    adviser_department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- 'leader', 'developer', 'qa', 'researcher', 'adviser'
    role_title TEXT NOT NULL,
    permission_level TEXT NOT NULL, -- 'owner', 'member', 'adviser'
    avatar TEXT NOT NULL,
    color TEXT DEFAULT '#10b981',
    github_username TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. MILESTONE PHASES TABLE
CREATE TABLE IF NOT EXISTS milestone_phases (
    id INT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed'
    progress_percentage INT DEFAULT 0,
    adviser_sign_off BOOLEAN DEFAULT FALSE,
    signed_off_date TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. PHASE DELIVERABLES TABLE
CREATE TABLE IF NOT EXISTS phase_deliverables (
    id TEXT PRIMARY KEY,
    phase_id INT REFERENCES milestone_phases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    required_for_defense BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'code', -- 'code', 'manuscript', 'research', 'testing', 'hardware', 'design'
    priority TEXT DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
    status TEXT DEFAULT 'todo', -- 'backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done'
    assignee_id TEXT,
    phase_id INT DEFAULT 1,
    story_points INT DEFAULT 3,
    estimated_hours INT DEFAULT 8,
    logged_hours INT DEFAULT 0,
    due_date TEXT,
    deliverable_url TEXT,
    folder TEXT,
    problem_statement TEXT,
    resolution_summary TEXT,
    blockers TEXT,
    pr_url TEXT,
    resolved_at TEXT,
    resolved_by_username TEXT,
    reviewed_at TEXT,
    reviewed_by_username TEXT,
    closed_at TEXT,
    closed_by_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. SUBTASKS TABLE
CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. STANDUPS TABLE
CREATE TABLE IF NOT EXISTS standups (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    date TEXT NOT NULL,
    yesterday TEXT NOT NULL,
    today TEXT NOT NULL,
    blockers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. REVISIONS TABLE
CREATE TABLE IF NOT EXISTS revisions (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL, -- 'panelist', 'adviser', 'peer_review'
    source_name TEXT NOT NULL,
    item_number INT DEFAULT 1,
    chapter_or_module TEXT NOT NULL,
    page_number TEXT,
    comment TEXT NOT NULL,
    required_action TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'verified'
    action_taken TEXT,
    assigned_to_id TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- This allows instant live syncing when any teammate creates or updates items
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE milestone_phases;
ALTER PUBLICATION supabase_realtime ADD TABLE phase_deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE standups;
ALTER PUBLICATION supabase_realtime ADD TABLE revisions;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable read and write access for authenticated workspace members
-- ==============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public/anon access for workspace operations
CREATE POLICY "Allow public read on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public all on projects" ON projects FOR ALL USING (true);

CREATE POLICY "Allow public all on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow public all on milestone_phases" ON milestone_phases FOR ALL USING (true);
CREATE POLICY "Allow public all on phase_deliverables" ON phase_deliverables FOR ALL USING (true);
CREATE POLICY "Allow public all on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow public all on subtasks" ON subtasks FOR ALL USING (true);
CREATE POLICY "Allow public all on standups" ON standups FOR ALL USING (true);
CREATE POLICY "Allow public all on revisions" ON revisions FOR ALL USING (true);
CREATE POLICY "Allow public all on activity_logs" ON activity_logs FOR ALL USING (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET: capstone-attachments
-- Run this in SQL Editor to enable PDF, image, and deliverable uploads
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('capstone-attachments', 'capstone-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Allow public uploads to capstone-attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'capstone-attachments');

CREATE POLICY "Allow public read from capstone-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'capstone-attachments');

CREATE POLICY "Allow public delete on capstone-attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'capstone-attachments');

