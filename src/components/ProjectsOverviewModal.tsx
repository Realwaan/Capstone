import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Trash2, 
  X,
  Copy,
  Check,
  Sparkles,
  KanbanSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { DeleteProjectModal } from './DeleteProjectModal';
import { CapstoneProject } from '../types';
import { cleanProjectTitle } from '../lib/projectGenerator';

interface ProjectsOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject: () => void;
  onNavigateToSettings?: () => void;
}

export const ProjectsOverviewModal: React.FC<ProjectsOverviewModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateProject,
  onNavigateToSettings
}) => {
  const { 
    projects, 
    activeProjectId, 
    switchProject, 
    deleteProject,
    currentMember,
    currentRole,
    isOwner
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<CapstoneProject | null>(null);

  const roleTitle = (currentMember?.roleTitle || '').toLowerCase();
  const isLeaderOrManager = Boolean(
    isOwner || 
    currentMember?.permissionLevel === 'owner' || 
    currentRole === 'leader' || 
    /manager|lead|architect|director|head|admin/i.test(roleTitle)
  );

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.organization && p.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        className="modal-content animate-emil-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(48, 209, 88, 0.14)',
                border: '1px solid rgba(48, 209, 88, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <FolderKanban size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                All Capstone Project Boards
              </h2>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Switch between active project workspaces or launch a new project board
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                onClose();
                onOpenCreateProject();
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={14} />
              <span>New Project Board</span>
            </button>

            <button 
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ width: '32px', height: '32px', padding: 0 }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, department, or keyword..."
              className="input-field"
              style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.74rem', padding: '6px 10px' }}>
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Project Board' : 'Project Boards'}
          </span>
        </div>

        {/* Projects Grid */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredProjects.map(p => {
            const isCurrent = p.id === activeProjectId;

            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1.5px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  boxShadow: isCurrent ? '0 0 16px rgba(48, 209, 88, 0.12)' : 'none',
                  transition: 'transform 140ms ease, border-color 140ms ease'
                }}
              >
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div 
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        background: isCurrent ? 'var(--primary)' : 'var(--bg-card)',
                        color: isCurrent ? '#061109' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <KanbanSquare size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cleanProjectTitle(p.title) || p.title}
                      </h3>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.organization || 'Capstone Workspace'}
                      </div>
                    </div>
                  </div>

                  <span 
                    className={`badge ${isCurrent ? 'badge-primary' : 'badge-neutral'}`}
                    style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', textTransform: 'uppercase' }}
                  >
                    {isCurrent ? 'ACTIVE' : 'READY'}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, minHeight: '32px' }}>
                  {p.subtitle || 'Collaborative capstone milestone and research verification workspace.'}
                </p>

                {/* Readiness Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Milestone Progress (Phase {p.currentPhaseId || 1})</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{p.overallProgress || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(p.overallProgress || 0, 4)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #38bdf8)', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Target Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                    <span>Target Defense: {p.targetDefenseDate || '2026-11-30'}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                  {isCurrent ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, gap: '4px', fontSize: '0.76rem', justifyContent: 'center' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Current Workspace</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        switchProject(p.id);
                        onClose();
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, gap: '4px', fontSize: '0.76rem', justifyContent: 'center' }}
                    >
                      <span>Open Project Board</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {/* Delete Option (for secondary projects) - Restricted to Project Leader or Manager */}
                  {projects.length > 1 && (isLeaderOrManager || p.userRole === 'owner' || p.isOwner !== false) && (
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(p)}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '30px', height: '30px', padding: 0, color: 'var(--danger)' }}
                      title="Delete project board (Project Leader / Manager only)"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dashed "Create New Project Board" Card */}
          <div
            onClick={() => {
              onClose();
              onOpenCreateProject();
            }}
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              minHeight: '220px',
              background: 'transparent',
              transition: 'border-color 140ms ease, background-color 140ms ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Plus size={20} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Create New Project Board
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '200px' }}>
                Spin up a fresh workspace with dedicated Kanban matrix & milestones.
              </div>
            </div>
          </div>
        </div>
      </div>

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
