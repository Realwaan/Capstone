import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskCategory, TaskPriority, TaskStatus, Subtask } from '../types';
import { X, Plus, Trash2, CheckSquare, Sparkles } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { members, phases, addTask, updateTask, deleteTask } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('code');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [phaseId, setPhaseId] = useState<number>(3);
  const [storyPoints, setStoryPoints] = useState<number>(5);
  const [estimatedHours, setEstimatedHours] = useState<number>(15);
  const [dueDate, setDueDate] = useState<string>('');
  const [deliverableUrl, setDeliverableUrl] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssigneeId(taskToEdit.assigneeId);
      setPhaseId(taskToEdit.phaseId);
      setStoryPoints(taskToEdit.storyPoints);
      setEstimatedHours(taskToEdit.estimatedHours);
      setDueDate(taskToEdit.dueDate);
      setDeliverableUrl(taskToEdit.deliverableUrl || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('code');
      setPriority('medium');
      setStatus('todo');
      setAssigneeId(members[0]?.id || 'm1');
      setPhaseId(3);
      setStoryPoints(5);
      setEstimatedHours(12);
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setDeliverableUrl('');
      setSubtasks([]);
    }
  }, [taskToEdit, members, isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
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
        subtasks
      });
    } else {
      addTask({
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
        subtasks
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {taskToEdit ? 'Edit Capstone Task' : 'Create New Capstone Task'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Task Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Implement Computer Vision Inference Pipeline"
              className="input-field" 
              required 
            />
          </div>

          <div>
            <label className="input-label">Description & Acceptance Criteria</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Detail specific deliverables, API endpoints, or thesis methodology requirements..."
              className="input-field" 
              rows={3} 
            />
          </div>

          <div className="grid-cols-3">
            <div>
              <label className="input-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} className="input-field">
                <option value="code">💻 Code / Feature</option>
                <option value="manuscript">📖 Manuscript</option>
                <option value="research">🔬 Research & ML</option>
                <option value="testing">🧪 Testing / QA</option>
                <option value="hardware">⚙️ Hardware</option>
                <option value="design">🎨 UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="input-label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input-field">
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="input-label">Workflow Stage</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="input-field">
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="peer_review">Peer Review</option>
                <option value="adviser_review">Adviser Review</option>
                <option value="done">Done / Defense-Ready</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="input-label">Assignee</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input-field">
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Milestone Phase</label>
              <select value={phaseId} onChange={(e) => setPhaseId(Number(e.target.value))} className="input-field">
                {phases.map(p => (
                  <option key={p.id} value={p.id}>Phase {p.id}: {p.title.split(':')[1] || p.title}</option>
                ))}
              </select>
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

          {/* Subtasks Checklist Management */}
          <div>
            <label className="input-label">Subtask Checklist ({subtasks.length} items)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input 
                type="text" 
                value={newSubtaskTitle} 
                onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                placeholder="Add subtask step..." 
                className="input-field" 
              />
              <button type="button" onClick={handleAddSubtask} className="btn btn-secondary btn-sm">
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
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
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {taskToEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
