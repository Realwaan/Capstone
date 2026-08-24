---
title: "CapStoneFlow"
type: entity
tags:
  - project
  - engineering
  - multi-tenant
  - orchestrator
created: 2026-08-24
updated: 2026-08-24
sources:
  - "[[src-llm-wiki-manifesto]]"
aliases:
  - "CapStone"
  - "CapStoneFlow App"
---

# 🧩 Entity: CapStoneFlow

## 📖 Overview
**CapStoneFlow** is an enterprise-grade academic capstone project management and workflow orchestration platform. It integrates a React/TypeScript frontend, Supabase multi-tenant database backend, and a dedicated Discord associate bot for continuous sprint tracking and automated codebase audits.

---

## 🛠️ Architecture Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS / Custom Tokens.
- **Backend & Database**: Supabase PostgreSQL with multi-tenant Row Level Security (RLS).
- **Associate Bot**: Python `discord.py` bot (`website-associate-bot`) automating ticket threads, code scanning, and daily standups.
- **Knowledge Core**: Embedded [[persistent-compounding-wiki|LLM Wiki]] powering research, architectural decision records, and team intelligence.

---

## 🔗 Related References
- [[obsidian]]
- [[persistent-compounding-wiki]]
- [[syn-personal-knowledge-operating-system]]
