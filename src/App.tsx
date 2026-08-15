import React, { useState } from 'react';
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
import { Task } from './types';

const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

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
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Execution View */}
      <div className="main-content">
        <Navbar 
          onOpenNewTask={handleOpenNewTask} 
          onOpenNewRevision={() => setIsRevisionModalOpen(true)}
          onOpenGitHubAuth={() => setIsGitHubModalOpen(true)}
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
            />
          )}

          {activeView === 'github' && (
            <GitHubView 
              onOpenGitHubAuth={() => setIsGitHubModalOpen(true)} 
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
  const { isAuthenticated } = useProject();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
