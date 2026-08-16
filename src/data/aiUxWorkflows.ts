export interface AIUXWorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  phase: string;
  estimatedHours: number;
  storyPoints: number;
  category: 'architecture' | 'design' | 'feature' | 'testing' | 'docs' | 'frontend' | 'backend' | 'devops';
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
    promptCount: 24,
    color: '#8b5cf6',
    description: 'Chained AI design sprint derived from GV & AI UX Playground. Maps user journeys, generates lightning solutions, storyboards interactions, builds prototypes, and runs usability synthesis.',
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
    promptCount: 12,
    color: '#0ea5e9',
    description: 'Structured PRD playbook from AI UX Playground. Transforms product ideas into engineering-ready specifications with personas, functional criteria, data contracts, and release gates.',
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
          'Articulate primary problem statement with supporting quantitative/qualitative evidence',
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
    promptCount: 6,
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
    id: 'user-research-study',
    title: 'Conduct a User Research Study',
    tagline: 'Plan, execute, and synthesize user interviews from recruitment to insight themes.',
    category: 'Research',
    duration: '4 Days / 32h',
    promptCount: 9,
    color: '#059669',
    description: 'User research framework from AI UX Playground. Generates screener criteria, interview protocol scripts, affinity clustering matrices, and persona empathy artifacts.',
    deliverables: [
      'Research Study Protocol & Screener',
      'Semi-Structured Interview Script',
      'Affinity Map & Theme Synthesis',
      'Persona Empathy Archetypes'
    ],
    steps: [
      {
        id: 'ur-step1-plan',
        stepNumber: 1,
        title: 'Research: Study Plan & Participant Screener',
        phase: 'Research Planning',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Lack of clear research hypothesis and screening criteria leads to biased participant sampling.',
        whatToFix: [
          'Formulate 3 primary research questions and falsifiable hypotheses',
          'Draft participant screener questionnaire with inclusion/exclusion criteria',
          'Establish recruitment target (5-8 representative users)'
        ],
        acceptanceCriteria: [
          'Research plan outlines background, core hypotheses, and recruitment profile',
          'Screener survey questions eliminate unqualified applicants'
        ],
        relatedFiles: ['docs/research/study-plan.md'],
        aiPromptTemplate: 'Act as a Principal UX Researcher. Create a research study plan and screener survey for {PROJECT_NAME} to test assumptions about user pain points.'
      },
      {
        id: 'ur-step2-script',
        stepNumber: 2,
        title: 'Research: Semi-Structured Interview Script',
        phase: 'Field Execution',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Unstandardized interview questions risk leading questions and unreplicable findings.',
        whatToFix: [
          'Draft 45-minute semi-structured interview guide with warm-up and deep dive questions',
          'Include laddering probing questions (e.g., "Tell me about the last time you...")',
          'Add non-leading observation prompts'
        ],
        acceptanceCriteria: [
          'Interview guide covers behavioral workflows, emotional highs/lows, and workarounds',
          'Non-leading question formulation approved'
        ],
        relatedFiles: ['docs/research/interview-guide.md'],
        aiPromptTemplate: 'Draft a 45-minute semi-structured interview script for {PROJECT_NAME} using non-leading questions and the Jobs to be Done laddering technique.'
      },
      {
        id: 'ur-step3-synthesis',
        stepNumber: 3,
        title: 'Research: Affinity Clustering & Opportunity Tree',
        phase: 'Synthesis',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'architecture',
        priority: 'urgent',
        problemStatement: 'Raw interview recordings must be distilled into actionable design opportunities.',
        whatToFix: [
          'Transcribe and tag interview observations across 6 participant transcripts',
          'Perform affinity clustering to group observations into 4 core themes',
          'Construct Opportunity Solution Tree linking problems to feature bets'
        ],
        acceptanceCriteria: [
          'Affinity map organizes verbatim quotes into high-level insight themes',
          'Opportunity Solution Tree highlights top 3 feature bets'
        ],
        relatedFiles: ['docs/research/affinity-synthesis.md'],
        aiPromptTemplate: 'Synthesize qualitative user interview transcripts for {PROJECT_NAME} into an Affinity Diagram, 4 key insight themes, and an Opportunity Solution Tree.'
      }
    ]
  },
  {
    id: 'usability-testing',
    title: 'Run Usability Tests & Heuristics',
    tagline: 'Plan, execute, and synthesize usability tests with 10 Nielsen heuristics.',
    category: 'Research',
    duration: '2 Days / 16h',
    promptCount: 9,
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
    id: 'roadmap-planning',
    title: 'Product Roadmap & RICE Prioritization',
    tagline: 'Create strategic themes, score features via RICE, and plan phased releases.',
    category: 'Product',
    duration: '3 Days / 24h',
    promptCount: 8,
    color: '#3b82f6',
    description: 'Roadmap planning playbook from AI UX Playground. Aligns team vision, calculates RICE priority scores, identifies technical dependencies, and charts Now/Next/Later releases.',
    deliverables: [
      'Strategic Themes & Value Proposition',
      'RICE Prioritization Scorecard',
      'Now / Next / Later Roadmap Matrix',
      'Capacity & Risk Assessment Plan'
    ],
    steps: [
      {
        id: 'rm-step1-themes',
        stepNumber: 1,
        title: 'Roadmap: Strategic Themes & Pillar Alignment',
        phase: 'Strategic Alignment',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Feature requests arrive haphazardly without alignment to core thesis/product pillars.',
        whatToFix: [
          'Define 3 overarching strategic pillars for the project lifecycle',
          'Categorize all backlogged feature requests under the 3 pillars',
          'Identify key dependencies and blocker milestones'
        ],
        acceptanceCriteria: [
          'Pillars defined with target outcomes and stakeholder sign-off',
          'All active backlog items mapped to a strategic pillar'
        ],
        relatedFiles: ['docs/roadmap/strategic-themes.md'],
        aiPromptTemplate: 'Define 3 strategic product pillars and outcome goals for {PROJECT_NAME} aligning development effort with academic capstone defense success.'
      },
      {
        id: 'rm-step2-rice',
        stepNumber: 2,
        title: 'Roadmap: RICE Scoring & Effort Estimation',
        phase: 'Prioritization',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'architecture',
        priority: 'urgent',
        problemStatement: 'Team debates priorities based on subjective opinion rather than objective ROI.',
        whatToFix: [
          'Score top 15 features on Reach (users/mo), Impact (1-3), Confidence (50-100%), and Effort (person-weeks)',
          'Compute final RICE Score = (R × I × C) / E',
          'Rank features into strict priority queue'
        ],
        acceptanceCriteria: [
          'RICE matrix completed with justified estimates for all variables',
          'Top 5 high-yield quick wins identified'
        ],
        relatedFiles: ['docs/roadmap/rice-prioritization.md'],
        aiPromptTemplate: 'Generate a comprehensive RICE Prioritization table for 15 potential features in {PROJECT_NAME}, calculating scores and highlighting top-priority wins.'
      },
      {
        id: 'rm-step3-schedule',
        stepNumber: 3,
        title: 'Roadmap: Now / Next / Later Release Matrix',
        phase: 'Release Mapping',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Stakeholders need clear visibility into what is in active sprint vs upcoming phases.',
        whatToFix: [
          'Organize prioritized features into Now (Current Sprint), Next (Upcoming Milestone), and Later (Post-Defense)',
          'Map release dates against academic thesis chapter submissions',
          'Establish team velocity buffer for risk contingencies'
        ],
        acceptanceCriteria: [
          'Now/Next/Later visual timeline mapped to Sprint 1-4',
          '20% risk contingency buffer included'
        ],
        relatedFiles: ['docs/roadmap/now-next-later.md'],
        aiPromptTemplate: 'Create a Now / Next / Later release roadmap for {PROJECT_NAME} aligned with academic defense milestone phases.'
      }
    ]
  },
  {
    id: 'competitive-product-analysis',
    title: 'Competitive Product & UX Analysis',
    tagline: 'Conduct teardowns of competing systems to find differentiators and UX gaps.',
    category: 'Product',
    duration: '2 Days / 16h',
    promptCount: 12,
    color: '#6366f1',
    description: 'Competitive analysis workflow from AI UX Playground. Maps direct and indirect competitors, performs deep UX teardowns, constructs feature parity grids, and identifies blue-ocean opportunities.',
    deliverables: [
      'Competitor Landscape Matrix',
      'UX Interaction Teardown Sheets',
      'Feature Parity & Gap Analysis',
      'Value Proposition Differentiation Canvas'
    ],
    steps: [
      {
        id: 'ca-step1-landscape',
        stepNumber: 1,
        title: 'Competitors: Landscape Mapping & Positioning Grid',
        phase: 'Market Discovery',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'The project value proposition lacks clear differentiation against existing market alternatives.',
        whatToFix: [
          'Identify 3 direct competitors and 2 indirect/analogous platforms',
          'Construct a 2x2 positioning matrix comparing key trade-offs',
          'Document competitor pricing, target audience, and primary strengths/weaknesses'
        ],
        acceptanceCriteria: [
          'Positioning matrix visually highlights {PROJECT_NAME}\'s unique white space',
          'Profile summaries completed for all 5 platforms'
        ],
        relatedFiles: ['docs/competitive/landscape-matrix.md'],
        aiPromptTemplate: 'Conduct a competitive market analysis for {PROJECT_NAME}: profile 3 direct and 2 indirect competitors, create a 2x2 positioning matrix, and identify unique differentiators.'
      },
      {
        id: 'ca-step2-teardown',
        stepNumber: 2,
        title: 'Competitors: UX Teardown & Feature Parity Grid',
        phase: 'UX Audit',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'design',
        priority: 'high',
        problemStatement: 'Detailed interaction flows of competitors have not been dissected to avoid common UX pitfalls.',
        whatToFix: [
          'Perform UX teardown of competitor onboarding, search, and core transaction flows',
          'Build a Feature Parity Grid comparing 20 core capabilities',
          'Highlight opportunities where {PROJECT_NAME} can deliver a 10x superior interaction'
        ],
        acceptanceCriteria: [
          'Feature parity grid completed with Yes / Partial / No ratings',
          'Top 3 UX shortcomings in competitor platforms identified for our exploitation'
        ],
        relatedFiles: ['docs/competitive/feature-parity-grid.md'],
        aiPromptTemplate: 'Perform an in-depth UX Teardown and 20-point Feature Parity Grid comparing {PROJECT_NAME} against top competitors.'
      }
    ]
  },
  {
    id: 'ab-test-design',
    title: 'Design & Analyze A/B Tests',
    tagline: 'Design statistical experiments, define guardrail metrics, and analyze results.',
    category: 'Research',
    duration: '2 Days / 16h',
    promptCount: 5,
    color: '#d946ef',
    description: 'A/B testing experimentation playbook from AI UX Playground. Formulates statistical hypotheses, calculates sample size power, instruments event telemetry, and evaluates significance.',
    deliverables: [
      'Experiment Hypothesis Sheet',
      'Sample Size & Duration Calculator Spec',
      'Telemetry Instrumentation Plan',
      'Decision Framework & Rollout Criteria'
    ],
    steps: [
      {
        id: 'ab-step1-hypothesis',
        stepNumber: 1,
        title: 'A/B Testing: Statistical Hypothesis & Metrics',
        phase: 'Experiment Design',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'docs',
        priority: 'high',
        problemStatement: 'Unstructured feature changes lack controlled measurement of user behavioral impact.',
        whatToFix: [
          'Formulate test hypothesis: "If we [Change], then [Metric] will increase by [X]%, because [Rationale]"',
          'Define Primary Conversion Metric, Secondary Engagement Metrics, and Guardrail Safety Metrics',
          'Calculate required sample size for 95% statistical significance and 80% statistical power'
        ],
        acceptanceCriteria: [
          'Experiment brief specifies control (A) vs variant (B) with mockups',
          'Sample size calculation specifies required visitor volume and duration'
        ],
        relatedFiles: ['docs/experiments/ab-test-brief.md'],
        aiPromptTemplate: 'Design an A/B Testing experiment brief for {PROJECT_NAME} including statistical hypothesis, sample size calculation, primary metric, and guardrails.'
      },
      {
        id: 'ab-step2-telemetry',
        stepNumber: 2,
        title: 'A/B Testing: Telemetry Instrumentation & Rollout',
        phase: 'Instrumentation',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'frontend',
        priority: 'urgent',
        problemStatement: 'Variant exposure and conversion events must be instrumented cleanly without client latency.',
        whatToFix: [
          'Implement deterministic user bucketing algorithm (50/50 split via hash)',
          'Instrument exposure event tracking on initial screen render',
          'Instrument conversion tracking on primary CTA action',
          'Build dashboard view comparing variant performance'
        ],
        acceptanceCriteria: [
          'Zero flicker / layout shift during variant assignment',
          'Events fire reliably with variant tag in analytics payload'
        ],
        relatedFiles: ['src/lib/analytics.ts', 'src/components/'],
        aiPromptTemplate: 'Provide React TypeScript code for a lightweight A/B test variant bucketing hook and conversion telemetry dispatcher for {PROJECT_NAME}.'
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
          'Audit HTML5 semantic landmark structure (`<main>`, `<nav>`, `<header>`, `<article>`)',
          'Verify single `<h1>` hierarchy per page with sequential heading levels'
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
          'Ensure all interactive elements are reachable via `Tab` with visible focus rings',
          'Implement focus trap on open modals and restore focus on dismiss',
          'Add `Escape` key listeners on dialogs and overlays'
        ],
        acceptanceCriteria: [
          'Complete workflow operable with keyboard only (Tab, Shift+Tab, Enter, Space, Esc)',
          'High-visibility outline focus ring (`:focus-visible`) on all active controls'
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
          'Add descriptive `aria-label` to all icon-only buttons',
          'Use `aria-live="polite"` on toasts and dynamic progress indicators',
          'Ensure meaningful `alt` attributes on all diagram and avatar images'
        ],
        acceptanceCriteria: [
          'Screen readers (NVDA/VoiceOver) announce all action confirmations',
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
    promptCount: 6,
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
  },
  {
    id: 'product-launch',
    title: 'Product Launch Checklist',
    tagline: 'Execute a successful launch from pre-flight QA to post-launch telemetry.',
    category: 'Product',
    duration: '3 Days / 24h',
    promptCount: 11,
    color: '#e11d48',
    description: 'Launch readiness framework from AI UX Playground. Coordinates pre-launch security & performance audits, stakeholder communications, go-live checklists, and day-1 post-launch triage.',
    deliverables: [
      'Pre-Flight QA & Security Sign-Off',
      'Go-to-Market Communication Matrix',
      'Day-1 Launch Runbook',
      'Post-Launch Telemetry Brief'
    ],
    steps: [
      {
        id: 'launch-step1-preflight',
        stepNumber: 1,
        title: 'Launch: Pre-Flight QA & Security Sign-Off',
        phase: 'Pre-Launch Verification',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'testing',
        priority: 'urgent',
        problemStatement: 'Deploying without a formal pre-flight audit risks production downtime and data leakage.',
        whatToFix: [
          'Run automated test suites and verify 100% pass rate',
          'Verify environment secrets and database permissions are secured',
          'Check lighthouse performance (Score >90) and API latency (<200ms p95)'
        ],
        acceptanceCriteria: [
          'Zero open P0 or P1 bugs in issue tracker',
          'Security review signed off with zero hardcoded credentials'
        ],
        relatedFiles: ['docs/launch/preflight-checklist.md'],
        aiPromptTemplate: 'Generate a comprehensive Pre-Flight QA & Security checklist for {PROJECT_NAME} prior to live deployment.'
      },
      {
        id: 'launch-step2-runbook',
        stepNumber: 2,
        title: 'Launch: Deployment Runbook & Day-1 Triage',
        phase: 'Go-Live Execution',
        estimatedHours: 8,
        storyPoints: 5,
        category: 'devops',
        priority: 'urgent',
        problemStatement: 'Deployment day requires synchronized execution and immediate incident triage.',
        whatToFix: [
          'Draft hour-by-hour deployment runbook with named owners and rollback triggers',
          'Set up error monitoring alert channels in Discord / Sentry',
          'Execute database migrations and domain SSL verification'
        ],
        acceptanceCriteria: [
          'Runbook lists rollback command and fallback DNS plan',
          'Real-time error logging operational'
        ],
        relatedFiles: ['docs/launch/deployment-runbook.md'],
        aiPromptTemplate: 'Create an hour-by-hour Go-Live Deployment Runbook and Day-1 Incident Triage matrix for {PROJECT_NAME}.'
      }
    ]
  }
];
