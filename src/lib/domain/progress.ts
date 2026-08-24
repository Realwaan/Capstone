import type { MilestonePhase, RevisionItem, Task } from '../../types';

export const getTaskProgressPercent = (task: Task): number => {
  if (task.status === 'done') return 100;

  if (task.status === 'adviser_review') return 90;
  if (task.status === 'peer_review') return 80;
  if (task.status !== 'in_progress') return 0;

  const checklist = task.subtasks?.length
    ? task.subtasks
    : task.acceptanceCriteria || [];
  if (checklist.length === 0) return 25;

  const completed = checklist.filter(item => item.completed).length;
  return Math.min(70, Math.round((completed / checklist.length) * 70));
};

export interface PhaseProgressResult {
  progressPercentage: number;
  status: MilestonePhase['status'];
  adviserSignOff: boolean;
  signedOffDate?: string;
  signedOffBy?: string;
  consultationNotes?: string;
  proofUrl?: string;
}

export const computePhaseProgress = (
  phase: MilestonePhase,
  tasks: Task[],
  currentPhaseId: number
): PhaseProgressResult => {
  const phaseTasks = tasks.filter(task => task.phaseId === phase.id);
  const totalDeliverables = (phase.keyDeliverables || []).length;
  const completedDeliverables = (phase.keyDeliverables || []).filter(deliverable => deliverable.completed).length;

  const deliverablePct = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

  let taskPct = 0;
  if (phaseTasks.length > 0) {
    const totalPoints = phaseTasks.reduce((sum, task) => sum + (task.storyPoints || 1), 0);
    const completedPoints = phaseTasks.reduce((sum, task) => {
      const score = getTaskProgressPercent(task) / 100;
      return sum + ((task.storyPoints || 1) * score);
    }, 0);
    taskPct = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  }

  let calculatedPct = 0;
  if (totalDeliverables > 0 && phaseTasks.length > 0) {
    calculatedPct = Math.round((deliverablePct * 0.6) + (taskPct * 0.4));
  } else if (totalDeliverables > 0) {
    calculatedPct = Math.round(deliverablePct);
  } else if (phaseTasks.length > 0) {
    calculatedPct = Math.round(taskPct);
  }

  const requiredDeliverables = (phase.keyDeliverables || []).filter(deliverable => deliverable.requiredForDefense);
  const requiredDeliverablesComplete = requiredDeliverables.every(deliverable => deliverable.completed);
  const deliveryComplete = requiredDeliverablesComplete &&
    (phaseTasks.length === 0 || phaseTasks.every(task => task.status === 'done'));
  const validSignOff = deliveryComplete && phase.adviserSignOff;
  const isFullyDone = deliveryComplete && validSignOff;

  let newStatus: MilestonePhase['status'] = 'upcoming';
  if (isFullyDone) {
    calculatedPct = 100;
    newStatus = 'completed';
  } else if (calculatedPct > 0 || phase.id === currentPhaseId) {
    newStatus = 'in_progress';
  }

  return {
    progressPercentage: calculatedPct,
    status: newStatus,
    adviserSignOff: validSignOff,
    signedOffDate: validSignOff ? phase.signedOffDate : undefined,
    signedOffBy: validSignOff ? phase.signedOffBy : undefined,
    consultationNotes: validSignOff ? phase.consultationNotes : undefined,
    proofUrl: validSignOff ? phase.proofUrl : undefined
  };
};

export const computeOverallReadiness = (
  tasks: Task[],
  phases: MilestonePhase[],
  revisions: RevisionItem[]
): number => {
  let taskReadiness = 0;
  if (tasks.length > 0) {
    const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 1), 0);
    const completedPoints = tasks.reduce((sum, task) => {
      const score = getTaskProgressPercent(task) / 100;
      return sum + ((task.storyPoints || 1) * score);
    }, 0);
    taskReadiness = (completedPoints / totalPoints) * 100;
  }

  const totalDeliverables = (phases || []).reduce((acc, phase) => acc + (phase.keyDeliverables || []).length, 0);
  const completedDeliverables = (phases || []).reduce(
    (acc, phase) => acc + (phase.keyDeliverables ? phase.keyDeliverables.filter(deliverable => deliverable.completed).length : 0),
    0
  );
  const deliverableReadiness = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;
  const signedOffPhases = (phases || []).filter(phase => phase.adviserSignOff).length;
  const phaseGateReadiness = phases.length > 0 ? (signedOffPhases / phases.length) * 100 : 0;

  let revisionReadiness = 100;
  if (revisions.length > 0) {
    const resolved = revisions.filter(revision => revision.status === 'resolved' || revision.status === 'verified').length;
    revisionReadiness = (resolved / revisions.length) * 100;
  }

  if (tasks.length > 0) {
    return Math.round(
      (taskReadiness * 0.55) +
      (deliverableReadiness * 0.25) +
      (revisionReadiness * 0.10) +
      (phaseGateReadiness * 0.10)
    );
  }

  return Math.round(
    (deliverableReadiness * 0.55) +
    (revisionReadiness * 0.20) +
    (phaseGateReadiness * 0.25)
  );
};
