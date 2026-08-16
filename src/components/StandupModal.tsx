import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, Send, Sparkles, CheckCircle2, MessageSquare, AlertCircle, Wand2 } from 'lucide-react';
import { MorphButton, ButtonState } from './MorphButton';
import { toast } from 'sonner';
import { polishStandupWithAI } from '../lib/gemini';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { label: '🚀 High Momentum', value: '🚀 High Momentum' },
  { label: '⚡ Deep Dev & Code', value: '⚡ Deep Dev & Code' },
  { label: '🔬 Research & Writing', value: '🔬 Research & Writing' },
  { label: '☕ Collaborative Review', value: '☕ Collaborative Review' }
];

export const StandupModal: React.FC<StandupModalProps> = ({ isOpen, onClose }) => {
  const { addStandup, currentMember, githubUser } = useProject();

  const [yesterdayAccomplished, setYesterdayAccomplished] = useState('');
  const [todayPlan, setTodayPlan] = useState('');
  const [blockers, setBlockers] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOODS[0].value);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [isPolishing, setIsPolishing] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit, Escape to close
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
  }, [isOpen, yesterdayAccomplished, todayPlan, blockers, selectedMood]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!yesterdayAccomplished.trim() || !todayPlan.trim() || buttonState === 'loading') return;

    setButtonState('loading');
    setTimeout(() => {
      addStandup({
        memberId: currentMember.id,
        yesterdayAccomplished: yesterdayAccomplished.trim(),
        todayPlan: `${selectedMood} — ${todayPlan.trim()}`,
        blockers: blockers.trim() || 'No active blockers.'
      });
      setButtonState('success');
      toast.success('Daily sprint standup posted successfully! 🚀');

      setTimeout(() => {
        setYesterdayAccomplished('');
        setTodayPlan('');
        setBlockers('');
        setButtonState('idle');
        onClose();
      }, 450);
    }, 400);
  };

  const handlePolishAI = async () => {
    if (!yesterdayAccomplished.trim() && !todayPlan.trim()) {
      toast.info('Please write some rough notes for yesterday or today first!');
      return;
    }
    setIsPolishing(true);
    toast.info('Polishing standup notes with Gemini AI... 🪄');
    try {
      const polished = await polishStandupWithAI(yesterdayAccomplished, todayPlan, blockers);
      setYesterdayAccomplished(polished.yesterday);
      setTodayPlan(polished.today);
      if (polished.blockers && !blockers) {
        setBlockers(polished.blockers);
      }
      toast.success('Standup polished into clean engineering bullet points! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Failed to polish standup');
    } finally {
      setIsPolishing(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={githubUser?.avatar_url || currentMember.avatar} 
              alt={currentMember.name} 
              style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-card)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Daily Sprint Standup</h3>
                <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                  {currentMember.roleTitle}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Posting as <strong style={{ color: 'var(--text-primary)' }}>{currentMember.name}</strong> • Visible to Team & Adviser
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
            <X size={16} />
          </button>
        </div>

        {/* AI Polish Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 24px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Write rough notes and let Gemini AI polish into concise bullet points.</span>
          <button
            type="button"
            onClick={handlePolishAI}
            disabled={isPolishing || (!yesterdayAccomplished.trim() && !todayPlan.trim())}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-sm)',
              gap: '5px'
            }}
          >
            <Wand2 size={12} className={isPolishing ? 'spin' : ''} />
            <span>{isPolishing ? 'Polishing...' : 'AI Polish'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Mood / Sprint Focus Pill Selector */}
          <div>
            <label className="input-label" style={{ marginBottom: '6px' }}>Sprint Focus & Working Mood</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={`btn btn-sm ${selectedMood === m.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all 140ms var(--ease-out)'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">1. What did you accomplish yesterday? *</label>
            <textarea 
              value={yesterdayAccomplished} 
              onChange={(e) => setYesterdayAccomplished(e.target.value)} 
              placeholder="e.g. Completed unit tests for triage queue API and revised Section 3.2 diagrams..." 
              className="input-field" 
              rows={3} 
              required 
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          <div>
            <label className="input-label">2. What are your main goals for today? *</label>
            <textarea 
              value={todayPlan} 
              onChange={(e) => setTodayPlan(e.target.value)} 
              placeholder="e.g. Integrate WebSocket live alert broadcast and benchmark ONNX inference latency..." 
              className="input-field" 
              rows={3} 
              required 
              style={{ fontSize: '0.82rem', resize: 'none' }}
            />
          </div>

          <div>
            <label className="input-label">3. Any blockers or dependencies holding you up?</label>
            <input 
              type="text" 
              value={blockers} 
              onChange={(e) => setBlockers(e.target.value)} 
              placeholder="e.g. None currently (or: Waiting for GPU quota / Adviser review)" 
              className="input-field" 
              style={{ fontSize: '0.82rem' }}
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
              to post standup
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <MorphButton
                type="submit"
                state={buttonState}
                variant="primary"
                loadingText="Posting..."
                successText="Standup Posted!"
                disabled={!yesterdayAccomplished.trim() || !todayPlan.trim()}
              >
                Post Standup
              </MorphButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
