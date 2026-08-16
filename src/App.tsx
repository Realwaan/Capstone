import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Sidebar, ViewType } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { GitHubView } from './components/GitHubView';
import { TimelineView } from './components/TimelineView';
import { ManuscriptView } from './components/ManuscriptView';
import { RevisionsView } from './components/RevisionsView';
import { TeamView } from './components/TeamView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { RevisionModal } from './components/RevisionModal';
import { StandupModal } from './components/StandupModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { CommandPalette } from './components/CommandPalette';
import { FeedbackTicket } from './components/FeedbackTicket';
import { Toaster } from 'sonner';
import { Task } from './types';
import { MobileBottomNav } from './components/MobileBottomNav';

const VALID_VIEWS: ViewType[] = [
  'dashboard', 
  'kanban', 
  'github',
  'timeline', 
  'revisions', 
  'team', 
  'reports', 
  'settings'
];

const getInitialView = (): ViewType => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '').toLowerCase() as ViewType;
  if (VALID_VIEWS.includes(hash)) return hash;
  
  const saved = localStorage.getItem('capstone_active_view') as ViewType;
  if (VALID_VIEWS.includes(saved)) return saved;
  
  return 'dashboard';
};

const MainLayout: React.FC = () => {
  const { tasks } = useProject();
  const [activeView, setActiveView] = useState<ViewType>(getInitialView);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleSelectTaskById = (taskId: string) => {
    const found = tasks.find(t => t.id === taskId);
    if (found) {
      setEditingTask(found);
      setIsTaskModalOpen(true);
    }
  };

  // Sync activeView changes to URL hash and localStorage
  const handleSelectView = (view: ViewType) => {
    setActiveView(view);
    try {
      localStorage.setItem('capstone_active_view', view);
      window.history.replaceState(null, '', `#${view}`);
    } catch {
      // ignore storage errors
    }
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
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={handleSelectView}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Execution View */}
      <div className="main-content">
        <Navbar 
          onOpenNewTask={handleOpenNewTask} 
          onOpenNewRevision={() => setIsRevisionModalOpen(true)}
          onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="content-body">
          {activeView === 'dashboard' && (
            <DashboardView 
              setActiveView={setActiveView} 
              onOpenNewTask={handleOpenNewTask} 
            />
          )}

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

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveView={handleSelectView}
        onOpenNewTask={handleOpenNewTask}
        onOpenNewRevision={() => setIsRevisionModalOpen(true)}
      />

      {/* Emil Kowalski Quick Note Floating Ticket */}
      <FeedbackTicket />

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        taskToEdit={editingTask} 
      />

      <RevisionModal 
        isOpen={isRevisionModalOpen} 
        onClose={() => setIsRevisionModalOpen(false)} 
      />

      <StandupModal 
        isOpen={isStandupModalOpen} 
        onClose={() => setIsStandupModalOpen(false)} 
      />

      <GitHubAuthModal 
        isOpen={isGitHubModalOpen} 
        onClose={() => setIsGitHubModalOpen(false)} 
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, theme } = useProject();

  return (
    <>
      <Toaster 
        position="bottom-right" 
        theme={theme === 'light' ? 'light' : 'dark'} 
        gap={10}
        offset={20}
        toastOptions={{
          className: 'capstone-sonner-toast',
          duration: 3500
        }}
      />
      {!isAuthenticated ? <LoginPage /> : <MainLayout />}
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
