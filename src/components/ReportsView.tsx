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
  GraduationCap
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { project, members, tasks, phases, chapters, revisions } = useProject();
  const [reportTitle, setReportTitle] = useState(`Weekly Capstone Progress Report - Week ${new Date().toLocaleDateString()}`);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review');
  const resolvedRevisions = revisions.filter(r => r.status === 'resolved' || r.status === 'verified');
  const currentPhase = phases.find(p => p.id === project.currentPhaseId) || phases[0];

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
### 2. In-Progress Deliverables
${inProgressTasks.map(t => `- [/] **${t.title}** - Due: ${t.dueDate}`).join('\n')}

---
### 3. Manuscript Drafting Progress
${chapters.map(c => `- **Chapter ${c.chapterNumber} (${c.title}):** ${c.wordCount} words - Status: ${c.adviserStatus.toUpperCase()}`).join('\n')}

---
### 4. Adviser Revision Matrix Status
- Total Items: ${revisions.length} | Resolved/Verified: ${resolvedRevisions.length}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Automated Progress Report Generator</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            One-click compiled formal status report for university advisers and panelists
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completedTasks.map(t => {
              const assignee = members.find(m => m.id === t.assigneeId);
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>• {t.title}</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>({t.category.toUpperCase()})</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    {assignee?.name} ({t.loggedHours} hrs)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Manuscript Status */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
            2. Thesis Manuscript Drafting Status (Chapters 1–5)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {chapters.map(c => {
              const completedCount = c.sections.filter(s => s.completed).length;
              const pct = Math.round((completedCount / c.sections.length) * 100);
              return (
                <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#f8fafc', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>Ch. {c.chapterNumber}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: pct === 100 ? '#10b981' : '#6366f1' }}>{pct}%</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{c.wordCount} words</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Adviser Revision Compliance */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
            3. Adviser Feedback & Revision Compliance
          </h3>
          <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            Total critique items logged: <strong>{revisions.length}</strong> | Addressed & Verified: <strong>{resolvedRevisions.length}</strong>.
            All high-priority methodology corrections from previous panel reviews are systematically documented in the Project Revision Matrix.
          </div>
        </div>

        {/* Signatures Footer */}
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', width: '220px', height: '30px' }} />
            <div style={{ fontSize: '0.84rem', fontWeight: 800, marginTop: '6px' }}>{members[0]?.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Team Project Leader</div>
          </div>

          <div>
            <div style={{ borderBottom: '1px solid #0f172a', width: '220px', height: '30px' }} />
            <div style={{ fontSize: '0.84rem', fontWeight: 800, marginTop: '6px' }}>{project.adviser.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Capstone Adviser / Faculty In-Charge</div>
          </div>
        </div>
      </div>
    </div>
  );
};
