import { CapstoneProject, TeamMember, Task, MilestonePhase, ManuscriptChapter, RevisionItem, StandupEntry, ActivityLog } from '../types';

export const initialProject: CapstoneProject = {
  id: 'capstone-proj-001',
  title: 'MediScan AI: Multi-Modal Clinical Workflow & Diagnostic Triaging System',
  subtitle: 'An intelligent decision-support web platform integrating deep learning computer vision and automated EHR analytics for regional clinics.',
  targetDefenseDate: '2026-11-20',
  proposalDefenseDate: '2026-06-15',
  currentPhaseId: 3,
  overallProgress: 68,
  teamName: 'Team Synapse 04',
  adviser: {
    name: 'Dr. Arthur C. Martinez, Ph.D.',
    email: 'a.martinez@university.edu',
    department: 'Department of Computer Science & Software Engineering',
  },
  panelMembers: [
    'Prof. Elena Rostova (Panel Chair / AI Specialist)',
    'Engr. Michael Tan (Industry Panelist / Cloud Architect)',
    'Dr. Rachel Gomez (Ethics & Healthcare Informatics)'
  ]
};

export const initialMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Alex Vance',
    email: 'alex.vance@student.edu',
    role: 'leader',
    roleTitle: 'Project Lead & Full-Stack Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    color: '#6366f1'
  },
  {
    id: 'm2',
    name: 'Marcus Chen',
    email: 'marcus.chen@student.edu',
    role: 'developer',
    roleTitle: 'ML Engineer & Backend Dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    color: '#10b981'
  },
  {
    id: 'm3',
    name: 'Sophia Patel',
    email: 'sophia.patel@student.edu',
    role: 'developer',
    roleTitle: 'Frontend & UI/UX Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    color: '#ec4899'
  },
  {
    id: 'm4',
    name: 'David Kim',
    email: 'david.kim@student.edu',
    role: 'researcher',
    roleTitle: 'Lead Technical Writer & QA Analyst',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    color: '#f59e0b'
  },
  {
    id: 'm5',
    name: 'Dr. Arthur C. Martinez',
    email: 'a.martinez@university.edu',
    role: 'adviser',
    roleTitle: 'Capstone Adviser',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    color: '#8b5cf6'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Design System Architecture & ERD for Triaging Module',
    description: 'Create normalized database schema including Patient, TriageQueue, ModelInference, and AuditLog tables with full foreign key constraints.',
    status: 'done',
    priority: 'high',
    category: 'code',
    assigneeId: 'm1',
    storyPoints: 5,
    estimatedHours: 16,
    loggedHours: 18,
    dueDate: '2026-07-10',
    phaseId: 2,
    subtasks: [
      { id: 'sub-1', title: 'Draft ERD diagram in Mermaid / dbdiagram.io', completed: true },
      { id: 'sub-2', title: 'Define PostgreSQL Prisma schema file', completed: true },
      { id: 'sub-3', title: 'Verify indexing on high-frequency patient lookup query', completed: true }
    ],
    deliverableUrl: 'https://github.com/team-synapse/mediscan/pull/12',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-10'
  },
  {
    id: 'task-102',
    title: 'Draft Chapter 2: Literature Review on CNN vs Vision Transformers in Radiography',
    description: 'Synthesize 25 peer-reviewed papers (2021-2025) comparing ResNet-50, EfficientNet-B4, and ViT architectures for pulmonary opacity detection.',
    status: 'done',
    priority: 'urgent',
    category: 'manuscript',
    assigneeId: 'm4',
    storyPoints: 8,
    estimatedHours: 24,
    loggedHours: 26,
    dueDate: '2026-07-18',
    phaseId: 2,
    subtasks: [
      { id: 'sub-4', title: 'Compile IEEE / PubMed citations in Zotero', completed: true },
      { id: 'sub-5', title: 'Write Conceptual Framework Matrix', completed: true },
      { id: 'sub-6', title: 'Format references according to APA 7th Edition style', completed: true }
    ],
    deliverableUrl: 'https://docs.google.com/document/d/chapter2-draft',
    createdAt: '2026-07-02',
    updatedAt: '2026-07-18'
  },
  {
    id: 'task-103',
    title: 'Train & Fine-tune PyTorch Model on NIH ChestX-ray14 Dataset',
    description: 'Execute transfer learning pipeline using pre-trained weights with focal loss to counter severe class imbalance.',
    status: 'done',
    priority: 'high',
    category: 'research',
    assigneeId: 'm2',
    storyPoints: 8,
    estimatedHours: 32,
    loggedHours: 35,
    dueDate: '2026-07-28',
    phaseId: 3,
    subtasks: [
      { id: 'sub-7', title: 'Data augmentation (random affine + elastic deformation)', completed: true },
      { id: 'sub-8', title: '5-fold cross-validation run on GPU cluster', completed: true },
      { id: 'sub-9', title: 'Generate confusion matrix and ROC-AUC curve graphs', completed: true }
    ],
    deliverableUrl: 'https://wandb.ai/synapse/mediscan-run-48',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-28'
  },
  {
    id: 'task-104',
    title: 'Implement Interactive DICOM Viewer with Zoom & Windowing in Web Client',
    description: 'Integrate Cornerstone.js / WebGL canvas for fast multi-slice DICOM radiological viewing with WW/WC adjustment presets.',
    status: 'in_progress',
    priority: 'high',
    category: 'code',
    assigneeId: 'm3',
    storyPoints: 5,
    estimatedHours: 20,
    loggedHours: 14,
    dueDate: '2026-08-22',
    phaseId: 3,
    subtasks: [
      { id: 'sub-10', title: 'CornerstoneJS loader configuration', completed: true },
      { id: 'sub-11', title: 'Implement HU (Hounsfield Unit) window level presets (Lung, Bone, Soft Tissue)', completed: true },
      { id: 'sub-12', title: 'Add Grad-CAM heatmap overlay toggle with opacity slider', completed: false }
    ],
    deliverableUrl: 'https://github.com/team-synapse/mediscan/pull/24',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-14'
  },
  {
    id: 'task-105',
    title: 'Implement Role-Based JWT Authentication & Doctor Audit Trail',
    description: 'Secure API endpoints with refresh token rotation and HIPAA-compliant audit logging for every patient record accessed.',
    status: 'peer_review',
    priority: 'high',
    category: 'code',
    assigneeId: 'm1',
    storyPoints: 5,
    estimatedHours: 15,
    loggedHours: 13,
    dueDate: '2026-08-20',
    phaseId: 3,
    subtasks: [
      { id: 'sub-13', title: 'Role guards for Clinician, Radiologist, Admin', completed: true },
      { id: 'sub-14', title: 'Automated audit log middleware with IP & UserAgent', completed: true },
      { id: 'sub-15', title: 'Unit test auth interceptor with Jest', completed: false }
    ],
    deliverableUrl: 'https://github.com/team-synapse/mediscan/pull/27',
    createdAt: '2026-08-04',
    updatedAt: '2026-08-15'
  },
  {
    id: 'task-106',
    title: 'Draft Chapter 3: Research Methodology & Evaluation Metrics',
    description: 'Document the Agile Scrum methodology, System Architecture, dataset sanitization procedures, and ISO/IEC 25010 software quality evaluation instrument.',
    status: 'adviser_review',
    priority: 'urgent',
    category: 'manuscript',
    assigneeId: 'm4',
    storyPoints: 8,
    estimatedHours: 22,
    loggedHours: 24,
    dueDate: '2026-08-18',
    phaseId: 3,
    subtasks: [
      { id: 'sub-16', title: 'Design architectural block diagrams in high resolution', completed: true },
      { id: 'sub-17', title: 'Detail ISO/IEC 25010 Likert-scale questionnaire', completed: true },
      { id: 'sub-18', title: 'Incorporate ethics board protocol approval details', completed: true }
    ],
    deliverableUrl: 'https://docs.google.com/document/d/chapter3-submitted',
    createdAt: '2026-08-02',
    updatedAt: '2026-08-15'
  },
  {
    id: 'task-107',
    title: 'Develop Real-time WebSockets Triage Queue Dispatcher',
    description: 'Broadcast instant alert notifications when high-urgency scan results (e.g. Tension Pneumothorax probability > 85%) are identified.',
    status: 'todo',
    priority: 'medium',
    category: 'code',
    assigneeId: 'm2',
    storyPoints: 3,
    estimatedHours: 12,
    loggedHours: 0,
    dueDate: '2026-08-29',
    phaseId: 3,
    subtasks: [
      { id: 'sub-19', title: 'Set up Socket.IO event channels', completed: false },
      { id: 'sub-20', title: 'Implement audio-visual alert triggers on clinician dashboard', completed: false },
      { id: 'sub-21', title: 'Test disconnect / automatic reconnection heartbeat', completed: false }
    ],
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10'
  },
  {
    id: 'task-108',
    title: 'Conduct Usability Testing with 10 Clinical Practitioners (ISO 25010 Evaluation)',
    description: 'Execute controlled task evaluation protocol measuring SUS (System Usability Scale), Time-on-Task, and diagnostic confidence scores.',
    status: 'backlog',
    priority: 'medium',
    category: 'testing',
    assigneeId: 'm4',
    storyPoints: 5,
    estimatedHours: 25,
    loggedHours: 0,
    dueDate: '2026-09-15',
    phaseId: 4,
    subtasks: [
      { id: 'sub-22', title: 'Prepare Consent Forms & Task Scripts', completed: false },
      { id: 'sub-23', title: 'Conduct live recorded testing sessions', completed: false },
      { id: 'sub-24', title: 'Tabulate ANOVA & Likert statistical summaries in SPSS/Python', completed: false }
    ],
    createdAt: '2026-08-12',
    updatedAt: '2026-08-12'
  },
  {
    id: 'task-109',
    title: 'Build Automated PDF Progress Report Generator (CapStoneFlow module)',
    description: 'Create 1-click export functionality aggregating completed sprint cards, weekly standups, and adviser revision statuses into an official PDF document.',
    status: 'in_progress',
    priority: 'medium',
    category: 'code',
    assigneeId: 'm3',
    storyPoints: 3,
    estimatedHours: 10,
    loggedHours: 6,
    dueDate: '2026-08-25',
    phaseId: 3,
    subtasks: [
      { id: 'sub-25', title: 'Design formal University report header & template', completed: true },
      { id: 'sub-26', title: 'Implement jsPDF table generation engine', completed: true },
      { id: 'sub-27', title: 'Add signature line blocks for Adviser & Panel', completed: false }
    ],
    deliverableUrl: 'https://github.com/team-synapse/mediscan/pull/31',
    createdAt: '2026-08-12',
    updatedAt: '2026-08-15'
  }
];

