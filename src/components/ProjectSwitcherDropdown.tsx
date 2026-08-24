import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  FolderKanban, 
  ChevronDown, 
  Plus, 
  Search, 
  Check, 
  Layers, 
  Grid,
  CheckCircle2
} from 'lucide-react';

interface ProjectSwitcherDropdownProps {
  onOpenCreateProject: () => void;
  onOpenProjectsOverview?: () => void;
  compact?: boolean;
}

export const ProjectSwitcherDropdown: React.FC<ProjectSwitcherDropdownProps> = ({
  onOpenCreateProject,
  onOpenProjectsOverview,
  compact = false
}) => {
  const { projects, project, activeProjectId, switchProject, tasks } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Project Switcher Pill Button */}
      <button
        type="button"
        id="project-switcher-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="btn btn-ghost btn-emil-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: compact ? '4px 8px' : '5px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          height: compact ? '32px' : '34px',
          maxWidth: compact ? '160px' : '230px',
          cursor: 'pointer'
        }}
        title={`Active Project Board: ${project.title}`}
      >
        <div 
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'rgba(48, 209, 88, 0.15)',
            border: '1px solid rgba(48, 209, 88, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0
          }}
        >
          <FolderKanban size={11} />
        </div>

        <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
          <div 
            style={{ 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {project.title}
          </div>
        </div>

        <span 
          style={{ 
            fontSize: '0.64rem', 
            fontFamily: 'var(--font-mono)', 
            color: 'var(--text-muted)',
            flexShrink: 0,
            display: compact ? 'none' : 'inline-block'
          }}
        >
          P{project.currentPhaseId || 1}
        </span>

        <ChevronDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </button>

      {/* Projects Dropdown Menu */}
      {isOpen && (
        <div
          className="dropdown-popover origin-top-left animate-emil-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '320px',
            maxHeight: '440px',
            padding: '10px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 6px 4px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              Project Boards ({projects.length})
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
              1 Active at a time
            </span>
          </div>

          {/* Search Filter */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find project board..."
              className="input-field"
              style={{ paddingLeft: '28px', height: '30px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
              autoFocus
            />
          </div>

          {/* List of Projects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredProjects.map(p => {
              const isCurrent = p.id === activeProjectId;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    switchProject(p.id);
                    setIsOpen(false);
                  }}
                  className="dropdown-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '5px', 
                        background: isCurrent ? 'var(--primary)' : 'var(--bg-elevated)', 
                        color: isCurrent ? '#061109' : 'var(--text-secondary)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FolderKanban size={13} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Phase {p.currentPhaseId || 1}</span>
                        <span>•</span>
                        <span>{p.overallProgress || 0}% Done</span>
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                No projects matched your search.
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateProject();
              }}
              className="dropdown-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Create New Project Board</span>
            </button>

            {onOpenProjectsOverview && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenProjectsOverview();
                }}
                className="dropdown-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <Grid size={14} />
                <span>View All Projects Grid</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
