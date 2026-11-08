import React, { useEffect, useMemo, useState } from 'react';
import { initialFiles } from './mockFiles';
import type { WorkspaceFile, ThemeId } from './types';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { MonacoLuauEditor } from './components/MonacoLuauEditor';
import { LspStatusBadge } from './components/LspStatus';
import { McpPanel } from './components/McpPanel';
import { ThemeSelector } from './components/ThemeSelector';
import { createMockLspClient } from './lsp/client';
import { createMockMcpServer } from './mcp/server';
import { themes } from './themes';
import {
  analyzeCodeStructureAndFormat,
  formatCodeStructure
} from '../../lib/codeStructureChecker';
import { useProject } from '../../context/ProjectContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  PlusCircle,
  Code2,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

export const WorkspaceView: React.FC = () => {
  const { project, addTask } = useProject();
  const [files, setFiles] = useState<WorkspaceFile[]>(initialFiles);
  const [activeId, setActiveId] = useState<string | null>(initialFiles[0].id);
  const [themeId, setThemeId] = useState<ThemeId>('real-dark');
  const [lspStatus, setLspStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [auditFilter, setAuditFilter] = useState<'all' | 'structure' | 'format'>('all');
  const [showAuditPanel, setShowAuditPanel] = useState(true);

  const lsp = useMemo(() => createMockLspClient(), []);
  const mcp = useMemo(() => createMockMcpServer(), []);
  const [mcpLogs, setMcpLogs] = useState<string[]>([]);

  const activeFile = files.find(f => f.id === activeId) ?? null;

  useEffect(() => {
    lsp.connect().then(() => setLspStatus(lsp.status));
  }, [lsp]);

  const handleConnect = async () => {
    setLspStatus('connecting');
    await lsp.connect();
    setLspStatus(lsp.status);
  };

  const updateActiveContent = (content: string) => {
    if (!activeId) return;
    setFiles(prev => prev.map(f => (f.id === activeId ? { ...f, content, modified: true } : f)));
  };

  const handleCreate = () => {
    const id = `file-${Date.now()}`;
    const shortId = Date.now().toString().slice(-4);
    const f: WorkspaceFile = {
      id,
      name: `module_${shortId}.luau`,
      path: `workspace/module_${shortId}.luau`,
      language: 'luau',
      content: `-- Module: module_${shortId}.luau\nlocal Module = {}\n\nfunction Module.execute(input: string): string\n    return input\nend\n\nreturn Module\n`,
      modified: false
    };
    setFiles(prev => [...prev, f]);
    setActiveId(id);
  };

  const auditReport = useMemo(() => {
    if (!activeFile) return null;
    return analyzeCodeStructureAndFormat(
      activeFile.content,
      activeFile.name,
      activeFile.language
    );
  }, [activeFile]);

  const filteredFindings = useMemo(() => {
    if (!auditReport) return [];
    if (auditFilter === 'all') return auditReport.findings;
    return auditReport.findings.filter(f => f.category === auditFilter);
  }, [auditReport, auditFilter]);

  const actionableIssues = useMemo(() => {
    if (!auditReport) return [];
    return auditReport.findings.filter(f => f.severity === 'error' || f.severity === 'warning');
  }, [auditReport]);

  const handleAutoFormat = () => {
    if (!activeFile) return;
    const formatted = formatCodeStructure(activeFile.content, activeFile.language);
    updateActiveContent(formatted);
    toast.success(`Formatted ${activeFile.name}`, {
      description: 'Normalized indentation, stripped trailing whitespace, and standardized line endings.'
    });
  };

  const handleCreateTicketFromAudit = () => {
    if (!activeFile || !auditReport) return;
    const issues = actionableIssues;
    const summaryList =
      issues.length > 0
        ? issues.map(i => `${i.rule}: ${i.message}`)
        : ['Verify module structure and formatting compliance'];

    addTask({
      title: `[Code Structure & Format] Refactor ${activeFile.path}`,
      description: `Automated code structure & formatting audit for \`${activeFile.path}\` (Score: ${auditReport.overallScore}% / Grade ${auditReport.grade} — Structure: ${auditReport.structureScore}%, Format: ${auditReport.formatScore}%).`,
      problemStatement: `Static structure and formatting check identified ${issues.length} item(s) in ${activeFile.path} requiring standardization.`,
      whatToFix: summaryList,
      acceptanceCriteria: [
        {
          id: `ac-struct-${Date.now()}-1`,
          text: `Resolve all ${issues.length || 1} structure and formatting findings in ${activeFile.path}`,
          completed: false
        },
        {
          id: `ac-struct-${Date.now()}-2`,
          text: 'Achieve >= 95% (Grade A+) on the Code Structure & Format Checker',
          completed: false
        }
      ],
      relatedFiles: [activeFile.path],
      status: 'todo',
      priority: auditReport.overallScore < 75 ? 'high' : 'medium',
      category: 'code',
      assigneeId: '',
      storyPoints: 3,
      estimatedHours: 4,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      subtasks: issues.slice(0, 4).map((iss, idx) => ({
        id: `st-audit-${Date.now()}-${idx}`,
        title: `${iss.suggestion} (${iss.rule})`,
        completed: false
      })),
      phaseId: project?.currentPhaseId || 1
    });

    toast.success('Created Code Structure & Format ticket on Kanban Board!', {
      description: `Queued "${activeFile.path}" in To Do for sprint verification.`
    });
  };

  const monacoTheme = themes[themeId].monacoTheme;
  const scoreColor =
    (auditReport?.overallScore ?? 100) >= 90
      ? 'var(--success)'
      : (auditReport?.overallScore ?? 100) >= 75
      ? 'var(--warning)'
      : 'var(--danger)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-app, var(--bg-surface))' }}>
      {/* Top Bar — Output-Based Code Structure & Format Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Code2 size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Code Structure & Format Studio</span>
          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
            OUTPUT-BASED CHECKER
          </span>
          {auditReport && (
            <span
              className="badge"
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                background: 'var(--bg-card)',
                border: `1px solid ${scoreColor}`,
                color: scoreColor
              }}
            >
              Grade {auditReport.grade} · {auditReport.overallScore}% (Struct {auditReport.structureScore}% / Format {auditReport.formatScore}%)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAutoFormat}
            className="btn btn-secondary btn-sm"
            style={{ height: '30px', gap: '5px', fontSize: '0.74rem' }}
            title="Normalize indentation, trailing spaces, and blank lines"
          >
            <Wand2 size={13} style={{ color: 'var(--primary)' }} />
            <span>Auto-Format</span>
          </button>

          <button
            type="button"
            onClick={handleCreateTicketFromAudit}
            className="btn btn-primary btn-sm"
            style={{ height: '30px', gap: '5px', fontSize: '0.74rem' }}
            title="Send structure & format findings to the Kanban Task Matrix"
          >
            <PlusCircle size={13} />
            <span>Log Structure Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAuditPanel(prev => !prev)}
            className={`btn btn-sm ${showAuditPanel ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ height: '30px', gap: '5px', fontSize: '0.74rem' }}
          >
            <SlidersHorizontal size={13} />
            <span>{showAuditPanel ? 'Hide Inspector' : 'Show Inspector'}</span>
          </button>

          <ThemeSelector value={themeId} onChange={setThemeId} />
          <LspStatusBadge status={lspStatus} version={lsp.version} onConnect={handleConnect} />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
        {/* Explorer Sidebar */}
        <div style={{ width: 240, borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar, var(--bg-elevated))', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <WorkspaceExplorer files={files} activeId={activeId} onSelect={setActiveId} onCreate={handleCreate} />
          <McpPanel logs={mcpLogs} onCall={async (name, args) => { const r = await mcp.callTool(name, args); setMcpLogs([...mcp.logs]); console.log('[mcp]', r); }} />
        </div>

        {/* Code Editor Surface */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '300px', minHeight: '420px' }}>
          {activeFile ? (
            <MonacoLuauEditor value={activeFile.content} language={activeFile.language} theme={monacoTheme} path={activeFile.path} onChange={updateActiveContent} />
          ) : (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>Select a file from the explorer.</div>
          )}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>.\{activeFile?.path ?? '—'}</span>
            {auditReport && (
              <span>
                Lines: {auditReport.metrics.totalLines} ({auditReport.metrics.codeLines} code · {auditReport.metrics.commentLines} comments) · Functions: {auditReport.metrics.functionCount} · Max Nesting: {auditReport.metrics.maxNestingDepth}
              </span>
            )}
          </div>
        </div>

        {/* Live Code Structure & Format Inspector Panel */}
        {showAuditPanel && auditReport && (
          <aside
            style={{
              width: '340px',
              borderLeft: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '14px',
              gap: '14px',
              flexShrink: 0
            }}
          >
            {/* Score Summary Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  STRUCTURE & FORMAT SCORE
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                  Grade {auditReport.grade}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
                    {auditReport.overallScore}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {auditReport.structureScore}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Structure</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {auditReport.formatScore}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Format</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                <div>Functions: <strong>{auditReport.metrics.functionCount}</strong></div>
                <div>Max Nesting: <strong>{auditReport.metrics.maxNestingDepth}</strong></div>
                <div>Code Lines: <strong>{auditReport.metrics.codeLines}</strong></div>
                <div>Max Line Width: <strong>{auditReport.metrics.maxLineLength}ch</strong></div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'structure', 'format'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAuditFilter(tab)}
                  className={`btn btn-sm ${auditFilter === tab ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, height: '26px', fontSize: '0.68rem', textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Findings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredFindings.map(item => {
                const Icon =
                  item.severity === 'pass'
                    ? CheckCircle2
                    : item.severity === 'warning'
                    ? AlertTriangle
                    : XCircle;
                const iconColor =
                  item.severity === 'pass'
                    ? 'var(--success)'
                    : item.severity === 'warning'
                    ? 'var(--warning)'
                    : 'var(--danger)';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={13} style={{ color: iconColor, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {item.rule}
                        </span>
                      </div>
                      <span
                        className="badge badge-neutral"
                        style={{ fontSize: '0.58rem', textTransform: 'uppercase' }}
                      >
                        {item.category}{item.line ? ` · L${item.line}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.message}
                    </div>
                    {item.severity !== 'pass' && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--primary)', marginTop: '2px' }}>
                        Fix: {item.suggestion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default WorkspaceView;
