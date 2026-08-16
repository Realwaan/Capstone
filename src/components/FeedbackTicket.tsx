import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { MessageSquare, Sparkles, X, Check } from 'lucide-react';
import { MorphButton, ButtonState } from './MorphButton';
import { toast } from 'sonner';

export const FeedbackTicket: React.FC = () => {
  const { currentMember, addStandup } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcut (Escape to close, Cmd/Ctrl + Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && note.trim()) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, note]);

  const handleSubmit = () => {
    if (!note.trim() || buttonState === 'loading') return;

    setButtonState('loading');
    setTimeout(() => {
      addStandup({
        memberId: currentMember.id,
        yesterdayAccomplished: 'Logged quick research progress note',
        todayPlan: note.trim(),
        blockers: 'None'
      });
      setButtonState('success');
      toast.success('Quick progress note logged to Team Standups! 📝');

      setTimeout(() => {
        setNote('');
        setButtonState('idle');
        setIsOpen(false);
      }, 1200);
    }, 600);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: 'var(--radius-full)',
            padding: '10px 18px',
            boxShadow: '0 8px 24px rgba(94, 106, 210, 0.4)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <Sparkles size={15} />
          <span>Quick Note</span>
        </button>
      ) : (
        <div
          className="dropdown-popover"
          style={{
            width: '340px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            padding: 0
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Quick Progress / Research Note
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="btn btn-ghost btn-icon"
              style={{ width: '22px', height: '22px', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Form */}
          <div style={{ padding: '14px 16px' }}>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What milestone breakthrough or observation did you make today?"
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-sans)',
                resize: 'none',
                outline: 'none'
              }}
            />

            {/* Dotted Ticket Divider (Emil Kowalski Ticket Motif) */}
            <div style={{ position: 'relative', margin: '12px 0 10px' }}>
              <div style={{ borderTop: '1px dashed var(--border-subtle)', width: '100%' }} />
            </div>

            {/* Footer with Emil Multi-State MorphButton */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ⌘ + Enter to log
              </span>

              <MorphButton
                state={buttonState}
                onClick={handleSubmit}
                disabled={!note.trim()}
                size="sm"
                variant="primary"
                loadingText="Logging..."
                successText="Logged!"
              >
                Log Note
              </MorphButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
