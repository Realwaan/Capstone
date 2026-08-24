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
    panel_members JSONB DEFAULT '[]'::jsonb,
    invite_code TEXT UNIQUE,
    track_type TEXT DEFAULT 'full_coding', -- 'full_coding', 'research_manuscript', 'hardware_iot'
    has_manuscript BOOLEAN DEFAULT FALSE,
    organization TEXT DEFAULT 'College of Computer Studies',
    region TEXT DEFAULT 'ap-southeast-1',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
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
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed'
    progress_percentage INT DEFAULT 0,
    adviser_sign_off BOOLEAN DEFAULT FALSE,
    signed_off_date TEXT,
    signed_off_by TEXT,
    consultation_notes TEXT,
    proof_url TEXT,
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
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
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
    what_to_fix JSONB NOT NULL DEFAULT '[]'::jsonb,
    acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    related_files JSONB NOT NULL DEFAULT '[]'::jsonb,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    claimed_at TEXT,
    claimed_by_username TEXT,
    resolution_summary TEXT,
    blockers TEXT,
    pr_url TEXT,
    resolved_at TEXT,
    resolved_by_username TEXT,
    peer_reviewed_at TEXT,
    peer_reviewed_by_username TEXT,
    adviser_reviewed_at TEXT,
    adviser_reviewed_by_username TEXT,
    reviewed_at TEXT,
    reviewed_by_username TEXT,
    closed_at TEXT,
    closed_by_username TEXT,
    ticket_events JSONB NOT NULL DEFAULT '[]'::jsonb,
    discord_ticket JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Keep existing workspaces compatible when this script is re-run after an upgrade.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS invite_code TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS panel_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS track_type TEXT DEFAULT 'full_coding';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS has_manuscript BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization TEXT DEFAULT 'College of Computer Studies';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'ap-southeast-1';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE milestone_phases ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE milestone_phases ADD COLUMN IF NOT EXISTS signed_off_by TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS what_to_fix JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_files JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claimed_at TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claimed_by_username TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS peer_reviewed_at TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS peer_reviewed_by_username TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS adviser_reviewed_at TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS adviser_reviewed_by_username TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ticket_events JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS discord_ticket JSONB;

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
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL,
    date TEXT NOT NULL,
    yesterday TEXT,
    today TEXT,
    yesterday_accomplished TEXT,
    today_plan TEXT,
    blockers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE standups ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE standups ADD COLUMN IF NOT EXISTS yesterday_accomplished TEXT;
ALTER TABLE standups ADD COLUMN IF NOT EXISTS today_plan TEXT;
ALTER TABLE standups ALTER COLUMN yesterday DROP NOT NULL;
ALTER TABLE standups ALTER COLUMN today DROP NOT NULL;

-- 9. REVISIONS TABLE
CREATE TABLE IF NOT EXISTS revisions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'panelist', 'adviser', 'peer_review'
    source_name TEXT,
    item_number INT DEFAULT 1,
    chapter_or_module TEXT,
    chapter_or_component TEXT,
    page_number TEXT,
    comment TEXT NOT NULL,
    required_action TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'verified'
    action_taken TEXT,
    assigned_to_id TEXT,
    resolved_date TEXT,
    verified_by TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE revisions ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS chapter_or_component TEXT;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS resolved_date TEXT;
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE revisions ALTER COLUMN source_name DROP NOT NULL;
ALTER TABLE revisions ALTER COLUMN required_action DROP NOT NULL;
ALTER TABLE revisions ALTER COLUMN chapter_or_module DROP NOT NULL;

-- 10. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS project_id TEXT;

