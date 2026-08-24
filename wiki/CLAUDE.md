# 🧠 LLM Wiki Schema & Operating Protocol (CLAUDE.md)

Welcome to the **LLM Wiki** — a persistent, compounding, associative second brain.
This document defines the schema, operational workflows, and structural conventions for the LLM agent acting as the Wiki Maintainer.

---

## 🏛️ 1. Architecture: The Three Layers

```
┌─────────────────────────────────────────────────────────────┐
│  1. RAW SOURCES (Immutable Source of Truth)                 │
│     wiki/raw/ • wiki/raw/assets/                            │
│     Articles, papers, meeting transcripts, briefs, data     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ingest (Extract & Cross-reference)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  2. THE COMPILED WIKI (LLM-Maintained Knowledge Base)       │
│     wiki/sources/   • wiki/entities/   • wiki/concepts/     │
│     wiki/synthesis/ • wiki/queries/    • index.md • log.md  │
└──────────────────────────────▲──────────────────────────────┘
                               │ Governed by
┌──────────────────────────────┴──────────────────────────────┐
│  3. THE SCHEMA (Operating Rules & Conventions)             │
│     wiki/CLAUDE.md • AGENTS.md                              │
└─────────────────────────────────────────────────────────────┘
```

1. **Raw Sources (`wiki/raw/`)**: **Immutable**. The LLM reads from them but never modifies or deletes raw sources.
2. **The Wiki (`wiki/`)**: **LLM-Owned**. A persistent, interlinked network of Obsidian-compatible Markdown files. You read and explore; the LLM creates, updates, and cross-references.
3. **The Schema (`wiki/CLAUDE.md`)**: The rules of engagement. Defines how the LLM maintains consistency, handles contradictions, and updates files.

---

## 📂 2. Directory & Folder Conventions

| Folder | Purpose | Naming Convention |
| :--- | :--- | :--- |
| `wiki/raw/` | Immutable input files, raw text, markdown clips, transcripts | `YYYY-MM-DD-source-slug.md` |
| `wiki/raw/assets/` | Downloaded images, diagrams, attachments | `slug-image-01.png` |
| `wiki/sources/` | LLM-compiled summaries of ingested sources with extraction notes | `src-source-slug.md` |
| `wiki/entities/` | Concrete subjects: People, Systems, Tools, Projects, Repos | `entity-slug.md` (e.g. `capstoneflow.md`) |
| `wiki/concepts/` | Ideas, principles, theories, patterns, frameworks | `concept-slug.md` (e.g. `associative-indexing.md`) |
| `wiki/synthesis/` | High-level synthesis, living theses, domain overviews | `syn-topic-slug.md` |
| `wiki/queries/` | Preserved valuable analytical query answers, tables, deep dives | `q-query-slug.md` |
| `wiki/index.md` | Master content catalog categorized by type | Root navigation file |
| `wiki/log.md` | Chronological, machine-parseable event and operation ledger | Append-only log |

---

## 🏷️ 3. Obsidian & Dataview Frontmatter Standards

Every wiki page (except raw files) **MUST** include YAML frontmatter for compatibility with Obsidian graph view, Dataview queries, and fuzzy search:

```yaml
---
title: "Human Readable Title"
type: source | entity | concept | synthesis | query
tags:
  - knowledge-base
  - category-tag
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - "[[src-source-slug]]"
aliases:
  - "Alternate Name"
---
```

### Wikilink Rules
- Always use standard Obsidian double-bracket links: `[[target-page]]` or `[[target-page|Custom Display Text]]`.
- Link liberally: Entities, concepts, and sources mentioned in text must be linked to establish associative trails (Vannevar Bush Memex style).

---

## ⚡ 4. Operations Protocol

### A. 📥 INGEST WORKFLOW
When the user adds a new file to `wiki/raw/` or requests an ingestion:

1. **Read & Analyze**: Read the raw source completely. Extract core ideas, key claims, entities, statistics, and mental models.
2. **Check Existing Knowledge**: Search `wiki/index.md` and related files to see what is already in the wiki. Note contradictions, updates, or confirmations.
3. **Create Source Page (`wiki/sources/src-<slug>.md`)**:
   - Write a structured extraction: Executive Summary, Key Takeaways, Extracted Claims, Direct Quotes, Connected Concepts/Entities.
4. **Update/Create Entity & Concept Pages**:
   - For every entity or concept introduced or enriched by this source, create or update its page in `wiki/entities/` or `wiki/concepts/`.
   - Add new evidence, update status, note evolving consensus or contradictions.
5. **Update Synthesis (`wiki/synthesis/`)**:
   - If the source shifts high-level understanding, update the relevant synthesis document.
6. **Update `wiki/index.md`**:
   - Add the new source, entity, and concept entries with one-line summaries.
7. **Append to `wiki/log.md`**:
   - Record the operation in standard parseable format:
     `## [YYYY-MM-DD] ingest | Title of Source`
     - Summary of changes and list of touched files.

---

### B. 🔍 QUERY WORKFLOW
When the user asks questions against the wiki:

1. **Consult Index & Graph**: Read `wiki/index.md` to identify relevant candidate pages.
2. **Drill Down**: Inspect the specific source, entity, and synthesis pages.
3. **Synthesize Response**:
   - Answer the question directly with clear references and `[[wikilinks]]`.
   - Highlight connections, trade-offs, and evolving insights.
4. **Preserve Compounding Value**:
   - If the query produces a novel analysis, comparison matrix, or architectural decision, file it into `wiki/queries/q-<topic>.md` and link it in `wiki/index.md`!

---

### C. 🧹 LINT & HEALTH-CHECK WORKFLOW
Run periodically on user request:

1. **Orphan Check**: Identify pages with 0 inbound wikilinks.
2. **Contradiction Audit**: Flag conflicting claims between older and newer sources.
3. **Ghost References**: Find wikilinks `[[page]]` that do not have a corresponding file created yet and offer to instantiate them.
4. **Knowledge Gaps**: Propose new topics, questions, or web searches to fill missing links in the synthesis.
5. **Log the Lint**: Record findings in `wiki/log.md`.

---

## 📜 5. Parseable Log Format (`wiki/log.md`)

Each log entry must follow this machine-parseable header format:

```markdown
## [YYYY-MM-DD] <operation> | <Title or Description>
- **Type**: ingest | query | lint | refactor
- **Source**: `wiki/raw/filename.md` (if applicable)
- **Touched Files**:
  - `[[wiki/sources/src-example]]` (created)
  - `[[wiki/concepts/example-concept]]` (updated)
- **Summary**: Brief description of the knowledge synthesized or changes made.
```
