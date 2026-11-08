import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProject } from '../context/ProjectContext';
import { X, MessageSquareCheck, Sparkles, AlertCircle, Clock, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { MorphButton, ButtonState } from './MorphButton';
import { toast } from 'sonner';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose }) => {
  const { addRevision, project } = useProject();

  const [source, setSource] = useState(project?.adviser?.name || 'Faculty Adviser');
  const [chapterOrComponent, setChapterOrComponent] = useState('Chapter 3: Methodology');
  const [comment, setComment] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'verified'>('pending');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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
        status,
      });
      setButtonState('success');
      toast.success('Adviser directive logged to Revisions Matrix!');

      setTimeout(() => {
        setComment('');
        setActionTaken('');
        setButtonState('idle');
        onClose();
      }, 450);
    }, 350);
  };

  const chapterOptions = [
    'Code Structure & Module Layout',
    'Code Formatting & Indentation',
    'Type Annotations & Strict Mode',
    'System Architecture & APIs',
    'Frontend UI & Responsiveness',
    'Database Schema & Security',
    'Automated Tests & Build Output',
  ];

  const directiveSuggestions = [
    'Standardize indentation, spacing, and formatting across module files',
    'Refactor deeply nested conditionals into clean guard clauses',
    'Add explicit parameter and return type annotations to exported functions',
    'Split oversized file into modular single-responsibility components',
    'Add unit test coverage for edge-case inputs and error handling',
  ];

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 1300,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-content animate-emil-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-card)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(48, 209, 88, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquareCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Log Code Structure & Output Directive
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Record code structure findings, formatting feedback, and output verification requirements
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="grid-cols-2" style={{ gap: '14px' }}>
            <div>
              <label className="input-label">Directive Source (Adviser / Reviewer) *</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Lead Code Reviewer / Faculty Adviser"
                className="input-field"
                required
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label className="input-label">Affected Module or Component *</label>
              <input
                type="text"
                value={chapterOrComponent}
                onChange={(e) => setChapterOrComponent(e.target.value)}
                placeholder="e.g. Code Structure & Module Layout"
                className="input-field"
                required
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Quick Select Component Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Tag size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Target Select:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {chapterOptions.map((chap) => (
                <button
                  type="button"
                  key={chap}
                  onClick={() => setChapterOrComponent(chap)}
                  className={`filter-chip ${chapterOrComponent === chap ? 'is-active' : ''}`}
                  style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                >
                  {chap}
                </button>
              ))}
            </div>
          </div>

          {/* Directive Text Area */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="input-label" style={{ margin: 0 }}>Adviser Critique / Formal Directive *</label>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Exact remarks given</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter the specific revision directive, recommendation, or defense question..."
              className="input-field"
              rows={3}
              required
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
            {/* Directive Starter Suggestions */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {directiveSuggestions.map((dir) => (
                <button
                  type="button"
                  key={dir}
                  onClick={() => setComment(dir)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  + {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <label className="input-label">Resolution Strategy / Action Taken (Optional)</label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="Describe the code structure, formatting, or architectural modifications implemented..."
              className="input-field"
              rows={2}
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          {/* Initial Status Selector (Monday.com-Style Pills) */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px' }}>Initial Directive Status</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { val: 'pending', label: 'Action Required', pillClass: 'status-pill-pending', icon: <AlertCircle size={12} /> },
                { val: 'in_progress', label: 'In Progress', pillClass: 'status-pill-in_progress', icon: <Clock size={12} /> },
                { val: 'resolved', label: 'Resolved (Ready for Review)', pillClass: 'status-pill-resolved', icon: <CheckCircle2 size={12} /> },
                { val: 'verified', label: 'Verified by Adviser', pillClass: 'status-pill-verified', icon: <ShieldCheck size={12} /> },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setStatus(opt.val as any)}
                  className={`status-pill ${opt.pillClass}`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    opacity: status === opt.val ? 1 : 0.45,
                    border: status === opt.val ? '1px solid currentColor' : '1px solid transparent',
                    boxShadow: status === opt.val ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <span className="status-pill-dot" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer with Emil Kowalski MorphButton & Keyboard Shortcut */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <kbd style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginRight: '4px' }}>
                Cmd/Ctrl
              </kbd>
              <kbd style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginRight: '6px' }}>
                Enter
              </kbd>
              to log
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <MorphButton
                type="submit"
                state={buttonState}
                variant="primary"
                loadingText="Logging Directive..."
                successText="Directive Logged!"
                disabled={!comment.trim()}
              >
                Log Directive
              </MorphButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
