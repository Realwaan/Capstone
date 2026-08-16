import { CapstoneProject, TeamMember, Task, MilestonePhase, ManuscriptChapter, RevisionItem, StandupEntry, ActivityLog, GitHubCommit, GitHubPullRequest } from '../types';

export const initialProject: CapstoneProject = {
  id: 'capstone-proj-001',
  title: 'My Capstone Project',
  subtitle: 'A collaborative workflow, milestone, and progress tracking workspace for our capstone team.',
  targetDefenseDate: '2026-11-30',
  proposalDefenseDate: '',
  currentPhaseId: 1,
  overallProgress: 0,
  teamName: 'Capstone Team',
  adviser: {
    name: 'Jay Vince Serato',
    email: 'jayvince.serato@university.edu',
    department: 'Department of Computer Science / Information Technology',
  },
  panelMembers: [
    'Panel Chair / Specialist',
    'Technical / Industry Panelist',
    'Ethics & Evaluation Panelist'
  ]
};

export const initialMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Marc Andrei Regulacion',
    email: 'marcandrei.regulacion@cit.edu',
    role: 'leader',
    roleTitle: 'Project Lead & Architect',
    permissionLevel: 'owner',
    avatar: 'https://github.com/Realwaan.png',
    color: '#6366f1',
    githubUsername: 'Realwaan'
  },
  {
    id: 'm2',
    name: 'Jeremy Navarro',
    email: 'jeremy.navarro@student.edu',
    role: 'developer',
    roleTitle: 'Backend & Database Engineer',
    permissionLevel: 'member',
    avatar: 'https://github.com/Jeremy-hub-prog.png',
    color: '#10b981',
    githubUsername: 'Jeremy-hub-prog'
  },
  {
    id: 'm6',
    name: 'Jay Vince Serato',
    email: 'jayvince.serato@university.edu',
    role: 'adviser',
    roleTitle: 'Capstone Faculty Adviser',
    permissionLevel: 'adviser',
    avatar: 'https://ui-avatars.com/api/?name=Jay+Vince+Serato&background=6366f1&color=fff&bold=true',
    color: '#8b5cf6'
  }
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Architect Relational Database & Entity Relationship Schema (PostgreSQL + Prisma)',
    description: 'Design 3NF normalized relational schema, foreign key cascade constraints, indexing strategies, and PostgreSQL migration seeders.',
    problemStatement: 'Task assignment, standup sync, and ticket claiming lack referential integrity constraints, risking orphan deliverables during state transitions.',
    whatToFix: [
      'Model 3NF relational schema covering users, tasks, ticket_events, standups, and revisions',
      'Implement foreign key cascade rules and compound index on (phase_id, status)',
      'Generate Prisma schema and Mermaid entity relationship diagram',
      'Write database migration seeder script for PostgreSQL'
    ],
    acceptanceCriteria: [
      { id: 'ac1', text: 'Database normalized to 3NF with zero redundant columns', completed: true },
      { id: 'ac2', text: 'ERD diagram exported in SVG and included in technical docs', completed: true },
      { id: 'ac3', text: 'Prisma migration seeder script boots clean test database', completed: true }
    ],
    relatedFiles: [
      'src/types/index.ts',
      'prisma/schema.prisma',
      'docs/erd_diagram.mermaid'
    ],
    folder: 'database-architecture',
    createdByUsername: '@leader',
    claimedByUsername: '@Jeremy-hub-prog',
    claimedAt: '2026-08-12T06:30:00.000Z',
    category: 'database',
    priority: 'urgent',
    status: 'in_progress',
    assigneeId: 'm2',
    phaseId: 2,
    storyPoints: 5,
    estimatedHours: 18,
    loggedHours: 10,
    dueDate: '2026-09-20',
    subtasks: [
      { id: 'st1', title: 'Draft conceptual ERD in Mermaid/DBML', completed: true },
      { id: 'st2', title: 'Implement foreign keys and constraints in schema.prisma', completed: true },
      { id: 'st3', title: 'Write Prisma migration seeders and test datasets', completed: false }
    ],
    createdAt: '2026-08-12',
    updatedAt: '2026-08-15'
  },
  {
    id: 't2',
    title: 'Configure GitHub OAuth 2.0 & Session Middleware',
    description: 'Implement GitHub OAuth authentication flow, JWT token verification, and session state synchronization across clients.',
    problemStatement: 'Manual username entry allows impersonation and lacks verified commit linking to student identity.',
    whatToFix: [
      'Implement GitHub OAuth authorization code grant exchange endpoint',
      'Generate secure JWT access tokens and set httpOnly session cookies',
      'Create GitHub context provider with live user profile syncing',
      'Write middleware to protect private API routes'
    ],
    acceptanceCriteria: [
      { id: 'ac4', text: 'GitHub login popup completes with authentic token exchange', completed: true },
      { id: 'ac5', text: 'User avatar and GitHub handle display in sidebar', completed: true },
      { id: 'ac6', text: 'Session persistence survives page reloads without logout', completed: true }
    ],
    relatedFiles: [
      'src/components/GitHubAuthModal.tsx',
      'src/context/ProjectContext.tsx',
      'src/components/LoginPage.tsx'
    ],
    folder: 'auth-security',
    createdByUsername: '@leader',
    claimedByUsername: '@qa_lead',
    claimedAt: '2026-08-13T02:15:00.000Z',
    category: 'backend',
    priority: 'high',
    status: 'done',
    assigneeId: 'm4',
    phaseId: 2,
    storyPoints: 5,
    estimatedHours: 16,
    loggedHours: 16,
    dueDate: '2026-09-18',
    subtasks: [
      { id: 'st4', title: 'Register GitHub OAuth application with callback URLs', completed: true },
      { id: 'st5', title: 'Implement token exchange service with secure state validation', completed: true },
      { id: 'st6', title: 'Store user profile and token in local auth storage', completed: true }
    ],
    createdAt: '2026-08-13',
    updatedAt: '2026-08-15'
  },
  {
    id: 't3',
    title: 'Build High-Fidelity UI Design System & Component Library in React',
    description: 'Implement responsive component library, navigation layouts, and Emil Kowalski tactile motion physics.',
    problemStatement: 'Previous mockups lacked dark mode contrast ratios and Emil Kowalski motion tokens, creating inconsistency between prototype and production.',
    whatToFix: [
      'Extract design primitives from Linear and Raycast into standardized design tokens',
      'Implement Apple SF Pro typography hierarchy and squircle border radiuses',
      'Build 3-state MorphButton with 12-bar radial spinner and checkmark transition',
      'Ensure zero-FOUC theme switching between dark and light modes'
    ],
    acceptanceCriteria: [
      { id: 'ac7', text: 'All UI components pass WCAG AA contrast ratios', completed: true },
      { id: 'ac8', text: 'Design token variables in tokens.css power all components', completed: true },
      { id: 'ac9', text: 'Interactive buttons use cubic-bezier(0.23, 1, 0.32, 1) spring physics', completed: true }
    ],
    relatedFiles: [
      'design-system/tokens.json',
      'design-system/tokens.css',
      'src/components/MorphButton.tsx',
      'src/components/Spinner.tsx',
      'src/index.css'
    ],
    folder: 'frontend-design',
    createdByUsername: '@leader',
    claimedByUsername: '@dev_ui',
    claimedAt: '2026-08-12T08:45:00.000Z',
    category: 'frontend',
    priority: 'medium',
    status: 'peer_review',
    assigneeId: 'm3',
    phaseId: 3,
    storyPoints: 3,
    estimatedHours: 15,
    loggedHours: 14,
    dueDate: '2026-09-22',
    subtasks: [
      { id: 'st7', title: 'Define color tokens, typography, and dark mode palette', completed: true },
      { id: 'st8', title: 'Build student dashboard and Kanban board components', completed: true },
      { id: 'st9', title: 'Implement origin-aware popover and morph button physics', completed: true },
      { id: 'st10', title: 'Verify zero-lag theme toggle across all views', completed: false }
    ],
    createdAt: '2026-08-12',
    updatedAt: '2026-08-15'
  },
  {
    id: 't4',
    title: 'Develop Real-Time WebSocket Notification & Live Standup Service',
    description: 'Implement WebSocket pub/sub connection for instant standup broadcasts, ticket claiming notifications, and sprint activity ticks.',
    problemStatement: 'Team members had to manually refresh to see newly claimed tickets and daily standup submissions.',
    whatToFix: [
      'Setup bidirectional WebSocket handler for ticket event publishing',
      'Connect useLiveTimeRefresh hook to tick relative timestamps every 30 seconds',
      'Broadcast Discord bot embeds to active client sessions in real-time'
    ],
    acceptanceCriteria: [
      { id: 'ac10', text: 'Ticket claim events instantly update all active browser sessions', completed: true },
      { id: 'ac11', text: 'Relative timestamps update dynamically without full page reload', completed: true }
    ],
    relatedFiles: [
      'src/utils/time.ts',
      'src/context/ProjectContext.tsx',
      'src/components/TeamView.tsx'
    ],
    folder: 'realtime-services',
    createdByUsername: '@leader',
    category: 'backend',
    priority: 'high',
    status: 'todo',
    assigneeId: '',
    phaseId: 3,
    storyPoints: 5,
    estimatedHours: 16,
    loggedHours: 0,
    dueDate: '2026-10-05',
    subtasks: [
      { id: 'st11', title: 'Implement broadcast event dispatcher', completed: false },
      { id: 'st12', title: 'Connect client WebSocket subscriber hook', completed: false }
    ],
    createdAt: '2026-08-14',
    updatedAt: '2026-08-14'
  },
  {
    id: 't5',
    title: 'Build Discord Bot Lifecycle Dispatcher (/claim, /resolved, /reviewed)',
    description: 'Implement Discord slash command handlers and webhook dispatcher for the 5 core ticket operations.',
    problemStatement: 'Developers and QA need streamlined Discord slash command integration and role-based permissions enforcement.',
    whatToFix: [
      'Implement Discord slash commands: /claim, /unclaim, /resolved, /reviewed, /closed',
      'Enforce strict ONE role per user permission matrix (PM Admin, Dev, QA)',
      'Render formatted Discord bot audit embeds inside ticket modals'
    ],
    acceptanceCriteria: [
      { id: 'ac12', text: 'All 5 slash commands execute with tactile Emil Kowalski morph buttons', completed: true },
      { id: 'ac13', text: 'Role-based access matrix prevents unauthorized approvals', completed: true },
      { id: 'ac14', text: 'Inline PR drawer expands smoothly for /resolved with auto-focus', completed: true }
    ],
    relatedFiles: [
      'src/components/TaskTicketModal.tsx',
      'src/components/RolesPermissionsModal.tsx',
      'src/context/ProjectContext.tsx'
    ],
    folder: 'discord-integration',
    createdByUsername: '@leader',
    claimedByUsername: '@leader',
    claimedAt: '2026-08-14T07:00:00.000Z',
    category: 'feature',
    priority: 'urgent',
    status: 'done',
    assigneeId: 'm1',
    phaseId: 3,
    storyPoints: 5,
    estimatedHours: 14,
    loggedHours: 14,
    dueDate: '2026-09-15',
    subtasks: [
      { id: 'st13', title: 'Implement 5-action tactile button bar', completed: true },
      { id: 'st14', title: 'Build Roles & Permissions matrix modal', completed: true },
      { id: 'st15', title: 'Create ticket event audit trail reducer', completed: true }
    ],
    createdAt: '2026-08-14',
    updatedAt: '2026-08-15'
  },
  {
    id: 't6',
    title: 'Setup Automated Vitest Unit Suite & GitHub Actions CI/CD Pipeline',
    description: 'Setup Vitest test suites, TypeScript typecheck verification, and GitHub Actions CI workflow for pull requests.',
    problemStatement: 'Manual testing slowed sprint velocity. We need automated CI coverage for task claiming, state reducers, and RBAC.',
    whatToFix: [
      'Write unit tests for claimTask, resolveTask, and reviewTask state transitions',
      'Configure GitHub Actions matrix runner on pull request triggers'
    ],
    acceptanceCriteria: [
      { id: 'ac15', text: '100% test pass rate across core context actions', completed: false },
      { id: 'ac16', text: 'GitHub Actions workflow badges green in repository README', completed: false }
    ],
    relatedFiles: [
      'src/context/ProjectContext.tsx',
      '.github/workflows/ci.yml'
    ],
    folder: 'ci-cd-quality',
    createdByUsername: '@leader',
    category: 'testing',
    priority: 'medium',
    status: 'backlog',
    assigneeId: '',
    phaseId: 4,
    storyPoints: 3,
    estimatedHours: 16,
    loggedHours: 0,
    dueDate: '2026-10-20',
    subtasks: [
      { id: 'st16', title: 'Write tests for ProjectContext state reducers', completed: false },
      { id: 'st17', title: 'Configure CI pipeline automated runners', completed: false }
    ],
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15'
  },
  {
    id: 't7',
    title: 'Containerize Multi-Service Backend & PostgreSQL with Docker Compose',
    description: 'Create multi-stage Dockerfiles for Vite/React frontend and Node/Postgres backend with hot-reloading dev containers.',
    problemStatement: 'Developers faced environment configuration inconsistencies between Windows, macOS, and Linux.',
    whatToFix: [
      'Write optimized multi-stage Dockerfile for production Vite client',
      'Create docker-compose.yml orchestrating app, PostgreSQL, and Redis cache',
      'Configure health checks and volume mounts for local development'
    ],
    acceptanceCriteria: [
      { id: 'ac17', text: 'docker compose up boots entire stack with 1 command', completed: false },
      { id: 'ac18', text: 'Postgres volume persists database state across container restarts', completed: false }
    ],
    relatedFiles: [
      'Dockerfile',
      'docker-compose.yml',
      '.dockerignore'
    ],
    folder: 'devops-infra',
    createdByUsername: '@leader',
    category: 'devops',
    priority: 'low',
    status: 'backlog',
    assigneeId: '',
    phaseId: 5,
    storyPoints: 4,
    estimatedHours: 12,
    loggedHours: 0,
    dueDate: '2026-11-10',
    subtasks: [
      { id: 'st18', title: 'Write multi-stage Docker build config', completed: false },
      { id: 'st19', title: 'Test local compose cluster with Postgres', completed: false }
    ],
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15'
  }
];

