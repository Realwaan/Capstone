import { CapstoneProject, MilestonePhase, Task, NewProjectPayload, TeamMember } from '../types';
import { templateCapstoneTickets } from '../data/initialData';

export const AVAILABLE_REGIONS = [
  { id: 'ap-southeast-1', name: 'Singapore (ap-southeast-1)', flag: '🇸🇬', ping: '24ms' },
  { id: 'us-east-1', name: 'North Virginia (us-east-1)', flag: '🇺🇸', ping: '110ms' },
  { id: 'eu-central-1', name: 'Frankfurt (eu-central-1)', flag: '🇩🇪', ping: '160ms' },
  { id: 'ap-northeast-1', name: 'Tokyo (ap-northeast-1)', flag: '🇯🇵', ping: '68ms' },
  { id: 'us-west-1', name: 'North California (us-west-1)', flag: '🇺🇸', ping: '135ms' },
  { id: 'ap-southeast-2', name: 'Sydney (ap-southeast-2)', flag: '🇦🇺', ping: '92ms' }
];

export const AVAILABLE_ORGANIZATIONS = [
  'College of Computer Studies',
  'Department of Information Technology',
  'Faculty Research Laboratory',
  'Personal Academic Workspace'
];

export const cleanProjectTitle = (rawTitle: string): string => {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s*\[CF-[A-Za-z0-9_-]+\]/gi, '')
    .replace(/\s*\(CF-[A-Za-z0-9_-]+\)/gi, '')
    .trim();
};

