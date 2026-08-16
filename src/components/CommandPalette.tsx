import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ViewType) => void;
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveView,
  onOpenNewTask,
  onOpenNewRevision
}) => {
  const { 
    tasks, 
    phases, 
    theme, 
    toggleTheme, 
    changeCurrentPhase, 
    isOwner,
    project 
  } = useProject();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command items
  const navigationCommands = [
    { id: 'nav-dashboard', title: 'Go to Overview Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => { setActiveView('dashboard'); onClose(); } },
    { id: 'nav-kanban', title: 'Go to Task Matrix & Kanban', category: 'Navigation', icon: KanbanSquare, action: () => { setActiveView('kanban'); onClose(); } },
    { id: 'nav-github', title: 'Go to GitHub Repository Hub', category: 'Navigation', icon: GitHubIcon, action: () => { setActiveView('github'); onClose(); } },
    { id: 'nav-timeline', title: 'Go to Milestones & Gantt Roadmap', category: 'Navigation', icon: Milestone, action: () => { setActiveView('timeline'); onClose(); } },
    { id: 'nav-revisions', title: 'Go to Adviser Directives & Revisions', category: 'Navigation', icon: MessageSquareCheck, action: () => { setActiveView('revisions'); onClose(); } },
    { id: 'nav-team', title: 'Go to Team & Asynchronous Standups', category: 'Navigation', icon: Users, action: () => { setActiveView('team'); onClose(); } },
    { id: 'nav-reports', title: 'Go to Progress Reports & Defense Exports', category: 'Navigation', icon: FileText, action: () => { setActiveView('reports'); onClose(); } },
    { id: 'nav-settings', title: 'Go to Project Settings & Backups', category: 'Navigation', icon: Settings, action: () => { setActiveView('settings'); onClose(); } }
  ];

  const actionCommands = [
    { id: 'act-new-task', title: 'Create New Detailed Task', category: 'Actions', icon: Plus, action: () => { onOpenNewTask(); onClose(); } },
    { id: 'act-new-revision', title: 'Log Adviser Revision Directive', category: 'Actions', icon: MessageSquareCheck, action: () => { onOpenNewRevision(); onClose(); } },
    { id: 'act-theme', title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'Actions', icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); onClose(); } }
  ];

  // Lead Phase Advancement commands
  const phaseCommands = isOwner ? [1, 2, 3, 4, 5].map(pId => ({
    id: `phase-${pId}`,
    title: `Set Active Phase: Phase ${pId}`,
    category: 'Milestone Control',
    icon: Milestone,
    action: () => { changeCurrentPhase(pId); onClose(); }
  })) : [];

  // Task search items
  const taskCommands = tasks.map(t => ({
    id: `task-${t.id}`,
    title: t.title,
    category: `Task (${t.status.replace('_', ' ')})`,
    icon: KanbanSquare,
    action: () => { setActiveView('kanban'); onClose(); }
  }));

  const allItems = [...actionCommands, ...navigationCommands, ...phaseCommands, ...taskCommands];

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

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

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '620px', 
          padding: 0, 
          overflow: 'hidden',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
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
          <Search size={18} style={{ color: 'var(--primary)' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search anything (Tasks, Views, Phase controls)..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sans)'
            }}
          />
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
        </div>

        {/* Command Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
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
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(94, 106, 210, 0.3)' : 'transparent',
                  transition: 'background 120ms var(--ease-out)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Icon size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                    {item.category}
                  </span>
                  {isSelected && (
                    <CornerDownLeft size={13} style={{ color: 'var(--primary)' }} />
                  )}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              No commands or tasks found matching "{query}"
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
          <span>CapStoneFlow Command Menu</span>
        </div>
      </div>
    </div>
  );
};
