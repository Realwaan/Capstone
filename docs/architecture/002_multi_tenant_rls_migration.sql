-- ==============================================================================
-- CAPSTONEFLOW ENTERPRISE MULTI-TENANT ROW-LEVEL SECURITY (RLS) MIGRATION
-- Database: PostgreSQL 14+ / Supabase / Neon
-- Version: 2.6.0 (Phase 2 Scalability Engine)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROJECTS TABLE (Tenant Partition Master)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_slug VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,
    organization VARCHAR(255) DEFAULT 'College of Computer Studies',
    region VARCHAR(64) DEFAULT 'ap-southeast-1',
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'provisioning')),
    track_type VARCHAR(64) DEFAULT 'full_coding' CHECK (track_type IN ('full_coding', 'software_engineering', 'hardware_iot', 'research_manuscript')),
    has_manuscript BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(32) UNIQUE NOT NULL,
    target_defense_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '90 days',
    proposal_defense_date DATE,
    current_phase_id INT DEFAULT 1,
    overall_progress INT DEFAULT 0,
    team_name VARCHAR(255) DEFAULT 'Dev Team',
    github_repo_url TEXT,
    adviser_name VARCHAR(255) DEFAULT 'Faculty Adviser',
    adviser_email VARCHAR(255),
    adviser_department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECT COLLABORATORS TABLE (Membership & Access Control)
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase Auth
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(64) DEFAULT 'developer', -- 'leader', 'developer', 'researcher', 'adviser'
    role_title VARCHAR(255) DEFAULT 'Full-Stack Developer',
    permission_level VARCHAR(32) DEFAULT 'member' CHECK (permission_level IN ('owner', 'editor', 'member', 'adviser', 'viewer')),
    avatar_url TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- 4. PROJECT INVITATION TOKENS TABLE (GitHub-Style Share Links)
CREATE TABLE IF NOT EXISTS public.project_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    permission_level VARCHAR(32) DEFAULT 'member' CHECK (permission_level IN ('owner', 'editor', 'member', 'adviser', 'viewer')),
    role_preset VARCHAR(64) DEFAULT 'developer',
    created_by UUID,
    max_uses INT DEFAULT 10,
    uses_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TASKS TABLE (Sprint & Kanban Matrix)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done')),
    priority VARCHAR(32) DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    category VARCHAR(32) DEFAULT 'code',
    assignee_id UUID,
    phase_id INT DEFAULT 1,
    story_points INT DEFAULT 3,
    estimated_hours INT DEFAULT 8,
    logged_hours INT DEFAULT 0,
    due_date DATE,
    deliverable_url TEXT,
    github_issue_number INT,
    github_pr_number INT,
    position_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MILESTONE PHASES & DEFENSE CRITERIA
CREATE TABLE IF NOT EXISTS public.milestone_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    progress_percentage INT DEFAULT 0,
    key_deliverables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ADVISER REVISION DIRECTIVES
CREATE TABLE IF NOT EXISTS public.revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    chapter_number INT,
    severity VARCHAR(32) DEFAULT 'major' CHECK (severity IN ('critical', 'major', 'minor', 'enhancement')),
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'adviser_approved')),
    adviser_notes TEXT,
    response_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DAILY ASYNC STANDUPS
CREATE TABLE IF NOT EXISTS public.standups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID,
    member_name VARCHAR(255) NOT NULL,
    today_commitments TEXT NOT NULL,
    yesterday_accomplishments TEXT,
    blockers TEXT,
    hours_logged NUMERIC(4, 1) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ⚡ PERFORMANCE B-TREE INDEXES FOR HIGH-CONCURRENCY QUERIES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_invite_code ON public.projects(invite_code);
CREATE INDEX IF NOT EXISTS idx_collab_project_user ON public.project_collaborators(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_phase ON public.tasks(project_id, phase_id);
CREATE INDEX IF NOT EXISTS idx_revisions_project_status ON public.revisions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_standups_project_date ON public.standups(project_id, created_at DESC);

-- ==============================================================================
-- 🛡️ ROW-LEVEL SECURITY (RLS) MULTI-TENANT POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standups ENABLE ROW LEVEL SECURITY;

-- Helper security function: check if authenticated user belongs to project
CREATE OR REPLACE FUNCTION public.is_project_member(target_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.project_collaborators 
        WHERE project_id = target_project_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Projects (View if collaborator)
CREATE POLICY "Projects accessible to team collaborators"
ON public.projects FOR ALL
USING (
    public.is_project_member(id) 
    OR auth.role() = 'service_role'
);

-- RLS Policy: Tasks (Restricted to project collaborators)
CREATE POLICY "Tasks partitioned by project tenancy"
ON public.tasks FOR ALL
USING (
    public.is_project_member(project_id)
    OR auth.role() = 'service_role'
);

-- RLS Policy: Milestone Phases
CREATE POLICY "Phases partitioned by project tenancy"
ON public.milestone_phases FOR ALL
USING (
    public.is_project_member(project_id)
    OR auth.role() = 'service_role'
);

-- RLS Policy: Revisions
CREATE POLICY "Revisions partitioned by project tenancy"
ON public.revisions FOR ALL
USING (
    public.is_project_member(project_id)
    OR auth.role() = 'service_role'
);

-- RLS Policy: Standups
CREATE POLICY "Standups partitioned by project tenancy"
ON public.standups FOR ALL
USING (
    public.is_project_member(project_id)
    OR auth.role() = 'service_role'
);
