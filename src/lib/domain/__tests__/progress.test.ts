import { describe, expect, it } from 'vitest';
import {
  computeOverallReadiness,
  computePhaseProgress,
  getTaskProgressPercent
} from '../progress';
import type { MilestonePhase, PhaseDeliverable, RevisionItem, Subtask, Task, TaskStatus } from '../../../types';

let nextId = 0;

const makeSubtask = (completed: boolean): Subtask => ({
  id: `sub_${++nextId}`,
  title: 'subtask',
  completed
});

const makeTask = (overrides: Partial<Task> & { status?: TaskStatus }): Task => ({
  id: `task_${++nextId}`,
  title: 'Test task',
  description: '',
  status: overrides.status ?? 'todo',
  priority: 'medium',
  category: 'code',
  assigneeId: 'member_1',
  storyPoints: 1,
  estimatedHours: 1,
  loggedHours: 0,
  dueDate: '2026-12-31',
  subtasks: [],
  phaseId: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides
});

const makeDeliverable = (
  completed: boolean,
  requiredForDefense = true
): PhaseDeliverable => ({
  id: `del_${++nextId}`,
  title: 'deliverable',
  completed,
  requiredForDefense
});

const makePhase = (overrides: Partial<MilestonePhase> = {}): MilestonePhase => ({
  id: 1,
  title: 'Phase 1',
  description: '',
  targetDate: '2026-12-31',
  status: 'upcoming',
  progressPercentage: 0,
  keyDeliverables: [],
  adviserSignOff: false,
  ...overrides
});

const makeRevision = (status: RevisionItem['status']): RevisionItem => ({
  id: `rev_${++nextId}`,
  date: '2026-01-01',
  source: 'adviser',
  comment: '',
  chapterOrComponent: 'Chapter 1',
  actionTaken: '',
  status
});

describe('getTaskProgressPercent', () => {
  it('returns 100 for done regardless of checklist', () => {
    const task = makeTask({ status: 'done', subtasks: [makeSubtask(false)] });
    expect(getTaskProgressPercent(task)).toBe(100);
  });

  it('maps review statuses to fixed percentages', () => {
    expect(getTaskProgressPercent(makeTask({ status: 'adviser_review' }))).toBe(90);
    expect(getTaskProgressPercent(makeTask({ status: 'peer_review' }))).toBe(80);
  });

  it('returns 0 for backlog and todo', () => {
    expect(getTaskProgressPercent(makeTask({ status: 'backlog' }))).toBe(0);
    expect(getTaskProgressPercent(makeTask({ status: 'todo' }))).toBe(0);
  });

  it('gives in_progress tasks without a checklist a floor of 25', () => {
    expect(getTaskProgressPercent(makeTask({ status: 'in_progress' }))).toBe(25);
    expect(
      getTaskProgressPercent(makeTask({ status: 'in_progress', acceptanceCriteria: [] }))
    ).toBe(25);
  });

  it('scales in_progress by checklist completion and caps at 70', () => {
    const halfDone = makeTask({
      status: 'in_progress',
      subtasks: [makeSubtask(true), makeSubtask(false)]
    });
    expect(getTaskProgressPercent(halfDone)).toBe(35);

    const allDone = makeTask({
      status: 'in_progress',
      subtasks: [makeSubtask(true), makeSubtask(true)]
    });
    expect(getTaskProgressPercent(allDone)).toBe(70);
  });

  it('falls back to acceptanceCriteria when there are no subtasks', () => {
    const task = makeTask({
      status: 'in_progress',
      acceptanceCriteria: [
        { id: 'a', text: 'one', completed: true },
        { id: 'b', text: 'two', completed: false }
      ]
    });
    expect(getTaskProgressPercent(task)).toBe(35);
  });

  it('prefers subtasks over acceptanceCriteria when both exist', () => {
    const task = makeTask({
      status: 'in_progress',
      subtasks: [makeSubtask(true)],
      acceptanceCriteria: [
        { id: 'a', text: 'one', completed: false },
        { id: 'b', text: 'two', completed: false }
      ]
    });
    expect(getTaskProgressPercent(task)).toBe(70);
  });
});

