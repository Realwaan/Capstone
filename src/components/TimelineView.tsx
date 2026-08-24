import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { MilestonePhase } from '../types';
import confetti from 'canvas-confetti';
import { 
  Milestone, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Check, 
  FileCheck2, 
  ArrowRight,
  Layers,
  Award,
  Crown,
  Edit2,
  Edit3,
  Plus,
  Trash2,
  X,
  PlusCircle,
  Sparkles,
  AlertCircle,
  Paperclip,
  Download,
  UploadCloud,
  FileText,
  ExternalLink
} from 'lucide-react';
import { formatFileSize } from '../lib/supabaseStorage';

export const TimelineView: React.FC = () => {
  const { 
    project, 
    phases, 
    toggleDeliverable, 
    signOffPhase, 
    changeCurrentPhase,
    addPhase,
    updatePhase,
    deletePhase,
    addDeliverable,
    deleteDeliverable,
    updateDeliverable,
    uploadDeliverableAttachment,
    removeDeliverableAttachment,
    isOwner,
    isAdviser 
  } = useProject();

  // Create Phase State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newDeliverablesList, setNewDeliverablesList] = useState<{ title: string; requiredForDefense: boolean }[]>([]);
  const [tempDeliverableText, setTempDeliverableText] = useState('');
  const [tempDeliverableReq, setTempDeliverableReq] = useState(true);

  // Edit Phase State
  const [phaseToEdit, setPhaseToEdit] = useState<MilestonePhase | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editStatus, setEditStatus] = useState<MilestonePhase['status']>('upcoming');

  // Delete Phase State
  const [phaseToDelete, setPhaseToDelete] = useState<MilestonePhase | null>(null);

  // Consultation Sign-Off Modal State
  const [phaseToSignOff, setPhaseToSignOff] = useState<MilestonePhase | null>(null);
  const [viewSignOffPhase, setViewSignOffPhase] = useState<MilestonePhase | null>(null);
  const [signOffDate, setSignOffDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [signOffNotes, setSignOffNotes] = useState('');
  const [signOffProofUrl, setSignOffProofUrl] = useState('');

  // Inline Add Deliverable State (keyed by phaseId)
  const [addingDeliverableForPhaseId, setAddingDeliverableForPhaseId] = useState<number | null>(null);
  const [inlineDeliverableTitle, setInlineDeliverableTitle] = useState('');
  const [inlineDeliverableReq, setInlineDeliverableReq] = useState(true);

  // Edit Deliverable State
  const [editingDeliverable, setEditingDeliverable] = useState<{ phaseId: number; deliverableId: string; title: string; requiredForDefense: boolean } | null>(null);

  const openSignOffModal = (phase: MilestonePhase) => {
    setPhaseToSignOff(phase);
    setSignOffDate(new Date().toISOString().split('T')[0]);
    setSignOffNotes('');
    setSignOffProofUrl('');
  };

  const handleConfirmSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseToSignOff) return;
    signOffPhase(phaseToSignOff.id, {
      consultationDate: signOffDate,
      consultationNotes: signOffNotes.trim() || 'Approved during faculty consultation meeting.',
      proofUrl: signOffProofUrl.trim() || undefined,
      adviserName: project.adviser?.name || 'Faculty Adviser'
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setPhaseToSignOff(null);
  };

  // Open Edit Modal
  const openEditModal = (phase: MilestonePhase) => {
    setPhaseToEdit(phase);
    setEditTitle(phase.title);
    setEditDescription(phase.description);
    setEditTargetDate(phase.targetDate);
    setEditStatus(phase.status);
  };

  // Save Edit Phase
  const handleSaveEditPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseToEdit || !editTitle.trim()) return;

    updatePhase(phaseToEdit.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      targetDate: editTargetDate,
      status: editStatus
    });

    setPhaseToEdit(null);
  };

  // Add deliverable to create phase staging list
  const handleAddStagingDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDeliverableText.trim()) return;
    setNewDeliverablesList(prev => [
      ...prev,
      { title: tempDeliverableText.trim(), requiredForDefense: tempDeliverableReq }
    ]);
    setTempDeliverableText('');
    setTempDeliverableReq(true);
  };

  const handleRemoveStagingDeliverable = (index: number) => {
    setNewDeliverablesList(prev => prev.filter((_, i) => i !== index));
  };

  // Save Create Phase
  const handleCreatePhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPhase({
      title: newTitle.trim(),
      description: newDescription.trim(),
      targetDate: newTargetDate || new Date().toISOString().split('T')[0],
      keyDeliverables: newDeliverablesList.length > 0 
        ? newDeliverablesList 
        : [{ title: 'Initial Phase Documentation & Sign-off', requiredForDefense: true }]
    });

    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
    setNewDeliverablesList([]);
    setIsCreateModalOpen(false);
  };

  // Submit Inline Deliverable
  const handleSubmitInlineDeliverable = (phaseId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineDeliverableTitle.trim()) return;
    addDeliverable(phaseId, inlineDeliverableTitle.trim(), inlineDeliverableReq);
    setInlineDeliverableTitle('');
    setInlineDeliverableReq(true);
    setAddingDeliverableForPhaseId(null);
  };

  // Submit Deliverable Edit
  const handleSaveDeliverableEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable || !editingDeliverable.title.trim()) return;
    updateDeliverable(editingDeliverable.phaseId, editingDeliverable.deliverableId, {
      title: editingDeliverable.title.trim(),
      requiredForDefense: editingDeliverable.requiredForDefense
    });
    setEditingDeliverable(null);
  };

  return (
    <div className="view-container animate-fade-in" style={{ padding: '24px 32px 100px 32px' }}>
      {/* Top Header & Defense Target */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Milestone size={24} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Milestone Roadmap & Defense Gates
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0 }}>
            Structured milestone execution roadmap with gate criteria and faculty adviser sign-off.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isOwner && (
            <button 
              onClick={() => {
                const nextNumber = phases.length + 1;
                setNewTitle(`Phase ${nextNumber}: `);
                setNewDescription('');
                setNewTargetDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
                setNewDeliverablesList([]);
                setIsCreateModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px', height: '32px' }}
            >
              <Plus size={15} />
              <span>Create Phase</span>
            </button>
          )}

          <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: '6px' }}>
            <Award size={14} />
            Target Final Defense: <strong>{project.targetDefenseDate}</strong>
          </span>
        </div>
      </div>

      {/* Visual Phase Flow Bar (Gantt Progress) */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.94rem', fontWeight: 700, margin: 0 }}>
            Capstone Phased Lifecycle ({phases.length} Total {phases.length === 1 ? 'Phase' : 'Phases'})
          </h3>
          {isOwner && phases.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click any phase below to set as active
            </span>
          )}
        </div>

        {phases.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))`, gap: '12px' }}>
            {phases.map((phase, idx) => {
              const isCurrent = phase.id === project.currentPhaseId;
              const phaseBadgeName = phase.title.startsWith('Phase')
                ? (phase.title.includes(':') ? phase.title.split(':')[0].trim() : `Phase ${idx + 1}`)
                : `Phase ${idx + 1}`;
              const phaseSubTitle = phase.title.includes(':')
                ? phase.title.split(':').slice(1).join(':').trim()
                : phase.title;

              return (
                <div 
                  key={phase.id}
                  onClick={() => {
                    if (isOwner && !isCurrent) changeCurrentPhase(phase.id);
                  }}
                  style={{
                    background: isCurrent ? 'var(--primary-light)' : 'var(--bg-elevated)',
                    border: '1px solid',
                    borderColor: isCurrent ? 'var(--primary)' : 'var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                    cursor: isOwner && !isCurrent ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                  title={isOwner && !isCurrent ? 'Click to set this phase as active' : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCurrent ? 'var(--text-accent)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {phaseBadgeName}
                    </span>
                    <span className={`badge ${phase.status === 'completed' ? 'badge-success' : isCurrent ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.62rem' }}>
                      {phase.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', minHeight: '38px', lineHeight: 1.25 }}>
                    {phaseSubTitle}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Target: {phase.targetDate}
                  </div>

                  <div className="progress-bar-container" style={{ height: '6px' }}>
                    <div className="progress-bar-fill" style={{ width: `${phase.progressPercentage}%`, background: phase.progressPercentage === 100 ? '#10b981' : 'var(--primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
            No milestone phases configured. Click "+ Create Phase" above to add your first milestone phase.
          </div>
        )}
      </div>

      {/* Detailed Phase Cards & Deliverables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {phases.map((phase, idx) => {
          const isCurrent = phase.id === project.currentPhaseId;
          const completedDeliverables = (phase.keyDeliverables || []).filter(d => d.completed).length;
          const totalDeliverables = (phase.keyDeliverables || []).length;

          return (
            <div 
              key={phase.id} 
              className="card"
              style={{
                borderColor: isCurrent ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-card)',
                background: 'var(--bg-card)',
                padding: '24px',
                position: 'relative'
              }}
            >
              {/* Phase Top Header Row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: phase.status === 'completed' ? '#10b981' : isCurrent ? 'var(--primary)' : 'rgba(148, 163, 184, 0.2)',
                    color: isCurrent || phase.status === 'completed' ? '#061109' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    flexShrink: 0
                  }}>
                    {phase.status === 'completed' ? <Check size={22} /> : (idx + 1)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{phase.title}</h3>
                      <span className={`badge ${phase.status === 'completed' ? 'badge-success' : isCurrent ? 'badge-primary' : 'badge-neutral'}`}>
                        {phase.status}
                      </span>
                      {isOwner && !isCurrent && (
                        <button
                          onClick={() => changeCurrentPhase(phase.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.68rem', padding: '2px 8px', height: '22px' }}
                        >
                          Set as Active Phase
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '4px 0 6px 0' }}>
                      {phase.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      <span>Target Milestone Date: <strong>{phase.targetDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Top Right Actions: Edit, Delete, Sign-Off */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {isOwner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(phase)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', height: '28px', fontSize: '0.75rem', gap: '4px' }}
                        title="Edit Phase Title, Target Date, or Description"
                      >
                        <Edit3 size={13} />
                        <span>Edit Phase</span>
                      </button>

                      <button
                        onClick={() => setPhaseToDelete(phase)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 10px', height: '28px', fontSize: '0.75rem', color: 'var(--danger)', gap: '4px' }}
                        title="Delete this milestone phase"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Adviser & Lead Formal Sign-Off Button / Status */}
                  {phase.adviserSignOff ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      color: 'var(--success)',
                      maxWidth: '360px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={16} style={{ flexShrink: 0, color: '#10b981' }} />
                          <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#10b981' }}>
                            Consultation Endorsed
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewSignOffPhase(phase)}
                          className="btn btn-ghost btn-xs"
                          style={{ fontSize: '0.66rem', height: '20px', padding: '0 6px', color: 'var(--primary)' }}
                          title="View consultation directives and details"
                        >
                          View Directives
                        </button>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {phase.signedOffBy || 'Faculty Adviser'} • {phase.signedOffDate}
                      </div>
                      {phase.consultationNotes && (
                        <div style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          "{phase.consultationNotes}"
                        </div>
                      )}
                      {phase.proofUrl && (
                        <a
                          href={phase.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.66rem',
                            color: 'var(--primary)',
                            marginTop: '2px',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={10} />
                          <span>View Signed Rubric / Proof</span>
                        </a>
                      )}
                    </div>
                  ) : (isOwner || isAdviser) ? (
                    <button 
                      type="button"
                      onClick={() => openSignOffModal(phase)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', height: '32px', borderColor: 'var(--primary)' }}
                      title="Record adviser consultation sign-off"
                    >
                      <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                      <span>Record Consultation Sign-Off</span>
                    </button>
                  ) : (
                    <div 
                      style={{ 
                        fontSize: '0.72rem', 
                        color: 'var(--text-muted)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)'
                      }}
                      title="Only Faculty Adviser or Project Lead can endorse milestone completion"
                    >
                      <Clock size={12} />
                      <span>Adviser Gate Pending</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full-Width Milestone Completion Progress Bar */}
              <div style={{ marginTop: '16px', marginBottom: '20px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Milestone Completion Progress
                  </span>
                  <span style={{ fontSize: '0.76rem', color: phase.progressPercentage === 100 ? 'var(--success)' : 'var(--text-accent)', fontWeight: 800 }}>
                    {phase.progressPercentage}% Complete
                  </span>
                </div>
                <div className="progress-bar-container" style={{ height: '8px', borderRadius: '4px', width: '100%' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${phase.progressPercentage}%`,
                      background: phase.progressPercentage === 100 ? '#10b981' : 'var(--primary)'
                    }} 
                  />
                </div>
              </div>

              {/* Deliverable Checklist Grid */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '18px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Gate Deliverables Checklist ({completedDeliverables}/{totalDeliverables} Verified)
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: completedDeliverables === totalDeliverables && totalDeliverables > 0 ? 'var(--success)' : 'var(--text-accent)' }}>
                      {totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0}% Verified
                    </span>

                    {isOwner && (
                      <button
                        onClick={() => {
                          setAddingDeliverableForPhaseId(addingDeliverableForPhaseId === phase.id ? null : phase.id);
                          setInlineDeliverableTitle('');
                          setInlineDeliverableReq(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.72rem', padding: '2px 8px', height: '24px', gap: '4px' }}
                      >
                        <PlusCircle size={13} />
                        <span>Add Deliverable</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Deliverables Checklist Mini Progress Bar */}
                <div className="progress-bar-container" style={{ height: '4px', marginBottom: '14px', borderRadius: '2px', width: '100%' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0}%`,
                      background: completedDeliverables === totalDeliverables && totalDeliverables > 0 ? '#10b981' : 'var(--primary)'
                    }} 
                  />
                </div>

                {/* Inline Add Deliverable Form */}
                {isOwner && addingDeliverableForPhaseId === phase.id && (
                  <form 
                    onSubmit={(e) => handleSubmitInlineDeliverable(phase.id, e)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      New Deliverable for Phase {phase.id}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={inlineDeliverableTitle}
                        onChange={e => setInlineDeliverableTitle(e.target.value)}
                        placeholder="Deliverable title (e.g. Chapter 3 Draft or UI Prototype Review)"
                        className="input-field"
                        style={{ flex: 1, minWidth: '220px', fontSize: '0.8rem', height: '32px' }}
                        autoFocus
                        required
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={inlineDeliverableReq}
                          onChange={e => setInlineDeliverableReq(e.target.checked)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Defense Gate</span>
                      </label>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ height: '32px', padding: '0 12px' }}>
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAddingDeliverableForPhaseId(null)} 
                        className="btn btn-ghost btn-sm"
                        style={{ height: '32px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Deliverables List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {(phase.keyDeliverables || []).map(item => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={item.completed} 
                            onChange={() => toggleDeliverable(phase.id, item.id)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                          />
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                            {item.title}
                          </div>
                        </label>

                        {/* Deliverable Proof Attachments */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: '26px' }}>
                            {item.attachments.map(att => (
                              <div 
                                key={att.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-card)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                <FileText size={11} style={{ color: '#fbbf24' }} />
                                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={att.name}>
                                  {att.name}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>({formatFileSize(att.size)})</span>
                                <a href={att.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }} title="Download / View Proof">
                                  <Download size={10} />
                                </a>
                                {isOwner && (
                                  <button
                                    type="button"
                                    onClick={() => removeDeliverableAttachment(phase.id, item.id, att.id)}
                                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Delete proof"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <label 
                          className="btn btn-ghost btn-icon"
                          style={{ width: '22px', height: '22px', padding: 0, cursor: 'pointer' }}
                          title="Attach Verification Proof / Sign-off PDF"
                        >
                          <Paperclip size={12} style={{ color: item.attachments && item.attachments.length > 0 ? 'var(--primary)' : 'var(--text-muted)' }} />
                          <input 
                            type="file" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadDeliverableAttachment(phase.id, item.id, file);
                              }
                              e.target.value = '';
                            }} 
                            style={{ display: 'none' }} 
                          />
                        </label>

                        {item.requiredForDefense && (
                          <span className="badge badge-warning" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                            Defense Gate
                          </span>
                        )}

                        {isOwner && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <button
                              onClick={() => setEditingDeliverable({ phaseId: phase.id, deliverableId: item.id, title: item.title, requiredForDefense: item.requiredForDefense })}
                              className="btn btn-ghost btn-icon"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              title="Edit Deliverable"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => deleteDeliverable(phase.id, item.id)}
                              className="btn btn-ghost btn-icon"
                              style={{ width: '22px', height: '22px', padding: 0, color: 'var(--danger)' }}
                              title="Delete Deliverable"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {phases.length === 0 && (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border-card)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Milestone size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>No Milestone Phases Configured</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 20px auto' }}>
              Milestone phases organize your defense roadmap gates, deliverables, and chapter progress. Create your first phase to begin.
            </p>
            {isOwner && (
              <button 
                onClick={() => {
                  setNewTitle('Phase 1: ');
                  setNewDescription('');
                  setNewTargetDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
                  setNewDeliverablesList([]);
                  setIsCreateModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Plus size={15} />
                <span>Create Phase 1</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE PHASE MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Milestone size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Create New Milestone Phase</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePhase} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Phase Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Phase 6: Production Launch & Publication"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Phase Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Summarize the core objectives and defense expectations for this phase..."
                  className="input-field"
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="input-label">Target Milestone Deadline *</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={e => setNewTargetDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Initial Deliverables Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <label className="input-label" style={{ marginBottom: '8px' }}>Initial Deliverables (Optional)</label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={tempDeliverableText}
                    onChange={e => setTempDeliverableText(e.target.value)}
                    placeholder="e.g. Final Manuscript Bound Copy"
                    className="input-field"
                    style={{ flex: 1, fontSize: '0.8rem', height: '32px' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStagingDeliverable(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddStagingDeliverable}
                    className="btn btn-secondary btn-sm"
                    style={{ height: '32px', padding: '0 12px' }}
                  >
                    Add
                  </button>
                </div>

                {newDeliverablesList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {newDeliverablesList.map((d, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                        <span>{d.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.58rem' }}>Defense Gate</span>
                          <button type="button" onClick={() => handleRemoveStagingDeliverable(idx)} className="btn btn-ghost btn-icon" style={{ width: '20px', height: '20px', padding: 0, color: 'var(--danger)' }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={!newTitle.trim()} className="btn btn-primary">
                  Create Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PHASE MODAL */}
      {phaseToEdit && (
        <div className="modal-backdrop" onClick={() => setPhaseToEdit(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Edit Phase: {phaseToEdit.title}</h3>
              </div>
              <button onClick={() => setPhaseToEdit(null)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditPhase} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Phase Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Phase Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Target Deadline *</label>
                  <input
                    type="date"
                    value={editTargetDate}
                    onChange={e => setEditTargetDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as MilestonePhase['status'])}
                    className="input-field"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setPhaseToEdit(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={!editTitle.trim()} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PHASE CONFIRMATION MODAL */}
      {phaseToDelete && (
        <div className="modal-backdrop" onClick={() => setPhaseToDelete(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Delete Phase?</h3>
            </div>

            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Are you sure you want to delete <strong>{phaseToDelete.title}</strong>?
              </p>
              <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', color: 'var(--danger)' }}>
                Any tasks mapped to this phase will automatically be reassigned to prevent lost progress.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setPhaseToDelete(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    deletePhase(phaseToDelete.id);
                    setPhaseToDelete(null);
                  }} 
                  className="btn btn-danger"
                >
                  Delete Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DELIVERABLE MODAL */}
      {editingDeliverable && (
        <div className="modal-backdrop" onClick={() => setEditingDeliverable(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Edit Deliverable</h3>
              <button onClick={() => setEditingDeliverable(null)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDeliverableEdit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Deliverable Title *</label>
                <input
                  type="text"
                  value={editingDeliverable.title}
                  onChange={e => setEditingDeliverable({ ...editingDeliverable, title: e.target.value })}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={editingDeliverable.requiredForDefense}
                  onChange={e => setEditingDeliverable({ ...editingDeliverable, requiredForDefense: e.target.checked })}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Mandatory Defense Gate Deliverable</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingDeliverable(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={!editingDeliverable.title.trim()} className="btn btn-primary">
                  Save Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD ADVISER CONSULTATION SIGN-OFF MODAL */}
      {phaseToSignOff && (
        <div className="modal-backdrop" onClick={() => setPhaseToSignOff(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Record Adviser Consultation Sign-Off</h3>
              </div>
              <button onClick={() => setPhaseToSignOff(null)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmSignOff} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '3px' }}>
                  Consultation Verification Protocol (Alternative 1)
                </div>
                Faculty advisers do not need to log into the platform. Record the directives and approvals agreed upon during your consultation meeting, defense hearing, or paper review.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Milestone Phase</label>
                  <input
                    type="text"
                    value={phaseToSignOff.title}
                    disabled
                    className="input-field"
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="input-label">Faculty Adviser</label>
                  <input
                    type="text"
                    value={project.adviser?.name || 'Faculty Adviser'}
                    disabled
                    className="input-field"
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Consultation Date *</label>
                <input
                  type="date"
                  value={signOffDate}
                  onChange={e => setSignOffDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Consultation Directives & Feedback Summary *</label>
                <textarea
                  value={signOffNotes}
                  onChange={e => setSignOffNotes(e.target.value)}
                  placeholder="e.g. Discussed with adviser during weekly sync. Adviser approved Chapter 3 system architecture and verified all required milestone deliverables."
                  className="input-field"
                  rows={3}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Proof / Signed Rubric URL (Optional)</label>
                <input
                  type="url"
                  value={signOffProofUrl}
                  onChange={e => setSignOffProofUrl(e.target.value)}
                  placeholder="https://drive.google.com/... (Google Drive scan, signed consultation log, or rubric)"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setPhaseToSignOff(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Confirm Milestone Sign-Off</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CONSULTATION DIRECTIVES MODAL */}
      {viewSignOffPhase && (
        <div className="modal-backdrop" onClick={() => setViewSignOffPhase(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Adviser Consultation Record</h3>
              </div>
              <button onClick={() => setViewSignOffPhase(null)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Milestone Phase
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>
                  {viewSignOffPhase.title}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Endorsed By</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
                    {viewSignOffPhase.signedOffBy || 'Faculty Adviser'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Consultation Date</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
                    {viewSignOffPhase.signedOffDate}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Adviser Directives & Meeting Notes</span>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginTop: '4px'
                }}>
                  {viewSignOffPhase.consultationNotes || 'Endorsed and verified via faculty consultation meeting.'}
                </div>
              </div>

              {viewSignOffPhase.proofUrl && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verification Proof / Rubric</span>
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={viewSignOffPhase.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', width: '100%', justifyContent: 'center' }}
                    >
                      <ExternalLink size={14} />
                      <span>Open Consultation Proof Link</span>
                    </a>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setViewSignOffPhase(null)} className="btn btn-primary">
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
