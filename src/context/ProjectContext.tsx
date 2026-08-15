import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CapstoneProject,
  TeamMember,
  Task,
  TaskStatus,
  MilestonePhase,
  ManuscriptChapter,
  ChapterSection,
  RevisionItem,
  StandupEntry,
  ActivityLog,
  Role
} from '../types';
import {
  initialProject,
  initialMembers,
  initialTasks,
  initialPhases,
  initialChapters,
  initialRevisions,
  initialStandups,
  initialActivityLogs
} from '../data/initialData';

interface ProjectContextType {
  project: CapstoneProject;
  members: TeamMember[];
  tasks: Task[];
  phases: MilestonePhase[];
  chapters: ManuscriptChapter[];
  revisions: RevisionItem[];
  standups: StandupEntry[];
  activityLogs: ActivityLog[];
  currentMember: TeamMember;
  currentRole: Role;
  theme: 'dark' | 'light';
  searchQuery: string;
  filterCategory: string;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  toggleTheme: () => void;
  switchMember: (memberId: string) => void;
  switchRole: (role: Role) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'loggedHours'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Milestone Actions
  toggleDeliverable: (phaseId: number, deliverableId: string) => void;
  signOffPhase: (phaseId: number) => void;
  
  // Chapter Actions
  toggleChapterSection: (chapterId: number, sectionId: string) => void;
  updateChapter: (chapterId: number, updates: Partial<ManuscriptChapter>) => void;
  
  // Revision Actions
  addRevision: (rev: Omit<RevisionItem, 'id' | 'date'>) => void;
  updateRevisionStatus: (id: string, status: RevisionItem['status'], actionTaken?: string) => void;
  deleteRevision: (id: string) => void;
  
  // Standup Actions
  addStandup: (entry: Omit<StandupEntry, 'id' | 'date'>) => void;
  
