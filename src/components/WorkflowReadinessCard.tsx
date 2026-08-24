import React from 'react';
import { ArrowRight, Check, CircleDot, ClipboardCheck, LockKeyhole, Plus, Settings2, ShieldCheck } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { getWorkflowSnapshot } from '../lib/workflow';
import { ViewType } from './Sidebar';

interface WorkflowReadinessCardProps {
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
}

const stateLabels = {
  complete: 'Complete',
  active: 'Needs attention',
  blocked: 'Waiting'
} as const;

export const WorkflowReadinessSkeleton: React.FC = () => (
  <section className="workflow-readiness-card precision-skeleton-container" aria-busy="true" aria-label="Loading workflow readiness">
    <div className="workflow-readiness-header">
      <div>
        <div className="skeleton-shimmer" style={{ width: '104px', height: '12px', borderRadius: '999px' }} />
        <div className="skeleton-shimmer stagger-1" style={{ width: '232px', height: '26px', borderRadius: '8px', marginTop: '12px' }} />
      </div>
      <div className="skeleton-shimmer stagger-2" style={{ width: '88px', height: '46px', borderRadius: '12px' }} />
    </div>
    <div className="workflow-skeleton-action skeleton-shimmer stagger-2" />
    <div className="workflow-step-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className={`workflow-step workflow-step-skeleton skeleton-shimmer stagger-${(index % 5) + 1}`} key={index}>
          <div className="skeleton-bone" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
          <div className="skeleton-bone" style={{ width: '76px', height: '12px', marginTop: '14px' }} />
          <div className="skeleton-bone" style={{ width: '100%', height: '10px', marginTop: '8px' }} />
        </div>
      ))}
    </div>
  </section>
);

export const WorkflowReadinessCard: React.FC<WorkflowReadinessCardProps> = ({ setActiveView, onOpenNewTask }) => {
  const { project, phases, tasks, members } = useProject();
  const workflow = getWorkflowSnapshot(project, phases, tasks, members);

  const handleNextAction = () => {
    switch (workflow.nextAction.target) {
      case 'new-task':
        onOpenNewTask();
        return;
      case 'settings':
        setActiveView('settings');
        return;
      case 'timeline':
        setActiveView('timeline');
        return;
      case 'kanban':
        setActiveView('kanban');
        return;
      default:
        return;
    }
  };

  const isComplete = workflow.nextAction.target === 'complete';

  return (
    <section className="workflow-readiness-card" aria-labelledby="workflow-readiness-heading">
      <div className="workflow-readiness-header">
        <div>
          <div className="workflow-eyebrow"><ShieldCheck size={14} /> Guided delivery</div>
          <h2 id="workflow-readiness-heading">Workflow readiness</h2>
          <p>Work is counted only after evidence, independent review, and adviser approval.</p>
        </div>
        <div className="workflow-readiness-score" aria-label={`${project.overallProgress}% computed readiness`}>
          <strong>{project.overallProgress}%</strong>
          <span>computed</span>
        </div>
      </div>

      <div className="workflow-next-action">
        <div className="workflow-next-action-icon">
          {workflow.nextAction.target === 'new-task' ? <Plus size={18} /> :
            workflow.nextAction.target === 'settings' ? <Settings2 size={18} /> :
              workflow.nextAction.target === 'complete' ? <Check size={18} /> : <ClipboardCheck size={18} />}
        </div>
        <div className="workflow-next-action-copy">
          <span>Next required action</span>
          <strong>{workflow.nextAction.label}</strong>
          <p>{workflow.nextAction.detail}</p>
        </div>
        {!isComplete && (
          <button className="btn btn-primary btn-emil-interactive workflow-next-action-button" onClick={handleNextAction}>
            Continue
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <div className="workflow-step-grid">
        {workflow.steps.map(step => (
          <article className={`workflow-step workflow-step-${step.state}`} key={step.id} aria-current={step.state === 'active' ? 'step' : undefined}>
            <div className="workflow-step-title-row">
              <span className="workflow-step-icon" aria-hidden="true">
                {step.state === 'complete' ? <Check size={13} /> : step.state === 'active' ? <CircleDot size={13} /> : <LockKeyhole size={12} />}
              </span>
              <span className="workflow-step-status">{stateLabels[step.state]}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
};