export const initialPhases: MilestonePhase[] = [
  {
    id: 1,
    title: 'Phase 1: Architecture & Technical System Specification',
    description: 'System modeling (DFD, UML, ERD), API contracts, repository configuration, tech stack baseline, and milestone roadmap alignment.',
    targetDate: '2026-09-15',
    status: 'completed',
    progressPercentage: 100,
    adviserSignOff: true,
    keyDeliverables: [
      { id: 'd1', title: 'System Architecture & Data Flow Diagrams', completed: true, requiredForDefense: true },
      { id: 'd2', title: '3NF Relational Database Schema & Data Dictionary', completed: true, requiredForDefense: true },
      { id: 'd3', title: 'API Endpoint Specifications & OpenAPI Contract', completed: true, requiredForDefense: true },
      { id: 'd4', title: 'GitHub Monorepo & Branch Protection Rules Setup', completed: true, requiredForDefense: false }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Database Modeling, Auth Engine & Core Backend APIs',
    description: 'PostgreSQL database implementation with Prisma ORM, GitHub OAuth 2.0 authentication middleware, and core CRUD services.',
    targetDate: '2026-10-05',
    status: 'in_progress',
    progressPercentage: 65,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd5', title: 'PostgreSQL Database Migrations & Seeders', completed: true, requiredForDefense: true },
      { id: 'd6', title: 'GitHub OAuth 2.0 & Session Middleware', completed: true, requiredForDefense: true },
      { id: 'd7', title: 'Task & Standup Management REST/GraphQL APIs', completed: false, requiredForDefense: true },
      { id: 'd8', title: 'Role-Based Access Control (RBAC) Guards', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Frontend UI, State Management & Feature Integration',
    description: 'React client portal with Emil Kowalski tactile physics, Discord bot ticket claim pipeline, and real-time state synchronization.',
    targetDate: '2026-10-25',
    status: 'upcoming',
    progressPercentage: 30,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd9', title: 'Academic Task Matrix & Kanban Board with Drag & Drop', completed: true, requiredForDefense: true },
      { id: 'd10', title: 'Discord Slash Command Bot Lifecycle (/claim, /resolved, /reviewed)', completed: true, requiredForDefense: true },
      { id: 'd11', title: 'Asynchronous Daily Sprint Standup Feed', completed: false, requiredForDefense: true },
      { id: 'd12', title: 'Live GitHub Repository & PR Sync Engine', completed: false, requiredForDefense: false }
    ]
  },
  {
    id: 4,
    title: 'Phase 4: Quality Assurance, Security Auditing & Automated Testing',
    description: 'Comprehensive test automation with Vitest unit tests, Playwright E2E suites, OWASP security audit, and bug bash sprints.',
    targetDate: '2026-11-15',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd13', title: 'Automated Vitest Unit Test Suite (80%+ Coverage)', completed: false, requiredForDefense: true },
      { id: 'd14', title: 'Playwright End-to-End User Flow Tests', completed: false, requiredForDefense: true },
      { id: 'd15', title: 'OWASP Security Vulnerability Audit & Remediation', completed: false, requiredForDefense: true },
      { id: 'd16', title: 'GitHub Actions Continuous Integration (CI) Workflow', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 5,
    title: 'Phase 5: Production Deployment, Staging Cluster & Final Defense Demo',
    description: 'Docker containerization, cloud deployment on Vercel & AWS/Railway, production telemetry, and live capstone defense presentation.',
    targetDate: '2026-12-05',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd17', title: 'Production Multi-Container Docker Deployment', completed: false, requiredForDefense: true },
      { id: 'd18', title: 'Live Demonstration Workspace with Real Data', completed: false, requiredForDefense: true },
      { id: 'd19', title: 'Technical Architecture & Deployment Manual', completed: false, requiredForDefense: true },
      { id: 'd20', title: 'Final System Defense Slide Deck & Code Walkthrough', completed: false, requiredForDefense: true }
    ]
  }
];

export const initialChapters: ManuscriptChapter[] = [
  {
    id: 1,
    chapterNumber: 1,
    title: 'Introduction & Problem Background',
    subtitle: 'Context, objectives, scope, limitations, and conceptual significance of the study.',
    wordCount: 0,
    targetWordCount: 4000,
    docUrl: '',
    lastUpdated: 'Not started',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c1-s1', title: '1.1 Background of the Study', status: 'not_started', pageEstimate: '3-4 pages', completed: false },
      { id: 'c1-s2', title: '1.2 Statement of the Problem', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c1-s3', title: '1.3 Research Objectives (General & Specific)', status: 'not_started', pageEstimate: '1-2 pages', completed: false },
      { id: 'c1-s4', title: '1.4 Scope and Delimitation', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c1-s5', title: '1.5 Significance of the Study', status: 'not_started', pageEstimate: '2 pages', completed: false }
    ]
  },
  {
    id: 2,
    chapterNumber: 2,
    title: 'Review of Related Literature & Studies (RRL)',
    subtitle: 'Theoretical framework, synthesis of state-of-the-art studies, and research gap.',
    wordCount: 0,
    targetWordCount: 8000,
    docUrl: '',
    lastUpdated: 'Not started',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c2-s1', title: '2.1 Related Technical & Domain Studies', status: 'not_started', pageEstimate: '5 pages', completed: false },
      { id: 'c2-s2', title: '2.2 Comparative Technology & Frameworks Analysis', status: 'not_started', pageEstimate: '6 pages', completed: false },
      { id: 'c2-s3', title: '2.3 Synthesis of Related Literature', status: 'not_started', pageEstimate: '3 pages', completed: false },
      { id: 'c2-s4', title: '2.4 Conceptual Framework (IPO / System Model)', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c2-s5', title: '2.5 Definition of Terms', status: 'not_started', pageEstimate: '2 pages', completed: false }
    ]
  },
  {
    id: 3,
    chapterNumber: 3,
    title: 'Methodology & System Architecture',
    subtitle: 'Research design, development model (Agile Scrum), data procedures, and testing protocols.',
    wordCount: 0,
    targetWordCount: 6000,
    docUrl: '',
    lastUpdated: 'Not started',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c3-s1', title: '3.1 Research & Software Engineering Paradigm', status: 'not_started', pageEstimate: '3 pages', completed: false },
      { id: 'c3-s2', title: '3.2 System Architecture & Component Design', status: 'not_started', pageEstimate: '4 pages', completed: false },
      { id: 'c3-s3', title: '3.3 Data Gathering & System Procedures', status: 'not_started', pageEstimate: '3 pages', completed: false },
      { id: 'c3-s4', title: '3.4 Development & Implementation Protocol', status: 'not_started', pageEstimate: '4 pages', completed: false },
      { id: 'c3-s5', title: '3.5 ISO/IEC 25010 Quality Evaluation Framework', status: 'not_started', pageEstimate: '3 pages', completed: false }
    ]
  },
  {
    id: 4,
    chapterNumber: 4,
    title: 'Results, Analysis & System Evaluation',
    subtitle: 'Performance benchmarks, testing data, usability survey evaluation, and findings.',
    wordCount: 0,
    targetWordCount: 6000,
    docUrl: '',
    lastUpdated: 'Not started',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c4-s1', title: '4.1 System Performance & Benchmark Metrics', status: 'not_started', pageEstimate: '4 pages', completed: false },
      { id: 'c4-s2', title: '4.2 Functional Testing & Test Case Results', status: 'not_started', pageEstimate: '3 pages', completed: false },
      { id: 'c4-s3', title: '4.3 ISO 25010 Usability Survey Findings', status: 'not_started', pageEstimate: '4 pages', completed: false },
      { id: 'c4-s4', title: '4.4 Comparative Analysis with Existing Baselines', status: 'not_started', pageEstimate: '3 pages', completed: false }
    ]
  },
  {
    id: 5,
    chapterNumber: 5,
    title: 'Summary, Conclusions & Recommendations',
    subtitle: 'Synthesis of findings, conclusions drawn, real-world deployment roadmap, and future research.',
    wordCount: 0,
    targetWordCount: 3000,
    docUrl: '',
    lastUpdated: 'Not started',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c5-s1', title: '5.1 Summary of Findings', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s2', title: '5.2 Conclusions', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s3', title: '5.3 Practical & Policy Recommendations', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s4', title: '5.4 Future Work & Limitations', status: 'not_started', pageEstimate: '1 page', completed: false }
    ]
  }
];