export const initialPhases: MilestonePhase[] = [
  {
    id: 1,
    title: 'Phase 1: Title Proposal, Problem Identification & Scope Definition',
    description: 'Official proposal defense, title approval, institutional review board (IRB) ethics screening, and panel alignment.',
    targetDate: '2026-06-15',
    status: 'completed',
    progressPercentage: 100,
    adviserSignOff: true,
    signedOffDate: '2026-06-16',
    keyDeliverables: [
      { id: 'd1', title: 'Topic Proposal Paper (15 pages)', completed: true, requiredForDefense: true },
      { id: 'd2', title: 'Signed Adviser & Panel Endorsement Form', completed: true, requiredForDefense: true },
      { id: 'd3', title: 'Proposal Slide Deck (12 slides)', completed: true, requiredForDefense: true },
      { id: 'd4', title: 'Preliminary Dataset License Clearance', completed: true, requiredForDefense: false }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Architectural Design, UI/UX Mockups & Chapter 1–3 Manuscript',
    description: 'System modeling (DFD, UML, ERD), Figma high-fidelity wireframes, comprehensive Literature Review, and detailed Methodology.',
    targetDate: '2026-07-25',
    status: 'completed',
    progressPercentage: 100,
    adviserSignOff: true,
    signedOffDate: '2026-07-26',
    keyDeliverables: [
      { id: 'd5', title: 'Full Chapter 1 to 3 Manuscript Draft', completed: true, requiredForDefense: true },
      { id: 'd6', title: 'Figma Interactive Prototype (Mobile & Desktop)', completed: true, requiredForDefense: true },
      { id: 'd7', title: 'Database Schema & API Specifications', completed: true, requiredForDefense: true },
      { id: 'd8', title: 'Pre-Oral Defense Dry Run Presentation', completed: true, requiredForDefense: true }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Core Implementation, Model Training & Integration Sprints',
    description: 'Development of computer vision pipeline, DICOM web interface, triage queue engine, and secure doctor authentication.',
    targetDate: '2026-09-05',
    status: 'in_progress',
    progressPercentage: 72,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd9', title: 'Working Computer Vision Deep Learning Engine (ROC > 0.88)', completed: true, requiredForDefense: true },
      { id: 'd10', title: 'Interactive DICOM Viewer Web Module', completed: false, requiredForDefense: true },
      { id: 'd11', title: 'Real-time Push Notification & Triage Dispatcher', completed: false, requiredForDefense: true },
      { id: 'd12', title: 'Continuous Integration (CI/CD) & Automated Test Suite', completed: true, requiredForDefense: false }
    ]
  },
  {
    id: 4,
    title: 'Phase 4: System Integration, Clinical Testing & Chapter 4 Results',
    description: 'End-to-end user evaluation with 10 medical practitioners, ISO 25010 quality benchmark testing, and statistical validation.',
    targetDate: '2026-10-15',
    status: 'upcoming',
    progressPercentage: 15,
    adviserSignOff: false,
    keyDeliverables: [
      { id: 'd13', title: 'Complete User Evaluation Survey Data & Statistical Analysis', completed: false, requiredForDefense: true },
      { id: 'd14', title: 'Chapter 4: Results & Discussion Draft', completed: false, requiredForDefense: true },
      { id: 'd15', title: 'Adviser Revision Compliance Verification', completed: false, requiredForDefense: true },
      { id: 'd16', title: 'Production Cloud Staging Deployment', completed: false, requiredForDefense: true }
    ]
  },
  {
    id: 5,
    title: 'Phase 5: Final Oral Defense, Chapter 5 & Hardbound Manuscript Publishing',
    description: 'Formal Capstone defense before university panel, final revision matrix sign-off, software packaging, and institutional archive submission.',
    targetDate: '2026-11-20',
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
    wordCount: 4250,
    targetWordCount: 4500,
    docUrl: 'https://docs.google.com/document/d/chapter1-synapse',
    lastUpdated: '2026-07-20',
    adviserStatus: 'approved',
    sections: [
      { id: 'c1-s1', title: '1.1 Background of the Study', status: 'adviser_approved', pageEstimate: '3-4 pages', completed: true },
      { id: 'c1-s2', title: '1.2 Statement of the Problem', status: 'adviser_approved', pageEstimate: '2 pages', completed: true },
      { id: 'c1-s3', title: '1.3 Research Objectives (General & Specific)', status: 'adviser_approved', pageEstimate: '1-2 pages', completed: true },
      { id: 'c1-s4', title: '1.4 Scope and Delimitation', status: 'adviser_approved', pageEstimate: '2 pages', completed: true },
      { id: 'c1-s5', title: '1.5 Significance of the Study', status: 'adviser_approved', pageEstimate: '2 pages', completed: true }
    ]
  },
  {
    id: 2,
    chapterNumber: 2,
    title: 'Review of Related Literature & Studies (RRL)',
    subtitle: 'Theoretical framework, synthesis of state-of-the-art AI diagnostics, and research gap.',
    wordCount: 8800,
    targetWordCount: 8500,
    docUrl: 'https://docs.google.com/document/d/chapter2-synapse',
    lastUpdated: '2026-07-22',
    adviserStatus: 'approved',
    sections: [
      { id: 'c2-s1', title: '2.1 Radiography and Emergency Triaging Bottlenecks', status: 'adviser_approved', pageEstimate: '5 pages', completed: true },
      { id: 'c2-s2', title: '2.2 Deep Learning Architectures in Medical Imaging', status: 'adviser_approved', pageEstimate: '7 pages', completed: true },
      { id: 'c2-s3', title: '2.3 Synthesis of Related Literature', status: 'adviser_approved', pageEstimate: '3 pages', completed: true },
      { id: 'c2-s4', title: '2.4 Conceptual Framework (IPO / System Model)', status: 'adviser_approved', pageEstimate: '2 pages', completed: true },
      { id: 'c2-s5', title: '2.5 Definition of Terms', status: 'adviser_approved', pageEstimate: '2 pages', completed: true }
    ]
  },
  {
    id: 3,
    chapterNumber: 3,
    title: 'Methodology & System Architecture',
    subtitle: 'Research design, development model (Agile Scrum), dataset curation, and testing protocols.',
    wordCount: 6400,
    targetWordCount: 6500,
    docUrl: 'https://docs.google.com/document/d/chapter3-synapse',
    lastUpdated: '2026-08-14',
    adviserStatus: 'in_review',
    sections: [
      { id: 'c3-s1', title: '3.1 Research & Software Engineering Paradigm', status: 'adviser_approved', pageEstimate: '3 pages', completed: true },
      { id: 'c3-s2', title: '3.2 System Architecture & Component Design', status: 'adviser_approved', pageEstimate: '4 pages', completed: true },
      { id: 'c3-s3', title: '3.3 Data Gathering, Sanitization & Preprocessing', status: 'peer_review', pageEstimate: '3 pages', completed: true },
      { id: 'c3-s4', title: '3.4 Neural Network Training & Validation Protocol', status: 'peer_review', pageEstimate: '4 pages', completed: true },
      { id: 'c3-s5', title: '3.5 ISO/IEC 25010 Quality Evaluation Framework', status: 'drafting', pageEstimate: '3 pages', completed: false }
    ]
  },
  {
    id: 4,
    chapterNumber: 4,
    title: 'Results, Analysis & System Evaluation',
    subtitle: 'Model benchmark figures, performance metrics, usability evaluation, and clinical feedback.',
    wordCount: 1800,
    targetWordCount: 7000,
    docUrl: 'https://docs.google.com/document/d/chapter4-synapse',
    lastUpdated: '2026-08-10',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c4-s1', title: '4.1 Model Performance Evaluation (ROC, F1, Sensitivity)', status: 'drafting', pageEstimate: '5 pages', completed: false },
      { id: 'c4-s2', title: '4.2 System Response Time & Latency Benchmarks', status: 'drafting', pageEstimate: '3 pages', completed: false },
      { id: 'c4-s3', title: '4.3 ISO 25010 Usability Survey Findings (SUS Score)', status: 'not_started', pageEstimate: '4 pages', completed: false },
      { id: 'c4-s4', title: '4.4 Comparative Analysis with Existing Clinical Baselines', status: 'not_started', pageEstimate: '3 pages', completed: false }
    ]
  },
  {
    id: 5,
    chapterNumber: 5,
    title: 'Summary, Conclusions & Recommendations',
    subtitle: 'Synthesis of findings, conclusions drawn, real-world deployment roadmap, and future research.',
    wordCount: 0,
    targetWordCount: 3000,
    docUrl: 'https://docs.google.com/document/d/chapter5-synapse',
    lastUpdated: '2026-08-01',
    adviserStatus: 'not_submitted',
    sections: [
      { id: 'c5-s1', title: '5.1 Summary of Findings', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s2', title: '5.2 Conclusions', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s3', title: '5.3 Practical & Policy Recommendations', status: 'not_started', pageEstimate: '2 pages', completed: false },
      { id: 'c5-s4', title: '5.4 Future Work & Limitations', status: 'not_started', pageEstimate: '1 page', completed: false }
    ]
  }
];

