import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { CustomDropdown } from './CustomDropdown';
import { TaskTicketModal } from './TaskTicketModal';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square, 
  Clock, 
  User, 
  Tag, 
  Calendar,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UserMinus,
  MessageSquare,
  GitPullRequest,
  Workflow
} from 'lucide-react';
import { AIUXWorkflowsModal } from './AIUXWorkflowsModal';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { formatRelativeTime } from '../utils/time';

interface KanbanViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onOpenStandupModal?: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#64748b' },
  { id: 'todo', label: 'To Do', color: '#38bdf8' },
  { id: 'in_progress', label: 'In Progress', color: '#818cf8' },
  { id: 'peer_review', label: 'Peer Review', color: '#fbbf24' },
  { id: 'adviser_review', label: 'Adviser Review', color: '#f43f5e' },
  { id: 'done', label: 'Done', color: '#10b981' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({ 
  onOpenNewTask, 
  onEditTask,
  onOpenStandupModal 
}) => {
  const { 
    tasks, 
    members, 
    project,
    addTask,
    claimTask,
    releaseTask,
    reviewTask,
    moveTaskStatus, 
    toggleSubtask, 
    deleteTask, 
    toggleTaskAcceptanceCriteria,
    getTaskProgressPercent,
    currentMember,
    isOwner,
    canDeleteTasks
  } = useProject();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState<boolean>(false);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('code');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesAssignee = selectedAssignee === 'all' 
      ? true 
      : selectedAssignee === 'unassigned' 
      ? !task.assigneeId 
      : selectedAssignee === 'mine'
      ? task.assigneeId === currentMember.id
      : task.assigneeId === selectedAssignee;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAssignee && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
      if (targetStatus === 'done') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
    setDraggingTaskId(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: 'Quickly captured sprint task deliverable.',
      category: quickCategory,
      priority: quickPriority,
      status: 'todo',
      assigneeId: '', // Open for claim by default
      phaseId: project.currentPhaseId,
      storyPoints: 3,
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtasks: []
    });

    setQuickTitle('');
    toast.success('Task created and added to [OPEN] pool!');
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  const activeTicket = tasks.find(t => t.id === selectedTicketId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header & Controls Toolbar (Aligned to Shared Edges) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Academic Task Matrix & Kanban
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Track sprint deliverables, checklists, and defense readiness tasks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '2px' 
          }}>
            <button 
              onClick={() => setViewMode('board')} 
              className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 10px', height: '28px', gap: '4px', fontSize: '0.76rem' }}
            >
              <LayoutGrid size={13} />
              <span>Board</span>
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 10px', height: '28px', gap: '4px', fontSize: '0.76rem' }}
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Category Filter */}
          <CustomDropdown
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            prefixIcon={Tag}
            minWidth="140px"
            size="sm"
            options={[
              { value: 'all', label: 'All Categories' },
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

          {/* Assignee Filter */}
          <CustomDropdown
            value={selectedAssignee}
            onChange={(val) => setSelectedAssignee(val)}
            prefixIcon={User}
            minWidth="150px"
            size="sm"
            options={[
              { value: 'all', label: 'All Assignees' },
              { value: 'mine', label: '👤 Assigned to Me' },
              { value: 'unassigned', label: '✋ Unassigned (Open to Claim)' },
              ...members.map(m => ({ value: m.id, label: m.name }))
            ]}
          />

          {onOpenStandupModal && (
            <button 
              onClick={onOpenStandupModal} 
              className="btn btn-secondary btn-sm" 
              style={{ height: '32px', gap: '6px', fontSize: '0.76rem' }}
              title="Post today's sprint standup"
            >
              <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
              <span>Post Standup</span>
            </button>
          )}

          <button 
            onClick={() => setIsWorkflowsOpen(true)} 
            className="btn btn-secondary btn-sm" 
            style={{ 
              height: '32px', 
              gap: '6px', 
              fontSize: '0.76rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#c084fc'
            }}
            title="AI UX Playground Multi-Step Workflows (Design Sprints, PRDs, Audits)"
          >
            <Workflow size={13} style={{ color: '#c084fc' }} />
            <span>AI Playbooks</span>
          </button>

          <button 
            onClick={onOpenNewTask} 
            className="btn btn-primary btn-sm" 
            style={{ height: '32px', gap: '5px', fontSize: '0.76rem' }}
          >
            <Plus size={14} />
            <span>Add Detailed Task</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Task Capture Bar */}
      <form 
        onSubmit={handleQuickAdd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Plus size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Quick add a new task (Type title and press Enter)..." 
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CustomDropdown<TaskCategory>
            value={quickCategory}
            onChange={(val) => setQuickCategory(val)}
            minWidth="110px"
            size="sm"
            options={[
              { value: 'code', label: 'Code' },
              { value: 'backend', label: 'Backend' },
              { value: 'frontend', label: 'Frontend' },
              { value: 'database', label: 'Database' },
              { value: 'testing', label: 'Testing' },
              { value: 'devops', label: 'DevOps' },
              { value: 'architecture', label: 'Arch' },
              { value: 'docs', label: 'Docs' }
            ]}
          />

          <CustomDropdown<TaskPriority>
            value={quickPriority}
            onChange={(val) => setQuickPriority(val)}
            minWidth="105px"
            size="sm"
            options={[
              { value: 'urgent', label: '🔴 Urgent' },
              { value: 'high', label: '🟠 High' },
              { value: 'medium', label: '🟡 Medium' },
              { value: 'low', label: '🟢 Low' }
            ]}
          />

          <button 
            type="submit" 
            className="btn btn-secondary btn-sm"
            style={{ height: '30px', padding: '0 12px', fontSize: '0.76rem' }}
          >
            Add
          </button>
        </div>
      </form>

      {/* 3. Board View (Responsive Smooth Scroll Track with Snap) */}
      {viewMode === 'board' ? (
        <div 
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '20px',
            paddingInline: '2px',
            minHeight: '620px'
          }}
        >
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  flex: '0 0 min(86vw, 320px)',
                  minWidth: 'min(86vw, 300px)',
                  maxWidth: '330px',
                  scrollSnapAlign: 'center',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)'
                }}
              >
                {/* Column Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '14px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: 'var(--text-primary)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      fontFamily: 'var(--font-mono)' 
                    }}>
                      {col.label}
                    </span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {colTasks.map(task => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
                    const totalSubtasks = task.subtasks.length;
                    const progressPct = getTaskProgressPercent(task);
                    const nextStatus = getNextStatus(task.status);
                    const isClaimedByMe = task.assigneeId === currentMember.id;
                    const isUnassigned = !task.assigneeId;

                    return (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="card stagger-item"
                        onClick={() => setSelectedTicketId(task.id)}
                        style={{
                          padding: '14px',
                          cursor: 'pointer',
                          background: 'var(--bg-elevated)',
                          borderColor: draggingTaskId === task.id ? 'var(--primary)' : 'var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'transform 160ms var(--ease-out), box-shadow 160ms var(--ease-out), border-color 160ms var(--ease-out)'
                        }}
                      >
                        {/* Layer 1: Badges & Status Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <span className={`badge tag-${task.category}`} style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                              {task.category}
                            </span>
                            {isUnassigned ? (
                              <span style={{ 
                                color: 'var(--info)', 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.64rem', 
                                fontWeight: 800,
                                background: 'rgba(56, 189, 248, 0.1)',
                                padding: '1px 5px',
                                borderRadius: '3px'
                              }}>
                                [OPEN]
                              </span>
                            ) : (
                              <span style={{ 
                                color: 'var(--primary)', 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.64rem', 
                                fontWeight: 800,
                                background: 'rgba(94, 106, 210, 0.1)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '110px'
                              }}>
                                {task.claimedByUsername || `@${assignee?.name.split(' ')[0].toLowerCase()}`}
                              </span>
                            )}
                          </div>

                          <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.62rem', flexShrink: 0 }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Layer 2: Title & Description */}
                        <div>
                          <div style={{ 
                            fontSize: '0.86rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)', 
                            lineHeight: 1.35,
                            marginBottom: '4px'
                          }}>
                            {task.title}
                          </div>

                          {task.description && (
                            <p style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--text-secondary)', 
                              lineHeight: 1.4, 
                              margin: 0,
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden' 
                            }}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Layer 3: Acceptance Criteria & Progress */}
                        {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            fontSize: '0.7rem', 
                            color: 'var(--text-muted)', 
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                            <span>{task.acceptanceCriteria.filter(c => c.completed).length}/{task.acceptanceCriteria.length} acceptance criteria</span>
                          </div>
                        )}

                        {/* Subtasks / Progress Bar */}
                        {(() => {
                          const subtaskPct = totalSubtasks > 0 
                            ? Math.round((completedSubtasks / totalSubtasks) * 100) 
                            : progressPct;
                          return (
                            <div style={{ 
                              background: 'rgba(0,0,0,0.12)', 
                              padding: '8px 10px', 
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)' 
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                <span>
                                  {totalSubtasks > 0 ? `Subtasks (${completedSubtasks}/${totalSubtasks})` : task.status === 'done' ? 'Completed' : 'Progress'}
                                </span>
                                <span style={{ color: subtaskPct === 100 ? 'var(--success)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                  {subtaskPct}%
                                </span>
                              </div>
                              <div className="progress-bar-container" style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)' }}>
                                <div 
                                  className="progress-bar-fill" 
                                  style={{ 
                                    width: `${subtaskPct}%`,
                                    background: subtaskPct === 100 ? '#10b981' : subtaskPct >= 50 ? 'var(--primary)' : subtaskPct > 0 ? '#f59e0b' : 'transparent',
                                    transition: 'width 240ms var(--ease-out)'
                                  }} 
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Layer 4: Clean Metadata Row (Assignee + Due Date) */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          paddingTop: '8px', 
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.72rem'
                        }}>
                          {/* Assignee */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            {assignee ? (
                              <>
                                <img 
                                  src={assignee.avatar} 
                                  alt={assignee.name} 
                                  style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    borderRadius: '50%', 
                                    border: isClaimedByMe ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                  }} 
                                />
                                <span style={{ 
                                  color: isClaimedByMe ? 'var(--primary)' : 'var(--text-secondary)', 
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '90px'
                                }}>
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Unassigned
                              </span>
                            )}
                          </div>

                          {/* Due Date (white-space: nowrap prevents text wrapping) */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            color: 'var(--text-muted)', 
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}>
                            <Calendar size={11} />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Layer 5: Dedicated Action Row (Tactile Emil Kowalski Buttons) */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          gap: '6px',
                          paddingTop: '4px'
                        }}>
                          {/* Left: Contextual Primary Action Button */}
                          <div>
                            {isUnassigned ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  claimTask(task.id);
                                }}
                                className="btn btn-primary btn-sm"
                                style={{
                                  padding: '0 10px',
                                  fontSize: '0.68rem',
                                  height: '24px',
                                  gap: '4px',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                                title="Claim ticket (/claim)"
                              >
                                <UserCheck size={11} />
                                <span>/claim</span>
                              </button>
                            ) : isClaimedByMe && task.status !== 'done' && task.status !== 'peer_review' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicketId(task.id);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', color: '#fbbf24', gap: '3px' }}
                                  title="Submit for review (/resolved)"
                                >
                                  <GitPullRequest size={11} />
                                  <span>/resolved</span>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    releaseTask(task.id);
                                  }}
                                  className="btn btn-ghost btn-icon"
                                  style={{ width: '24px', height: '24px', padding: 0, color: 'var(--text-muted)' }}
                                  title="Unclaim ticket (/unclaim)"
                                >
                                  <UserMinus size={11} />
                                </button>
                              </div>
                            ) : (task.status === 'peer_review' || task.status === 'adviser_review') && (currentMember.role === 'qa' || currentMember.role === 'leader' || currentMember.role === 'adviser') ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reviewTask(task.id, 'Approved via Kanban Quick Action');
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', background: 'var(--success)', borderColor: 'var(--success)', gap: '3px' }}
                                title="Approve deliverable (/reviewed)"
                              >
                                <CheckCircle2 size={11} />
                                <span>/reviewed</span>
                              </button>
                            ) : null}
                          </div>

                          {/* Right: Auxiliary Controls (Edit, Delete, Next) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                              }}
                              className="btn btn-ghost btn-icon"
                              style={{ width: '24px', height: '24px' }}
                              title="Edit Task"
                            >
                              <Edit3 size={12} />
                            </button>

                            {canDeleteTasks && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                }}
                                className="btn btn-ghost btn-icon"
                                style={{ width: '24px', height: '24px', color: 'var(--danger)' }}
                                title="Delete Task"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}

                            {nextStatus && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskStatus(task.id, nextStatus);
                                  if (nextStatus === 'done') confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', gap: '3px' }}
                                title={`Move to ${nextStatus.replace('_', ' ')}`}
                              >
                                <span>Next</span>
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div style={{ 
                      padding: '32px 14px', 
                      textAlign: 'center', 
                      border: '1px dashed var(--border-card)', 
                      borderRadius: 'var(--radius-md)', 
                      color: 'var(--text-muted)', 
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginTop: '8px'
                    }}>
                      <span style={{ fontWeight: 600 }}>No active tasks</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Drag tasks here or click Add</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. List View (Aligned to Shared Edges) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
            padding: '10px 16px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>Task Deliverable</span>
            <span>Category</span>
            <span>Assignee</span>
            <span>Stage</span>
            <span>Due Date</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTasks.map(task => {
              const assignee = members.find(m => m.id === task.assigneeId);
              const isClaimedByMe = task.assigneeId === currentMember.id;
              const isUnassigned = !task.assigneeId;

              return (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTicketId(task.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 140ms var(--ease-out)'
                  }}
                  className="dropdown-option-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, paddingRight: '12px' }}>
                    {isUnassigned ? (
                      <span style={{ color: 'var(--info)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800 }}>
                        [OPEN]
                      </span>
                    ) : (
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800 }}>
                        [CLAIMED]
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>

                  <div>
                    <span className={`badge tag-${task.category}`} style={{ fontSize: '0.64rem' }}>
                      {task.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {assignee ? (
                      <>
                        <img 
                          src={assignee.avatar} 
                          alt={assignee.name} 
                          style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          {assignee.name.split(' ')[0]}
                        </span>
                      </>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          claimTask(task.id);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0 8px', height: '22px', fontSize: '0.66rem' }}
                      >
                        ⚡ Claim
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {task.dueDate}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '26px', height: '26px' }}
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Ticket Modal Embed */}
      <TaskTicketModal
        task={activeTicket}
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        onEditTask={onEditTask}
      />

      {/* AI UX Playbooks Workflow Modal */}
      <AIUXWorkflowsModal
        isOpen={isWorkflowsOpen}
        onClose={() => setIsWorkflowsOpen(false)}
      />
    </div>
  );
};
