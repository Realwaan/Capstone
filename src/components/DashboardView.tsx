import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  ChevronRight,
  User,
  Check,
  Activity,
  Milestone,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView, onOpenNewTask }) => {
  const { project, tasks, phases, chapters, revisions, members, activityLogs } = useProject();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter(t => t.status === 'peer_review' || t.status === 'adviser_review').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
  const completedSections = chapters.reduce((acc, c) => acc + c.sections.filter(s => s.completed).length, 0);
  const manuscriptProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  const pendingRevisions = revisions.filter(r => r.status === 'pending');
  const inProgressRevisions = revisions.filter(r => r.status === 'in_progress');

  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Studio Header HUD Banner */}
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
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="badge badge-primary">
              PHASE {project.currentPhaseId}
            </span>
            <span className="badge badge-neutral">
              {project.teamName}
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            {project.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            {project.subtitle}
          </p>
        </div>

        {/* Precision Progress Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px'
        }}>
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              OVERALL READINESS
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {project.overallProgress}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Target: {project.targetDefenseDate}
            </div>
          </div>
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
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Manuscript Drafts</span>
            <BookOpen size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{manuscriptProgress}%</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{completedSections}/{totalSections} sections</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${manuscriptProgress}%`, background: '#38bdf8' }} />
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
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {phase.targetDate}
                        </span>
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
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt="" 
                      style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover', marginTop: '2px' }}
                    />
                    <div style={{ fontSize: '0.76rem', lineHeight: 1.35, flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Member'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>{' '}
                      <span style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{log.target}</span>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        {log.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