export const initialRevisions: RevisionItem[] = [
  {
    id: 'rev-01',
    date: '2026-07-24',
    source: 'Dr. Arthur C. Martinez (Adviser)',
    comment: 'In Chapter 2, please provide deeper discussion comparing Vision Transformers with traditional ResNet CNNs regarding compute overhead in rural clinic deployments.',
    chapterOrComponent: 'Chapter 2: Section 2.2',
    actionTaken: 'Added 3 new pages (Section 2.2.4) reviewing computational complexity, FLOPs count, and memory constraints for edge server inference in remote clinics.',
    status: 'verified',
    resolvedDate: '2026-07-28',
    verifiedBy: 'Dr. Arthur C. Martinez'
  },
  {
    id: 'rev-02',
    date: '2026-08-05',
    source: 'Prof. Elena Rostova (Panelist)',
    comment: 'Ensure dataset sanitization explicitly mentions removal of patient protected health information (PHI) under HIPAA / Data Privacy Act 2012 guidelines.',
    chapterOrComponent: 'Chapter 3: Section 3.3',
    actionTaken: 'Updated Section 3.3 with explicit anonymization pseudocode and DICOM header scrubbing protocol.',
    status: 'resolved',
    resolvedDate: '2026-08-12',
    verifiedBy: 'David Kim'
  },
  {
    id: 'rev-03',
    date: '2026-08-14',
    source: 'Dr. Arthur C. Martinez (Adviser)',
    comment: 'Provide confidence interval (95% CI) calculations for all ROC-AUC and Sensitivity scores presented in the preliminary results.',
    chapterOrComponent: 'Chapter 4 & Model Testing',
    actionTaken: 'Bootstrapping script configured in Python; currently computing 1,000 resamples for statistical robustness.',
    status: 'in_progress'
  },
  {
    id: 'rev-04',
    date: '2026-08-15',
    source: 'Engr. Michael Tan (Industry Panelist)',
    comment: 'The user interface must provide an obvious visual fallback when internet connectivity to the GPU server drops during urgent triage.',
    chapterOrComponent: 'Frontend UI / DICOM Module',
    actionTaken: 'Pending offline caching service worker implementation.',
    status: 'pending'
  }
];

