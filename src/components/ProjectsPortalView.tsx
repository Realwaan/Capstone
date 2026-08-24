import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { JoinProjectModal } from './JoinProjectModal';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';
import { DeleteProjectModal } from './DeleteProjectModal';
import { CapStoneFlowLogo } from './CapStoneFlowLogo';
import { CapstoneProject, TeamMember, AccessModifier } from '../types';
import { cleanProjectTitle } from '../lib/projectGenerator';
import { canUserAccessProject } from '../lib/accessControl';
import { 
  FolderKanban, 
  LayoutDashboard,
  Users, 
  Layers, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  Grid, 
  List, 
  Info, 
  X, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Trash2, 
  Play, 
  Pause, 
  ExternalLink,
  Shield,
  Sparkles,
  HelpCircle,
  Bell,
  MessageSquare,
  Lock,
  Database,
  Terminal,
  Zap,
  Globe,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  UserCheck,
  Link2,
  UserPlus,
  Share2,
  Code2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectsPortalViewProps {
  onOpenCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onOpenCommandPalette?: () => void;
}

type StatusFilter = 'all' | 'active' | 'paused';
type ScopeFilter = 'all' | 'created' | 'joined';
type SortOption = 'name' | 'recent' | 'progress' | 'defense';

export const ProjectsPortalView: React.FC<ProjectsPortalViewProps> = ({
  onOpenCreateProject,
  onSelectProject,
  onOpenCommandPalette
}) => {
  const { 
    project,
    projects, 
    activeProjectId, 
    switchProject, 
    pauseProject, 
    resumeProject, 
    deleteProject,
    currentMember,
    members,
    isMemberOnline,
    onlineUsers
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | AccessModifier>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  // Join Project Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinInitialCode, setJoinInitialCode] = useState('');

  // Invite Collaborator Modal State (for Project Leads)
  const [inviteProjectModal, setInviteProjectModal] = useState<CapstoneProject | null>(null);

  // Delete Project Modal State (Typed Confirmation)
  const [projectToDelete, setProjectToDelete] = useState<CapstoneProject | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Detect URL join parameter on mount (e.g. #projects?join=CF-DRONE9)
  useEffect(() => {
    const handleUrlInvite = () => {
      const hash = window.location.hash;
      if (hash.includes('join=')) {
        setJoinInitialCode(hash);
        setIsJoinModalOpen(true);
      }
    };
    handleUrlInvite();
    window.addEventListener('hashchange', handleUrlInvite);
    return () => window.removeEventListener('hashchange', handleUrlInvite);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
        setShowStatusDropdown(false);
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: compute days left until target defense
  const getDaysUntilDefense = (dateStr?: string): { days: number; isUrgent: boolean; isPast: boolean } => {
    if (!dateStr) return { days: 45, isUrgent: false, isPast: false };
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { days: Math.abs(diff), isUrgent: false, isPast: true };
    return { days: diff, isUrgent: diff <= 30, isPast: false };
  };

  // Helper: get stats for a project from scoped localStorage
  const getProjectScopedStats = (projId: string) => {
    try {
      const savedTasks = localStorage.getItem(`capstoneflow_proj_${projId}_tasks`);
      const savedChapters = localStorage.getItem(`capstoneflow_proj_${projId}_chapters`);
      const savedRevisions = localStorage.getItem(`capstoneflow_proj_${projId}_revisions`);

      const tasks = savedTasks ? JSON.parse(savedTasks) : [];
      const chapters = savedChapters ? JSON.parse(savedChapters) : [];
      const revisions = savedRevisions ? JSON.parse(savedRevisions) : [];

      const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
      const doneTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'done').length : 0;
      
      const completedChapters = Array.isArray(chapters) 
        ? chapters.filter((c: any) => c.sections && c.sections.every((s: any) => s.completed)).length 
        : 0;

      const pendingRevisions = Array.isArray(revisions)
        ? revisions.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length
        : 0;

      return { totalTasks, doneTasks, completedChapters, pendingRevisions };
    } catch {
      return { totalTasks: 8, doneTasks: 5, completedChapters: 2, pendingRevisions: 1 };
    }
  };

  // Helper: get real members for a project from scoped localStorage or active state
  const getProjectMembers = (projId: string): TeamMember[] => {
    if (projId === activeProjectId && members && members.length > 0) {
      return members;
    }
    try {
      const saved = localStorage.getItem(`capstoneflow_proj_${projId}_members`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const proj = projects.find(p => p.id === projId);
    if (proj?.collaborators && proj.collaborators.length > 0) {
      return proj.collaborators.map((c, idx) => ({
        id: c.id || `m_${projId}_${idx}`,
        name: c.name,
        email: `${c.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
        role: (c.permission === 'adviser' ? 'adviser' : c.permission === 'owner' || c.permission === 'editor' ? 'leader' : 'developer') as any,
        roleTitle: c.role || 'Contributor',
        permissionLevel: (c.permission || 'member') as any,
        avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=10b981&color=fff&bold=true`,
        color: '#10b981'
      }));
    }
    return [currentMember];
  };

  // Open Invite Collaborator Modal to set permissions & copy published link
  const handleCopyInviteLink = (e: React.MouseEvent, p: CapstoneProject) => {
    e.stopPropagation();
    setInviteProjectModal(p);
  };

  // Filter & sort projects
  const myCreatedProjectsCount = projects.filter(p => p.isOwner !== false && p.userRole !== 'member' && p.userRole !== 'viewer').length;
  const sharedProjectsCount = projects.filter(p => p.isOwner === false || p.userRole === 'member' || p.userRole === 'editor' || p.userRole === 'adviser').length;

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.adviser?.name && p.adviser.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.inviteCode && p.inviteCode.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter === 'active' && p.status === 'paused') return false;
      if (statusFilter === 'paused' && p.status !== 'paused') return false;

      if (scopeFilter === 'created' && p.isOwner === false) return false;
      if (scopeFilter === 'joined' && (p.isOwner !== false && p.userRole !== 'member' && p.userRole !== 'editor' && p.userRole !== 'adviser')) return false;

      if (accessFilter !== 'all' && (p.accessLevel || 'private') !== accessFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') return (b.overallProgress || 0) - (a.overallProgress || 0);
      if (sortBy === 'defense') {
        const dateA = a.targetDefenseDate ? new Date(a.targetDefenseDate).getTime() : 9999999999999;
        const dateB = b.targetDefenseDate ? new Date(b.targetDefenseDate).getTime() : 9999999999999;
        return dateA - dateB;
      }
      if (sortBy === 'recent') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  const handleOpenProject = (projectId: string) => {
    const targetProj = projects.find(p => p.id === projectId);
    if (targetProj) {
      const accessCheck = canUserAccessProject(targetProj, currentMember);
      if (!accessCheck.canAccess && accessCheck.requiresInvite) {
        setJoinInitialCode(targetProj.inviteCode || '');
        setIsJoinModalOpen(true);
        toast.info('Private Project Protected', {
          description: `This workspace is ${targetProj.accessLevel || 'private'}. Please enter the invite code to join.`
        });
        return;
      }
    }
    switchProject(projectId);
    onSelectProject(projectId);
  };

  const currentOrgName = project?.organization || projects.find(p => p.id === activeProjectId)?.organization || projects[0]?.organization || 'College of Computer Studies';

  // Aggregate Cohort Telemetry
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status !== 'paused').length;
  const avgReadiness = Math.round(
    projects.reduce((acc, p) => acc + (p.overallProgress || 0), 0) / (projects.length || 1)
  );

  return (
    <div 
      className="projects-portal-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-main)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* Top Organization Header */}
      <header 
        style={{
          height: '56px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        {/* Left: Organization Identifier & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <CapStoneFlowLogo size="sm" showBadge={true} badgeText="HUB" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/</span>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <GraduationCap size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentOrgName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="btn btn-secondary btn-sm"
              style={{
                height: '32px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Search size={13} />
              <span>Quick jump...</span>
              <kbd style={{ fontSize: '0.66rem', background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>⌘K</kbd>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setJoinInitialCode(''); setIsJoinModalOpen(true); }}
              className="btn btn-secondary btn-sm"
              style={{
                height: '32px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <UserPlus size={13} style={{ color: 'var(--primary)' }} />
              <span>Join Project</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateProject}
              className="btn btn-primary btn-sm"
              style={{
                height: '32px',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <Plus size={14} />
              <span>New project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Projects Portal Center (Full-Width Focused Management Dashboard) */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '28px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Row: Title & Overview Bento Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
                Capstone Project Workspaces
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Manage and collaborate on software engineering capstone boards, sprint tasks, and defense milestones.
                </p>
              </div>
            </div>

            {/* Department Defense & Code Velocity Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Stat 1 */}
              <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cohort Readiness
                  </span>
                  <TrendingUp size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {avgReadiness}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Average milestone completion
                </div>
              </div>

              {/* Stat 2 */}
              <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Active Workspaces
                  </span>
                  <Code2 size={15} style={{ color: '#38bdf8' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {activeProjectsCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalProjectsCount}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Software repositories online
                </div>
              </div>

              {/* Stat 3 */}
              <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Collaborators & Leads
                  </span>
                  <Users size={15} style={{ color: '#a855f7' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span>{projects.reduce((acc, p) => acc + getProjectMembers(p.id).length, 0)}</span>
                  {onlineUsers.length > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-presence-ring 2s infinite ease-in-out' }} />
                      {onlineUsers.length} Online
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Real-time active workspace members
                </div>
              </div>

              {/* Stat 4 */}
              <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Target Defense
                  </span>
                  <Calendar size={15} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                  Nov 2026 Season
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Final capstone evaluation panel
                </div>
              </div>
            </div>
          </div>

          {/* Scope Filters (All / Created / Shared) & Search Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            {/* Scope Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: scopeFilter === 'all' ? 'var(--primary-light)' : 'transparent',
                  color: scopeFilter === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: scopeFilter === 'all' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>All Projects</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{projects.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setScopeFilter('created')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: scopeFilter === 'created' ? 'var(--primary-light)' : 'transparent',
                  color: scopeFilter === 'created' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: scopeFilter === 'created' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Created by Me</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{myCreatedProjectsCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setScopeFilter('joined')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: scopeFilter === 'joined' ? 'var(--primary-light)' : 'transparent',
                  color: scopeFilter === 'joined' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: scopeFilter === 'joined' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Shared / Joined</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{sharedProjectsCount}</span>
              </button>
            </div>

            {/* Search & Secondary Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter projects or codes..."
                  className="input-field"
                  style={{
                    width: '100%',
                    height: '32px',
                    paddingLeft: '30px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowSortDropdown(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
                >
                  <span>{statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Paused'}</span>
                  <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                </button>

                {showStatusDropdown && (
                  <div 
                    ref={menuRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px',
                      zIndex: 50,
                      minWidth: '130px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: statusFilter === 'all' ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      All Status
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('active'); setShowStatusDropdown(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: statusFilter === 'active' ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('paused'); setShowStatusDropdown(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: statusFilter === 'paused' ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Paused
                    </button>
                  </div>
                )}
              </div>

              {/* Grid / List Toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0 8px',
                    height: '32px',
                    background: viewMode === 'grid' ? 'var(--bg-elevated)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Grid View"
                >
                  <Grid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0 8px',
                    height: '32px',
                    background: viewMode === 'list' ? 'var(--bg-elevated)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="List View"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Grid Display */}
          {filteredProjects.length === 0 ? (
            <div 
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <FolderKanban size={32} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No projects found in this filter
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                Try resetting your search filters, join an existing project via invite link, or spin up a new capstone repository.
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => { setJoinInitialCode(''); setIsJoinModalOpen(true); }}
                  className="btn btn-secondary btn-sm"
                >
                  <UserPlus size={13} />
                  <span>Join via Invite</span>
                </button>
                <button 
                  type="button" 
                  onClick={onOpenCreateProject}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={13} />
                  <span>Create Project</span>
                </button>
              </div>
            </div>
          ) : (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', 
                gap: '18px' 
              }}
            >
              {filteredProjects.map(p => {
                const isPaused = p.status === 'paused';
                const isActiveWorkspace = p.id === activeProjectId;
                const stats = getProjectScopedStats(p.id);
                const defenseInfo = getDaysUntilDefense(p.targetDefenseDate);
                const isFullCoding = p.trackType === 'full_coding' || p.trackType === 'software_engineering' || p.hasManuscript === false;
                const isIot = p.trackType === 'hardware_iot';
                const inviteCode = p.inviteCode || `CF-${p.id.slice(-6).toUpperCase()}`;
                const userRole = p.userRole || (p.isOwner !== false ? 'owner' : 'member');
                const projMembers = getProjectMembers(p.id);
                const onlineMembers = projMembers.filter(m => isMemberOnline(m.id));
                const hasOnline = onlineMembers.length > 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProject(p.id)}
                    className="card card-hover animate-emil-card"
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      position: 'relative',
                      border: isActiveWorkspace ? '1.5px solid var(--primary)' : '1px solid var(--border-card)',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: isActiveWorkspace ? '0 4px 20px var(--primary-glow)' : 'var(--shadow-sm)',
                      transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease'
                    }}
                  >
                    {/* Top Row: Tags, Role Badge, Copy Invite & Menu */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            {isActiveWorkspace && (
                              <span className="telemetry-beacon emerald" title="Currently Active Workspace" />
                            )}
                            <span 
                              className="badge badge-neutral" 
                              style={{ fontSize: '0.64rem', padding: '1px 6px', fontFamily: 'var(--font-mono)' }}
                            >
                              {p.organization || 'Computer Studies'}
                            </span>
                            <span 
                              className={`badge ${isFullCoding ? 'badge-primary' : isIot ? 'badge-warning' : 'badge-neutral'}`}
                              style={{ fontSize: '0.62rem', padding: '1px 6px', fontFamily: 'var(--font-mono)' }}
                            >
                              {isFullCoding ? '💻 FULL CODING' : isIot ? '🤖 IOT BUILD' : '🎓 THESIS'}
                            </span>
                            <span 
                              className="badge"
                              style={{ 
                                fontSize: '0.6rem', 
                                padding: '1px 6px', 
                                background: userRole === 'owner' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                color: userRole === 'owner' ? 'var(--primary)' : '#38bdf8',
                                border: `1px solid ${userRole === 'owner' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}
                            >
                              {userRole === 'owner' ? '👑 OWNER' : userRole === 'editor' ? '✏️ EDITOR' : userRole === 'adviser' ? '🎓 ADVISER' : '👤 DEVELOPER'}
                            </span>
                          </div>

                          <h3 
                            style={{ 
                              fontSize: '1.05rem', 
                              fontWeight: 800, 
                              color: 'var(--text-primary)', 
                              margin: 0, 
                              letterSpacing: '-0.02em',
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {cleanProjectTitle(p.title) || p.title}
                          </h3>
                        </div>

                        {/* Top Right: Copy Invite Link Button & Menu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyInviteLink(e, p)}
                            className="btn btn-ghost btn-icon"
                            style={{ width: '28px', height: '28px', padding: 0, color: 'var(--text-muted)' }}
                            title={`Copy Invite Link (${inviteCode})`}
                          >
                            <Link2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                            className="btn btn-ghost btn-icon"
                            style={{ width: '28px', height: '28px', padding: 0, color: 'var(--text-muted)' }}
                            title="Project Board Options"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === p.id && (
                            <div
                              ref={menuRef}
                              style={{
                                position: 'absolute',
                                right: 12,
                                top: '48px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-lg)',
                                padding: '6px',
                                zIndex: 100,
                                minWidth: '170px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => { switchProject(p.id); setActiveMenuId(null); }}
                                className="btn btn-ghost btn-sm"
                                style={{ justifyContent: 'flex-start', fontSize: '0.76rem', gap: '8px', color: 'var(--text-primary)' }}
                              >
                                <LayoutDashboard size={13} />
                                <span>Switch Workspace</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => { handleCopyInviteLink(e, p); setActiveMenuId(null); }}
                                className="btn btn-ghost btn-sm"
                                style={{ justifyContent: 'flex-start', fontSize: '0.76rem', gap: '8px', color: 'var(--text-primary)' }}
                              >
                                <Share2 size={13} />
                                <span>Invite Collaborators</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { if (isPaused) { resumeProject(p.id); } else { pauseProject(p.id); } setActiveMenuId(null); }}
                                className="btn btn-ghost btn-sm"
                                style={{ justifyContent: 'flex-start', fontSize: '0.76rem', gap: '8px', color: isPaused ? 'var(--primary)' : 'var(--warning)' }}
                              >
                                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                                <span>{isPaused ? 'Resume Project' : 'Pause Project'}</span>
                              </button>

                              {(userRole === 'owner' || p.isOwner !== false || currentMember?.role === 'leader' || (currentMember?.roleTitle && /manager|lead|architect/i.test(currentMember.roleTitle))) && projects.length > 1 && (
                                <>
                                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProjectToDelete(p);
                                      setActiveMenuId(null);
                                    }}
                                    className="btn btn-ghost btn-sm"
                                    style={{ justifyContent: 'flex-start', fontSize: '0.76rem', gap: '8px', color: 'var(--danger)' }}
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete Project</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subtitle / Description */}
                      <p 
                        style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--text-secondary)', 
                          margin: '8px 0 0 0', 
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {p.subtitle || 'Capstone engineering workspace with real-time sprint matrix and academic defenses.'}
                      </p>

                      {/* Adviser & Target Defense Matrix */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <span 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem', 
                            color: 'var(--text-primary)',
                            background: 'var(--bg-elevated)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <GraduationCap size={12} style={{ color: 'var(--primary)' }} />
                          <span>{p.adviser?.name || 'Faculty Adviser'}</span>
                        </span>

                        <span 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem', 
                            color: defenseInfo.isUrgent ? 'var(--warning)' : 'var(--text-secondary)',
                            background: defenseInfo.isUrgent ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-elevated)',
                            border: defenseInfo.isUrgent ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--border-subtle)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          <Clock size={11} />
                          <span>
                            {defenseInfo.isPast 
                              ? 'Defense Completed' 
                              : `⏳ ${defenseInfo.days}d to Defense`}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Telemetry Bar */}
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                          SPRINT TASKS
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {stats.doneTasks}/{stats.totalTasks}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                          {isFullCoding ? 'SPRINT TRACK' : isIot ? 'FIRMWARE' : 'MANUSCRIPT'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {isFullCoding ? `Phase ${p.currentPhaseId || 1} Sprint` : isIot ? 'Sensors Online' : `${stats.completedChapters}/5 Ch`}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                          {isFullCoding ? 'QA / REVIEWS' : 'REVISIONS'}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: stats.pendingRevisions > 0 ? 'var(--warning)' : 'var(--primary)', marginTop: '2px' }}>
                          {stats.pendingRevisions > 0 ? `${stats.pendingRevisions} Open` : '100% Passed'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Progress Bar & Collaborators Stack */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.74rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Phase {p.currentPhaseId || 1} Readiness
                          </span>
                        </div>
                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {p.overallProgress || 0}%
                        </span>
                      </div>
                      
                      <div className="progress-track" style={{ height: '6px', marginBottom: '10px' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${p.overallProgress || 0}%`,
                            background: isPaused 
                              ? 'var(--text-muted)' 
                              : 'linear-gradient(90deg, var(--primary), #38bdf8)'
                          }} 
                        />
                      </div>

                      {/* Real-Time Team Members & Workspace Action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {projMembers.slice(0, 4).map((member, i) => {
                              const isOnline = isMemberOnline(member.id);
                              const avatarSrc = member.avatar || (member.githubUsername ? `https://github.com/${member.githubUsername}.png` : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=10b981&color=fff&bold=true`);

                              return (
                                <div key={member.id || i} style={{ position: 'relative', marginLeft: i > 0 ? '-8px' : 0 }}>
                                  <img
                                    src={avatarSrc}
                                    alt={member.name}
                                    title={`${member.name} (${member.roleTitle || member.role}) ${isOnline ? '• Real-Time Online 🟢' : ''}`}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: isOnline ? '2px solid #10b981' : '2px solid var(--bg-card)',
                                      boxShadow: isOnline ? '0 0 6px rgba(16,185,129,0.6)' : '0 2px 6px rgba(0,0,0,0.3)',
                                      display: 'block'
                                    }}
                                  />
                                  {isOnline && (
                                    <span
                                      style={{
                                        position: 'absolute',
                                        bottom: '-1px',
                                        right: '-1px',
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        border: '1.5px solid var(--bg-card)',
                                        boxShadow: '0 0 4px #10b981'
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                background: hasOnline ? '#10b981' : 'var(--text-muted)',
                                boxShadow: hasOnline ? '0 0 6px rgba(16,185,129,0.7)' : 'none',
                                display: 'inline-block',
                                animation: hasOnline ? 'pulse-presence-ring 2s infinite ease-in-out' : 'none'
                              }} 
                            />
                            <span style={{ fontSize: '0.72rem', color: hasOnline ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                              {projMembers.length} {projMembers.length === 1 ? 'member' : 'members'}
                              {hasOnline && (
                                <span style={{ color: '#10b981', marginLeft: '4px', fontWeight: 700 }}>
                                  ({onlineMembers.length} online)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        <span 
                          style={{ 
                            fontSize: '0.76rem', 
                            fontWeight: 700, 
                            color: 'var(--primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                          }}
                        >
                          <span>Open Workspace</span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      {/* Join Project Modal */}
      <JoinProjectModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        initialCode={joinInitialCode}
        onSuccessNavigate={() => onSelectProject(activeProjectId)}
      />

      {/* Invite Collaborator Modal (Permission Management by Lead) */}
      <InviteCollaboratorModal
        isOpen={!!inviteProjectModal}
        onClose={() => setInviteProjectModal(null)}
        project={inviteProjectModal}
      />

      {/* Delete Project Modal (Typed Name Verification) */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onConfirmDelete={(id) => deleteProject(id)}
      />
    </div>
  );
};
