export interface AIUXWorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  phase: string;
  estimatedHours: number;
  storyPoints: number;
  category: 'architecture' | 'design' | 'feature' | 'testing' | 'docs' | 'frontend' | 'backend';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  problemStatement: string;
  whatToFix: string[];
  acceptanceCriteria: string[];
  relatedFiles: string[];
  aiPromptTemplate: string;
}

export interface AIUXWorkflow {
  id: string;
  title: string;
  tagline: string;
  category: 'Design' | 'Product' | 'Research' | 'Engineering' | 'Accessibility';
  duration: string;
  promptCount: number;
  color: string;
  description: string;
  deliverables: string[];
  steps: AIUXWorkflowStep[];
}

export const AI_UX_WORKFLOWS: AIUXWorkflow[] = [
  {
    id: 'design-sprint',
    title: '5-Day Design Sprint',
    tagline: 'From problem definition to tested interactive prototype in 5 phased gates.',
    category: 'Design',
    duration: '5 Days / 40h',
    promptCount: 5,
    color: '#8b5cf6',
    description: 'Chained AI design sprint methodology derived from GV & AI UX Playground. Maps user journeys, generates lightning solutions, storyboards interactions, builds prototypes, and runs usability synthesis.',
    deliverables: [
      'Problem & Target Map',
      'Crazy Eights Solution Sketches',
      'Interaction Storyboard Matrix',
      'High-Fidelity UI Prototype',
      'Usability Test Synthesis Sheet'
    ],
    steps: [
      {
        id: 'sprint-day1-map',
        stepNumber: 1,
        title: 'Day 1: Understand & Map User Journey',
        phase: 'Sprint Day 1',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'The core problem space and user friction points have not been mapped into an actionable empathy journey.',
        whatToFix: [
          'Interview 3 stakeholders or target users regarding current pain points',
          'Map the end-to-end customer journey from discovery to success state',
          'Identify the single high-leverage friction point as the primary sprint target',
          'Formulate How Might We (HMW) statements for the focal problem'
        ],
        acceptanceCriteria: [
          'Journey map documents actor personas, triggers, and friction drop-offs',
          'Primary sprint question is formally documented and approved',
          'Minimum of 6 HMW statements clustered into theme categories'
        ],
        relatedFiles: ['docs/design-sprint/day1-journey-map.md', 'src/types/index.ts'],
        aiPromptTemplate: 'Act as a Senior UX Strategist. Based on our project {PROJECT_NAME}, analyze user friction and generate a complete Customer Journey Map with 6 How Might We (HMW) opportunities and target focus areas.'
      },
      {
        id: 'sprint-day2-sketch',
        stepNumber: 2,
        title: 'Day 2: Ideate & Lightning Solutions',
        phase: 'Sprint Day 2',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'design',
        priority: 'high',
        problemStatement: 'Alternative solution architectures have not been explored to uncover optimal interaction patterns.',
        whatToFix: [
          'Conduct Lightning Demos researching 3 parallel industry patterns',
          'Execute Crazy Eights ideation on core interface screens',
          'Produce 3 distinct three-panel solution sketches with clear interaction flows'
        ],
        acceptanceCriteria: [
          '3 competing solution sketches documented with UI layout notes',
          'Key trade-offs (complexity vs user velocity) clearly analyzed',
          'Self-contained sketches ready for silent team review'
        ],
        relatedFiles: ['docs/design-sprint/day2-sketches.md', 'src/components/'],
        aiPromptTemplate: 'Act as a Principal Product Designer. For project {PROJECT_NAME}, generate 3 distinct solution concepts for our Day 1 HMW problem, comparing component patterns and user interaction steps.'
      },
      {
        id: 'sprint-day3-decide',
        stepNumber: 3,
        title: 'Day 3: Storyboard & Screen Decision Matrix',
        phase: 'Sprint Day 3',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'architecture',
        priority: 'urgent',
        problemStatement: 'Team needs alignment on the winning solution and a gapless 8-step screen storyboard for prototyping.',
        whatToFix: [
          'Perform dot-voting critique on solution sketches to select winning pattern',
          'Define the user test flow starting from initial trigger to terminal goal',
          'Draft an 8-panel detailed screen storyboard including error and loading states'
        ],
        acceptanceCriteria: [
          'Winning architectural concept selected and justified',
          '8-step storyboard covers happy path, empty state, and edge conditions',
          'Prototype specification ready for Day 4 UI construction'
        ],
        relatedFiles: ['docs/design-sprint/day3-storyboard.md'],
        aiPromptTemplate: 'Generate an 8-step screen storyboard specification for {PROJECT_NAME}, detailing copy, component state transitions, and user actions for each step.'
      },
      {
        id: 'sprint-day4-prototype',
        stepNumber: 4,
        title: 'Day 4: High-Fidelity Prototype Implementation',
        phase: 'Sprint Day 4',
        estimatedHours: 8,
        storyPoints: 8,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'An interactive, high-fidelity clickable prototype is required for real user usability validation.',
        whatToFix: [
          'Scaffold responsive UI components matching the Day 3 storyboard',
          'Hook up realistic mock state and dynamic input validations',
          'Ensure fluid transitions and micro-interactions for authentic usability feel',
          'Deploy prototype to preview environment'
        ],
        acceptanceCriteria: [
          'Prototype runs seamlessly in browser without console runtime errors',
          'All 8 storyboard steps are interactive and testable',
          'Responsive on both mobile viewport and desktop screens'
        ],
        relatedFiles: ['src/components/', 'src/types/', 'src/styles/'],
        aiPromptTemplate: 'Generate clean React + TypeScript component implementations for the {PROJECT_NAME} prototype matching the storyboard specifications.'
      },
      {
        id: 'sprint-day5-test',
        stepNumber: 5,
        title: 'Day 5: Usability Validation & Synthesis Matrix',
        phase: 'Sprint Day 5',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'testing',
        priority: 'high',
        problemStatement: 'Validate prototype with 5 user tests and compile actionable findings into the development backlog.',
        whatToFix: [
          'Conduct 5 recorded user testing sessions following standardized test script',
          'Log task completion rate, time-on-task, and friction confusion points',
          'Cluster qualitative feedback into a Usability Severity Matrix (P0/P1/P2)',
          'Create prioritized engineering tickets for sprint iteration'
        ],
        acceptanceCriteria: [
          '5 user test sessions completed and scored',
          'Synthesis matrix documents positive patterns vs friction blockers',
          'Sprint goal validated with clear green/yellow/red readiness verdict'
        ],
        relatedFiles: ['docs/design-sprint/day5-test-synthesis.md'],
        aiPromptTemplate: 'Act as a Senior UX Researcher. Synthesize 5 usability test sessions for {PROJECT_NAME}, generating an executive findings matrix, task success metrics, and prioritized remediation tickets.'
      }
    ]
  },
  {
    id: 'write-prd',
    title: 'Write a PRD / Product Spec',
    tagline: 'End-to-end product requirements document from problem definition to launch gates.',
    category: 'Product',
    duration: '2 Days / 16h',
    promptCount: 4,
    color: '#0ea5e9',
    description: 'Structured PRD playbook from AI UX Playground. Transforms product ideas into rigorous, engineering-ready specifications with user personas, functional criteria, data contracts, and release gates.',
    deliverables: [
      'Problem & Business Justification',
      'User Personas & JTBD Spec',
      'Functional & Non-Functional Matrix',
      'API & Data Contract Specs',
      'Release Criteria & Telemetry Plan'
    ],
    steps: [
      {
        id: 'prd-step1-problem',
        stepNumber: 1,
        title: 'PRD Part 1: Problem Space & Business Objectives',
        phase: 'PRD Drafting',
        estimatedHours: 4,
        storyPoints: 3,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Unclear business justification and vague problem scope creates engineering misalignment.',
        whatToFix: [
          'Articulate the primary problem statement with supporting quantitative/qualitative evidence',
          'Define target user segments and primary Jobs to Be Done (JTBD)',
          'Establish North Star metric and secondary guardrail metrics'
        ],
        acceptanceCriteria: [
          'Problem statement includes what is broken, who is affected, and impact of inaction',
          '3 core JTBD statements formatted as [When I..., I want to..., So I can...]',
          'Measurable success metrics with baseline and target numbers'
        ],
        relatedFiles: ['docs/prd/01-problem-objectives.md'],
        aiPromptTemplate: 'Draft Part 1 of a comprehensive PRD for {PROJECT_NAME}: Executive Summary, Problem Statement, Target Personas, JTBD, and North Star Success Metrics.'
      },
      {
        id: 'prd-step2-requirements',
        stepNumber: 2,
        title: 'PRD Part 2: Functional Scope & MoSCoW Prioritization',
        phase: 'PRD Drafting',
        estimatedHours: 4,
        storyPoints: 5,
        category: 'architecture',
        priority: 'urgent',
        problemStatement: 'Feature scope lacks explicit P0 Must-Have vs P2 Nice-To-Have boundary definitions.',
        whatToFix: [
          'Document user stories and functional requirements with clear P0/P1/P2 tiers',
          'Define Out-of-Scope boundaries to strictly prevent feature creep',
          'Document user journey state machine (Auth -> Core Flow -> Completion)'
        ],
        acceptanceCriteria: [
          'Every feature requirement has explicit acceptance criteria and edge conditions',
          'Explicit Out-of-Scope section prevents scope creep',
          'State transitions diagrammed for all user journeys'
        ],
        relatedFiles: ['docs/prd/02-functional-scope.md'],
        aiPromptTemplate: 'Draft Part 2 of PRD for {PROJECT_NAME}: Functional Requirements with MoSCoW prioritization, user stories, edge cases, and Out-of-Scope boundaries.'
      },
      {
        id: 'prd-step3-technical',
        stepNumber: 3,
        title: 'PRD Part 3: Architecture & Data Contracts',
        phase: 'PRD Drafting',
        estimatedHours: 4,
        storyPoints: 5,
        category: 'backend',
        priority: 'high',
        problemStatement: 'Data models and API schemas must be defined before frontend and backend implementation begin.',
        whatToFix: [
          'Define database schema, entity relationships, and indexing requirements',
          'Specify REST/GraphQL API contracts with sample request and response payloads',
          'Document security, authentication, and permission guardrails'
        ],
        acceptanceCriteria: [
          'SQL DDL / Prisma schema provided with foreign keys and indexes',
          'API endpoints documented with 200, 400, 401, 403, and 500 error responses',
          'Role-based access control (RBAC) matrix finalized'
        ],
        relatedFiles: ['docs/prd/03-technical-specs.md', 'src/types/index.ts'],
        aiPromptTemplate: 'Draft Part 3 of PRD for {PROJECT_NAME}: Technical architecture, database schema, REST API endpoints, payload contracts, and security/RBAC rules.'
      },
      {
        id: 'prd-step4-launch',
        stepNumber: 4,
        title: 'PRD Part 4: Launch Gates & Telemetry Plan',
        phase: 'PRD Drafting',
        estimatedHours: 4,
        storyPoints: 3,
        category: 'testing',
        priority: 'medium',
        problemStatement: 'Product requires automated telemetry tracking and launch checklist before deployment.',
        whatToFix: [
          'Formulate analytics event tracking taxonomy (event name, properties, triggers)',
          'Establish pre-launch QA checklists (Performance, Accessibility, Security)',
          'Draft rollback and disaster recovery plan'
        ],
        acceptanceCriteria: [
          'Event taxonomy covers funnel drop-off and conversion telemetry',
          'Launch criteria checklist includes zero P0 blockers and <200ms API p95 latency',
          'Rollback procedure documented with runbook commands'
        ],
        relatedFiles: ['docs/prd/04-launch-gates.md'],
        aiPromptTemplate: 'Draft Part 4 of PRD for {PROJECT_NAME}: Analytics telemetry event table, pre-launch QA checklist, performance benchmarks, and rollback plan.'
      }
    ]
  },
  {
    id: 'design-system',
    title: 'Build a Design System',
    tagline: 'Create tokens, semantic scales, and unified reusable component foundations.',
    category: 'Design',
    duration: '3 Days / 24h',
    promptCount: 4,
    color: '#ec4899',
    description: 'Design system workflow from AI UX Playground. Synthesizes color tokens, typography scales, spacing grids, and atomic components into a production-ready tokenized design library.',
    deliverables: [
      'Design Token Spec (Colors, Typography, Elevation)',
      'Core UI Primitives Component Specs',
      'Interactive State Matrix (Hover, Focus, Active, Error)',
      'Documentation & Storybook Catalog'
    ],
    steps: [
      {
        id: 'ds-step1-tokens',
        stepNumber: 1,
        title: 'Design System: Color Tokens & Typography Scale',
        phase: 'Tokens & Foundations',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'design',
        priority: 'high',
        problemStatement: 'Inconsistent hex colors, font sizes, and spacing create visual fragmentation across screens.',
        whatToFix: [
          'Construct semantic HSL color palette (Surface, Accent, Success, Warning, Danger)',
          'Define dark and light mode contrast-compliant color tokens',
          'Define fluid typography scale (Display, H1-H4, Body, Mono, Caption) with line heights',
          'Standardize 4px/8px spacing and elevation shadow tokens'
        ],
        acceptanceCriteria: [
          'CSS variables or Tailwind tokens defined in central stylesheet',
          'All text colors pass WCAG 2.1 AA 4.5:1 contrast standards',
          'Token naming follows category-role-variant convention'
        ],
        relatedFiles: ['src/index.css', 'src/styles/tokens.css'],
        aiPromptTemplate: 'Act as a Design System Engineer. For {PROJECT_NAME}, create a complete CSS variable design token system including dark/light mode palettes, fluid typography, spacing, and elevation.'
      },
      {
        id: 'ds-step2-primitives',
        stepNumber: 2,
        title: 'Design System: Core UI Component Primitives',
        phase: 'Component Architecture',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'Buttons, Inputs, Badges, and Cards are duplicated with bespoke styling instead of shared primitives.',
        whatToFix: [
          'Implement polymorphic Button primitive with variant, size, and loading states',
          'Implement Input and Textarea primitives with error labels and icon slots',
          'Implement Card, Modal, and Badge primitives with fluid border-radius and glow styles'
        ],
        acceptanceCriteria: [
          'Components export strict TypeScript prop interfaces',
          'Keyboard focus rings and ARIA accessibility attributes included',
          'Zero hardcoded pixel or hex values in component code'
        ],
        relatedFiles: ['src/components/ui/'],
        aiPromptTemplate: 'Generate production-ready React + TypeScript UI component primitives (Button, Input, Badge, Card, Modal) for {PROJECT_NAME} adhering to tokenized styles.'
      },
      {
        id: 'ds-step3-states',
        stepNumber: 3,
        title: 'Design System: State Variations & Micro-Interactions',
        phase: 'Interactive Polish',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'frontend',
        priority: 'medium',
        problemStatement: 'Interactive states lack tactile feedback, loading spinners, and error animations.',
        whatToFix: [
          'Add hover elevation transitions and active tactile click animations',
          'Implement skeleton shimmer loaders for async data views',
          'Add accessible toast notification and alert banners'
        ],
        acceptanceCriteria: [
          'Transitions use GPU-accelerated transforms and opacity',
          'Reduced motion media query supported',
          'Interactive feedback instant and stutter-free'
        ],
        relatedFiles: ['src/components/', 'src/index.css'],
        aiPromptTemplate: 'Write CSS micro-animations, skeleton shimmers, and state transitions for {PROJECT_NAME} with reduced-motion accessibility.'
      },
      {
        id: 'ds-step4-docs',
        stepNumber: 4,
        title: 'Design System: Pattern Guide & Component Docs',
        phase: 'Documentation',
        estimatedHours: 6,
        storyPoints: 3,
        category: 'docs',
        priority: 'low',
        problemStatement: 'Developers lack documentation on token usage rules and component compositions.',
        whatToFix: [
          'Document usage guidelines and anti-patterns for each component',
          'Provide code snippets for common screen layout compositions',
          'Generate interactive UI preview gallery'
        ],
        acceptanceCriteria: [
          'DESIGN.md or Component guide covers all primitives with do/dont examples',
          'All team developers can import and use tokens with 0 ambiguity'
        ],
        relatedFiles: ['DESIGN.md', 'docs/design-system.md'],
        aiPromptTemplate: 'Create comprehensive design system documentation (DESIGN.md) for {PROJECT_NAME}, with token references, component prop tables, and usage examples.'
      }
    ]
  },
  {
    id: 'usability-testing',
    title: 'Run Usability Tests & Heuristics',
    tagline: 'Plan, execute, and synthesize usability tests with 10 Nielsen heuristics.',
    category: 'Research',
    duration: '2 Days / 16h',
    promptCount: 3,
    color: '#10b981',
    description: 'Usability testing workflow from AI UX Playground. Designs task scenarios, evaluates interfaces against 10 Nielsen Norman heuristics, and converts user friction into prioritized engineering tickets.',
    deliverables: [
      'Test Protocol & Scenario Scripts',
      'Heuristic Evaluation Scorecard',
      'Severity-Rated Remediation Backlog'
    ],
    steps: [
      {
        id: 'ut-step1-protocol',
        stepNumber: 1,
        title: 'Usability: Test Protocol & 5 Task Scenarios',
        phase: 'Test Design',
        estimatedHours: 5,
        storyPoints: 3,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Unstructured user testing produces anecdotal, non-actionable feedback.',
        whatToFix: [
          'Draft test scenario prompts representing primary user workflow tasks',
          'Formulate pre-test and post-test Likert scale questionnaire (SUS scale)',
          'Establish objective pass/fail completion metrics for each task'
        ],
        acceptanceCriteria: [
          '5 core task scenarios drafted with realistic prompt contexts',
          'SUS (System Usability Scale) survey ready for participant scoring',
          'Success benchmark defined as >80% unassisted completion'
        ],
        relatedFiles: ['docs/usability/test-protocol.md'],
        aiPromptTemplate: 'Create a formal Usability Testing Protocol for {PROJECT_NAME} including 5 realistic task scenarios, facilitator notes, and System Usability Scale (SUS) survey.'
      },
      {
        id: 'ut-step2-heuristics',
        stepNumber: 2,
        title: 'Usability: 10 Nielsen Heuristics Audit',
        phase: 'Expert Review',
        estimatedHours: 5,
        storyPoints: 5,
        category: 'testing',
        priority: 'high',
        problemStatement: 'System may violate fundamental usability heuristics (visibility of status, error prevention, consistency).',
        whatToFix: [
          'Audit all primary workflows against Nielsen Norman 10 Usability Heuristics',
          'Log violations with screenshot proof, severity rating (1-4), and impacted heuristic',
          'Evaluate error messages for plain English recovery instructions'
        ],
        acceptanceCriteria: [
          'Scorecard evaluates all 10 heuristics across mobile and desktop',
          'Each found violation includes concrete recommendation and severity rating'
        ],
        relatedFiles: ['docs/usability/heuristic-audit.md'],
        aiPromptTemplate: 'Perform a comprehensive 10 Nielsen Heuristics usability audit on {PROJECT_NAME}, identifying UI friction, error handling gaps, and scoring severity 1 to 4.'
      },
      {
        id: 'ut-step3-remediation',
        stepNumber: 3,
        title: 'Usability: Prioritized Remediation Backlog',
        phase: 'Remediation',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'Usability findings must be translated into actionable sprint fixes.',
        whatToFix: [
          'Implement fixes for all Severity 3 and 4 usability blockers',
          'Improve microcopy, confirmation dialogs, and error recovery states',
          'Re-verify task completion time on revised screens'
        ],
        acceptanceCriteria: [
          'Critical usability friction points resolved and verified',
          'Task completion time reduced by at least 20%'
        ],
        relatedFiles: ['src/components/'],
        aiPromptTemplate: 'Generate implementation code fixes for top usability violations identified in {PROJECT_NAME}.'
      }
    ]
  },
  {
    id: 'accessibility-audit',
    title: 'Run an Accessibility (a11y) Audit',
    tagline: 'Audit product against WCAG 2.1 AA and build a zero-barrier remediation plan.',
    category: 'Accessibility',
    duration: '2 Days / 16h',
    promptCount: 3,
    color: '#f59e0b',
    description: 'Accessibility workflow from AI UX Playground. Audits contrast, keyboard tabbing, ARIA live regions, and screen reader announcements for full WCAG 2.1 AA compliance.',
    deliverables: [
      'WCAG 2.1 AA Compliance Scorecard',
      'Keyboard & Screen Reader Audit Log',
      'Remediation Code Fixes'
    ],
    steps: [
      {
        id: 'a11y-step1-audit',
        stepNumber: 1,
        title: 'Accessibility: WCAG 2.1 AA Contrast & Structure Audit',
        phase: 'Compliance Audit',
        estimatedHours: 5,
        storyPoints: 3,
        category: 'testing',
        priority: 'high',
        problemStatement: 'Color contrast and HTML heading structure may exclude users with visual impairments.',
        whatToFix: [
          'Check all text and button contrast ratios against WCAG 4.5:1 requirement',
          'Audit HTML5 semantic landmark structure',
          'Verify single h1 hierarchy per page with sequential heading levels'
        ],
        acceptanceCriteria: [
          'Zero contrast violations in both light and dark themes',
          'Proper HTML5 semantic structure across all routes'
        ],
        relatedFiles: ['src/index.css', 'src/components/'],
        aiPromptTemplate: 'Audit {PROJECT_NAME} for WCAG 2.1 AA color contrast, typography readability, and HTML5 landmark structure.'
      },
      {
        id: 'a11y-step2-keyboard',
        stepNumber: 2,
        title: 'Accessibility: Keyboard Navigation & Focus Trap Audit',
        phase: 'Interaction Audit',
        estimatedHours: 5,
        storyPoints: 5,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'Keyboard-only users cannot navigate interactive modals, dropdowns, and forms.',
        whatToFix: [
          'Ensure all interactive elements are reachable via Tab with visible focus rings',
          'Implement focus trap on open modals and restore focus on dismiss',
          'Add Escape key listeners on dialogs and overlays'
        ],
        acceptanceCriteria: [
          'Complete workflow operable with keyboard only',
          'High-visibility outline focus ring on all active controls'
        ],
        relatedFiles: ['src/components/'],
        aiPromptTemplate: 'Provide React focus trap, keyboard event listeners, and visible focus styles for {PROJECT_NAME} interactive modals and dropdowns.'
      },
      {
        id: 'a11y-step3-screenreader',
        stepNumber: 3,
        title: 'Accessibility: Screen Reader ARIA & Alt Text',
        phase: 'Assistive Tech Polish',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'frontend',
        priority: 'high',
        problemStatement: 'Icon buttons and async status changes are not announced to screen readers.',
        whatToFix: [
          'Add descriptive aria-label to all icon-only buttons',
          'Use aria-live="polite" on toasts and dynamic progress indicators',
          'Ensure meaningful alt attributes on all diagram and avatar images'
        ],
        acceptanceCriteria: [
          'Screen readers announce all action confirmations',
          'Zero unlabelled interactive buttons'
        ],
        relatedFiles: ['src/components/'],
        aiPromptTemplate: 'Add ARIA attributes, live regions, and descriptive labels to {PROJECT_NAME} for screen reader accessibility.'
      }
    ]
  },
  {
    id: 'design-handoff',
    title: 'Engineering Handoff & Edge Cases',
    tagline: 'Prepare designs for development with component states, error boundaries, and tokens.',
    category: 'Engineering',
    duration: '2 Days / 16h',
    promptCount: 3,
    color: '#06b6d4',
    description: 'Engineering handoff workflow from AI UX Playground. Bridges design and engineering with complete state definitions (loading, empty, error, partial), token mapping, and API payload contracts.',
    deliverables: [
      'Component State Matrix',
      'Error & Empty State Specifications',
      'API Contract & Token Handoff Sheet'
    ],
    steps: [
      {
        id: 'handoff-step1-states',
        stepNumber: 1,
        title: 'Handoff: Complete Component State Matrix',
        phase: 'State Specification',
        estimatedHours: 5,
        storyPoints: 3,
        category: 'design',
        priority: 'high',
        problemStatement: 'Engineers often guess how components look in loading, empty, and partial data states.',
        whatToFix: [
          'Specify default, hover, active, disabled, loading, and error states for all components',
          'Design empty states with clear calls-to-action (CTA)',
          'Define truncation and wrapping rules for long user strings'
        ],
        acceptanceCriteria: [
          'All components have visual specifications for all 6 states',
          'Empty state graphics and guidance copy defined'
        ],
        relatedFiles: ['docs/handoff/component-states.md'],
        aiPromptTemplate: 'Generate a comprehensive Component State Matrix for {PROJECT_NAME} covering Idle, Loading, Empty, Partial, and Error states.'
      },
      {
        id: 'handoff-step2-errors',
        stepNumber: 2,
        title: 'Handoff: Error Boundaries & Network Fallbacks',
        phase: 'Resilience Engineering',
        estimatedHours: 5,
        storyPoints: 5,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'Network timeouts, 500 errors, or missing permissions cause screen crashes without user recovery paths.',
        whatToFix: [
          'Design and implement React Error Boundary component with retry triggers',
          'Add optimistic UI mutations with automated rollback on network failure',
          'Implement friendly offline / reconnecting notification banners'
        ],
        acceptanceCriteria: [
          'App catches unexpected exceptions gracefully with retry CTA',
          'Optimistic mutations rollback seamlessly on 4xx/5xx API responses'
        ],
        relatedFiles: ['src/components/'],
        aiPromptTemplate: 'Write robust React Error Boundary, network retry fallback, and optimistic update handlers for {PROJECT_NAME}.'
      },
      {
        id: 'handoff-step3-contract',
        stepNumber: 3,
        title: 'Handoff: Token Mapping & API Payload Contracts',
        phase: 'Developer Integration',
        estimatedHours: 6,
        storyPoints: 5,
        category: 'backend',
        priority: 'high',
        problemStatement: 'Frontend token names and backend API response keys lack synchronized type contracts.',
        whatToFix: [
          'Map Figma/CSS design token names to frontend component props',
          'Define shared TypeScript interfaces for all API response payloads',
          'Verify responsive breakpoint behavior across mobile, tablet, and desktop'
        ],
        acceptanceCriteria: [
          'Shared TypeScript types export 100% type-safe data structures',
          'Zero discrepancies between design specs and implementation'
        ],
        relatedFiles: ['src/types/index.ts'],
        aiPromptTemplate: 'Generate TypeScript type definitions and token mapping documentation for {PROJECT_NAME}.'
      }
    ]
  }
];
