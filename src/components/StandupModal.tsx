import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProject } from '../context/ProjectContext';
import {
  X, Wand2, Clock, Code2, Rocket, FileText, Coffee,
  Radio, Trophy, FileEdit, Sparkles, ChevronRight
} from 'lucide-react';
import { MorphButton, ButtonState } from './MorphButton';
import { toast } from 'sonner';
import { polishStandupWithAI } from '../lib/gemini';
import { ShinyText, Magnet, BorderTrail } from './reactbits';
import { StandupPodium } from './StandupPodium';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { label: 'Deep Dev & Code',    value: 'deep-dev',      accent: '#0a84ff', icon: Code2,    tag: 'FOCUS'   },
  { label: 'High Momentum',      value: 'high-momentum', accent: '#30d158', icon: Rocket,   tag: 'SPRINT'  },
  { label: 'Research & Writing', value: 'research',      accent: '#a855f7', icon: FileText, tag: 'CHAPTER' },
  { label: 'Sprint Review & QA', value: 'qa-review',     accent: '#ff9f0a', icon: Coffee,   tag: 'QA'      },
];

const YESTERDAY_CHIPS = [
  { text: 'Implemented GitHub API Sync' },
  { text: 'Fixed RBAC permissions bug' },
  { text: 'Drafted Chapter 3 methodology' },
  { text: 'Designed UI layout & cards' },
];

const TODAY_CHIPS = [
  { text: 'Implement live sync & Webhooks' },
  { text: 'Deploy staging build to Vercel' },
  { text: 'Finalize sprint burndown metrics' },
  { text: 'Complete proposal defense deck' },
];

const BLOCKER_CHIPS = [
  { text: 'None — on track for defense' },
  { text: 'Awaiting adviser chapter feedback' },
  { text: 'Waiting for PR code review sign-off' },
];

type ModalTab = 'standup' | 'podium';

