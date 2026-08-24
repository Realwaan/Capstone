import type { CapstoneProject, MilestonePhase, Task, TeamMember } from '../types';

export type WorkflowStepState = 'complete' | 'active' | 'blocked';

export interface TaskSubmissionGate {
  isReady: boolean;
  evidenceCount: number;
  criteriaCount: number;
  completedCriteriaCount: number;
  missing: string[];
}

export interface PhaseSignOffGate {
  isReady: boolean;
  requiredDeliverables: number;
  completedDeliverables: number;
  scopedTasks: number;
  approvedTasks: number;
  missing: string[];
}

export interface WorkflowStep {
  id: 'setup' | 'phase' | 'task' | 'evidence' | 'peer-review' | 'adviser-review' | 'sign-off' | 'readiness';
  title: string;
  detail: string;
  state: WorkflowStepState;
}

export type WorkflowActionTarget = 'settings' | 'timeline' | 'kanban' | 'new-task' | 'complete';

export interface WorkflowNextAction {
  label: string;
  detail: string;
  target: WorkflowActionTarget;
}

export interface WorkflowSnapshot {
  steps: WorkflowStep[];
  nextAction: WorkflowNextAction;
  currentPhase?: MilestonePhase;
  currentPhaseTasks: Task[];
  peerReviewCount: number;
  adviserReviewCount: number;
  phaseGate?: PhaseSignOffGate;
}

export const hasTaskEvidence = (task: Task, submittedEvidenceUrl?: string): boolean => {
  return Boolean(
    submittedEvidenceUrl?.trim() ||
    task.prUrl?.trim() ||
    task.deliverableUrl?.trim() ||
    task.attachments?.length
  );
};

export const getTaskSubmissionGate = (task: Task, submittedEvidenceUrl?: string): TaskSubmissionGate => {
  const criteria = task.acceptanceCriteria || [];
  const completedCriteriaCount = criteria.filter(criteriaItem => criteriaItem.completed).length;
  const evidenceCount = [
    submittedEvidenceUrl?.trim(),
    task.prUrl?.trim(),
    task.deliverableUrl?.trim(),
    ...(task.attachments || []).map(attachment => attachment.url)
  ].filter(Boolean).length;
  const missing: string[] = [];

  if (criteria.length === 0) {
    missing.push('Add at least one acceptance criterion');
  } else if (completedCriteriaCount !== criteria.length) {
    missing.push(`Complete all acceptance criteria (${completedCriteriaCount}/${criteria.length})`);
  }

  if (!hasTaskEvidence(task, submittedEvidenceUrl)) {
    missing.push('Attach evidence or provide a deliverable link');
  }

  return {
    isReady: missing.length === 0,
    evidenceCount,
    criteriaCount: criteria.length,
    completedCriteriaCount,
    missing
  };
};

export const getPhaseSignOffGate = (phase: MilestonePhase, tasks: Task[]): PhaseSignOffGate => {
  const scopedTasks = tasks.filter(task => task.phaseId === phase.id);
  const requiredDeliverables = (phase.keyDeliverables || []).filter(deliverable => deliverable.requiredForDefense);
  const completedDeliverables = requiredDeliverables.filter(deliverable => deliverable.completed);
  const approvedTasks = scopedTasks.filter(task => task.status === 'done');
  const missing: string[] = [];

  if (scopedTasks.length === 0 && requiredDeliverables.length === 0) {
    missing.push('Add a scoped task or required deliverable');
  }

  if (completedDeliverables.length !== requiredDeliverables.length) {
    missing.push(`Verify all required deliverables (${completedDeliverables.length}/${requiredDeliverables.length})`);
  }

  if (approvedTasks.length !== scopedTasks.length) {
    missing.push(`Complete adviser approval for every scoped task (${approvedTasks.length}/${scopedTasks.length})`);
  }

  return {
    isReady: missing.length === 0,
    requiredDeliverables: requiredDeliverables.length,
    completedDeliverables: completedDeliverables.length,
    scopedTasks: scopedTasks.length,
    approvedTasks: approvedTasks.length,
    missing
  };
};

