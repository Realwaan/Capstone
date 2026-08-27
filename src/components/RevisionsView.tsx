import React, { useState, useMemo, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { RevisionItem } from '../types';
import {
  calculateRevisionCompliance,
  filterRevisions,
  generateRevisionMarkdownMatrix,
} from '../lib/domain/revisions';
import {
  Plus,
  Printer,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Copy,
  ChevronDown,
  Sparkles,
  BookOpen,
  CornerDownLeft,
  X,
  FileCheck2
} from 'lucide-react';
import { toast } from 'sonner';

interface RevisionsViewProps {
  onOpenNewRevision: () => void;
}

export const RevisionsView: React.FC<RevisionsViewProps> = ({ onOpenNewRevision }) => {
  const { revisions, updateRevisionStatus, deleteRevision, project, currentMember } = useProject();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionInput, setActionInput] = useState<string>('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const stats = useMemo(() => calculateRevisionCompliance(revisions), [revisions]);

  const filteredRevisions = useMemo(
    () => filterRevisions(revisions, searchQuery, filterStatus),
    [revisions, searchQuery, filterStatus]
  );

  const handleStartEditAction = (rev: RevisionItem) => {
    setEditingId(rev.id);
    setActionInput(rev.actionTaken || '');
  };

  const handleSaveAction = (revId: string, customStatus?: RevisionItem['status']) => {
    const statusToSet = customStatus || 'resolved';
    updateRevisionStatus(revId, statusToSet, actionInput.trim());
    setEditingId(null);
    toast.success('Action resolution saved & directive updated! 🚀');
  };

  const handleKeyDownAction = (e: React.KeyboardEvent, revId: string) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveAction(revId);
    }
  };

  const handleCopyMarkdownMatrix = () => {
    const markdown = generateRevisionMarkdownMatrix(revisions, project?.title);
    navigator.clipboard.writeText(markdown);
    toast.success('Adviser compliance matrix copied as Markdown table! 📋');
  };

  const handlePrint = () => {
    window.print();
  };

  const statusOptions: Array<{
    value: RevisionItem['status'];
    label: string;
    pillClass: string;
    icon: React.ReactNode;
  }> = [
    {
      value: 'pending',
      label: 'Action Required',
      pillClass: 'status-pill-pending',
      icon: <AlertCircle size={12} />,
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      pillClass: 'status-pill-in_progress',
      icon: <Clock size={12} />,
    },
    {
      value: 'resolved',
      label: 'Resolved',
      pillClass: 'status-pill-resolved',
      icon: <CheckCircle2 size={12} />,
    },
    {
      value: 'verified',
      label: 'Verified by Adviser',
      pillClass: 'status-pill-verified',
      icon: <ShieldCheck size={12} />,
    },
  ];

  const resolutionSuggestions = [
    'Manuscript text revised',
    'Code refactored & pushed',
    'Unit tests added',
    'Methodology section expanded',
    'Confusion matrix added',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Adviser & Panel Revision Compliance Matrix
            </h2>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              {stats.total} Directives
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Audit log tracking panel comments, manuscript updates, code resolutions, and faculty sign-offs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleCopyMarkdownMatrix} className="btn btn-secondary btn-sm" style={{ gap: '6px' }} title="Copy formatted Markdown table">
            <Copy size={14} />
            <span>Copy Matrix</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
          <button onClick={onOpenNewRevision} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Log Directive</span>
          </button>
        </div>
      </div>

      {/* 4 Supabase-Style Obsidian Bento Telemetry Cards */}
      <div className="grid-cols-4" style={{ gap: '14px' }}>
        {/* Total Directives */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`revisions-telemetry-card ${filterStatus === 'all' ? 'is-active' : ''}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Directives
            </span>
            <BookOpen size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Logged across all defense chapters
          </div>
        </div>

        {/* Verified Count */}
        <div
          onClick={() => setFilterStatus('verified')}
          className={`revisions-telemetry-card ${filterStatus === 'verified' ? 'is-active' : ''}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Adviser Verified
            </span>
            <ShieldCheck size={15} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
            {stats.verified}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Fully certified for defense
          </div>
        </div>

        {/* Resolved Count */}
        <div
          onClick={() => setFilterStatus('resolved')}
          className={`revisions-telemetry-card ${filterStatus === 'resolved' ? 'is-active' : ''}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#8c8cff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resolved (Awaiting Sign-off)
            </span>
            <CheckCircle2 size={15} style={{ color: '#8c8cff' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8c8cff', marginTop: '4px' }}>
            {stats.resolved}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Changes implemented by team
          </div>
        </div>

        {/* Compliance Gauge */}
        <div
          onClick={() => setFilterStatus('action_required')}
          className={`revisions-telemetry-card ${filterStatus === 'action_required' ? 'is-active' : ''}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: stats.actionRequired > 0 ? 'var(--danger)' : 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Defense Compliance
            </span>
            <Sparkles size={15} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats.complianceRate}%
            </span>
            <span style={{ fontSize: '0.74rem', color: stats.actionRequired > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
              {stats.actionRequired > 0 ? `${stats.actionRequired} action items` : '100% compliant'}
            </span>
          </div>
          <div className="compliance-gauge-track">
            <div className="compliance-gauge-fill" style={{ width: `${stats.complianceRate}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Monday-Style Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`filter-chip ${filterStatus === 'all' ? 'is-active' : ''}`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('action_required')}
            className={`filter-chip ${filterStatus === 'action_required' ? 'is-active' : ''}`}
          >
            <span className="status-pill-dot" style={{ background: '#ff453a' }} />
            Action Required ({stats.actionRequired})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`filter-chip ${filterStatus === 'in_progress' ? 'is-active' : ''}`}
          >
            <span className="status-pill-dot" style={{ background: '#ff9f0a' }} />
            In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`filter-chip ${filterStatus === 'resolved' ? 'is-active' : ''}`}
          >
            <span className="status-pill-dot" style={{ background: '#6c6cff' }} />
            Resolved ({stats.resolved})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`filter-chip ${filterStatus === 'verified' ? 'is-active' : ''}`}
          >
            <span className="status-pill-dot" style={{ background: '#30d158' }} />
            Verified ({stats.verified})
          </button>
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directives, chapter, adviser..."
            className="input-field"
            style={{ paddingLeft: '32px', paddingRight: searchQuery ? '28px' : '10px', fontSize: '0.78rem', height: '34px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Revision Compliance List */}
      <div className="card" style={{ padding: '0', overflow: 'visible' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={16} style={{ color: 'var(--primary)' }} />
            <span>Compliance Matrix Records</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Showing {filteredRevisions.length} of {revisions.length} records
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredRevisions.map((rev, index) => {
            const isEditing = editingId === rev.id;
            const isDropdownOpen = activeDropdownId === rev.id;
            const currentStatusConfig = statusOptions.find((s) => s.value === rev.status) || statusOptions[0];

            return (
              <div
                key={rev.id}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredRevisions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: rev.status === 'verified' ? 'rgba(48, 209, 88, 0.02)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  transition: 'background 140ms ease',
                }}
              >
                {/* Top Row: Meta Tags, Chapter Pill, and Monday-Style Status Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      #REV-{rev.id.slice(0, 6)}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rev.chapterOrComponent}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      • Logged on {rev.date}
                    </span>
                  </div>

                  {/* Status Pill with Dropdown Trigger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActiveDropdownId(isDropdownOpen ? null : rev.id)}
                        className={`status-pill ${currentStatusConfig.pillClass}`}
                        style={{ border: '1px solid currentColor' }}
                      >
                        <span className="status-pill-dot" />
                        <span>{currentStatusConfig.label}</span>
                        <ChevronDown size={12} style={{ opacity: 0.7 }} />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '6px',
                            zIndex: 100,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-card)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            padding: '6px',
                            minWidth: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          {statusOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                updateRevisionStatus(rev.id, opt.value);
                                setActiveDropdownId(null);
                                toast.success(`Status updated to ${opt.label}!`);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                background: rev.status === opt.value ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                            >
                              <span className={`status-pill ${opt.pillClass}`} style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                                <span className="status-pill-dot" />
                                {opt.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this directive entry?')) {
                          deleteRevision(rev.id);
                          toast.success('Directive deleted.');
                        }
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                      title="Delete directive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Adviser Critique Quote Block */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${
                      rev.status === 'verified'
                        ? 'var(--success)'
                        : rev.status === 'resolved'
                        ? '#6c6cff'
                        : rev.status === 'in_progress'
                        ? 'var(--warning)'
                        : 'var(--danger)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Adviser / Panel Directive • {rev.source}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </div>
                </div>

                {/* Action Taken & Resolution Block */}
                <div style={{ padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Team Resolution & Changes
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditAction(rev)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem', gap: '4px', color: 'var(--text-accent)' }}
                      >
                        <Edit3 size={11} />
                        <span>{rev.actionTaken ? 'Edit Resolution' : 'Log Action'}</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <textarea
                        value={actionInput}
                        onChange={(e) => setActionInput(e.target.value)}
                        onKeyDown={(e) => handleKeyDownAction(e, rev.id)}
                        className="input-field"
                        rows={3}
                        placeholder="Detail the exact code, architecture, or manuscript modifications implemented..."
                        style={{ fontSize: '0.82rem', lineHeight: 1.45 }}
                        autoFocus
                      />

                      {/* Quick Tag Suggestions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quick append:</span>
                        {resolutionSuggestions.map((sugg) => (
                          <button
                            key={sugg}
                            type="button"
                            onClick={() => setActionInput((prev) => (prev ? `${prev}. ${sugg}` : sugg))}
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.68rem',
                              cursor: 'pointer',
                            }}
                          >
                            + {sugg}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CornerDownLeft size={11} /> Press <kbd style={{ padding: '1px 4px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>Cmd/Ctrl + Enter</kbd> to save
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">
                            Cancel
                          </button>
                          <button onClick={() => handleSaveAction(rev.id, 'resolved')} className="btn btn-primary btn-sm">
                            Save & Mark Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.84rem', color: rev.actionTaken ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: rev.actionTaken ? 'normal' : 'italic', lineHeight: 1.45 }}>
                      {rev.actionTaken || 'No action recorded yet. Click "Log Action" to record team changes.'}
                    </div>
                  )}

                  {/* Verification Audit Badge */}
                  {rev.status === 'verified' && rev.verifiedBy && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.2)', fontSize: '0.72rem', color: 'var(--success)' }}>
                      <ShieldCheck size={13} />
                      <span>Certified by {rev.verifiedBy} on {rev.resolvedDate || rev.date}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRevisions.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <FileCheck2 size={32} style={{ opacity: 0.4 }} />
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No revision directives found
              </div>
              <p style={{ fontSize: '0.78rem', maxWidth: '360px' }}>
                {searchQuery
                  ? `No directives match "${searchQuery}". Try clearing your search query.`
                  : 'All panel directives have been addressed or no directives have been logged for this status.'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="btn btn-ghost btn-sm">
                  Clear Search Filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
