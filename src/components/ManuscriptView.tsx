import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { ManuscriptChapter } from '../types';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Check, 
  Percent, 
  Sparkles,
  Download,
  Copy,
  Table as TableIcon,
  Award,
  Layers,
  FileCode,
  Share2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

type ManuscriptTab = 'split_editor' | 'rrl_matrix' | 'iso_evaluator' | 'defense_packet';

interface LiteratureEntry {
  id: string;
  authorYear: string;
  title: string;
  methodology: string;
  findings: string;
  gapOrDifferentiator: string;
}

interface IsoCriterion {
  id: string;
  category: string;
  statement: string;
  score: number; // 1 to 5
}

const DEFAULT_RRL_ENTRIES: LiteratureEntry[] = [
  {
    id: 'lit-1',
    authorYear: 'Santos et al. (2024)',
    title: 'Automated Soil Moisture Telemetry and Microclimate Prediction in Smart Agriculture',
    methodology: 'IoT Sensor Mesh (ESP32) + Random Forest Regressor',
    findings: 'Achieved 91.4% accuracy in soil moisture forecasting with 12h horizon.',
    gapOrDifferentiator: 'Lacked edge offline sync and multi-tenant advisory dashboard featured in our system.'
  },
  {
    id: 'lit-2',
    authorYear: 'Chen & Zhang (2023)',
    title: 'Real-Time Edge AI Inference for Precision Crop Irrigation Systems',
    methodology: 'YOLOv8-Nano on Raspberry Pi 4 + MQTT PubSub',
    findings: 'Reduced irrigation water consumption by 28.5% across greenhouse trials.',
    gapOrDifferentiator: 'Did not incorporate automated peer review or formal milestone audit trails.'
  },
  {
    id: 'lit-3',
    authorYear: 'Alvarez & Cruz (2025)',
    title: 'Hybrid Cloud-Edge Synchronization Protocol for Agricultural IoT Deployments',
    methodology: 'PostgreSQL Realtime Broadcast + Local IndexedDB Cache',
    findings: 'Zero data packet loss during 48-hour intermittent rural connectivity.',
    gapOrDifferentiator: 'Directly informs our CapStoneFlow hybrid sync and offline-first queue architecture.'
  }
];

const DEFAULT_ISO_CRITERIA: IsoCriterion[] = [
  { id: 'iso-1', category: 'Functional Suitability', statement: 'The system accurately executes milestone phase tracking and task state transitions without errors.', score: 5 },
  { id: 'iso-2', category: 'Functional Suitability', statement: 'Role-based access control strictly gates adviser approvals and owner operations.', score: 5 },
  { id: 'iso-3', category: 'Performance Efficiency', statement: 'Real-time telemetry and state changes reflect across clients in under 500ms.', score: 5 },
  { id: 'iso-4', category: 'Performance Efficiency', statement: 'Database queries and dashboard renders complete with zero noticeable UI lag.', score: 4 },
  { id: 'iso-5', category: 'Usability & UX', statement: 'The split-screen manuscript editor and dark theme provide an intuitive, distraction-free workflow.', score: 5 },
  { id: 'iso-6', category: 'Usability & UX', statement: 'The interface is responsive and provides clear visual feedback for all operations.', score: 5 },
  { id: 'iso-7', category: 'Reliability & Fault Tolerance', statement: 'The application gracefully handles network interruptions with offline local storage fallbacks.', score: 5 },
  { id: 'iso-8', category: 'Maintainability & Quality', statement: 'The software architecture adheres to modular React component design with strict TypeScript types.', score: 5 }
];

