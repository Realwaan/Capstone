import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, MessageSquareCheck } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { MorphButton, ButtonState } from './MorphButton';
import { toast } from 'sonner';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose }) => {
  const { addRevision, project } = useProject();

  const [source, setSource] = useState(project.adviser.name);
  const [chapterOrComponent, setChapterOrComponent] = useState('Chapter 3: Methodology');
  const [comment, setComment] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'verified'>('pending');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, source, chapterOrComponent, comment, actionTaken, status]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!comment.trim() || buttonState === 'loading') return;

    setButtonState('loading');
    setTimeout(() => {
      addRevision({
        source,
        chapterOrComponent,
        comment,
        actionTaken,
        status
      });
      setButtonState('success');
      toast.success('Adviser directive logged to Revisions Matrix! 🛡️');

      setTimeout(() => {
        setComment('');
        setActionTaken('');
        setButtonState('idle');
        onClose();
      }, 450);
    }, 350);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '18px 24px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(242, 153, 74, 0.15)', color: 'var(--warning)' }}>
              <MessageSquareCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Log Adviser / Panel Critique
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Track formal review comments, panel questions, and thesis defenses
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-cols-2">
            <div>
              <label className="input-label">Source (Adviser / Panelist Name) *</label>
              <input 
                type="text" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                className="input-field" 
                required 
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label className="input-label">Affected Chapter or Module *</label>
              <input 
                type="text" 
                value={chapterOrComponent} 
                onChange={(e) => setChapterOrComponent(e.target.value)} 
                placeholder="e.g. Chapter 3: Section 3.2 or Inference API" 
                className="input-field" 
                required 
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Critique / Revision Directive *</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Exact directive or suggestion provided by the adviser/panelist..." 
              className="input-field" 
              rows={3} 
              required 
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          <div>
            <label className="input-label">Action Taken / Resolution Strategy</label>
            <textarea 
              value={actionTaken} 
              onChange={(e) => setActionTaken(e.target.value)} 
              placeholder="Describe modifications, new experiments, or manuscript revisions..." 
              className="input-field" 
              rows={2} 
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          <div>
            <label className="input-label">Initial Status</label>
            <CustomDropdown
              value={status}
              onChange={(val) => setStatus(val as any)}
              minWidth="100%"
              options={[
                { value: 'pending', label: '🔴 Pending Action', badge: 'Action Required', badgeClass: 'badge-danger' },
                { value: 'in_progress', label: '🟡 In Progress', badge: 'Drafting Fix', badgeClass: 'badge-warning' },
                { value: 'resolved', label: '🔵 Resolved (Ready for Review)', badge: 'Ready', badgeClass: 'badge-info' },
                { value: 'verified', label: '🟢 Verified by Adviser', badge: 'Endorsed', badgeClass: 'badge-success' }
              ]}
            />
          </div>

          {/* Footer with Emil Kowalski MorphButton & Keyboard shortcut */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '6px', 
            paddingTop: '16px', 
            borderTop: '1px solid var(--border-subtle)' 
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <kbd style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginRight: '4px' }}>⌘</kbd>
              <kbd style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginRight: '6px' }}>Enter</kbd>
              to log directive
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <MorphButton
                type="submit"
                state={buttonState}
                variant="primary"
                loadingText="Logging..."
                successText="Logged!"
                disabled={!comment.trim()}
              >
                Log Directive
              </MorphButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
