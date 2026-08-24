# CapStoneFlow

[![Workspace](https://img.shields.io/badge/Workspace-CapstoneFlow-30D158?style=for-the-badge)](./src)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20TypeScript-6366f1?style=for-the-badge)](./package.json)
[![Documentation](https://img.shields.io/badge/Documentation-Available-f59e0b?style=for-the-badge)](./docs)

> A collaborative workspace for capstone teams to coordinate milestones, deliverables, manuscript work, adviser revisions, and project activity in one place.

---

## Project Configuration

CapStoneFlow intentionally keeps project-specific names, adviser details, repository links, and defense dates out of the public template. Configure those values in the workspace or through the documented `VITE_*` environment variables before deployment.

---

## Repository Directory Structure

```
├── .github/                       # GitHub workflows & team templates
│   ├── ISSUE_TEMPLATE/            # Academic task & revision issue templates
│   └── PULL_REQUEST_TEMPLATE.md   # Standard PR template with chapter links
├── docs/                          # Complete Thesis Manuscript & Academic Docs
│   ├── chapters/                  # Chapters 1 to 5 Markdown source drafts
│   │   ├── CHAPTER_1_INTRODUCTION.md
│   │   ├── CHAPTER_2_LITERATURE_REVIEW.md
│   │   ├── CHAPTER_3_METHODOLOGY.md
│   │   ├── CHAPTER_4_RESULTS_AND_DISCUSSION.md
│   │   └── CHAPTER_5_CONCLUSION_AND_RECOMMENDATIONS.md
│   ├── revisions/                 # Official Adviser Revision Compliance Matrix
│   │   └── REVISION_MATRIX.md
│   ├── minutes/                   # Weekly standups & adviser consultation minutes
│   │   └── MEETING_MINUTES_TEMPLATE.md
│   └── architecture/              # System block diagrams, ERDs, API contracts
│       └── SYSTEM_ARCHITECTURE.md
├── src/                           # Source code (Web Platform & CapStoneFlow Tracker)
│   ├── components/                # Modular UI components (Kanban, Gantt, Reports)
│   ├── context/                   # State management & persistent storage
│   ├── types/                     # TypeScript definitions
│   └── data/                      # Clean project schema & templates
├── CONTRIBUTING.md                # Team git branching & commit guidelines
└── README.md                      # Project master overview
```

---

## Product Areas

- Project dashboard and milestone readiness
- Kanban tasks, timeline planning, manuscript drafting, and adviser revisions
- Team coordination, reports, and role-aware workspace controls
- Optional GitHub repository connection for commits, branches, pull requests, and issues

---

## Thesis Manuscript Drafts

* **[Chapter 1: Introduction & Problem Background](./docs/chapters/CHAPTER_1_INTRODUCTION.md)**
* **[Chapter 2: Review of Related Literature & Studies (RRL)](./docs/chapters/CHAPTER_2_LITERATURE_REVIEW.md)**
* **[Chapter 3: Methodology & System Architecture](./docs/chapters/CHAPTER_3_METHODOLOGY.md)**
* **[Chapter 4: Results, Analysis & Evaluation](./docs/chapters/CHAPTER_4_RESULTS_AND_DISCUSSION.md)**
* **[Chapter 5: Summary, Conclusions & Recommendations](./docs/chapters/CHAPTER_5_CONCLUSION_AND_RECOMMENDATIONS.md)**
* **[Adviser Revision Compliance Matrix](./docs/revisions/REVISION_MATRIX.md)**

---

## Running CapStoneFlow Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the workflow tracker dev server
npm run dev

# 3. Open http://localhost:5173 in your browser
```