export const initialRevisions: RevisionItem[] = [];

export const initialStandups: StandupEntry[] = [];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4m ago
    userId: 'm2',
    action: 'claimed ownership of ticket',
    target: '[CLAIMED][@Jeremy-hub-prog] Architect Relational Database & Entity Relationship Schema'
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22m ago
    userId: 'm4',
    action: 'resolved ticket deliverable',
    target: '[PENDING-REVIEW] Configure GitHub OAuth 2.0 & Session Middleware'
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // ~2h ago
    userId: 'm3',
    action: 'submitted PR for review',
    target: 'Build High-Fidelity UI Design System & Component Library in React'
  },
  {
    id: 'act-4',
    timestamp: new Date(Date.now() - 280 * 60 * 1000).toISOString(), // ~4h ago
    userId: 'm1',
    action: 'dispatched Discord bot command',
    target: '/claim on #t5 Discord Bot Lifecycle Dispatcher'
  },
  {
    id: 'act-5',
    timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
    userId: 'm4',
    action: 'connected GitHub account',
    target: '@developer_qa'
  },
  {
    id: 'act-6',
    timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), // 3d ago
    userId: 'm6',
    action: 'assigned Capstone Adviser',
    target: 'Jay Vince Serato'
  }
];

export const initialCommits: GitHubCommit[] = [
  {
    sha: '7b2c9e1a4d8f0293e817c6a541098bfe1234abcd',
    shortSha: '7b2c9e1',
    message: 'feat(auth): configure GitHub OAuth 2.0 PKCE handshake & JWT session middleware',
    description: 'Implements full GitHub OAuth authorization code grant exchange, user identity persistence, and secure session state hydration.',
    authorName: 'Marc Andrei Regulacion',
    authorUsername: 'Realwaan',
    authorAvatar: 'https://github.com/Realwaan.png',
    date: '2026-08-15T10:45:00.000Z',
    url: 'https://github.com/Realwaan/capstone-project/commit/7b2c9e1a4d8f0293e817c6a541098bfe1234abcd',
    branch: 'main',
    verified: true,
    stats: { additions: 284, deletions: 12, totalFiles: 6 },
    changedFiles: [
      { filename: 'src/components/GitHubAuthModal.tsx', status: 'added', additions: 120, deletions: 0 },
      { filename: 'src/context/ProjectContext.tsx', status: 'modified', additions: 85, deletions: 12 },
      { filename: 'src/components/LoginPage.tsx', status: 'modified', additions: 45, deletions: 0 },
      { filename: 'src/types/index.ts', status: 'modified', additions: 34, deletions: 0 }
    ],
    linkedTaskId: 't2'
  },
  {
    sha: '5a91f4d890bc12ef34a567890123456789abcdef',
    shortSha: '5a91f4d',
    message: 'feat(db): model 3NF relational schema and Prisma PostgreSQL migration seeders',
    description: 'Defines normalized 3NF models for users, tasks, standups, and ticket audit events with foreign key cascade constraints.',
    authorName: 'Jeremy Navarro',
    authorUsername: 'Jeremy-hub-prog',
    authorAvatar: 'https://github.com/Jeremy-hub-prog.png',
    date: '2026-08-15T08:15:00.000Z',
    url: 'https://github.com/Jeremy-hub-prog/capstone-project/commit/5a91f4d890bc12ef34a567890123456789abcdef',
    branch: 'feature/db-schema',
    verified: true,
    stats: { additions: 412, deletions: 0, totalFiles: 4 },
    changedFiles: [
      { filename: 'prisma/schema.prisma', status: 'added', additions: 240, deletions: 0 },
      { filename: 'docs/erd_diagram.mermaid', status: 'added', additions: 95, deletions: 0 },
      { filename: 'src/types/index.ts', status: 'modified', additions: 45, deletions: 0 },
      { filename: 'prisma/seed.ts', status: 'added', additions: 32, deletions: 0 }
    ],
    linkedTaskId: 't1'
  },
  {
    sha: '8e32c0a9876543210fedcba9876543210fedcba9',
    shortSha: '8e32c0a',
    message: 'feat(ui): implement Emil Kowalski tactile morph buttons, spring physics & responsive layout',
    description: 'Adds 3-state morphing buttons with 12-bar radial spinner, zero-FOUC theme toggling, and horizontal scroll-snap Kanban track.',
    authorName: 'Jeremy Navarro',
    authorUsername: 'Jeremy-hub-prog',
    authorAvatar: 'https://github.com/Jeremy-hub-prog.png',
    date: '2026-08-14T19:30:00.000Z',
    url: 'https://github.com/Jeremy-hub-prog/capstone-project/commit/8e32c0a9876543210fedcba9876543210fedcba9',
    branch: 'feature/design-system',
    verified: true,
    stats: { additions: 340, deletions: 42, totalFiles: 7 },
    changedFiles: [
      { filename: 'src/components/MorphButton.tsx', status: 'added', additions: 180, deletions: 0 },
      { filename: 'src/components/Spinner.tsx', status: 'added', additions: 45, deletions: 0 },
      { filename: 'src/index.css', status: 'modified', additions: 95, deletions: 42 },
      { filename: 'design-system/tokens.css', status: 'added', additions: 20, deletions: 0 }
    ],
    linkedTaskId: 't3'
  },
  {
    sha: '4f78d12abcdef0123456789abcdef0123456789a',
    shortSha: '4f78d12',
    message: 'feat(bot): implement Discord slash command lifecycle dispatcher (/claim, /resolved, /reviewed)',
    description: 'Adds 5 core Discord slash action buttons, role permissions matrix, and state machine audit history.',
    authorName: 'Marc Andrei Regulacion',
    authorUsername: 'Realwaan',
    authorAvatar: 'https://github.com/Realwaan.png',
    date: '2026-08-14T14:10:00.000Z',
    url: 'https://github.com/Realwaan/capstone-project/commit/4f78d12abcdef0123456789abcdef0123456789a',
    branch: 'feature/discord-bot',
    verified: true,
    stats: { additions: 295, deletions: 18, totalFiles: 5 },
    changedFiles: [
      { filename: 'src/components/TaskTicketModal.tsx', status: 'modified', additions: 160, deletions: 12 },
      { filename: 'src/components/RolesPermissionsModal.tsx', status: 'added', additions: 95, deletions: 0 },
      { filename: 'src/context/ProjectContext.tsx', status: 'modified', additions: 40, deletions: 6 }
    ],
    linkedTaskId: 't5'
  },
  {
    sha: '33ebe861234567890abcdef1234567890abcdef1',
    shortSha: '33ebe86',
    message: 'feat(init): initialize Capstone repository with CapStoneFlow platform and documentation framework',
    description: 'Initial commit setting up Vite React TypeScript workspace, styling tokens, and project architecture.',
    authorName: 'Marc Andrei Regulacion',
    authorUsername: 'Realwaan',
    authorAvatar: 'https://github.com/Realwaan.png',
    date: '2026-08-12T09:00:00.000Z',
    url: 'https://github.com/Realwaan/capstone-project/commit/33ebe861234567890abcdef1234567890abcdef1',
    branch: 'main',
    verified: true,
    stats: { additions: 1250, deletions: 0, totalFiles: 47 },
    changedFiles: [
      { filename: 'package.json', status: 'added', additions: 45, deletions: 0 },
      { filename: 'vite.config.ts', status: 'added', additions: 30, deletions: 0 },
      { filename: 'src/App.tsx', status: 'added', additions: 180, deletions: 0 },
      { filename: 'src/index.css', status: 'added', additions: 320, deletions: 0 }
    ]
  }
];

