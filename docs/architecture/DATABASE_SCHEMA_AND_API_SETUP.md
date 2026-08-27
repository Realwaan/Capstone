# 🗄️ Capstone Database Schema & Backend API Setup Guide

This document provides the complete **Database Schema (PostgreSQL)**, **Prisma ORM Definition**, and **Backend REST API Specifications** for your 2nd-Year BSCS Capstone Project.

---

## 🏗️ 1. Recommended Database & Backend Architecture

```mermaid
graph TD
    subgraph Client [Frontend Tier (React + Vite)]
        A[CapStoneFlow Web GUI]
        B[GitHub OAuth & Session State]
    end

    subgraph Backend [Application Server (Express.js / Node.js / FastAPI)]
        C[REST API Gateway - /api/v1]
        D[JWT & Role-Based Access Middleware]
        E[Prisma ORM / Supabase Client]
    end

    subgraph Database [Database Tier]
        F[(PostgreSQL Database - Supabase / Neon / Local)]
        G[(Cloud Storage - S3 / Supabase Storage for Manuscripts)]
    end

    A -->|HTTPS Requests + Bearer Token| C
    B -->|OAuth Callback| C
    C --> D
    D --> E
    E --> F
    E --> G
```

---

## 🗃️ 2. PostgreSQL Production SQL Migration Script

Run this SQL script in your PostgreSQL database (via **Supabase SQL Editor**, **pgAdmin**, or **psql**):

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'developer', -- 'leader', 'developer', 'researcher', 'adviser'
    role_title VARCHAR(255) DEFAULT 'Developer',
    permission_level VARCHAR(50) DEFAULT 'member', -- 'owner', 'member', 'adviser'
    avatar_url TEXT,
    github_username VARCHAR(100),
    github_access_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,
    team_name VARCHAR(255) DEFAULT 'Capstone Team',
    target_defense_date DATE NOT NULL,
    proposal_defense_date DATE,
    current_phase_id INT DEFAULT 1,
    overall_progress INT DEFAULT 0,
    github_repo_url TEXT,
    adviser_name VARCHAR(255) DEFAULT 'Jay Vince Serato',
    adviser_email VARCHAR(255),
    adviser_department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASKS TABLE (Kanban / Matrix)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo', -- 'backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done'
    priority VARCHAR(50) DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
    category VARCHAR(50) DEFAULT 'code', -- 'code', 'manuscript', 'research', 'testing', 'hardware', 'design'
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phase_id INT DEFAULT 1,
    story_points INT DEFAULT 3,
    estimated_hours INT DEFAULT 8,
    logged_hours INT DEFAULT 0,
    due_date DATE,
    deliverable_url TEXT,
    github_issue_number INT,
    github_pr_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUBTASKS TABLE (Checklists)
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MILESTONE PHASES & DELIVERABLES
CREATE TABLE IF NOT EXISTS milestone_phases (
    id INT PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming', -- 'completed', 'in_progress', 'upcoming'
    progress_percentage INT DEFAULT 0,
    adviser_sign_off BOOLEAN DEFAULT FALSE,
    signed_off_date DATE
);

CREATE TABLE IF NOT EXISTS phase_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id INT REFERENCES milestone_phases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    required_for_defense BOOLEAN DEFAULT TRUE
);

-- 6. THESIS MANUSCRIPT CHAPTERS (1 to 5)
CREATE TABLE IF NOT EXISTS manuscript_chapters (
    id INT PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    word_count INT DEFAULT 0,
    target_word_count INT DEFAULT 4000,
    doc_url TEXT,
    latex_url TEXT,
    adviser_status VARCHAR(50) DEFAULT 'not_submitted', -- 'not_submitted', 'in_review', 'needs_revision', 'approved'
    last_updated DATE
);

CREATE TABLE IF NOT EXISTS chapter_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id INT REFERENCES manuscript_chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    page_estimate VARCHAR(50),
    completed BOOLEAN DEFAULT FALSE
);

-- 7. ADVISER & PANEL REVISION MATRIX
CREATE TABLE IF NOT EXISTS revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(255) NOT NULL, -- e.g. 'Jay Vince Serato' or 'Panelist'
    comment TEXT NOT NULL,
    chapter_or_component VARCHAR(255) NOT NULL,
    action_taken TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'verified'
    resolved_date DATE,
    verified_by VARCHAR(255)
);

-- 8. DAILY STANDUPS TABLE
CREATE TABLE IF NOT EXISTS standups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    yesterday_accomplished TEXT NOT NULL,
    today_plan TEXT NOT NULL,
    blockers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. REALTIME PUBLICATION SETUP (Enable PostgreSQL Change Data Capture replication)
-- Run this in Supabase SQL editor if you wish to enable native PostgreSQL CDC:
ALTER PUBLICATION supabase_realtime ADD TABLE tasks, subtasks, standups, revisions, projects, milestone_phases, phase_deliverables, manuscript_chapters, chapter_sections;
```

---

## 💎 3. Prisma Schema (`schema.prisma`)

If using Node.js / Next.js with Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  fullName        String
  role            String    @default("developer")
  roleTitle       String    @default("Developer")
  permissionLevel String    @default("member")
  avatarUrl       String?
  githubUsername  String?
  tasks           Task[]
  standups        Standup[]
  createdAt       DateTime  @default(now())
}

model Task {
  id             String    @id @default(uuid())
  title          String
  description    String?
  status         String    @default("todo")
  priority       String    @default("medium")
  category       String    @default("code")
  assigneeId     String?
  assignee       User?     @relation(fields: [assigneeId], references: [id])
  phaseId        Int       @default(1)
  dueDate        DateTime?
  deliverableUrl String?
  subtasks       Subtask[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Subtask {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title     String
  completed Boolean  @default(false)
}
```

---

## 🌐 4. Core Backend REST API Routes

| HTTP Method | Route | Description | Permission Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/github` | Exchange GitHub OAuth Code for Access Token | Public |
| **GET** | `/api/auth/me` | Fetch authenticated user profile | Any Authenticated User |
| **GET** | `/api/tasks` | Fetch sprint tasks with filters & subtasks | Any Team Member |
| **POST** | `/api/tasks` | Create a new task (Quick capture or detailed) | Any Team Member |
| **PATCH** | `/api/tasks/:id` | Update task status, assignee, or subtasks | Assigned Member or Owner |
| **DELETE** | `/api/tasks/:id` | Permanently delete a task | 👑 Owner Only |
| **GET** | `/api/chapters` | Get Chapters 1–5 manuscript checklists & word counts | Any Team Member |
| **POST** | `/api/revisions` | Log an adviser critique from consultation | Any Team Member |
| **PATCH** | `/api/revisions/:id` | Update revision resolution status | Owner / Adviser |
| **POST** | `/api/standups` | Submit daily standup report | Any Team Member |
| **PATCH** | `/api/project/settings` | Update target defense date and project info | 👑 Owner Only |

---

## 🔑 5. Environment Variables (`.env`) Configuration

```env
# Database Connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/capstoneflow?schema=public"

# Supabase (Optional Free Managed Cloud Postgres)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"

# GitHub OAuth 2.0
VITE_GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
VITE_GITHUB_REDIRECT_URI="http://localhost:5173/auth/callback"
```
