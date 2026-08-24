import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  TaskAttachment,
  OnlinePresenceUser,
  NewProjectPayload
} from '../types';
import {
  initialProject,
  initialMembers,
  initialTasks,
  templateCapstoneTickets,
  initialPhases,
  initialChapters,
  initialRevisions,
  initialStandups,
  initialActivityLogs,
  initialCommits,
  initialPullRequests
} from '../data/initialData';
import { createNewProjectInstance, cleanProjectTitle } from '../lib/projectGenerator';
import {
  computeOverallReadiness,
  computePhaseProgress,
  getTaskProgressPercent
} from '../lib/domain/progress';
import { createDiscordTicket, isDiscordTicketSyncEnabled, syncDiscordTicketStatus } from '../lib/discordTickets';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { realtimeHub } from '../lib/realtimeHub';
import {
  fetchAllDataFromSupabase,
  fetchMembershipProjectsFromSupabase,
  fetchProjectByInviteCode,
  joinCloudProject,
  seedSupabaseDatabase,
  clearAndSeedSupabaseDatabase,
  syncTaskToSupabase,
  deleteTaskFromSupabase,
  syncDeliverableToSupabase,
  deleteDeliverableFromSupabase,
  syncPhaseToSupabase,
  deletePhaseFromSupabase,
  syncStandupToSupabase,
  syncRevisionToSupabase,
  deleteRevisionFromSupabase,
  syncMemberToSupabase,
  deleteMemberFromSupabase,
  syncProjectToSupabase,
  deleteProjectFromSupabase,
  syncChapterToSupabase
} from '../lib/supabaseSync';
import { parseGitHubRepoUrl, syncRepositoryData, DEFAULT_GITHUB_REPO_URL } from '../lib/github';
import { getPhaseSignOffGate, getTaskSubmissionGate } from '../lib/workflow';
import { showSubmissionGateToast } from '../lib/workflowToasts';
import { 
  notifyDiscordStandup, 
  notifyDiscordMilestone 
} from '../lib/discord';
import { uploadAttachmentFile, deleteAttachmentFile } from '../lib/supabaseStorage';
import { verifyInviteToken, InviteTokenPayload } from '../lib/tokenSecurity';

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
  isWorkspaceLoading: boolean;
  syncToSupabase: () => Promise<boolean>;

  // GitHub Integration States & Real-Time Auto-Tracker
  githubUser: GitHubUser | null;
  githubCommits: GitHubCommit[];
  githubPRs: GitHubPullRequest[];
  isGitHubConnected: boolean;
  isAutoTracking: boolean;
  isSyncingGitHub: boolean;
  lastGitHubSyncTime: Date | null;
  toggleAutoTracking: (enabled?: boolean) => void;

  // Live Online Presence
  onlineUsers: OnlinePresenceUser[];
  isMemberOnline: (memberId: string) => boolean;

  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
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
  syncGitHubData: (targetUrl?: string, options?: { silent?: boolean }) => Promise<boolean>;

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
  retryDiscordTicket: (taskId: string) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  claimTask: (taskId: string) => Promise<boolean>;
  releaseTask: (taskId: string) => boolean;
  resolveTask: (taskId: string, prUrl?: string, note?: string) => boolean;
  reviewTask: (taskId: string, note?: string) => boolean;
  approveTaskAdviserReview: (taskId: string, consultationNotes?: string) => boolean;
  closeTask: (taskId: string, reason?: string) => boolean;
  loadTemplateTickets: () => void;
  rebuildDatabase: () => void;
  toggleTaskAcceptanceCriteria: (taskId: string, criteriaId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => boolean;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Attachments & Deliverables Proofs
  uploadTaskAttachment: (taskId: string, file: File) => Promise<TaskAttachment | null>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  uploadDeliverableAttachment: (phaseId: number, deliverableId: string, file: File) => Promise<TaskAttachment | null>;
  removeDeliverableAttachment: (phaseId: number, deliverableId: string, attachmentId: string) => Promise<void>;
  
  getTaskProgressPercent: (task: Task) => number;

  // Milestone Actions
  toggleDeliverable: (phaseId: number, deliverableId: string) => void;
  signOffPhase: (phaseId: number, consultationDetails?: { consultationNotes?: string; proofUrl?: string; consultationDate?: string; adviserName?: string }) => void;
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
  
  // Project Settings & Multi-Project Engine
  projects: CapstoneProject[];
  activeProjectId: string;
  createProject: (payload: NewProjectPayload) => Promise<CapstoneProject>;
  joinProjectByInvite: (inviteCodeOrId: string, role?: Role, permission?: 'owner' | 'editor' | 'member' | 'adviser' | 'viewer', explicitTokenPayload?: InviteTokenPayload) => Promise<boolean>;
  switchProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  pauseProject: (projectId: string) => void;
  resumeProject: (projectId: string) => void;
  regenerateProjectKey: (projectId: string, keyType: 'anon' | 'service_role') => void;
  updateProjectInfo: (updates: Partial<CapstoneProject>) => void;
  resetData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'capstoneflow_state_v10';
const PROJECTS_REGISTRY_KEY = 'capstoneflow_projects_registry_v1';
const ACTIVE_PROJ_KEY = 'capstoneflow_active_project_id';
const REGISTRY_LEGACY_CLAIMED_KEY = 'capstoneflow_registry_legacy_claimed';
const DEMO_MODE_KEY = `${LOCAL_STORAGE_KEY}_demo_mode`;
const DEMO_MEMBER_ID = 'm_lead';

// Cache scoping: registries are per-account so a second signup on the same
// browser never inherits the first account's projects.
const getIdentityKey = (): string => {
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_user`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.login) return `gh_${String(parsed.login).toLowerCase()}`;
    }
  } catch {}
  if (localStorage.getItem(DEMO_MODE_KEY) === 'true') return 'demo';
  return 'guest';
};

const registryKeyFor = (identity: string): string => `${PROJECTS_REGISTRY_KEY}__${identity}`;
const activeProjectKeyFor = (identity: string): string => `${ACTIVE_PROJ_KEY}__${identity}`;

const makeStarterProject = (): CapstoneProject => ({
  ...initialProject,
  id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
  title: 'My Capstone Project',
  subtitle: 'Set up your milestone roadmap and invite your team to begin.',
  organization: '',
  region: '',
  status: 'active',
  userRole: 'owner',
  isOwner: true,
  memberCount: 1,
  inviteCode: `CF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  createdAt: new Date().toISOString()
});

const sanitizeProject = (p: CapstoneProject): CapstoneProject => ({
  ...p,
  title: cleanProjectTitle(p.title) || p.title
});