export const getWorkflowSnapshot = (
  project: CapstoneProject,
  phases: MilestonePhase[],
  tasks: Task[],
  members: TeamMember[]
): WorkflowSnapshot => {
  const currentPhase = phases.find(phase => phase.id === project.currentPhaseId);
  const currentPhaseTasks = currentPhase ? tasks.filter(task => task.phaseId === currentPhase.id) : [];
  const taskGates = currentPhaseTasks.map(task => ({ task, gate: getTaskSubmissionGate(task) }));
  const reviewReadyTasks = taskGates.filter(({ gate }) => gate.isReady).length;
  const peerReviewCount = currentPhaseTasks.filter(task => task.status === 'peer_review').length;
  const adviserReviewCount = currentPhaseTasks.filter(task => task.status === 'adviser_review').length;
  const adviserApprovedTasks = currentPhaseTasks.filter(task => task.status === 'done').length;
  const phaseGate = currentPhase ? getPhaseSignOffGate(currentPhase, tasks) : undefined;
  const hasProjectSetup = Boolean(
    project.title?.trim() &&
    project.targetDefenseDate &&
    project.adviser?.name?.trim() &&
    phases.length > 0 &&
    members.some(member => member.role === 'leader') &&
    members.some(member => member.role === 'adviser')
  );
  const peerReviewComplete = currentPhaseTasks.length > 0 && currentPhaseTasks.every(task => task.status === 'adviser_review' || task.status === 'done');
  const adviserReviewComplete = currentPhaseTasks.length > 0 && adviserApprovedTasks === currentPhaseTasks.length;
  const evidenceComplete = currentPhaseTasks.length > 0 && reviewReadyTasks === currentPhaseTasks.length;

  const steps: WorkflowStep[] = [
    {
      id: 'setup',
      title: 'Project setup',
      detail: hasProjectSetup ? 'Project, adviser, team, and roadmap are configured.' : 'Add project details, an adviser, a lead, and at least one phase.',
      state: hasProjectSetup ? 'complete' : 'active'
    },
    {
      id: 'phase',
      title: 'Active phase',
      detail: currentPhase ? currentPhase.title : 'Create the first milestone phase.',
      state: currentPhase ? 'complete' : 'blocked'
    },
    {
      id: 'task',
      title: 'Scoped task',
      detail: currentPhaseTasks.length > 0 ? `${currentPhaseTasks.length} task${currentPhaseTasks.length === 1 ? '' : 's'} assigned to this phase.` : 'Create a task for the active phase.',
      state: currentPhaseTasks.length > 0 ? 'complete' : currentPhase ? 'active' : 'blocked'
    },
    {
      id: 'evidence',
      title: 'Evidence + criteria',
      detail: currentPhaseTasks.length > 0 ? `${reviewReadyTasks}/${currentPhaseTasks.length} task${currentPhaseTasks.length === 1 ? '' : 's'} ready for peer review.` : 'Task evidence and criteria appear here.',
      state: evidenceComplete ? 'complete' : currentPhaseTasks.length > 0 ? 'active' : 'blocked'
    },
    {
      id: 'peer-review',
      title: 'Peer review',
      detail: peerReviewComplete ? 'Peer verification is complete.' : peerReviewCount > 0 ? `${peerReviewCount} task${peerReviewCount === 1 ? '' : 's'} awaiting peer review.` : 'Submit evidence to start peer review.',
      state: peerReviewComplete ? 'complete' : peerReviewCount > 0 ? 'active' : 'blocked'
    },
    {
      id: 'adviser-review',
      title: 'Adviser review',
      detail: adviserReviewComplete ? 'All scoped work has adviser approval.' : adviserReviewCount > 0 ? `${adviserReviewCount} task${adviserReviewCount === 1 ? '' : 's'} awaiting adviser approval.` : 'Peer approval routes work to the adviser.',
      state: adviserReviewComplete ? 'complete' : adviserReviewCount > 0 ? 'active' : 'blocked'
    },
    {
      id: 'sign-off',
      title: 'Phase sign-off',
      detail: currentPhase?.adviserSignOff ? `Signed off by ${currentPhase.signedOffBy || 'the adviser'}.` : phaseGate?.missing[0] || 'Adviser sign-off becomes available when the phase gate is complete.',
      state: currentPhase?.adviserSignOff ? 'complete' : phaseGate?.isReady ? 'active' : 'blocked'
    },
    {
      id: 'readiness',
      title: 'Computed readiness',
      detail: `${project.overallProgress}% derived from work, deliverables, revisions, and phase gates.`,
      state: currentPhase?.adviserSignOff ? 'complete' : 'blocked'
    }
  ];

  let nextAction: WorkflowNextAction;
  if (!hasProjectSetup) {
    nextAction = {
      label: 'Complete project setup',
      detail: 'Add the missing project configuration before assigning work.',
      target: 'settings'
    };
  } else if (!currentPhase) {
    nextAction = {
      label: 'Create an active phase',
      detail: 'Set the milestone that will scope the next task.',
      target: 'timeline'
    };
  } else if (currentPhaseTasks.length === 0) {
    nextAction = {
      label: 'Create a scoped task',
      detail: `Add a task to ${currentPhase.title}.`,
      target: 'new-task'
    };
  } else {
    const firstIncompleteTask = taskGates.find(({ task, gate }) => task.status !== 'done' && !gate.isReady);
    if (firstIncompleteTask) {
      nextAction = {
        label: 'Prepare task evidence',
        detail: `${firstIncompleteTask.task.title}: ${firstIncompleteTask.gate.missing[0]}.`,
        target: 'kanban'
      };
    } else if (peerReviewCount > 0) {
      nextAction = {
        label: 'Complete peer review',
        detail: `${peerReviewCount} task${peerReviewCount === 1 ? '' : 's'} await independent verification.`,
        target: 'kanban'
      };
    } else if (adviserReviewCount > 0) {
      nextAction = {
        label: 'Complete adviser review',
        detail: `${adviserReviewCount} task${adviserReviewCount === 1 ? '' : 's'} await faculty approval.`,
        target: 'kanban'
      };
    } else if (phaseGate?.isReady && !currentPhase.adviserSignOff) {
      nextAction = {
        label: 'Request phase sign-off',
        detail: 'All required tasks and deliverables are ready for faculty sign-off.',
        target: 'timeline'
      };
    } else if (currentPhase.adviserSignOff) {
      nextAction = {
        label: 'Review computed readiness',
        detail: 'This phase is signed off; readiness updates from verified workflow data.',
        target: 'complete'
      };
    } else {
      nextAction = {
        label: 'Complete the phase gate',
        detail: phaseGate?.missing[0] || 'Review the active phase requirements.',
        target: 'timeline'
      };
    }
  }

  return {
    steps,
    nextAction,
    currentPhase,
    currentPhaseTasks,
    peerReviewCount,
    adviserReviewCount,
    phaseGate
  };
};