export const initialStandups: StandupEntry[] = [
  {
    id: 'std-1',
    memberId: 'm1',
    date: '2026-08-15',
    yesterdayAccomplished: 'Finished role-based authentication middleware and patient audit logging tables.',
    todayPlan: 'Review Sophia’s DICOM viewer PR and test WebSocket connection resiliency.',
    blockers: 'None currently.'
  },
  {
    id: 'std-2',
    memberId: 'm2',
    date: '2026-08-15',
    yesterdayAccomplished: 'Generated 95% Confidence Interval bootstrapping scripts for ROC curve comparison.',
    todayPlan: 'Optimize model ONNX runtime quantization for 4x faster CPU inference fallback.',
    blockers: 'Waiting for server GPU quota allocation.'
  },
  {
    id: 'std-3',
    memberId: 'm3',
    date: '2026-08-15',
    yesterdayAccomplished: 'Added HU window level presets (Lung, Bone, Soft Tissue) to CornerstoneJS viewer.',
    todayPlan: 'Connect Grad-CAM overlay toggle and fine-tune colormap opacity controls.',
    blockers: 'Need sample multi-frame CT DICOM file for testing multi-slice scroll.'
  },
  {
    id: 'std-4',
    memberId: 'm4',
    date: '2026-08-15',
    yesterdayAccomplished: 'Revised Chapter 3 Section 3.3 based on Prof. Rostova’s ethics feedback.',
    todayPlan: 'Draft ISO/IEC 25010 survey questions for clinical evaluator testing next month.',
    blockers: 'Waiting for Dr. Martinez’s feedback on Chapter 3 manuscript submission.'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '10 minutes ago',
    userId: 'm4',
    action: 'submitted manuscript for review',
    target: 'Chapter 3: Methodology & System Architecture'
  },
  {
    id: 'act-2',
    timestamp: '2 hours ago',
    userId: 'm3',
    action: 'updated progress on task',
    target: 'Interactive DICOM Viewer (70% done)'
  },
  {
    id: 'act-3',
    timestamp: '5 hours ago',
    userId: 'm5',
    action: 'added new revision note',
    target: 'Chapter 4: Confidence Interval requirements'
  },
  {
    id: 'act-4',
    timestamp: 'Yesterday',
    userId: 'm1',
    action: 'completed pull request',
    target: 'JWT Auth & Doctor Audit Trail'
  }
];
