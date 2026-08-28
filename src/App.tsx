import React, { useState, useEffect, useRef } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Sidebar, ViewType } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { FeedbackTicket } from './components/FeedbackTicket';
import { Toaster } from 'sonner';
import { Task } from './types';
import { MobileBottomNav } from './components/MobileBottomNav';
import { startWorkspaceTour } from './lib/tour';

// Direct imports for instant, zero-flicker rendering across all views and modals
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { GitHubView } from './components/GitHubView';
import { TimelineView } from './components/TimelineView';
import { ManuscriptView } from './components/ManuscriptView';
import { RevisionsView } from './components/RevisionsView';
import { TeamView } from './components/TeamView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ProjectsPortalView } from './components/ProjectsPortalView';
import { CommunityView } from './components/CommunityView';
import { PredictionsView } from './components/PredictionsView';

// Modals
import { TaskModal } from './components/TaskModal';
import { RevisionModal } from './components/RevisionModal';
import { StandupModal } from './components/StandupModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectsOverviewModal } from './components/ProjectsOverviewModal';
import { InviteCollaboratorModal } from './components/InviteCollaboratorModal';
import { CommandPalette } from './components/CommandPalette';

const VALID_VIEWS: ViewType[] = [
  'projects',
  'dashboard', 
  'community',
  'predictions',
  'kanban', 
  'github',
  'timeline', 
  'manuscript',
  'revisions', 
  'team', 
  'reports', 
  'settings'
];

const getInitialView = (): ViewType => {
  if (typeof window === 'undefined') return 'projects';
  const hash = window.location.hash.replace('#', '');
  if (hash.includes('join=')) return 'projects';

  const cleanHash = hash.split('?')[0].toLowerCase() as ViewType;
  if (VALID_VIEWS.includes(cleanHash)) return cleanHash;
  
  const saved = localStorage.getItem('capstone_active_view') as ViewType;
  if (VALID_VIEWS.includes(saved)) return saved;
  
  return 'projects';
};

