import React from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Milestone, 
  BookOpen, 
  MessageSquareCheck, 
  Users, 
  FileText, 
  Settings,
  Sparkles,
  Award,
  GraduationCap
} from 'lucide-react';

export type ViewType = 
  | 'dashboard' 
  | 'kanban' 
  | 'timeline' 
  | 'manuscript' 
  | 'revisions' 
  | 'team' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { project, tasks, revisions, chapters, phases } = useProject();

  // Calculate dynamic badge counts
  const activeTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length;
  const pendingRevisionsCount = revisions.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  
  // Overall manuscript completed sections %
  const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
  const completedSections = chapters.reduce((acc, c) => acc + c.sections.filter(s => s.completed).length, 0);
  const manuscriptPct = Math.round((completedSections / totalSections) * 100);

  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'Academic Kanban', icon: KanbanSquare, badge: activeTasksCount, badgeColor: 'badge-primary' },
    { id: 'timeline' as ViewType, label: 'Milestones & Gantt', icon: Milestone, badge: `Phase ${project.currentPhaseId}`, badgeColor: 'badge-neutral' },
    { id: 'manuscript' as ViewType, label: 'Chapters (1 to 5)', icon: BookOpen, badge: `${manuscriptPct}%`, badgeColor: 'badge-info' },
    { id: 'revisions' as ViewType, label: 'Adviser Revisions', icon: MessageSquareCheck, badge: pendingRevisionsCount > 0 ? pendingRevisionsCount : undefined, badgeColor: 'badge-warning' },
    { id: 'team' as ViewType, label: 'Team & Standups', icon: Users },
    { id: 'reports' as ViewType, label: 'Progress Reports', icon: FileText },
    { id: 'settings' as ViewType, label: 'Project Settings', icon: Settings },
  ];

  return (
    <aside 
      className="sidebar"
      style={{
        width: '260px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        overflowY: 'auto'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '24px 20px 20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.12rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              CapStone<span className="gradient-text">Flow</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Academic Sprint Intelligence
            </div>
          </div>
        </div>

        {/* Current Team & Phase Mini Card */}
        <div style={{
          marginTop: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-accent)' }}>
              {project.teamName}
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
              Active
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.title}>
            {project.title}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '0 8px 8px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Workspace Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: isActive ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Adviser Card Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.15)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={12} style={{ color: '#8b5cf6' }} />
          <span>Capstone Adviser</span>
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {project.adviser.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>
          {project.adviser.department}
        </div>
      </div>
    </aside>
  );
};