export const initialPullRequests: GitHubPullRequest[] = [
  {
    number: 14,
    title: 'feat(auth): GitHub OAuth 2.0 PKCE Handshake & Session Provider',
    state: 'merged',
    author: 'Realwaan',
    authorAvatar: 'https://github.com/Realwaan.png',
    html_url: 'https://github.com/Realwaan/capstone-project/pull/14',
    branch: 'feature/github-oauth',
    targetBranch: 'main',
    createdAt: '2026-08-14',
    reviewStatus: 'approved',
    linkedTaskId: 't2'
  },
  {
    number: 15,
    title: 'feat(db): 3NF PostgreSQL Relational Schemas & Prisma Migrations',
    state: 'open',
    author: 'Jeremy-hub-prog',
    authorAvatar: 'https://github.com/Jeremy-hub-prog.png',
    html_url: 'https://github.com/Jeremy-hub-prog/capstone-project/pull/15',
    branch: 'feature/db-schema',
    targetBranch: 'main',
    createdAt: '2026-08-15',
    reviewStatus: 'pending',
    linkedTaskId: 't1'
  },
  {
    number: 16,
    title: 'feat(ui): Emil Kowalski Tactile Morphing Buttons & Spring Micro-interactions',
    state: 'open',
    author: 'Jeremy-hub-prog',
    authorAvatar: 'https://github.com/Jeremy-hub-prog.png',
    html_url: 'https://github.com/Jeremy-hub-prog/capstone-project/pull/16',
    branch: 'feature/design-system',
    targetBranch: 'main',
    createdAt: '2026-08-15',
    reviewStatus: 'pending',
    linkedTaskId: 't3'
  }
];
