# Workflow Rebuild Plan — CapStoneFlow

Derived from the design grill session (12 resolved decision branches). Every phase below has hard dependencies on earlier phases; do not reorder without revisiting the dependency chain.

## Decision Ledger (source of truth)

| # | Branch | Decision |
|---|--------|----------|
| 1 | Trust model | Real multi-team platform. Client-trusted RBAC is a defect |
| 2 | Data authority | Supabase authoritative; localStorage = cache only |
| 3 | Schema | Breaking migration + in-app backfill; UUID PKs; project-scoped everything |
| 4 | Identity | Native Supabase Auth (GitHub provider); persona switching deleted |
| 5 | Roles/invites | Single role system on `project_collaborators`; server-created invites |
| 6 | State machine | Postgres RPCs enforce all transitions; no bypass paths |
| 7 | Reliability | Durable outbox (`backgroundQueue.ts` promoted); prune dead scaffolding |
| 8 | Secrets | Per-user OAuth tokens stored server-side encrypted only |
| 9 | Architecture | TanStack Query + pure domain functions; God Context dissolved |
| 10 | Realtime | Channels = invalidation signals only; Supabase presence only |
| 11 | Content | Fabrication purged; one opt-in labeled demo workspace |
| 12 | Testing | Vitest domain tests + DB transition tests + Actions CI |

## Execution Order

```
Phase 0 (tests) -> Phase 1 (schema+RLS+RPCs) -> Phase 2 (identity+roles)
-> Phase 3 (read path) -> Phase 4 (write path) -> Phase 5 (integrations)
-> Phase 6 (content/docs)
```

Start each phase on a clean branch off latest `main`. Current working tree carries uncommitted changes — commit or stash before Phase 0.

---

## Phase 0 — Test Foundation (guards everything after)

Goal: lock current behavior of the pure parts so the inversion cannot silently regress them.

### WP 0.1 — Tooling
Files:
- `vitest.config.ts` (new)
- `package.json` — add `test`, `test:run`, `typecheck` scripts; devDeps `vitest`
Acceptance: `npm run test` runs green (even if suite is small), `npm run typecheck` passes.

### WP 0.2 — Domain extraction: progress math
Files:
- `src/lib/domain/progress.ts` (new) — move task-percent mapping, phase weighting (60/40), overall weighting (55/25/10/10) out of `src/context/ProjectContext.tsx:719-856`
- `src/context/ProjectContext.tsx` — import from domain module, behavior identical
- `src/lib/domain/__tests__/progress.test.ts`
Acceptance: percentages byte-identical for fixture inputs captured before extraction.

### WP 0.3 — Gate engine tests
Files:
- `src/lib/__tests__/workflow.test.ts` (new) — cover `getTaskSubmissionGate`, `getPhaseSignOffGate`, `getWorkflowSnapshot` including missing-evidence, unchecked-criteria, regressed-sign-off cases
Acceptance: every gate rule in `src/lib/workflow.ts:56-261` asserted.

### WP 0.4 — CI
Files:
- `.github/workflows/ci.yml` (new) — install, lint (`oxlint` config exists), `typecheck`, `test` on PR + push to main
Acceptance: ticket template t6's reference to `ci.yml` becomes true.

---

## Phase 1 — Schema, RLS, Transition RPCs (one migration batch)

Goal: make the database capable of representing multi-project data correctly and enforcing workflow rules.

### WP 1.1 — Core multi-tenant migration
Files:
- `supabase/migrations/001_multi_tenant_core.sql` (new; supersede aspirational `docs/architecture/002_multi_tenant_rls_migration.sql`)
Contents:
- `projects.id` -> UUID `gen_random_uuid()`
- `milestone_phases.id` -> UUID PK; UNIQUE(`project_id`, display_order)
- `team_members` -> UUID PK; UNIQUE(`project_id`, `auth_user_id`)
- New tables: `manuscript_chapters` (+ sections JSONB), `activity_logs` write-backed, `github_tokens`, `project_invites`, `project_collaborators`
- `standups`: rename columns to match sync writer (`yesterday_accomplished`, `today_plan`) — code wins over schema
- `revisions`: keep NOT NULL trio; mapper must supply them (fixed in Phase 4)
- Neutral defaults: drop `'Jay Vince Serato'` adviser default and hardcoded defense date (`schema.sql:20`)
- Update realtime publication for new tables
Acceptance: two projects can both own "Phase 1"; same GitHub user joins two projects without collision.

