import { describe, expect, it } from 'vitest';
import {
  getPhaseSignOffGate,
  getTaskSubmissionGate,
  getWorkflowSnapshot,
  hasTaskEvidence
} from '../workflow';
import type {
  CapstoneProject,
  MilestonePhase,
  PhaseDeliverable,
  TeamMember,
  Task,
  TaskStatus
} from '../../types';

let nextId = 0;

const makeTask = (overrides: Partial<Task> & { status?: TaskStatus } = {}): Task => ({
  id: `task_${++nextId}`,
  title: 'Test task',
  description: '',
  status: overrides.status ?? 'in_progress',
  priority: 'medium',
  category: 'code',
  assigneeId: 'member_1',
  storyPoints: 1,
  estimatedHours: 1,
  loggedHours: 0,
  dueDate: '2026-12-31',
  subtasks: [],
  phaseId: overrides.phaseId ?? 1,
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
  status: 'in_progress',
  progressPercentage: 0,
  keyDeliverables: [],
  adviserSignOff: false,
  ...overrides
});

const makeMember = (role: TeamMember['role']): TeamMember => ({
  id: `member_${++nextId}`,
  name: role,
  email: `${role}@example.com`,
  role,
  roleTitle: role,
  permissionLevel: role === 'adviser' ? 'adviser' : role === 'leader' ? 'owner' : 'member',
  avatar: '',
  color: '#000000'
});

const makeProject = (overrides: Partial<CapstoneProject> = {}): CapstoneProject => ({
  id: 'proj_1',
  title: 'Test Project',
  subtitle: '',
  targetDefenseDate: '2026-12-31',
  currentPhaseId: 1,
  overallProgress: 0,
  teamName: 'Team',
  adviser: { name: 'Dr. Adviser', email: '', department: '' },
  panelMembers: [],
  ...overrides
});

describe('hasTaskEvidence', () => {
  it('accepts submitted evidence url', () => {
    expect(hasTaskEvidence(makeTask(), 'https://example.com/proof')).toBe(true);
    expect(hasTaskEvidence(makeTask(), '   ')).toBe(false);
    expect(hasTaskEvidence(makeTask())).toBe(false);
  });

  it('accepts pr url, deliverable url, or attachments', () => {
    expect(hasTaskEvidence(makeTask({ prUrl: 'https://github.com/x/pull/1' }))).toBe(true);
    expect(hasTaskEvidence(makeTask({ deliverableUrl: 'https://example.com' }))).toBe(true);
    expect(
      hasTaskEvidence(
        makeTask({
          attachments: [{ id: 'a', name: 'f.png', url: 'u', size: 1, uploadedAt: 'now' }]
        })
      )
    ).toBe(true);
  });
});

describe('getTaskSubmissionGate', () => {
  it('blocks when there are no acceptance criteria', () => {
    const gate = getTaskSubmissionGate(makeTask({ prUrl: 'https://x' }));
    expect(gate.isReady).toBe(false);
    expect(gate.missing).toEqual(['Add at least one acceptance criterion']);
  });

  it('blocks while criteria remain unchecked and counts progress', () => {
    const task = makeTask({
      prUrl: 'https://x',
      acceptanceCriteria: [
        { id: 'a', text: 'one', completed: true },
        { id: 'b', text: 'two', completed: false }
      ]
    });
    const gate = getTaskSubmissionGate(task);
    expect(gate.isReady).toBe(false);
    expect(gate.criteriaCount).toBe(2);
    expect(gate.completedCriteriaCount).toBe(1);
    expect(gate.missing[0]).toContain('(1/2)');
  });

  it('blocks without any evidence even when criteria pass', () => {
    const task = makeTask({
      acceptanceCriteria: [{ id: 'a', text: 'one', completed: true }]
    });
    const gate = getTaskSubmissionGate(task);
    expect(gate.isReady).toBe(false);
    expect(gate.missing).toEqual(['Attach evidence or provide a deliverable link']);
  });

  it('passes with all criteria checked plus at least one evidence source', () => {
    const task = makeTask({
      deliverableUrl: 'https://x',
      acceptanceCriteria: [
        { id: 'a', text: 'one', completed: true },
        { id: 'b', text: 'two', completed: true }
      ]
    });
    const gate = getTaskSubmissionGate(task, 'https://extra');
    expect(gate.isReady).toBe(true);
    expect(gate.missing).toHaveLength(0);
    expect(gate.evidenceCount).toBe(2);
  });

  it('counts every distinct evidence channel', () => {
    const task = makeTask({
      prUrl: 'https://pr',
      deliverableUrl: 'https://deliverable',
      attachments: [{ id: 'a', name: 'f.png', url: 'att', size: 1, uploadedAt: 'now' }],
      acceptanceCriteria: []
    });
    expect(getTaskSubmissionGate(task).evidenceCount).toBe(3);
  });
});