  // Project Settings
  updateProjectInfo: (updates: Partial<CapstoneProject>) => void;
  resetData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'capstoneflow_state_v2';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<CapstoneProject>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_project`);
    return saved ? JSON.parse(saved) : initialProject;
  });

  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [phases, setPhases] = useState<MilestonePhase[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_phases`);
    return saved ? JSON.parse(saved) : initialPhases;
  });

  const [chapters, setChapters] = useState<ManuscriptChapter[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_chapters`);
    return saved ? JSON.parse(saved) : initialChapters;
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_revisions`);
    return saved ? JSON.parse(saved) : initialRevisions;
  });

  const [standups, setStandups] = useState<StandupEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_standups`);
    return saved ? JSON.parse(saved) : initialStandups;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_activity`);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>('m1');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_project`, JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_phases`, JSON.stringify(phases));
  }, [phases]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_chapters`, JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_revisions`, JSON.stringify(revisions));
  }, [revisions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_standups`, JSON.stringify(standups));
  }, [standups]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activity`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const currentMember = members.find(m => m.id === currentMemberId) || members[0];
  const currentRole = currentMember.role;

  const logActivity = (action: string, target: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      userId: currentMember.id,
      action,
      target
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchMember = (memberId: string) => {
    setCurrentMemberId(memberId);
  };

  const switchRole = (role: Role) => {
    const found = members.find(m => m.role === role);
    if (found) {
      setCurrentMemberId(found.id);
    }
  };

  // Task Handlers
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'loggedHours'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity('created a new task', newTask.title);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      )
    );
    logActivity('updated task details', updates.title || 'a task');
  };

  const deleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (target) {
      logActivity('deleted task', target.title);
    }
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      const statusLabels: Record<TaskStatus, string> = {
        backlog: 'Backlog',
        todo: 'To Do',
        in_progress: 'In Progress',
        peer_review: 'Peer Review',
        adviser_review: 'Adviser Review',
        done: 'Done'
      };
      logActivity(`moved task to ${statusLabels[newStatus]}`, target.title);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // Milestone / Phase Handlers
  const toggleDeliverable = (phaseId: number, deliverableId: string) => {
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId) {
          const updatedDeliverables = p.keyDeliverables.map(d =>
            d.id === deliverableId ? { ...d, completed: !d.completed } : d
          );
          const completedCount = updatedDeliverables.filter(d => d.completed).length;
          const pct = Math.round((completedCount / updatedDeliverables.length) * 100);
          const newStatus = pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'upcoming';
          return {
            ...p,
            keyDeliverables: updatedDeliverables,
            progressPercentage: pct,
            status: newStatus
          };
        }
        return p;
      })
    );
    logActivity('updated phase deliverable checklist', `Phase ${phaseId}`);
  };

  const signOffPhase = (phaseId: number) => {
    const today = new Date().toISOString().split('T')[0];
    setPhases(prev =>
      prev.map(p =>
        p.id === phaseId
          ? { ...p, adviserSignOff: !p.adviserSignOff, signedOffDate: !p.adviserSignOff ? today : undefined }
          : p
      )
    );
    logActivity('granted formal adviser sign-off', `Phase ${phaseId}`);
  };

  // Chapter Handlers
  const toggleChapterSection = (chapterId: number, sectionId: string) => {
    setChapters(prev =>
      prev.map(ch => {
        if (ch.id === chapterId) {
          const updatedSections = ch.sections.map(s => {
            if (s.id === sectionId) {
              const newCompleted = !s.completed;
              const newStatus: ChapterSection['status'] = newCompleted ? 'adviser_approved' : 'drafting';
              return {
                ...s,
                completed: newCompleted,
                status: newStatus
              };
            }
            return s;
          });
          const allCompleted = updatedSections.every(s => s.completed);
          return {
            ...ch,
            sections: updatedSections,
            adviserStatus: allCompleted ? 'approved' : 'in_review',
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return ch;
      })
    );
    logActivity('updated chapter section status', `Chapter ${chapterId}`);
  };

  const updateChapter = (chapterId: number, updates: Partial<ManuscriptChapter>) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { ...ch, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : ch
      )
    );
    logActivity('updated manuscript details', `Chapter ${chapterId}`);
  };

  // Revision Handlers
  const addRevision = (rev: Omit<RevisionItem, 'id' | 'date'>) => {
    const newRev: RevisionItem = {
      ...rev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setRevisions(prev => [newRev, ...prev]);
    logActivity('logged new adviser critique', rev.chapterOrComponent);
  };

  const updateRevisionStatus = (id: string, status: RevisionItem['status'], actionTaken?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setRevisions(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status,
            actionTaken: actionTaken !== undefined ? actionTaken : r.actionTaken,
            resolvedDate: status === 'resolved' || status === 'verified' ? today : r.resolvedDate,
            verifiedBy: status === 'verified' ? currentMember.name : r.verifiedBy
          };
        }
        return r;
      })
    );
    logActivity(`updated revision status to ${status}`, `Revision #${id}`);
  };

  const deleteRevision = (id: string) => {
    setRevisions(prev => prev.filter(r => r.id !== id));
  };

  // Standup Handlers
  const addStandup = (entry: Omit<StandupEntry, 'id' | 'date'>) => {
    const newEntry: StandupEntry = {
      ...entry,
      id: `std-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setStandups(prev => [newEntry, ...prev]);
    logActivity('submitted daily standup report', currentMember.name);
  };

  const updateProjectInfo = (updates: Partial<CapstoneProject>) => {
    setProject(prev => ({ ...prev, ...updates }));
    logActivity('updated project settings', updates.title || 'Settings');
  };

  const resetData = () => {
    setProject(initialProject);
    setMembers(initialMembers);
    setTasks(initialTasks);
    setPhases(initialPhases);
    setChapters(initialChapters);
    setRevisions(initialRevisions);
    setStandups(initialStandups);
    setActivityLogs(initialActivityLogs);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const fullData = {
      project,
      members,
      tasks,
      phases,
      chapters,
      revisions,
      standups,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.project && data.tasks && data.phases) {
        if (data.project) setProject(data.project);
        if (data.members) setMembers(data.members);
        if (data.tasks) setTasks(data.tasks);
        if (data.phases) setPhases(data.phases);
        if (data.chapters) setChapters(data.chapters);
        if (data.revisions) setRevisions(data.revisions);
        if (data.standups) setStandups(data.standups);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        members,
        tasks,
        phases,
        chapters,
        revisions,
        standups,
        activityLogs,
        currentMember,
        currentRole,
        theme,
        searchQuery,
        filterCategory,
        setSearchQuery,
        setFilterCategory,
        toggleTheme,
        switchMember,
        switchRole,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        toggleDeliverable,
        signOffPhase,
        toggleChapterSection,
        updateChapter,
        addRevision,
        updateRevisionStatus,
        deleteRevision,
        addStandup,
        updateProjectInfo,
        resetData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
