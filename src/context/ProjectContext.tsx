import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  Role,
  PermissionLevel,
  GitHubUser,
  GitHubCommit,
  GitHubPullRequest,
  TicketEvent,
  TaskAttachment
} from '../types';
import {
  initialProject,
  initialMembers,
  initialTasks,
  initialPhases,
  initialChapters,
  initialRevisions,
  initialStandups,
  initialActivityLogs,
  initialCommits,
  initialPullRequests
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllDataFromSupabase,
  seedSupabaseDatabase,
  syncTaskToSupabase,
  deleteTaskFromSupabase,
  syncDeliverableToSupabase,
  deleteDeliverableFromSupabase,
  syncPhaseToSupabase,
  deletePhaseFromSupabase,
  syncStandupToSupabase,
  syncRevisionToSupabase,
  deleteRevisionFromSupabase
} from '../lib/supabaseSync';
import { parseGitHubRepoUrl, syncRepositoryData } from '../lib/github';
import { 
  notifyDiscordTaskClaimed, 
  notifyDiscordTaskResolved, 
  notifyDiscordTaskReviewed, 
  notifyDiscordStandup, 
  notifyDiscordMilestone 
} from '../lib/discord';
import { uploadAttachmentFile, deleteAttachmentFile } from '../lib/supabaseStorage';

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
  
  // Database & Cloud Sync
  isDatabaseConnected: boolean;
  syncToSupabase: () => Promise<boolean>;

  // GitHub Integration States
  githubUser: GitHubUser | null;
  githubCommits: GitHubCommit[];
  githubPRs: GitHubPullRequest[];
  isGitHubConnected: boolean;

  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  toggleTheme: () => void;
  switchMember: (memberId: string) => void;
  switchRole: (role: Role) => void;
  
  // Authentication & Session
  isAuthenticated: boolean;
  loginUser: (memberId: string) => void;
  signOut: () => void;

  // GitHub Actions
  loginWithGitHub: (username: string, token?: string) => Promise<boolean>;
  logoutGitHub: () => void;
  setGitHubRepo: (repoUrl: string) => void;
  syncGitHubData: (targetUrl?: string) => Promise<boolean>;

  // Permission Checks
  isOwner: boolean;
  isAdviser: boolean;
  isMember: boolean;
  canManageSettings: boolean;
  canDeleteTasks: boolean;
  canSignOffMilestones: boolean;
  canManipulateDashboard: boolean;
  canChangePhases: boolean;
  updateMemberPermission: (memberId: string, level: PermissionLevel) => void;
  updateMemberRole: (memberId: string, role: Role, roleTitle: string) => void;
  addMemberByGitHub: (username: string, roleTitle?: string, role?: Role) => Promise<boolean>;
  removeMember: (memberId: string) => void;

  // Task & Ticket Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'loggedHours'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  claimTask: (taskId: string) => void;
  releaseTask: (taskId: string) => void;
  resolveTask: (taskId: string, prUrl?: string, note?: string) => void;
  reviewTask: (taskId: string, note?: string) => void;
  closeTask: (taskId: string, reason?: string) => void;
  loadTemplateTickets: () => void;
  rebuildDatabase: () => void;
  toggleTaskAcceptanceCriteria: (taskId: string, criteriaId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Attachments & Deliverables Proofs
  uploadTaskAttachment: (taskId: string, file: File) => Promise<TaskAttachment | null>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  uploadDeliverableAttachment: (phaseId: number, deliverableId: string, file: File) => Promise<TaskAttachment | null>;
  removeDeliverableAttachment: (phaseId: number, deliverableId: string, attachmentId: string) => Promise<void>;
  
  getTaskProgressPercent: (task: Task) => number;

  // Milestone Actions
  toggleDeliverable: (phaseId: number, deliverableId: string) => void;
  signOffPhase: (phaseId: number) => void;
  changeCurrentPhase: (phaseId: number) => void;
  updatePhaseDetails: (phaseId: number, updates: Partial<MilestonePhase>) => void;
  addPhase: (phaseData: { title: string; description: string; targetDate: string; keyDeliverables?: { title: string; requiredForDefense: boolean }[] }) => void;
  updatePhase: (phaseId: number, updates: Partial<MilestonePhase>) => void;
  deletePhase: (phaseId: number) => void;
  addDeliverable: (phaseId: number, title: string, requiredForDefense?: boolean) => void;
  deleteDeliverable: (phaseId: number, deliverableId: string) => void;
  updateDeliverable: (phaseId: number, deliverableId: string, updates: { title?: string; requiredForDefense?: boolean }) => void;
  
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

const LOCAL_STORAGE_KEY = 'capstoneflow_state_v10';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<CapstoneProject>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_project`);
    return saved ? JSON.parse(saved) : initialProject;
  });

  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_members`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: TeamMember) => {
            if (m.githubUsername) {
              const isUnsplash = m.avatar && m.avatar.includes('unsplash.com');
              return {
                ...m,
                avatar: !isUnsplash && m.avatar ? m.avatar : `https://github.com/${m.githubUsername}.png`
              };
            }
            return m;
          });
        }
      } catch (e) {
        // fallback
      }
    }
    return initialMembers;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tasks`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return initialTasks;
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
    if (saved) {
      try {
        const parsed: ActivityLog[] = JSON.parse(saved);
        // Normalize any legacy 'Just now' strings to realistic timestamps
        return parsed.map((log, idx) => {
          if (log.timestamp === 'Just now' || !log.timestamp) {
            return {
              ...log,
              timestamp: new Date(Date.now() - (idx * 2 + 1) * 60 * 1000).toISOString()
            };
          }
          return log;
        });
      } catch {
        return initialActivityLogs;
      }
    }
    return initialActivityLogs;
  });

  // GitHub State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_user`);
    if (saved) return JSON.parse(saved);
    const m = initialMembers.find(member => member.id === 'm1');
    if (m && m.githubUsername) {
      return {
        id: m.githubUsername,
        login: m.githubUsername,
        name: m.name,
        avatar_url: m.avatar || `https://github.com/${m.githubUsername}.png`,
        email: m.email,
        bio: m.roleTitle,
        html_url: `https://github.com/${m.githubUsername}`,
        connectedAt: new Date().toISOString().split('T')[0]
      };
    }
    return null;
  });

  const [githubCommits, setGithubCommits] = useState<GitHubCommit[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_commits`);
    return saved ? JSON.parse(saved) : initialCommits;
  });

  const [githubPRs, setGithubPRs] = useState<GitHubPullRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_prs`);
    return saved ? JSON.parse(saved) : initialPullRequests;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    return saved || 'm1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth`) === 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(() => isSupabaseConfigured());

  // Supabase Initial Hydration & Real-Time Sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    fetchAllDataFromSupabase().then(data => {
      if (!isMounted || !data) return;
      if (data.project) setProject(data.project);
      if (data.members && data.members.length > 0) setMembers(data.members);
      if (data.phases && data.phases.length > 0) setPhases(data.phases);
      if (data.tasks) setTasks(data.tasks);
      if (data.standups) setStandups(data.standups);
      if (data.revisions) setRevisions(data.revisions);
      if (data.activityLogs && data.activityLogs.length > 0) setActivityLogs(data.activityLogs);
      setIsDatabaseConnected(true);
      toast.success('Connected to Supabase', {
        description: 'PostgreSQL Real-Time Database active'
      });
    });

    if (supabase) {
      const channel = supabase
        .channel('capstone_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchAllDataFromSupabase().then(data => {
            if (!isMounted || !data) return;
            if (data.project) setProject(data.project);
            if (data.members && data.members.length > 0) setMembers(data.members);
            if (data.phases && data.phases.length > 0) setPhases(data.phases);
            if (data.tasks) setTasks(data.tasks);
            if (data.standups) setStandups(data.standups);
            if (data.revisions) setRevisions(data.revisions);
          });
        })
        .subscribe();

      return () => {
        isMounted = false;
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, currentMemberId);
  }, [currentMemberId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, 'true');
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    }
  }, [isAuthenticated]);

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
    if (githubUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_github_user`, JSON.stringify(githubUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_github_user`);
    }
  }, [githubUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_github_commits`, JSON.stringify(githubCommits));
  }, [githubCommits]);

  // Helper to calculate exact task progress percentage based on status & subtasks
  const getTaskProgressPercent = (task: Task): number => {
    if (task.status === 'done') return 100;
    
    // Strict mathematical subtask percentage
    if (task.subtasks && task.subtasks.length > 0) {
      const completed = task.subtasks.filter(s => s.completed).length;
      return Math.round((completed / task.subtasks.length) * 100);
    }
    
    // Acceptance criteria percentage if no subtasks
    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      const completed = task.acceptanceCriteria.filter(c => c.completed).length;
      return Math.round((completed / task.acceptanceCriteria.length) * 100);
    }
    
    // Column status fallback when no item checklists exist
    if (task.status === 'peer_review') return 75;
    if (task.status === 'adviser_review') return 85;
    if (task.status === 'in_progress') return 50;
    return 0;
  };

  // Dynamically calculate phase progress and overall readiness reflecting real tasks
  useEffect(() => {
    // 1. Compute each phase's progress based on assigned tasks & deliverables
    setPhases(prevPhases => {
      let changed = false;
      const updated = prevPhases.map(phase => {
        const phaseTasks = tasks.filter(t => t.phaseId === phase.id);
        const totalDeliverables = phase.keyDeliverables.length;
        const completedDeliverables = phase.keyDeliverables.filter(d => d.completed).length;

        const deliverablePct = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

        let taskPct = 0;
        if (phaseTasks.length > 0) {
          const totalPoints = phaseTasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
          const completedPoints = phaseTasks.reduce((sum, t) => {
            const score = getTaskProgressPercent(t) / 100;
            return sum + ((t.storyPoints || 1) * score);
          }, 0);
          taskPct = (completedPoints / totalPoints) * 100;
        }

        let calculatedPct = 0;
        if (totalDeliverables > 0 && phaseTasks.length > 0) {
          calculatedPct = Math.round((deliverablePct * 0.5) + (taskPct * 0.5));
        } else if (totalDeliverables > 0) {
          calculatedPct = Math.round(deliverablePct);
        } else if (phaseTasks.length > 0) {
          calculatedPct = Math.round(taskPct);
        } else {
          calculatedPct = 0;
        }

        let newStatus: MilestonePhase['status'] = phase.status;
        if (calculatedPct === 100) {
          newStatus = 'completed';
        } else if (calculatedPct > 0 || phase.id === project.currentPhaseId) {
          newStatus = 'in_progress';
        } else {
          newStatus = 'upcoming';
        }

        if (phase.progressPercentage !== calculatedPct || phase.status !== newStatus) {
          changed = true;
          return {
            ...phase,
            progressPercentage: calculatedPct,
            status: newStatus
          };
        }
        return phase;
      });

      return changed ? updated : prevPhases;
    });

    // 2. Compute overall project readiness
    let taskReadiness = 0;
    if (tasks.length > 0) {
      const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
      const completedPoints = tasks.reduce((sum, t) => {
        const score = getTaskProgressPercent(t) / 100;
        return sum + ((t.storyPoints || 1) * score);
      }, 0);
      taskReadiness = (completedPoints / totalPoints) * 100;
    }

    const totalDeliverables = phases.reduce((acc, p) => acc + p.keyDeliverables.length, 0);
    const completedDeliverables = phases.reduce((acc, p) => acc + p.keyDeliverables.filter(d => d.completed).length, 0);
    const deliverableReadiness = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

    let revisionReadiness = 100;
    if (revisions.length > 0) {
      const resolved = revisions.filter(r => r.status === 'resolved' || r.status === 'verified').length;
      revisionReadiness = (resolved / revisions.length) * 100;
    }

    let calculatedOverall = 0;
    if (tasks.length > 0) {
      calculatedOverall = Math.round(
        (taskReadiness * 0.60) +
        (deliverableReadiness * 0.30) +
        (revisionReadiness * 0.10)
      );
    } else {
      calculatedOverall = Math.round(
        (deliverableReadiness * 0.70) +
        (revisionReadiness * 0.30)
      );
    }

    setProject(prev => {
      if (prev.overallProgress !== calculatedOverall) {
        return { ...prev, overallProgress: calculatedOverall };
      }
      return prev;
    });
  }, [tasks, phases, revisions]);

  // Automatic GitHub OAuth Code Detection & Exchange
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // Exchange code via backend proxy
      fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const userData: GitHubUser = {
              id: data.user.id,
              login: data.user.login,
              name: data.user.name || data.user.login,
              avatar_url: data.user.avatar_url,
              email: data.user.email || `${data.user.login}@users.noreply.github.com`,
              bio: data.user.bio || 'GitHub Contributor',
              html_url: data.user.html_url,
              public_repos: data.user.public_repos,
              connectedAt: new Date().toISOString().split('T')[0]
            };
            setGithubUser(userData);
            setIsAuthenticated(true);
            
            // Link user persona to the workspace
            setMembers(prev => {
              const cleanLogin = userData.login.toLowerCase();
              const matched = prev.find(m => 
                (m.githubUsername && m.githubUsername.toLowerCase() === cleanLogin) ||
                m.id.toLowerCase() === cleanLogin ||
                m.id === `m_${cleanLogin}`
              );

              if (matched) {
                setCurrentMemberId(matched.id);
                return prev.map(m => m.id === matched.id ? { 
                  ...m, 
                  name: userData.name || userData.login, 
                  avatar: userData.avatar_url || `https://github.com/${userData.login}.png`,
                  githubUsername: userData.login,
                  email: userData.email || m.email
                } : m);
              }

              // If a new team member is logging in with GitHub:
              const isFirstStudent = !prev.some(m => m.permissionLevel === 'owner');
              const newMemberId = `m_${cleanLogin}`;
              const newMember: TeamMember = {
                id: newMemberId,
                name: userData.name || userData.login,
                email: userData.email || `${userData.login}@users.noreply.github.com`,
                role: isFirstStudent ? 'leader' : 'developer',
                roleTitle: isFirstStudent ? 'Project Lead & Architect' : 'Software Developer',
                permissionLevel: isFirstStudent ? 'owner' : 'member',
                avatar: userData.avatar_url || `https://github.com/${userData.login}.png`,
                color: '#10b981',
                githubUsername: userData.login
              };
              setCurrentMemberId(newMemberId);
              return [...prev, newMember];
            });

            // Clean up query param and redirect back to clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            logActivity('authenticated via GitHub OAuth 2.0', `@${userData.login}`);
          }
        })
        .catch(err => {
          console.error('GitHub OAuth Exchange Error:', err);
        });
    }
  }, []);

  const currentMember = members.find(m => m.id === currentMemberId) || members[0];
  const currentRole = currentMember.role;

  const isOwner = currentMember.permissionLevel === 'owner';
  const isAdviser = currentMember.permissionLevel === 'adviser';
  const isMember = currentMember.permissionLevel === 'member';

  const canManageSettings = isOwner;
  const canDeleteTasks = isOwner;
  const canSignOffMilestones = isOwner || isAdviser;

  const updateMemberPermission = (memberId: string, level: PermissionLevel) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissionLevel: level } : m));
    logActivity('updated member permissions', `Member #${memberId}`);
  };

  const updateMemberRole = (memberId: string, role: Role, roleTitle: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role, roleTitle } : m));
    logActivity('updated member role title', roleTitle);
  };

  const logActivity = (action: string, target: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentMember.id,
      action,
      target
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 29)]);
  };

  const toggleTheme = () => {
    document.documentElement.classList.add('disable-transitions');
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions');
    }, 20);
  };

  const loginUser = (memberId: string) => {
    setCurrentMemberId(memberId);
    setIsAuthenticated(true);
    const target = members.find(m => m.id === memberId);
    if (target && target.githubUsername) {
      const gUser: GitHubUser = {
        id: target.githubUsername,
        login: target.githubUsername,
        name: target.name,
        avatar_url: target.avatar || `https://github.com/${target.githubUsername}.png`,
        email: target.email,
        bio: target.roleTitle,
        html_url: `https://github.com/${target.githubUsername}`,
        connectedAt: new Date().toISOString().split('T')[0]
      };
      setGithubUser(gUser);
    }
    logActivity('authenticated into workspace', target?.name || 'Member');
  };

  const signOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    logActivity('signed out of workspace', currentMember.name);
  };

  const switchMember = (memberId: string) => {
    setCurrentMemberId(memberId);
    const target = members.find(m => m.id === memberId);
    if (target && target.githubUsername) {
      const gUser: GitHubUser = {
        id: target.githubUsername,
        login: target.githubUsername,
        name: target.name,
        avatar_url: target.avatar || `https://github.com/${target.githubUsername}.png`,
        email: target.email,
        bio: target.roleTitle,
        html_url: `https://github.com/${target.githubUsername}`,
        connectedAt: new Date().toISOString().split('T')[0]
      };
      setGithubUser(gUser);
    }
  };

  const switchRole = (role: Role) => {
    const found = members.find(m => m.role === role);
    if (found) {
      setCurrentMemberId(found.id);
    }
  };

  // GitHub Authentication & Sync
  const loginWithGitHub = async (username: string, token?: string): Promise<boolean> => {
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) return false;

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (token) {
        headers['Authorization'] = `token ${token.trim()}`;
      }

      const res = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
      
      let userData: GitHubUser;
      if (res.ok) {
        const gh = await res.json();
        userData = {
          id: gh.id,
          login: gh.login,
          name: gh.name || gh.login,
          avatar_url: gh.avatar_url,
          email: gh.email || `${gh.login}@users.noreply.github.com`,
          bio: gh.bio || 'GitHub Contributor',
          html_url: gh.html_url,
          public_repos: gh.public_repos,
          connectedAt: new Date().toISOString().split('T')[0]
        };
      } else {
        // Offline / Fallback instant profile
        userData = {
          id: Date.now(),
          login: cleanUsername,
          name: cleanUsername,
          avatar_url: `https://github.com/${cleanUsername}.png`,
          email: `${cleanUsername}@users.noreply.github.com`,
          bio: 'GitHub Contributor',
          html_url: `https://github.com/${cleanUsername}`,
          public_repos: 1,
          connectedAt: new Date().toISOString().split('T')[0]
        };
      }

      setGithubUser(userData);
      setIsAuthenticated(true);

      // Update or dynamically register this team member
      setMembers(prev => {
        const cleanLogin = userData.login.toLowerCase();
        const matched = prev.find(m => 
          (m.githubUsername && m.githubUsername.toLowerCase() === cleanLogin) ||
          m.id.toLowerCase() === cleanLogin ||
          m.id === `m_${cleanLogin}`
        );

        if (matched) {
          setCurrentMemberId(matched.id);
          return prev.map(m => m.id === matched.id ? {
            ...m,
            name: userData.name || userData.login,
            avatar: userData.avatar_url || `https://github.com/${userData.login}.png`,
            githubUsername: userData.login,
            email: userData.email || m.email
          } : m);
        }

        const isFirstStudent = !prev.some(m => m.permissionLevel === 'owner');
        const newMemberId = `m_${cleanLogin}`;
        const newMember: TeamMember = {
          id: newMemberId,
          name: userData.name || userData.login,
          email: userData.email || `${userData.login}@users.noreply.github.com`,
          role: isFirstStudent ? 'leader' : 'developer',
          roleTitle: isFirstStudent ? 'Project Lead & Architect' : 'Software Developer',
          permissionLevel: isFirstStudent ? 'owner' : 'member',
          avatar: userData.avatar_url || `https://github.com/${userData.login}.png`,
          color: '#10b981',
          githubUsername: userData.login
        };
        setCurrentMemberId(newMemberId);
        return [...prev, newMember];
      });

      logActivity('connected GitHub account', `@${userData.login}`);
      return true;
    } catch (e) {
      console.error('GitHub connection error:', e);
      return false;
    }
  };

  const addMemberByGitHub = async (username: string, roleTitle = 'Software Developer', role: Role = 'developer'): Promise<boolean> => {
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) return false;

    let displayName = cleanUsername;
    let avatarUrl = `https://github.com/${cleanUsername}.png`;

    try {
      const res = await fetch(`https://api.github.com/users/${cleanUsername}`);
      if (res.ok) {
        const data = await res.json();
        if (data.name) displayName = data.name;
        if (data.avatar_url) avatarUrl = data.avatar_url;
      }
    } catch {
      // fallback to github.com/<username>.png
    }

    setMembers(prev => {
      if (prev.some(m => m.githubUsername?.toLowerCase() === cleanUsername.toLowerCase())) {
        return prev;
      }
      const newMember: TeamMember = {
        id: `m_${cleanUsername.toLowerCase()}`,
        name: displayName,
        email: `${cleanUsername}@student.edu`,
        role,
        roleTitle,
        permissionLevel: 'member',
        avatar: avatarUrl,
        color: '#38bdf8',
        githubUsername: cleanUsername
      };
      return [...prev, newMember];
    });

    logActivity('added team member from GitHub', `@${cleanUsername}`);
    return true;
  };

  const removeMember = (memberId: string) => {
    if (memberId === 'm1' || memberId === currentMemberId) return;
    setMembers(prev => prev.filter(m => m.id !== memberId));
    logActivity('removed member from roster', memberId);
  };

  const logoutGitHub = () => {
    setGithubUser(null);
    setGithubCommits([]);
    setGithubPRs([]);
    logActivity('disconnected GitHub account', 'GitHub Integration');
  };

  const setGitHubRepo = (repoUrl: string) => {
    setProject(prev => ({ ...prev, githubRepoUrl: repoUrl }));
    logActivity('linked GitHub repository', repoUrl);
  };

  const syncGitHubData = async (targetUrl?: string): Promise<boolean> => {
    const repoTarget = targetUrl || project.githubRepoUrl || (githubUser ? `${githubUser.login}/capstone-project` : 'Realwaan/capstone-project');
    const parsed = parseGitHubRepoUrl(repoTarget);
    if (!parsed) {
      toast.error('Invalid Repository Target', {
        description: 'Please enter a valid GitHub repository (e.g. Realwaan/USCCE or https://github.com/...)'
      });
      return false;
    }

    try {
      const result = await syncRepositoryData(parsed.owner, parsed.repo);

      if (result.success) {
        setGithubCommits(result.commits);
        setGithubPRs(result.pullRequests);

        // Smart Task-Commit Auto Linking
        if (result.commits.length > 0) {
          setTasks(prevTasks => {
            let changed = false;
            const updated = prevTasks.map(t => {
              const match = result.commits.find(c =>
                c.message.toLowerCase().includes(t.id.toLowerCase()) ||
                c.message.toLowerCase().includes(t.title.toLowerCase())
              );
              if (match && !t.prUrl) {
                changed = true;
                return {
                  ...t,
                  prUrl: match.url,
                  resolvedAt: match.date.split('T')[0],
                  resolvedByUsername: match.authorUsername
                };
              }
              return t;
            });
            return changed ? updated : prevTasks;
          });
        }

        logActivity('synced GitHub repository feed', `${parsed.owner}/${parsed.repo}`);
        toast.success('GitHub Synced', {
          description: `Loaded ${result.commits.length} commits & ${result.pullRequests.length} PRs from ${parsed.owner}/${parsed.repo}`
        });
        return true;
      } else {
        logActivity('GitHub sync issue', result.errorMessage || 'Sync failed');
        toast.error('GitHub Sync Issue', {
          description: result.errorMessage || 'Could not fetch repository activity'
        });
        return false;
      }
    } catch (e: any) {
      console.warn('syncGitHubData error:', e);
      toast.error('GitHub Sync Failed', {
        description: e.message || 'Network error while contacting GitHub API.'
      });
      return false;
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
    syncTaskToSupabase(newTask);
    logActivity('created a new task', newTask.title);
    toast.success(`Task created: "${newTask.title}"`);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
          syncTaskToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
    logActivity('updated task details', updates.title || 'a task');
    toast.success('Task details updated');
  };

  const deleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    deleteTaskFromSupabase(taskId);
    if (target) {
      logActivity('deleted task', target.title);
      toast.info(`Deleted task: "${target.title}"`);
    }
  };

  const claimTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const claimedAt = new Date().toISOString();
    const claimerHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'claimed',
      username: claimerHandle,
      timestamp: claimedAt,
      oldStatus: '[OPEN]',
      newStatus: `[CLAIMED][${claimerHandle}]`
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = (t.status === 'backlog' || t.status === 'todo') ? 'in_progress' : t.status;
          const events = t.ticketEvents ? [newEvent, ...t.ticketEvents] : [newEvent];
          return {
            ...t,
            assigneeId: currentMember.id,
            status: nextStatus,
            claimedAt,
            claimedByUsername: claimerHandle,
            ticketEvents: events,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    logActivity('claimed ownership of task (/claim)', `[CLAIMED][${claimerHandle}] ${target.title}`);
    notifyDiscordTaskClaimed(target, currentMember.name, claimerHandle);
    toast.success('Ticket Claimed', {
      description: `Assigned to ${claimerHandle}`
    });
  };

  const releaseTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'unclaimed',
      username: userHandle,
      timestamp,
      oldStatus: `[CLAIMED][${target.claimedByUsername || userHandle}]`,
      newStatus: '[OPEN]'
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const events = t.ticketEvents ? [newEvent, ...t.ticketEvents] : [newEvent];
          return {
            ...t,
            status: 'todo',
            assigneeId: '',
            claimedAt: undefined,
            claimedByUsername: undefined,
            ticketEvents: events,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    logActivity('unclaimed ticket back to open pool (/unclaim)', `[OPEN] ${target.title}`);
    toast.info('Ticket Released', {
      description: `"${target.title}" returned to open pool`
    });
  };

  const resolveTask = (taskId: string, prUrl?: string, note?: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'resolved',
      username: userHandle,
      timestamp,
      oldStatus: target.assigneeId ? `[CLAIMED][${target.claimedByUsername || userHandle}]` : '[OPEN]',
      newStatus: `[PENDING-REVIEW][${userHandle}]`,
      prUrl,
      note
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const events = t.ticketEvents ? [newEvent, ...t.ticketEvents] : [newEvent];
          return {
            ...t,
            status: 'peer_review',
            prUrl: prUrl || t.prUrl,
            resolvedAt: timestamp,
            resolvedByUsername: userHandle,
            ticketEvents: events,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    logActivity('submitted ticket for review (/resolved)', `[PENDING-REVIEW] ${target.title}`);
    notifyDiscordTaskResolved(target, currentMember.name, userHandle, prUrl);
    toast.success('Ticket Ready for Review', {
      description: prUrl ? `Linked PR: ${prUrl}` : 'Marked pending peer & adviser review'
    });
  };

  const reviewTask = (taskId: string, note?: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'reviewed',
      username: userHandle,
      timestamp,
      oldStatus: `[PENDING-REVIEW]`,
      newStatus: `[REVIEWED][${userHandle}]`,
      note
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const events = t.ticketEvents ? [newEvent, ...t.ticketEvents] : [newEvent];
          return {
            ...t,
            status: 'done',
            reviewedAt: timestamp,
            reviewedByUsername: userHandle,
            ticketEvents: events,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    logActivity('approved and reviewed ticket (/reviewed)', `[REVIEWED] ${target.title}`);
    notifyDiscordTaskReviewed(target, currentMember.name, userHandle);
    toast.success('Ticket Approved', {
      description: 'Verified and signed off by QA / Adviser'
    });
  };

  const closeTask = (taskId: string, reason?: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'closed',
      username: userHandle,
      timestamp,
      oldStatus: `[${target.status.toUpperCase()}]`,
      newStatus: `[CLOSED]`,
      note: reason
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const events = t.ticketEvents ? [newEvent, ...t.ticketEvents] : [newEvent];
          return {
            ...t,
            status: 'done',
            closedAt: timestamp,
            closedByUsername: userHandle,
            ticketEvents: events,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      })
    );
    logActivity('closed ticket (/closed)', `[CLOSED] ${target.title}`);
    toast.info(`🔒 Ticket closed: "${target.title}"`);
  };

  const loadTemplateTickets = () => {
    setTasks(initialTasks);
    logActivity('reloaded template capstone tickets (/load-tickets)', 'Task Matrix');
    toast.success('📥 Loaded institutional capstone tickets into matrix!');
  };

  const rebuildDatabase = () => {
    setTasks(initialTasks);
    setPhases(initialPhases);
    setChapters(initialChapters);
    setRevisions(initialRevisions);
    setStandups(initialStandups);
    setActivityLogs(initialActivityLogs);
    logActivity('rebuilt database from seed schema (/rebuild-db)', 'Workspace Database');
    toast.success('🔄 Database & threads rebuilt successfully!');
  };

  const toggleTaskAcceptanceCriteria = (taskId: string, criteriaId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.acceptanceCriteria) {
          const updatedCriteria = t.acceptanceCriteria.map(c =>
            c.id === criteriaId ? { ...c, completed: !c.completed } : c
          );
          return { ...t, acceptanceCriteria: updatedCriteria };
        }
        return t;
      })
    );
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
      logActivity(`moved task to ${newStatus}`, target.title);
      if (newStatus === 'done') {
        toast.success(`🎉 Completed: "${target.title}"`);
      } else {
        toast.info(`Moved to ${newStatus.replace('_', ' ')}: "${target.title}"`);
      }
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
          const targetDeliv = updatedDeliverables.find(d => d.id === deliverableId);
          if (targetDeliv) {
            syncDeliverableToSupabase(phaseId, targetDeliv);
          }
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
    logActivity('updated deliverable checklist', `Phase ${phaseId}`);
    toast.success('Milestone deliverable checklist updated');
  };

  const signOffPhase = (phaseId: number) => {
    if (!isOwner && !isAdviser) return;
    const today = new Date().toISOString().split('T')[0];
    let signedPhase: MilestonePhase | undefined;
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId) {
          const nextSignOff = !p.adviserSignOff;
          const updated = { ...p, adviserSignOff: nextSignOff, signedOffDate: nextSignOff ? today : undefined };
          syncPhaseToSupabase(updated);
          if (nextSignOff) {
            signedPhase = updated;
          }
          return updated;
        }
        return p;
      })
    );
    if (signedPhase) {
      notifyDiscordMilestone(signedPhase, currentMember.name);
    }
    logActivity('granted formal adviser sign-off', `Phase ${phaseId}`);
    toast.success('Milestone Endorsed', {
      description: `Formal sign-off completed for Phase ${phaseId}`
    });
  };

  const changeCurrentPhase = (phaseId: number) => {
    if (!isOwner) return;
    setProject(prev => {
      const updated = { ...prev, currentPhaseId: phaseId };
      return updated;
    });
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId && p.status === 'upcoming') {
          const updated = { ...p, status: 'in_progress' as const };
          syncPhaseToSupabase(updated);
          return updated;
        }
        return p;
      })
    );
    logActivity('changed active project phase', `Phase ${phaseId}`);
    toast.info('Active Milestone Updated', {
      description: `Switched focus to Phase ${phaseId}`
    });
  };

  const updatePhaseDetails = (phaseId: number, updates: Partial<MilestonePhase>) => {
    if (!isOwner) return;
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId) {
          const updated = { ...p, ...updates };
          syncPhaseToSupabase(updated);
          return updated;
        }
        return p;
      })
    );
    logActivity('updated phase settings', `Phase ${phaseId}`);
    toast.success('Phase Deadline Updated');
  };

  const addPhase = (phaseData: { title: string; description: string; targetDate: string; keyDeliverables?: { title: string; requiredForDefense: boolean }[] }) => {
    if (!isOwner) return;
    const nextId = phases.length > 0 ? Math.max(...phases.map(p => p.id)) + 1 : 1;
    const deliverables = (phaseData.keyDeliverables || []).map((d, index) => ({
      id: `d-${nextId}-${Date.now()}-${index}`,
      title: d.title.trim(),
      completed: false,
      requiredForDefense: d.requiredForDefense ?? true
    }));

    const newPhase: MilestonePhase = {
      id: nextId,
      title: phaseData.title.trim(),
      description: phaseData.description.trim(),
      targetDate: phaseData.targetDate,
      status: 'upcoming',
      progressPercentage: 0,
      keyDeliverables: deliverables,
      adviserSignOff: false
    };

    setPhases(prev => [...prev, newPhase]);
    syncPhaseToSupabase(newPhase);
    for (const d of deliverables) {
      syncDeliverableToSupabase(nextId, d);
    }
    logActivity('created new milestone phase', `Phase ${nextId}: ${newPhase.title}`);
    toast.success('Milestone Phase Created', {
      description: `Phase ${nextId}: "${newPhase.title}" added to roadmap`
    });
  };

  const updatePhase = (phaseId: number, updates: Partial<MilestonePhase>) => {
    if (!isOwner) return;
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId) {
          const updated = { ...p, ...updates };
          syncPhaseToSupabase(updated);
          return updated;
        }
        return p;
      })
    );
    logActivity('updated milestone phase details', `Phase ${phaseId}`);
    toast.success(`Phase ${phaseId} updated successfully!`);
  };

  const deletePhase = (phaseId: number) => {
    if (!isOwner) return;
    if (phases.length <= 1) {
      toast.error('Cannot delete the only remaining project phase.');
      return;
    }

    setPhases(prev => prev.filter(p => p.id !== phaseId));
    deletePhaseFromSupabase(phaseId);

    // If deleted phase was current active phase, advance/fallback currentPhaseId
    if (project.currentPhaseId === phaseId) {
      const remaining = phases.filter(p => p.id !== phaseId);
      const nextActiveId = remaining[0]?.id || 1;
      setProject(prev => ({ ...prev, currentPhaseId: nextActiveId }));
    }

    // Reassign any tasks mapped to this phase
    const remainingPhases = phases.filter(p => p.id !== phaseId);
    const fallbackPhaseId = remainingPhases[0]?.id || 1;
    setTasks(prev => prev.map(t => {
      if (t.phaseId === phaseId) {
        const reassigned = { ...t, phaseId: fallbackPhaseId };
        syncTaskToSupabase(reassigned);
        return reassigned;
      }
      return t;
    }));

    logActivity('removed milestone phase', `Phase ${phaseId}`);
    toast.success(`Phase ${phaseId} deleted.`);
  };

  const addDeliverable = (phaseId: number, title: string, requiredForDefense = true) => {
    if (!isOwner) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newDeliverable = {
      id: `d-${phaseId}-${Date.now()}`,
      title: trimmedTitle,
      completed: false,
      requiredForDefense
    };

    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updated = [...p.keyDeliverables, newDeliverable];
        const completedCount = updated.filter(d => d.completed).length;
        const pct = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
        return {
          ...p,
          keyDeliverables: updated,
          progressPercentage: pct
        };
      }
      return p;
    }));
    syncDeliverableToSupabase(phaseId, newDeliverable);
    logActivity('added deliverable to phase', `Phase ${phaseId}`);
    toast.success('Deliverable added');
  };

  const deleteDeliverable = (phaseId: number, deliverableId: string) => {
    if (!isOwner) return;
    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updated = p.keyDeliverables.filter(d => d.id !== deliverableId);
        const completedCount = updated.filter(d => d.completed).length;
        const pct = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
        return {
          ...p,
          keyDeliverables: updated,
          progressPercentage: pct
        };
      }
      return p;
    }));
    deleteDeliverableFromSupabase(deliverableId);
    logActivity('removed deliverable from phase', `Phase ${phaseId}`);
    toast.success('Deliverable removed');
  };

  const updateDeliverable = (phaseId: number, deliverableId: string, updates: { title?: string; requiredForDefense?: boolean }) => {
    if (!isOwner) return;
    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updated = p.keyDeliverables.map(d => {
          if (d.id === deliverableId) {
            const upd = { ...d, ...updates };
            syncDeliverableToSupabase(phaseId, upd);
            return upd;
          }
          return d;
        });
        return { ...p, keyDeliverables: updated };
      }
      return p;
    }));
    logActivity('updated deliverable details', `Phase ${phaseId}`);
    toast.success('Deliverable updated');
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
    setChapters(prev => prev.map(ch => (ch.id === chapterId ? { ...ch, ...updates } : ch)));
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
    syncRevisionToSupabase(newRev);
    logActivity('logged a manuscript panel revision', newRev.chapterOrComponent || 'Manuscript Feedback');
    toast.success('Revision comment added');
  };

  const updateRevisionStatus = (id: string, status: RevisionItem['status'], actionTaken?: string) => {
    setRevisions(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = {
            ...r,
            status,
            actionTaken: actionTaken !== undefined ? actionTaken : r.actionTaken
          };
          syncRevisionToSupabase(updated);
          return updated;
        }
        return r;
      })
    );
    logActivity(`updated revision status to ${status}`, `Revision #${id}`);
  };

  const deleteRevision = (id: string) => {
    setRevisions(prev => prev.filter(r => r.id !== id));
    deleteRevisionFromSupabase(id);
  };

  // Standup Handlers
  const addStandup = (entry: Omit<StandupEntry, 'id' | 'date'>) => {
    const newEntry: StandupEntry = {
      ...entry,
      id: `std-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setStandups(prev => [newEntry, ...prev]);
    syncStandupToSupabase(newEntry);
    notifyDiscordStandup(newEntry, currentMember.name, currentMember.roleTitle, currentMember.avatar);
    logActivity('submitted daily sprint standup', currentMember.name);
    toast.success('Standup Posted', {
      description: 'Logged to activity feed & sent to Discord'
    });
  };

  // Attachment & File Storage Handlers
  const uploadTaskAttachment = async (taskId: string, file: File): Promise<TaskAttachment | null> => {
    try {
      const uploader = githubUser ? `@${githubUser.login}` : currentMember.name;
      const att = await uploadAttachmentFile(file, 'tasks', uploader);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const list = t.attachments ? [...t.attachments, att] : [att];
          const updated = { ...t, attachments: list, updatedAt: new Date().toISOString().split('T')[0] };
          syncTaskToSupabase(updated);
          return updated;
        }
        return t;
      }));
      logActivity('attached file to task ticket', `${file.name} on ${taskId}`);
      toast.success('File Attached', { description: file.name });
      return att;
    } catch (e: any) {
      toast.error('Upload Failed', { description: e.message || 'File upload error' });
      return null;
    }
  };

  const removeTaskAttachment = async (taskId: string, attachmentId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const targetAtt = task?.attachments?.find(a => a.id === attachmentId);
    if (targetAtt) {
      await deleteAttachmentFile(targetAtt.url);
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          attachments: t.attachments ? t.attachments.filter(a => a.id !== attachmentId) : [],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        syncTaskToSupabase(updated);
        return updated;
      }
      return t;
    }));
    toast.info('Attachment Removed');
  };

  const uploadDeliverableAttachment = async (phaseId: number, deliverableId: string, file: File): Promise<TaskAttachment | null> => {
    try {
      const uploader = githubUser ? `@${githubUser.login}` : currentMember.name;
      const att = await uploadAttachmentFile(file, 'deliverables', uploader);
      setPhases(prev => prev.map(p => {
        if (p.id === phaseId) {
          const updated = {
            ...p,
            keyDeliverables: p.keyDeliverables.map(d => {
              if (d.id === deliverableId) {
                const list = d.attachments ? [...d.attachments, att] : [att];
                const updatedDeliv = { ...d, attachments: list };
                syncDeliverableToSupabase(phaseId, updatedDeliv);
                return updatedDeliv;
              }
              return d;
            })
          };
          syncPhaseToSupabase(updated);
          return updated;
        }
        return p;
      }));
      logActivity('uploaded milestone deliverable proof', `${file.name} for Phase ${phaseId}`);
      toast.success('Deliverable Proof Uploaded', { description: file.name });
      return att;
    } catch (e: any) {
      toast.error('Upload Failed', { description: e.message });
      return null;
    }
  };

  const removeDeliverableAttachment = async (phaseId: number, deliverableId: string, attachmentId: string) => {
    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updated = {
          ...p,
          keyDeliverables: p.keyDeliverables.map(d => {
            if (d.id === deliverableId) {
              const target = d.attachments?.find(a => a.id === attachmentId);
              if (target) deleteAttachmentFile(target.url);
              const updatedDeliv = {
                ...d,
                attachments: d.attachments ? d.attachments.filter(a => a.id !== attachmentId) : []
              };
              syncDeliverableToSupabase(phaseId, updatedDeliv);
              return updatedDeliv;
            }
            return d;
          })
        };
        syncPhaseToSupabase(updated);
        return updated;
      }
      return p;
    }));
    toast.info('Deliverable Proof Removed');
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
    setGithubUser(null);
    setGithubCommits([]);
    setGithubPRs([]);
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
      githubUser,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.project) {
        if (data.project) setProject(data.project);
        if (data.members) setMembers(data.members);
        if (data.tasks) setTasks(data.tasks);
        if (data.phases) setPhases(data.phases);
        if (data.chapters) setChapters(data.chapters);
        if (data.revisions) setRevisions(data.revisions);
        if (data.standups) setStandups(data.standups);
        if (data.githubUser) setGithubUser(data.githubUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const syncToSupabase = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      return false;
    }
    const success = await seedSupabaseDatabase({
      project,
      members,
      phases,
      tasks,
      standups,
      revisions
    });
    if (success) {
      setIsDatabaseConnected(true);
      toast.success('Supabase Sync Complete', {
        description: 'Workspace state successfully published to cloud'
      });
    } else {
      toast.error('Sync Failed', {
        description: 'Please check your Supabase connection and schema.sql'
      });
    }
    return success;
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
        isDatabaseConnected,
        syncToSupabase,
        isAuthenticated,
        loginUser,
        signOut,
        githubUser,
        githubCommits,
        githubPRs,
        isGitHubConnected: !!githubUser,
        isOwner,
        isAdviser,
        isMember,
        canManageSettings,
        canDeleteTasks,
        canSignOffMilestones,
        canManipulateDashboard: isOwner,
        canChangePhases: isOwner,
        updateMemberPermission,
        updateMemberRole,
        addMemberByGitHub,
        removeMember,
        setSearchQuery,
        setFilterCategory,
        toggleTheme,
        switchMember,
        switchRole,
        loginWithGitHub,
        logoutGitHub,
        setGitHubRepo,
        syncGitHubData,
        addTask,
        updateTask,
        deleteTask,
        claimTask,
        releaseTask,
        resolveTask,
        reviewTask,
        closeTask,
        loadTemplateTickets,
        rebuildDatabase,
        toggleTaskAcceptanceCriteria,
        moveTaskStatus,
        toggleSubtask,
        uploadTaskAttachment,
        removeTaskAttachment,
        uploadDeliverableAttachment,
        removeDeliverableAttachment,
        getTaskProgressPercent,
        toggleDeliverable,
        signOffPhase,
        changeCurrentPhase,
        updatePhaseDetails,
        addPhase,
        updatePhase,
        deletePhase,
        addDeliverable,
        deleteDeliverable,
        updateDeliverable,
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

