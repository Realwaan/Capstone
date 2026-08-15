import { CapstoneProject, TeamMember, Task, MilestonePhase, ManuscriptChapter, RevisionItem, StandupEntry, ActivityLog } from '../types';

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
    name: 'Faculty Adviser Name',
    email: 'adviser@university.edu',
    department: 'Department of Computer Science / Engineering',
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
    name: 'Team Leader',
    email: 'leader@student.edu',
    role: 'leader',
    roleTitle: 'Project Lead & Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    color: '#6366f1'
  },
  {
    id: 'm2',
    name: 'Developer 1',
    email: 'developer@student.edu',
    role: 'developer',
    roleTitle: 'Backend / Core Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    color: '#10b981'
  },
  {
    id: 'm3',
    name: 'Developer 2',
    email: 'frontend@student.edu',
    role: 'developer',
    roleTitle: 'Frontend & UI/UX Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    color: '#ec4899'
  },
  {
    id: 'm4',
    name: 'Researcher / Writer',
    email: 'researcher@student.edu',
    role: 'researcher',
    roleTitle: 'Lead Technical Writer & QA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    color: '#f59e0b'
  },
  {
    id: 'm5',
    name: 'Faculty Adviser',
    email: 'adviser@university.edu',
    role: 'adviser',
    roleTitle: 'Capstone Adviser',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    color: '#8b5cf6'
  }
];

export const initialTasks: Task[] = [];

export const initialPhases: MilestonePhase[] = [
  {
    id: 1,
    title: 'Phase 1: Title Proposal, Problem Identification & Scope Definition',
    description: 'Official proposal defense, title approval, institutional review board (IRB) ethics screening, and panel alignment.',
    targetDate: '2026-09-15',
    status: 'in_progress',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd1', title: 'Topic Proposal Paper (15 pages)', completed: false, requiredForDefense: true },
      { id: 'd2', title: 'Signed Adviser & Panel Endorsement Form', completed: false, requiredForDefense: true },
      { id: 'd3', title: 'Proposal Slide Deck', completed: false, requiredForDefense: true },
      { id: 'd4', title: 'Preliminary Dataset / Tool Clearance', completed: false, requiredForDefense: false }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Architectural Design, UI/UX Mockups & Chapter 1–3 Manuscript',
    description: 'System modeling (DFD, UML, ERD), Figma high-fidelity wireframes, comprehensive Literature Review, and detailed Methodology.',
    targetDate: '2026-10-15',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd5', title: 'Full Chapter 1 to 3 Manuscript Draft', completed: false, requiredForDefense: true },
      { id: 'd6', title: 'Interactive Wireframe Prototype', completed: false, requiredForDefense: true },
      { id: 'd7', title: 'Database Schema & API Specifications', completed: false, requiredForDefense: true },
      { id: 'd8', title: 'Pre-Oral Defense Dry Run Presentation', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Core Implementation & Integration Sprints',
    description: 'Core functional modules development, frontend-backend integration, database connection, and automated tests.',
    targetDate: '2026-11-05',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd9', title: 'Core Backend API & Database Infrastructure', completed: false, requiredForDefense: true },
      { id: 'd10', title: 'Interactive Frontend Client & User Portal', completed: false, requiredForDefense: true },
      { id: 'd11', title: 'Real-time Features & Core Business Logic', completed: false, requiredForDefense: true },
      { id: 'd12', title: 'Automated Test Suite & CI/CD Pipeline', completed: false, requiredForDefense: false }
    ]
  },
  {
    id: 4,
    title: 'Phase 4: System Integration, Testing & Chapter 4 Results',
    description: 'End-to-end user evaluation with target evaluators, ISO 25010 quality benchmark testing, and statistical validation.',
    targetDate: '2026-11-20',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd13', title: 'User Evaluation Survey Data & Statistical Analysis', completed: false, requiredForDefense: true },
      { id: 'd14', title: 'Chapter 4: Results & Discussion Draft', completed: false, requiredForDefense: true },
      { id: 'd15', title: 'Adviser Revision Compliance Verification', completed: false, requiredForDefense: true },
      { id: 'd16', title: 'Production Staging Deployment', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 5,
    title: 'Phase 5: Final Oral Defense, Chapter 5 & Hardbound Manuscript Publishing',
    description: 'Formal Capstone defense before university panel, final revision matrix sign-off, software packaging, and institutional archive submission.',
    targetDate: '2026-11-30',
    status: 'upcoming',
    progressPercentage: 0,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd17', title: 'Complete 5-Chapter Hardbound Manuscript (Approved by Panel)', completed: false, requiredForDefense: true },
      { id: 'd18', title: 'Live Demonstration Presentation Deck', completed: false, requiredForDefense: true },
      { id: 'd19', title: 'Production Source Code Repository & Documentation Manual', completed: false, requiredForDefense: true },
      { id: 'd20', title: 'Signed Approval Sheets & Certificate of Copyright', completed: false, requiredForDefense: true }
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
    timestamp: 'Just now',
    userId: 'm1',
    action: 'initialized a fresh workflow',
    target: 'CapStoneFlow Workspace'
  }
];
