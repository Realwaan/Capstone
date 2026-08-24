import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { 
  Search, 
  LayoutDashboard, 
  KanbanSquare, 
  Milestone, 
  BookOpen, 
  MessageSquareCheck, 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Sun, 
  Moon, 
  Check, 
  ArrowRight,
  Command,
  CornerDownLeft,
  X,
  Sparkles,
  Compass,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Flame,
  Zap,
  Database
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { startWorkspaceTour } from '../lib/tour';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
  onSelectTask?: (taskId: string) => void;
  onOpenStandupModal?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Tasks' | 'Chapters' | 'Revisions' | 'Navigation' | 'Team' | 'Actions' | 'Milestones' | 'Projects';
  icon: any;
  action: () => void;
  badge?: string;
  badgeColor?: string;
  keywords?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveView,
  onOpenNewTask,
  onOpenNewRevision,
  onSelectTask,
  onOpenStandupModal
}) => {
  const { 
    tasks, 
    phases, 
    chapters,
    revisions,
    members,
    projects,
    activeProjectId,
    switchProject,
    theme, 
    toggleTheme, 
    changeCurrentPhase, 
    isOwner,
    project 
  } = useProject();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll and auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Build Comprehensive Command Index (Tasks & Content Ranked First)
  const allItems = useMemo<CommandItem[]>(() => {
    // 1. Task Deliverables (Top search priority)
    const taskItems: CommandItem[] = (tasks || []).map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `${t.status.replace('_', ' ').toUpperCase()} • ${t.storyPoints || 3} pts • Priority: ${t.priority}`,
      category: 'Tasks',
      icon: KanbanSquare,
      badge: t.status.replace('_', ' '),
      keywords: `task ${t.title} ${t.description || ''} ${t.status} ${t.priority}`,
      action: () => {
        if (onSelectTask) {
          onSelectTask(t.id);
        } else {
          setActiveView('kanban');
        }
        onClose();
      }
    }));

    // 2. Manuscript Chapters 1–5
    const chapterItems: CommandItem[] = (chapters || []).map(c => ({
      id: `chapter-${c.id}`,
      title: `Chapter ${c.chapterNumber}: ${c.title}`,
      subtitle: `${c.subtitle} • Status: ${c.adviserStatus.replace('_', ' ').toUpperCase()} • ${c.wordCount || 0}/${c.targetWordCount || 0} words`,
      category: 'Chapters',
      icon: BookOpen,
      badge: `${c.adviserStatus.replace('_', ' ')}`,
      keywords: `chapter ${c.chapterNumber} ${c.title} ${c.subtitle} manuscript thesis literature methodology results conclusion`,
      action: () => {
        setActiveView('manuscript');
        onClose();
      }
    }));

    // 3. Adviser Directives & Revisions
    const revisionItems: CommandItem[] = (revisions || []).map(r => ({
      id: `revision-${r.id}`,
      title: r.comment,
      subtitle: `Source: ${r.source} • Component: ${r.chapterOrComponent} • Status: ${r.status.toUpperCase()}`,
      category: 'Revisions',
      icon: MessageSquareCheck,
      badge: r.status,
      keywords: `revision directive feedback ${r.comment} ${r.source} ${r.chapterOrComponent}`,
      action: () => {
        setActiveView('revisions');
        onClose();
      }
    }));

    // 4. Navigation Views
    const navigation: CommandItem[] = [
      { id: 'nav-dashboard', title: 'Overview Dashboard & Telemetry', subtitle: 'Sprint burndown, velocity, and readiness stats', category: 'Navigation', icon: LayoutDashboard, keywords: 'dashboard home overview burndown telemetry', action: () => { setActiveView('dashboard'); onClose(); } },
      { id: 'nav-kanban', title: 'Task Matrix & Kanban Board', subtitle: 'Drag & drop task board with ticket claiming', category: 'Navigation', icon: KanbanSquare, keywords: 'kanban tasks matrix board backlog in progress done', action: () => { setActiveView('kanban'); onClose(); } },
      { id: 'nav-github', title: 'GitHub Repository Hub', subtitle: 'Branch status, commits, pull requests, and Git issues', category: 'Navigation', icon: GitHubIcon, keywords: 'github git commits branches pr repository code', action: () => { setActiveView('github'); onClose(); } },
      { id: 'nav-timeline', title: 'Milestones & Gantt Roadmap', subtitle: 'Phase progression, defense target dates, and deliverables', category: 'Navigation', icon: Milestone, keywords: 'timeline milestones gantt roadmap schedule defense date', action: () => { setActiveView('timeline'); onClose(); } },
      { id: 'nav-manuscript', title: 'Thesis Manuscript & Chapters 1–5', subtitle: 'Drafting portal with APA 7th format compliance', category: 'Navigation', icon: BookOpen, keywords: 'manuscript thesis paper document chapters book write', action: () => { setActiveView('manuscript'); onClose(); } },
      { id: 'nav-revisions', title: 'Adviser Directives & Revisions Table', subtitle: 'Compliance matrix and faculty sign-off records', category: 'Navigation', icon: MessageSquareCheck, keywords: 'revisions feedback faculty adviser critique comments', action: () => { setActiveView('revisions'); onClose(); } },
      { id: 'nav-team', title: 'Team Directory & Standups', subtitle: 'Teammates presence, roles, and async check-ins', category: 'Navigation', icon: Users, keywords: 'team members standup roles who is online presence', action: () => { setActiveView('team'); onClose(); } },
      { id: 'nav-reports', title: 'Progress Reports & PDF Export', subtitle: 'Defense panel summaries and institutional printouts', category: 'Navigation', icon: FileText, keywords: 'reports export pdf summary institutional metrics', action: () => { setActiveView('reports'); onClose(); } },
      { id: 'nav-settings', title: 'Workspace Settings & Cloud Sync', subtitle: 'Supabase PostgreSQL sync, Gemini API, and Discord webhooks', category: 'Navigation', icon: Settings, keywords: 'settings config supabase gemini discord database backup', action: () => { setActiveView('settings'); onClose(); } }
    ];

    // 5. Team Members
    const memberItems: CommandItem[] = (members || []).map(m => ({
      id: `member-${m.id}`,
      title: m.name,
      subtitle: `${m.roleTitle || 'Developer'} • ${m.permissionLevel === 'owner' ? 'Lead (Owner)' : m.permissionLevel === 'adviser' ? 'Faculty Adviser' : 'Member'} • ${m.email}`,
      category: 'Team',
      icon: Users,
      badge: m.role,
      keywords: `member user ${m.name} ${m.email} ${m.roleTitle} ${m.githubUsername || ''}`,
      action: () => {
        setActiveView('team');
        onClose();
      }
    }));

    // 6. Explicit Actions & Commands
    const actions: CommandItem[] = [
      {
        id: 'act-new-task',
        title: 'Create New Task Deliverable',
        subtitle: 'Add a new task ticket with story points and ISO 25010 tags',
        category: 'Actions',
        icon: Plus,
        keywords: 'create new task ticket story deliverable bug feature',
        action: () => { onOpenNewTask(); onClose(); }
      },
      {
        id: 'act-tour',
        title: 'Start Interactive Guided Tour (Driver.js)',
        subtitle: 'Spotlight walkthrough across defense countdown, task board, and manuscript',
        category: 'Actions',
        icon: Compass,
        keywords: 'tour help guide walkthrough onboarding tutorial driver',
        action: () => { startWorkspaceTour(); onClose(); }
      },
      {
        id: 'act-standup',
        title: 'Submit Daily Asynchronous Standup',
        subtitle: 'Log accomplished yesterday, sprint goals, and blockers with Gemini AI',
        category: 'Actions',
        icon: Users,
        keywords: 'daily standup async update blocker progress sprint checkin scrum',
        action: () => { 
          onClose();
          if (onOpenStandupModal) {
            setTimeout(() => onOpenStandupModal(), 80);
          } else {
            setActiveView('team');
          }
        }
      },
      {
        id: 'act-new-revision',
        title: 'Log Faculty Adviser Revision Directive',
        subtitle: 'Record panel feedback notes, section target, and defense compliance',
        category: 'Actions',
        icon: MessageSquareCheck,
        keywords: 'revision feedback comment adviser professor critique directive',
        action: () => { onOpenNewRevision(); onClose(); }
      },
      {
        id: 'act-theme',
        title: `Toggle Theme: Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Switch between Velvet Obsidian dark mode and Apple light slate',
        category: 'Actions',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: 'theme dark light mode toggle contrast',
        action: () => { toggleTheme(); onClose(); }
      }
    ];

    // 7. Lead Phase Advancement
    const phaseItems: CommandItem[] = isOwner ? [1, 2, 3, 4, 5].map(pId => ({
      id: `phase-${pId}`,
      title: `Set Active Phase: Phase ${pId}`,
      subtitle: `Advance project roadmap stage to Phase ${pId}`,
      category: 'Milestones',
      icon: Milestone,
      keywords: `phase ${pId} milestone switch advance stage`,
      action: () => { changeCurrentPhase(pId); onClose(); }
    })) : [];

    // 8. Multi-Project Switcher
    const projectItems: CommandItem[] = projects.map(p => ({
      id: `proj-${p.id}`,
      title: `Switch to Project: ${p.title}`,
      subtitle: `${p.organization || 'Capstone Workspace'} • ${p.region || 'ap-southeast-1'} • ${p.overallProgress || 0}%`,
      category: 'Projects',
      icon: Database,
      badge: p.id === activeProjectId ? 'ACTIVE' : undefined,
      badgeColor: p.id === activeProjectId ? 'badge-primary' : undefined,
      keywords: `project switch ${p.title} ${p.organization || ''} ${p.region || ''}`,
      action: () => { switchProject(p.id); setActiveView('dashboard'); onClose(); }
    }));

    return [
      ...navigation,
      ...projectItems,
      ...taskItems,
      ...chapterItems,
      ...revisionItems,
      ...memberItems,
      ...actions,
      ...phaseItems
    ];
  }, [tasks, chapters, revisions, members, projects, activeProjectId, switchProject, theme, isOwner, onOpenNewTask, onOpenNewRevision, onSelectTask, onOpenStandupModal, setActiveView, toggleTheme, changeCurrentPhase]);

  // Fuzzy filter & relevance ranking
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Return curated quick navigation and top actions when query is empty
      return allItems.filter(i => i.category === 'Navigation' || i.id === 'act-new-task' || i.id === 'act-tour');
    }
    const cleanQuery = query.toLowerCase().trim();
    
    return allItems.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(cleanQuery);
      const matchKeywords = item.keywords?.toLowerCase().includes(cleanQuery);
      return matchTitle || matchSubtitle || matchKeywords;
    });
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 10, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(60px, 14vh, 120px)',
        animation: 'modalBackdropFadeIn 160ms var(--ease-out)'
      }}
    >
      <div 
        className="modal-content animate-emil-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
          width: '92%',
          padding: 0, 
          overflow: 'hidden',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: '18px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.2)',
          animation: 'modalSlideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Search Header Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}>
          <Search size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search tasks, chapters, team, adviser feedback, navigation..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="command-palette-input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.01em'
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          ) : (
            <kbd style={{
              fontSize: '0.66rem',
              padding: '2px 6px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              ESC
            </kbd>
          )}
        </div>

        {/* Command Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div 
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(22, 163, 74, 0.35)' : 'transparent',
                  transition: 'all 120ms var(--ease-out)',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    border: isSelected ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    flexShrink: 0
                  }}>
                    <Icon size={15} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '1px'
                      }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.64rem', textTransform: 'capitalize', background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}>
                    {item.category}
                  </span>
                  {isSelected && (
                    <CornerDownLeft size={14} style={{ color: 'var(--primary)' }} />
                  )}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🔍</div>
              No results found matching "{query}"
              <p style={{ fontSize: '0.74rem', margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                Search for tasks, chapters, team, adviser feedback, or navigation views.
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
          <span>⚡ Power Command Palette</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