-- 11. DISCORD THREADS TABLE (For Discord Bot Synchronization)
CREATE TABLE IF NOT EXISTS threads (
    thread_id BIGINT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    ticket_name TEXT NOT NULL,
    folder TEXT NOT NULL,
    channel_id BIGINT NOT NULL,
    guild_id BIGINT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_by TEXT,
    claimed_by_id BIGINT,
    claimed_by_username TEXT,
    resolved_by_id BIGINT,
    resolved_by_username TEXT,
    reviewed_by_id BIGINT,
    reviewed_by_username TEXT,
    pr_url TEXT,
    external_task_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE threads ADD COLUMN IF NOT EXISTS project_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS threads_external_task_id_idx
    ON threads (external_task_id)
    WHERE external_task_id IS NOT NULL;

-- 12. MANUSCRIPT CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS manuscript_chapters (
    id INT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    word_count INT DEFAULT 0,
    target_word_count INT DEFAULT 3000,
    doc_url TEXT,
    latex_url TEXT,
    adviser_status TEXT DEFAULT 'not_submitted',
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    draft_content TEXT DEFAULT '',
    rrl_entries JSONB DEFAULT '[]'::jsonb,
    iso_evaluations JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE manuscript_chapters ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE manuscript_chapters ADD COLUMN IF NOT EXISTS draft_content TEXT DEFAULT '';
ALTER TABLE manuscript_chapters ADD COLUMN IF NOT EXISTS rrl_entries JSONB DEFAULT '[]'::jsonb;
ALTER TABLE manuscript_chapters ADD COLUMN IF NOT EXISTS iso_evaluations JSONB DEFAULT '[]'::jsonb;

-- Keep milestone_phases compatible with consultation notes and proof
ALTER TABLE milestone_phases ADD COLUMN IF NOT EXISTS consultation_notes TEXT;
ALTER TABLE milestone_phases ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Multi-Tenant Project Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_project ON team_members (project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_phases_project ON milestone_phases (project_id);
CREATE INDEX IF NOT EXISTS idx_manuscript_chapters_project ON manuscript_chapters (project_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_standups_project ON standups (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_project ON revisions (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON activity_logs (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_invite_code ON projects (invite_code);

-- 13. CAPSTONE INTEGRATION DELIVERIES TABLE (Durable Idempotency & Replay Protection)
CREATE TABLE IF NOT EXISTS capstone_integration_deliveries (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    correlation_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    external_task_id TEXT,
    request_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_json JSONB,
    response_status INTEGER,
    state TEXT NOT NULL DEFAULT 'processing'
        CHECK (state IN ('processing', 'succeeded', 'failed')),
    error_text TEXT,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capstone_integration_task
    ON capstone_integration_deliveries (external_task_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_capstone_integration_state
    ON capstone_integration_deliveries (state, updated_at DESC);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- Idempotent check to avoid 42710 duplicate relation errors on re-runs
-- ==============================================================================
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'projects', 
        'team_members', 
        'milestone_phases', 
        'phase_deliverables', 
        'tasks', 
        'subtasks', 
        'standups', 
        'revisions', 
        'activity_logs',
        'manuscript_chapters'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = tbl
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        END IF;
    END LOOP;
END $$;

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
ALTER TABLE manuscript_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE capstone_integration_deliveries ENABLE ROW LEVEL SECURITY;

-- Allow public/anon access for workspace operations (with DROP IF EXISTS for re-run safety)
DROP POLICY IF EXISTS "Allow public read on projects" ON projects;
CREATE POLICY "Allow public read on projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public all on projects" ON projects;
CREATE POLICY "Allow public all on projects" ON projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on team_members" ON team_members;
CREATE POLICY "Allow public all on team_members" ON team_members FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on milestone_phases" ON milestone_phases;
CREATE POLICY "Allow public all on milestone_phases" ON milestone_phases FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on phase_deliverables" ON phase_deliverables;
CREATE POLICY "Allow public all on phase_deliverables" ON phase_deliverables FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on tasks" ON tasks;
CREATE POLICY "Allow public all on tasks" ON tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on subtasks" ON subtasks;
CREATE POLICY "Allow public all on subtasks" ON subtasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on standups" ON standups;
CREATE POLICY "Allow public all on standups" ON standups FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on revisions" ON revisions;
CREATE POLICY "Allow public all on revisions" ON revisions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on activity_logs" ON activity_logs;
CREATE POLICY "Allow public all on activity_logs" ON activity_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on manuscript_chapters" ON manuscript_chapters;
CREATE POLICY "Allow public all on manuscript_chapters" ON manuscript_chapters FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on threads" ON threads;
CREATE POLICY "Allow public all on threads" ON threads FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all on capstone_integration_deliveries" ON capstone_integration_deliveries;
CREATE POLICY "Allow public all on capstone_integration_deliveries" ON capstone_integration_deliveries FOR ALL USING (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET: capstone-attachments
-- Run this in SQL Editor to enable PDF, image, and deliverable uploads
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('capstone-attachments', 'capstone-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public uploads to capstone-attachments" ON storage.objects;
CREATE POLICY "Allow public uploads to capstone-attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'capstone-attachments');

DROP POLICY IF EXISTS "Allow public read from capstone-attachments" ON storage.objects;
CREATE POLICY "Allow public read from capstone-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'capstone-attachments');

DROP POLICY IF EXISTS "Allow public delete on capstone-attachments" ON storage.objects;
CREATE POLICY "Allow public delete on capstone-attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'capstone-attachments');