### WP 1.2 — Real RLS
Files: same migration batch or `002_rls_policies.sql`
Contents:
- `is_project_member(uuid)` / `get_project_role(uuid)` SECURITY DEFINER helpers keyed on `project_collaborators` + `auth.uid()`
- Per-table SELECT/INSERT/UPDATE policies scoped by membership; DELETE/settings owner-only
- Attachments bucket -> private; signed-URL-only access (client rework lands in WP 5.3)
Acceptance: anon key alone cannot read any project row; member sees only their projects.

### WP 1.3 — Transition RPCs
Files: `003_transition_functions.sql`
Functions (SECURITY DEFINER, role-checked via collaborators):
- `claim_task`, `release_task`, `submit_task`, `advance_review` (peer->adviser, adviser->done), `sign_off_phase`, `advance_phase`
Rules ported from client: adviser/coordinator cannot claim; peer review needs qa/leader + non-self; submission gate = all criteria checked + evidence; sign-off gate = deliverables + adviser-approved tasks; sequential phase advance gated on prior sign-off. Status mapping from Discord (`database.py:517-523`) becomes a lookup table used inside these functions.
Acceptance: direct `UPDATE tasks SET status='done'` blocked by RLS/grants for members; only RPC path mutates status.

### WP 1.4 — In-app backfill
Files:
- `src/lib/migration/localBackfill.ts` (new) — push existing localStorage workspace through upserts once user authenticates; idempotent
- `src/components/settings/*` — "Migrate this workspace" entry point
Acceptance: pre-migration browser workspace round-trips into Postgres without data loss; second run is a no-op.

---

## Phase 2 — Identity & Roles

Goal: server-verifiable identity on every request; kill self-elevation.

### WP 2.1 — Supabase Auth wiring
Files:
- `src/lib/supabaseAuth.ts` (new) — `signInWithOAuth('github')`, `onAuthStateChange` bridge, profile bootstrap -> `team_members` + `project_collaborators` rows
- `src/context/ProjectContext.tsx:858-969` — replace custom exchange with auth listener
Acceptance: login produces a JWT usable by RLS; first member of a new project becomes owner.

### WP 2.2 — Persona removal
Delete: `loginUser` (1131-1183), `switchMember` (1203-1225), demo persona `m_lead`. Demo mode relocates to explicit sandboxed workspace (WP 6.2).

### WP 2.3 — API surface re-key
Files:
- delete `api/auth/github.js`, `api/auth/logout.js`, `vite.config.ts` dev OAuth middleware (incl. token leak at line 81)
- `api/_lib/session.js` — verify Supabase JWT instead of HMAC cookie; `/api/discord/*` keep working behind it
Acceptance: no custom session cookie remains; proxies reject unsigned requests.

### WP 2.4 — Invites & capabilities
Files:
- `redeem_invite(code)` RPC — role fixed at invite creation; delete URL-suffix sniffing (`ProjectContext.tsx:2710-2723`)
- delete `src/lib/tokenSecurity.ts` (hardcoded salt + `fallback_` acceptance)
- `src/hooks/usePermissions.ts` — rewritten to consume single canonical role via `deriveCapabilities()`; three role vocabularies collapsed in `src/types/index.ts`
Acceptance: editing an invite string cannot grant adviser; capability checks have one source.

---

## Phase 3 — Read Path (server-authoritative reads)

Goal: UI renders what the DB says; realtime only marks staleness.

### WP 3.1 — Query layer
Files:
- `package.json` + `@tanstack/react-query`; `QueryClientProvider` in `src/main.tsx`
- `src/queries/tasks.ts`, `phases.ts`, `members.ts`, `chapters.ts`, `standups.ts`, `revisions.ts`, `activity.ts` (new) — keyed `[entity, projectId]`, hydrated via Supabase selects; replaces `fetchAllDataFromSupabase` block (`ProjectContext.tsx:462-497`) and localStorage-primary init (`208-368`)
Acceptance: cold load reflects DB truth; two devices agree after refresh.

### WP 3.2 — Realtime demotion
Files:
- `src/lib/realtimeHub.ts` — postgres_changes events call `queryClient.invalidateQueries` matching keys; delete blind row-patching consumer (`ProjectContext.tsx:547-567`) and structural full-refetch debounce (`499-533`)
- delete BroadcastChannel heartbeat (`985-1049`); presence = Supabase channel.track only
Acceptance: remote change appears within invalidation latency without overwrite races; one presence badge per tab connection.

### WP 3.3 — View laziness (bonus)
Files: `src/App.tsx:12-31` — `React.lazy` per view.
Acceptance: initial bundle excludes non-active views.

---

## Phase 4 — Write Path (outbox + RPC)

Goal: every mutation visible, ordered, retryable, gate-enforced.

