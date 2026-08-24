import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ViewType } from './Sidebar';
import { 
  Rocket, 
  Check, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Code2, 
  Palette, 
  FileText, 
  GraduationCap, 
  Database, 
  Sparkles, 
  MessageSquare, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { isSupabaseConfigured } from '../lib/supabase';
import { isDiscordConfigured } from '../lib/discord';
import { isGeminiConfigured } from '../lib/gemini';
import { toast } from 'sonner';
import { SpotlightCard, ShinyText, Magnet, BorderTrail } from './reactbits';
import { startWorkspaceTour } from '../lib/tour';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: ViewType) => void;
}

const ROLES = [
  {
    id: 'leader',
    title: 'Project Lead & Architect',
    tag: 'OWNER • ARCHITECT',
    badgeClass: 'badge-primary',
    desc: 'System architecture, sprint planning, GitHub repo administration, and defense milestone roadmap.',
    icon: ShieldCheck,
    accent: '#30d158',
    glow: 'rgba(48, 209, 88, 0.22)'
  },
  {
    id: 'developer',
    title: 'Fullstack / Backend Developer',
    tag: 'CORE DEV • API',
    badgeClass: 'badge-info',
    desc: 'API development, database schemas, algorithms, and GitHub pull request submissions.',
    icon: Code2,
    accent: '#0a84ff',
    glow: 'rgba(10, 132, 255, 0.22)'
  },
  {
    id: 'designer',
    title: 'Frontend & UI/UX Designer',
    tag: 'UI/UX • DESIGN SYSTEM',
    badgeClass: 'badge-warning',
    desc: 'Design system implementation, client interfaces, micro-interactions, and responsive flows.',
    icon: Palette,
    accent: '#ff9f0a',
    glow: 'rgba(255, 159, 10, 0.22)'
  },
  {
    id: 'researcher',
    title: 'Technical Writer & QA Lead',
    tag: 'QA • APA 7TH MANUSCRIPT',
    badgeClass: 'badge-secondary',
    desc: 'Chapters 1–5 manuscript documentation, APA 7th compliance, ISO 25010 testing, and revisions.',
    icon: FileText,
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.22)'
  },
  {
    id: 'adviser',
    title: 'Faculty Capstone Adviser',
    tag: 'FACULTY • SUPERVISOR',
    badgeClass: 'badge-neutral',
    desc: 'Academic oversight, chapter critique, milestone sign-offs, and defense endorsements.',
    icon: GraduationCap,
    accent: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.22)'
  }
];