export const StandupModal: React.FC<StandupModalProps> = ({ isOpen, onClose }) => {
  const { addStandup, currentMember, githubUser, theme } = useProject();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab]                         = useState<ModalTab>('standup');
  const [yesterdayAccomplished, setYesterdayAccomplished] = useState('');
  const [todayPlan, setTodayPlan]                         = useState('');
  const [blockers, setBlockers]                           = useState('');
  const [selectedMood, setSelectedMood]                   = useState(MOODS[0].value);
  const [buttonState, setButtonState]                     = useState<ButtonState>('idle');
  const [isPolishing, setIsPolishing]                     = useState(false);

  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = orig; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveTab('standup');
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeTab === 'standup') handleSubmit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, activeTab, yesterdayAccomplished, todayPlan, blockers, selectedMood]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!yesterdayAccomplished.trim() || !todayPlan.trim() || buttonState === 'loading') return;
    const activeMoodObj = MOODS.find(m => m.value === selectedMood) || MOODS[0];
    setButtonState('loading');
    setTimeout(() => {
      addStandup({
        memberId: currentMember.id,
        yesterdayAccomplished: yesterdayAccomplished.trim(),
        todayPlan: `[${activeMoodObj.tag}] ${todayPlan.trim()}`,
        blockers: blockers.trim() || 'No active blockers.',
      });
      setButtonState('success');
      toast.success('Standup broadcasted to team feed.', { description: 'Discord webhook notified.' });
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
      toast.info('Add some rough notes first, then re-run Polish.');
      return;
    }
    setIsPolishing(true);
    try {
      const polished = await polishStandupWithAI(yesterdayAccomplished, todayPlan, blockers);
      setYesterdayAccomplished(polished.yesterday);
      setTodayPlan(polished.today);
      if (polished.blockers && !blockers) setBlockers(polished.blockers);
      toast.success('Notes refined into engineering bullet points.');
    } catch (err: any) {
      toast.error(err.message || 'AI polish failed.');
    } finally {
      setIsPolishing(false);
    }
  };

  const todayDateStr  = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const activeMoodObj = MOODS.find(m => m.value === selectedMood) || MOODS[0];
  const accentHex     = activeMoodObj.accent;
  const tabAccentHex  = activeTab === 'standup' ? accentHex : '#D4A843';

  const sectionConfig = [
    {
      num: '01', accentHex: '#30d158',
      question: 'What did you accomplish yesterday?', required: true, hint: 'Quick-fill:',
      placeholder: 'e.g. Completed unit tests for triage queue API, revised Section 3.2 system architecture...',
      value: yesterdayAccomplished, onChange: (v: string) => setYesterdayAccomplished(v),
      chips: YESTERDAY_CHIPS,
      onChip: (c: { text: string }) => setYesterdayAccomplished(p => p ? `${p}\n- ${c.text}` : `- ${c.text}`),
      multiline: true,
    },
    {
      num: '02', accentHex: '#0a84ff',
      question: 'What are your main goals for today?', required: true, hint: 'Quick-fill:',
      placeholder: 'e.g. Integrate WebSocket live alert broadcast, benchmark ONNX inference latency...',
      value: todayPlan, onChange: (v: string) => setTodayPlan(v),
      chips: TODAY_CHIPS,
      onChip: (c: { text: string }) => setTodayPlan(p => p ? `${p}\n- ${c.text}` : `- ${c.text}`),
      multiline: true,
    },
    {
      num: '03', accentHex: '#ff9f0a',
      question: 'Any blockers or dependencies?', required: false, hint: 'Presets:',
      placeholder: 'e.g. None — or: Waiting for GPU quota / Adviser chapter review',
      value: blockers, onChange: (v: string) => setBlockers(v),
      chips: BLOCKER_CHIPS,
      onChip: (c: { text: string }) => setBlockers(c.text),
      multiline: false,
    },
  ];

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 9999,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* 1px gradient border shell */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          borderRadius: '20px',
          padding: '1px',
          background: isLight 
            ? `linear-gradient(145deg, rgba(15,23,42,0.12) 0%, ${tabAccentHex}40 45%, rgba(15,23,42,0.06) 100%)`
            : `linear-gradient(145deg, rgba(255,255,255,0.14) 0%, ${tabAccentHex}55 45%, rgba(255,255,255,0.05) 100%)`,
          boxShadow: isLight
            ? '0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15,23,42,0.08)'
            : 'var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'background 380ms var(--ease-out)',
        }}
      >
        {/* Inner panel */}
        <div style={{
          borderRadius: '19px',
          background: 'var(--bg-modal)',
          maxHeight: 'calc(90vh - 2px)',
          minHeight: 0,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <BorderTrail size={120} duration={7} trailColor={`${tabAccentHex}55`} />

          {/* ── HEADER ── */}
          <div style={{
            padding: '18px 22px 0',
            borderBottom: '1px solid var(--border-subtle)',
            background: `linear-gradient(180deg, ${tabAccentHex}08 0%, transparent 100%)`,
            position: 'relative',
            zIndex: 1,
            transition: 'background 380ms var(--ease-out)',
          }}>
            {/* Identity row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                {/* Avatar with spinning conic ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '14px',
                    background: `conic-gradient(from 0deg, ${tabAccentHex}, transparent 40%, ${tabAccentHex})`,
                    opacity: 0.5,
                    animation: 'spin 5s linear infinite',
                    transition: 'background 380ms var(--ease-out)',
                  }} />
                  <img
                    src={githubUser?.avatar_url || currentMember.avatar}
                    alt={currentMember.name}
                    style={{
                      width: '42px', height: '42px', borderRadius: '11px',
                      objectFit: 'cover', border: '2px solid var(--bg-modal)',
                      position: 'relative', zIndex: 1, display: 'block',
                    }}
                  />
                  <span style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: 'var(--primary)', border: '2px solid var(--bg-modal)',
                    zIndex: 2, boxShadow: '0 0 8px var(--primary-glow)',
                  }} />
                </div>

                {/* Title & meta */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <h3 style={{
                      margin: 0, fontSize: '1rem', fontWeight: 800,
                      fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
                      color: 'var(--text-primary)',
                    }}>
                      <ShinyText
                        text={activeTab === 'standup' ? 'Daily Sprint Standup' : 'Sprint Podium'}
                        shimmerColor="rgba(255,255,255,0.55)"
                        textColor="var(--text-primary)"
                        speed={5}
                      />
                    </h3>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: `${tabAccentHex}18`, color: tabAccentHex,
                      border: `1px solid ${tabAccentHex}35`,
                      transition: 'all 300ms var(--ease-out)',
                    }}>
                      {currentMember.roleTitle}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                      {currentMember.name}
                    </span>
                    <span style={{ color: 'var(--border-card)', fontSize: '0.75rem' }}>•</span>
                    <span style={{
                      fontSize: '0.7rem', color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Clock size={10} style={{ color: tabAccentHex }} />
                      {todayDateStr}
                    </span>
                    {activeTab === 'standup' && (
                      <>
                        <span style={{ color: 'var(--border-card)', fontSize: '0.75rem' }}>•</span>
                        <span style={{
                          fontSize: '0.64rem', color: 'var(--primary)',
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '3px', letterSpacing: '0.04em',
                        }}>
                          <Radio size={9} />
                          LIVE
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Magnet magnetStrength={2.5} activeDistance={36}>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-icon"
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    border: '1px solid var(--border-card)', background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)', transition: 'all 160ms var(--ease-out)',
                  }}
                  title="Close (Esc)"
                >
                  <X size={13} />
                </button>
              </Magnet>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {([
                { id: 'standup', label: 'Post Standup', icon: FileEdit },
                { id: 'podium',  label: 'Sprint Podium', icon: Trophy },
              ] as { id: ModalTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                const tAccent  = id === 'podium' ? '#D4A843' : accentHex;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.76rem', fontWeight: isActive ? 700 : 500,
                      fontFamily: 'var(--font-sans)',
                      padding: '9px 18px 11px',
                      border: 'none', borderRadius: 0, background: 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer', letterSpacing: '-0.01em',
                      position: 'relative', transition: 'color 200ms var(--ease-out)',
                    }}
                  >
                    <Icon size={13} style={{ color: isActive ? tAccent : 'var(--text-muted)', transition: 'color 200ms' }} />
                    {label}
                    <div style={{
                      position: 'absolute', bottom: 0, left: '12px', right: '12px',
                      height: '2px', borderRadius: '2px 2px 0 0',
                      background: isActive ? tAccent : 'transparent',
                      boxShadow: isActive ? `0 0 10px ${tAccent}60` : 'none',
                      transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── EMIL KOWALSKI AI SYNTHESIS & POLISH BAR ── */}
          {activeTab === 'standup' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              background: isLight 
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)' 
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(59, 130, 246, 0.08) 100%)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.18)',
              gap: '14px',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden'
            }}>
              {/* Dynamic specular shimmer sweep */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%)',
                animation: 'shimmerSweep 3.5s ease-in-out infinite',
                pointerEvents: 'none'
              }} />

              {/* Text & Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: 0,
                position: 'relative'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: 'rgba(147, 51, 234, 0.14)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={14} style={{ color: '#a855f7' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.35
                  }}>
                    Write rough notes — Gemini AI will condense them into concise engineering bullets.
                  </div>
                  <div style={{
                    fontSize: '0.66rem',
                    color: isLight ? '#6b21a8' : '#c084fc',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    marginTop: '2px',
                    textTransform: 'uppercase'
                  }}>
                    ✨ Flash Synthesis Engine
                  </div>
                </div>
              </div>

              {/* Polish Button */}
              <Magnet magnetStrength={3} activeDistance={36}>
                <button
                  type="button"
                  onClick={handlePolishAI}
                  disabled={isPolishing || (!yesterdayAccomplished.trim() && !todayPlan.trim())}
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    gap: '6px',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 14px rgba(124, 58, 237, 0.35)',
                    cursor: isPolishing ? 'wait' : (!yesterdayAccomplished.trim() && !todayPlan.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (!yesterdayAccomplished.trim() && !todayPlan.trim()) ? 0.65 : 1,
                    flexShrink: 0,
                    position: 'relative',
                    transition: 'all 160ms var(--ease-out)'
                  }}
                  title={(!yesterdayAccomplished.trim() && !todayPlan.trim()) ? 'Enter some notes first to polish' : 'Refine into engineering bullets'}
                >
                  <Wand2 size={13} className={isPolishing ? 'spin' : ''} />
                  <span>{isPolishing ? 'Polishing...' : 'Polish with AI'}</span>
                </button>
              </Magnet>
            </div>
          )}

          {/* ── PODIUM TAB ── */}
          {activeTab === 'podium' && <StandupPodium />}

          {/* ── FORM BODY ── */}
          {activeTab === 'standup' && (
            <form
              onSubmit={handleSubmit}
              style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}
            >
              {/* MOOD SELECTOR */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.66rem', fontWeight: 700,
                  fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px',
                }}>
                  Sprint Focus & Working Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '7px' }}>
                  {MOODS.map(m => {
                    const isSelected = selectedMood === m.value;
                    const Icon = m.icon;
                    return (
                      <button
                        type="button"
                        key={m.value}
                        onClick={() => setSelectedMood(m.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: 'var(--radius-md)',
                          border: isSelected ? `1px solid ${m.accent}50` : '1px solid var(--border-subtle)',
                          background: isSelected
                            ? `linear-gradient(135deg, ${m.accent}14 0%, ${m.accent}08 100%)`
                            : 'var(--bg-card)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '0.77rem', fontWeight: isSelected ? 700 : 500,
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          transition: 'all 180ms var(--ease-out)',
                          textAlign: 'left',
                          boxShadow: isSelected ? `0 0 0 1px ${m.accent}25, var(--shadow-sm)` : 'none',
                        }}
                      >
                        <div style={{
                          width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                          background: isSelected ? `${m.accent}20` : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? m.accent + '40' : 'var(--border-subtle)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'all 200ms var(--ease-out)',
                        }}>
                          <Icon size={13} style={{ color: isSelected ? m.accent : 'var(--text-muted)' }} />
                        </div>
                        <span style={{ flex: 1, letterSpacing: '-0.01em' }}>{m.label}</span>
                        <span style={{
                          fontSize: '0.58rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
                          letterSpacing: '0.06em', color: isSelected ? m.accent : 'var(--text-muted)',
                          opacity: isSelected ? 1 : 0.45, transition: 'all 200ms',
                        }}>
                          {m.tag}
                        </span>
                        {isSelected && (
                          <div style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: m.accent, boxShadow: `0 0 8px ${m.accent}`, flexShrink: 0,
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION CARDS */}
              {sectionConfig.map(sec => (
                <div key={sec.num} style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card)',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {/* Left accent rail */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: '2.5px',
                    background: `linear-gradient(180deg, ${sec.accentHex} 0%, ${sec.accentHex}40 100%)`,
                    borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
                  }} />
                  <div style={{ padding: '14px 16px 14px 20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
                          background: `${sec.accentHex}15`, border: `1px solid ${sec.accentHex}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{
                            fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
                            fontWeight: 800, color: sec.accentHex, letterSpacing: '0.02em',
                          }}>
                            {sec.num}
                          </span>
                        </div>
                        <label style={{
                          fontSize: '0.82rem', fontWeight: 600,
                          fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
                          margin: 0, letterSpacing: '-0.01em', cursor: 'pointer',
                        }}>
                          {sec.question}
                          {sec.required && <span style={{ color: sec.accentHex, marginLeft: '4px', fontSize: '0.85em' }}>*</span>}
                        </label>
                      </div>
                      <span style={{
                        fontSize: '0.63rem', color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)', fontWeight: 600,
                        letterSpacing: '0.02em', flexShrink: 0,
                      }}>
                        {sec.hint}
                      </span>
                    </div>

                    {/* Input */}
                    {sec.multiline ? (
                      <textarea
                        value={sec.value}
                        onChange={e => sec.onChange(e.target.value)}
                        placeholder={sec.placeholder}
                        className="input-field"
                        rows={3}
                        required={sec.required}
                        style={{
                          fontSize: '0.82rem', resize: 'none', lineHeight: 1.6,
                          background: 'var(--bg-input)', color: 'var(--text-primary)',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)',
                          padding: '10px 12px', marginBottom: '10px', outline: 'none',
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: 'var(--font-sans)',
                          transition: 'border-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out)',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = `${sec.accentHex}60`;
                          e.currentTarget.style.boxShadow  = `0 0 0 3px ${sec.accentHex}12`;
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'var(--border-card)';
                          e.currentTarget.style.boxShadow  = 'none';
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={sec.value}
                        onChange={e => sec.onChange(e.target.value)}
                        placeholder={sec.placeholder}
                        className="input-field"
                        style={{
                          fontSize: '0.82rem',
                          background: 'var(--bg-input)', color: 'var(--text-primary)',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)',
                          padding: '10px 12px', marginBottom: '10px',
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: 'var(--font-sans)',
                          transition: 'border-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out)',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = `${sec.accentHex}60`;
                          e.currentTarget.style.boxShadow  = `0 0 0 3px ${sec.accentHex}12`;
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'var(--border-card)';
                          e.currentTarget.style.boxShadow  = 'none';
                        }}
                      />
                    )}

                    {/* Quick-fill chips */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {sec.chips.map(chip => (
                        <button
                          type="button"
                          key={chip.text}
                          onClick={() => sec.onChip(chip)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.68rem', fontWeight: 500,
                            fontFamily: 'var(--font-sans)',
                            padding: '3px 9px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all 140ms var(--ease-out)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background  = `${sec.accentHex}12`;
                            e.currentTarget.style.borderColor = `${sec.accentHex}35`;
                            e.currentTarget.style.color       = 'var(--text-primary)';
                            e.currentTarget.style.transform   = 'translateY(-1px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background  = 'var(--bg-elevated)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.color       = 'var(--text-secondary)';
                            e.currentTarget.style.transform   = 'translateY(0)';
                          }}
                        >
                          <ChevronRight size={9} />
                          {chip.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* FOOTER */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '16px', borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap', gap: '12px',
              }}>
                <span style={{
                  fontSize: '0.68rem', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <kbd style={{
                    fontSize: '0.62rem', padding: '2px 6px', borderRadius: '5px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
                    color: 'var(--text-secondary)', boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
                  }}>Ctrl</kbd>
                  <kbd style={{
                    fontSize: '0.62rem', padding: '2px 6px', borderRadius: '5px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
                    color: 'var(--text-secondary)', boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
                  }}>Enter</kbd>
                  <span style={{ marginLeft: '2px' }}>to broadcast</span>
                </span>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '7px 14px' }}
                  >
                    Cancel
                  </button>
                  <Magnet magnetStrength={3} activeDistance={44}>
                    <MorphButton
                      type="submit"
                      state={buttonState}
                      variant="primary"
                      loadingText="Broadcasting..."
                      successText="Broadcasted!"
                      disabled={!yesterdayAccomplished.trim() || !todayPlan.trim()}
                      style={{
                        fontSize: '0.8rem', fontWeight: 700,
                        padding: '8px 20px', borderRadius: 'var(--radius-full)',
                        letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '7px',
                      }}
                    >
                      <Radio size={13} />
                      Post Standup
                    </MorphButton>
                  </Magnet>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
