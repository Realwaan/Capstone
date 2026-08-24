---
title: "Persistent Compounding Wiki"
type: concept
tags:
  - knowledge-base
  - compounding
  - architecture
  - pkm
created: 2026-08-24
updated: 2026-08-24
sources:
  - "[[src-llm-wiki-manifesto]]"
aliases:
  - "Compounding Knowledge"
  - "LLM Wiki Paradigm"
---

# 💡 Persistent Compounding Wiki

## 📖 Definition
A **Persistent Compounding Wiki** is a structured, interlinked network of markdown files that serves as an intermediate synthesis layer between immutable raw sources and the human user. Unlike ephemeral retrieval mechanisms, knowledge in a compounding wiki is compiled once and incrementally updated, revised, and resolved whenever new information arrives.

```
                    ┌───────────────────────────┐
                    │ Raw Ingested Documents    │
                    └─────────────┬─────────────┘
                                  │ Extracted & Consolidated
                                  ▼
                    ┌───────────────────────────┐
                    │ Persistent Compiled Wiki  │ ◄── Contradictions flagged,
                    │ (Entities, Concepts, Syn) │     relations cross-linked
                    └─────────────┬─────────────┘
                                  │ Instant High-Context Synthesis
                                  ▼
                    ┌───────────────────────────┐
                    │ Rapid Query & Exploration │
                    └───────────────────────────┘
```

---

## ⚡ Key Characteristics

1. **Pre-compiled Interconnectivity**: Cross-references, contradictory data points, and evolutionary timelines are resolved during ingestion, eliminating cold-start multi-document parsing latency during queries.
2. **Zero Maintenance Fatigue**: The human rarely edits files manually; the LLM agent handles all cross-linking and file synchronization across 10–15 files per ingest.
3. **Graph Compounding**: Every additional source enriches existing entity and concept nodes in [[obsidian|Obsidian]], causing the overall value of the second brain to compound exponentially rather than linearly.

---

## 🔗 Related References
- [[associative-trails]]
- [[human-curator-llm-bookkeeper]]
- [[syn-personal-knowledge-operating-system]]
- [[q-rag-vs-llm-wiki-comparison]]
