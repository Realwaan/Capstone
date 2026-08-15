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
  Terminal,
  ChevronRight
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

export type ViewType = 
  | 'dashboard' 
  | 'kanban' 
  | 'github'
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
  const { project, tasks, revisions, chapters, isGitHubConnected, githubUser } = useProject();

  const activeTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length;
  const pendingRevisionsCount = revisions.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  
  const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
  const completedSections = chapters.reduce((acc, c) => acc + c.sections.filter(s => s.completed).length, 0);
  const manuscriptPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Overview', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'Task Matrix & Board', icon: KanbanSquare, badge: activeTasksCount > 0 ? activeTasksCount : undefined, badgeColor: 'badge-primary' },
    { id: 'github' as ViewType, label: 'GitHub Repository Hub', icon: GitHubIcon, badge: isGitHubConnected ? `@${githubUser?.login}` : 'Connect', badgeColor: isGitHubConnected ? 'badge-success' : 'badge-neutral' },
    { id: 'timeline' as ViewType, label: 'Milestones & Gantt', icon: Milestone, badge: `P${project.currentPhaseId}`, badgeColor: 'badge-neutral' },
    { id: 'manuscript' as ViewType, label: 'Manuscript (Ch. 1–5)', icon: BookOpen, badge: `${manuscriptPct}%`, badgeColor: 'badge-info' },
    { id: 'revisions' as ViewType, label: 'Adviser Revisions', icon: MessageSquareCheck, badge: pendingRevisionsCount > 0 ? pendingRevisionsCount : undefined, badgeColor: 'badge-warning' },
    { id: 'team' as ViewType, label: 'Team & Standups', icon: Users },
    { id: 'reports' as ViewType, label: 'Progress Reports', icon: FileText },
    { id: 'settings' as ViewType, label: 'Settings & Backups', icon: Settings },
  ];

  return (
    <aside 
      className="sidebar"
      style={{
        width: '250px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        overflowY: 'auto'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '20px 18px 16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--primary)',
            color: '#061109',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            <Terminal size={16} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
              CAPSTONE<span style={{ color: 'var(--primary)' }}>FLOW</span>
            </div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              WORK OS v2.0
            </div>
          </div>
        </div>

        {/* Project Context Box */}
        <div style={{
          marginTop: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {project.teamName.toUpperCase()}
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.title}>
            {project.title}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ padding: '0 8px 6px 8px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
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
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 160ms var(--ease-out)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.62rem', padding: '1px 5px', textTransform: 'none' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Adviser Card Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
          ADVISER / FACULTY
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {project.adviser.name}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.adviser.department}
        </div>
      </div>
    </aside>
  );
};
