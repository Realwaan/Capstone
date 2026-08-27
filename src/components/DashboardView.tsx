import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import type { Task } from '../types';
import { formatRelativeTime, formatExactTimestamp, useLiveTimeRefresh } from '../utils/time';
import { 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  Check, 
  Milestone, 
  ShieldCheck, 
  Settings2, 
  X, 
  Crown,
  ArrowRight,
  Zap,
  UserCheck,
  Flame,
  Clock,
  Users,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Handshake,
  PlayCircle,
  Lock,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import { SprintBurndownChart } from './SprintBurndownChart';
import { PriorityBadge } from './PriorityBadge';
import { TaskTicketModal } from './TaskTicketModal';
import { getPhaseSignOffGate } from '../lib/workflow';
import { toast } from 'sonner';

const GateSegmentCells: React.FC<{ total: number; done: number; color: string }> = ({ total, done, color }) => (
  <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, index) => (
      <span
        key={index}
        style={{
          width: '8px',
          height: '4px',
          borderRadius: '2px',
          background: index < done ? color : 'var(--border-card)'
        }}
      />
    ))}
  </span>
);

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
  onEditTask?: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  setActiveView, 
  onEditTask
}) => {
  const { 
    project, 
    tasks, 
    phases, 
    revisions, 
    members, 
    activityLogs,
    currentMember,
    isOwner,
    isAdviser,
    updateProjectInfo,
    changeCurrentPhase,
    signOffPhase,
    claimTask,
    releaseTask,
    canSignOffMilestones,
    canChangePhases
  } = useProject();

  useLiveTimeRefresh(15000);

  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(project?.title || '');
  const [editSubtitle, setEditSubtitle] = useState(project?.subtitle || '');
  const [editDefenseDate, setEditDefenseDate] = useState(project?.targetDefenseDate || '');
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [activePipelineFilter, setActivePipelineFilter] = useState<'all' | 'claimable' | 'my_claimed' | 'in_review'>('all');
  const [selectedTicketTask, setSelectedTicketTask] = useState<Task | null>(null);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (project) {
      setEditTitle(project.title || '');
      setEditSubtitle(project.subtitle || '');
      setEditDefenseDate(project.targetDefenseDate || '');
    }
  }, [project]);

  useEffect(() => {
    if (!isEditGoalsOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEditGoalsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    modalCloseButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditGoalsOpen]);

  // CRM Pipeline Calculations
  const allTasks = tasks || [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Claimable Pool: Tasks ready in Todo status without an active assignee
  const claimableTasks = allTasks.filter(t => (t.status === 'todo' || t.status === 'backlog') && (!t.assigneeId || t.assigneeId === ''));
  const claimablePoints = claimableTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  // My Claimed Tasks: Tasks claimed by current user that are in flight
  const myClaimedTasks = allTasks.filter(t => t.assigneeId === currentMember.id && t.status !== 'done');
  const myClaimedPoints = myClaimedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  // In-Flight Tasks (Claimed across team)
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress');
  const inProgressPoints = inProgressTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  // Review Queue (Peer Review & Adviser Review)
  const peerReviewTasks = allTasks.filter(t => t.status === 'peer_review');
  const adviserReviewTasks = allTasks.filter(t => t.status === 'adviser_review');
  const totalReviewQueue = peerReviewTasks.length + adviserReviewTasks.length;

  const totalDeliverables = (phases || []).reduce((acc, p) => acc + (p?.keyDeliverables?.length || 0), 0);
  const completedDeliverables = (phases || []).reduce((acc, p) => acc + (p?.keyDeliverables ? p.keyDeliverables.filter(d => d.completed).length : 0), 0);
  const deliverableProgress = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  const pendingRevisions = (revisions || []).filter(r => r.status === 'pending');
  const inProgressRevisions = (revisions || []).filter(r => r.status === 'in_progress');

  const activeTasks = allTasks
    .filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review')
    .sort((a, b) => {
      const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const overdueTasks = activeTasks.filter(task => {
    const dueDate = new Date(`${task.dueDate}T23:59:59`);
    return !Number.isNaN(dueDate.getTime()) && dueDate < today;
  });
  const urgentTasks = activeTasks.filter(task => task.priority === 'urgent');

  const currentPhase = (phases || []).find(p => p.id === project?.currentPhaseId) || phases?.[0];
  const currentPhaseIndex = (phases || []).findIndex(p => p.id === project?.currentPhaseId);
  const activePhaseName = currentPhase 
    ? (currentPhase.title.startsWith('Phase') ? currentPhase.title.split(':')[0].trim() : `Phase ${currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : 1}`)
    : 'No Phase';

  const activeGate = currentPhase ? getPhaseSignOffGate(currentPhase, allTasks) : undefined;
  const gateSigned = !!currentPhase?.adviserSignOff;
  const gateReady = !!activeGate?.isReady;
  const gateIsEmpty = !!activeGate && activeGate.scopedTasks === 0 && activeGate.requiredDeliverables === 0;
  const nextPhaseAfterCurrent = currentPhaseIndex >= 0 ? (phases || [])[currentPhaseIndex + 1] : undefined;
  const gateDotColor = gateSigned ? 'var(--success)' : gateReady ? 'var(--info)' : 'var(--warning)';
  const gateAccentBorder = gateSigned ? 'rgba(48, 213, 88, 0.35)' : gateReady ? 'rgba(100, 210, 255, 0.35)' : 'var(--border-subtle)';

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    updateProjectInfo({
      title: editTitle,
      subtitle: editSubtitle,
      targetDefenseDate: editDefenseDate
    });

    setIsEditGoalsOpen(false);
  };

  const handleQuickClaim = async (taskId: string, title: string) => {
    setClaimingTaskId(taskId);
    try {
      const success = await claimTask(taskId);
      if (success) {
        toast.success(`Claimed: "${title}"`, {
          description: `Assigned to ${currentMember.name} • Moved to In Progress`
        });
      }
    } finally {
      setClaimingTaskId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Studio Header HUD Banner with Role-Based Controls */}
      <div 
        className="card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          padding: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ fontWeight: 800 }}>
              {activePhaseName.toUpperCase()}
            </span>
            <span className="badge badge-neutral">
              {project?.teamName || 'Capstone Dev Team'}
            </span>
            {isOwner ? (
              <span className="badge badge-primary" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', border: '1px solid rgba(16, 185, 129, 0.3)', gap: '4px' }}>
                <Crown size={12} />
                <span>Project Lead (Full Control)</span>
              </span>
            ) : isAdviser ? (
              <span className="badge badge-info" style={{ gap: '4px' }}>
                <ShieldCheck size={12} />
                <span>Faculty Adviser Mode</span>
              </span>
            ) : (
              <span className="badge badge-neutral" style={{ gap: '4px' }}>
                <UserCheck size={12} style={{ color: 'var(--primary)' }} />
                <span>Contributor: {currentMember.name}</span>
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {project?.title || 'Capstone Project Workspace'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            {project?.subtitle || 'Collaborative software engineering & capstone implementation workspace.'}
          </p>

          {currentPhase && activeGate && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              background: 'var(--bg-elevated)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${gateAccentBorder}`
            }}>
              <span
                className={gateReady && !gateSigned ? 'gate-dot-pulse' : undefined}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: gateDotColor,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Active phase gate:
              </span>

              {gateSigned ? (
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--success)' }}>
                  {currentPhase.signedOffBy ? `Endorsed: ${currentPhase.signedOffBy} — ready to advance` : 'Signed off — ready to advance'}
                </span>
              ) : gateReady ? (
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--info)' }}>
                  All requirements met — ready for consultation sign-off
                </span>
              ) : (
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {activeGate.missing[0] || 'Complete delivery and consultation sign-off to advance'}
                </span>
              )}

              {!gateSigned && !gateIsEmpty && (activeGate.requiredDeliverables > 0 || activeGate.scopedTasks > 0) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {activeGate.requiredDeliverables > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Deliverables {activeGate.completedDeliverables}/{activeGate.requiredDeliverables}
                      <GateSegmentCells total={activeGate.requiredDeliverables} done={activeGate.completedDeliverables} color="var(--success)" />
                    </span>
                  )}
                  {activeGate.scopedTasks > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Approved {activeGate.approvedTasks}/{activeGate.scopedTasks}
                      <GateSegmentCells total={activeGate.scopedTasks} done={activeGate.approvedTasks} color="var(--info)" />
                    </span>
                  )}
                </span>
              )}

              {!gateSigned && gateReady && canSignOffMilestones && (
                <button
                  onClick={() => signOffPhase(currentPhase.id)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '3px 10px', height: '24px', fontSize: '0.72rem', gap: '4px' }}
                >
                  <ShieldCheck size={12} />
                  <span>Record sign-off</span>
                </button>
              )}

              {gateSigned && canChangePhases && nextPhaseAfterCurrent && (
                <button
                  onClick={() => changeCurrentPhase(nextPhaseAfterCurrent.id)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '3px 10px', height: '24px', fontSize: '0.72rem', gap: '4px' }}
                >
                  <Zap size={12} />
                  <span>Advance to Phase {currentPhaseIndex + 2}</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('timeline')}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: gateReady || gateSigned ? undefined : 'auto', padding: '3px 8px', height: '24px', fontSize: '0.72rem', gap: '4px' }}
              >
                <span>View gate</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Precision Progress Metric + Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '240px' }}>
          <div style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                OVERALL READINESS
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                Cloud Live
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                {project?.overallProgress ?? 0}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Target: {project?.targetDefenseDate || '2026-11-30'}
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="progress-bar-container" style={{ height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${project?.overallProgress || 0}%` }} />
            </div>

            {/* Breakdown Mini Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <div>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{taskCompletionRate}%</strong></div>
              <div>Deliverables: <strong style={{ color: 'var(--text-primary)' }}>{deliverableProgress}%</strong></div>
            </div>
          </div>

          {isOwner && (
            <button 
              onClick={() => {
                setEditTitle(project?.title || '');
                setEditSubtitle(project?.subtitle || '');
                setEditDefenseDate(project?.targetDefenseDate || '2026-11-30');
                setIsEditGoalsOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.76rem' }}
            >
              <Settings2 size={13} style={{ color: 'var(--primary)' }} />
              <span>Edit project setup</span>
            </button>
          )}
        </div>
      </div>

      {/* 🚀 CRM TASK PIPELINE STAGE FUNNEL */}
      <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>CRM Task Lifecycle & Claiming Pipeline</h2>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Live task conversion funnel across ownership, development, quality assurance & faculty sign-off stages
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActivePipelineFilter('all')}
              className={`btn btn-sm ${activePipelineFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.72rem', height: '28px', padding: '0 10px' }}
            >
              All Pipeline ({totalTasks})
            </button>
            <button 
              onClick={() => setActivePipelineFilter('claimable')}
              className={`btn btn-sm ${activePipelineFilter === 'claimable' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.72rem', height: '28px', padding: '0 10px', gap: '4px' }}
            >
              <Zap size={12} style={{ color: '#eab308' }} />
              <span>Open to Claim ({claimableTasks.length})</span>
            </button>
            <button 
              onClick={() => setActivePipelineFilter('my_claimed')}
              className={`btn btn-sm ${activePipelineFilter === 'my_claimed' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.72rem', height: '28px', padding: '0 10px', gap: '4px' }}
            >
              <UserCheck size={12} style={{ color: 'var(--primary)' }} />
              <span>My Claimed ({myClaimedTasks.length})</span>
            </button>
            <button 
              onClick={() => setActivePipelineFilter('in_review')}
              className={`btn btn-sm ${activePipelineFilter === 'in_review' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.72rem', height: '28px', padding: '0 10px', gap: '4px' }}
            >
              <ShieldCheck size={12} style={{ color: '#38bdf8' }} />
              <span>In Review ({totalReviewQueue})</span>
            </button>
          </div>
        </div>

        {/* Pipeline Conversion Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {/* Stage 1: Backlog */}
          <div 
            onClick={() => setActiveView('kanban')}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              transition: 'transform 150ms ease, border-color 150ms ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>1. Backlog</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>Scoping</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {allTasks.filter(t => t.status === 'backlog').length}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {allTasks.filter(t => t.status === 'backlog').reduce((s, t) => s + (t.storyPoints || 0), 0)} pts unscoped
            </div>
          </div>

          {/* Stage 2: Open to Claim */}
          <div 
            onClick={() => setActivePipelineFilter('claimable')}
            style={{
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              transition: 'transform 150ms ease, border-color 150ms ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>2. Open Pool</span>
              <span className="badge" style={{ fontSize: '0.6rem', background: '#eab308', color: '#000', fontWeight: 800 }}>CLAIMABLE</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#eab308' }}>
              {claimableTasks.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {claimablePoints} pts available
            </div>
          </div>

          {/* Stage 3: Claimed & In Progress */}
          <div 
            onClick={() => setActiveView('kanban')}
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>3. In-Flight</span>
              <span className="badge" style={{ fontSize: '0.6rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>CLAIMED</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
              {inProgressTasks.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {inProgressPoints} pts assigned
            </div>
          </div>

          {/* Stage 4: Peer Review */}
          <div 
            onClick={() => setActiveView('kanban')}
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>4. QA Review</span>
              <span className="badge" style={{ fontSize: '0.6rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>PEER</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
              {peerReviewTasks.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Awaiting QA verification
            </div>
          </div>

          {/* Stage 5: Adviser Consultation */}
          <div 
            onClick={() => setActiveView('kanban')}
            style={{
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>5. Adviser Gate</span>
              <span className="badge" style={{ fontSize: '0.6rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>VERIFY</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#c084fc' }}>
              {adviserReviewTasks.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Consultation sign-off
            </div>
          </div>

          {/* Stage 6: Defense Ready (Done) */}
          <div 
            onClick={() => setActiveView('kanban')}
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>6. Done</span>
              <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>DEFENSE READY</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              {completedTasks}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {taskCompletionRate}% completed
            </div>
          </div>
        </div>
      </div>

      {/* Main CRM Grid: Left Claiming Opportunities + Right Team Capacity Leaderboard */}
      <div className="grid-cols-3" style={{ alignItems: 'flex-start' }}>
        {/* Left Column (Span 2): Claimable Work Hub & My Active Queue */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ⚡ 1. CRM Inbound Opportunities: Open Tasks for Claiming */}
          {(activePipelineFilter === 'all' || activePipelineFilter === 'claimable') && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} style={{ color: '#eab308' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Claimable Tasks (Open Pool)</span>
                      <span className="badge" style={{ fontSize: '0.64rem', background: '#eab308', color: '#000', fontWeight: 800 }}>
                        {claimableTasks.length} Available
                      </span>
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                      Claim unassigned work to take ownership and start development in your sprint queue
                    </p>
                  </div>
                </div>

                <button onClick={() => setActiveView('kanban')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', gap: '4px', fontSize: '0.74rem' }}>
                  <span>Task Matrix</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {claimableTasks.slice(0, 4).map(task => (
                  <div 
                    key={task.id}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className={`badge tag-${task.category}`} style={{ fontSize: '0.58rem' }}>
                          {task.category}
                        </span>
                        <PriorityBadge priority={task.priority} size="xs" />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {task.storyPoints || 3} pts · {task.estimatedHours || 8}h
                        </span>
                      </div>
                      <div 
                        onClick={() => setSelectedTicketTask(task)}
                        style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        {task.title}
                      </div>
                      {task.problemStatement && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.problemStatement}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTicketTask(task)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 8px', height: '28px', gap: '4px' }}
                      >
                        <span>Details</span>
                      </button>
                      <button
                        type="button"
                        disabled={claimingTaskId === task.id}
                        onClick={() => handleQuickClaim(task.id, task.title)}
                        className="btn btn-primary btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          height: '28px',
                          padding: '0 12px',
                          gap: '5px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                        }}
                      >
                        <Zap size={13} className={claimingTaskId === task.id ? 'spin' : ''} />
                        <span>{claimingTaskId === task.id ? 'Claiming...' : '⚡ Claim Ticket'}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {claimableTasks.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    🎉 All active phase tasks have been claimed by team members!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 💼 2. My Claimed Active Queue */}
          {(activePipelineFilter === 'all' || activePipelineFilter === 'my_claimed') && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                      My Claimed Work Queue ({currentMember.name})
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                      Tasks actively assigned to you across development and review stages
                    </p>
                  </div>
                </div>

                <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                  {myClaimedPoints} Story Points in Flight
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myClaimedTasks.map(task => {
                  const dueDate = new Date(`${task.dueDate}T23:59:59`);
                  const isOverdue = !Number.isNaN(dueDate.getTime()) && dueDate < today;
                  const criteriaCount = task.acceptanceCriteria?.length || 0;
                  const criteriaDone = (task.acceptanceCriteria || []).filter(c => c.completed).length;

                  return (
                    <div 
                      key={task.id}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span 
                            className="badge" 
                            style={{ 
                              fontSize: '0.58rem',
                              background: task.status === 'in_progress' ? 'rgba(99, 102, 241, 0.2)' : task.status === 'peer_review' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                              color: task.status === 'in_progress' ? '#818cf8' : task.status === 'peer_review' ? '#38bdf8' : '#c084fc',
                              textTransform: 'uppercase',
                              fontWeight: 700
                            }}
                          >
                            {task.status.replace('_', ' ')}
                          </span>
                          <PriorityBadge priority={task.priority} size="xs" />
                          <span style={{ fontSize: '0.68rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 800 : 400, fontFamily: 'var(--font-mono)' }}>
                            {isOverdue ? '⚠️ Overdue' : `Due: ${task.dueDate}`}
                          </span>
                        </div>
                        <div 
                          onClick={() => setSelectedTicketTask(task)}
                          style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          {task.title}
                        </div>
                        {criteriaCount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckSquare size={12} style={{ color: 'var(--primary)' }} />
                            <span>Acceptance Criteria: {criteriaDone}/{criteriaCount} complete</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTicketTask(task)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', height: '28px' }}
                        >
                          Open Ticket
                        </button>
                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => releaseTask(task.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.7rem', color: 'var(--text-muted)', height: '28px' }}
                            title="Return to open pool"
                          >
                            Unclaim
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {myClaimedTasks.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    You currently have no active claimed tickets. Claim an open ticket above to start work!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sprint Velocity Burndown Telemetry */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>Sprint Velocity & Workload Delivery</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Live delivery burn rate vs 14-day institutional cycle</p>
                </div>
              </div>
              <button onClick={() => setActiveView('reports')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', gap: '4px', fontSize: '0.75rem' }}>
                <span>Full Telemetry</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <SprintBurndownChart sprintDurationDays={14} showHistoricalVelocity={false} />
          </div>
        </div>

        {/* Right Column: CRM Team Workload Leaderboard & Live Telemetry Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 👥 3. Team Capacity & Claiming Leaderboard */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>Team Capacity Matrix</h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
                {members.length} MEMBERS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {members.map(member => {
                const assigned = allTasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
                const points = assigned.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
                const doneCount = allTasks.filter(t => t.assigneeId === member.id && t.status === 'done').length;
                const isHeavy = assigned.length >= 4;
                const isCurrent = member.id === currentMember.id;

                return (
                  <div 
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: isCurrent ? 'var(--primary-light)' : 'var(--bg-elevated)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <img 
                        src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                        alt={member.name}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.name} {isCurrent && <span style={{ fontSize: '0.64rem', color: 'var(--primary)' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.roleTitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.6rem',
                          background: isHeavy ? 'rgba(239, 68, 68, 0.15)' : assigned.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                          color: isHeavy ? 'var(--danger)' : assigned.length > 0 ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                      >
                        {assigned.length} Active ({points} pts)
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {doneCount} finished
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⚡ 4. Live CRM Activity Stream */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={15} style={{ color: '#f97316' }} />
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>CRM Real-Time Feed</h3>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LATEST 6</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activityLogs.slice(0, 6).map(log => {
                const user = members.find(m => m.id === log.userId);
                return (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <img 
                      src={user?.avatar || `https://github.com/${user?.githubUsername || 'ghost'}.png`} 
                      alt="" 
                      style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover', marginTop: '2px' }}
                    />
                    <div style={{ fontSize: '0.74rem', lineHeight: 1.35, flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Member'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>{' '}
                      <span style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{log.target}</span>
                      <div 
                        title={formatExactTimestamp(log.timestamp)}
                        style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)', cursor: 'help' }}
                      >
                        {formatRelativeTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activityLogs.length === 0 && (
                <div style={{ padding: '18px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Activity will appear here as your team works.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project setup modal */}
      {isEditGoalsOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditGoalsOpen(false)}>
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="project-setup-title" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} style={{ color: 'var(--primary)' }} />
                <h3 id="project-setup-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Project setup</h3>
              </div>
              <button ref={modalCloseButtonRef} type="button" aria-label="Close project setup" onClick={() => setIsEditGoalsOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="project-title" className="input-label">Project Title</label>
                <input 
                  id="project-title"
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="input-field" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="project-subtitle" className="input-label">Subtitle / Scope Summary</label>
                <textarea 
                  id="project-subtitle"
                  value={editSubtitle} 
                  onChange={(e) => setEditSubtitle(e.target.value)} 
                  className="input-field" 
                  rows={2} 
                  required 
                />
              </div>

              <div>
                <label htmlFor="target-defense-date" className="input-label">Target Defense Date</label>
                <input 
                  id="target-defense-date"
                  type="date" 
                  value={editDefenseDate} 
                  onChange={(e) => setEditDefenseDate(e.target.value)} 
                  className="input-field" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditGoalsOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Check size={16} />
                  <span>Save project setup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discord Task Ticket Modal */}
      <TaskTicketModal 
        task={selectedTicketTask} 
        isOpen={Boolean(selectedTicketTask)} 
        onClose={() => setSelectedTicketTask(null)} 
        onEditTask={(t) => {
          setSelectedTicketTask(null);
          onEditTask?.(t);
        }} 
      />
    </div>
  );
};
