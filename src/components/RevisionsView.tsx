import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { RevisionItem } from '../types';
import { 
  MessageSquareCheck, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Search,
  ArrowRight
} from 'lucide-react';

interface RevisionsViewProps {
  onOpenNewRevision: () => void;
}

export const RevisionsView: React.FC<RevisionsViewProps> = ({ onOpenNewRevision }) => {
  const { revisions, updateRevisionStatus, deleteRevision, currentMember } = useProject();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionInput, setActionInput] = useState<string>('');

  const filteredRevisions = revisions.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const verifiedCount = revisions.filter(r => r.status === 'verified').length;
  const resolvedCount = revisions.filter(r => r.status === 'resolved').length;
  const pendingCount = revisions.filter(r => r.status === 'pending').length;
  const inProgressCount = revisions.filter(r => r.status === 'in_progress').length;

  const handleStartEditAction = (rev: RevisionItem) => {
    setEditingId(rev.id);
    setActionInput(rev.actionTaken);
  };

  const handleSaveAction = (revId: string) => {
    updateRevisionStatus(revId, 'resolved', actionInput);
    setEditingId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Adviser & Panel Revision Compliance Matrix</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Official audit log tracking adviser comments, revisions made, and verification sign-offs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Printer size={14} />
            <span>Print / Export Matrix</span>
          </button>
          <button onClick={onOpenNewRevision} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Log Adviser Feedback</span>
          </button>
        </div>
      </div>

      {/* 4 Status Summary Cards */}
      <div className="grid-cols-4">
        <div 
          onClick={() => setFilterStatus('all')} 
          className="card" 
          style={{ cursor: 'pointer', borderColor: filterStatus === 'all' ? 'var(--primary)' : 'var(--border-card)' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Logged Items</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{revisions.length}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('verified')} 
          className="card" 
          style={{ cursor: 'pointer', borderColor: filterStatus === 'verified' ? 'var(--success)' : 'var(--border-card)' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>Verified by Adviser</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{verifiedCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('resolved')} 
          className="card" 
          style={{ cursor: 'pointer', borderColor: filterStatus === 'resolved' ? 'var(--info)' : 'var(--border-card)' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--info)' }}>Resolved (Pending Verification)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--info)', marginTop: '4px' }}>{resolvedCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('pending')} 
          className="card" 
          style={{ cursor: 'pointer', borderColor: filterStatus === 'pending' ? 'var(--danger)' : 'var(--border-card)' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>Action Required</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>{pendingCount + inProgressCount}</div>
        </div>
      </div>

      {/* Revision Table / Cards */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            Revision Compliance Log ({filteredRevisions.length} items)
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredRevisions.map((rev, index) => {
            const isEditing = editingId === rev.id;

            return (
              <div 
                key={rev.id}
                className="stagger-item"
                style={{
                  padding: '18px 20px',
                  borderBottom: index < filteredRevisions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: rev.status === 'verified' ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Top Row: Meta Info & Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      #{rev.id}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                      {rev.chapterOrComponent}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      • Logged on {rev.date}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Status Dropdown */}
                    <select 
                      value={rev.status} 
                      onChange={(e) => updateRevisionStatus(rev.id, e.target.value as RevisionItem['status'])}
                      className="input-field"
                      style={{
                        width: 'auto',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        borderColor: rev.status === 'verified' ? 'var(--success)' : rev.status === 'resolved' ? 'var(--info)' : rev.status === 'in_progress' ? 'var(--warning)' : 'var(--danger)'
                      }}
                    >
                      <option value="pending">🔴 Pending</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🔵 Resolved</option>
                      <option value="verified">🟢 Verified by Adviser</option>
                    </select>

                    <button 
                      onClick={() => deleteRevision(rev.id)}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                      title="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Directive / Comment from Adviser */}
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Critique / Revision Directive ({rev.source})
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    "{rev.comment}"
                  </div>
                </div>

                {/* Action Taken Section */}
                <div style={{ padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Action Taken / Resolution
                    </span>
                    {!isEditing && (
                      <button 
                        onClick={() => handleStartEditAction(rev)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.7rem', color: 'var(--text-accent)' }}
                      >
                        <Edit3 size={11} />
                        <span>Update Action</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea 
                        value={actionInput} 
                        onChange={(e) => setActionInput(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder="Describe the changes made in the code/manuscript..."
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveAction(rev.id)} className="btn btn-primary btn-sm">
                          Save & Mark Resolved
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: rev.actionTaken ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: rev.actionTaken ? 'normal' : 'italic' }}>
                      {rev.actionTaken || 'No action logged yet. Click "Update Action" to record team changes.'}
                    </div>
                  )}

                  {/* Verification Tag */}
                  {rev.status === 'verified' && rev.verifiedBy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--success)' }}>
                      <ShieldCheck size={14} />
                      <span>Verified by {rev.verifiedBy} on {rev.resolvedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRevisions.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No revisions match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