const MainLayout: React.FC = () => {
  const { project, tasks } = useProject();
  const [activeView, setActiveView] = useState<ViewType>(getInitialView);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigationSequenceRef = useRef(0);
  const navigationTimerRef = useRef<number | null>(null);

  // Listen to external hash changes (e.g. clicking invite links or browser back/forward)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.includes('join=')) {
        setActiveView('projects');
        return;
      }
      const clean = hash.split('?')[0].toLowerCase() as ViewType;
      if (VALID_VIEWS.includes(clean)) {
        setActiveView(clean);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Clear any pending fallback navigation timer on unmount.
  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
    };
  }, []);

  // Context-aware automatic route redirection based on project track
  useEffect(() => {
    if (activeView === 'manuscript' && (project?.trackType === 'full_coding' || project?.hasManuscript === false)) {
      handleSelectView('kanban');
    }
  }, [project?.id, project?.trackType, project?.hasManuscript, activeView]);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isProjectsOverviewOpen, setIsProjectsOverviewOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Auto-launch Driver.js onboarding tour on first visit to a project dashboard.
  // The tour targets #navbar-* / #sidebar-* elements which only exist inside the
  // workspace shell — never on the #projects portal, which renders without them.
  useEffect(() => {
    if (activeView !== 'dashboard') return;
    if (localStorage.getItem('capstoneflow_tour_completed')) return;
    const timer = setTimeout(() => {
      startWorkspaceTour();
    }, 600);
    return () => clearTimeout(timer);
  }, [activeView]);

  const handleSelectTaskById = (taskId: string) => {
    const found = tasks.find(t => t.id === taskId);
    if (found) {
      setEditingTask(found);
      setIsTaskModalOpen(true);
    }
  };

  // Sync activeView changes to URL hash and localStorage.
  //
  // Motion design (animations.dev / Emil Kowalski):
  // - No View Transition API here. It screenshots both views and morphs the
  //   box between them, which reads as a rigid, frozen crossfade when views
  //   have different heights, and it freezes the main thread during capture.
  // - Instead: the old view swaps out instantly (no exit animation — exit
  //   motion on large content surfaces is the main jank source) and the new
  //   view enters with one short decelerating rise via `tabContentEnter` on
  //   the remounted shell (key={activeView} restarts the CSS animation).
  // - Interruptible by construction: rapid clicks remount the shell, so the
  //   entrance always restarts cleanly from frame one.
  const handleSelectView = (view: ViewType) => {
    if (view === activeView) return;

    const transitionSequence = ++navigationSequenceRef.current;

    if (navigationTimerRef.current !== null) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    const root = document.documentElement;
    root.classList.add('tab-is-animating');

    setActiveView(view);
    try {
      localStorage.setItem('capstone_active_view', view);
      window.history.replaceState(null, '', `#${view}`);
    } catch {
      // ignore storage errors
    }

    // Keep the performance class on for exactly one transition window, then
    // release it. The sequence token stops a stale timer from removing the
    // class that belongs to a newer navigation.
    navigationTimerRef.current = window.setTimeout(() => {
      if (navigationSequenceRef.current !== transitionSequence) return;
      root.classList.remove('tab-is-animating');
      navigationTimerRef.current = null;
    }, 260);
  };

  // Sync on initial mount & hash change (e.g. browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase() as ViewType;
      if (VALID_VIEWS.includes(hash)) {
        setActiveView(hash);
        localStorage.setItem('capstone_active_view', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Ensure URL hash reflects current view on mount
    window.history.replaceState(null, '', `#${activeView}`);
    localStorage.setItem('capstone_active_view', activeView);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* If activeView === 'projects', render the Organization Projects Portal */}
      {activeView === 'projects' ? (
        <ProjectsPortalView 
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onSelectProject={() => handleSelectView('dashboard')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigateToView={handleSelectView}
        />
      ) : (
        <>
          {/* Sidebar Navigation */}
          <Sidebar 
            activeView={activeView} 
            setActiveView={handleSelectView}
            isOpenOnMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenProjectsOverview={() => setIsProjectsOverviewOpen(true)}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          />

          {/* Main Execution View */}
          <div className="main-content">
            <Navbar 
              onOpenNewTask={handleOpenNewTask} 
              onOpenNewRevision={() => setIsRevisionModalOpen(true)}
              onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenProjectsOverview={() => setIsProjectsOverviewOpen(true)}
              onNavigateToProjects={() => handleSelectView('projects')}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onOpenInviteCollaborators={() => setIsInviteModalOpen(true)}
            />

            <main key={activeView} className="content-body tab-transition-shell" aria-live="polite">
              {activeView === 'dashboard' && (
                <DashboardView 
                  setActiveView={handleSelectView} 
                  onEditTask={handleEditTask}
                />
              )}

              {activeView === 'community' && <CommunityView />}

              {activeView === 'predictions' && <PredictionsView />}

              {activeView === 'kanban' && (
                <KanbanView 
                  onOpenNewTask={handleOpenNewTask} 
                  onEditTask={handleEditTask} 
                  onOpenStandupModal={() => setIsStandupModalOpen(true)}
                />
              )}

              {activeView === 'github' && (
                <GitHubView 
                  onOpenGitHubAuth={() => setIsGitHubModalOpen(true)} 
                  onSelectTask={handleSelectTaskById}
                />
              )}

              {activeView === 'timeline' && <TimelineView />}

              {activeView === 'manuscript' && <ManuscriptView />}

              {activeView === 'revisions' && (
                <RevisionsView onOpenNewRevision={() => setIsRevisionModalOpen(true)} />
              )}

              {activeView === 'team' && (
                <TeamView onOpenStandupModal={() => setIsStandupModalOpen(true)} />
              )}

              {activeView === 'reports' && <ReportsView />}

              {activeView === 'settings' && <SettingsView />}
            </main>
          </div>

          {/* Emil Kowalski Mobile Bottom Navigation Bar */}
          <MobileBottomNav 
            activeView={activeView}
            setActiveView={handleSelectView}
            onOpenNewTask={handleOpenNewTask}
            onOpenNewRevision={() => setIsRevisionModalOpen(true)}
            onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
          />
        </>
      )}

      {/* Global Command Palette (Cmd+K) */}
      {isCommandPaletteOpen && (
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          setActiveView={handleSelectView}
          onOpenNewTask={handleOpenNewTask}
          onOpenNewRevision={() => setIsRevisionModalOpen(true)}
          onSelectTask={handleSelectTaskById}
          onOpenStandupModal={() => setIsStandupModalOpen(true)}
        />
      )}

      {/* Emil Kowalski Quick Note Floating Ticket */}
      <FeedbackTicket />

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          taskToEdit={editingTask} 
        />
      )}

      {isRevisionModalOpen && (
        <RevisionModal 
          isOpen={isRevisionModalOpen} 
          onClose={() => setIsRevisionModalOpen(false)} 
        />
      )}

      {isStandupModalOpen && (
        <StandupModal 
          isOpen={isStandupModalOpen} 
          onClose={() => setIsStandupModalOpen(false)} 
        />
      )}

      {isGitHubModalOpen && (
        <GitHubAuthModal 
          isOpen={isGitHubModalOpen} 
          onClose={() => setIsGitHubModalOpen(false)} 
        />
      )}

      {/* Supabase-style Project Modals */}
      {isCreateProjectOpen && (
        <CreateProjectModal 
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onSuccessNavigate={() => handleSelectView('dashboard')}
        />
      )}

      {isProjectsOverviewOpen && (
        <ProjectsOverviewModal 
          isOpen={isProjectsOverviewOpen}
          onClose={() => setIsProjectsOverviewOpen(false)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onNavigateToSettings={() => handleSelectView('settings')}
        />
      )}

      {isInviteModalOpen && (
        <InviteCollaboratorModal 
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, theme } = useProject();

  // Distinguish fresh page load/refresh from an in-session login transition
  const initialAuthRef = React.useRef(isAuthenticated);
  const [hasJustLoggedIn, setHasJustLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Only fire the entry transition if the user started unauthenticated and just logged in
    if (!initialAuthRef.current && isAuthenticated) {
      setHasJustLoggedIn(true);
      // Route user directly into the Projects Portal (#projects) on login
      try {
        localStorage.setItem('capstone_active_view', 'projects');
        window.location.hash = '#projects';
      } catch {}
      const timer = setTimeout(() => {
        setHasJustLoggedIn(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <>
      <Toaster 
        position="top-right" 
        theme={theme === 'light' ? 'light' : 'dark'} 
        gap={10}
        offset={20}
        richColors
        closeButton
        toastOptions={{
          className: 'capstone-sonner-toast',
          duration: 4000
        }}
      />
      {hasJustLoggedIn && <div className="workspace-ambient-bloom" key="workspace-bloom" />}
      <div 
        className={hasJustLoggedIn ? 'workspace-login-transition' : ''}
        style={{ width: '100%', minHeight: '100vh' }}
      >
        {!isAuthenticated ? <LoginPage /> : <MainLayout />}
      </div>
    </>
  );
};

export function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
