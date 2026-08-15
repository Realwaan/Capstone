import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../types';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MoreVertical, 
  Calendar, 
  User, 
  ListTodo, 
  CheckSquare, 
  ArrowRight, 
  Trash2, 
  Edit3,
  Search
} from 'lucide-react';

interface KanbanViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#64748b' },
  { id: 'todo', label: 'To Do', color: '#38bdf8' },
  { id: 'in_progress', label: 'In Progress', color: '#818cf8' },
  { id: 'peer_review', label: 'Peer Review', color: '#fbbf24' },
  { id: 'adviser_review', label: 'Adviser Review', color: '#f43f5e' },
  { id: 'done', label: 'Done / Defense Ready', color: '#10b981' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({ onOpenNewTask, onEditTask }) => {
  const { 
    tasks, 
    members, 
    moveTaskStatus, 
    toggleSubtask, 
    deleteTask, 
    searchQuery,
    filterCategory,
    setFilterCategory 
  } = useProject();

  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesAssignee = selectedAssignee === 'all' || task.assigneeId === selectedAssignee;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesAssignee && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStatus(taskId, status);
      if (status === 'done') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
    setDraggingTaskId(null);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done'];
    const idx = order.indexOf(current);
    if (idx < order.length - 1) return order[idx + 1];
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Academic Sprint Kanban</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage capstone development tasks, manuscript drafts, and adviser sign-offs
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Categories</option>
            <option value="code">💻 Code / Feature</option>
            <option value="manuscript">📖 Manuscript</option>
            <option value="research">🔬 Research & ML</option>
            <option value="testing">🧪 Testing / QA</option>
            <option value="hardware">⚙️ Hardware</option>
            <option value="design">🎨 UI/UX Design</option>
          </select>

          {/* Assignee Filter */}
          <select 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.roleTitle})</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <button onClick={onOpenNewTask} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 6 Kanban Columns Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '20px',
          minHeight: '650px'
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
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                padding: '14px',
                minWidth: '280px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {col.label}
                  </span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Column Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {colTasks.map(task => {
                  const assignee = members.find(m => m.id === task.assigneeId);
                  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const nextStatus = getNextStatus(task.status);

                  return (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="card"
                      style={{
                        padding: '14px',
                        cursor: 'grab',
                        background: 'var(--bg-elevated)',
                        borderColor: draggingTaskId === task.id ? 'var(--primary)' : 'var(--border-card)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Card Header: Category & Priority */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className={`badge tag-${task.category}`} style={{ fontSize: '0.62rem' }}>
                          {task.category}
                        </span>
                        <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.62rem' }}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                        {task.title}
                      </div>

                      {/* Description snippet */}
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.description}
                      </p>

                      {/* Subtasks checklist preview */}
                      {totalSubtasks > 0 && (
                        <div style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.15)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span>Checklist ({completedSubtasks}/{totalSubtasks})</span>
                            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
                          </div>
                          <div className="progress-bar-container" style={{ height: '4px' }}>
                            <div className="progress-bar-fill" style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }} />
                          </div>
                          {/* First 2 subtasks toggleable */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            {task.subtasks.map(st => (
                              <label 
                                key={st.id} 
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: st.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={st.completed} 
                                  onChange={() => toggleSubtask(task.id, st.id)}
                                  style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deliverable Link if available */}
                      {task.deliverableUrl && (
                        <a 
                          href={task.deliverableUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.7rem',
                            color: 'var(--text-accent)',
                            textDecoration: 'none',
                            marginBottom: '10px'
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>View Deliverable Link</span>
                        </a>
                      )}

                      {/* Card Footer: Assignee & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        {/* Assignee & Due Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {assignee && (
                            <img 
                              src={assignee.avatar} 
                              alt={assignee.name} 
                              title={`${assignee.name} (${assignee.roleTitle})`}
                              style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                          )}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Quick Action Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            onClick={() => onEditTask(task)}
                            className="btn btn-ghost btn-icon"
                            style={{ width: '26px', height: '26px' }}
                            title="Edit Task"
                          >
                            <Edit3 size={13} />
                          </button>
                          {nextStatus && (
                            <button 
                              onClick={() => {
                                moveTaskStatus(task.id, nextStatus);
                                if (nextStatus === 'done') {
                                  confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
                                }
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.68rem', gap: '3px' }}
                              title={`Advance to ${nextStatus}`}
                            >
                              <span>Next</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State / Add Task Quick Button */}
                {colTasks.length === 0 && (
                  <div style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem'
                  }}>
                    No tasks in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