export const createNewProjectInstance = (
  payload: NewProjectPayload,
  creatorProfile?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    githubUsername?: string;
    roleTitle?: string;
  }
): {
  project: CapstoneProject;
  phases: MilestonePhase[];
  tasks: Task[];
  members: TeamMember[];
} => {
  const sanitizedTitle = cleanProjectTitle(payload.title) || payload.title.trim();
  const randomSlug = Math.random().toString(36).substring(2, 8);
  const cleanTitleSlug = sanitizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 16);
  
  const projectRef = `${cleanTitleSlug}-${randomSlug}`;
  const projectId = `proj_${randomSlug}_${Date.now().toString().slice(-4)}`;
  const region = payload.region || 'ap-southeast-1';

  const trackType = payload.trackType || (payload.templatePreset === 'capstone_master' ? 'research_manuscript' : payload.templatePreset === 'hardware_iot' ? 'hardware_iot' : 'full_coding');
  const hasManuscript = payload.hasManuscript ?? (payload.templatePreset === 'capstone_master');

  const inviteCode = `CF-${randomSlug.toUpperCase()}`;

  const ownerId = creatorProfile?.id || (payload.ownerName ? `usr_${payload.ownerName.toLowerCase().replace(/\s+/g, '_')}` : 'usr_owner_main');
  const ownerName = creatorProfile?.name || payload.ownerName || 'Project Manager';
  const ownerEmail = creatorProfile?.email || 'manager@capstoneflow.app';
  const ownerAvatar = creatorProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=10b981&color=fff&bold=true`;
  const ownerRoleTitle = creatorProfile?.roleTitle || 'Project Manager / Lead Architect';

  const initialOwnerMember: TeamMember = {
    id: ownerId,
    name: ownerName,
    email: ownerEmail,
    role: 'leader',
    roleTitle: ownerRoleTitle,
    permissionLevel: 'owner',
    avatar: ownerAvatar,
    githubUsername: creatorProfile?.githubUsername,
    color: '#10b981'
  };

  const adviserName = payload.adviserName?.trim() || 'Faculty Adviser';
  const adviserEmail = payload.adviserEmail?.trim() || 'adviser@university.edu';
  const adviserDepartment = payload.adviserDepartment?.trim() || payload.organization || 'Computer Science Department';

  const initialAdviserMember: TeamMember = {
    id: `m_adviser_${projectId}`,
    name: adviserName,
    email: adviserEmail,
    role: 'adviser',
    roleTitle: 'Capstone Faculty Adviser',
    permissionLevel: 'adviser',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(adviserName)}&background=6366f1&color=fff&bold=true`,
    color: '#8b5cf6'
  };

  const project: CapstoneProject = {
    id: projectId,
    title: sanitizedTitle,
    subtitle: payload.subtitle?.trim() || 'Collaborative software engineering & capstone implementation workspace.',
    organization: payload.organization || 'College of Computer Studies',
    region,
    status: 'active',
    accessLevel: payload.accessLevel || 'private',
    createdById: ownerId,
    createdByName: ownerName,
    trackType,
    hasManuscript,
    inviteCode,
    userRole: 'owner',
    isOwner: true,
    memberCount: 2,
    collaborators: [
      {
        id: ownerId,
        name: ownerName,
        avatar: ownerAvatar,
        role: ownerRoleTitle,
        permission: 'owner'
      },
      {
        id: `m_adviser_${projectId}`,
        name: adviserName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(adviserName)}&background=6366f1&color=fff&bold=true`,
        role: 'Capstone Faculty Adviser',
        permission: 'adviser'
      }
    ],
    createdAt: new Date().toISOString(),
    targetDefenseDate: payload.targetDefenseDate || '2026-11-30',
    currentPhaseId: 1,
    overallProgress: 0,
    teamName: payload.teamName?.trim() || `${payload.title.trim()} Dev Team`,
    githubRepoUrl: payload.githubRepoUrl?.trim() || '',
    adviser: {
      name: adviserName,
      email: adviserEmail,
      department: adviserDepartment
    },
    panelMembers: [
      'Panel Chair / Lead Evaluator',
      'Technical Software Architect',
      'QA & DevOps Specialist'
    ]
  };

  const { phases, tasks } = generateStarterData(payload.templatePreset, projectId);

  return {
    project,
    phases,
    tasks,
    members: [initialOwnerMember, initialAdviserMember]
  };
};

const generateStarterData = (preset: NewProjectPayload['templatePreset'], projectId: string): {
  phases: MilestonePhase[];
  tasks: Task[];
} => {
  if (preset === 'blank_database') {
    const blankPhases: MilestonePhase[] = [
      {
        id: 1,
        title: 'Phase 1: Project Initialization',
        description: 'Initialize architecture, setup environment and database connections.',
        targetDate: '2026-09-30',
        status: 'in_progress',
        progressPercentage: 0,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_1`, title: 'Project Scope & Problem Statement Document', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_2`, title: 'Database Schema & Architecture Blueprint', completed: false, requiredForDefense: true }
        ]
      }
    ];
    return { phases: blankPhases, tasks: [] };
  }

  if (preset === 'agile_software' || preset === 'full_coding') {
    const agilePhases: MilestonePhase[] = [
      {
        id: 1,
        title: 'Sprint 1: Core Architecture & Auth Setup',
        description: 'Setup database schema, authentication flows, and baseline backend services.',
        targetDate: '2026-09-15',
        status: 'in_progress',
        progressPercentage: 15,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_a1`, title: 'Auth & JWT Token Service', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_a2`, title: 'Normalized PostgreSQL Schema & Migrations', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_a3`, title: 'REST / GraphQL API Endpoints Scaffolding', completed: false, requiredForDefense: true }
        ]
      },
      {
        id: 2,
        title: 'Sprint 2: Feature Development & UI/UX Matrix',
        description: 'Implement core modules, user dashboard, and real-time synchronization.',
        targetDate: '2026-10-15',
        status: 'upcoming',
        progressPercentage: 0,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_a4`, title: 'User Dashboard & Interactive Workflows', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_a5`, title: 'WebSocket Realtime Sync Channels', completed: false, requiredForDefense: false }
        ]
      },
      {
        id: 3,
        title: 'Sprint 3: CI/CD, QA Testing & Production Release',
        description: 'Comprehensive end-to-end testing, performance profiling, and cloud staging.',
        targetDate: '2026-11-15',
        status: 'upcoming',
        progressPercentage: 0,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_a6`, title: 'Automated Test Suite (Unit & E2E)', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_a7`, title: 'Staging Deployment & Load Testing Audit', completed: false, requiredForDefense: true }
        ]
      }
    ];

    const agileTasks: Task[] = [
      {
        id: `task_${projectId}_1`,
        title: 'Setup PostgreSQL Database and Row Level Security',
        description: 'Configure tables, foreign key constraints, indexes and RLS policies.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'database',
        assigneeId: '',
        phaseId: 1,
        storyPoints: 5,
        estimatedHours: 12,
        loggedHours: 0,
        dueDate: '2026-09-10',
        subtasks: [
          { id: `st_${projectId}_1`, title: 'Define tables in SQL schema', completed: false },
          { id: `st_${projectId}_2`, title: 'Test RLS policies with test users', completed: false }
        ],
        acceptanceCriteria: [
          { id: `ac_${projectId}_1`, text: 'PostgreSQL schema created and verified with zero syntax errors', completed: false },
          { id: `ac_${projectId}_2`, text: 'Row Level Security active on tables with appropriate access policies', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task_${projectId}_2`,
        title: 'Integrate GitHub OAuth 2.0 Client Authentication',
        description: 'Exchange authorization codes and establish persistent token sessions.',
        status: 'todo',
        priority: 'high',
        category: 'backend',
        assigneeId: '',
        phaseId: 1,
        storyPoints: 5,
        estimatedHours: 14,
        loggedHours: 0,
        dueDate: '2026-09-12',
        subtasks: [],
        acceptanceCriteria: [
          { id: `ac_${projectId}_3`, text: 'GitHub authorization flow returns profile token and updates presence session', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return { phases: agilePhases, tasks: agileTasks };
  }

  if (preset === 'hardware_iot') {
    const iotPhases: MilestonePhase[] = [
      {
        id: 1,
        title: 'Phase 1: Hardware Schematics & Component Interfacing',
        description: 'Microcontroller selection, pinout schematics, sensor bench tests, and circuit diagram verification.',
        targetDate: '2026-09-20',
        status: 'in_progress',
        progressPercentage: 20,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_iot1`, title: 'Circuit Schematics & BOM Component List', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_iot2`, title: 'Sensor Bench Calibration & Signal Noise Report', completed: false, requiredForDefense: true }
        ]
      },
      {
        id: 2,
        title: 'Phase 2: Embedded Firmware & Edge Processing',
        description: 'C++/MicroPython firmware implementation, MQTT telemetry protocols, and edge filtering.',
        targetDate: '2026-10-20',
        status: 'upcoming',
        progressPercentage: 0,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_iot3`, title: 'Microcontroller Embedded Firmware & Telemetry Loop', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_iot4`, title: 'MQTT / HTTP Gateway Payload Optimization', completed: false, requiredForDefense: true }
        ]
      },
      {
        id: 3,
        title: 'Phase 3: Cloud IoT Dashboard & Real-Time Analytics',
        description: 'Web dashboard integration, real-time sensor streams, alert thresholds, and field testing.',
        targetDate: '2026-11-20',
        status: 'upcoming',
        progressPercentage: 0,
        adviserSignOff: false,
        keyDeliverables: [
          { id: `deliv_${projectId}_iot5`, title: 'Real-Time Sensor Telemetry Dashboard', completed: false, requiredForDefense: true },
          { id: `deliv_${projectId}_iot6`, title: 'Pilot Field Validation & Accuracy Benchmark', completed: false, requiredForDefense: true }
        ]
      }
    ];

    const iotTasks: Task[] = [
      {
        id: `task_${projectId}_iot1`,
        title: 'Design Circuit Schematic & Verify Sensor Voltage Levels',
        description: 'Assemble breadboard prototype, verify 3.3V / 5.0V logic level shifters and power rail decoupling capacitors.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'backend',
        assigneeId: '',
        phaseId: 1,
        storyPoints: 5,
        estimatedHours: 16,
        loggedHours: 0,
        dueDate: '2026-09-15',
        subtasks: [
          { id: `st_${projectId}_iot1`, title: 'Verify I2C pullup resistor values', completed: false },
          { id: `st_${projectId}_iot2`, title: 'Test ADC noise with analog sensors', completed: false }
        ],
        acceptanceCriteria: [
          { id: `ac_${projectId}_iot1`, text: 'Circuit schematic verified and sensor voltage levels tested within tolerance', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task_${projectId}_iot2`,
        title: 'Implement MQTT Telemetry Publish Routine on MCU',
        description: 'Write periodic telemetry publisher transmitting JSON payloads over WiFi/Cellular.',
        status: 'todo',
        priority: 'high',
        category: 'backend',
        assigneeId: '',
        phaseId: 2,
        storyPoints: 5,
        estimatedHours: 12,
        loggedHours: 0,
        dueDate: '2026-10-10',
        subtasks: [],
        acceptanceCriteria: [
          { id: `ac_${projectId}_iot2`, text: 'MQTT telemetry packets successfully delivered and parsed by broker', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return { phases: iotPhases, tasks: iotTasks };
  }

  // Default: 'capstone_master'
  const standardPhases: MilestonePhase[] = [
    {
      id: 1,
      title: 'Phase 1: Title Proposal & Literature Review',
      description: 'Topic formulation, IEEE literature analysis, objective synthesis, and Title Defense approval.',
      targetDate: '2026-09-15',
      status: 'in_progress',
      progressPercentage: 10,
      adviserSignOff: false,
      keyDeliverables: [
        { id: `deliv_${projectId}_1`, title: 'Title Proposal & Problem Statement Document', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_2`, title: 'Chapter 1: Introduction, Scope & Limitations', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_3`, title: 'Chapter 2: Synthesis of Related Literature (IEEE/ACM)', completed: false, requiredForDefense: true }
      ]
    },
    {
      id: 2,
      title: 'Phase 2: Architectural Design & Prototype Defense',
      description: 'System architecture, ERD database design, UI/UX prototyping, and Proposal Defense clearance.',
      targetDate: '2026-10-15',
      status: 'upcoming',
      progressPercentage: 0,
      adviserSignOff: false,
      keyDeliverables: [
        { id: `deliv_${projectId}_4`, title: 'Chapter 3: Methodology & Mathematical Formulation', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_5`, title: 'Entity Relationship Diagram & 3NF PostgreSQL Schema', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_6`, title: 'Figma High-Fidelity UI/UX Prototype', completed: false, requiredForDefense: true }
      ]
    },
    {
      id: 3,
      title: 'Phase 3: Implementation, Coding & Integration',
      description: 'Sprint executions, GitHub commits, unit testing, and full module integration.',
      targetDate: '2026-11-10',
      status: 'upcoming',
      progressPercentage: 0,
      adviserSignOff: false,
      keyDeliverables: [
        { id: `deliv_${projectId}_7`, title: 'Frontend & Backend Core API Services', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_8`, title: 'Unit, Integration, & Security Test Reports', completed: false, requiredForDefense: true }
      ]
    },
    {
      id: 4,
      title: 'Phase 4: Final Defense, Manuscript & Panel Verification',
      description: 'Final Defense demonstration, adviser revision compliance verification, and Institutional Repository archiving.',
      targetDate: '2026-11-30',
      status: 'upcoming',
      progressPercentage: 0,
      adviserSignOff: false,
      keyDeliverables: [
        { id: `deliv_${projectId}_9`, title: 'Complete 5-Chapter Bound Manuscript PDF', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_10`, title: 'Adviser Revision Compliance Sign-Off Sheet', completed: false, requiredForDefense: true },
        { id: `deliv_${projectId}_11`, title: 'Production Live Demonstration Deployment', completed: false, requiredForDefense: true }
      ]
    }
  ];

  // Prefix template task IDs with project reference
  const standardTasks: Task[] = templateCapstoneTickets.map(t => ({
    ...t,
    id: `${t.id}_${projectId}`
  }));

  return { phases: standardPhases, tasks: standardTasks };
};
