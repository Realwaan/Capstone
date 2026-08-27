import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resolveActiveProjectId } from '../supabaseSync';
import { AI_UX_WORKFLOWS } from '../../data/aiUxWorkflows';
import type { Task } from '../../types';

// Mock localStorage for node environment
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  key: (index: number) => Array.from(store.keys())[index] || null,
  get length() { return store.size; }
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('window', { localStorage: localStorageMock });

describe('supabaseSync & Multi-Project Workflow Integrity', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('resolveActiveProjectId', () => {
    it('returns explicitly provided targetId first', () => {
      expect(resolveActiveProjectId('target-proj-123')).toBe('target-proj-123');
    });

    it('resolves active project from user-scoped identity keys in localStorage', () => {
      store.set('capstoneflow_state_v10_github_user', JSON.stringify({ login: 'octocat' }));
      store.set('capstoneflow_active_project_id__gh_octocat', 'proj-gh-456');
      expect(resolveActiveProjectId()).toBe('proj-gh-456');
    });

    it('resolves active project from direct localStorage key', () => {
      store.set('capstoneflow_active_project_id', 'proj-direct-789');
      expect(resolveActiveProjectId()).toBe('proj-direct-789');
    });

    it('falls back safely to default capstone-proj-001 if storage is empty', () => {
      expect(resolveActiveProjectId()).toBe('capstone-proj-001');
    });
  });

  describe('AI UX Workflow Ticket Generation Uniqueness', () => {
    it('generates completely distinct, collision-free IDs for all workflow steps generated in a tight loop', () => {
      const activeWorkflow = AI_UX_WORKFLOWS[0];
      const baseTimestamp = Date.now();
      const now = new Date().toISOString();

      const createdTasks: Task[] = activeWorkflow.steps.map((step, idx) => {
        const randId = Math.random().toString(36).substring(2, 7);
        return {
          id: `task-wf-${baseTimestamp}-${idx}-${randId}`,
          title: `[${activeWorkflow.title}] ${step.title}`,
          description: step.problemStatement,
          status: idx === 0 ? 'todo' : 'backlog',
          priority: step.priority,
          category: step.category,
          assigneeId: 'member_1',
          storyPoints: step.storyPoints,
          estimatedHours: step.estimatedHours,
          loggedHours: 0,
          dueDate: new Date(baseTimestamp + (idx + 1) * 2 * 86400000).toISOString().split('T')[0],
          phaseId: 1,
          createdAt: now.split('T')[0],
          updatedAt: now.split('T')[0],
          subtasks: step.whatToFix.map((fix, sIdx) => ({
            id: `sub-${baseTimestamp}-${idx}-${sIdx}-${Math.random().toString(36).substring(2, 6)}`,
            title: fix,
            completed: false
          })),
          problemStatement: step.problemStatement,
          whatToFix: step.whatToFix,
          acceptanceCriteria: step.acceptanceCriteria.map((crit, cIdx) => ({
            id: `crit-${baseTimestamp}-${idx}-${cIdx}-${Math.random().toString(36).substring(2, 6)}`,
            text: crit,
            completed: false
          })),
          relatedFiles: step.relatedFiles,
          folder: activeWorkflow.id
        };
      });

      const taskIds = createdTasks.map(t => t.id);
      const uniqueTaskIds = new Set(taskIds);
      expect(uniqueTaskIds.size).toBe(taskIds.length);
      expect(createdTasks.length).toBe(activeWorkflow.steps.length);

      const allSubtaskIds = createdTasks.flatMap(t => (t.subtasks || []).map(s => s.id));
      const uniqueSubtaskIds = new Set(allSubtaskIds);
      expect(uniqueSubtaskIds.size).toBe(allSubtaskIds.length);

      const allCriteriaIds = createdTasks.flatMap(t => (t.acceptanceCriteria || []).map(c => c.id));
      const uniqueCriteriaIds = new Set(allCriteriaIds);
      expect(uniqueCriteriaIds.size).toBe(allCriteriaIds.length);
    });
  });
});
