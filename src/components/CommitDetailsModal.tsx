import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitCommit, 
  GitBranch, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  FileCode, 
  Plus, 
  Minus, 
  Layers,
  Sparkles,
  ArrowRight,
  Terminal,
  User,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { GitHubCommit, Task } from '../types';
import { useProject } from '../context/ProjectContext';
import { GitHubIcon } from './GitHubIcon';
import { formatRelativeTime, formatExactTimestamp } from '../utils/time';
import { fetchCommitDetails, parseGitHubRepoUrl } from '../lib/github';
import { toast } from 'sonner';

interface CommitDetailsModalProps {
  commit: GitHubCommit | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const CommitDetailsModal: React.FC<CommitDetailsModalProps> = ({
  commit,
  isOpen,
  onClose,
  onSelectTask
}) => {
  const { project, tasks } = useProject();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [liveStats, setLiveStats] = useState<{ additions: number; deletions: number; totalFiles: number } | null>(null);
  const [liveFiles, setLiveFiles] = useState<Array<{
    filename: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
    patch?: string;
  }>>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch real commit diffs and stats from GitHub API
  useEffect(() => {
    if (!isOpen || !commit) {
      setLiveStats(null);
      setLiveFiles([]);
      setExpandedFile(null);
      return;
    }

    if (commit.stats && commit.changedFiles && commit.changedFiles.length > 0) {
      setLiveStats(commit.stats);
      setLiveFiles(commit.changedFiles);
      return;
    }

    const repoInfo = parseGitHubRepoUrl(project.githubRepoUrl);
    if (repoInfo && commit.sha) {
      setIsLoadingDetails(true);
      fetchCommitDetails(repoInfo.owner, repoInfo.repo, commit.sha)
        .then(details => {
          if (details) {
            setLiveStats(details.stats);
            setLiveFiles(details.changedFiles);
          }
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [isOpen, commit, project.githubRepoUrl]);

  if (!isOpen || !commit) return null;

  const linkedTask = commit.linkedTaskId ? tasks.find(t => t.id === commit.linkedTaskId) : null;

  const handleCopy = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Conventional commit type parser
  const match = commit.message.match(/^([a-zA-Z]+)(\(.*\))?:\s*(.*)$/);
  const commitType = match ? match[1].toLowerCase() : 'commit';
  const commitScope = match && match[2] ? match[2].replace(/[()]/g, '') : null;
  const commitSubject = match ? match[3] : commit.message;

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'feat': return 'tag-code';
      case 'fix': return 'badge-danger';
      case 'refactor': return 'badge-info';
      case 'docs': return 'tag-docs';
      case 'test': case 'ci': return 'tag-testing';
      case 'chore': return 'badge-neutral';
      default: return 'tag-code';
    }
  };

  // Accurate additions, deletions, and file counts
  const filesList = liveFiles.length > 0 ? liveFiles : (commit.changedFiles || []);
  const additions = liveStats?.additions ?? commit.stats?.additions ?? filesList.reduce((acc, f) => acc + f.additions, 0);
  const deletions = liveStats?.deletions ?? commit.stats?.deletions ?? filesList.reduce((acc, f) => acc + f.deletions, 0);
  const totalFiles = liveStats?.totalFiles ?? commit.stats?.totalFiles ?? (filesList.length > 0 ? filesList.length : 0);
  const totalDiff = additions + deletions;
  const addRatio = totalDiff > 0 ? (additions / totalDiff) * 100 : (additions > 0 ? 100 : 0);

  // Clean author username without double @
  const rawAuthorUsername = commit.authorUsername || commit.authorName || '';
  const cleanUsername = rawAuthorUsername.replace(/^@+/, '');

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-card)'
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#24292f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitHubIcon size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`badge ${getTypeBadgeClass(commitType)}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>
                  {commitType}
                </span>
                {commitScope && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ({commitScope})
                  </span>
                )}
                {commit.verified && (
                  <span className="badge badge-success" style={{ fontSize: '0.62rem', gap: '3px', padding: '1px 5px' }}>
                    <ShieldCheck size={10} />
                    Verified
                  </span>
                )}
                {isLoadingDetails && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Loader2 size={10} className="animate-spin" />
                    Fetching real diff...
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Commit details & repository changes
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Commit Message Heading */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '6px' }}>
              {commitSubject}
            </h3>
            {commit.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {commit.description}
              </p>
            )}
          </div>

          {/* Author & Timestamp Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {commit.authorAvatar ? (
                <img 
                  src={commit.authorAvatar} 
                  alt={commit.authorName}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--border-subtle)' }}
                />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {commit.authorName.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {commit.authorName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {cleanUsername && (
                    <a 
                      href={`https://github.com/${cleanUsername}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                      onClick={e => e.stopPropagation()}
                    >
                      @{cleanUsername}
                    </a>
                  )}
                  <span>•</span>
                  <span>committed {formatRelativeTime(commit.date)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                <GitBranch size={12} style={{ color: 'var(--primary)' }} />
                <span className="mono">{commit.branch || 'main'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <Clock size={11} />
                <span>{formatExactTimestamp(commit.date)}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Files Changed
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {totalFiles}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Additions
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                +{additions} lines
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Deletions
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: deletions > 0 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '2px' }}>
                -{deletions} lines
              </div>
            </div>
          </div>

          {/* Diff Ratio Bar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              <span>Diff Distribution</span>
              <span>
                {totalDiff > 0 ? `${Math.round(addRatio)}% Additions / ${Math.round(100 - addRatio)}% Deletions` : 'No file diff records'}
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', borderRadius: '3px', background: totalDiff > 0 ? 'var(--danger)' : 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
              {totalDiff > 0 ? (
                <div style={{ width: `${addRatio}%`, height: '100%', background: 'var(--success)', transition: 'width 240ms var(--ease-out)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          </div>

          {/* Linked Task Ticket Card (If cross-referenced) */}
          {linkedTask && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span className={`badge tag-${linkedTask.category}`} style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                    {linkedTask.category}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Linked Capstone Deliverable #{linkedTask.id.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {linkedTask.title}
                </div>
              </div>

              {onSelectTask && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTask(linkedTask.id);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ height: '28px', fontSize: '0.74rem', gap: '4px' }}
                >
                  <span>View Ticket</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          )}

          {/* Changed Files List with Expandable Patch View */}
          {filesList.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Changed Files ({filesList.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filesList.map((file, idx) => {
                  const isExpanded = expandedFile === file.filename;
                  const statusColor = file.status === 'added' ? 'var(--success)' : file.status === 'deleted' ? 'var(--danger)' : 'var(--primary)';
                  const statusLetter = file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M';

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        onClick={() => {
                          if (file.patch) {
                            setExpandedFile(isExpanded ? null : file.filename);
                          } else {
                            handleCopy(file.filename, `file-${idx}`, 'File Path');
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        title={file.patch ? "Click to view diff patch" : "Click to copy file path"}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ 
                            fontSize: '0.62rem', 
                            fontWeight: 800, 
                            color: '#fff', 
                            background: statusColor, 
                            borderRadius: '3px', 
                            padding: '1px 4px',
                            fontFamily: 'var(--font-mono)'
                          }}>
                            {statusLetter}
                          </span>
                          <FileCode size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.filename}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                            +{file.additions}
                          </span>
                          {file.deletions > 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                              -{file.deletions}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(file.filename, `file-${idx}`, 'File Path');
                            }}
                            className="btn btn-ghost btn-icon"
                            style={{ width: '22px', height: '22px', padding: 0 }}
                          >
                            {copiedField === `file-${idx}` ? (
                              <Check size={12} style={{ color: 'var(--success)' }} />
                            ) : (
                              <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                            )}
                          </button>
                          {file.patch && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Code Patch Diff */}
                      {isExpanded && file.patch && (
                        <div style={{
                          padding: '10px',
                          borderTop: '1px solid var(--border-subtle)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          lineHeight: 1.4,
                          overflowX: 'auto',
                          maxHeight: '260px'
                        }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {file.patch.split('\n').map((line: string, lIdx: number) => {
                              const isAdd = line.startsWith('+') && !line.startsWith('+++');
                              const isDel = line.startsWith('-') && !line.startsWith('---');
                              const isHeader = line.startsWith('@@');
                              const color = isAdd ? 'var(--success)' : isDel ? 'var(--danger)' : isHeader ? '#38bdf8' : 'var(--text-secondary)';
                              const bg = isAdd ? 'rgba(34, 197, 94, 0.1)' : isDel ? 'rgba(239, 68, 68, 0.1)' : 'transparent';
                              return (
                                <div key={lIdx} style={{ color, background: bg, padding: '1px 4px' }}>
                                  {line}
                                </div>
                              );
                            })}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleCopy(commit.sha, 'sha', 'Full SHA')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', gap: '5px' }}
            >
              {copiedField === 'sha' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
              <span className="mono">{commit.shortSha || commit.sha.slice(0, 7)}</span>
            </button>

            <button
              onClick={() => handleCopy(`git checkout ${commit.sha}`, 'checkout', 'Checkout command')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', gap: '5px' }}
              title="Copy git checkout command"
            >
              {copiedField === 'checkout' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Terminal size={12} />}
              <span>git checkout</span>
            </button>
          </div>

          <a
            href={commit.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.78rem', gap: '6px' }}
          >
            <span>Open on GitHub</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
