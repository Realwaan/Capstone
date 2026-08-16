import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { formatRelativeTime, formatExactTimestamp, useLiveTimeRefresh } from '../utils/time';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  Check, 
  Milestone, 
  ShieldCheck, 
  Settings2, 
  X, 
  Calendar, 
  Crown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { SprintBurndownChart } from './SprintBurndownChart';

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView, onOpenNewTask }) => {
  const { 
    project, 
    tasks, 
    phases, 
    chapters, 
    revisions, 
    members, 
    activityLogs,
    isOwner,
    isAdviser,
    currentMember,
    changeCurrentPhase,
    updateProjectInfo
  } = useProject();

  useLiveTimeRefresh(15000);

  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editSubtitle, setEditSubtitle] = useState(project.subtitle);
  const [editDefenseDate, setEditDefenseDate] = useState(project.targetDefenseDate);
  const [editOverallProgress, setEditOverallProgress] = useState(project.overallProgress);
  const [editPhaseId, setEditPhaseId] = useState(project.currentPhaseId);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter(t => t.status === 'peer_review' || t.status === 'adviser_review').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalDeliverables = phases.reduce((acc, p) => acc + p.keyDeliverables.length, 0);
  const completedDeliverables = phases.reduce((acc, p) => acc + p.keyDeliverables.filter(d => d.completed).length, 0);
  const deliverableProgress = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  const pendingRevisions = revisions.filter(r => r.status === 'pending');
  const inProgressRevisions = revisions.filter(r => r.status === 'in_progress');

  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    updateProjectInfo({
      title: editTitle,
      subtitle: editSubtitle,
      targetDefenseDate: editDefenseDate,
      overallProgress: Number(editOverallProgress)
    });

    if (editPhaseId !== project.currentPhaseId) {
      changeCurrentPhase(Number(editPhaseId));
    }

    setIsEditGoalsOpen(false);
  };

  const handleQuickAdvancePhase = () => {
    if (!isOwner) return;
    if (project.currentPhaseId < 5) {
      changeCurrentPhase(project.currentPhaseId + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              PHASE {project.currentPhaseId}
            </span>
            <span className="badge badge-neutral">
              {project.teamName}
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
              <span className="badge badge-neutral">
                Student Contributor
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {project.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            {project.subtitle}
          </p>

          {/* Quick Lead Phase Switcher Bar */}
          {isOwner && (
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flexWrap: 'wrap',
              background: 'var(--bg-elevated)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Set Active Phase:
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(pId => (
                  <button
                    key={pId}
                    onClick={() => changeCurrentPhase(pId)}
                    className={`btn btn-sm ${project.currentPhaseId === pId ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '3px 8px', fontSize: '0.72rem', height: '24px', fontWeight: 700 }}
                  >
                    Phase {pId}
                  </button>
                ))}
              </div>
              {project.currentPhaseId < 5 && (
                <button 
                  onClick={handleQuickAdvancePhase}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: 'auto', padding: '3px 10px', height: '24px', fontSize: '0.72rem', gap: '4px' }}
                  title="Advance project to the next milestone phase"
                >
                  <span>Advance Phase</span>
                  <ArrowRight size={12} />
                </button>
              )}
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
                Live Computed
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                {project.overallProgress}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Target: {project.targetDefenseDate}
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="progress-bar-container" style={{ height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${project.overallProgress}%` }} />
            </div>

            {/* Breakdown Mini Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <div>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{taskCompletionRate}%</strong></div>
              <div>Deliverables: <strong style={{ color: 'var(--text-primary)' }}>{deliverableProgress}%</strong></div>
            </div>
          </div>

          {/* Lead Manipulation Action Button */}
          {isOwner && (
            <button 
              onClick={() => {
                setEditTitle(project.title);
                setEditSubtitle(project.subtitle);
                setEditDefenseDate(project.targetDefenseDate);
                setEditOverallProgress(project.overallProgress);
                setEditPhaseId(project.currentPhaseId);
                setIsEditGoalsOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.76rem' }}
            >
              <Settings2 size={13} style={{ color: 'var(--primary)' }} />
              <span>Manipulate Dashboard & Goals</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Active Tasks</span>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{completedTasks}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ {totalTasks} done</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Key Deliverables</span>
            <Layers size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{deliverableProgress}%</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{completedDeliverables}/{totalDeliverables} ready</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${deliverableProgress}%`, background: '#38bdf8' }} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Milestone Lifecycle</span>
            <Milestone size={16} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Phase {project.currentPhaseId}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentPhase.title.split(':')[1] || currentPhase.title}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Adviser Directives</span>
            <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{pendingRevisions.length + inProgressRevisions.length}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>open items</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="badge badge-danger" style={{ fontSize: '0.62rem' }}>{pendingRevisions.length} Pending</span>
            <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>{inProgressRevisions.length} Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Phase Milestones & Active Sprint Stream */}
      <div className="grid-cols-3" style={{ alignItems: 'flex-start' }}>
        {/* Left Column (Span 2): Milestones & Sprints */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Milestone Phased Bars */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Academic Milestones</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Sequential gates required for defense clearance</p>
              </div>
              <button onClick={() => setActiveView('timeline')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', gap: '4px' }}>
                <span>Timeline</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {phases.map(phase => {
                const isCurrent = phase.id === project.currentPhaseId;
                return (
                  <div 
                    key={phase.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      background: isCurrent ? 'var(--primary-light)' : 'var(--bg-elevated)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: phase.status === 'completed' ? '#10b981' : isCurrent ? 'var(--primary)' : 'rgba(148, 163, 184, 0.15)',
                      color: isCurrent || phase.status === 'completed' ? '#061109' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {phase.status === 'completed' ? <Check size={14} /> : phase.id}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {phase.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isOwner && !isCurrent && (
                            <button
                              onClick={() => changeCurrentPhase(phase.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.66rem', padding: '1px 6px', height: '20px' }}
                            >
                              Set Active
                            </button>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {phase.targetDate}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div className="progress-bar-container" style={{ flex: 1, height: '4px' }}>
                          <div className="progress-bar-fill" style={{ width: `${phase.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', minWidth: '30px' }}>
                          {phase.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sprint Burndown & Velocity Telemetry Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>Sprint Velocity & Burndown</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Live delivery burn rate vs 14-day cycle guideline</p>
                </div>
              </div>
              <button onClick={() => setActiveView('reports')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', gap: '4px', fontSize: '0.75rem' }}>
                <span>Full Telemetry</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <SprintBurndownChart sprintDurationDays={14} showHistoricalVelocity={false} />
          </div>

          {/* Active Tasks */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>In-Progress Tasks</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Currently undergoing implementation or writing</p>
              </div>
              <button onClick={() => setActiveView('kanban')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', gap: '4px' }}>
                <span>Board</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').map(task => {
                const assignee = members.find(m => m.id === task.assigneeId);
                return (
                  <div 
                    key={task.id}
                    className="stagger-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      gap: '10px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span className={`badge tag-${task.category}`} style={{ fontSize: '0.58rem' }}>
                          {task.category}
                        </span>
                        <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.58rem' }}>
                          {task.priority}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Due: {task.dueDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {task.title}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {assignee && (
                        <img 
                          src={assignee.avatar} 
                          alt={assignee.name} 
                          style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }} 
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No active tasks right now. Visit the Task Matrix to add tasks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>Activity Stream</h3>
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
                    <div style={{ fontSize: '0.76rem', lineHeight: 1.35, flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Member'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>{' '}
                      <span style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{log.target}</span>
                      <div 
                        title={formatExactTimestamp(log.timestamp)}
                        style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)', cursor: 'help' }}
                      >
                        {formatRelativeTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Project Lead Goals & Dashboard Manipulation Modal */}
      {isEditGoalsOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditGoalsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Manipulate Dashboard & Goals</h3>
              </div>
              <button onClick={() => setIsEditGoalsOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Project Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="input-field" 
                  required 
                />
              </div>

              <div>
                <label className="input-label">Subtitle / Scope Summary</label>
                <textarea 
                  value={editSubtitle} 
                  onChange={(e) => setEditSubtitle(e.target.value)} 
                  className="input-field" 
                  rows={2} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="input-label">Active Milestone Phase</label>
                  <select 
                    value={editPhaseId} 
                    onChange={(e) => setEditPhaseId(Number(e.target.value))} 
                    className="input-field"
                  >
                    <option value={1}>Phase 1: Title Proposal & Scope</option>
                    <option value={2}>Phase 2: Architectural Design & Chapters 1-3</option>
                    <option value={3}>Phase 3: Core Implementation & Sprints</option>
                    <option value={4}>Phase 4: System Integration & Chapter 4</option>
                    <option value={5}>Phase 5: Final Defense & Chapter 5</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Target Defense Date</label>
                  <input 
                    type="date" 
                    value={editDefenseDate} 
                    onChange={(e) => setEditDefenseDate(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Overall Readiness Metric Override</label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{editOverallProgress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={editOverallProgress} 
                  onChange={(e) => setEditOverallProgress(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--primary)' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditGoalsOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Check size={16} />
                  <span>Save Dashboard Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
