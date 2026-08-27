import { CapstoneProject, TeamMember, Task, MilestonePhase, ManuscriptChapter, RevisionItem, StandupEntry, ActivityLog, GitHubCommit, GitHubPullRequest } from '../types';

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  return fallback;
};

export const initialProject: CapstoneProject = {
  id: getEnv('VITE_PROJECT_ID', 'capstone-proj-001'),
  title: getEnv('VITE_PROJECT_TITLE', ''),
  subtitle: getEnv('VITE_PROJECT_SUBTITLE', ''),
  organization: getEnv('VITE_ORGANIZATION', ''),
  status: 'active',
  accessLevel: 'private',
  createdById: 'usr_owner_main',
  createdByName: 'Project Lead',
  trackType: 'full_coding',
  hasManuscript: false,
  inviteCode: getEnv('VITE_PROJECT_INVITE_CODE', ''),
  userRole: 'owner',
  isOwner: true,
  memberCount: 1,
  collaborators: [],
  targetDefenseDate: getEnv('VITE_TARGET_DEFENSE_DATE', ''),
  proposalDefenseDate: getEnv('VITE_PROPOSAL_DEFENSE_DATE', ''),
  currentPhaseId: 1,
  overallProgress: 0,
  teamName: getEnv('VITE_TEAM_NAME', ''),
  githubRepoUrl: getEnv('VITE_GITHUB_REPO_URL', ''),
  adviser: {
    name: getEnv('VITE_ADVISER_NAME', ''),
    email: getEnv('VITE_ADVISER_EMAIL', ''),
    department: getEnv('VITE_ADVISER_DEPARTMENT', ''),
  },
  panelMembers: []
};

export const initialMembers: TeamMember[] = [
  {
    id: 'usr_owner_main',
    name: 'Project Lead',
    email: '',
    role: 'leader',
    roleTitle: 'Project Manager / Lead Architect',
    permissionLevel: 'owner',
    avatar: 'https://ui-avatars.com/api/?name=Project+Lead&background=10b981&color=fff&bold=true',
    color: '#10b981'
  }
];

export const templateCapstoneTickets: Task[] = [];

export const initialTasks: Task[] = [];

export const initialPhases: MilestonePhase[] = [
  {
    id: 1,
    title: 'Phase 1: Architecture & Technical System Specification',
    description: 'System modeling (DFD, UML, ERD), API contracts, repository configuration, tech stack baseline, and milestone roadmap alignment.',
    targetDate: '',
    status: 'in_progress',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd1', title: 'System Architecture & Data Flow Diagrams', completed: false, requiredForDefense: true },
      { id: 'd2', title: '3NF Relational Database Schema & Data Dictionary', completed: false, requiredForDefense: true },
      { id: 'd3', title: 'API Endpoint Specifications & OpenAPI Contract', completed: false, requiredForDefense: true },
      { id: 'd4', title: 'GitHub Monorepo & Branch Protection Rules Setup', completed: false, requiredForDefense: false }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Database Modeling, Auth Engine & Core Backend APIs',
    description: 'PostgreSQL database implementation with Prisma ORM, GitHub OAuth 2.0 authentication middleware, and core CRUD services.',
    targetDate: '',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd5', title: 'PostgreSQL Database Migrations & Seeders', completed: false, requiredForDefense: true },
      { id: 'd6', title: 'GitHub OAuth 2.0 & Session Middleware', completed: false, requiredForDefense: true },
      { id: 'd7', title: 'Task & Standup Management REST/GraphQL APIs', completed: false, requiredForDefense: true },
      { id: 'd8', title: 'Role-Based Access Control (RBAC) Guards', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Frontend UI, State Management & Feature Integration',
    description: 'React client portal with tactile physics, Discord bot ticket claim pipeline, and real-time state synchronization.',
    targetDate: '',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd9', title: 'Academic Task Matrix & Kanban Board with Drag & Drop', completed: false, requiredForDefense: true },
      { id: 'd10', title: 'Discord Slash Command Bot Lifecycle (/claim, /resolved, /reviewed)', completed: false, requiredForDefense: true },
      { id: 'd11', title: 'Asynchronous Daily Sprint Standup Feed', completed: false, requiredForDefense: true },
      { id: 'd12', title: 'Live GitHub Repository & PR Sync Engine', completed: false, requiredForDefense: false }
    ]
  },
  {
    id: 4,
    title: 'Phase 4: Quality Assurance, Security Auditing & Automated Testing',
    description: 'Comprehensive test automation with Vitest unit tests, Playwright E2E suites, OWASP security audit, and bug bash sprints.',
    targetDate: '',
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
    targetDate: '',
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
    lastUpdated: '',
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
    lastUpdated: '',
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
    lastUpdated: '',
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
    lastUpdated: '',
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
    lastUpdated: '',
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

export const initialActivityLogs: ActivityLog[] = [];

export const initialCommits: GitHubCommit[] = [];

export const initialPullRequests: GitHubPullRequest[] = [];
