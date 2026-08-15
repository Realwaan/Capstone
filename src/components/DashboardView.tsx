import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Layers, 
  Sparkles,
  ChevronRight,
  User,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView, onOpenNewTask }) => {
  const { project, tasks, phases, chapters, revisions, members, activityLogs } = useProject();

  // Metrics computation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter(t => t.status === 'peer_review' || t.status === 'adviser_review').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
  const completedSections = chapters.reduce((acc, c) => acc + c.sections.filter(s => s.completed).length, 0);
  const manuscriptProgress = Math.round((completedSections / totalSections) * 100);

  const pendingRevisions = revisions.filter(r => r.status === 'pending');
  const inProgressRevisions = revisions.filter(r => r.status === 'in_progress');

  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner with Capstone Health Score */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-primary">
                <Sparkles size={12} />
                Capstone Sprint Cycle
              </span>
              <span className="badge badge-neutral">
                {project.teamName}
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.25 }}>
              {project.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {project.subtitle}
            </p>
          </div>

          {/* Quick Health Meter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Circular Progress Display */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.15)"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient-health)"
                  strokeWidth="3.5"
                  strokeDasharray={`${project.overallProgress}, 100`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient-health" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}>
                {project.overallProgress}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Capstone Health
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                On Schedule
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Target: {project.targetDefenseDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-cols-4">
        {/* Card 1: Tasks Completion */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sprint Tasks</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedTasks}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {totalTasks} finished</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        {/* Card 2: Manuscript Drafting */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Manuscript Chapters</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{manuscriptProgress}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{completedSections}/{totalSections} sections</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${manuscriptProgress}%`, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }} />
          </div>
        </div>

        {/* Card 3: Active Phase */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Phase</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Phase {project.currentPhaseId}</span>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentPhase.title.split(':')[1] || currentPhase.title}
          </div>
        </div>

        {/* Card 4: Adviser Feedback / Revisions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adviser Revisions</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{pendingRevisions.length + inProgressRevisions.length}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>open items</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>{pendingRevisions.length} Pending</span>
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{inProgressRevisions.length} In Progress</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid-cols-3" style={{ alignItems: 'flex-start' }}>
        {/* Left Column (Span 2): Phased Roadmap & Active Sprints */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Phased Roadmap Timeline Widget */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Academic Milestone Roadmap</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress through university defense milestones</p>
              </div>
              <button 
                onClick={() => setActiveView('timeline')} 
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-accent)' }}
              >
                <span>View Gantt</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {phases.map(phase => {
                const isCurrent = phase.id === project.currentPhaseId;
                return (
                  <div 
                    key={phase.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 14px',
                      background: isCurrent ? 'var(--primary-light)' : 'var(--bg-elevated)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'rgba(99, 102, 241, 0.35)' : 'var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: phase.status === 'completed' ? '#10b981' : isCurrent ? '#6366f1' : 'rgba(148, 163, 184, 0.2)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {phase.status === 'completed' ? <Check size={16} /> : phase.id}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {phase.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {phase.targetDate}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <div className="progress-bar-container" style={{ flex: 1, height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${phase.progressPercentage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '35px' }}>
                          {phase.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Active Tasks Preview */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>In-Progress Sprints</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tasks currently undergoing development or peer review</p>
              </div>
              <button 
                onClick={() => setActiveView('kanban')} 
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-accent)' }}
              >
                <span>Full Board</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                      padding: '12px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge tag-${task.category}`}>
                          {task.category}
                        </span>
                        <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`}>
                          {task.priority}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Due: {task.dueDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {task.title}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {assignee && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img 
                            src={assignee.avatar} 
                            alt={assignee.name} 
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{assignee.name.split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Adviser Revision Highlights & Live Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Adviser Feedback Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>Adviser Directives</h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Latest feedback requiring compliance</p>
              </div>
              <button 
                onClick={() => setActiveView('revisions')} 
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-accent)' }}
              >
                <span>Matrix</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {revisions.slice(0, 3).map(rev => (
                <div 
                  key={rev.id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                      {rev.chapterOrComponent}
                    </span>
                    <span className={`badge ${rev.status === 'verified' ? 'badge-success' : rev.status === 'resolved' ? 'badge-info' : rev.status === 'in_progress' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.62rem' }}>
                      {rev.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{rev.comment}"
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    — {rev.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="card">
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '12px' }}>Recent Team Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activityLogs.slice(0, 5).map(log => {
                const user = members.find(m => m.id === log.userId);
                return (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt="" 
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px' }}
                    />
                    <div style={{ fontSize: '0.78rem', lineHeight: 1.35, flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Member'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>{' '}
                      <span style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{log.target}</span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
