import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  BookOpen, 
  MoreHorizontal, 
  X, 
  Milestone, 
  MessageSquareCheck, 
  Users, 
  FileText, 
  Settings,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { ViewType } from './Sidebar';
import { useProject } from '../context/ProjectContext';

interface MobileBottomNavProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
  onOpenGitHubAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenNewTask,
  onOpenNewRevision,
  onOpenGitHubAuth
}) => {
  const { tasks, revisions } = useProject();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const activeTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review').length;
  const pendingRevisionsCount = revisions.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  const handleSelect = (view: ViewType) => {
    setActiveView(view);
    setIsMoreMenuOpen(false);
  };

  const moreItems = [
    { id: 'revisions' as ViewType, label: 'Adviser Revisions', icon: MessageSquareCheck, badge: pendingRevisionsCount > 0 ? pendingRevisionsCount : undefined, desc: 'Track comments and revisions' },
    { id: 'team' as ViewType, label: 'Team & Standups', icon: Users, desc: 'Member roster & daily standup logs' },
    { id: 'reports' as ViewType, label: 'Progress Reports', icon: FileText, desc: 'Defense readiness, PDF export & audit logs' },
    { id: 'settings' as ViewType, label: 'Settings & Storage', icon: Settings, desc: 'Project settings, theme & JSON backups' },
  ];

  return (
    <>
      {/* Emil Kowalski Slide-Up "More" Bottom Sheet */}
      {isMoreMenuOpen && (
        <div 
          className="modal-backdrop mobile-more-backdrop"
          onClick={() => setIsMoreMenuOpen(false)}
          style={{ zIndex: 1100, alignItems: 'flex-end', padding: 0 }}
        >
          <div 
            className="mobile-bottom-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border-card)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
              padding: '16px 20px calc(24px + env(safe-area-inset-bottom)) 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Drag Pill Handle */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Workspace Navigation
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="btn btn-ghost btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenNewTask();
                }}
                className="btn btn-primary btn-sm"
                style={{ height: '40px', gap: '6px', fontSize: '0.78rem' }}
              >
                <Plus size={15} />
                <span>New Task</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenNewRevision();
                }}
                className="btn btn-secondary btn-sm"
                style={{ height: '40px', gap: '6px', fontSize: '0.78rem' }}
              >
                <MessageSquareCheck size={15} />
                <span>Add Revision</span>
              </button>
            </div>

            {/* Menu Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--primary-light)' : 'var(--bg-card)',
                      border: `1px solid ${isActive ? 'rgba(48, 209, 88, 0.3)' : 'var(--border-subtle)'}`,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minHeight: '48px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#061109' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.badge !== undefined && (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tactile Floating Bottom Navigation Bar */}
      <nav 
        className="mobile-bottom-nav"
        style={{
          display: 'none', // Shown via CSS media query @media (max-width: 768px)
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          borderTop: '1px solid var(--border-card)',
          zIndex: 900,
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.35)'
        }}
      >
        {/* 1. Overview */}
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`mobile-nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: activeView === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            minHeight: '44px'
          }}
        >
          <LayoutDashboard size={19} />
          <span style={{ fontSize: '0.66rem', fontWeight: activeView === 'dashboard' ? 700 : 500 }}>
            Overview
          </span>
        </button>

        {/* 2. Tasks / Kanban */}
        <button
          type="button"
          onClick={() => setActiveView('kanban')}
          className={`mobile-nav-tab ${activeView === 'kanban' ? 'active' : ''}`}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: activeView === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            minHeight: '44px'
          }}
        >
          <KanbanSquare size={19} />
          <span style={{ fontSize: '0.66rem', fontWeight: activeView === 'kanban' ? 700 : 500 }}>
            Board
          </span>
          {activeTasksCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '3px',
              right: 'calc(50% - 16px)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 6px var(--primary-glow)'
            }} />
          )}
        </button>

        {/* 3. GitHub Hub */}
        <button
          type="button"
          onClick={() => setActiveView('github')}
          className={`mobile-nav-tab ${activeView === 'github' ? 'active' : ''}`}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: activeView === 'github' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            minHeight: '44px'
          }}
        >
          <GitHubIcon size={19} />
          <span style={{ fontSize: '0.66rem', fontWeight: activeView === 'github' ? 700 : 500 }}>
            GitHub
          </span>
        </button>

        {/* 4. Timeline */}
        <button
          type="button"
          onClick={() => setActiveView('timeline')}
          className={`mobile-nav-tab ${activeView === 'timeline' ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: activeView === 'timeline' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            minHeight: '44px'
          }}
        >
          <Milestone size={19} />
          <span style={{ fontSize: '0.66rem', fontWeight: activeView === 'timeline' ? 700 : 500 }}>
            Timeline
          </span>
        </button>

        {/* 5. More / Menu */}
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className={`mobile-nav-tab ${['revisions', 'team', 'reports', 'settings'].includes(activeView) ? 'active' : ''}`}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: ['revisions', 'team', 'reports', 'settings'].includes(activeView) ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 0',
            minHeight: '44px'
          }}
        >
          <MoreHorizontal size={19} />
          <span style={{ fontSize: '0.66rem', fontWeight: 600 }}>
            More
          </span>
          {pendingRevisionsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '3px',
              right: 'calc(50% - 16px)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--warning)',
              boxShadow: '0 0 6px rgba(255, 159, 10, 0.4)'
            }} />
          )}
        </button>
      </nav>
    </>
  );
};
