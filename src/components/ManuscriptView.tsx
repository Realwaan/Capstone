import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ManuscriptChapter, ChapterSection } from '../types';
import { 
  BookOpen, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Check, 
  FileCode, 
  Percent, 
  Calendar,
  Sparkles
} from 'lucide-react';

export const ManuscriptView: React.FC = () => {
  const { chapters, toggleChapterSection, updateChapter } = useProject();
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [wordCountInput, setWordCountInput] = useState<number>(0);
  const [docUrlInput, setDocUrlInput] = useState<string>('');

  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);
  const totalTargetWords = chapters.reduce((acc, c) => acc + c.targetWordCount, 0);
  const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
  const completedSections = chapters.reduce((acc, c) => acc + c.sections.filter(s => s.completed).length, 0);
  const overallProgress = Math.round((completedSections / totalSections) * 100);

  const startEdit = (ch: ManuscriptChapter) => {
    setEditingChapterId(ch.id);
    setWordCountInput(ch.wordCount);
    setDocUrlInput(ch.docUrl);
  };

  const saveEdit = (chId: number) => {
    updateChapter(chId, {
      wordCount: wordCountInput,
      docUrl: docUrlInput
    });
    setEditingChapterId(null);
  };

  const getStatusBadge = (status: ManuscriptChapter['adviserStatus']) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Approved by Adviser</span>;
      case 'in_review':
        return <span className="badge badge-info">Under Review</span>;
      case 'needs_revision':
        return <span className="badge badge-danger">Revisions Needed</span>;
      default:
        return <span className="badge badge-neutral">Not Submitted</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Thesis Manuscript & Chapter Tracker</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time drafting progress for Chapters 1 through 5, section checklists & word counts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileText size={18} style={{ color: 'var(--text-accent)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Words</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {totalWords.toLocaleString()} / {totalTargetWords.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Percent size={18} style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sections Completed</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                {completedSections} / {totalSections} ({overallProgress}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters 1 to 5 List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {chapters.map(chapter => {
          const completedCount = chapter.sections.filter(s => s.completed).length;
          const pct = Math.round((completedCount / chapter.sections.length) * 100);
          const isEditing = editingChapterId === chapter.id;

          return (
            <div key={chapter.id} className="card" style={{ padding: '22px' }}>
              {/* Top Chapter Bar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: pct === 100 ? '#10b981' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    flexShrink: 0
                  }}>
                    {pct === 100 ? <Check size={22} /> : `CH ${chapter.chapterNumber}`}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>
                      {getStatusBadge(chapter.adviserStatus)}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {chapter.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Word Count & External Doc Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {chapter.docUrl && (
                    <a 
                      href={chapter.docUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <ExternalLink size={14} />
                      <span>Open Document Draft</span>
                    </a>
                  )}

                  <button 
                    onClick={() => isEditing ? saveEdit(chapter.id) : startEdit(chapter)}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: '4px' }}
                  >
                    <Edit3 size={14} />
                    <span>{isEditing ? 'Save' : 'Edit Info'}</span>
                  </button>
                </div>
              </div>

              {/* Editing Form Inline */}
              {isEditing && (
                <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'flex-end', border: '1px solid var(--border-card)' }}>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Word Count (Current)</label>
                    <input 
                      type="number" 
                      value={wordCountInput} 
                      onChange={(e) => setWordCountInput(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label className="input-label">Draft URL (Google Docs / Overleaf)</label>
                    <input 
                      type="text" 
                      value={docUrlInput} 
                      onChange={(e) => setDocUrlInput(e.target.value)}
                      className="input-field"
                      placeholder="https://docs.google.com/..."
                    />
                  </div>
                  <button onClick={() => saveEdit(chapter.id)} className="btn btn-primary btn-sm">
                    Save Changes
                  </button>
                </div>
              )}

              {/* Progress & Word Stats Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Drafting Completeness</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{pct}% ({completedCount}/{chapter.sections.length} Sections)</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '6px' }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #ec4899)' }} />
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Word Count</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {chapter.wordCount.toLocaleString()} / {chapter.targetWordCount.toLocaleString()}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Activity</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {chapter.lastUpdated}
                  </div>
                </div>
              </div>

              {/* Section Sub-Checklist */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Chapter Subsections Checklist
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px' }}>
                  {chapter.sections.map(sec => (
                    <label 
                      key={sec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={sec.completed} 
                        onChange={() => toggleChapterSection(chapter.id, sec.id)}
                        style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: sec.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: sec.completed ? 'line-through' : 'none' }}>
                          {sec.title}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {sec.pageEstimate}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
