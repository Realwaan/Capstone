import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  FolderGit2, 
  Users, 
  Target, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  X,
  Check,
  Compass
} from 'lucide-react';
import { startWorkspaceTour } from '../lib/tour';

interface OnboardingChecklistBannerProps {
  setActiveView: (view: ViewType) => void;
  onOpenStandupModal?: () => void;
  onOpenWizard?: () => void;
}

const STORAGE_BANNER_COLLAPSED = 'capstoneflow_onboarding_collapsed';
const STORAGE_BANNER_DISMISSED = 'capstoneflow_onboarding_dismissed';

export const OnboardingChecklistBanner: React.FC<OnboardingChecklistBannerProps> = ({
  setActiveView,
  onOpenStandupModal,
  onOpenWizard
}) => {
  const { project, members, tasks, standups, revisions } = useProject();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_BANNER_COLLAPSED) === 'true';
  });
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_BANNER_DISMISSED) === 'true';
  });

  // Calculate completion state for 5 steps
  const hasLinkedRepo = !!(project.githubRepoUrl && project.githubRepoUrl.trim().length > 3);
  const hasTeamMembers = members.length >= 2;
  const hasClaimedTask = tasks.some(t => !!t.assigneeId);
  const hasSubmittedStandup = standups.length > 0;
  const hasReviewedManuscript = revisions.length > 0 || tasks.some(t => t.category === 'docs' && t.status === 'done');

  const steps = [
    {
      id: 'repo',
      title: 'Link GitHub Repository',
      description: 'Sync live commits & pull requests to your workspace.',
      done: hasLinkedRepo,
      actionLabel: 'Connect Repo',
      action: () => setActiveView('settings'),
      icon: FolderGit2
    },
    {
      id: 'team',
      title: 'Invite Team Members via GitHub',
      description: 'Add teammate GitHub handles to assign RBAC roles.',
      done: hasTeamMembers,
      actionLabel: 'Add Teammates',
      action: () => setActiveView('settings'),
      icon: Users
    },
    {
      id: 'task',
      title: 'Claim Your First Sprint Task',
      description: 'Pick an open backlog ticket or use /claim on Kanban.',
      done: hasClaimedTask,
      actionLabel: 'Claim Ticket',
      action: () => setActiveView('kanban'),
      icon: Target
    },
    {
      id: 'standup',
      title: 'Submit First Daily Standup',
      description: 'Post your daily engineering plan & update burndown.',
      done: hasSubmittedStandup,
      actionLabel: 'Post Standup',
      action: () => onOpenStandupModal ? onOpenStandupModal() : setActiveView('dashboard'),
      icon: MessageSquare
    },
    {
      id: 'manuscript',
      title: 'Review Manuscript & Revisions',
      description: 'Track Chapter drafts and adviser compliance matrix.',
      done: hasReviewedManuscript,
      actionLabel: 'View Manuscript',
      action: () => setActiveView('manuscript'),
      icon: BookOpen
    }
  ];

  const completedCount = steps.filter(s => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isAllDone = completedCount === steps.length;

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_BANNER_COLLAPSED, String(next));
      return next;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_BANNER_DISMISSED, 'true');
  };

  if (isDismissed && isAllDone) return null;

  return (
    <div 
      className="card"
      style={{
        padding: '0',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
        background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.05) 0%, rgba(10, 132, 255, 0.03) 100%)',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      {/* Banner Header */}
      <div 
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle)',
          cursor: 'pointer'
        }}
        onClick={toggleCollapse}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: isAllDone ? 'var(--success)' : 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(48, 209, 88, 0.25)'
          }}>
            {isAllDone ? <Check size={16} strokeWidth={3} /> : <Sparkles size={15} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isAllDone ? '🎉 Capstone Workspace Fully Onboarded!' : 'Capstone Quick-Start Checklist'}
              </span>
              <span className={`badge ${isAllDone ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                {completedCount}/{steps.length} Steps ({progressPercent}%)
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isAllDone 
                ? 'All initial milestone integrations are complete. Sprint velocity tracking is fully active.'
                : 'Complete these 5 initial onboarding actions to get your sprint velocity and defense timeline ready.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => startWorkspaceTour()}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.72rem', padding: '2px 8px', height: '26px', gap: '4px' }}
            title="Start Interactive Tour"
          >
            <Compass size={12} style={{ color: 'var(--primary)' }} />
            <span>Tour</span>
          </button>

          {onOpenWizard && (
            <button
              type="button"
              onClick={onOpenWizard}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', padding: '2px 8px', height: '26px', gap: '4px' }}
              title="Open Setup Wizard"
            >
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Wizard</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            className="btn btn-ghost btn-icon"
            style={{ width: '26px', height: '26px' }}
            title={isCollapsed ? 'Expand Checklist' : 'Collapse Checklist'}
          >
            {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-ghost btn-icon"
            style={{ width: '26px', height: '26px', color: 'var(--text-muted)' }}
            title="Dismiss Checklist"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ width: '100%', height: '3px', background: 'var(--bg-elevated)' }}>
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            background: isAllDone ? 'var(--success)' : 'linear-gradient(90deg, #30d158 0%, #0a84ff 100%)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} 
        />
      </div>

      {/* Step Items List */}
      {!isCollapsed && (
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="grid-cols-2" style={{ gap: '10px' }}>
            {steps.map(step => {
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: step.done ? 'var(--bg-card)' : 'var(--bg-elevated)',
                    border: step.done ? '1px solid var(--border-subtle)' : '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 140ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      color: step.done ? 'var(--success)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      {step.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: step.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: step.done ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {!step.done ? (
                    <button
                      type="button"
                      onClick={step.action}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.68rem', padding: '3px 8px', height: '24px', flexShrink: 0, gap: '4px' }}
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight size={11} />
                    </button>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '1px 5px', flexShrink: 0 }}>
                      Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