const STEPS = [
  { id: 1, stepNum: '01', title: 'Role & Focus', desc: 'Permissions & Persona' },
  { id: 2, stepNum: '02', title: 'Milestone Stage', desc: 'Sprint Roadmap' },
  { id: 3, stepNum: '03', title: 'Ecosystem Sync', desc: 'Live Telemetry' }
] as const;

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const { 
    project, 
    phases = [],
    currentMember, 
    updateMemberRole, 
    changeCurrentPhase,
    githubUser
  } = useProject();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState(currentMember?.roleTitle || ROLES[0].title);
  const [selectedPhase, setSelectedPhase] = useState<number>(project.currentPhaseId ? Number(project.currentPhaseId) : 1);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1) {
      if (currentMember) {
        updateMemberRole(currentMember.id, currentMember.role, selectedRole);
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      changeCurrentPhase(Number(selectedPhase));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleComplete();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('capstoneflow_onboarding_completed', 'true');
    onClose();
  };

  const handleComplete = (withTour: boolean = true) => {
    localStorage.setItem('capstoneflow_onboarding_completed', 'true');
    toast.success('Workspace Initialized! 🎉', {
      description: 'Your capstone environment is armed with live sync & AI copilot.'
    });
    onClose();
    if (withTour) {
      setTimeout(() => {
        startWorkspaceTour();
      }, 400);
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={handleDismiss}
      style={{
        zIndex: 1400,
        backgroundColor: 'rgba(3, 5, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Outer Doppelrand Chassis */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          borderRadius: '26px',
          padding: '6px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(48, 209, 88, 0.15) 100%)',
          boxShadow: '0 36px 90px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          position: 'relative',
          animation: 'modalSlideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Inner Precision Core */}
        <div
          style={{
            borderRadius: '20px',
            background: 'radial-gradient(ellipse at top left, rgba(16, 28, 48, 0.95), rgba(7, 10, 18, 0.98))',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Subtle Border Trail Orbit */}
          <BorderTrail size={120} duration={8} trailColor="rgba(48, 209, 88, 0.4)" />

          {/* Header Section */}
          <div style={{
            padding: '24px 28px 20px 28px',
            background: 'linear-gradient(180deg, rgba(48, 209, 88, 0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Top Bar with Eyebrow & Close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(48, 209, 88, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  flexShrink: 0
                }}>
                  <Rocket size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
                      <ShinyText text="Welcome to CapStoneFlow" shimmerColor="#ffffff" textColor="#f5f5f7" speed={5} />
                    </h3>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: 'rgba(48, 209, 88, 0.12)',
                      color: '#30d158',
                      border: '1px solid rgba(48, 209, 88, 0.25)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      v2.4 Ready
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Engineering stack initialization • Guided configuration in 3 steps
                  </p>
                </div>
              </div>

              <Magnet magnetStrength={2.5} activeDistance={40}>
                <button 
                  onClick={handleDismiss}
                  className="btn btn-ghost btn-icon"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.03)'
                  }}
                  title="Close"
                >
                  <X size={15} />
                </button>
              </Magnet>
            </div>

            {/* Stepper Navigation Track */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '5px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {STEPS.map(step => {
                const isCurrent = currentStep === step.id;
                const isDone = currentStep > step.id;

                return (
                  <div 
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isCurrent 
                        ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.14) 0%, rgba(10, 132, 255, 0.08) 100%)' 
                        : 'transparent',
                      border: isCurrent 
                        ? '1px solid rgba(48, 209, 88, 0.3)' 
                        : '1px solid transparent',
                      boxShadow: isCurrent ? '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 'none',
                      transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isDone 
                        ? '#30d158' 
                        : isCurrent 
                        ? 'rgba(48, 209, 88, 0.25)' 
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isDone 
                        ? '#041208' 
                        : isCurrent 
                        ? '#30d158' 
                        : 'var(--text-muted)',
                      border: isCurrent ? '1.5px solid #30d158' : 'none',
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isDone ? <Check size={13} strokeWidth={3.5} /> : step.stepNum}
                    </div>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '0.76rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard Step Body */}
          <div style={{ padding: '24px 28px', minHeight: '360px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 1 }}>
            
            {/* STEP 1: Select Role */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                      Select Your Primary Capstone Responsibility
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                      Configures your sprint command center, RBAC permissions, and daily AI standup starters.
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                  }}>
                    Step 1 of 3
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ROLES.map(role => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.title;

                    return (
                      <SpotlightCard
                        key={role.id}
                        onClick={() => setSelectedRole(role.title)}
                        spotlightColor={isSelected ? role.accent + '25' : 'rgba(255, 255, 255, 0.06)'}
                        borderColor={isSelected ? role.accent : 'rgba(255, 255, 255, 0.15)'}
                        borderRadius="12px"
                        style={{
                          padding: '12px 16px',
                          border: isSelected 
                            ? `1.5px solid ${role.accent}` 
                            : '1px solid rgba(255, 255, 255, 0.07)',
                          background: isSelected 
                            ? `linear-gradient(135deg, ${role.accent}1f 0%, rgba(10, 132, 255, 0.04) 100%)` 
                            : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isSelected ? `0 0 20px ${role.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.15)` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: isSelected ? 'scale(1.006)' : 'scale(1)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: `${role.accent}1f`,
                              color: role.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: `1px solid ${role.accent}40`,
                              boxShadow: isSelected ? `0 0 12px ${role.accent}40` : 'none'
                            }}>
                              <Icon size={19} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                  {role.title}
                                </span>
                                <span style={{
                                  fontSize: '0.58rem',
                                  fontWeight: 800,
                                  fontFamily: 'var(--font-mono)',
                                  letterSpacing: '0.06em',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: `${role.accent}1a`,
                                  color: role.accent,
                                  border: `1px solid ${role.accent}33`
                                }}>
                                  {role.tag}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.35 }}>
                                {role.desc}
                              </div>
                            </div>
                          </div>

                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? `2px solid ${role.accent}` : '1.5px solid rgba(255, 255, 255, 0.2)',
                            background: isSelected ? role.accent : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#041208',
                            flexShrink: 0,
                            transition: 'all 140ms ease',
                            boxShadow: isSelected ? `0 0 10px ${role.glow}` : 'none'
                          }}>
                            {isSelected && <Check size={12} strokeWidth={3.5} />}
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Capstone Stage */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Set Active Milestone & Thesis Sprint Phase
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                      This organizes your Gantt roadmap, defense deliverables checklist, and chapter status.
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                  }}>
                    Step 2 of 3
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(phases.length > 0
                    ? phases.map((p, idx) => ({
                        id: p.id,
                        title: p.title,
                        status: p.status === 'completed' ? 'Completed Stage' : p.status === 'in_progress' ? 'Active Stage' : 'Upcoming Stage',
                        badge: p.title.startsWith('Phase') ? (p.title.includes(':') ? p.title.split(':')[0].trim() : `PHASE ${idx + 1}`) : `PHASE ${idx + 1}`,
                        desc: p.description || 'Milestone deliverables and defense gates.',
                        deliverables: (p.keyDeliverables || []).map(d => d.title)
                      }))
                    : [
                        {
                          id: 1,
                          title: 'Phase 1: Title Proposal & Scope',
                          status: 'Proposal Stage',
                          badge: 'PHASE 1',
                          desc: 'Problem formulation, literature review matrix, research methodology, and proposal panel defense.',
                          deliverables: ['Title Approval Matrix', 'RRL Syntheses Table', 'Defense Deck']
                        }
                      ]
                  ).map(phase => {
                    const isSelected = selectedPhase === phase.id;

                    return (
                      <SpotlightCard
                        key={phase.id}
                        onClick={() => setSelectedPhase(phase.id)}
                        spotlightColor={isSelected ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.06)'}
                        borderColor={isSelected ? '#30d158' : 'rgba(255, 255, 255, 0.15)'}
                        borderRadius="12px"
                        style={{
                          padding: '14px 18px',
                          border: isSelected 
                            ? '1.5px solid rgba(48, 209, 88, 0.7)' 
                            : '1px solid rgba(255, 255, 255, 0.07)',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.12) 0%, rgba(10, 132, 255, 0.04) 100%)' 
                            : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isSelected ? '0 0 20px rgba(48, 209, 88, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {phase.title}
                              </span>
                              <span style={{
                                fontSize: '0.6rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--text-secondary)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}>
                                {phase.badge}
                              </span>
                            </div>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #30d158' : '1.5px solid rgba(255, 255, 255, 0.2)',
                              background: isSelected ? '#30d158' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#041208',
                              flexShrink: 0
                            }}>
                              {isSelected && <Check size={11} strokeWidth={3.5} />}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                            {phase.desc}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {phase.deliverables.map((d, i) => (
                              <span 
                                key={i} 
                                style={{ 
                                  fontSize: '0.66rem', 
                                  color: isSelected ? '#30d158' : 'var(--text-muted)',
                                  background: isSelected ? 'rgba(48, 209, 88, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  border: isSelected ? '1px solid rgba(48, 209, 88, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <CheckCircle2 size={10} style={{ color: isSelected ? '#30d158' : 'var(--text-muted)' }} />
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Ecosystem Telemetry Launchpad (Elevated with SpotlightCards) */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                      Workspace Integration & Protocol Health
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                      Real-time telemetry across Git version control, cloud database, AI copilot, and team hooks.
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                  }}>
                    Step 3 of 3
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* 1. GitHub Repo */}
                  <SpotlightCard
                    spotlightColor="rgba(255, 255, 255, 0.1)"
                    borderColor="rgba(255, 255, 255, 0.3)"
                    borderRadius="14px"
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: 'rgba(255, 255, 255, 0.08)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.12)'
                        }}>
                          <GitHubIcon size={17} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>GitHub Repo</span>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>Version Control</span>
                        </div>
                      </div>
                      <div className="telemetry-badge emerald">
                        <span className="telemetry-beacon emerald" />
                        <span>LIVE BOUND</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                          {(project.githubRepoUrl || 'octocat/capstone').split('/').slice(-2).join('/')}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#30d158', fontFamily: 'var(--font-mono)' }}>origin/main</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        REST v3 & GraphQL • Auto-PR Sync
                      </span>
                    </div>
                  </SpotlightCard>

                  {/* 2. Supabase DB */}
                  <SpotlightCard
                    spotlightColor="rgba(48, 209, 88, 0.18)"
                    borderColor="rgba(48, 209, 88, 0.4)"
                    borderRadius="14px"
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(145deg, rgba(48, 209, 88, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(48, 209, 88, 0.18)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: 'rgba(48, 209, 88, 0.12)', 
                          color: '#30d158', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid rgba(48, 209, 88, 0.25)'
                        }}>
                          <Database size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Supabase Cloud DB</span>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>Realtime Backend</span>
                        </div>
                      </div>
                      <div className={`telemetry-badge ${isSupabaseConfigured() ? 'emerald' : 'neutral'}`}>
                        {isSupabaseConfigured() && <span className="telemetry-beacon emerald" />}
                        <span>{isSupabaseConfigured() ? 'WSS REALTIME • 14ms' : 'LOCAL CACHE'}</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                          PostgreSQL 15 • RLS Enforced
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#30d158', fontFamily: 'var(--font-mono)' }}>TLS 1.3</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        PostgREST 12 • Realtime Channels Active
                      </span>
                    </div>
                  </SpotlightCard>

                  {/* 3. Gemini AI */}
                  <SpotlightCard
                    spotlightColor="rgba(168, 85, 247, 0.2)"
                    borderColor="rgba(168, 85, 247, 0.4)"
                    borderRadius="14px"
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.18)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: 'rgba(168, 85, 247, 0.15)', 
                          color: '#c084fc', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}>
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Gemini 1.5 AI Copilot</span>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>Neural Engine</span>
                        </div>
                      </div>
                      <div className={`telemetry-badge ${isGeminiConfigured() ? 'violet' : 'neutral'}`}>
                        {isGeminiConfigured() && <span className="telemetry-beacon violet" />}
                        <span>{isGeminiConfigured() ? 'INFERENCE READY' : 'STANDBY'}</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                          Gemini 1.5 Flash • 1M Context
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>Stream OK</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Multimodal Analysis • Sprint Assistant
                      </span>
                    </div>
                  </SpotlightCard>

                  {/* 4. Discord Bot */}
                  <SpotlightCard
                    spotlightColor="rgba(88, 101, 242, 0.2)"
                    borderColor="rgba(88, 101, 242, 0.4)"
                    borderRadius="14px"
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(145deg, rgba(88, 101, 242, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(88, 101, 242, 0.18)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: 'rgba(88, 101, 242, 0.15)', 
                          color: '#818cf8', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid rgba(88, 101, 242, 0.3)'
                        }}>
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Discord Channel Relay</span>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>Event Webhook</span>
                        </div>
                      </div>
                      <div className={`telemetry-badge ${isDiscordConfigured() ? 'blurple' : 'neutral'}`}>
                        {isDiscordConfigured() && <span className="telemetry-beacon blurple" />}
                        <span>{isDiscordConfigured() ? 'DISPATCH ARMED' : 'STANDBY'}</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                          Webhook API v10 • TLS Handshake
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>Ready</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Daily Standups & Sprint Alerts Pub/Sub
                      </span>
                    </div>
                  </SpotlightCard>
                </div>

                {/* Launch Readiness Summary Banner */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.1) 0%, rgba(10, 132, 255, 0.06) 100%)',
                  border: '1px solid rgba(48, 209, 88, 0.25)',
                  boxShadow: '0 4px 20px rgba(48, 209, 88, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(48, 209, 88, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#30d158',
                    flexShrink: 0
                  }}>
                    <Zap size={18} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong style={{ color: '#30d158' }}>All Systems Initialized & Synced:</strong> Your workspace state is persisted locally & linked to cloud services. You can refine API keys or team roles in <strong>Settings</strong> anytime.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with Island Button Architecture */}
          <div style={{
            padding: '18px 28px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1
          }}>
            <button 
              type="button"
              onClick={() => handleComplete(false)}
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 12px' }}
            >
              Skip Setup
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => (prev - 1) as any)}
                  className="btn btn-secondary"
                  style={{ 
                    fontSize: '0.8rem', 
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Back
                </button>
              )}

              <Magnet magnetStrength={3} activeDistance={50}>
                <button
                  type="button"
                  onClick={handleNext}
                  className="island-btn"
                  style={{
                    background: 'linear-gradient(135deg, #30d158 0%, #20b845 100%)',
                    color: '#041508',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    padding: '8px 8px 8px 18px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 20px rgba(48, 209, 88, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{currentStep === 3 ? 'Launch Workspace' : 'Continue'}</span>
                  <div className="island-btn-icon" style={{ background: 'rgba(0, 0, 0, 0.2)', color: '#041508' }}>
                    {currentStep === 3 ? <Rocket size={14} /> : <ArrowRight size={14} />}
                  </div>
                </button>
              </Magnet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