export const ManuscriptView: React.FC = () => {
  const { project, chapters, toggleChapterSection, updateChapter } = useProject();
  const [activeTab, setActiveTab] = useState<ManuscriptTab>('split_editor');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Drafts State (project scoped)
  const [drafts, setDrafts] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`capstoneflow_proj_${project.id}_manuscript_drafts`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      1: `# Chapter 1: Introduction\n\n## 1.1 Background of the Study\nIn recent years, the rapid advancement of collaborative software engineering tools and distributed system architectures has transformed capstone project development. Contemporary educational institutions face increasing challenges in monitoring decentralized student development, validating GitHub pull request workflows, and maintaining rigorous academic milestone integrity.\n\n## 1.2 Statement of the Problem\nTraditional capstone management relies heavily on manual status meetings, unstructured messaging channels, and disconnected document drafts. This results in significant friction:\n1. Lack of real-time visibility into sprint progress.\n2. Disconnect between software codebases and academic thesis chapters.\n3. Delayed adviser feedback during critical defense milestones.\n\n## 1.3 Objectives of the Study\n### General Objective\nTo design, implement, and evaluate **${project.title}**, an enterprise-grade collaborative workflow system with hybrid cloud-edge telemetry.\n\n### Specific Objectives\n- Implement strict role-based access control (RBAC) separating Lead, Adviser, and Developer permissions.\n- Integrate real-time GitHub continuous synchronization for commit-to-task verification.\n- Construct a 5-chapter manuscript suite with RRL synthesis matrix and ISO 25010 quality evaluation.\n\n## 1.4 Scope and Delimitation\nThe study encompasses undergraduate engineering teams within the **${project.organization || 'College of Computer Studies'}** throughout the **${project.targetDefenseDate || '2026 Season'}** defense timeline.`,
      2: `# Chapter 2: Review of Related Literature\n\n## 2.1 Theoretical Framework\nThe theoretical foundation of this study is grounded in Agile Scrum Methodology, Real-Time Distributed State Machine Synchronization, and Academic Quality Assurance frameworks.\n\n## 2.2 Synthesis Matrix Analysis\nThe comparative analysis of related literature highlights key gaps in existing project management systems. Most commercial platforms (e.g., Jira, Linear) prioritize corporate backlogs without academic defense criteria, deliverable proofs, or faculty sign-off protocols.`,
      3: `# Chapter 3: Research Methodology\n\n## 3.1 Software Development Lifecycle (SDLC)\nThis capstone study adopted the Agile Scrum framework, dividing system development into milestone-bound sprints aligned with institutional defense requirements.\n\n## 3.2 Technical Architecture & Tech Stack\n- **Frontend Framework**: React 19 with TypeScript and Vanilla CSS Design System.\n- **State Management**: Scoped Local Storage + Supabase PostgreSQL Realtime engine.\n- **Authentication & Presence**: GitHub OAuth 2.0 and BroadcastChannel presence heartbeats.\n- **Telemetry**: Gemini AI progress briefings and Driver.js interactive tours.`,
      4: `# Chapter 4: Results, Discussion, and System Evaluation\n\n## 4.1 System Implementation Highlights\nThe system was deployed and stress-tested across multiple concurrent workspaces with real-time multi-tab presence synchronization.\n\n## 4.2 ISO 25010 Software Quality Evaluation\nExpert evaluators and faculty members scored the software across Functional Suitability, Usability, Performance Efficiency, and Reliability criteria.`,
      5: `# Chapter 5: Summary, Conclusions, and Recommendations\n\n## 5.1 Summary of Findings\nThe implementation of ${project.title} demonstrated a 100% pass rate across milestone gate checks and reduced status reporting latency by over 70%.\n\n## 5.2 Conclusions\nThe integration of real-time presence with strict adviser sign-off delivers an accountable, defense-ready software development environment.\n\n## 5.3 Recommendations\nFuture iterations should explore continuous integration testing agents and automated peer citation scraping.`
    };
  });

  // RRL Literature Matrix State
  const [rrlEntries, setRrlEntries] = useState<LiteratureEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`capstoneflow_proj_${project.id}_rrl_matrix`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RRL_ENTRIES;
  });

  // ISO 25010 Criteria State
  const [isoCriteria, setIsoCriteria] = useState<IsoCriterion[]>(() => {
    try {
      const saved = localStorage.getItem(`capstoneflow_proj_${project.id}_iso_criteria`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ISO_CRITERIA;
  });

  // New RRL Modal State
  const [isAddRrlOpen, setIsAddRrlOpen] = useState(false);
  const [newAuthorYear, setNewAuthorYear] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newMethodology, setNewMethodology] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [newGap, setNewGap] = useState('');

  // Synchronize cloud chapter drafts, RRL entries, and ISO evaluations when chapters change
  useEffect(() => {
    chapters.forEach(ch => {
      if (ch.draftContent) {
        setDrafts(prev => ({ ...prev, [ch.id]: ch.draftContent! }));
      }
      if (ch.rrlEntries && ch.rrlEntries.length > 0) {
        setRrlEntries(ch.rrlEntries);
      }
      if (ch.isoEvaluations && ch.isoEvaluations.length > 0) {
        setIsoCriteria(ch.isoEvaluations);
      }
    });
  }, [chapters]);

  // Persist Drafts
  useEffect(() => {
    try {
      localStorage.setItem(`capstoneflow_proj_${project.id}_manuscript_drafts`, JSON.stringify(drafts));
    } catch {}
  }, [drafts, project.id]);

  // Persist RRL Matrix
  useEffect(() => {
    try {
      localStorage.setItem(`capstoneflow_proj_${project.id}_rrl_matrix`, JSON.stringify(rrlEntries));
    } catch {}
  }, [rrlEntries, project.id]);

  // Persist ISO Criteria
  useEffect(() => {
    try {
      localStorage.setItem(`capstoneflow_proj_${project.id}_iso_criteria`, JSON.stringify(isoCriteria));
    } catch {}
  }, [isoCriteria, project.id]);

  const activeDraft = drafts[selectedChapterId] || '';
  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  const wordCount = useMemo(() => {
    const text = activeDraft.replace(/#|\*|_|-|`|>|\[.*?\]\(.*?\)/g, '').trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [activeDraft]);

  const totalWordsAcrossChapters = useMemo(() => {
    return Object.values(drafts).reduce((acc, text) => {
      const cleaned = text.replace(/#|\*|_|-|`|>|\[.*?\]\(.*?\)/g, '').trim();
      return acc + (cleaned ? cleaned.split(/\s+/).length : 0);
    }, 0);
  }, [drafts]);

  const isoAverage = useMemo(() => {
    if (isoCriteria.length === 0) return 5.0;
    const sum = isoCriteria.reduce((acc, c) => acc + c.score, 0);
    return (sum / isoCriteria.length).toFixed(2);
  }, [isoCriteria]);

  const getIsoVerbalInterpretation = (mean: number) => {
    if (mean >= 4.5) return { label: 'Excellent / Highly Acceptable', color: '#10b981' };
    if (mean >= 3.5) return { label: 'Acceptable / Proficient', color: '#38bdf8' };
    if (mean >= 2.5) return { label: 'Moderate / Needs Refinement', color: '#f59e0b' };
    return { label: 'Unacceptable / Requires Overhaul', color: '#ef4444' };
  };

  const handleUpdateDraft = (newText: string) => {
    setDrafts(prev => ({
      ...prev,
      [selectedChapterId]: newText
    }));
    // Sync draft and word count back to chapter and Supabase
    const count = newText.replace(/#|\*|_|-|`|>|\[.*?\]\(.*?\)/g, '').trim().split(/\s+/).length;
    updateChapter(selectedChapterId, { 
      wordCount: count, 
      draftContent: newText, 
      rrlEntries, 
      isoEvaluations: isoCriteria,
      lastUpdated: new Date().toISOString().split('T')[0] 
    });
  };

  const handleInsertMarkdownSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('manuscript-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = activeDraft.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextDraft = activeDraft.substring(0, start) + replacement + activeDraft.substring(end);
    handleUpdateDraft(nextDraft);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const handleAddRrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorYear.trim() || !newTitle.trim()) return;

    const newEntry: LiteratureEntry = {
      id: `lit-${Date.now()}`,
      authorYear: newAuthorYear.trim(),
      title: newTitle.trim(),
      methodology: newMethodology.trim() || 'Descriptive & Experimental SDLC',
      findings: newFindings.trim() || 'Demonstrated positive benchmark improvements.',
      gapOrDifferentiator: newGap.trim() || 'Addresses specific capstone defense criteria.'
    };

    const updated = [newEntry, ...rrlEntries];
    setRrlEntries(updated);
    updateChapter(selectedChapterId, { rrlEntries: updated });
    setIsAddRrlOpen(false);
    setNewAuthorYear('');
    setNewTitle('');
    setNewMethodology('');
    setNewFindings('');
    setNewGap('');
    toast.success('Literature Study Added to Synthesis Matrix');
  };

  const handleDeleteRrl = (id: string) => {
    const updated = rrlEntries.filter(e => e.id !== id);
    setRrlEntries(updated);
    updateChapter(selectedChapterId, { rrlEntries: updated });
    toast.info('Literature Entry Removed');
  };

  const handleScoreChange = (id: string, score: number) => {
    const updated = isoCriteria.map(c => c.id === id ? { ...c, score } : c);
    setIsoCriteria(updated);
    updateChapter(selectedChapterId, { isoEvaluations: updated });
  };

  // Export Full Defense Packet as PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 54;
      let y = margin;

      // Title & Header Page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(project.title.toUpperCase(), margin, y);
      y += 24;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`A Capstone Project Implementation & Defense Portfolio`, margin, y);
      y += 18;
      doc.text(`Department: ${project.organization || 'College of Computer Studies'}`, margin, y);
      y += 16;
      doc.text(`Adviser: ${project.adviser?.name || 'Faculty Adviser'} • Target Defense: ${project.targetDefenseDate || '2026'}`, margin, y);
      y += 28;

      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, 558, y);
      y += 24;

      // Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EXECUTIVE DEFENSE SUMMARY', margin, y);
      y += 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const summaryText = `This defense dossier compiles Chapters 1 through 5, the RRL literature synthesis matrix, and the ISO 25010 software quality evaluation scores for ${project.title}. Real-time progress is currently at ${project.overallProgress || 0}% readiness with ${totalWordsAcrossChapters} total drafted words.`;
      const splitSummary = doc.splitTextToSize(summaryText, 500);
      doc.text(splitSummary, margin, y);
      y += splitSummary.length * 14 + 20;

      // ISO 25010 Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`ISO 25010 Software Quality Rating: ${isoAverage} / 5.00 (${getIsoVerbalInterpretation(Number(isoAverage)).label})`, margin, y);
      y += 28;

      // Chapters Compilation
      for (let chNum = 1; chNum <= 5; chNum++) {
        doc.addPage();
        y = margin;

        const chDraft = drafts[chNum] || `Chapter ${chNum} draft in progress.`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`CHAPTER ${chNum}`, margin, y);
        y += 20;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(chDraft.replace(/#/g, ''), 500);
        doc.text(lines, margin, y);
      }

      doc.save(`${project.title.replace(/\s+/g, '_')}_Thesis_Defense_Packet.pdf`);
      toast.success('Defense Packet PDF Generated & Downloaded');
    } catch (e: any) {
      toast.error('PDF Export Error', { description: e.message || 'Could not compile document.' });
    }
  };

  // Export Full Markdown
  const handleExportMarkdown = () => {
    const fullMarkdown = `# ${project.title}\n\n*${project.subtitle || 'Capstone Implementation'}*\n\n**Organization:** ${project.organization}\n**Adviser:** ${project.adviser?.name}\n**Defense Date:** ${project.targetDefenseDate}\n\n---\n\n` +
      [1, 2, 3, 4, 5].map(n => drafts[n] || '').join('\n\n---\n\n');

    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_Manuscript_Chapters_1-5.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown (.md) Manuscript Exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Mode Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">🎓 5-Chapter Academic Track</span>
            <span className="badge badge-success">{totalWordsAcrossChapters.toLocaleString()} Total Words Drafted</span>
            <span className="badge badge-neutral">ISO 25010: {isoAverage} ★</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Thesis Manuscript & Academic Defense Suite</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Split-screen Markdown drafting, Chapter 2 RRL matrix synthesis, ISO 25010 evaluation, and 1-click defense PDF generation.
          </p>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            onClick={handleExportMarkdown}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Download full 5-chapter markdown file"
          >
            <FileCode size={14} />
            <span>Export .MD</span>
          </button>

          <button 
            type="button" 
            onClick={handleExportPDF}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
            title="Compile complete thesis defense portfolio to PDF"
          >
            <Download size={14} />
            <span>Download Defense PDF</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('split_editor')}
          className={`btn btn-sm ${activeTab === 'split_editor' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '6px', fontSize: '0.78rem' }}
        >
          <BookOpen size={14} />
          <span>Chapters 1-5 Split Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rrl_matrix')}
          className={`btn btn-sm ${activeTab === 'rrl_matrix' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '6px', fontSize: '0.78rem' }}
        >
          <TableIcon size={14} />
          <span>RRL Synthesis Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('iso_evaluator')}
          className={`btn btn-sm ${activeTab === 'iso_evaluator' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '6px', fontSize: '0.78rem' }}
        >
          <Award size={14} />
          <span>ISO 25010 Software Evaluation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defense_packet')}
          className={`btn btn-sm ${activeTab === 'defense_packet' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '6px', fontSize: '0.78rem' }}
        >
          <ShieldCheck size={14} />
          <span>Defense Packet Preview</span>
        </button>
      </div>

      {/* TAB 1: SPLIT-SCREEN MARKDOWN & ACADEMIC PREVIEW */}
      {activeTab === 'split_editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chapter Selector Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {chapters.map(ch => {
              const isSelected = ch.id === selectedChapterId;
              const chWordCount = (drafts[ch.id] || '').replace(/#|\*|_|-|`|>|\[.*?\]\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean).length;
              const completedCount = ch.sections.filter(s => s.completed).length;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    cursor: 'pointer',
                    minWidth: '160px',
                    textAlign: 'left',
                    transition: 'all 140ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      Chapter {ch.chapterNumber}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {chWordCount} w
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {ch.title}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                    {completedCount}/{ch.sections.length} sections done
                  </div>
                </button>
              );
            })}
          </div>

          {/* Split Screen Workspace (50% Editor / 50% Rendered Document) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', 
              gap: '16px',
              minHeight: '560px'
            }}
          >
            {/* Left Pane: Markdown Editor */}
            <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Editor Toolbar */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('# ')} className="btn btn-ghost btn-xs" style={{ fontWeight: 800 }}>H1</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('## ')} className="btn btn-ghost btn-xs" style={{ fontWeight: 800 }}>H2</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('**', '**')} className="btn btn-ghost btn-xs" style={{ fontWeight: 800 }}>B</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('*', '*')} className="btn btn-ghost btn-xs" style={{ fontStyle: 'italic' }}>I</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('- ')} className="btn btn-ghost btn-xs">List</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('> ')} className="btn btn-ghost btn-xs">Quote</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('| Col 1 | Col 2 |\n|---|---|\n| Data 1 | Data 2 |')} className="btn btn-ghost btn-xs">Table</button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {wordCount} words • Auto-Saved
                </div>
              </div>

              {/* Textarea */}
              <textarea
                id="manuscript-editor-textarea"
                value={activeDraft}
                onChange={e => handleUpdateDraft(e.target.value)}
                placeholder="Type thesis manuscript in Markdown format..."
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                  resize: 'none',
                  minHeight: '480px'
                }}
              />

              {/* Subsection checklist toggles footer */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Chapter {currentChapter?.chapterNumber} Checklist
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {currentChapter?.sections.map(sec => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleChapterSection(currentChapter.id, sec.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.68rem',
                        background: sec.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                        border: `1px solid ${sec.completed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                        color: sec.completed ? '#10b981' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Check size={11} style={{ opacity: sec.completed ? 1 : 0.3 }} />
                      <span>{sec.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Rendered Academic Paper Layout */}
            <div 
              className="card" 
              style={{ 
                padding: '24px 28px', 
                background: 'var(--bg-card)', 
                overflowY: 'auto', 
                maxHeight: '600px',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Academic Document Preview
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                  APA 7th Standard
                </span>
              </div>

              {/* Academic Typography Presentation */}
              <div style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.88rem' }}>
                {activeDraft.split('\n\n').map((block, idx) => {
                  if (block.startsWith('# ')) {
                    return (
                      <h1 key={idx} style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                        {block.replace('# ', '')}
                      </h1>
                    );
                  }
                  if (block.startsWith('## ')) {
                    return (
                      <h2 key={idx} style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginTop: '16px', marginBottom: '8px' }}>
                        {block.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (block.startsWith('### ')) {
                    return (
                      <h3 key={idx} style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px', marginBottom: '6px' }}>
                        {block.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (block.startsWith('- ')) {
                    const items = block.split('\n- ');
                    return (
                      <ul key={idx} style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        {items.map((item, i) => (
                          <li key={i} style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            {item.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={idx} style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', textAlign: 'justify' }}>
                      {block}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RRL SYNTHESIS MATRIX */}
      {activeTab === 'rrl_matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Chapter 2: Literature Synthesis Matrix
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Systematic comparative analysis of prior related works, methodologies, findings, and research differentiators.
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setIsAddRrlOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Literature Entry</span>
            </button>
          </div>

          {/* Matrix Table */}
          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px', width: '160px' }}>Author & Year</th>
                  <th style={{ padding: '12px 14px', width: '220px' }}>Study / System Title</th>
                  <th style={{ padding: '12px 14px', width: '180px' }}>Methodology / Tech</th>
                  <th style={{ padding: '12px 14px' }}>Key Findings</th>
                  <th style={{ padding: '12px 14px' }}>Research Gap / Capstone Edge</th>
                  <th style={{ padding: '12px 14px', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rrlEntries.map((item, index) => (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' 
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)', verticalAlign: 'top' }}>
                      {item.authorYear}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)', verticalAlign: 'top' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', verticalAlign: 'top', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                      {item.methodology}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', verticalAlign: 'top' }}>
                      {item.findings}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#10b981', fontWeight: 600, verticalAlign: 'top' }}>
                      {item.gapOrDifferentiator}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRrl(item.id)}
                        className="btn btn-ghost btn-icon"
                        style={{ width: '26px', height: '26px', color: 'var(--text-muted)' }}
                        title="Remove literature entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Entry Modal */}
          {isAddRrlOpen && (
            <div className="modal-backdrop" onClick={() => setIsAddRrlOpen(false)} style={{ zIndex: 1200 }}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Add Study to RRL Synthesis Matrix</h3>
                  <button type="button" onClick={() => setIsAddRrlOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>✕</button>
                </div>
                <form onSubmit={handleAddRrl} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="input-label">Author & Year *</label>
                    <input type="text" className="input" placeholder="e.g. Dela Cruz et al. (2025)" value={newAuthorYear} onChange={e => setNewAuthorYear(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Study / System Title *</label>
                    <input type="text" className="input" placeholder="e.g. Distributed Sensor State Synchronization" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Methodology / Architecture</label>
                    <input type="text" className="input" placeholder="e.g. ESP32 Mesh + WebSocket Realtime" value={newMethodology} onChange={e => setNewMethodology(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Key Findings / Strengths</label>
                    <textarea className="input" rows={2} placeholder="Summary of proven findings..." value={newFindings} onChange={e => setNewFindings(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Identified Research Gap / Your Project's Solution</label>
                    <textarea className="input" rows={2} placeholder="What was missing and how your capstone addresses it..." value={newGap} onChange={e => setNewGap(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button type="button" onClick={() => setIsAddRrlOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Add to Synthesis Matrix</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ISO 25010 SOFTWARE QUALITY EVALUATOR */}
      {activeTab === 'iso_evaluator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Chapter 4: ISO 25010 Software Product Quality Evaluation
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Standardized 5-point Likert scale instrument measuring Functional Suitability, Usability, Performance, and Reliability.
              </div>
            </div>

            {/* Mean Score Summary Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Weighted Grand Mean</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: getIsoVerbalInterpretation(Number(isoAverage)).color, fontFamily: 'var(--font-mono)' }}>
                  {isoAverage} / 5.00
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Interpretation</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {getIsoVerbalInterpretation(Number(isoAverage)).label}
                </div>
              </div>
            </div>
          </div>

          {/* Questionnaire Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isoCriteria.map((criterion, idx) => (
              <div 
                key={criterion.id} 
                className="card" 
                style={{ 
                  padding: '14px 18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: '12px' 
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.62rem', marginBottom: '4px' }}>
                    {criterion.category}
                  </span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {idx + 1}. {criterion.statement}
                  </div>
                </div>

                {/* 1-5 Score Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(val => {
                    const isSelected = criterion.score === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleScoreChange(criterion.id, val)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--primary)' : 'var(--bg-elevated)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEFENSE PACKET PREVIEW */}
      {activeTab === 'defense_packet' && (
        <div className="card" style={{ padding: '32px 36px', background: 'var(--bg-card)' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              {project.title.toUpperCase()}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 12px auto' }}>
              {project.subtitle || 'Capstone Technical Implementation Portfolio & Comprehensive Defense Dossier'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {project.organization ? `${project.organization} ` : ''}{project.targetDefenseDate ? `• Target Defense: ${project.targetDefenseDate}` : ''}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Faculty Adviser</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{project.adviser?.name || 'Unassigned'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{project.adviser?.email || '—'}</div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Defense Readiness Rating</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{project.overallProgress || 0}% Complete</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{totalWordsAcrossChapters.toLocaleString()} words across 5 chapters</div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ISO 25010 Quality Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>{isoAverage} / 5.00</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{getIsoVerbalInterpretation(Number(isoAverage)).label}</div>
            </div>
          </div>

          {/* Chapters Index */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Compiled Manuscript Index</h3>
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-primary">CH {num}</span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Chapter {num}: {chapters.find(c => c.chapterNumber === num)?.title || 'Manuscript Chapter'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedChapterId(num); setActiveTab('split_editor'); }}
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '4px', fontSize: '0.74rem', color: 'var(--primary)' }}
                >
                  <span>Edit Chapter</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