describe('computePhaseProgress', () => {
  it('empty non-current phase stays at 0 percent upcoming', () => {
    const result = computePhaseProgress(makePhase(), [], 99);
    expect(result).toEqual({
      progressPercentage: 0,
      status: 'upcoming',
      adviserSignOff: false,
      signedOffDate: undefined,
      signedOffBy: undefined
    });
  });

  it('empty current phase is marked in_progress even at 0 percent', () => {
    const result = computePhaseProgress(makePhase({ id: 5 }), [], 5);
    expect(result.status).toBe('in_progress');
    expect(result.progressPercentage).toBe(0);
  });

  it('weights deliverables 60 and story-pointed tasks 40', () => {
    const phase = makePhase({ keyDeliverables: [makeDeliverable(true)] });
    const tasks = [
      makeTask({ status: 'done', storyPoints: 2 }),
      makeTask({ status: 'todo', storyPoints: 2 })
    ];
    const result = computePhaseProgress(phase, tasks, 1);
    expect(result.progressPercentage).toBe(Math.round(100 * 0.6 + 50 * 0.4));
    expect(result.progressPercentage).toBe(80);
  });

  it('uses deliverables only when no tasks are scoped', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true), makeDeliverable(false)]
    });
    expect(computePhaseProgress(phase, [], 1).progressPercentage).toBe(50);
  });

  it('uses tasks only when no deliverables exist', () => {
    const phase = makePhase();
    const tasks = [
      makeTask({ status: 'done' }),
      makeTask({ status: 'todo' })
    ];
    expect(computePhaseProgress(phase, tasks, 1).progressPercentage).toBe(50);
  });

  it('treats zero or missing story points as one point', () => {
    const phase = makePhase();
    const tasks = [
      makeTask({ status: 'done', storyPoints: 0 }),
      makeTask({ status: 'todo', storyPoints: 3 })
    ];
    expect(computePhaseProgress(phase, tasks, 1).progressPercentage).toBe(25);
  });

  it('keeps sign-off only when delivery requirements are met', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true)],
      adviserSignOff: true,
      signedOffDate: '2026-02-01',
      signedOffBy: 'Dr. Adviser'
    });
    const result = computePhaseProgress(phase, [makeTask({ status: 'todo' })], 1);
    expect(result.adviserSignOff).toBe(false);
    expect(result.signedOffDate).toBeUndefined();
    expect(result.signedOffBy).toBeUndefined();
    expect(result.status).not.toBe('completed');
  });

  it('marks fully delivered and signed phases complete at 100', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true), makeDeliverable(false, false)],
      adviserSignOff: true,
      signedOffDate: '2026-02-01',
      signedOffBy: 'Dr. Adviser'
    });
    const result = computePhaseProgress(phase, [makeTask({ status: 'done' })], 1);
    expect(result.progressPercentage).toBe(100);
    expect(result.status).toBe('completed');
    expect(result.adviserSignOff).toBe(true);
    expect(result.signedOffDate).toBe('2026-02-01');
    expect(result.signedOffBy).toBe('Dr. Adviser');
  });

  it('ignores incomplete optional deliverables when validating sign-off', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true), makeDeliverable(false, false)]
    });
    const result = computePhaseProgress(phase, [makeTask({ status: 'done' })], 1);
    expect(result.adviserSignOff).toBe(false);
    expect(result.status).toBe('in_progress');
  });
});

describe('computeOverallReadiness', () => {
  it('blends tasks 55, deliverables 25, revisions 10, phase gates 10 when tasks exist', () => {
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'todo' })];
    const phases = [
      makePhase({ keyDeliverables: [makeDeliverable(true), makeDeliverable(false)] })
    ];
    const revisions = [makeRevision('resolved'), makeRevision('pending')];

    const overall = computeOverallReadiness(tasks, phases, revisions);

    const expected = Math.round(50 * 0.55 + 50 * 0.25 + 50 * 0.10 + 0 * 0.10);
    expect(overall).toBe(expected);
    expect(overall).toBe(45);
  });

  it('falls back to deliverable-heavy weighting with no tasks', () => {
    const phases = [
      makePhase({
        keyDeliverables: [makeDeliverable(true)],
        adviserSignOff: true,
        status: 'completed'
      })
    ];
    expect(computeOverallReadiness([], phases, [])).toBe(100);

    const stalled = [makePhase({ keyDeliverables: [makeDeliverable(false)] })];
    expect(computeOverallReadiness([], stalled, [])).toBe(20);
  });

  it('treats empty revisions as fully ready', () => {
    const phases = [makePhase()];
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'done' })];
    expect(computeOverallReadiness(tasks, phases, [])).toBe(
      Math.round(100 * 0.55 + 0 * 0.25 + 100 * 0.10 + 0 * 0.10)
    );
  });

  it('counts resolved and verified revisions as resolved', () => {
    const revisions = [makeRevision('verified'), makeRevision('pending')];
    const overall = computeOverallReadiness([makeTask({ status: 'done' })], [makePhase()], revisions);
    const expected = Math.round(100 * 0.55 + 0 * 0.25 + 50 * 0.10 + 0 * 0.10);
    expect(overall).toBe(expected);
  });
});
