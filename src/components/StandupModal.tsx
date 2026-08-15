import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, Send } from 'lucide-react';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandupModal: React.FC<StandupModalProps> = ({ isOpen, onClose }) => {
  const { addStandup, currentMember } = useProject();

  const [yesterdayAccomplished, setYesterdayAccomplished] = useState('');
  const [todayPlan, setTodayPlan] = useState('');
  const [blockers, setBlockers] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yesterdayAccomplished.trim() || !todayPlan.trim()) return;

    addStandup({
      memberId: currentMember.id,
      yesterdayAccomplished,
      todayPlan,
      blockers: blockers.trim() || 'No active blockers.'
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Daily Sprint Standup</h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Posting as: {currentMember.name} ({currentMember.roleTitle})</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">1. What did you accomplish yesterday? *</label>
            <textarea 
              value={yesterdayAccomplished} 
              onChange={(e) => setYesterdayAccomplished(e.target.value)} 
              placeholder="e.g. Completed unit tests for triage queue API and revised Section 3.2 diagrams..." 
              className="input-field" 
              rows={3} 
              required 
            />
          </div>

          <div>
            <label className="input-label">2. What are your main goals for today? *</label>
            <textarea 
              value={todayPlan} 
              onChange={(e) => setTodayPlan(e.target.value)} 
              placeholder="e.g. Integrate WebSocket live alert broadcast and benchmark ONNX inference latency..." 
              className="input-field" 
              rows={3} 
              required 
            />
          </div>

          <div>
            <label className="input-label">3. Any blockers or dependencies holding you up?</label>
            <input 
              type="text" 
              value={blockers} 
              onChange={(e) => setBlockers(e.target.value)} 
              placeholder="e.g. None currently (or: Waiting for GPU quota / Adviser review)" 
              className="input-field" 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
              <Send size={14} />
              <span>Post Standup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
