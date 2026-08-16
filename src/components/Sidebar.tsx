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
  ChevronRight,
  X
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
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView,
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const { project, tasks, revisions, isGitHubConnected, githubUser } = useProject();

  const activeTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length;
  const pendingRevisionsCount = revisions.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Overview', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'Task Matrix & Board', icon: KanbanSquare, badge: activeTasksCount > 0 ? activeTasksCount : undefined, badgeColor: 'badge-primary' },
    { id: 'github' as ViewType, label: 'GitHub Repository Hub', icon: GitHubIcon, badge: isGitHubConnected ? `@${githubUser?.login}` : 'Connect', badgeColor: isGitHubConnected ? 'badge-success' : 'badge-neutral' },
    { id: 'timeline' as ViewType, label: 'Milestones & Gantt', icon: Milestone, badge: `P${project.currentPhaseId}`, badgeColor: 'badge-neutral' },
    { id: 'revisions' as ViewType, label: 'Adviser Revisions', icon: MessageSquareCheck, badge: pendingRevisionsCount > 0 ? pendingRevisionsCount : undefined, badgeColor: 'badge-warning' },
    { id: 'team' as ViewType, label: 'Team & Standups', icon: Users },
    { id: 'reports' as ViewType, label: 'Progress Reports', icon: FileText },
    { id: 'settings' as ViewType, label: 'Settings & Backups', icon: Settings },
  ];

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenOnMobile && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 199,
            animation: 'modalBackdropFadeIn 160ms var(--ease-out)'
          }}
        />
      )}

      <aside 
        className={`sidebar ${isOpenOnMobile ? 'mobile-open' : ''}`}
        style={{
          width: '250px',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          borderRight: '1px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
          overflowY: 'auto'
        }}
      >
        {/* macOS Window Controls & Brand Header */}
        <div style={{ padding: '16px 18px 14px 18px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
          {/* Traffic Lights */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', border: '1px solid rgba(0,0,0,0.12)' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid rgba(0,0,0,0.12)' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', border: '1px solid rgba(0,0,0,0.12)' }} />
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button 
                type="button"
                onClick={onCloseMobile}
                className="btn btn-ghost btn-icon mobile-only"
                style={{ width: '28px', height: '28px', padding: 0 }}
                title="Close Menu"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'var(--primary)',
              color: '#061109',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px var(--primary-glow)'
            }}>
              <Terminal size={15} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.035em', lineHeight: 1 }}>
                CapStone<span style={{ color: 'var(--primary)' }}>Flow</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                v2.4 Academic Edition
              </div>
            </div>
          </div>
        </div>

        {/* Project Context Sub-Header */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Workspace
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
            {project.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Phase {project.currentPhaseId} Active • {project.overallProgress}%
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), transform 140ms var(--ease-out)',
                  position: 'relative',
                  minHeight: '40px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                  <Icon 
                    size={16} 
                    style={{ 
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      flexShrink: 0 
                    }} 
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span 
                    className={`badge ${item.badgeColor || 'badge-neutral'}`}
                    style={{ 
                      fontSize: '0.65rem', 
                      padding: '1px 6px',
                      flexShrink: 0,
                      fontWeight: 600
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Adviser Widget */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Adviser
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {project.adviser.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project.adviser.department}
          </div>
        </div>
      </aside>
    </>
  );
};
