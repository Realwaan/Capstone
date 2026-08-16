import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskCategory, TaskPriority, TaskStatus, Subtask } from '../types';
import { CustomDropdown } from './CustomDropdown';
import { MorphButton, ButtonState } from './MorphButton';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Sparkles, 
  FileCode, 
  Folder, 
  ListOrdered, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateTaskBreakdown } from '../lib/gemini';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { members, phases, currentMember, addTask, updateTask, deleteTask } = useProject();

  const [activeTab, setActiveTab] = useState<'core' | 'ticket_spec'>('core');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Core Properties
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('code');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [phaseId, setPhaseId] = useState<number>(phases[0]?.id || 1);
  const [storyPoints, setStoryPoints] = useState<number>(5);
  const [estimatedHours, setEstimatedHours] = useState<number>(12);
  const [dueDate, setDueDate] = useState<string>('');
  const [deliverableUrl, setDeliverableUrl] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Discord Ticket Specification Properties
  const [problemStatement, setProblemStatement] = useState('');
  const [whatToFix, setWhatToFix] = useState<string[]>([]);
  const [newFixStep, setNewFixStep] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newCriteriaText, setNewCriteriaText] = useState('');
  const [relatedFiles, setRelatedFiles] = useState<string[]>([]);
  const [newFilePath, setNewFilePath] = useState('');
  const [folder, setFolder] = useState('');

  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssigneeId(taskToEdit.assigneeId || '');
      setPhaseId(taskToEdit.phaseId);
      setStoryPoints(taskToEdit.storyPoints);
      setEstimatedHours(taskToEdit.estimatedHours);
      setDueDate(taskToEdit.dueDate);
      setDeliverableUrl(taskToEdit.deliverableUrl || '');
      setSubtasks(taskToEdit.subtasks || []);

      // Ticket Spec fields
      setProblemStatement(taskToEdit.problemStatement || '');
      setWhatToFix(taskToEdit.whatToFix || []);
      setAcceptanceCriteria(taskToEdit.acceptanceCriteria || []);
      setRelatedFiles(taskToEdit.relatedFiles || []);
      setFolder(taskToEdit.folder || `phase-${taskToEdit.phaseId}`);
    } else {
      setTitle('');
      setDescription('');
      setCategory('code');
      setPriority('medium');
      setStatus('todo');
      setAssigneeId(''); // Default unassigned open for claim
      setPhaseId(phases[0]?.id || 1);
      setStoryPoints(5);
      setEstimatedHours(12);
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setDeliverableUrl('');
      setSubtasks([]);

      // Clean ticket spec
      setProblemStatement('');
      setWhatToFix([]);
      setAcceptanceCriteria([]);
      setRelatedFiles([]);
      setFolder('phase-3-implementation');
    }
  }, [taskToEdit, members, isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  // Subtask handlers
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  // What to Fix handlers
  const handleAddFixStep = () => {
    if (!newFixStep.trim()) return;
    setWhatToFix(prev => [...prev, newFixStep.trim()]);
    setNewFixStep('');
  };

  const handleRemoveFixStep = (index: number) => {
    setWhatToFix(prev => prev.filter((_, i) => i !== index));
  };

  // Acceptance Criteria handlers
  const handleAddCriteria = () => {
    if (!newCriteriaText.trim()) return;
    setAcceptanceCriteria(prev => [
      ...prev,
      { id: `ac-${Date.now()}`, text: newCriteriaText.trim(), completed: false }
    ]);
    setNewCriteriaText('');
  };

  const handleRemoveCriteria = (id: string) => {
    setAcceptanceCriteria(prev => prev.filter(c => c.id !== id));
  };

  // Related File handlers
  const handleAddRelatedFile = () => {
    if (!newFilePath.trim()) return;
    setRelatedFiles(prev => [...prev, newFilePath.trim()]);
    setNewFilePath('');
  };

  const handleRemoveRelatedFile = (index: number) => {
    setRelatedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || buttonState === 'loading') return;

    setButtonState('loading');
    setTimeout(() => {
      const taskData = {
        title,
        description,
        category,
        priority,
        status,
        assigneeId,
        phaseId,
        storyPoints,
        estimatedHours,
        dueDate,
        deliverableUrl,
        subtasks,
        problemStatement: problemStatement.trim() || undefined,
        whatToFix: whatToFix.length > 0 ? whatToFix : undefined,
        acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
        relatedFiles: relatedFiles.length > 0 ? relatedFiles : undefined,
        folder: folder.trim() || undefined,
        createdByUsername: taskToEdit?.createdByUsername || `@${currentMember.name.replace(/\s+/g, '').toLowerCase()}`
      };

      if (taskToEdit) {
        updateTask(taskToEdit.id, taskData);
      } else {
        addTask(taskData);
      }
      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        onClose();
      }, 350);
    }, 300);
  };

  const handleAIBreakdown = async () => {
    const prompt = title.trim();
    if (!prompt) {
      toast.info('Please enter a Task Title or feature idea first (e.g. "Implement RFID scanner module")');
      return;
    }

    setIsGeneratingAI(true);
    toast.info('Generating AI decomposition with Gemini... 🪄');
    try {
      const result = await generateTaskBreakdown(prompt, category);
      setTitle(result.title);
      setDescription(result.description);
      setProblemStatement(result.problemStatement);
      setStoryPoints(result.storyPoints);
      setEstimatedHours(result.estimatedHours);
      setFolder(result.folder);

      if (result.subtasks && result.subtasks.length > 0) {
        setSubtasks(result.subtasks.map((st, i) => ({
          id: `st-${Date.now()}-${i}`,
          title: st,
          completed: false
        })));
      }

      if (result.whatToFix && result.whatToFix.length > 0) {
        setWhatToFix(result.whatToFix);
      }

      if (result.acceptanceCriteria && result.acceptanceCriteria.length > 0) {
        setAcceptanceCriteria(result.acceptanceCriteria.map((ac, i) => ({
          id: `ac-${Date.now()}-${i}`,
          text: ac,
          completed: false
        })));
      }

      toast.success('Task breakdown, subtasks & acceptance criteria generated! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI breakdown');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        onKeyDown={handleKeyDown}
        style={{
          maxWidth: '720px',
          padding: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {taskToEdit ? 'Edit Capstone Deliverable' : 'Create New Capstone Task'}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              Define execution requirements, Discord ticket specs, and milestone assignment
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* AI Smart Assistant Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-primary)' }}>
            <Sparkles size={15} style={{ color: '#a855f7' }} />
            <span><strong>Gemini AI Assistant:</strong> Auto-generate subtasks, problem statement & acceptance criteria from your title.</span>
          </div>
          <button
            type="button"
            onClick={handleAIBreakdown}
            disabled={isGeneratingAI}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              gap: '5px',
              flexShrink: 0
            }}
          >
            <Wand2 size={13} className={isGeneratingAI ? 'spin' : ''} />
            <span>{isGeneratingAI ? 'Generating...' : 'AI Breakdown'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          padding: '4px 16px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'core' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'core' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'core' ? 700 : 500,
              padding: '8px 14px',
              fontSize: '0.8rem',
              gap: '6px'
            }}
          >
            <span>📋 Core Properties</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ticket_spec')}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'ticket_spec' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'ticket_spec' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'ticket_spec' ? 700 : 500,
              padding: '8px 14px',
              fontSize: '0.8rem',
              gap: '6px'
            }}
          >
            <span>🎫 Discord Ticket Specification</span>
            {(problemStatement || whatToFix.length > 0 || acceptanceCriteria.length > 0 || relatedFiles.length > 0) && (
              <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                Configured
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', maxHeight: '68vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: CORE PROPERTIES */}
          {activeTab === 'core' && (
            <>
              <div>
                <label className="input-label">Task Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Implement Computer Vision Inference Pipeline"
                  className="input-field" 
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Summary / Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Summary overview of the objective or deliverables..."
                  className="input-field" 
                  rows={2} 
                />
              </div>

              <div className="grid-cols-3">
                <div>
                  <label className="input-label">Category</label>
                  <CustomDropdown<TaskCategory>
                    value={category}
                    onChange={(val) => setCategory(val)}
                    minWidth="100%"
                    options={[
                      { value: 'code', label: '💻 Feature & Code' },
                      { value: 'backend', label: '🔌 Backend & APIs' },
                      { value: 'frontend', label: '🎨 Frontend UI/UX' },
                      { value: 'database', label: '🗄️ Database & Schema' },
                      { value: 'testing', label: '🧪 Testing & QA' },
                      { value: 'devops', label: '🚀 DevOps & Infra' },
                      { value: 'architecture', label: '⚙️ Architecture' },
                      { value: 'docs', label: '📄 Tech Docs' }
                    ]}
                  />
                </div>

                <div>
                  <label className="input-label">Priority</label>
                  <CustomDropdown<TaskPriority>
                    value={priority}
                    onChange={(val) => setPriority(val)}
                    minWidth="100%"
                    options={[
                      { value: 'urgent', label: '🔴 Urgent', badge: 'P0', badgeClass: 'badge-danger' },
                      { value: 'high', label: '🟠 High', badge: 'P1', badgeClass: 'badge-warning' },
                      { value: 'medium', label: '🟡 Medium', badge: 'P2', badgeClass: 'badge-neutral' },
                      { value: 'low', label: '🟢 Low', badge: 'P3', badgeClass: 'badge-neutral' }
                    ]}
                  />
                </div>

                <div>
                  <label className="input-label">Workflow Stage</label>
                  <CustomDropdown<TaskStatus>
                    value={status}
                    onChange={(val) => setStatus(val)}
                    minWidth="100%"
                    options={[
                      { value: 'backlog', label: 'Backlog' },
                      { value: 'todo', label: 'To Do' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'peer_review', label: 'Peer Review' },
                      { value: 'adviser_review', label: 'Adviser Review' },
                      { value: 'done', label: 'Done / Defense-Ready' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>Assignee / Task Owner</label>
                    {assigneeId !== currentMember.id && (
                      <button
                        type="button"
                        onClick={() => setAssigneeId(currentMember.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 6px', height: '20px', fontSize: '0.66rem', color: 'var(--primary)', fontWeight: 700 }}
                      >
                        ⚡ Claim for Myself
                      </button>
                    )}
                  </div>
                  <CustomDropdown
                    value={assigneeId}
                    onChange={(val) => setAssigneeId(val)}
                    minWidth="100%"
                    options={[
                      { value: '', label: '✋ Unassigned (Open for Claim)' },
                      ...members.map(m => ({
                        value: m.id,
                        label: `${m.name} (${m.roleTitle})`
                      }))
                    ]}
                  />
                </div>

                <div>
                  <label className="input-label">Milestone Phase</label>
                  <CustomDropdown
                    value={String(phaseId)}
                    onChange={(val) => setPhaseId(Number(val))}
                    minWidth="100%"
                    options={phases.map(p => ({
                      value: String(p.id),
                      label: `Phase ${p.id}: ${p.title.split(':')[1] || p.title}`
                    }))}
                  />
                </div>
              </div>

              <div className="grid-cols-3">
                <div>
                  <label className="input-label">Story Points</label>
                  <input 
                    type="number" 
                    value={storyPoints} 
                    onChange={(e) => setStoryPoints(Number(e.target.value))} 
                    className="input-field" 
                    min={1} 
                    max={20} 
                  />
                </div>
                <div>
                  <label className="input-label">Est. Hours</label>
                  <input 
                    type="number" 
                    value={estimatedHours} 
                    onChange={(e) => setEstimatedHours(Number(e.target.value))} 
                    className="input-field" 
                    min={1} 
                  />
                </div>
                <div>
                  <label className="input-label">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Deliverable URL (GitHub PR / Google Doc / Colab Notebook)</label>
                <input 
                  type="url" 
                  value={deliverableUrl} 
                  onChange={(e) => setDeliverableUrl(e.target.value)} 
                  placeholder="https://github.com/..." 
                  className="input-field" 
                />
              </div>

              {/* Subtasks Checklist */}
              <div>
                <label className="input-label">Subtask Checklist ({subtasks.length} items)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={newSubtaskTitle} 
                    onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    placeholder="Add subtask step..." 
                    className="input-field" 
                  />
                  <button type="button" onClick={handleAddSubtask} className="btn btn-secondary btn-sm">
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '120px', overflowY: 'auto' }}>
                  {subtasks.map(st => (
                    <div 
                      key={st.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{st.title}</span>
                      <button type="button" onClick={() => handleRemoveSubtask(st.id)} className="btn btn-ghost btn-icon" style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DISCORD TICKET SPECIFICATION */}
          {activeTab === 'ticket_spec' && (
            <>
              {/* Problem Statement Box */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Problem Statement</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>(What is broken or missing?)</span>
                </label>
                <textarea 
                  value={problemStatement} 
                  onChange={(e) => setProblemStatement(e.target.value)} 
                  placeholder="e.g. The schedule page is missing several existing sports — presumably sports exist in the database but are not displaying in the schedule view..."
                  className="input-field" 
                  rows={3} 
                />
              </div>

              {/* What to Fix Checklist (Numbered steps) */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ListOrdered size={14} style={{ color: 'var(--primary)' }} />
                  <span>What to Fix (Step-by-Step Implementation Plan)</span>
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={newFixStep} 
                    onChange={(e) => setNewFixStep(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFixStep(); } }}
                    placeholder="e.g. Audit which sports should be displayed but are missing..." 
                    className="input-field" 
                  />
                  <button type="button" onClick={handleAddFixStep} className="btn btn-secondary btn-sm">
                    <Plus size={14} />
                    <span>Add Step</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '140px', overflowY: 'auto' }}>
                  {whatToFix.map((step, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '0.74rem' }}>
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveFixStep(idx)} className="btn btn-ghost btn-icon" style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acceptance Criteria (Checklist ✓) */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                  <span>Acceptance Criteria (Verifiable Definition of Done ✓)</span>
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    value={newCriteriaText} 
                    onChange={(e) => setNewCriteriaText(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriteria(); } }}
                    placeholder="e.g. All expected sports appear in schedule filter/list..." 
                    className="input-field" 
                  />
                  <button type="button" onClick={handleAddCriteria} className="btn btn-secondary btn-sm">
                    <Plus size={14} />
                    <span>Add Criteria</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '140px', overflowY: 'auto' }}>
                  {acceptanceCriteria.map((c) => (
                    <div 
                      key={c.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                        <span>{c.text}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveCriteria(c.id)} className="btn btn-ghost btn-icon" style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Code Files & Folder Module */}
              <div className="grid-cols-2">
                <div>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={14} style={{ color: 'var(--primary)' }} />
                    <span>Related Code Files</span>
                  </label>
                  
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      value={newFilePath} 
                      onChange={(e) => setNewFilePath(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRelatedFile(); } }}
                      placeholder="e.g. actions/sport.ts" 
                      className="input-field" 
                    />
                    <button type="button" onClick={handleAddRelatedFile} className="btn btn-secondary btn-sm">
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                    {relatedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{file}</span>
                        <button type="button" onClick={() => handleRemoveRelatedFile(idx)} className="btn btn-ghost btn-icon" style={{ width: '18px', height: '18px' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Folder size={14} style={{ color: 'var(--primary)' }} />
                    <span>Folder / Module Tag</span>
                  </label>
                  <input 
                    type="text" 
                    value={folder} 
                    onChange={(e) => setFolder(e.target.value)} 
                    placeholder="e.g. intramurals2026 or phase-2"
                    className="input-field" 
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Used as the channel/module namespace on Discord bot ticket embeds
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Modal Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            {taskToEdit ? (
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm('Delete this task?')) {
                    deleteTask(taskToEdit.id);
                    onClose();
                  }
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
                <span>Delete Task</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Press ⌘ + Enter to save
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <MorphButton
                type="submit"
                state={buttonState}
                variant="primary"
                loadingText="Saving Deliverable..."
                successText="Saved!"
              >
                {taskToEdit ? 'Save Changes' : 'Create Task'}
              </MorphButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
