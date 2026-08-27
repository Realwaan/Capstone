import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { NewProjectPayload, ProjectTemplatePreset, AccessModifier } from '../types';
import { AVAILABLE_ORGANIZATIONS, AVAILABLE_REGIONS } from '../lib/projectGenerator';
import { 
  FolderKanban, 
  Sparkles, 
  GraduationCap, 
  Cpu, 
  Layers, 
  FileCode, 
  ArrowRight, 
  Loader2, 
  Terminal, 
  X,
  CheckCircle2,
  Calendar,
  UserCheck,
  Building,
  Check,
  Zap,
  BookOpen,
  Lock,
  Package,
  Shield,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate
}) => {
  const { createProject, currentMember, githubUser } = useProject();

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [organization, setOrganization] = useState(AVAILABLE_ORGANIZATIONS[0]);
  const [accessLevel, setAccessLevel] = useState<AccessModifier>('private');
  const [templatePreset, setTemplatePreset] = useState<ProjectTemplatePreset>('agile_software');
  const [includeManuscript, setIncludeManuscript] = useState(false);
  const [targetDefenseDate, setTargetDefenseDate] = useState('2026-11-30');
  const [teamName, setTeamName] = useState('');
  const [adviserName, setAdviserName] = useState('');
  const [adviserDepartment, setAdviserDepartment] = useState('');

  // Board Provisioning Animation State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [createdProjectTitle, setCreatedProjectTitle] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProvisioning(false);
      setProvisioningStep(0);
      setProgressPct(0);
      setTerminalLogs([]);
      setTitle('');
      setSubtitle('');
      setAccessLevel('private');
      setTemplatePreset('agile_software');
      setIncludeManuscript(false);
      setAdviserName('');
      setAdviserDepartment('');
      setTeamName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presetsConfig: Array<{
    id: ProjectTemplatePreset;
    title: string;
    description: string;
    icon: any;
    badge: string;
    phasesSummary: string;
  }> = [
    {
      id: 'agile_software',
      title: 'Full-Stack Software Engineering (Full Coding)',
      description: 'Pure software engineering & coding capstone: Sprint boards, GitHub PR review, REST APIs, PostgreSQL schema, Docker CI/CD, and test suites.',
      icon: Zap,
      badge: 'Recommended for Coding',
      phasesSummary: '3 Agile Sprints • 7 Code Deliverables • User Story Tickets'
    },
    {
      id: 'hardware_iot',
      title: 'IoT & Embedded Systems Engineering',
      description: 'Hardware schematics, MCU C++/Python firmware, MQTT broker telemetry, and live sensor dashboard.',
      icon: Cpu,
      badge: 'IoT / Systems',
      phasesSummary: '3 Hardware Phases • Circuit Schematics • Sensor Telemetry'
    },
    {
      id: 'capstone_master',
      title: 'Academic Research & Thesis (With 5-Chapter Manuscript)',
      description: 'Hybrid capstone combining software implementation with structured Chapter 1–5 academic manuscript outline and defense chapters.',
      icon: GraduationCap,
      badge: 'Thesis + Code',
      phasesSummary: '4 Milestone Phases • 11 Defense Deliverables • 5-Chapter Track'
    },
    {
      id: 'blank_database',
      title: 'Clean Slate / Blank Board',
      description: 'Start with a clean slate. Create custom sprint phases, deliverables, and Kanban task matrix from scratch.',
      icon: Layers,
      badge: 'Custom',
      phasesSummary: '1 Starter Phase • 0 Pre-seeded Tasks'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Project Name Required', { description: 'Please enter a name for your capstone project.' });
      return;
    }

    setCreatedProjectTitle(title.trim());
    setIsProvisioning(true);
    setProvisioningStep(1);
    setProgressPct(15);
    setTerminalLogs([
      `[0.1s] [INFO] Initializing new workspace instance for "${title.trim()}"...`,
      `[0.3s] [INFO] Setting up isolated state registry...`
    ]);

    // Step 2: 600ms
    setTimeout(() => {
      setProvisioningStep(2);
      setProgressPct(40);
      setTerminalLogs(prev => [
        ...prev,
        `[0.6s] [OK] Workspace storage partitioned`,
        `[0.9s] [INFO] Provisioning Kanban task matrix & sprint columns (${templatePreset})...`
      ]);
    }, 600);

    // Step 3: 1300ms
    setTimeout(() => {
      setProvisioningStep(3);
      setProgressPct(68);
      setTerminalLogs(prev => [
        ...prev,
        `[1.2s] [OK] Kanban boards generated with starter task matrix`,
        `[1.5s] [INFO] Building milestone roadmap, defense deliverables & manuscript outlines...`
      ]);
    }, 1300);

    // Step 4: 2000ms
    setTimeout(() => {
      setProvisioningStep(4);
      setProgressPct(90);
      setTerminalLogs(prev => [
        ...prev,
        `[1.9s] [OK] Milestone defense verification criteria seeded`,
        `[2.1s] [INFO] Finalizing team governance, adviser roles & cryptographic API keys...`
      ]);
    }, 2000);

    // Step 5: Finalize and switch to new project
    setTimeout(async () => {
      try {
        const isThesisPreset = templatePreset === 'capstone_master';
        const isIotPreset = templatePreset === 'hardware_iot';
        const trackType = isThesisPreset ? 'research_manuscript' : isIotPreset ? 'hardware_iot' : 'full_coding';
        const hasManuscript = isThesisPreset || includeManuscript;

        const payload: NewProjectPayload = {
          title: title.trim(),
          subtitle: subtitle.trim() || 'Collaborative software engineering & capstone implementation workspace.',
          organization,
          region: 'ap-southeast-1',
          accessLevel,
          templatePreset,
          trackType,
          hasManuscript,
          targetDefenseDate,
          teamName: teamName.trim() || `${title.trim()} Dev Team`,
          adviserName: adviserName.trim() || 'Faculty Adviser',
          adviserDepartment: adviserDepartment.trim() || organization,
          ownerName: currentMember?.name || githubUser?.name || 'Project Manager'
        };

        const newProj = await createProject(payload);

        setProvisioningStep(5);
        setProgressPct(100);
        setTerminalLogs(prev => [
          ...prev,
          `[2.6s] [SUCCESS] All coding boards and sprints provisioned successfully!`,
          `[2.8s] [READY] Active Workspace: ${newProj.title}`
        ]);

        // Fire celebratory confetti
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas blocked
        }

        toast.success(`Project Created: ${newProj.title}`, {
          description: `New Kanban sprint board, task matrix & GitHub sync are ready!`
        });

        // Automatically redirect to the new project dashboard after 800ms
        setTimeout(() => {
          onClose();
          if (onSuccessNavigate) {
            onSuccessNavigate();
          }
        }, 750);
      } catch (err: any) {
        console.error('Project provisioning error:', err);
        setIsProvisioning(false);
        toast.error('Could not complete workspace initialization', {
          description: err?.message || 'Please check project parameters and try again.'
        });
      }
    }, 2600);
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={isProvisioning ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 10, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-content animate-emil-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
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
        {/* Modal Top Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(48, 209, 88, 0.14)',
                border: '1px solid rgba(48, 209, 88, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {isProvisioning ? 'Generating Project Workspace...' : 'Create New Capstone Project'}
              </h2>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isProvisioning 
                  ? 'Setting up your new Kanban matrix, milestone phases, team roster & manuscript outline' 
                  : 'Spin up a fresh set of boards, tasks, milestones & research tracks for your capstone project'}
              </div>
            </div>
          </div>

          {!isProvisioning && (
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ width: '32px', height: '32px', padding: 0 }}
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* PROVISIONING VIEW: Terminal & Real-Time Board Setup Progress */}
        {isProvisioning ? (
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Progress Bar & Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {provisioningStep < 5 ? (
                    <>
                      <Loader2 size={16} className="spin" style={{ color: 'var(--primary)' }} />
                      <span>Provisioning Board Workspace for "{createdProjectTitle}"...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span>Workspace Ready! Redirecting to Dashboard...</span>
                    </>
                  )}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {progressPct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progressPct}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--primary), #38bdf8)', 
                    borderRadius: '999px',
                    transition: 'width 300ms ease'
                  }} 
                />
              </div>
            </div>

            {/* Simulated Terminal Log Stream */}
            <div 
              style={{
                background: '#070b10',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                color: '#34d399',
                minHeight: '180px',
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px', marginBottom: '4px' }}>
                <Terminal size={13} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>WORKSPACE_BUILD_PROCESS</span>
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} style={{ lineHeight: 1.5, animation: 'fadeIn 150ms ease' }}>
                  {log}
                </div>
              ))}
            </div>

            {/* Checklist of Provisioned Resources */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: provisioningStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {provisioningStep >= 2 ? <Check size={14} style={{ color: 'var(--primary)' }} /> : <Loader2 size={14} className="spin" />}
                <span>Isolated Kanban Task Matrix</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: provisioningStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {provisioningStep >= 3 ? <Check size={14} style={{ color: 'var(--primary)' }} /> : <Loader2 size={14} className="spin" />}
                <span>Defense Milestone Roadmap</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: provisioningStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {provisioningStep >= 3 ? <Check size={14} style={{ color: 'var(--primary)' }} /> : <Loader2 size={14} className="spin" />}
                <span>Manuscript Chapter Outlines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: provisioningStep >= 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {provisioningStep >= 4 ? <Check size={14} style={{ color: 'var(--primary)' }} /> : <Loader2 size={14} className="spin" />}
                <span>Team & Adviser Governance</span>
              </div>
            </div>
          </div>
        ) : (
          /* CONFIGURATION FORM VIEW */
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Section 1: Project Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Project Title / Capstone Topic *</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Smart AgriSens IoT Crop Monitoring System"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Short Subtitle / Abstract Statement</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Optional</span>
                </label>
                <input 
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. Real-time soil telemetry and micro-climate analytics for precision yield optimization."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Academic Organization / Department</label>
                  <select 
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    {AVAILABLE_ORGANIZATIONS.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Target Defense Date</label>
                  <input 
                    type="date"
                    value={targetDefenseDate}
                    onChange={e => setTargetDefenseDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Project Access Level */}
            <div>
              <label className="input-label">Project Access Level</label>
              <select
                value={accessLevel}
                onChange={e => setAccessLevel(e.target.value as AccessModifier)}
                className="input-field"
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="private">Private (Default — PM & Invited Collaborators Only)</option>
                <option value="package-private">Package-Private (Course Cohort & Section Scope)</option>
                <option value="protected">Protected (Department Scope)</option>
                <option value="public">Public (Open Directory)</option>
              </select>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {accessLevel === 'private' 
                  ? 'Strictly private to the Project Manager. Teammates must use the 6-character Invite Code (CF-XXXXXX) to access.'
                  : accessLevel === 'package-private'
                  ? 'Accessible to students and advisers within the same course section.'
                  : accessLevel === 'protected'
                  ? 'Accessible to authenticated students and faculty in the same academic department.'
                  : 'Openly accessible to anyone with the project link.'}
              </div>
            </div>

            {/* Section 3: Choose Board Template / Workflow Preset */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="input-label" style={{ margin: 0 }}>Select Board Workflow Preset *</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tailors starter tasks, phases & deliverables</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {presetsConfig.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = templatePreset === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setTemplatePreset(preset.id)}
                      style={{
                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative',
                        transition: 'border-color 140ms ease, transform 140ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '26px', 
                            height: '26px', 
                            borderRadius: '6px', 
                            background: isSelected ? 'var(--primary)' : 'var(--bg-card)', 
                            color: isSelected ? '#061109' : 'var(--text-secondary)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Icon size={14} />
                          </div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                          </span>
                        </div>

                        <span className={`badge ${isSelected ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.62rem' }}>
                          {preset.badge}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {preset.description}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '2px' }}>
                        {preset.phasesSummary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Manuscript Track Checkbox for Full Coding / IoT Projects */}
              {templatePreset !== 'capstone_master' && (
                <div 
                  onClick={() => setIncludeManuscript(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    marginTop: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="checkbox"
                    checked={includeManuscript}
                    onChange={e => setIncludeManuscript(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Include 5-Chapter Thesis Manuscript Outline (Optional)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Unchecked by default for full-coding projects (pure software engineering / hardware builds).
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Faculty Adviser Details */}
            <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="input-label">Faculty Adviser Name</label>
                <input 
                  type="text"
                  value={adviserName}
                  onChange={e => setAdviserName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith, Ph.D."
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Research Group / Team Name</label>
                <input 
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Precision IoT Group"
                  className="input-field"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '8px 20px', gap: '8px', fontWeight: 700 }}
              >
                <Sparkles size={15} />
                <span>Create & Open Project Board</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
