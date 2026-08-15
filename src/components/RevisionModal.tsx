import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, AlertCircle } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose }) => {
  const { addRevision, project } = useProject();

  const [source, setSource] = useState(project.adviser.name);
  const [chapterOrComponent, setChapterOrComponent] = useState('Chapter 3: Methodology');
  const [comment, setComment] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'verified'>('pending');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addRevision({
      source,
      chapterOrComponent,
      comment,
      actionTaken,
      status
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Log Adviser / Panel Critique</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-cols-2">
            <div>
              <label className="input-label">Source (Adviser / Panelist Name) *</label>
              <input 
                type="text" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>

            <div>
              <label className="input-label">Affected Chapter or System Module *</label>
              <input 
                type="text" 
                value={chapterOrComponent} 
                onChange={(e) => setChapterOrComponent(e.target.value)} 
                placeholder="e.g. Chapter 3: Section 3.2 or DICOM Viewer" 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="input-label">Critique / Revision Directive *</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Exact directive or suggestion provided by the adviser..." 
              className="input-field" 
              rows={3} 
              required 
            />
          </div>

          <div>
            <label className="input-label">Action Taken / Proposed Plan</label>
            <textarea 
              value={actionTaken} 
              onChange={(e) => setActionTaken(e.target.value)} 
              placeholder="Describe modifications, additions, or testing conducted..." 
              className="input-field" 
              rows={2} 
            />
          </div>

          <div>
            <label className="input-label">Initial Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input-field">
              <option value="pending">🔴 Pending Action</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="resolved">🔵 Resolved (Ready for Review)</option>
              <option value="verified">🟢 Verified by Adviser</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
