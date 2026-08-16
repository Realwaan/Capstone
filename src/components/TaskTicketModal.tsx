import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task } from '../types';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  FileCode, 
  Folder, 
  User, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  Edit3, 
  UserCheck, 
  UserMinus,
  Bot,
  Copy,
  Check,
  Send,
  Lock,
  GitPullRequest,
  ArrowRight,
  ShieldCheck,
  Paperclip,
  Download,
  Trash2,
  UploadCloud,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { MorphButton, ButtonState } from './MorphButton';
import { RolesPermissionsModal } from './RolesPermissionsModal';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { formatRelativeTime, formatExactTimestamp } from '../utils/time';
import { formatFileSize } from '../lib/supabaseStorage';

interface TaskTicketModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskTicketModal: React.FC<TaskTicketModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditTask
}) => {
  const { 
    currentMember, 
    members, 
    claimTask, 
    releaseTask, 
    resolveTask,
    reviewTask,
    closeTask,
    toggleTaskAcceptanceCriteria,
    toggleSubtask,
    uploadTaskAttachment,
    removeTaskAttachment,
    githubUser 
  } = useProject();

  const [claimBtnState, setClaimBtnState] = useState<ButtonState>('idle');
  const [resolveBtnState, setResolveBtnState] = useState<ButtonState>('idle');
  const [reviewBtnState, setReviewBtnState] = useState<ButtonState>('idle');
  const [closeBtnState, setCloseBtnState] = useState<ButtonState>('idle');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isPromptingPR, setIsPromptingPR] = useState(false);
  const [prUrlInput, setPrUrlInput] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    setIsUploadingFile(true);
    await uploadTaskAttachment(task.id, file);
    setIsUploadingFile(false);
    e.target.value = '';
  };

  // Keyboard shortcut: Escape to close, C to claim
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !task || isPromptingPR || isRolesModalOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.key === 'c' || e.key === 'C') && !task.assigneeId && !e.metaKey && !e.ctrlKey) {
        handleClaim();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, task, isPromptingPR, isRolesModalOpen]);

  if (!isOpen || !task) return null;

  const assignee = members.find(m => m.id === task.assigneeId);
  const isClaimedByMe = task.assigneeId === currentMember.id;
  const isUnassigned = !task.assigneeId;
  const isPM = currentMember.role === 'leader';
  const isDev = currentMember.role === 'developer' || isPM;
  const isQA = currentMember.role === 'qa' || currentMember.role === 'adviser' || isPM;

  // Compute status tag string
  let currentStatusTag = '[OPEN]';
  if (task.status === 'done' || task.closedAt) {
    currentStatusTag = `[CLOSED]`;
  } else if (task.status === 'peer_review' || task.status === 'adviser_review') {
    currentStatusTag = `[PENDING-REVIEW][${task.claimedByUsername || assignee?.name || 'Dev'}]`;
  } else if (task.assigneeId) {
    currentStatusTag = `[CLAIMED][${task.claimedByUsername || assignee?.name || 'Member'}]`;
  }

  // 1. /claim
  const handleClaim = () => {
    if (!task || claimBtnState === 'loading') return;
    setClaimBtnState('loading');
    setTimeout(() => {
      claimTask(task.id);
      setClaimBtnState('success');
      confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setClaimBtnState('idle'), 1000);
    }, 320);
  };

  // 2. /unclaim
  const handleUnclaim = () => {
    if (!task) return;
    releaseTask(task.id);
  };

  // 3. /resolved
  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || resolveBtnState === 'loading') return;
    setResolveBtnState('loading');
    setTimeout(() => {
      resolveTask(task.id, prUrlInput.trim() || undefined, 'Submitted with PR link');
      setResolveBtnState('success');
      setIsPromptingPR(false);
      confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });
      setTimeout(() => setResolveBtnState('idle'), 1000);
    }, 320);
  };

  // 4. /reviewed
  const handleReview = () => {
    if (!task || reviewBtnState === 'loading') return;
    setReviewBtnState('loading');
    setTimeout(() => {
      reviewTask(task.id, 'Approved & verified by QA / Adviser');
      setReviewBtnState('success');
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setReviewBtnState('idle'), 1000);
    }, 320);
  };

  // 5. /closed
  const handleClose = () => {
    if (!task || closeBtnState === 'loading') return;
    setCloseBtnState('loading');
    setTimeout(() => {
      closeTask(task.id, 'Closed by user');
      setCloseBtnState('success');
      setTimeout(() => setCloseBtnState('idle'), 1000);
    }, 320);
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(path);
    toast.success(`Copied path: ${path}`);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  // Status color styling
  const statusColor = isUnassigned 
    ? 'var(--info)' 
    : task.status === 'done' || task.closedAt
    ? 'var(--success)' 
    : task.status === 'peer_review' || task.status === 'adviser_review'
    ? '#fbbf24'
    : 'var(--primary)';

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
        <div 
          className="modal-content" 
          onClick={e => e.stopPropagation()}
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
          {/* Ticket Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <span style={{ 
                fontWeight: 800, 
                color: statusColor,
                letterSpacing: '-0.01em',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: `1px solid ${statusColor}33`
              }}>
                {currentStatusTag}
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.title}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsRolesModalOpen(true)}
                className="btn btn-ghost btn-sm"
                style={{ height: '28px', padding: '0 8px', fontSize: '0.72rem', gap: '4px', color: 'var(--text-secondary)' }}
                title="View Roles & Permissions matrix"
              >
                <span>📋 Roles & Perms</span>
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onEditTask(task);
                }}
                className="btn btn-ghost btn-sm"
                style={{ height: '28px', padding: '0 8px', fontSize: '0.72rem', gap: '4px' }}
                title="Edit full task properties"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', padding: 0 }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Ticket Body */}
          <div style={{ padding: '22px 24px', maxHeight: '65vh', overflowY: 'auto' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderLeft: `4px solid ${statusColor}`,
              borderTop: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Title Header */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {task.title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {task.description || 'No summary description provided.'}
                </p>
              </div>

              {/* Problem Section */}
              {task.problemStatement && (
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Problem Statement
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {task.problemStatement}
                  </div>
                </div>
              )}

              {/* What to Fix Checklist */}
              {task.whatToFix && task.whatToFix.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    What to Fix
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {task.whatToFix.map((step, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4
                        }}
                      >
                        <span style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontWeight: 800, 
                          color: 'var(--primary)',
                          fontSize: '0.74rem',
                          marginTop: '1px'
                        }}>
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks Checklist */}
              {task.subtasks && task.subtasks.length > 0 && (() => {
                const totalSt = task.subtasks.length;
                const completedSt = task.subtasks.filter(st => st.completed).length;
                const stPct = Math.round((completedSt / totalSt) * 100);
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Subtasks ({completedSt}/{totalSt})
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stPct === 100 ? 'var(--success)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {stPct}%
                      </span>
                    </div>

                    <div className="progress-bar-container" style={{ height: '4px', marginBottom: '10px', background: 'rgba(255, 255, 255, 0.08)' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${stPct}%`,
                          background: stPct === 100 ? '#10b981' : stPct >= 50 ? 'var(--primary)' : stPct > 0 ? '#f59e0b' : 'transparent',
                          transition: 'width 240ms var(--ease-out)'
                        }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {task.subtasks.map(st => (
                        <div 
                          key={st.id}
                          onClick={() => toggleSubtask(task.id, st.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: st.completed ? 'rgba(48, 209, 88, 0.08)' : 'rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'background 140ms var(--ease-out)'
                          }}
                        >
                          {st.completed ? (
                            <CheckSquare size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          ) : (
                            <Square size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          )}
                          <span style={{ 
                            fontSize: '0.8rem', 
                            color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: st.completed ? 'line-through' : 'none',
                            lineHeight: 1.4
                          }}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Acceptance Criteria (✓) */}
              {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Acceptance Criteria (✓)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {task.acceptanceCriteria.map(criteria => (
                      <div 
                        key={criteria.id}
                        onClick={() => toggleTaskAcceptanceCriteria(task.id, criteria.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: criteria.completed ? 'rgba(48, 209, 88, 0.08)' : 'rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'background 140ms var(--ease-out)'
                        }}
                      >
                        {criteria.completed ? (
                          <CheckSquare size={14} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                        ) : (
                          <Square size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                        )}
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: criteria.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: criteria.completed ? 'line-through' : 'none',
                          lineHeight: 1.4
                        }}>
                          {criteria.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Files */}
              {task.relatedFiles && task.relatedFiles.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Related Code Files
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {task.relatedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        onClick={() => copyPath(file)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'border-color 140ms var(--ease-out)'
                        }}
                        title="Click to copy file path"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <FileCode size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file}
                          </span>
                        </div>
                        {copiedFile === file ? (
                          <Check size={12} style={{ color: 'var(--success)' }} />
                        ) : (
                          <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PR Link (If Resolved) */}
              {task.prUrl && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(94, 106, 210, 0.08)',
                  border: '1px solid rgba(94, 106, 210, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitPullRequest size={15} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      Pull Request / Deliverable:
                    </span>
                  </div>
                  <a 
                    href={task.prUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', height: '24px', gap: '4px', color: 'var(--primary)' }}
                  >
                    <span>Open PR</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* File Attachments & Evidence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <Paperclip size={14} style={{ color: 'var(--primary)' }} />
                    <span>Attachments & Evidence ({task.attachments?.length || 0})</span>
                  </div>
                  <label 
                    className="btn btn-ghost btn-sm"
                    style={{ 
                      fontSize: '0.72rem', 
                      height: '24px', 
                      gap: '4px', 
                      cursor: isUploadingFile ? 'not-allowed' : 'pointer',
                      padding: '2px 8px'
                    }}
                  >
                    <UploadCloud size={12} />
                    <span>{isUploadingFile ? 'Uploading...' : 'Upload File'}</span>
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      disabled={isUploadingFile} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                {task.attachments && task.attachments.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {task.attachments.map(att => (
                      <div 
                        key={att.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          {att.fileType?.includes('image') ? (
                            <ImageIcon size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                          ) : (
                            <FileText size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div 
                              style={{ 
                                fontSize: '0.74rem', 
                                fontWeight: 600, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                maxWidth: '120px'
                              }}
                              title={att.name}
                            >
                              {att.name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {formatFileSize(att.size)} • {att.uploadedAt}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <a 
                            href={att.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 5px', height: '22px' }}
                            title="Download / View File"
                          >
                            <Download size={12} />
                          </a>
                          <button 
                            type="button"
                            onClick={() => removeTaskAttachment(task.id, att.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 5px', height: '22px', color: 'var(--danger)' }}
                            title="Delete Attachment"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--text-muted)', 
                    fontStyle: 'italic',
                    background: 'var(--bg-elevated)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border-subtle)'
                  }}>
                    No files attached. Click "Upload File" to add screenshots, diagrams, or PDF approval sheets.
                  </div>
                )}
              </div>

              {/* Metadata Box */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.74rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Status</span>
                  <span style={{ fontWeight: 700, color: statusColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Circle size={8} fill={statusColor} />
                    {isUnassigned ? 'OPEN' : task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Folder / Channel</span>
                  <code style={{ 
                    background: 'var(--bg-elevated)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--primary)' 
                  }}>
                    {task.folder || `phase-${task.phaseId}`}
                  </code>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Created By</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {task.createdByUsername || '@team'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Event Audit Trail */}
            {task.ticketEvents && task.ticketEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {task.ticketEvents.map(evt => (
                  <div 
                    key={evt.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      borderLeft: `4px solid ${evt.type === 'reviewed' ? 'var(--success)' : evt.type === 'resolved' ? '#fbbf24' : 'var(--primary)'}`,
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bot size={15} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                          Ticket {evt.type}
                        </span>
                      </div>
                      <span 
                        title={formatExactTimestamp(evt.timestamp)}
                        style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'help' }}
                      >
                        {formatRelativeTime(evt.timestamp)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Action by <strong style={{ color: 'var(--primary)' }}>{evt.username}</strong>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontSize: '0.72rem', 
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      <span>Old Status: <code>{evt.oldStatus}</code></span>
                      <span>➔</span>
                      <span>New Status: <code style={{ color: 'var(--primary)' }}>{evt.newStatus}</code></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Spring PR Drawer for /resolved */}
            {isPromptingPR && (
              <form 
                onSubmit={handleResolveSubmit} 
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--primary)',
                  boxShadow: '0 8px 24px rgba(94, 106, 210, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GitPullRequest size={15} style={{ color: 'var(--primary)' }} />
                    <span>Submit for Review (<code>/resolved</code>)</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>pr_url</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Provide your GitHub Pull Request URL or deliverable document link to transition this ticket to <strong>[PENDING-REVIEW]</strong>:
                </div>

                <input 
                  type="url" 
                  placeholder="https://github.com/org/repo/pull/12 or deliverable link..."
                  value={prUrlInput}
                  onChange={e => setPrUrlInput(e.target.value)}
                  className="input-field"
                  autoFocus
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsPromptingPR(false)} 
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <MorphButton
                    type="submit"
                    state={resolveBtnState}
                    variant="primary"
                    size="sm"
                    loadingText="Submitting..."
                    successText="Submitted!"
                  >
                    🚀 Mark PENDING-REVIEW
                  </MorphButton>
                </div>
              </form>
            )}
          </div>

          {/* Emil Kowalski 5-Action Tactile Button Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {/* The 5 Screenshot Actions Styled with Emil's Touch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              {/* 1. /claim */}
              {isUnassigned && (
                <MorphButton
                  state={claimBtnState}
                  onClick={handleClaim}
                  disabled={!isDev}
                  variant="primary"
                  size="sm"
                  loadingText="Claiming..."
                  successText="Claimed!"
                >
                  ⚡ Claim Ticket (/claim)
                </MorphButton>
              )}

              {/* 2. /unclaim */}
              {(isClaimedByMe || (isPM && task.assigneeId)) && task.status !== 'done' && (
                <button
                  type="button"
                  onClick={handleUnclaim}
                  className="btn btn-secondary btn-sm"
                  style={{ height: '30px', fontSize: '0.76rem', gap: '5px' }}
                  title="Unclaim a ticket back to open pool (Developer only)"
                >
                  <UserMinus size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>Unclaim (/unclaim)</span>
                </button>
              )}

              {/* 3. /resolved */}
              {(isClaimedByMe || isPM) && task.status !== 'done' && task.status !== 'peer_review' && (
                <button
                  type="button"
                  onClick={() => setIsPromptingPR(prev => !prev)}
                  className={`btn ${isPromptingPR ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ height: '30px', fontSize: '0.76rem', gap: '5px', color: isPromptingPR ? '#fff' : '#fbbf24' }}
                  title="Mark a ticket as PENDING-REVIEW with PR link (Developer only)"
                >
                  <GitPullRequest size={13} />
                  <span>Submit for Review (/resolved)</span>
                </button>
              )}

              {/* 4. /reviewed */}
              {(task.status === 'peer_review' || task.status === 'adviser_review') && (
                <MorphButton
                  state={reviewBtnState}
                  onClick={handleReview}
                  disabled={!isQA}
                  variant="success"
                  size="sm"
                  loadingText="Approving..."
                  successText="Approved!"
                >
                  ✅ Approve Deliverable (/reviewed)
                </MorphButton>
              )}

              {/* 5. /closed */}
              {(isPM || isClaimedByMe || isQA) && task.status !== 'done' && (
                <MorphButton
                  state={closeBtnState}
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  loadingText="Closing..."
                  successText="Closed!"
                >
                  🔒 Close Ticket (/closed)
                </MorphButton>
              )}
            </div>

            {/* Close Modal Button */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
              <button 
                onClick={onClose} 
                className="btn btn-ghost btn-sm" 
                style={{ height: '30px', fontSize: '0.76rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Modal */}
      <RolesPermissionsModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </>
  );
};