### WP 4.1 — Real outbox
Files:
- `src/lib/backgroundQueue.ts` — promote from no-op: IndexedDB-durable queue, exponential backoff + jitter, per-op status surfaced via `useSyncStatus()` hook (reuse circuit-breaker patterns from `src/lib/discordTickets.ts:116-132`)
- `src/context/ProjectContext.tsx:666-704` — stop writing per-entity localStorage; keep only UI prefs + active-project id
Acceptance: airplane-mode mutation replays successfully on reconnect; failed op visible in UI, not swallowed.

### WP 4.2 — Mutations through RPC
Files: `src/context/ProjectContext.tsx` mutation bodies — `claimTask`(1712), `releaseTask`(1773), `resolveTask`(1820), `reviewTask`(1882), `signOffPhase`(2097), `changeCurrentPhase`(2140) call `supabase.rpc(...)`; client-side pure-fn gates retained for instant feedback only. Fix `revisions` mapper to satisfy NOT NULL columns (`supabaseSync.ts:453-466`).
Acceptance: attempting an illegal transition from devtools fails server-side; legal flows unchanged UX.

### WP 4.3 — Pruning & lifecycle
Files:
- delete `src/lib/optimisticEngine.ts`, `src/lib/offlineStore.ts`, `src/lib/objectStorage.ts`
- `deleteProject` (`2844-2870`) gains `delete_project_cascade` RPC removing all child rows
Acceptance: zero dead-module imports; project deletion leaves no orphans in DB.

---

## Phase 5 — Integrations Hardening

### WP 5.1 — Bot behind same doors
Files:
- `website-associate-bot/database.py::sync_linked_task_status` (509-623) — execute transition RPCs as dedicated integration role (grants migration); remove direct status UPDATEs
- bot README status-mapping section updated
Acceptance: Discord CLOSED still ends at done only if gates pass; otherwise surfaces rejection reason.

### WP 5.2 — GitHub token vault
Files:
- `api/github/proxy.js` (new) — session(JWT)-gated; reads caller's encrypted token from `github_tokens`; forwards repo API calls; adaptive polling replaces 25s hammer (`ProjectContext.tsx:1521-1553`)
- token issuance flow (device/code) writing AES-GCM-encrypted rows; env key `GITHUB_TOKEN_ENC_KEY`
- `src/lib/github.ts` — remove `VITE_GITHUB_TOKEN` + localStorage PAT reads (`7-24`)
- `ProjectContext.tsx:1431-1483` — auto-link demoted: merged PR attaches evidence + emits suggestion; never force-advances status
Acceptance: grep finds no GitHub credential material client-side; anonymous rate-limit errors gone.

### WP 5.3 — Private attachments
Files: `src/lib/supabaseStorage.ts` — upload via authenticated insert, share via signed URLs.
Acceptance: raw object URL without signature returns 403/404.

---

## Phase 6 — Content Truth Pass

### WP 6.1 — Purge fabrication
Files:
- `src/context/ProjectContext.tsx` — remove invented collaborators ("Althea Ramos"/"Karl David", 2801-2803) and title rewriting blocks (217-229, 2781-2785)
Acceptance: member lists contain only real authenticated users; project titles never mutated by code.

### WP 6.2 — Sandboxed demo
Files:
- demo flag on project row; explicit "Create demo workspace" action seeding audited templates
- `src/data/initialData.ts` t1-t7 — fix references to nonexistent files (prisma/docker) to reflect real stack (vite/supabase/vercel)
Acceptance: demo clearly labeled, isolated, deletable.

### WP 6.3 — Docs alignment
Files: `README.md` (structure vs reality), `DEPLOYMENT.md` (env var changes: JWT verification, `GITHUB_TOKEN_ENC_KEY`; removal of `VITE_GITHUB_TOKEN` guidance).
Acceptance: documented setup reproduces a working deploy from clean clone.

---

## Verification Rituals

Per phase completion:
1. `npm run typecheck && npm run lint && npm run test`
2. Manual smoke: claim -> submit (blocked until criteria+evidence) -> peer review (self blocked) -> adviser approve -> sign-off -> phase advance
3. Second-browser check for multi-device correctness (Phases 3+)

## Known Residuals (absorbed, tracked here)

- Activity logs currently capped at 30 locally and never written to cloud -> resolved by WP 1.1 table + WP 3.1 query
- Chapters device-local -> resolved by WP 1.1 + 3.1
- Standup/revisions column drift -> resolved by WP 1.1 + 4.2
- Progress weights arbitrary (documented in WP 0.2 module header comment-free docs via JSDoc-free README note in `docs/architecture/`)