const loadRegistryForIdentity = (): CapstoneProject[] => {
  const identity = getIdentityKey();
  const scoped = localStorage.getItem(registryKeyFor(identity));
  if (scoped) {
    try {
      const parsed = JSON.parse(scoped);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeProject);
    } catch {}
  }

  // One-time legacy adoption: the first account on this browser claims the old
  // global registry. Every later account starts from a clean blank workspace.
  if (localStorage.getItem(REGISTRY_LEGACY_CLAIMED_KEY) !== 'true') {
    const legacy = localStorage.getItem(PROJECTS_REGISTRY_KEY);
    localStorage.setItem(REGISTRY_LEGACY_CLAIMED_KEY, 'true');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizeProject);
          localStorage.setItem(registryKeyFor(identity), JSON.stringify(sanitized));
          return sanitized;
        }
      } catch {}
    }
  }

  const starter = makeStarterProject();
  localStorage.setItem(registryKeyFor(identity), JSON.stringify([starter]));
  return [starter];
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-Project Registry Initialization (scoped to the signed-in account)
  const [projects, setProjects] = useState<CapstoneProject[]>(loadRegistryForIdentity);

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const identity = getIdentityKey();
    const saved = localStorage.getItem(activeProjectKeyFor(identity));
    if (saved && projects.some(p => p.id === saved)) return saved;
    return projects[0]?.id || '';
  });

  const activeProjectIdRef = useRef<string>(activeProjectId);

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  const activeProjectObj = projects.find(p => p.id === activeProjectId) || projects[0] || initialProject;

  const [project, setProject] = useState<CapstoneProject>(activeProjectObj);

  // Keep single active project state in sync with projects list
  useEffect(() => {
    const found = projects.find(p => p.id === activeProjectId) || projects[0];
    if (found) {
      setProject(found);
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
    localStorage.setItem(registryKeyFor(getIdentityKey()), JSON.stringify(projects));
    if (isSupabaseConfigured() && projects.length > 0) {
      projects.forEach(p => {
        void syncProjectToSupabase(p);
      });
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(activeProjectKeyFor(getIdentityKey()), activeProjectId);
  }, [activeProjectId]);

  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_members`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_members`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((m: TeamMember) => {
            if (m.githubUsername) {
              const isUnsplash = m.avatar && m.avatar.includes('unsplash.com');
              return {
                ...m,
                avatar: !isUnsplash && m.avatar ? m.avatar : `https://github.com/${m.githubUsername}.png`
              };
            }
            return m;
          });
          const hasOwner = list.some((m: TeamMember) => m.permissionLevel === 'owner' || m.id === 'usr_owner_main');
          if (!hasOwner) {
            return [initialMembers[0], ...list];
          }
          return list;
        }
      } catch (e) {
        // fallback
      }
    }
    return initialMembers;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_tasks`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_tasks`);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return initialTasks;
  });

  const [phases, setPhases] = useState<MilestonePhase[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_phases`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_phases`);
    return saved ? JSON.parse(saved) : initialPhases;
  });

  const [chapters, setChapters] = useState<ManuscriptChapter[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_chapters`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_chapters`);
    return saved ? JSON.parse(saved) : initialChapters;
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_revisions`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_revisions`);
    return saved ? JSON.parse(saved) : initialRevisions;
  });

  const [standups, setStandups] = useState<StandupEntry[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_standups`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_standups`);
    return saved ? JSON.parse(saved) : initialStandups;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`capstoneflow_proj_${activeProjectId}_activity`) || localStorage.getItem(`${LOCAL_STORAGE_KEY}_activity`);
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
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

  // Real-Time GitHub Auto-Tracking Telemetry States
  const [isAutoTracking, setIsAutoTracking] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auto_track_git`);
    return saved !== null ? saved === 'true' : true;
  });
  const [isSyncingGitHub, setIsSyncingGitHub] = useState<boolean>(false);
  const [lastGitHubSyncTime, setLastGitHubSyncTime] = useState<Date | null>(null);

  const toggleAutoTracking = (enabled?: boolean) => {
    setIsAutoTracking(prev => {
      const nextVal = enabled !== undefined ? enabled : !prev;
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auto_track_git`, String(nextVal));
      if (nextVal) {
        toast.success('GitHub Live Tracker Active', {
          description: 'Background scanning enabled. Remote commits & PRs will automatically sync.'
        });
      } else {
        toast.info('GitHub Auto-Tracking Paused', {
          description: 'Automatic background repo scan temporarily paused.'
        });
      }
      return nextVal;
    });
  };

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    if (saved) return saved;
    const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_user`);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.login) return `usr_github_${parsed.login.toLowerCase()}`;
      } catch {}
    }
    return initialMembers[0]?.id || 'usr_owner_main';
  });

  const [_isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem(DEMO_MODE_KEY) === 'true');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth`);
    const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY}_github_user`);
    const demoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';
    return savedAuth === 'true' && (Boolean(savedUser) || demoMode);
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`) || localStorage.getItem('capstoneflow_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'dark';
  });

  // Synchronize Theme with DOM & localStorage (Zero-Flicker)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, theme);
    localStorage.setItem('capstoneflow_theme', theme);
  }, [theme]);

  // Swap the workspace cache when the signed-in identity changes
  // (login, logout, or account switch). Each account only ever sees
  // its own scoped project registry.
  const identityRef = useRef<string>(getIdentityKey());
  useEffect(() => {
    const identity = getIdentityKey();
    if (identity === identityRef.current) return;
    identityRef.current = identity;

    const nextProjects = loadRegistryForIdentity();
    setProjects(nextProjects);

    const savedActive = localStorage.getItem(activeProjectKeyFor(identity));
    const nextActive = nextProjects.find(p => p.id === savedActive)?.id || nextProjects[0]?.id || '';
    if (nextActive) setActiveProjectId(nextActive);
  }, [githubUser, _isDemoMode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [onlineUsers, setOnlineUsers] = useState<OnlinePresenceUser[]>([]);

  // Supabase Initial Hydration & Granular Real-Time Sync with Presence
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsWorkspaceLoading(false);
      return;
    }

    let isMounted = true;
    setIsWorkspaceLoading(true);

    // Discover only projects this account is a roster member of
    fetchMembershipProjectsFromSupabase(githubUser?.login, githubUser?.email).then(cloudProjects => {
      if (!isMounted || !cloudProjects || cloudProjects.length === 0) return;
      setProjects(prev => {
        const map = new Map<string, CapstoneProject>();
        prev.forEach(p => map.set(p.id, p));
        cloudProjects.forEach(cp => {
          const existing = map.get(cp.id);
          map.set(cp.id, existing ? { ...existing, ...cp } : cp);
        });
        const merged = Array.from(map.values());
        try {
          localStorage.setItem(registryKeyFor(getIdentityKey()), JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }).catch(err => console.warn('[Supabase] Project discovery notice:', err));

    fetchAllDataFromSupabase(activeProjectIdRef.current).then(async data => {
      if (!isMounted) return;

      // Roster gate: a cloud project may only be adopted by accounts on its
      // team_members roster. Prevents cross-account leaks while RLS is open.
      // (joinCloudProject inserts the roster row BEFORE hydration runs, so
      // legitimately invited accounts pass.)
      const identityLogin = githubUser?.login?.toLowerCase();
      const isDemoIdentity = getIdentityKey() === 'demo';
      if (data?.project && data.members && data.members.length > 0 && identityLogin && !isDemoIdentity) {
        const onRoster = data.members.some(member => {
          const memberLogin = member.githubUsername?.toLowerCase();
          const memberEmail = member.email?.toLowerCase();
          return (
            (memberLogin && memberLogin === identityLogin) ||
            (memberEmail && githubUser?.email && memberEmail === githubUser.email.toLowerCase())
          );
        });
        if (!onRoster) {
          console.warn('[security] Hydration blocked: current account is not a member of this project.');
          setIsDatabaseConnected(true);
          return;
        }
      }

      if (data && data.project && data.project.id === activeProjectIdRef.current) {
        setProject(data.project);
        if (data.members && data.members.length > 0) setMembers(data.members);
        if (data.phases && data.phases.length > 0) setPhases(data.phases);
        if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
        if (data.standups && data.standups.length > 0) setStandups(data.standups);
        if (data.revisions && data.revisions.length > 0) setRevisions(data.revisions);
        if (data.chapters && data.chapters.length > 0) setChapters(data.chapters);
        if (data.activityLogs && data.activityLogs.length > 0) setActivityLogs(data.activityLogs);
      } else if (!data || data.project === undefined) {
        // Connected to Supabase, but this workspace has no cloud record yet:
        // auto-seed from local state so it is live in Supabase.
        await seedSupabaseDatabase({
          project,
          members,
          phases,
          tasks,
          standups,
          revisions,
          chapters
        });
      }
      setIsDatabaseConnected(true);
    }).catch(err => {
      console.warn('Supabase hydration check failed:', err);
      if (isMounted) setIsDatabaseConnected(isSupabaseConfigured());
    }).finally(() => {
      if (isMounted) setIsWorkspaceLoading(false);
    });

    let refreshTimer: number | undefined;
    let refreshInFlight = false;
    let refreshQueued = false;

    const refreshWorkspace = async () => {
      if (refreshInFlight) {
        refreshQueued = true;
        return;
      }
      refreshInFlight = true;
      try {
        const data = await fetchAllDataFromSupabase(activeProjectIdRef.current);
        if (!isMounted || !data || !data.project) return;
        // Prevent cross-project pollution from previous projects.
        if (data.project.id === activeProjectIdRef.current) {
          setProject(data.project);
          if (data.members && data.members.length > 0) setMembers(data.members);
          if (data.phases) setPhases(data.phases);
          if (data.tasks) setTasks(data.tasks);
          if (data.standups) setStandups(data.standups);
          if (data.revisions) setRevisions(data.revisions);
          if (data.chapters && data.chapters.length > 0) setChapters(data.chapters);
        }
      } finally {
        refreshInFlight = false;
        if (refreshQueued) {
          refreshQueued = false;
          scheduleWorkspaceRefresh();
        }
      }
    };

    const scheduleWorkspaceRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void refreshWorkspace(), 250);
    };

    const currentMemberObj = members.find(m => m.id === currentMemberId);
    const currentUserPresence = currentMemberObj ? {
      memberId: currentMemberObj.id,
      name: currentMemberObj.name,
      avatar: currentMemberObj.avatar || `https://github.com/${currentMemberObj.githubUsername || 'ghost'}.png`,
      githubUsername: githubUser?.login || currentMemberObj.githubUsername,
      roleTitle: currentMemberObj.roleTitle
    } : null;

    const unsubscribeHub = realtimeHub.subscribe({
      projectId: activeProjectIdRef.current,
      currentUser: currentUserPresence,
      onTaskChange: (eventType, taskOrId) => {
        if (!isMounted) return;
        if (eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== taskOrId.id));
        } else {
          const updatedTask = taskOrId as Task;
          setTasks(prev => {
            const index = prev.findIndex(t => t.id === updatedTask.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = {
                ...updatedTask,
                subtasks: (updatedTask.subtasks && updatedTask.subtasks.length > 0)
                  ? updatedTask.subtasks
                  : prev[index].subtasks || []
              };
              return updated;
            }
            return [updatedTask, ...prev];
          });
        }
      },
      onSubtaskChange: (eventType, subtaskOrId) => {
        if (!isMounted) return;
        setTasks(prev => prev.map(task => {
          if (eventType === 'DELETE') {
            if (subtaskOrId.taskId && task.id !== subtaskOrId.taskId) return task;
            return {
              ...task,
              subtasks: (task.subtasks || []).filter(st => st.id !== subtaskOrId.id)
            };
          } else {
            const st = subtaskOrId as { id: string; taskId: string; title: string; completed: boolean };
            if (task.id !== st.taskId) return task;
            const existing = task.subtasks || [];
            const idx = existing.findIndex(item => item.id === st.id);
            const updatedSubtasks = idx >= 0
              ? existing.map(item => item.id === st.id ? { id: st.id, title: st.title, completed: st.completed } : item)
              : [...existing, { id: st.id, title: st.title, completed: st.completed }];
            return {
              ...task,
              subtasks: updatedSubtasks
            };
          }
        }));
      },
      onStandupChange: (eventType, standupOrId) => {
        if (!isMounted) return;
        if (eventType === 'DELETE') {
          setStandups(prev => prev.filter(s => s.id !== standupOrId.id));
        } else {
          const updatedStandup = standupOrId as StandupEntry;
          setStandups(prev => {
            const index = prev.findIndex(s => s.id === updatedStandup.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = updatedStandup;
              return updated;
            }
            return [updatedStandup, ...prev];
          });
        }
      },
      onRevisionChange: (eventType, revOrId) => {
        if (!isMounted) return;
        if (eventType === 'DELETE') {
          setRevisions(prev => prev.filter(r => r.id !== revOrId.id));
        } else {
          const updatedRevision = revOrId as RevisionItem;
          setRevisions(prev => {
            const index = prev.findIndex(r => r.id === updatedRevision.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = updatedRevision;
              return updated;
            }
            return [updatedRevision, ...prev];
          });
        }
      },
      onPresenceChange: (users) => {
        if (isMounted) setOnlineUsers(users);
      },
      onStructuralChange: () => {
        scheduleWorkspaceRefresh();
      }
    });

    return () => {
      isMounted = false;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      unsubscribeHub();
    };
  }, [currentMemberId, githubUser, activeProjectId]);

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

  // Sync to local storage & per-project scope
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_project`, JSON.stringify(project));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_project`, JSON.stringify(project));
  }, [project, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_members`, JSON.stringify(members));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_members`, JSON.stringify(members));
  }, [members, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_tasks`, JSON.stringify(tasks));
  }, [tasks, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_phases`, JSON.stringify(phases));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_phases`, JSON.stringify(phases));
  }, [phases, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_chapters`, JSON.stringify(chapters));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_chapters`, JSON.stringify(chapters));
  }, [chapters, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_revisions`, JSON.stringify(revisions));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_revisions`, JSON.stringify(revisions));
  }, [revisions, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_standups`, JSON.stringify(standups));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_standups`, JSON.stringify(standups));
  }, [standups, activeProjectId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activity`, JSON.stringify(activityLogs));
    localStorage.setItem(`capstoneflow_proj_${activeProjectId}_activity`, JSON.stringify(activityLogs));
  }, [activityLogs, activeProjectId]);

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

  // Dynamically calculate phase progress and overall readiness reflecting real tasks
  useEffect(() => {
    // 1. Compute each phase's progress strictly based on real assigned tasks & deliverables
    setPhases(prevPhases => {
      let changed = false;
      const updated = prevPhases.map(phase => {
        const result = computePhaseProgress(phase, tasks, project.currentPhaseId);

        if (
          phase.progressPercentage !== result.progressPercentage ||
          phase.status !== result.status ||
          phase.adviserSignOff !== result.adviserSignOff ||
          phase.signedOffDate !== result.signedOffDate ||
          phase.signedOffBy !== result.signedOffBy
        ) {
          changed = true;
          return {
            ...phase,
            ...result
          };
        }
        return phase;
      });

      return changed ? updated : prevPhases;
    });

    // 2. Compute overall project readiness
    const calculatedOverall = computeOverallReadiness(tasks, phases, revisions);

    setProject(prev => {
      if (prev.overallProgress !== calculatedOverall) {
        return { ...prev, overallProgress: calculatedOverall };
      }
      return prev;
    });
  }, [tasks, phases, revisions, project.currentPhaseId]);

  // Periodic & visibility-based background Cloud reconciliation (100% automated)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Periodic auto-sync every 30 seconds
    const interval = setInterval(() => {
      void syncToSupabaseSilent();
    }, 30000);

    // Auto-sync on window focus / tab visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncToSupabaseSilent();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [project, members, phases, tasks, standups, revisions]);

  // Automatic GitHub OAuth Code Detection & Exchange
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const returnedState = urlParams.get('state');
    if (returnedState) sessionStorage.setItem('capstone_oauth_state', returnedState);
    if (code) {
      // Exchange code via backend proxy
      fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code, state: sessionStorage.getItem('capstone_oauth_state') || undefined })
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
            
            // Persist authenticated user session
            setIsDemoMode(false);
            sessionStorage.removeItem('capstone_oauth_state');
            localStorage.removeItem(DEMO_MODE_KEY);
            setGithubUser(userData);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_github_user`, JSON.stringify(userData));
            setIsAuthenticated(true);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, 'true');
            
            // Link or create user persona in workspace roster
            setMembers(prev => {
              const cleanLogin = userData.login.toLowerCase();
              const matched = prev.find(m => 
                (m.githubUsername && m.githubUsername.toLowerCase() === cleanLogin) ||
                m.id.toLowerCase() === cleanLogin ||
                m.id === `m_${cleanLogin}`
              );

              if (matched) {
                setCurrentMemberId(matched.id);
                localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, matched.id);
                const updated = prev.map(m => m.id === matched.id ? { 
                  ...m, 
                  name: userData.name || userData.login, 
                  avatar: userData.avatar_url || `https://github.com/${userData.login}.png`,
                  githubUsername: userData.login,
                  email: userData.email || m.email
                } : m);
                syncMemberToSupabase(updated.find(m => m.id === matched.id)!);
                return updated;
              }

              // Dynamic creation for new authenticated GitHub student
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
              localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, newMemberId);
              syncMemberToSupabase(newMember);

              // Filter out template mock placeholders if present
              const filteredPrev = prev.filter(m => m.id !== DEMO_MEMBER_ID && (m.role === 'adviser' || (m.githubUsername && m.githubUsername.toLowerCase() !== 'template')));
              return [...filteredPrev, newMember];
            });

            // Clean up query param and redirect back to clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            logActivity('authenticated via GitHub OAuth 2.0', `@${userData.login}`);
            toast.success(`Welcome, ${userData.name || userData.login}!`, {
              description: `Signed in as @${userData.login} • Workflow System Active`
            });
          } else {
            console.error('GitHub OAuth Exchange Failed:', data);
            const errDetail = data?.error_description || data?.error || 'Invalid or expired GitHub authorization code.';
            toast.error('GitHub OAuth Authentication Failed', {
              description: errDetail
            });
            window.dispatchEvent(new CustomEvent('capstone:oauth_error', { detail: { message: errDetail } }));
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => {
          console.error('GitHub OAuth Exchange Error:', err);
          const networkErr = 'Could not connect to authentication proxy server. Please check your connection or continue as guest.';
          toast.error('GitHub Authentication Error', {
            description: networkErr
          });
          window.dispatchEvent(new CustomEvent('capstone:oauth_error', { detail: { message: networkErr } }));
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  const currentMember = (members && members.length > 0 
    ? members.find(m => m.id === currentMemberId) || members.find(m => m.permissionLevel === 'owner') || members[0] 
    : null) || initialMembers[0];
  const currentRole = currentMember?.role || 'developer';

  const isOwner = currentMember?.permissionLevel === 'owner';
  const isAdviser = currentMember?.permissionLevel === 'adviser';
  const isMember = currentMember?.permissionLevel === 'member';

  const canManageSettings = isOwner;
  const canDeleteTasks = isOwner;
  const canSignOffMilestones = isOwner || isAdviser;

  // Cross-Tab and Local Real-Time Presence Synchronization
  useEffect(() => {
    let presenceChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        presenceChannel = new BroadcastChannel('capstoneflow_presence_v1');
      }
    } catch {}

    const broadcastHeartbeat = () => {
      const activeObj: OnlinePresenceUser = {
        memberId: currentMember.id,
        name: currentMember.name,
        avatar: currentMember.avatar || (currentMember.githubUsername ? `https://github.com/${currentMember.githubUsername}.png` : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentMember.name)}&background=10b981&color=fff&bold=true`),
        githubUsername: currentMember.githubUsername,
        roleTitle: currentMember.roleTitle,
        onlineAt: new Date().toISOString()
      };

      if (presenceChannel) {
        presenceChannel.postMessage({ type: 'heartbeat', user: activeObj });
      }

      setOnlineUsers(prev => {
        const now = Date.now();
        const activeOnly = prev.filter(u => {
          if (u.memberId === currentMember.id) return false;
          if (!u.onlineAt) return true;
          return now - new Date(u.onlineAt).getTime() < 20000;
        });
        return [...activeOnly, activeObj];
      });
    };

    if (presenceChannel) {
      presenceChannel.onmessage = (event) => {
        const { type, user, memberId } = event.data || {};
        if (type === 'heartbeat' && user && user.memberId) {
          setOnlineUsers(prev => {
            const filtered = prev.filter(u => u.memberId !== user.memberId);
            return [...filtered, user];
          });
        } else if (type === 'leave' && memberId) {
          setOnlineUsers(prev => prev.filter(u => u.memberId !== memberId));
        }
      };
    }

    broadcastHeartbeat();
    const interval = setInterval(broadcastHeartbeat, 5000);

    const handleUnload = () => {
      if (presenceChannel) {
        presenceChannel.postMessage({ type: 'leave', memberId: currentMember.id });
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      if (presenceChannel) {
        presenceChannel.close();
      }
    };
  }, [currentMember]);

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

  const toggleTheme = (event?: React.MouseEvent | MouseEvent) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    const isAppearanceTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(async () => {
      setTheme(nextTheme);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      // Emil Kowalski Ultra-Smooth Organic Wave:
      // 720ms duration + soft quintic deceleration curve + gentle opacity counter-blend to eliminate harsh flashing
      document.documentElement.animate(
        {
          clipPath: clipPath,
          opacity: [0.92, 1]
        },
        {
          duration: 720,
          easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );

      document.documentElement.animate(
        {
          opacity: [1, 0.92]
        },
        {
          duration: 720,
          easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
          pseudoElement: '::view-transition-old(root)'
        }
      );
    });
  };

  const loginUser = (memberId: string) => {
    if (memberId === DEMO_MEMBER_ID) {
      const demoMember: TeamMember = {
        ...initialMembers[0],
        id: DEMO_MEMBER_ID,
        name: 'Sample Workspace Lead',
        email: 'sample@capstoneflow.local',
        githubUsername: undefined,
        avatar: 'https://ui-avatars.com/api/?name=Sample+Workspace+Lead&background=6366f1&color=fff&bold=true'
      };

      setIsDemoMode(true);
      setIsAuthenticated(true);
      setGithubUser(null);
      setCurrentMemberId(DEMO_MEMBER_ID);
      setMembers(prev => [demoMember, ...prev.filter(member => member.id === 'm_adviser')]);
      localStorage.setItem(DEMO_MODE_KEY, 'true');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_github_user`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, DEMO_MEMBER_ID);
      localStorage.setItem('capstone_active_view', 'projects');
      window.location.hash = '#projects';
      toast.success('Sample Workspace Ready', {
        description: 'You are browsing a demo workspace. Your GitHub account is not connected.'
      });
      return;
    }

    setIsDemoMode(false);
    localStorage.removeItem(DEMO_MODE_KEY);
    setCurrentMemberId(memberId);
    setIsAuthenticated(true);
    const target = members.find(m => m.id === memberId) || members[0];
    const username = target?.githubUsername || (target?.name || 'lead').toLowerCase().replace(/\s+/g, '_');
    const gUser: GitHubUser = {
      id: username,
      login: username,
      name: target?.name || 'Capstone Lead',
      avatar_url: target?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.name || 'User')}&background=6366f1&color=fff&bold=true`,
      email: target?.email || `${username}@university.edu`,
      bio: target?.roleTitle || 'Capstone Developer',
      html_url: `https://github.com/${username}`,
      connectedAt: new Date().toISOString().split('T')[0]
    };
    setGithubUser(gUser);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_github_user`, JSON.stringify(gUser));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, memberId);
      localStorage.setItem('capstone_active_view', 'projects');
      window.location.hash = '#projects';
    } catch {}
    logActivity('authenticated into workspace', target?.name || 'Member');
  };

  const signOut = () => {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setGithubUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_github_user`);
    localStorage.removeItem(DEMO_MODE_KEY);
    try {
      localStorage.setItem('capstone_active_view', 'projects');
      window.location.hash = '#projects';
    } catch {}
    logActivity('signed out of workspace', currentMember.name);
    toast.info('Signed Out', {
      description: 'You have been signed out of the workspace.'
    });
  };

  const switchMember = (memberId: string) => {
    setCurrentMemberId(memberId);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, memberId);
    const target = members.find(m => m.id === memberId);
    if (target) {
      toast.info(`Active Persona: ${target.name}`, {
        description: `Switched to ${target.roleTitle} (${target.permissionLevel.toUpperCase()})`
      });
      if (target.githubUsername) {
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
    if (memberId === currentMemberId || memberId === 'm_adviser') {
      toast.error('Cannot Remove Member', {
        description: 'You cannot remove your active session or the faculty adviser.'
      });
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== memberId));
    deleteMemberFromSupabase(memberId);
    logActivity('removed member from roster', memberId);
    toast.success('Member Removed', {
      description: `Member removed from roster.`
    });
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

  const githubCommitsRef = useRef(githubCommits);
  useEffect(() => {
    githubCommitsRef.current = githubCommits;
  }, [githubCommits]);

  const syncGitHubData = async (targetUrl?: string, options?: { silent?: boolean }): Promise<boolean> => {
    const isSilent = options?.silent ?? false;
    const repoTarget = targetUrl || project.githubRepoUrl || DEFAULT_GITHUB_REPO_URL;
    const parsed = parseGitHubRepoUrl(repoTarget);
    if (!parsed) {
      if (!isSilent) {
        toast.error('Invalid Repository Target', {
          description: 'Please enter a valid GitHub repository (e.g. owner/repo or https://github.com/owner/repo)'
        });
      }
      return false;
    }

    setIsSyncingGitHub(true);
    try {
      const result = await syncRepositoryData(parsed.owner, parsed.repo);

      if (result.success) {
        setLastGitHubSyncTime(new Date());

        const prevCommits = githubCommitsRef.current;
        const prevTopSha = prevCommits[0]?.sha;
        const newTopSha = result.commits[0]?.sha;
        const hasNewChanges = prevTopSha && newTopSha && prevTopSha !== newTopSha;
        const newCommitCount = hasNewChanges
          ? (result.commits.findIndex(c => c.sha === prevTopSha) !== -1
              ? result.commits.findIndex(c => c.sha === prevTopSha)
              : result.commits.length)
          : 0;

        setGithubCommits(result.commits);
        setGithubPRs(result.pullRequests);

        // Smart Task-Commit & PR Auto Linking and Workflow Gate Advancement
        if (result.pullRequests.length > 0 || result.commits.length > 0) {
          setTasks(prevTasks => {
            let changed = false;
            const updated = prevTasks.map(t => {
              // Check PR match first
              const prMatch = result.pullRequests.find(pr =>
                pr.title.toLowerCase().includes(t.id.toLowerCase()) ||
                pr.title.toLowerCase().includes(t.title.toLowerCase()) ||
                (t.githubPrNumber && pr.number === t.githubPrNumber)
              );

              if (prMatch) {
                if (prMatch.state === 'merged' && t.status !== 'done') {
                  changed = true;
                  return {
                    ...t,
                    status: 'done' as const,
                    prUrl: prMatch.html_url,
                    githubPrNumber: prMatch.number,
                    resolvedAt: new Date().toISOString().split('T')[0],
                    resolvedByUsername: prMatch.author
                  };
                } else if (prMatch.state === 'open' && (t.status === 'todo' || t.status === 'in_progress')) {
                  changed = true;
                  return {
                    ...t,
                    status: 'peer_review' as const,
                    prUrl: prMatch.html_url,
                    githubPrNumber: prMatch.number
                  };
                }
              }

              // Check Commit match
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

        if (isSilent) {
          if (hasNewChanges && newCommitCount > 0) {
            logActivity('auto-detected new git commits', `${newCommitCount} new commit(s) in ${parsed.owner}/${parsed.repo}`);
            toast.success('Live Git Update Detected', {
              description: `Auto-pulled ${newCommitCount} new commit(s) from ${parsed.owner}/${parsed.repo}: "${result.commits[0]?.message}"`
            });
          }
        } else {
          logActivity('synced GitHub repository feed', `${parsed.owner}/${parsed.repo}`);
          toast.success('GitHub Synced', {
            description: `Loaded ${result.commits.length} commits & ${result.pullRequests.length} PRs from ${parsed.owner}/${parsed.repo}`
          });
        }
        return true;
      } else {
        if (!isSilent) {
          logActivity('GitHub sync issue', result.errorMessage || 'Sync failed');
          toast.error('GitHub Sync Issue', {
            description: result.errorMessage || 'Could not fetch repository activity'
          });
        }
        return false;
      }
    } catch (e: any) {
      console.warn('syncGitHubData error:', e);
      if (!isSilent) {
        toast.error('GitHub Sync Failed', {
          description: e.message || 'Network error while contacting GitHub API.'
        });
      }
      return false;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Real-Time GitHub Continuous Auto-Tracker Hook
  useEffect(() => {
    if (!isAutoTracking) return;

    const repoTarget = project.githubRepoUrl || DEFAULT_GITHUB_REPO_URL;
    if (!parseGitHubRepoUrl(repoTarget)) return;

    // Background scan every 25 seconds
    const SCAN_INTERVAL_MS = 25000;
    const interval = setInterval(() => {
      syncGitHubData(undefined, { silent: true });
    }, SCAN_INTERVAL_MS);

    // Instant scan when user switches focus to CapstoneFlow window
    const handleFocus = () => {
      syncGitHubData(undefined, { silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncGitHubData(undefined, { silent: true });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAutoTracking, project.githubRepoUrl]);

  // Task Handlers
  const syncTaskStateToDiscord = (task: Task, actor: string) => {
    if (!isDiscordTicketSyncEnabled() || !task.discordTicket?.channelId) return;

    void syncDiscordTicketStatus(task, actor).then(result => {
      if (!result) return;
      const syncedTask: Task = {
        ...task,
        discordTicket: {
          ...task.discordTicket!,
          syncStatus: 'synced',
          lastSyncedAt: result.lastSyncedAt,
          lastError: undefined
        }
      };
      setTasks(prev => prev.map(item => item.id === task.id ? syncedTask : item));
      void syncTaskToSupabase(syncedTask);
    }).catch(error => {
      const failedTask: Task = {
        ...task,
        discordTicket: {
          ...task.discordTicket!,
          syncStatus: 'error',
          lastError: error instanceof Error ? error.message : 'Discord status sync failed.'
        }
      };
      setTasks(prev => prev.map(item => item.id === task.id ? failedTask : item));
      void syncTaskToSupabase(failedTask);
      console.warn('Discord background status sync offline:', error);
    });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'loggedHours'>) => {
    const discordSyncEnabled = isDiscordTicketSyncEnabled();
    const pendingDiscordTicket = discordSyncEnabled
      ? {
          guildId: '',
          channelId: '',
          channelUrl: '',
          syncStatus: 'pending' as const
        }
      : undefined;
    const newTask: Task = {
      ...taskData,
      ...(pendingDiscordTicket ? { discordTicket: pendingDiscordTicket } : {}),
      status: taskData.status === 'backlog' ? 'backlog' : 'todo',
      phaseId: taskData.phaseId || project.currentPhaseId,
      id: `task-${Date.now()}`,
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    void syncTaskToSupabase(newTask);
    if (discordSyncEnabled) {
      void createDiscordTicket(newTask).then(discordTicket => {
        if (!discordTicket) return;

        const linkedTask = { ...newTask, discordTicket };
        setTasks(prev => prev.map(task => task.id === newTask.id ? linkedTask : task));
        void syncTaskToSupabase(linkedTask);
        toast.success('Discord ticket created', {
          description: 'The website task is now linked to its Discord ticket channel.'
        });
      }).catch(error => {
        const failedDiscordTicket = {
          ...(pendingDiscordTicket || {
            guildId: '',
            channelId: '',
            channelUrl: ''
          }),
          syncStatus: 'error' as const,
          lastError: error instanceof Error ? error.message : 'Discord ticket creation failed.'
        };
        const failedTask = { ...newTask, discordTicket: failedDiscordTicket };
        setTasks(prev => prev.map(task => task.id === newTask.id ? failedTask : task));
        void syncTaskToSupabase(failedTask);
        console.warn('Discord background ticket creation offline:', error);
      });
    }
    logActivity('created a new task', newTask.title);
    toast.success(`Task created: "${newTask.title}"`);
  };

  const retryDiscordTicket = async (taskId: string): Promise<boolean> => {
    const target = tasks.find(task => task.id === taskId);
    if (!target || !isDiscordTicketSyncEnabled()) return false;

    const pendingLink = {
      ...(target.discordTicket || { guildId: '', channelId: '', channelUrl: '' }),
      syncStatus: 'pending' as const,
      lastError: undefined
    };
    const pendingTask = { ...target, discordTicket: pendingLink };
    setTasks(prev => prev.map(task => task.id === taskId ? pendingTask : task));
    void syncTaskToSupabase(pendingTask);

    try {
      const discordTicket = await createDiscordTicket(target);
      if (!discordTicket) return false;
      const linkedTask = { ...target, discordTicket };
      setTasks(prev => prev.map(task => task.id === taskId ? linkedTask : task));
      void syncTaskToSupabase(linkedTask);
      toast.success('Discord ticket linked', {
        description: 'The task is connected to its Discord ticket channel.'
      });
      return true;
    } catch (error) {
      const failedTask = {
        ...target,
        discordTicket: {
          ...pendingLink,
          syncStatus: 'error' as const,
          lastError: error instanceof Error ? error.message : 'Discord ticket creation failed.'
        }
      };
      setTasks(prev => prev.map(task => task.id === taskId ? failedTask : task));
      void syncTaskToSupabase(failedTask);
      toast.error('Discord ticket sync failed', {
        description: 'Check the bot configuration and try the link again.'
      });
      return false;
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const target = tasks.find(task => task.id === taskId);
    if (!target) return;

    const { status: requestedStatus, ...safeUpdates } = updates;
    if (requestedStatus && requestedStatus !== target.status) {
      toast.info('Workflow stage is protected', {
        description: 'Use the ticket actions to move work through review and adviser approval.'
      });
    }

    const updated: Task = {
      ...target,
      ...safeUpdates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
    logActivity('updated task details', updated.title || 'a task');
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

  const claimTask = async (taskId: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    if (currentMember.role === 'adviser' || currentMember.role === 'coordinator') {
      toast.error('This role cannot claim delivery work', {
        description: 'Advisers and coordinators approve or oversee work rather than own implementation tasks.'
      });
      return false;
    }

    if (target.assigneeId && target.assigneeId !== currentMember.id) {
      toast.warning('Ticket already claimed', {
        description: 'Only the current owner or project lead can release this task.'
      });
      return false;
    }

    if (target.phaseId !== project.currentPhaseId) {
      toast.info('Activate the task phase first', {
        description: 'Tasks can be claimed when their milestone is the active phase.'
      });
      return false;
    }

    if (target.status !== 'backlog' && target.status !== 'todo') {
      toast.info('This task is already in the delivery workflow.');
      return false;
    }

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

    const updated: Task = {
      ...target,
      assigneeId: currentMember.id,
      status: 'in_progress',
      claimedAt,
      claimedByUsername: claimerHandle,
      ticketEvents: target.ticketEvents ? [newEvent, ...target.ticketEvents] : [newEvent],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    // Optimistic apply — reverted below if the atomic claim loses the race.
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));

    // Atomic claim: the conditional update (claim slot still empty AND task
    // still open) makes the DATABASE pick the single winner when two teammates
    // click claim at the same moment. The loser's UPDATE matches 0 rows.
    let wonClaim = true;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            status: 'in_progress',
            assignee_id: currentMember.id,
            claimed_at: claimedAt,
            claimed_by_username: claimerHandle,
            ticket_events: updated.ticketEvents || [],
            updated_at: claimedAt
          })
          .eq('id', taskId)
          .is('claimed_by_username', null)
          .in('status', ['backlog', 'todo'])
          .select('id');

        if (error) {
          console.warn('[claim] atomic claim error (keeping optimistic claim):', error);
        } else {
          wonClaim = Array.isArray(data) && data.length > 0;
        }
      } catch (e) {
        console.warn('[claim] atomic claim failed (keeping optimistic claim):', e);
      }
    }

    if (!wonClaim) {
      // Lost the race: revert to the open state. Realtime CDC lands the
      // winner's claimed row momentarily.
      setTasks(prev => prev.map(task => task.id === taskId ? target : task));
      toast.warning('Ticket just got claimed', {
        description: 'Someone on the team claimed this ticket first. The board will update in a moment.'
      });
      return false;
    }

    logActivity('claimed ownership of task (/claim)', `[CLAIMED][${claimerHandle}] ${target.title}`);
    syncTaskStateToDiscord(updated, claimerHandle);
    toast.success('Ticket Claimed', {
      description: `Assigned to ${claimerHandle}`
    });
    return true;
  };

  const releaseTask = (taskId: string): boolean => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    if (target.assigneeId !== currentMember.id && currentMember.role !== 'leader') {
      toast.error('Only the task owner or project lead can release this ticket.');
      return false;
    }

    if (target.status !== 'in_progress') {
      toast.info('Review-stage work cannot be released', {
        description: 'Ask the reviewer to send it back through the ticket instead.'
      });
      return false;
    }

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

    const updated: Task = {
      ...target,
      status: 'todo',
      assigneeId: '',
      claimedAt: undefined,
      claimedByUsername: undefined,
      ticketEvents: target.ticketEvents ? [newEvent, ...target.ticketEvents] : [newEvent],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
    syncTaskStateToDiscord(updated, userHandle);
    logActivity('unclaimed ticket back to open pool (/unclaim)', `[OPEN] ${target.title}`);
    toast.info('Ticket Released', {
      description: `"${target.title}" returned to open pool`
    });
    return true;
  };

  const resolveTask = (taskId: string, prUrl?: string, note?: string): boolean => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    const isOwner = target.assigneeId === currentMember.id;
    const isPM = currentMember.role === 'leader';
    if (!isOwner && !isPM) {
      toast.error('Access Denied', { description: 'Only the ticket claimer or Project Manager can submit for review.' });
      return false;
    }

    if (target.status !== 'in_progress') {
      toast.info('Start the task before submitting it for review.');
      return false;
    }

    if (target.phaseId !== project.currentPhaseId) {
      toast.info('This task belongs to an inactive phase', {
        description: 'Finish the active phase workflow before submitting later-phase work.'
      });
      return false;
    }

    const submissionGate = getTaskSubmissionGate(target, prUrl);
    if (!submissionGate.isReady) {
      showSubmissionGateToast(submissionGate.missing);
      return false;
    }

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    const newEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'resolved',
      username: userHandle,
      timestamp,
      oldStatus: target.assigneeId ? `[CLAIMED][${target.claimedByUsername || userHandle}]` : '[OPEN]',
      newStatus: `[PEER-REVIEW][${userHandle}]`,
      prUrl,
      note
    };

    const updated: Task = {
      ...target,
      status: 'peer_review',
      prUrl: prUrl || target.prUrl,
      resolvedAt: timestamp,
      resolvedByUsername: userHandle,
      ticketEvents: target.ticketEvents ? [newEvent, ...target.ticketEvents] : [newEvent],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
    logActivity('submitted ticket for peer review', `[PEER-REVIEW] ${target.title}`);
    syncTaskStateToDiscord(updated, userHandle);
    toast.success('Ticket ready for peer review', {
      description: prUrl ? `Linked evidence: ${prUrl}` : 'Evidence and acceptance criteria are ready for verification.'
    });
    return true;
  };

  const reviewTask = (taskId: string, note?: string): boolean => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    if (target.status !== 'peer_review' && target.status !== 'adviser_review') {
      toast.info('This task is not waiting for review.');
      return false;
    }

    const timestamp = new Date().toISOString();
    const userHandle = githubUser ? `@${githubUser.login}` : `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`;

    if (target.status === 'peer_review') {
      const canPeerReview = currentMember.role === 'qa' || currentMember.role === 'leader';
      if (!canPeerReview) {
        toast.error('Peer review requires QA or project-lead verification.');
        return false;
      }

      if (target.assigneeId === currentMember.id) {
        toast.error('Independent review required', {
          description: 'The task owner cannot approve their own submission.'
        });
        return false;
      }

      const peerReviewEvent: TicketEvent = {
        id: `evt-${Date.now()}`,
        type: 'peer_reviewed',
        username: userHandle,
        timestamp,
        oldStatus: '[PEER-REVIEW]',
        newStatus: `[ADVISER-REVIEW][${userHandle}]`,
        note
      };
      const updated: Task = {
        ...target,
        status: 'adviser_review',
        peerReviewedAt: timestamp,
        peerReviewedByUsername: userHandle,
        reviewedAt: timestamp,
        reviewedByUsername: userHandle,
        ticketEvents: target.ticketEvents ? [peerReviewEvent, ...target.ticketEvents] : [peerReviewEvent],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
      void syncTaskToSupabase(updated);
      logActivity('completed peer review', `[ADVISER-REVIEW] ${target.title}`);
      syncTaskStateToDiscord(updated, userHandle);
      toast.success('Peer review complete', {
        description: 'The task is now waiting for faculty adviser approval.'
      });
      return true;
    }

    const isLeadOrManager = currentMember.role === 'leader' || currentMember.permissionLevel === 'owner' || isOwner;
    const isAdviserRole = currentMember.role === 'adviser';
    if (!isAdviserRole && !isLeadOrManager) {
      toast.error('Adviser consultation verification required', {
        description: 'Only the Project Leader, Manager, or Faculty Adviser can record final task approval.'
      });
      return false;
    }

    const adviserName = project.adviser?.name || 'Faculty Adviser';
    const approvalNote = note || (isAdviserRole ? 'Directly approved by faculty adviser.' : `Verified via consultation with ${adviserName}.`);
    const reviewerHandle = isAdviserRole ? userHandle : `${userHandle} (per ${adviserName})`;

    const adviserApprovalEvent: TicketEvent = {
      id: `evt-${Date.now()}`,
      type: 'adviser_approved',
      username: reviewerHandle,
      timestamp,
      oldStatus: '[ADVISER-REVIEW]',
      newStatus: `[ADVISER-APPROVED][${reviewerHandle}]`,
      note: approvalNote
    };
    const updated: Task = {
      ...target,
      status: 'done',
      adviserReviewedAt: timestamp,
      adviserReviewedByUsername: reviewerHandle,
      reviewedAt: timestamp,
      reviewedByUsername: reviewerHandle,
      ticketEvents: target.ticketEvents ? [adviserApprovalEvent, ...target.ticketEvents] : [adviserApprovalEvent],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
    logActivity('recorded adviser consultation approval for task', `[DONE] ${target.title}`);
    syncTaskStateToDiscord(updated, userHandle);
    toast.success('Adviser Approval Verified', {
      description: isAdviserRole ? 'The task is approved and marked done.' : `Task verified per consultation with ${adviserName} and marked done.`
    });
    return true;
  };

  const approveTaskAdviserReview = (taskId: string, consultationNotes?: string): boolean => {
    return reviewTask(taskId, consultationNotes);
  };

  const closeTask = (_taskId: string, _reason?: string): boolean => {
    toast.info('Task completion is protected', {
      description: 'Complete peer review and adviser approval instead of closing a task directly.'
    });
    return false;
  };

  const loadTemplateTickets = () => {
    setTasks(templateCapstoneTickets);
    logActivity('reloaded template capstone tickets (/load-tickets)', 'Task Matrix');
    toast.success('📥 Loaded institutional capstone tickets into matrix!');
  };

  const rebuildDatabase = () => {
    setTasks(templateCapstoneTickets);
    setPhases(initialPhases);
    setChapters(initialChapters);
    setRevisions(initialRevisions);
    setStandups(initialStandups);
    setActivityLogs(initialActivityLogs);
    logActivity('rebuilt database from seed schema (/rebuild-db)', 'Workspace Database');
    toast.success('🔄 Database & threads rebuilt successfully!');
  };

  const toggleTaskAcceptanceCriteria = (taskId: string, criteriaId: string) => {
    const target = tasks.find(task => task.id === taskId);
    if (!target?.acceptanceCriteria) return;

    const canEdit = target.assigneeId === currentMember.id || currentMember.role === 'leader';
    if (!canEdit) {
      toast.error('Only the task owner or project lead can update acceptance criteria.');
      return;
    }

    if (target.status === 'peer_review' || target.status === 'adviser_review' || target.status === 'done') {
      toast.info('Acceptance criteria are locked during review and after approval.');
      return;
    }

    const updated: Task = {
      ...target,
      acceptanceCriteria: target.acceptanceCriteria.map(criteria =>
        criteria.id === criteriaId ? { ...criteria, completed: !criteria.completed } : criteria
      ),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus): boolean => {
    const target = tasks.find(task => task.id === taskId);
    if (!target) return false;

    const canStageTask = currentMember.role === 'leader' && target.status === 'backlog' && newStatus === 'todo';
    if (!canStageTask) {
      toast.info('This workflow stage is protected', {
        description: 'Claim work, submit evidence, and complete the review gates from the ticket.'
      });
      return false;
    }

    const updated: Task = {
      ...target,
      status: 'todo',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    void syncTaskToSupabase(updated);
    syncTaskStateToDiscord(updated, currentMember.name);
    logActivity('staged task for the active workflow', target.title);
    toast.info(`Moved to to do: "${target.title}"`);
    return true;
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    let updatedTask: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          updatedTask = { ...t, subtasks: updatedSubtasks };
          return updatedTask;
        }
        return t;
      })
    );
    if (updatedTask) {
      void syncTaskToSupabase(updatedTask);
    }
  };

  // Milestone / Phase Handlers
  const toggleDeliverable = (phaseId: number, deliverableId: string) => {
    setPhases(prev =>
      prev.map(p => {
        if (p.id === phaseId) {
          const currentDelivs = p.keyDeliverables || [];
          const updatedDeliverables = currentDelivs.map(d =>
            d.id === deliverableId ? { ...d, completed: !d.completed } : d
          );
          const completedCount = updatedDeliverables.filter(d => d.completed).length;
          const totalCount = updatedDeliverables.length;
          const isAllDone = totalCount > 0 && completedCount === totalCount;
          const targetDeliv = updatedDeliverables.find(d => d.id === deliverableId);
          if (targetDeliv) {
            syncDeliverableToSupabase(phaseId, targetDeliv);
          }
          return {
            ...p,
            keyDeliverables: updatedDeliverables,
            adviserSignOff: isAllDone ? p.adviserSignOff : false,
            signedOffDate: isAllDone ? p.signedOffDate : undefined
          };
        }
        return p;
      })
    );
    logActivity('updated deliverable checklist', `Phase ${phaseId}`);
    toast.success('Milestone deliverable checklist updated');
  };

  const signOffPhase = (
    phaseId: number,
    consultationDetails?: {
      consultationNotes?: string;
      proofUrl?: string;
      consultationDate?: string;
      adviserName?: string;
    }
  ) => {
    const isLeaderOrManager = isOwner || currentMember.role === 'leader' || currentMember.permissionLevel === 'owner' || isAdviser;
    if (!isLeaderOrManager) {
      toast.error('Project Leader, Manager, or Faculty Adviser permission required for phase sign-off.');
      return;
    }

    const target = phases.find(phase => phase.id === phaseId);
    if (!target) return;

    if (phaseId !== project.currentPhaseId) {
      toast.info('Only the active phase can be signed off.');
      return;
    }

    if (target.adviserSignOff) {
      toast.info('This phase already has formal adviser sign-off.');
      return;
    }

    const phaseGate = getPhaseSignOffGate(target, tasks);
    if (!phaseGate.isReady) {
      toast.warning('Phase gate is incomplete', {
        description: phaseGate.missing.join(' • ')
      });
      return;
    }

    const adviserName = consultationDetails?.adviserName || project.adviser?.name || 'Faculty Adviser';
    const dateUsed = consultationDetails?.consultationDate || new Date().toISOString().split('T')[0];
    const notesUsed = consultationDetails?.consultationNotes || 'Approved during faculty consultation.';
    const signOffLabel = isAdviser 
      ? `${currentMember.name} (Faculty Adviser)`
      : `${adviserName} (Verified via Consultation by ${currentMember.name})`;

    const updated: MilestonePhase = {
      ...target,
      adviserSignOff: true,
      signedOffDate: dateUsed,
      signedOffBy: signOffLabel,
      consultationNotes: notesUsed,
      proofUrl: consultationDetails?.proofUrl,
      status: 'completed'
    };
    setPhases(prev => prev.map(phase => phase.id === phaseId ? updated : phase));
    void syncPhaseToSupabase(updated);
    notifyDiscordMilestone(updated, currentMember.name);
    logActivity(`recorded adviser consultation approval (${notesUsed.substring(0, 40)}...)`, `Phase ${phaseId}`);
    toast.success('Adviser Consultation Approval Recorded', {
      description: `${target.title} is formally approved and ready to advance.`
    });
  };

  const changeCurrentPhase = (phaseId: number) => {
    if (!isOwner) {
      toast.error('Only the project lead can advance the active phase.');
      return;
    }

    const currentIndex = phases.findIndex(phase => phase.id === project.currentPhaseId);
    const targetIndex = phases.findIndex(phase => phase.id === phaseId);
    const currentPhase = phases[currentIndex];
    const targetPhase = phases[targetIndex];
    if (!targetPhase) return;

    if (phaseId === project.currentPhaseId) return;

    const canStartFirstPhase = currentIndex === -1 && targetIndex === 0;
    const canAdvanceSequentially = currentIndex >= 0 && targetIndex === currentIndex + 1 && currentPhase?.adviserSignOff;
    if (!canStartFirstPhase && !canAdvanceSequentially) {
      toast.info('Phase progression is gated', {
        description: currentPhase?.adviserSignOff
          ? 'Advance one signed-off phase at a time.'
          : 'The current phase needs formal adviser sign-off before the next phase can begin.'
      });
      return;
    }

    const updatedProject: CapstoneProject = { ...project, currentPhaseId: phaseId };
    const updatedPhase: MilestonePhase = {
      ...targetPhase,
      status: 'in_progress'
    };
    setProject(updatedProject);
    setProjects(prev => prev.map(savedProject => savedProject.id === activeProjectId ? updatedProject : savedProject));
    setPhases(prev => prev.map(phase => phase.id === phaseId ? updatedPhase : phase));
    void syncProjectToSupabase(updatedProject);
    void syncPhaseToSupabase(updatedPhase);
    logActivity('advanced active project phase', `Phase ${phaseId}`);
    toast.success('Next phase activated', {
      description: `The team can now scope work for ${targetPhase.title}.`
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

    const remainingPhases = phases.filter(p => p.id !== phaseId);
    setPhases(remainingPhases);
    deletePhaseFromSupabase(phaseId);

    // If deleted phase was current active phase, advance/fallback currentPhaseId
    if (project.currentPhaseId === phaseId) {
      const nextActiveId = remainingPhases[0]?.id || 0;
      setProject(prev => ({ ...prev, currentPhaseId: nextActiveId }));
    }

    // Reassign any tasks mapped to this phase
    const fallbackPhaseId = remainingPhases[0]?.id || 0;
    setTasks(prev => prev.map(t => {
      if (t.phaseId === phaseId) {
        const reassigned = { ...t, phaseId: fallbackPhaseId };
        syncTaskToSupabase(reassigned);
        return reassigned;
      }
      return t;
    }));

    logActivity('removed milestone phase', `Phase ID ${phaseId}`);
    toast.success(`Milestone phase removed.`);
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
        const updated = [...(p.keyDeliverables || []), newDeliverable];
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
        const updated = (p.keyDeliverables || []).filter(d => d.id !== deliverableId);
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
        const updated = (p.keyDeliverables || []).map(d => {
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
    let updatedChapter: ManuscriptChapter | null = null;
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
          updatedChapter = {
            ...ch,
            sections: updatedSections,
            adviserStatus: allCompleted ? 'approved' : 'in_review',
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          return updatedChapter;
        }
        return ch;
      })
    );
    if (updatedChapter) {
      void syncChapterToSupabase(updatedChapter);
    }
    logActivity('updated chapter section status', `Chapter ${chapterId}`);
  };

  const updateChapter = (chapterId: number, updates: Partial<ManuscriptChapter>) => {
    let updatedChapter: ManuscriptChapter | null = null;
    setChapters(prev =>
      prev.map(ch => {
        if (ch.id === chapterId) {
          updatedChapter = {
            ...ch,
            ...updates,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          return updatedChapter;
        }
        return ch;
      })
    );
    if (updatedChapter) {
      void syncChapterToSupabase(updatedChapter);
    }
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
            keyDeliverables: (p.keyDeliverables || []).map(d => {
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
          keyDeliverables: (p.keyDeliverables || []).map(d => {
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

  const createProject = async (payload: NewProjectPayload): Promise<CapstoneProject> => {
    const userProfile = {
      id: currentMember?.id || (githubUser?.login ? `usr_github_${githubUser.login.toLowerCase()}` : 'usr_owner_main'),
      name: currentMember?.name || githubUser?.name || 'Project Manager',
      email: currentMember?.email || githubUser?.email || 'manager@capstoneflow.app',
      avatar: currentMember?.avatar || (githubUser?.avatar_url ? githubUser.avatar_url : undefined),
      githubUsername: currentMember?.githubUsername || githubUser?.login,
      roleTitle: currentMember?.roleTitle || 'Project Manager / Lead Architect'
    };

    const { project: newProj, phases: newPhases, tasks: newTasks, members: newMembers } = createNewProjectInstance(payload, userProfile);

    // Update active project ref FIRST to prevent race conditions with any active Realtime sync
    activeProjectIdRef.current = newProj.id;

    // Save project-scoped state to localStorage
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_project`, JSON.stringify(newProj));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_tasks`, JSON.stringify(newTasks));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_phases`, JSON.stringify(newPhases));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_members`, JSON.stringify(newMembers));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_revisions`, JSON.stringify([]));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_standups`, JSON.stringify([]));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_chapters`, JSON.stringify(initialChapters));
    localStorage.setItem(`capstoneflow_proj_${newProj.id}_activity`, JSON.stringify([]));

    // Also update global fallback keys so they don't hold stale data from the previous project
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_project`, JSON.stringify(newProj));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(newTasks));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_phases`, JSON.stringify(newPhases));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_members`, JSON.stringify(newMembers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_revisions`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_standups`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_chapters`, JSON.stringify(initialChapters));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activity`, JSON.stringify([]));
    localStorage.setItem(activeProjectKeyFor(getIdentityKey()), newProj.id);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, userProfile.id);

    // Register project in projects list & switch active project
    setCurrentMemberId(userProfile.id);
    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setProject(newProj);

    // Update active workspace states
    setTasks(newTasks);
    setPhases(newPhases);
    setMembers(newMembers);
    setRevisions([]);
    setStandups([]);
    setChapters(initialChapters);
    setActivityLogs([]);

    if (isSupabaseConfigured()) {
      try {
        await syncProjectToSupabase(newProj);
        await seedSupabaseDatabase({
          project: newProj,
          members: newMembers,
          phases: newPhases,
          tasks: newTasks,
          standups: [],
          revisions: []
        });
      } catch (e) {
        console.warn('Supabase project seeding completed with local state preserved:', e);
      }
    }

    logActivity('provisioned new cloud project', newProj.title);
    return newProj;
  };

  const switchProject = async (targetId: string, projectOverride?: CapstoneProject) => {
    let target = projectOverride || projects.find(p => p.id === targetId);
    if (!target && isSupabaseConfigured()) {
      const cloudData = await fetchAllDataFromSupabase(targetId);
      target = cloudData?.project || undefined;
    }
    if (!target) return;

    activeProjectIdRef.current = targetId;
    setActiveProjectId(targetId);
    setProject(target);

    // Save project registry if this is a newly opened cloud project
    setProjects(prev => {
      if (prev.some(p => p.id === targetId)) {
        return prev.map(p => p.id === targetId ? target! : p);
      }
      const next = [target!, ...prev];
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_projects_list`, JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured()) {
      try {
        const cloudData = await fetchAllDataFromSupabase(targetId);
        if (cloudData) {
          if (cloudData.project) {
            setProject(cloudData.project);
          }
          if (cloudData.tasks && cloudData.tasks.length > 0) {
            setTasks(cloudData.tasks);
            localStorage.setItem(`capstoneflow_proj_${targetId}_tasks`, JSON.stringify(cloudData.tasks));
          }
          if (cloudData.phases && cloudData.phases.length > 0) {
            setPhases(cloudData.phases);
            localStorage.setItem(`capstoneflow_proj_${targetId}_phases`, JSON.stringify(cloudData.phases));
          }
          if (cloudData.members && cloudData.members.length > 0) {
            setMembers(cloudData.members);
            localStorage.setItem(`capstoneflow_proj_${targetId}_members`, JSON.stringify(cloudData.members));
          }
          if (cloudData.chapters && cloudData.chapters.length > 0) {
            setChapters(cloudData.chapters);
            localStorage.setItem(`capstoneflow_proj_${targetId}_chapters`, JSON.stringify(cloudData.chapters));
          }
          if (cloudData.revisions) {
            setRevisions(cloudData.revisions);
            localStorage.setItem(`capstoneflow_proj_${targetId}_revisions`, JSON.stringify(cloudData.revisions));
          }
          if (cloudData.standups) {
            setStandups(cloudData.standups);
            localStorage.setItem(`capstoneflow_proj_${targetId}_standups`, JSON.stringify(cloudData.standups));
          }
        }
      } catch (e) {
        console.warn('Supabase switch project cloud hydration warning:', e);
      }
    } else {
      // Load project-scoped state from localStorage for offline mode
      const savedTasks = localStorage.getItem(`capstoneflow_proj_${targetId}_tasks`);
      const savedPhases = localStorage.getItem(`capstoneflow_proj_${targetId}_phases`);
      const savedMembers = localStorage.getItem(`capstoneflow_proj_${targetId}_members`);
      const savedRevisions = localStorage.getItem(`capstoneflow_proj_${targetId}_revisions`);
      const savedStandups = localStorage.getItem(`capstoneflow_proj_${targetId}_standups`);
      const savedChapters = localStorage.getItem(`capstoneflow_proj_${targetId}_chapters`);
      const savedActivity = localStorage.getItem(`capstoneflow_proj_${targetId}_activity`);

      const fallbackMembers: TeamMember[] = target.collaborators && target.collaborators.length > 0
        ? target.collaborators.map((c, i) => ({
            id: c.id || (c.permission === 'owner' ? (currentMemberId || 'usr_owner_main') : `m_${i}`),
            name: c.name,
            email: `${c.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
            role: (c.permission === 'adviser' ? 'adviser' : c.permission === 'editor' || c.permission === 'owner' ? 'leader' : 'developer') as Role,
            roleTitle: c.role || (c.permission === 'owner' ? 'Project Manager / Lead Architect' : 'Software Contributor'),
            permissionLevel: (c.permission || (i === 0 ? 'owner' : 'member')) as PermissionLevel,
            avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=10b981&color=fff&bold=true`,
            color: '#10b981'
          }))
        : initialMembers;

      const loadedTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];
      const loadedPhases: MilestonePhase[] = savedPhases ? JSON.parse(savedPhases) : [];
      let loadedMembers: TeamMember[] = savedMembers ? JSON.parse(savedMembers) : fallbackMembers;

      // Guarantee that the active user / owner account is always present
      const hasOwner = loadedMembers.some(m => m.permissionLevel === 'owner' || m.id === currentMemberId || m.id === 'usr_owner_main');
      if (!hasOwner) {
        const activeOwner: TeamMember = {
          id: currentMemberId || 'usr_owner_main',
          name: githubUser?.name || 'Project Manager',
          email: githubUser?.email || 'manager@capstoneflow.app',
          role: 'leader',
          roleTitle: 'Project Manager / Lead Architect',
          permissionLevel: 'owner',
          avatar: githubUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(githubUser?.name || 'Project Manager')}&background=10b981&color=fff&bold=true`,
          githubUsername: githubUser?.login,
          color: '#10b981'
        };
        loadedMembers = [activeOwner, ...loadedMembers];
      }
      const loadedRevisions: RevisionItem[] = savedRevisions ? JSON.parse(savedRevisions) : [];
      const loadedStandups: StandupEntry[] = savedStandups ? JSON.parse(savedStandups) : [];
      const loadedChapters: ManuscriptChapter[] = savedChapters ? JSON.parse(savedChapters) : initialChapters;
      const loadedActivity: ActivityLog[] = savedActivity ? JSON.parse(savedActivity) : [];

      setTasks(loadedTasks);
      setPhases(loadedPhases);
      setMembers(loadedMembers);
      setRevisions(loadedRevisions);
      setStandups(loadedStandups);
      setChapters(loadedChapters);
      setActivityLogs(loadedActivity);
    }

    localStorage.setItem(activeProjectKeyFor(getIdentityKey()), targetId);

    toast.success(`Active Workspace: ${cleanProjectTitle(target.title) || target.title}`, {
      description: `Target Defense: ${target.targetDefenseDate || '2026-11-30'} • Status: ${target.status?.toUpperCase() || 'ACTIVE'}`
    });
  };

  const joinProjectByInvite = async (
    inviteCodeOrId: string, 
    role: Role = 'developer',
    permission: 'owner' | 'editor' | 'member' | 'adviser' | 'viewer' = 'member',
    explicitTokenPayload?: InviteTokenPayload
  ): Promise<boolean> => {
    const raw = inviteCodeOrId.trim();
    if (!raw) {
      toast.error('Invalid Invite Code', { description: 'Please enter a valid project invite code or URL.' });
      return false;
    }

    // Extract & verify token if present in raw string or current window location
    let tokenPayload: InviteTokenPayload | undefined = explicitTokenPayload;
    if (!tokenPayload) {
      const tokenCandidate = raw.includes('token=') 
        ? raw 
        : typeof window !== 'undefined' && window.location.href.includes('token=')
        ? window.location.href
        : raw.startsWith('cft_')
        ? raw
        : '';
      if (tokenCandidate) {
        try {
          const verified = await verifyInviteToken(tokenCandidate);
          if (verified.valid && verified.payload) {
            tokenPayload = verified.payload;
          }
        } catch {
          // continue to other lookup methods
        }
      }
    }

    // Auto-detect role from token payload or URL params
    let resolvedRole: Role = role;
    let resolvedPermission = permission;

    if (tokenPayload) {
      resolvedRole = tokenPayload.role === 'adviser' ? 'adviser' : tokenPayload.role === 'editor' ? 'leader' : tokenPayload.role === 'viewer' ? 'researcher' : 'developer';
      resolvedPermission = tokenPayload.role as any;
    } else {
      const lower = raw.toLowerCase();
      if (lower.includes('role=adviser') || lower.includes('role=faculty') || lower.endsWith('-adviser') || lower.endsWith('-faculty')) {
        resolvedRole = 'adviser';
        resolvedPermission = 'adviser';
      } else if (lower.includes('role=editor') || lower.includes('role=lead') || lower.endsWith('-editor') || lower.endsWith('-lead')) {
        resolvedRole = 'leader';
        resolvedPermission = 'editor';
      } else if (lower.includes('role=viewer') || lower.includes('role=observer') || lower.endsWith('-viewer') || lower.endsWith('-observer')) {
        resolvedRole = 'researcher';
        resolvedPermission = 'viewer';
      }
    }

    const match = raw.match(/CF-[A-Z0-9]{4,12}/i);
    const cleanCode = (tokenPayload?.pid && tokenPayload.pid.startsWith('CF-'))
      ? tokenPayload.pid.toUpperCase()
      : match 
      ? match[0].toUpperCase() 
      : raw
          .replace(/^https?:\/\/[^/]+\/#projects\?join=/i, '')
          .replace(/^https?:\/\/[^/]+\/\?join=/i, '')
          .replace(/^#projects\?join=/i, '')
          .replace(/^.*join=/i, '')
          .split('&')[0]
          .split('-ADVISER')[0]
          .split('-FACULTY')[0]
          .split('-EDITOR')[0]
          .split('-LEAD')[0]
          .split('-DEVELOPER')[0]
          .split('-VIEWER')[0]
          .split('-OBSERVER')[0]
          .replace(/[\[\]]/g, '')
          .trim()
          .toUpperCase();

    if (!cleanCode) {
      toast.error('Invalid Invite Code', { description: 'Please enter a valid project invite code or URL.' });
      return false;
    }

    const pureCode = cleanCode.replace(/^CF-/, '');

    const mergeCollaborator = (p: CapstoneProject): CapstoneProject => {
      const exists = (p.collaborators || []).some(c => c.id === currentMember.id);
      const updatedCollaborators = exists
        ? p.collaborators
        : [...(p.collaborators || []), { id: currentMember.id, name: currentMember.name, avatar: currentMember.avatar, role: currentMember.roleTitle, permission: resolvedPermission }];
      return {
        ...p,
        userRole: resolvedPermission,
        isOwner: false,
        collaborators: updatedCollaborators,
        memberCount: (updatedCollaborators || []).length
      };
    };

    // 1. Own registry (projects this account created or joined before)
    const localTarget = projects.find(p => {
      const pInvite = (p.inviteCode || '').toUpperCase();
      const pId = (p.id || '').toUpperCase();
      return pInvite === cleanCode ||
             pInvite === `CF-${cleanCode}` ||
             (pureCode.length >= 4 && pInvite.replace(/^CF-/, '') === pureCode) ||
             pId === cleanCode ||
             pId === raw.trim();
    });

    if (localTarget) {
      const merged = mergeCollaborator(localTarget);
      setProjects(prev => prev.map(p => p.id === localTarget.id ? merged : p));
      await switchProject(localTarget.id, merged);
      toast.success(`Joined Project: ${cleanProjectTitle(localTarget.title) || localTarget.title}`, {
        description: `Access Level: ${resolvedPermission.toUpperCase()} • Role: ${resolvedRole.toUpperCase()}`
      });
      return true;
    }

    // 2. Cloud lookup — the single source of truth for invite codes
    if (isSupabaseConfigured()) {
      const cloudProj = await fetchProjectByInviteCode(cleanCode);
      if (cloudProj) {
        const updatedCloudProj = mergeCollaborator(cloudProj);
        setProjects(prev => {
          const filtered = prev.filter(p => p.id !== cloudProj.id);
          const next = [updatedCloudProj, ...filtered];
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_projects_list`, JSON.stringify(next));
          return next;
        });
        await joinCloudProject(cloudProj.id, currentMember);
        await switchProject(cloudProj.id, updatedCloudProj);
        toast.success(`Joined Cloud Project: ${cleanProjectTitle(cloudProj.title) || cloudProj.title}`, {
          description: `Live synchronization active • Access Level: ${resolvedPermission.toUpperCase()}`
        });
        return true;
      }
    }

    // 3. Honest failure — never fabricate a placeholder workspace. If the
    // owner's workspace is not in the cloud yet, the owner must re-open the
    // invite modal (which seeds it); joining an empty reconstruction would
    // only produce a ghost shell with no tasks or progress.
    toast.error('No Project Found', {
      description: `No workspace matches invite code ${cleanCode} yet. Ask the project owner to open their Invite Collaborators modal once (this syncs the workspace), then try again.`
    });
    return false;
  };

  const deleteProject = (targetId: string) => {
    const target = projects.find(p => p.id === targetId);

    // Authorization check: Only Project Leader or Manager can delete
    const roleTitle = (currentMember?.roleTitle || '').toLowerCase();
    const userRole = (currentRole || currentMember?.role || target?.userRole || 'member').toLowerCase();
    const userCanDelete = Boolean(
      isOwner ||
      target?.isOwner !== false ||
      currentMember?.permissionLevel === 'owner' ||
      userRole === 'owner' ||
      userRole === 'leader' ||
      /manager|lead|architect|director|head|admin/i.test(roleTitle)
    );

    if (!userCanDelete) {
      toast.error('Permission Denied', {
        description: 'Only the Project Leader or Project Manager is authorized to delete this workspace.'
      });
      return;
    }

    if (projects.length <= 1) {
      toast.error('Cannot Delete Sole Project', {
        description: 'Workspace must maintain at least one active capstone project.'
      });
      return;
    }
    const remaining = projects.filter(p => p.id !== targetId);
    setProjects(remaining);
    void deleteProjectFromSupabase(targetId);

    // Clean up scoped localStorage keys
    localStorage.removeItem(`capstoneflow_proj_${targetId}_project`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_tasks`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_phases`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_members`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_revisions`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_standups`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_chapters`);
    localStorage.removeItem(`capstoneflow_proj_${targetId}_activity`);

    // Switch to first remaining project if deleted was active
    if (activeProjectId === targetId && remaining.length > 0) {
      switchProject(remaining[0].id);
    }
    const cleanTitle = cleanProjectTitle(target?.title || '') || target?.title || 'Project';
    toast.success(`Project "${cleanTitle}" Deleted`);
  };

  const pauseProject = (targetId: string) => {
    setProjects(prev => prev.map(p => p.id === targetId ? { ...p, status: 'paused' } : p));
    toast.info('Project Paused', { description: 'Project boards archived in paused mode.' });
  };

  const resumeProject = (targetId: string) => {
    setProjects(prev => prev.map(p => p.id === targetId ? { ...p, status: 'active' } : p));
    toast.success('Project Resumed', { description: 'Compute instance & Realtime channels online.' });
  };

  const regenerateProjectKey = (targetId: string, keyType: 'anon' | 'service_role') => {
    void targetId;
    toast.info(`${keyType === 'anon' ? 'Anon public' : 'Service role'} keys are managed by Supabase`, {
      description: 'Open Supabase Project Settings to rotate credentials. Keys are never generated or stored in the browser.'
    });
  };

  const updateProjectInfo = (updates: Partial<CapstoneProject>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const updated = { ...p, ...updates };
        syncProjectToSupabase(updated);
        return updated;
      }
      return p;
    }));

    setProject(prev => {
      const updated = { ...prev, ...updates };
      syncProjectToSupabase(updated);
      return updated;
    });

    if (updates.adviser) {
      setMembers(prev => prev.map(m => {
        if (m.role === 'adviser') {
          const updatedAdv: TeamMember = {
            ...m,
            name: updates.adviser?.name || m.name,
            email: updates.adviser?.email || m.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.adviser?.name || m.name)}&background=6366f1&color=fff&bold=true`
          };
          syncMemberToSupabase(updatedAdv);
          return updatedAdv;
        }
        return m;
      }));
    }

    logActivity('updated project settings', updates.title || 'Settings');
  };

  const resetData = () => {
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_tasks`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_phases`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_members`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_chapters`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_revisions`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_standups`);
    localStorage.removeItem(`capstoneflow_proj_${activeProjectId}_activity`);

    setMembers(initialMembers);
    setTasks(initialTasks);
    setPhases(initialPhases);
    setChapters(initialChapters);
    setRevisions(initialRevisions);
    setStandups(initialStandups);
    setActivityLogs(initialActivityLogs);
    setGithubCommits([]);
    setGithubPRs([]);
    toast.success('Active Project Board Reset', { description: 'All boards for this project reset to initial clean state.' });
  };

  const exportDataJSON = () => {
    const fullData = {
      project,
      projects,
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
        if (data.projects) setProjects(data.projects);
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

  const syncToSupabaseSilent = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    try {
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
      }
      return success;
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

  const isMemberOnline = (memberId: string): boolean => {
    if (memberId === currentMemberId || memberId === currentMember.id) return true;
    const found = onlineUsers.find(u => u.memberId === memberId);
    if (found) {
      if (!found.onlineAt) return true;
      const ageMs = Date.now() - new Date(found.onlineAt).getTime();
      return ageMs < 25000;
    }
    return false;
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        projects,
        activeProjectId,
        createProject,
        joinProjectByInvite,
        switchProject,
        deleteProject,
        pauseProject,
        resumeProject,
        regenerateProjectKey,
        members,
        tasks,
        phases,
        chapters,
        revisions,
        standups,
        activityLogs,
        currentMember,
        currentRole: currentMember.role,
        theme,
        searchQuery,
        filterCategory,
        isDatabaseConnected,
        isWorkspaceLoading,
        syncToSupabase,
        isAuthenticated,
        loginUser,
        signOut,
        githubUser,
        githubCommits,
        githubPRs,
        isGitHubConnected: !!githubUser,
        isAutoTracking,
        isSyncingGitHub,
        lastGitHubSyncTime,
        toggleAutoTracking,
        onlineUsers,
        isMemberOnline,
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
        retryDiscordTicket,
        updateTask,
        deleteTask,
        claimTask,
        releaseTask,
        resolveTask,
        reviewTask,
        approveTaskAdviserReview,
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
