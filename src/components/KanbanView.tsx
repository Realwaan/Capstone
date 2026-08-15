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
  Calendar, 
  User, 
  ArrowRight, 
  Trash2, 
  Edit3,
  Search,
  LayoutGrid,
  List,
  Sparkles
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
  { id: 'done', label: 'Done', color: '#10b981' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({ onOpenNewTask, onEditTask }) => {
  const { 
    tasks, 
    members, 
    addTask,
    moveTaskStatus, 
    toggleSubtask, 
    deleteTask, 
    searchQuery,
    filterCategory,
    setFilterCategory 
  } = useProject();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Quick inline task input state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('code');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: '',
      category: quickCategory,
      priority: quickPriority,
      status: 'todo',
      assigneeId: members[0]?.id || 'm1',
      phaseId: 1,
      storyPoints: 3,
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtasks: []
    });

    setQuickTitle('');
  };

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
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Task Matrix & Work Execution</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sprint deliverables, manuscript drafting tasks, and adviser review states
          </p>
        </div>

        {/* View Mode Toggle & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Board / List Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            <button 
              onClick={() => setViewMode('board')} 
              className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '3px 8px', borderRadius: '4px' }}
            >
              <LayoutGrid size={13} />
              <span>Board</span>
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '3px 8px', borderRadius: '4px' }}
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Category Filter */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="all">All Categories</option>
            <option value="code">Code</option>
            <option value="manuscript">Manuscript</option>
            <option value="research">Research</option>
            <option value="testing">Testing</option>
            <option value="hardware">Hardware</option>
            <option value="design">Design</option>
          </select>

          {/* Assignee Filter */}
          <select 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="all">All Assignees</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button onClick={onOpenNewTask} className="btn btn-primary btn-sm" style={{ gap: '5px' }}>
            <Plus size={14} />
            <span>Add Detailed Task</span>
          </button>
        </div>
      </div>

      {/* Quick Task Capture Bar */}
      <form 
        onSubmit={handleQuickAdd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px'
        }}
      >
        <div style={{ color: 'var(--text-muted)' }}>
          <Plus size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Quick add a new task (Type title and press Enter)..." 
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sans)'
          }}
        />
        <select 
          value={quickCategory} 
          onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '0.74rem',
            padding: '4px 8px',
            outline: 'none'
          }}
        >
          <option value="code">Code</option>
          <option value="manuscript">Manuscript</option>
          <option value="research">Research</option>
          <option value="testing">Testing</option>
          <option value="hardware">Hardware</option>
          <option value="design">Design</option>
        </select>
        <select 
          value={quickPriority} 
          onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '0.74rem',
            padding: '4px 8px',
            outline: 'none'
          }}
        >
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
          Add
        </button>
      </form>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '16px',
            minHeight: '600px'
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
                  background: 'rgba(12, 15, 23, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                  minWidth: '260px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
                      {col.label}
                    </span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
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
                        className="card stagger-item"
                        style={{
                          padding: '12px',
                          cursor: 'grab',
                          background: 'var(--bg-elevated)',
                          borderColor: draggingTaskId === task.id ? 'var(--primary)' : 'var(--border-card)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className={`badge tag-${task.category}`} style={{ fontSize: '0.58rem' }}>
                            {task.category}
                          </span>
                          <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.58rem' }}>
                            {task.priority}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                          {task.title}
                        </div>

                        {task.description && (
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {task.description}
                          </p>
                        )}

                        {totalSubtasks > 0 && (
                          <div style={{ marginBottom: '8px', background: 'rgba(0,0,0,0.15)', padding: '5px 7px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                              <span>Checklist</span>
                              <span>{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: '3px' }}>
                              <div className="progress-bar-fill" style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Card Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {assignee && (
                              <img 
                                src={assignee.avatar} 
                                alt={assignee.name} 
                                title={`${assignee.name}`}
                                style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} 
                              />
                            )}
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {task.dueDate}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <button 
                              onClick={() => onEditTask(task)}
                              className="btn btn-ghost btn-icon"
                              style={{ width: '22px', height: '22px' }}
                              title="Edit"
                            >
                              <Edit3 size={11} />
                            </button>
                            {nextStatus && (
                              <button 
                                onClick={() => {
                                  moveTaskStatus(task.id, nextStatus);
                                  if (nextStatus === 'done') confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '2px 6px', fontSize: '0.64rem', gap: '2px' }}
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
                    <div style={{ padding: '20px 8px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density List View */
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '10px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            <div>Task Title</div>
            <div>Stage</div>
            <div>Category</div>
            <div>Priority</div>
            <div>Assignee / Due</div>
            <div>Actions</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTasks.map((task, index) => {
              const assignee = members.find(m => m.id === task.assigneeId);
              return (
                <div 
                  key={task.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < filteredTasks.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{task.status}</span>
                  </div>
                  <div>
                    <span className={`badge tag-${task.category}`} style={{ fontSize: '0.65rem' }}>{task.category}</span>
                  </div>
                  <div>
                    <span className={`badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>{assignee?.name || 'Unassigned'}</span>
                    <span>• {task.dueDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => onEditTask(task)} className="btn btn-ghost btn-icon" style={{ width: '26px', height: '26px' }}>
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="btn btn-ghost btn-icon" style={{ width: '26px', height: '26px', color: 'var(--danger)' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No tasks logged yet. Use the quick-add bar above to create your first task!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
