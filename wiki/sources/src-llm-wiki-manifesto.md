---
title: "Source: LLM Wiki Idea & Architecture Specification"
type: source
tags:
  - knowledge-management
  - architecture
  - second-brain
  - ai-agents
created: 2026-08-24
updated: 2026-08-24
raw_file: "[[wiki/raw/2026-08-24-llm-wiki-idea.md]]"
author: "Community Knowledge Pioneer"
aliases:
  - "LLM Wiki Idea"
  - "LLM Wiki Architecture"
---

# 📑 Source: LLM Wiki Idea & Architecture Specification

## 🎯 Executive Summary
Traditional RAG (Retrieval-Augmented Generation) treats knowledge retrieval as an ephemeral query-time task with no persistent synthesis or accumulation across sessions. The **LLM Wiki** paradigm introduces an active, compounding, three-layer markdown architecture where an LLM agent serves as an autonomous knowledge maintainer, cross-referencer, and bookkeeper, while the human acts as the curator and explorer in [[obsidian|Obsidian]].

---

## 🔑 Core Claims & Key Extractions

1. **Compilation vs. Ephemeral Re-derivation**:
   - In traditional RAG, the LLM rediscovers knowledge from scratch on every prompt.
   - In an LLM Wiki, knowledge is **compiled once and kept continuously up to date**. Contradictions, cross-references, and syntheses compound over time ([[persistent-compounding-wiki]]).
2. **Division of Labor**:
   - **Human Role**: Source curation, inquiry, thesis direction, evaluation.
   - **LLM Role**: Bookkeeping, extracting, updating entity/concept files, cross-referencing, linting ([[human-curator-llm-bookkeeper]]).
3. **The Three-Layer Model**:
   - *Layer 1*: Immutable Raw Sources (`wiki/raw/`).
   - *Layer 2*: Interlinked Markdown Wiki (`wiki/`).
   - *Layer 3*: Agent Operational Schema (`wiki/CLAUDE.md`).
4. **Historical Provenance**:
   - Explicitly traces back to [[vannevar-bush|Vannevar Bush's 1945 Memex]], solving the missing link of associative trail maintenance through automated agent orchestration ([[associative-trails]]).

---

## 🔗 Extracted Relationships

- **Enriched Concepts**:
  - [[persistent-compounding-wiki]]
  - [[associative-trails]]
  - [[human-curator-llm-bookkeeper]]
- **Connected Entities**:
  - [[obsidian]]
  - [[vannevar-bush]]
  - [[capstoneflow]]
- **Synthesized In**:
  - [[syn-personal-knowledge-operating-system]]
- **Associated Queries**:
  - [[q-rag-vs-llm-wiki-comparison]]
