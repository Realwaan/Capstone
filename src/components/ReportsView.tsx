import React, { useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Wand2,
  X,
  TrendingDown,
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { generateAdviserReportAI } from '../lib/gemini';
import { SprintBurndownChart } from './SprintBurndownChart';

export const ReportsView: React.FC = () => {
  const { project, members, tasks, phases, chapters, revisions, standups } = useProject();
  const [activeTab, setActiveTab] = useState<'burndown' | 'document'>('burndown');
  const [reportTitle, setReportTitle] = useState(`Weekly Capstone Progress Report - Week ${new Date().toLocaleDateString()}`);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReportModalOpen, setAiReportModalOpen] = useState(false);
  const [aiReportContent, setAiReportContent] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review');
  const resolvedRevisions = revisions.filter(r => r.status === 'resolved' || r.status === 'verified');
  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    toast.info('Analyzing project velocity & compiling executive briefing with Gemini AI... 🪄');
    try {
      const report = await generateAdviserReportAI(project, tasks, phases, standups, revisions);
      setAiReportContent(report);
      setAiReportModalOpen(true);
      toast.success('Executive Progress Briefing generated! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI report');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Capstone_Progress_Report_${project.teamName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = `
# ${reportTitle}
**Project:** ${project.title}
**Team:** ${project.teamName}
**Adviser:** ${project.adviser.name}
**Date:** ${new Date().toISOString().split('T')[0]}
**Target Defense:** ${project.targetDefenseDate}
**Overall Progress:** ${project.overallProgress}% (Phase ${project.currentPhaseId})

---
### 1. Key Accomplishments This Period
${completedTasks.map(t => `- [x] **${t.title}** (${t.category.toUpperCase()}) - Logged: ${t.loggedHours}h`).join('\n')}

---
### 2. In-Progress Tasks & Deliverables
${inProgressTasks.map(t => `- [/] **${t.title}** - Due: ${t.dueDate}`).join('\n')}

---
### 3. Milestone Phases & Deliverables
${phases.map(p => `- **Phase ${p.id} (${p.title}):** ${p.progressPercentage}% complete - Status: ${p.status.toUpperCase()}`).join('\n')}

---
### 4. Adviser Revision Matrix Status
- Total Items: ${revisions.length} | Resolved/Verified: ${resolvedRevisions.length}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Title & Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Project Velocity & Progress Intelligence</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time agile burndown metrics, sprint burn rate, and institutional status reports
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <button
            onClick={() => setActiveTab('burndown')}
            className={`btn btn-sm ${activeTab === 'burndown' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', gap: '6px' }}
          >
            <Zap size={14} />
            <span>Sprint Burndown & Velocity</span>
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`btn btn-sm ${activeTab === 'document' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', gap: '6px' }}
          >
            <FileText size={14} />
            <span>Adviser Report Sheet</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SPRINT BURNDOWN & VELOCITY */}
      {activeTab === 'burndown' && (
        <SprintBurndownChart sprintDurationDays={14} showHistoricalVelocity={true} />
      )}

      {/* TAB 2: FORMAL PRINTABLE DOCUMENT SHEET */}
      {activeTab === 'document' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleGenerateAIReport}
              disabled={isGeneratingAI}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                gap: '6px'
              }}
            >
              <Sparkles size={14} className={isGeneratingAI ? 'spin' : ''} />
              <span>{isGeneratingAI ? 'Generating AI Briefing...' : '🪄 AI Executive Briefing'}</span>
            </button>

            <button onClick={handleCopyMarkdown} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
            </button>

            <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              <Printer size={14} />
              <span>Print Report</span>
            </button>

            <button 
              onClick={handleExportPDF} 
              className="btn btn-primary btn-sm" 
              style={{ gap: '6px' }}
              disabled={isExporting}
            >
              <Download size={14} />
              <span>{isExporting ? 'Compiling PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>

          {/* Formal Printable Document Sheet Preview */}
          <div 
            ref={reportRef}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '900px',
              margin: '0 auto',
              width: '100%',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6
            }}
          >
            {/* Document Institutional Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Academic Capstone Project Status Report
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {project.title}
                </h1>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  {project.teamName} • Department of Computer Science & Engineering
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Date Generated</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  {new Date().toISOString().split('T')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                  Overall Progress: {project.overallProgress}%
                </div>
              </div>
            </div>

            {/* Project Metadata Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Capstone Adviser</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{project.adviser.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Milestone</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Phase {project.currentPhaseId} ({currentPhase.progressPercentage}%)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Final Defense</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6366f1', fontFamily: 'var(--font-mono)' }}>{project.targetDefenseDate}</div>
              </div>
            </div>

            {/* Section 1: Accomplishments */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
                1. Completed Sprint Deliverables ({completedTasks.length} Items)
              </h3>
              {completedTasks.length === 0 ? (
                <p style={{ fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic' }}>No completed deliverables recorded for this period.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {completedTasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                          ✓ {task.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {task.description}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        {task.category.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: In-Progress */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
                2. Active Engineering Tasks ({inProgressTasks.length} Items)
              </h3>
              {inProgressTasks.length === 0 ? (
                <p style={{ fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic' }}>All scheduled deliverables currently up to date.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inProgressTasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#92400e' }}>
                        ⏳ {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
                        Target: {task.dueDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Adviser Revisions Matrix */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
                3. Adviser Revision Matrix ({resolvedRevisions.length}/{revisions.length} Addressed)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {revisions.map(rev => (
                  <div key={rev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                    <div style={{ color: '#334155' }}>
                      {rev.status === 'verified' || rev.status === 'resolved' ? '✅' : '⚠️'} {rev.chapterOrComponent}: {rev.comment}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rev.status === 'verified' ? '#16a34a' : '#ea580c' }}>
                      {rev.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Signature Sign-Off Block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0', marginTop: '40px' }}>
              <div>
                <div style={{ height: '50px' }}></div>
                <div style={{ borderTop: '1px solid #475569', paddingTop: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    {members.find(m => m.role === 'leader')?.name || 'Lead Researcher'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lead Project Author & Researcher</div>
                </div>
              </div>

              <div>
                <div style={{ height: '50px' }}></div>
                <div style={{ borderTop: '1px solid #475569', paddingTop: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{project.adviser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Faculty Adviser / Panel Chair</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Executive Report Modal */}
      {aiReportModalOpen && (
        <div className="modal-backdrop" onClick={() => setAiReportModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '750px',
              width: '95%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#a855f7' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Executive Progress Briefing (Gemini AI)</h3>
              </div>
              <button onClick={() => setAiReportModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <pre style={{
                background: 'var(--bg-elevated)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0
              }}>
                {aiReportContent}
              </pre>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Synthesized for Adviser <strong>{project.adviser.name}</strong>
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReportContent);
                    toast.success('Executive briefing copied to clipboard! 📋');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Copy size={14} />
                  <span>Copy Briefing</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([aiReportContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Adviser_Briefing_${new Date().toISOString().split('T')[0]}.md`;
                    a.click();
                    toast.success('Briefing downloaded as Markdown (.md)! 📥');
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
