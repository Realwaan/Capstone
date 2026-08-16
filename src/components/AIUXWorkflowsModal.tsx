import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { AI_UX_WORKFLOWS, AIUXWorkflow, AIUXWorkflowStep } from '../data/aiUxWorkflows';
import { Task, TaskPriority, TaskCategory } from '../types';
import { 
  X, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Bot, 
  Send,
  Workflow,
  ShieldCheck,
  Zap,
  Tag,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { notifyDiscordWorkflowLaunched } from '../lib/discord';

interface AIUXWorkflowsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIUXWorkflowsModal: React.FC<AIUXWorkflowsModalProps> = ({ isOpen, onClose }) => {
  const { project, members, currentMember, addTask } = useProject();
  
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(AI_UX_WORKFLOWS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customFeatureName, setCustomFeatureName] = useState<string>(project.title);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeWorkflow = AI_UX_WORKFLOWS.find(w => w.id === selectedWorkflowId) || AI_UX_WORKFLOWS[0];

  const categories = ['All', 'Design', 'Product', 'Research', 'Engineering', 'Accessibility'];
  const filteredWorkflows = selectedCategory === 'All' 
    ? AI_UX_WORKFLOWS 
    : AI_UX_WORKFLOWS.filter(w => w.category === selectedCategory);

  const handleCopyPrompt = (stepId: string, promptText: string) => {
    const populated = promptText.replace(/{PROJECT_NAME}/g, customFeatureName || project.title);
    navigator.clipboard.writeText(populated);
    setCopiedPromptId(stepId);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleInjectToTaskMatrix = () => {
    setIsInjecting(true);
    try {
      const assignedMember = currentMember || members[0];
      const now = new Date().toISOString();

      activeWorkflow.steps.forEach((step, idx) => {
        const newTask: Task = {
          id: `task-wf-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          title: `[${activeWorkflow.title}] ${step.title}`,
          description: step.problemStatement,
          status: idx === 0 ? 'todo' : 'backlog',
          priority: step.priority,
          category: step.category,
          assigneeId: assignedMember.id,
          storyPoints: step.storyPoints,
          estimatedHours: step.estimatedHours,
          loggedHours: 0,
          dueDate: new Date(Date.now() + (idx + 1) * 2 * 86400000).toISOString().split('T')[0],
          phaseId: project.currentPhaseId,
          createdAt: now,
          updatedAt: now,
          subtasks: step.whatToFix.map((fix, sIdx) => ({
            id: `sub-${Date.now()}-${sIdx}`,
            title: fix,
            completed: false
          })),
          problemStatement: step.problemStatement,
          whatToFix: step.whatToFix,
          acceptanceCriteria: step.acceptanceCriteria.map((crit, cIdx) => ({
            id: `crit-${Date.now()}-${cIdx}`,
            text: crit,
            completed: false
          })),
          relatedFiles: step.relatedFiles,
          folder: activeWorkflow.id,
          createdByUsername: currentMember?.name || 'AI UX Playground'
        };

        addTask(newTask);
      });

      // Broadcast to Discord Webhook
      notifyDiscordWorkflowLaunched(
        activeWorkflow.title,
        customFeatureName || project.title,
        activeWorkflow.steps.length,
        activeWorkflow.duration,
        currentMember?.name || 'Lead Researcher',
        activeWorkflow.deliverables
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(`Synchronized ${activeWorkflow.steps.length} workflow tickets to Task Matrix!`, {
        description: `Created under folder "${activeWorkflow.id}" on your board.`
      });

      onClose();
    } catch (e) {
      toast.error('Failed to sync workflow tickets.');
    } finally {
      setIsInjecting(false);
    }
  };

  const generateMarkdownTicketString = (step: AIUXWorkflowStep): string => {
    return `# [${step.priority.toUpperCase()}] ${step.title}

**[${step.priority.toUpperCase()}]**

## Problem
${step.problemStatement}

## Potentially Related Files
${step.relatedFiles.map(f => `- ${f}`).join('\n')}

## What to Fix
${step.whatToFix.map((fix, i) => `${i + 1}. ${fix}`).join('\n')}

## Acceptance Criteria
${step.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}
`;
  };

  const handleDownloadMarkdownTickets = () => {
    const ticketsContent = activeWorkflow.steps.map(step => {
      return `--- FILENAME: ${step.id}.md ---\n` + generateMarkdownTicketString(step);
    }).join('\n\n');

    const blob = new Blob([ticketsContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeWorkflow.id}-tickets.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeWorkflow.steps.length} Markdown ticket templates!`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '1050px', 
          width: '95vw', 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <Workflow size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>AI UX Workflows & Playbooks</h3>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>aiuxplayground.com</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Multi-step chained prompt playbooks synchronized with your Task Matrix and Discord bot
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: 2-Column Workflow Browser */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Column: Workflow Selector */}
          <div style={{
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px 12px'
          }}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.68rem', padding: '2px 8px', height: '22px' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Workflow List Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredWorkflows.map(wf => {
                const isSelected = wf.id === selectedWorkflowId;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                      border: `1px solid ${isSelected ? wf.color : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? `0 0 12px ${wf.color}25` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {wf.title}
                      </span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: `${wf.color}20`,
                        color: wf.color
                      }}>
                        {wf.category}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.35 }}>
                      {wf.tagline}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {wf.duration}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Layers size={11} /> {wf.steps.length} Steps
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Workflow Details, Chained Prompts, & Task Syncer */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
            
            {/* Active Workflow Header Banner */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: `linear-gradient(135deg, ${activeWorkflow.color}15, var(--bg-elevated))`,
              border: `1px solid ${activeWorkflow.color}35`,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  {activeWorkflow.title}
                </h4>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '12px',
                  background: activeWorkflow.color,
                  color: '#fff'
                }}>
                  {activeWorkflow.duration}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px' }}>
                {activeWorkflow.description}
              </p>

              {/* Deliverable Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Deliverables:</span>
                {activeWorkflow.deliverables.map((del, i) => (
                  <span key={i} style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}>
                    ✨ {del}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Feature / Topic Scope Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              <Tag size={16} style={{ color: activeWorkflow.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>
                  Target Feature / Capstone Project Context
                </label>
                <input 
                  type="text" 
                  value={customFeatureName} 
                  onChange={e => setCustomFeatureName(e.target.value)}
                  className="input-field" 
                  style={{ height: '30px', fontSize: '0.82rem', marginTop: '2px', border: 'none', background: 'transparent', padding: 0 }}
                  placeholder="e.g. USCCE Automated Thesis Defense Simulator"
                />
              </div>
            </div>

            {/* Chained Workflow Steps Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Chained Actionable Steps ({activeWorkflow.steps.length})
                </h5>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Total {activeWorkflow.steps.reduce((acc, s) => acc + s.storyPoints, 0)} Story Pts • {activeWorkflow.steps.reduce((acc, s) => acc + s.estimatedHours, 0)} Hours
                </span>
              </div>

              {activeWorkflow.steps.map(step => (
                <div 
                  key={step.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: `${activeWorkflow.color}25`,
                        color: activeWorkflow.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        {step.stepNumber}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {step.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>{step.storyPoints} pts</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>{step.category}</span>
                      <button
                        onClick={() => handleCopyPrompt(step.id, step.aiPromptTemplate)}
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: '0.68rem', gap: '4px', height: '22px' }}
                        title="Copy AI Prompt"
                      >
                        {copiedPromptId === step.id ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                        <span>{copiedPromptId === step.id ? 'Copied' : 'Prompt'}</span>
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {step.problemStatement}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.72rem', background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '4px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>🛠️ What to Fix:</strong>
                      <ul style={{ margin: 0, paddingLeft: '14px', color: 'var(--text-muted)' }}>
                        {step.whatToFix.slice(0, 2).map((fix, i) => (
                          <li key={i}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>✅ Acceptance Criteria:</strong>
                      <ul style={{ margin: 0, paddingLeft: '14px', color: 'var(--text-muted)' }}>
                        {step.acceptanceCriteria.slice(0, 2).map((crit, i) => (
                          <li key={i}>{crit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Sync Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleDownloadMarkdownTickets}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '6px', fontSize: '0.76rem' }}
                >
                  <Download size={13} />
                  <span>Download Discord Tickets (.md)</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={onClose} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button
                  onClick={handleInjectToTaskMatrix}
                  disabled={isInjecting}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: `linear-gradient(135deg, ${activeWorkflow.color}, #3b82f6)`,
                    border: 'none',
                    gap: '6px',
                    fontWeight: 800
                  }}
                >
                  <Zap size={14} />
                  <span>Sync {activeWorkflow.steps.length} Steps to Task Matrix</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
