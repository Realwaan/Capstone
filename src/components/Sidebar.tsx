import React from 'react';
import { useProject } from '../context/ProjectContext';
import { CapStoneFlowLogo } from './CapStoneFlowLogo';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Milestone, 
  BookOpen, 
  MessageSquareCheck, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  X
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

export type ViewType = 
  | 'projects'
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
  onOpenProjectsOverview?: () => void;
  onOpenCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView,
  isOpenOnMobile = false,
  onCloseMobile,
  onOpenProjectsOverview,
  onOpenCreateProject
}) => {
  const { project, phases = [], tasks = [], chapters = [], revisions = [], isGitHubConnected, githubUser } = useProject();

  const activeTasksCount = (tasks || []).filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length;
  const pendingRevisionsCount = (revisions || []).filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const completedChaptersCount = (chapters || []).filter(c => c?.sections && c.sections.every(s => s.completed)).length;
  const hasManuscriptTrack = project?.hasManuscript === true || project?.trackType === 'research_manuscript';

  const currentPhaseIndex = (phases || []).findIndex(p => p.id === project?.currentPhaseId);
  const currentPhase = (phases || []).find(p => p.id === project?.currentPhaseId);
  const activePhaseBadge = (phases || []).length > 0 ? (currentPhaseIndex >= 0 ? `P${currentPhaseIndex + 1}` : 'P1') : undefined;
  const activePhaseLabel = currentPhase 
    ? (currentPhase.title.includes(':') ? currentPhase.title.split(':')[0].trim() : `Phase ${currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : 1}`)
    : ((phases || []).length > 0 ? 'Phase 1' : 'No Phases');

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Overview', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'Task Matrix & Board', icon: KanbanSquare, badge: activeTasksCount > 0 ? activeTasksCount : undefined, badgeColor: 'badge-primary' },
    { id: 'github' as ViewType, label: 'GitHub Repository Hub', icon: GitHubIcon, badge: isGitHubConnected ? `@${githubUser?.login}` : 'Connect', badgeColor: isGitHubConnected ? 'badge-success' : 'badge-neutral' },
    { id: 'timeline' as ViewType, label: 'Milestones & Gantt', icon: Milestone, badge: activePhaseBadge, badgeColor: 'badge-neutral' },
    ...(hasManuscriptTrack ? [{ id: 'manuscript' as ViewType, label: '5-Chapter Manuscript', icon: BookOpen, badge: `${completedChaptersCount}/5`, badgeColor: 'badge-primary' }] : []),
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

          <div 
            onClick={() => setActiveView('projects')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            title="Back to All Projects Portal"
          >
            <CapStoneFlowLogo size="md" showBadge={true} badgeText="v2.6" />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>↵</span>
          </div>
        </div>

        {/* Project Context Sub-Header (Clickable to switch / manage projects) */}
        <div 
          onClick={() => setActiveView('projects')}
          style={{ 
            padding: '12px 18px', 
            borderBottom: '1px solid var(--border-subtle)', 
            background: 'var(--bg-elevated)',
            cursor: 'pointer',
            transition: 'background-color 140ms ease'
          }}
          title="Click to view All Projects Portal"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Active Workspace
            </span>
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px', color: 'var(--text-primary)' }}>
            {project.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {phases.length > 0 ? `${activePhaseLabel} Active • ${project.overallProgress}%` : `${project.overallProgress}% Complete`}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}`}
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
            {project?.adviser?.name || 'Faculty Adviser'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project?.adviser?.department || project?.organization || 'Academic Supervision'}
          </div>
        </div>
      </aside>
    </>
  );
};
