import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Check, Copy, Zap, ShieldAlert, ShieldCheck } from 'lucide-react';
import { CapstoneProject } from '../types';
import { useProject } from '../context/ProjectContext';
import { cleanProjectTitle } from '../lib/projectGenerator';
import { toast } from 'sonner';

interface DeleteProjectModalProps {
  project: CapstoneProject | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (projectId: string) => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  const { currentMember, currentRole, isOwner } = useProject();
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !project) return null;

  const roleTitle = (currentMember?.roleTitle || '').toLowerCase();
  const userRole = (currentRole || currentMember?.role || project?.userRole || 'member').toLowerCase();
  const isLeaderOrManager = Boolean(
    isOwner ||
    project?.isOwner !== false ||
    currentMember?.permissionLevel === 'owner' ||
    userRole === 'owner' ||
    userRole === 'leader' ||
    /manager|lead|architect|director|head|admin/i.test(roleTitle)
  );

  const displayTitle = cleanProjectTitle(project.title) || project.title.trim();
  const isMatched = 
    confirmInput.trim() === displayTitle.trim() || 
    confirmInput.trim() === project.title.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeaderOrManager) {
      toast.error('Unauthorized', {
        description: 'Only the Project Leader or Project Manager is authorized to delete this workspace.'
      });
      return;
    }
    if (!isMatched || isDeleting) return;

    setIsDeleting(true);
    try {
      onConfirmDelete(project.id);
      onClose();
      setConfirmInput('');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmInput('');
    onClose();
  };

  const handleQuickFill = () => {
    setConfirmInput(displayTitle);
    toast.info('Project title inserted into verification field');
  };

  return createPortal(
    <div 
      className="modal-backdrop" 
      onClick={handleClose} 
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div 
        className="modal-content animate-emil-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '500px', 
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(239, 68, 68, 0.35)', 
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px -15px rgba(239, 68, 68, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '18px 22px', 
          borderBottom: '1px solid var(--border-subtle)', 
          background: 'var(--bg-card)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'rgba(239, 68, 68, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--danger)',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Delete Capstone Project
              </h3>
              <div style={{ fontSize: '0.73rem', color: 'var(--danger)', fontWeight: 600, marginTop: '2px' }}>
                Irreversible Workspace Destruction
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleClose} 
            className="btn btn-ghost btn-icon" 
            style={{ width: '30px', height: '30px', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          {/* Authorization Check Banner */}
          {!isLeaderOrManager ? (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.12)', 
                border: '1px solid rgba(239, 68, 68, 0.35)', 
                padding: '14px 16px', 
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--danger)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} />
                <span>Restricted to Project Leader or Manager</span>
              </div>
              Only users designated as <strong>Project Leader</strong> or <strong>Project Manager</strong> have authorization to delete this workspace.
            </div>
          ) : (
            <div 
              style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.09) 0%, rgba(220, 38, 38, 0.04) 100%)', 
                border: '1px solid rgba(239, 68, 68, 0.25)', 
                padding: '14px 16px', 
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--danger)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                <AlertTriangle size={15} />
                <span>Warning: Permanent Data Wipe</span>
              </div>
              This action <strong>CANNOT</strong> be undone. This will permanently erase the project <strong style={{ color: 'var(--danger)' }}>{displayTitle}</strong>, including all sprint tasks, milestone deliverables, manuscript drafts, and real-time logs.
            </div>
          )}

          {/* Verification Input Area */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <label className="input-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                To verify, type the project name:
              </label>
              {isLeaderOrManager && (
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="btn btn-ghost btn-sm"
                  style={{ 
                    height: '22px', 
                    fontSize: '0.68rem', 
                    padding: '0 7px', 
                    gap: '4px',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '4px'
                  }}
                  title="Quick fill project title"
                >
                  <Zap size={11} />
                  <span>Auto-fill for speed</span>
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                value={confirmInput}
                disabled={!isLeaderOrManager}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder={displayTitle}
                autoFocus={isLeaderOrManager}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 14px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  borderColor: isMatched 
                    ? 'var(--danger)' 
                    : confirmInput 
                    ? 'rgba(239, 68, 68, 0.4)' 
                    : 'var(--border-card)',
                  boxShadow: isMatched ? '0 0 0 3px rgba(239, 68, 68, 0.18)' : 'none',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 160ms var(--ease-out)',
                  opacity: isLeaderOrManager ? 1 : 0.5
                }}
              />
              {isMatched && (
                <div style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Check size={16} />
                </div>
              )}
            </div>

            <div style={{ marginTop: '6px', fontSize: '0.72rem', color: isMatched ? 'var(--danger)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {isMatched ? '✓ Project name confirmed.' : `Target: "${displayTitle}"`}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary btn-sm"
              disabled={isDeleting}
              style={{ height: '36px', padding: '0 16px', fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isLeaderOrManager || !isMatched || isDeleting}
              className="btn btn-sm"
              style={{
                height: '36px',
                padding: '0 18px',
                background: (isLeaderOrManager && isMatched)
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                  : 'var(--bg-card)',
                color: (isLeaderOrManager && isMatched) ? '#ffffff' : 'var(--text-muted)',
                border: (isLeaderOrManager && isMatched)
                  ? '1px solid rgba(255, 255, 255, 0.2)' 
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: (isLeaderOrManager && isMatched)
                  ? 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 14px rgba(239, 68, 68, 0.35)' 
                  : 'none',
                gap: '7px',
                cursor: (isLeaderOrManager && isMatched) ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: '0.82rem',
                opacity: (isLeaderOrManager && isMatched) ? 1 : 0.6,
                transition: 'all 160ms var(--ease-out)'
              }}
            >
              <Trash2 size={14} />
              <span>{isDeleting ? 'Deleting...' : 'Delete this project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