describe('getPhaseSignOffGate', () => {
  it('requires at least one scoped task or required deliverable', () => {
    const gate = getPhaseSignOffGate(makePhase(), []);
    expect(gate.isReady).toBe(false);
    expect(gate.missing).toContain('Add a scoped task or required deliverable');
  });

  it('blocks until every required deliverable is complete', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true), makeDeliverable(false)]
    });
    const gate = getPhaseSignOffGate(phase, [makeTask({ status: 'done' })]);
    expect(gate.isReady).toBe(false);
    expect(gate.missing.some(entry => entry.startsWith('Verify all required deliverables (1/2)'))).toBe(true);
  });

  it('blocks until every scoped task is adviser-approved', () => {
    const phase = makePhase();
    const gate = getPhaseSignOffGate(phase, [makeTask({ status: 'done' }), makeTask({ status: 'peer_review' })]);
    expect(gate.isReady).toBe(false);
    expect(
      gate.missing.some(entry =>
        entry.startsWith('Complete adviser approval for every scoped task (1/2)')
      )
    ).toBe(true);
  });

  it('ignores tasks from other phases and optional deliverables', () => {
    const phase = makePhase({ id: 2, keyDeliverables: [makeDeliverable(false, false)] });
    const gate = getPhaseSignOffGate(phase, [
      makeTask({ status: 'done', phaseId: 2 }),
      makeTask({ status: 'todo', phaseId: 3 })
    ]);
    expect(gate.scopedTasks).toBe(1);
    expect(gate.requiredDeliverables).toBe(0);
    expect(gate.isReady).toBe(true);
  });

  it('is ready when all requirements are satisfied', () => {
    const phase = makePhase({
      keyDeliverables: [makeDeliverable(true)]
    });
    const gate = getPhaseSignOffGate(phase, [makeTask({ status: 'done' })]);
    expect(gate.isReady).toBe(true);
    expect(gate.missing).toHaveLength(0);
  });
});

describe('getWorkflowSnapshot', () => {
  const fullSetupProject = makeProject();
  const leaderAndAdviser = [makeMember('leader'), makeMember('adviser')];

  it('routes to settings when project setup is incomplete', () => {
    const snapshot = getWorkflowSnapshot(
      makeProject({ adviser: { name: '', email: '', department: '' } }),
      [makePhase()],
      [],
      leaderAndAdviser
    );
    expect(snapshot.nextAction.target).toBe('settings');
    expect(snapshot.steps[0].state).toBe('active');
  });

  it('routes to timeline when no active phase exists', () => {
    const snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase({ id: 2 })], [], leaderAndAdviser);
    expect(snapshot.nextAction.target).toBe('timeline');
    expect(snapshot.steps[1].state).toBe('blocked');
  });

  it('routes to new-task when the active phase has no tasks', () => {
    const snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase()], [], leaderAndAdviser);
    expect(snapshot.nextAction.target).toBe('new-task');
  });

  it('routes to kanban for evidence preparation before reviews', () => {
    const unready = makeTask({
      status: 'todo',
      acceptanceCriteria: [{ id: 'a', text: 'one', completed: false }]
    });
    const snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase()], [unready], leaderAndAdviser);
    expect(snapshot.nextAction.target).toBe('kanban');
    expect(snapshot.nextAction.label).toBe('Prepare task evidence');
  });

  it('walks peer review then adviser review then sign-off in order', () => {
    const evidenceCompleteCriteria = [{ id: 'a', text: 'one', completed: true }];
    const peerPending = makeTask({
      status: 'peer_review',
      prUrl: 'https://pr',
      acceptanceCriteria: evidenceCompleteCriteria
    });
    let snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase()], [peerPending], leaderAndAdviser);
    expect(snapshot.nextAction.label).toBe('Complete peer review');

    const adviserPending = makeTask({
      status: 'adviser_review',
      prUrl: 'https://pr',
      acceptanceCriteria: evidenceCompleteCriteria
    });
    snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase()], [adviserPending], leaderAndAdviser);
    expect(snapshot.nextAction.label).toBe('Complete adviser review');
    expect(snapshot.adviserReviewCount).toBe(1);

    const approved = makeTask({
      status: 'done',
      prUrl: 'https://pr',
      acceptanceCriteria: evidenceCompleteCriteria
    });
    snapshot = getWorkflowSnapshot(fullSetupProject, [makePhase()], [approved], leaderAndAdviser);
    expect(snapshot.nextAction.target).toBe('timeline');
    expect(snapshot.phaseGate?.isReady).toBe(true);
  });

  it('marks sign-off complete once the adviser has signed', () => {
    const signedPhase = makePhase({ adviserSignOff: true, signedOffBy: 'Dr. Adviser' });
    const done = makeTask({
      status: 'done',
      prUrl: 'https://pr',
      acceptanceCriteria: [{ id: 'a', text: 'one', completed: true }]
    });
    const snapshot = getWorkflowSnapshot(fullSetupProject, [signedPhase], [done], leaderAndAdviser);

    const signOffStep = snapshot.steps.find(step => step.id === 'sign-off');
    expect(signOffStep?.state).toBe('complete');
    expect(snapshot.nextAction.label).toBe('Review computed readiness');
    expect(snapshot.nextAction.target).toBe('complete');
  });

  it('falls back to completing the phase gate when work is done but a required deliverable is not', () => {
    const blockedGatePhase = makePhase({
      keyDeliverables: [makeDeliverable(false)]
    });
    const doneWithEvidence = makeTask({
      status: 'done',
      prUrl: 'https://pr',
      acceptanceCriteria: [{ id: 'a', text: 'one', completed: true }]
    });
    const snapshot = getWorkflowSnapshot(
      fullSetupProject,
      [blockedGatePhase],
      [doneWithEvidence],
      leaderAndAdviser
    );
    expect(snapshot.nextAction.target).toBe('timeline');
    expect(snapshot.nextAction.label).toBe('Complete the phase gate');
  });
});
