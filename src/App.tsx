import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { TimelineView } from './components/TimelineView';
import { ManuscriptView } from './components/ManuscriptView';
import { RevisionsView } from './components/RevisionsView';
import { TeamView } from './components/TeamView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { RevisionModal } from './components/RevisionModal';
import { StandupModal } from './components/StandupModal';
import { Task } from './types';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isStandupModalOpen, setIsStandupModalOpen] = useState(false);

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main App Canvas */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar 
          onOpenNewTask={handleOpenNewTask} 
          onOpenNewRevision={() => setIsRevisionModalOpen(true)} 
        />

        {/* Content Body */}
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
              onEditTask={handleOpenEditTask} 
            />
          )}

          {activeView === 'timeline' && <TimelineView />}

          {activeView === 'manuscript' && <ManuscriptView />}

          {activeView === 'revisions' && (
            <RevisionsView 
              onOpenNewRevision={() => setIsRevisionModalOpen(true)} 
            />
          )}

          {activeView === 'team' && (
            <TeamView 
              onOpenStandupModal={() => setIsStandupModalOpen(true)} 
            />
          )}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }} 
        taskToEdit={taskToEdit} 
      />

      <RevisionModal 
        isOpen={isRevisionModalOpen} 
        onClose={() => setIsRevisionModalOpen(false)} 
      />

      <StandupModal 
        isOpen={isStandupModalOpen} 
        onClose={() => setIsStandupModalOpen(false)} 
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProjectProvider>
      <MainApp />
    </ProjectProvider>
  );
};

export default App;
