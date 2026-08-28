import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { CustomDropdown } from './CustomDropdown';
import { TaskTicketModal } from './TaskTicketModal';
import { PriorityBadge, PRIORITY_DROPDOWN_OPTIONS, CATEGORY_DROPDOWN_OPTIONS, FILTER_CATEGORY_DROPDOWN_OPTIONS } from './PriorityBadge';
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
  Layers,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UserMinus,
  MessageSquare,
  GitPullRequest,
  Workflow,
  CornerDownLeft,
  Inbox
} from 'lucide-react';
import { AIUXWorkflowsModal } from './AIUXWorkflowsModal';
import { toast } from 'sonner';

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
    getTaskProgressPercent,
    currentMember,
    isOwner,
    canDeleteTasks,
    isMemberOnline,
    loadTemplateTickets
  } = useProject();

  const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
    const saved = localStorage.getItem('capstoneflow_kanban_view');
    return saved === 'list' ? 'list' : 'board';
  });
  const [filterCategory, setFilterCategory] = useState<string>(() => {
    return localStorage.getItem('capstoneflow_kanban_category') || 'all';
  });
  const [selectedAssignee, setSelectedAssignee] = useState<string>(() => {
    return localStorage.getItem('capstoneflow_kanban_assignee') || 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState<boolean>(false);

  const handleSetViewMode = (mode: 'board' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('capstoneflow_kanban_view', mode);
  };

  const handleSetFilterCategory = (cat: string) => {
    setFilterCategory(cat);
    localStorage.setItem('capstoneflow_kanban_category', cat);
  };

  const handleSetSelectedAssignee = (assignee: string) => {
    setSelectedAssignee(assignee);
    localStorage.setItem('capstoneflow_kanban_assignee', assignee);
  };

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
    if (taskId && targetStatus === 'todo') {
      moveTaskStatus(taskId, targetStatus);
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
      acceptanceCriteria: [
        {
          id: `ac-${Date.now()}`,
          text: `Implement ${quickTitle.trim()} and satisfy quality requirements`,
          completed: false
        }
      ],
      subtasks: []
    });

    setQuickTitle('');
    toast.success('Task added to active sprint pool');
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    return current === 'backlog' ? 'todo' : null;
  };

  const activeTicket = tasks.find(t => t.id === selectedTicketId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 1. Header & Controls Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Academic Task Matrix & Kanban
            </h2>
            <span className="minimal-kbd">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px rgba(16,185,129,0.8)',
                display: 'inline-block'
              }} />
              Live Channel: #{project?.title || 'workspace'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Track sprint deliverables, checklists, and defense readiness tasks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Segmented Control */}
          <div className="kanban-segmented-group">
            <button
              onClick={() => handleSetViewMode('board')}
              className={`kanban-segmented-btn ${viewMode === 'board' ? 'is-active' : ''}`}
              title="Kanban Board View"
            >
              <LayoutGrid size={13} />
              <span>Board</span>
            </button>
            <button
              onClick={() => handleSetViewMode('list')}
              className={`kanban-segmented-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              title="Table List View"
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Quick Scope Filter (All / My Tasks / Open to Claim) */}
          <div className="kanban-segmented-group">
            <button
              onClick={() => handleSetSelectedAssignee('all')}
              className={`kanban-segmented-btn ${selectedAssignee === 'all' ? 'is-active' : ''}`}
              title="Show all team deliverables"
            >
              <Layers size={12} />
              <span>All Tasks</span>
            </button>
            <button
              onClick={() => handleSetSelectedAssignee('mine')}
              className={`kanban-segmented-btn ${selectedAssignee === 'mine' ? 'is-active' : ''}`}
              title="Show only tasks claimed by me"
            >
              <UserCheck size={12} />
              <span>My Tasks</span>
            </button>
            <button
              onClick={() => handleSetSelectedAssignee('unassigned')}
              className={`kanban-segmented-btn ${selectedAssignee === 'unassigned' ? 'is-active' : ''}`}
              title="Show open tasks available to claim"
            >
              <Sparkles size={12} />
              <span>Open to Claim</span>
            </button>
          </div>

          {/* Category Filter */}
          <CustomDropdown
            value={filterCategory}
            onChange={(val) => handleSetFilterCategory(val)}
            prefixIcon={Tag}
            minWidth="145px"
            size="sm"
            options={FILTER_CATEGORY_DROPDOWN_OPTIONS}
          />

          {onOpenStandupModal && (
            <button
              onClick={onOpenStandupModal}
              className="btn btn-secondary btn-sm"
              style={{ height: '32px', gap: '6px', fontSize: '0.76rem', borderRadius: 'var(--radius-sm)' }}
              title="Post today's sprint standup"
            >
              <MessageSquare size={13} style={{ color: 'var(--text-muted)' }} />
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
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)'
            }}
            title="AI UX Playground Multi-Step Workflows"
          >
            <Workflow size={13} style={{ color: '#818cf8' }} />
            <span>AI Playbooks</span>
          </button>

          <button
            onClick={onOpenNewTask}
            className="btn btn-primary btn-sm"
            style={{ height: '32px', gap: '5px', fontSize: '0.76rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Plus size={14} />
            <span>Add Detailed Task</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Task Command Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="kanban-command-bar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Plus size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
              fontWeight: 500,
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
            options={CATEGORY_DROPDOWN_OPTIONS}
          />

          <CustomDropdown<TaskPriority>
            value={quickPriority}
            onChange={(val) => setQuickPriority(val)}
            minWidth="110px"
            size="sm"
            options={PRIORITY_DROPDOWN_OPTIONS}
          />

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ height: '28px', padding: '0 12px', fontSize: '0.76rem', borderRadius: 'var(--radius-sm)' }}
          >
            <CornerDownLeft size={11} style={{ marginRight: '3px' }} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Zero Tasks Onboarding Banner */}
      {tasks.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 20px',
          background: 'var(--bg-elevated)',
          border: '1px dashed var(--border-card)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Task Matrix is ready
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                You haven't added any tasks yet. Quick add deliverables above, or load sample capstone sprint templates.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadTemplateTickets}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', height: '28px' }}
            >
              Load Sample Templates
            </button>
            <button
              onClick={onOpenNewTask}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.74rem', height: '28px' }}
            >
              <Plus size={13} />
              <span>Create First Task</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Board View */}
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
                onDragOver={col.id === 'todo' ? handleDragOver : undefined}
                onDrop={col.id === 'todo' ? (e) => handleDrop(e, col.id) : undefined}
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
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color }} />
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {col.label}
                    </span>
                  </div>
                  <span className="minimal-kbd" style={{ fontSize: '0.66rem' }}>
                    {colTasks.length.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Column Task Cards Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {colTasks.map(task => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
                    const totalSubtasks = task.subtasks.length;
                    const progressPct = getTaskProgressPercent(task);
                    const nextStatus = getNextStatus(task.status);
                    const isClaimedByMe = task.assigneeId === currentMember.id;
                    const isUnassigned = !task.assigneeId;
                    const canStageByDrag = isOwner && task.status === 'backlog';

                    return (
                      <div
                        key={task.id}
                        draggable={canStageByDrag}
                        onDragStart={canStageByDrag ? (e) => handleDragStart(e, task.id) : undefined}
                        onClick={() => setSelectedTicketId(task.id)}
                        className="minimal-bento-card"
                        style={{
                          padding: '14px',
                          cursor: 'pointer',
                          background: 'var(--bg-elevated)',
                          borderColor: draggingTaskId === task.id ? 'var(--primary)' : 'var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 140ms var(--ease-out)'
                        }}
                      >
                        {/* Layer 1: Badges & Status Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <span className={`badge tag-${task.category}`} style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                              {task.category}
                            </span>
                            {isUnassigned ? (
                              <span className="pastel-badge pastel-badge-blue" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                Open
                              </span>
                            ) : (
                              <span className="pastel-badge pastel-badge-green" style={{
                                fontSize: '0.62rem',
                                padding: '1px 5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '110px'
                              }}>
                                {task.claimedByUsername || `@${assignee?.name.split(' ')[0].toLowerCase()}`}
                              </span>
                            )}
                          </div>

                          <PriorityBadge priority={task.priority} size="sm" />
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
                              fontSize: '0.74rem',
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
                            fontSize: '0.68rem',
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
                              background: 'rgba(0, 0, 0, 0.15)',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                <span>
                                  {totalSubtasks > 0 ? `Subtasks (${completedSubtasks}/${totalSubtasks})` : task.status === 'done' ? 'Completed' : 'Progress'}
                                </span>
                                <span style={{ color: subtaskPct === 100 ? 'var(--success)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                  {subtaskPct}%
                                </span>
                              </div>
                              <div className="progress-bar-container" style={{ height: '4px', background: 'var(--border-subtle)' }}>
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${subtaskPct}%`,
                                    background: subtaskPct === 100 ? 'var(--success)' : subtaskPct >= 50 ? 'var(--primary)' : subtaskPct > 0 ? 'var(--warning)' : 'transparent',
                                    transition: 'width 240ms var(--ease-out)'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Layer 4: Assignee & Due Date Row */}
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
                                <div style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      border: isMemberOnline(assignee.id) ? '1.5px solid #10b981' : (isClaimedByMe ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)'),
                                      objectFit: 'cover',
                                      flexShrink: 0
                                    }}
                                  />
                                  {isMemberOnline(assignee.id) && (
                                    <span
                                      style={{
                                        position: 'absolute',
                                        bottom: '-1px',
                                        right: '-1px',
                                        width: '5px',
                                        height: '5px',
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981',
                                        border: '1px solid var(--bg-surface)'
                                      }}
                                    />
                                  )}
                                </div>
                                <span style={{
                                  color: isClaimedByMe ? 'var(--text-primary)' : 'var(--text-secondary)',
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

                          {/* Due Date */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}>
                            <Calendar size={11} />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Layer 5: Dedicated Action Row */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          paddingTop: '2px'
                        }}>
                          {/* Contextual Action Button */}
                          <div>
                            {isUnassigned ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  claimTask(task.id);
                                }}
                                className="btn btn-primary btn-sm"
                                disabled={currentMember.role === 'adviser' || currentMember.role === 'coordinator'}
                                style={{
                                  padding: '0 8px',
                                  fontSize: '0.68rem',
                                  height: '24px',
                                  gap: '4px',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                                title="Claim this active-phase task"
                              >
                                <UserCheck size={11} />
                                <span>Claim</span>
                              </button>
                            ) : isClaimedByMe && task.status === 'in_progress' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicketId(task.id);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', gap: '3px', borderRadius: 'var(--radius-sm)' }}
                                  title="Open evidence checkpoint"
                                >
                                  <GitPullRequest size={11} />
                                  <span>Submit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    releaseTask(task.id);
                                  }}
                                  className="btn btn-ghost btn-icon"
                                  style={{ width: '24px', height: '24px', padding: 0, color: 'var(--text-muted)' }}
                                  title="Unclaim task"
                                >
                                  <UserMinus size={11} />
                                </button>
                              </div>
                            ) : task.status === 'peer_review' && task.assigneeId !== currentMember.id && (currentMember.role === 'qa' || currentMember.role === 'leader') ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reviewTask(task.id, 'Peer review completed via Kanban');
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', gap: '3px', borderRadius: 'var(--radius-sm)' }}
                                title="Complete independent peer review"
                              >
                                <CheckCircle2 size={11} />
                                <span>Peer review</span>
                              </button>
                            ) : task.status === 'adviser_review' && (currentMember.role === 'adviser' || currentMember.role === 'leader' || isOwner) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reviewTask(task.id, currentMember.role === 'adviser' ? 'Faculty adviser approval recorded via Kanban' : 'Approved via Adviser Consultation');
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', gap: '3px', borderRadius: 'var(--radius-sm)' }}
                                title={currentMember.role === 'adviser' ? "Record faculty adviser approval" : "Verify and approve per adviser consultation"}
                              >
                                <CheckCircle2 size={11} />
                                <span>{currentMember.role === 'adviser' ? 'Approve' : 'Verify'}</span>
                              </button>
                            ) : null}
                          </div>

                          {/* Auxiliary Controls */}
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
                              <Edit3 size={11} />
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
                                <Trash2 size={11} />
                              </button>
                            )}

                            {nextStatus && isOwner && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTaskStatus(task.id, nextStatus);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0 8px', height: '24px', fontSize: '0.68rem', gap: '3px', borderRadius: 'var(--radius-sm)' }}
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
                    <div className="kanban-empty-column">
                      <Inbox size={22} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No tasks in {col.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '200px' }}>
                        {col.id === 'todo' && isOwner
                          ? 'Stage backlog deliverables here'
                          : 'Tasks will appear as sprint deliverables advance'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
            padding: '10px 16px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
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
                      <span className="pastel-badge pastel-badge-blue" style={{ fontSize: '0.62rem' }}>
                        Open
                      </span>
                    ) : (
                      <span className="pastel-badge pastel-badge-green" style={{ fontSize: '0.62rem' }}>
                        Claimed
                      </span>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className={`badge tag-${task.category}`} style={{ fontSize: '0.64rem' }}>
                      {task.category}
                    </span>
                    <PriorityBadge priority={task.priority} size="xs" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {assignee ? (
                      <>
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
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
                        style={{ padding: '0 8px', height: '22px', fontSize: '0.66rem', borderRadius: 'var(--radius-sm)' }}
                      >
                        Claim
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
                      <Edit3 size={12} />
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
