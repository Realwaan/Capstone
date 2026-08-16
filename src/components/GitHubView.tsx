import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  GitBranch, 
  GitCommit, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Copy, 
  Terminal,
  FolderGit2,
  GitPullRequest,
  GitMerge,
  ShieldCheck,
  Clock,
  User,
  Plus,
  ArrowRight,
  Code2,
  FileCode,
  Flame,
  Key,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { GitHubCommit, GitHubPullRequest } from '../types';
import { CommitDetailsModal } from './CommitDetailsModal';
import { formatRelativeTime } from '../utils/time';
import { toast } from 'sonner';
import { getGitHubToken, setGitHubToken, parseGitHubRepoUrl, DEFAULT_GITHUB_REPO_URL } from '../lib/github';

interface GitHubViewProps {
  onOpenGitHubAuth: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({ onOpenGitHubAuth, onSelectTask }) => {
  const { 
    githubUser, 
    project, 
    githubCommits, 
    githubPRs,
    syncGitHubData, 
    isGitHubConnected,
    tasks,
    members,
    updateProjectInfo
  } = useProject();

  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<GitHubCommit | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'contributors'>('commits');
  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [patInput, setPatInput] = useState(getGitHubToken());
  const [customRepoUrl, setCustomRepoUrl] = useState(
    project.githubRepoUrl || DEFAULT_GITHUB_REPO_URL
  );

  useEffect(() => {
    if (githubCommits.length <= 1) {
      syncGitHubData();
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncGitHubData(customRepoUrl.trim());
    setIsSyncing(false);
  };

  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSaveRepoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customRepoUrl.trim();
    updateProjectInfo({ githubRepoUrl: clean });
    setIsEditingRepo(false);
    setIsSyncing(true);
    await syncGitHubData(clean);
    setIsSyncing(false);
  };

  const handleSaveToken = async () => {
    setGitHubToken(patInput.trim());
    toast.success('GitHub Token Saved', {
      description: patInput.trim() ? 'Private repo access & 5,000 req/hr rate limit enabled' : 'Switched to unauthenticated public mode (60 req/hr)'
    });
    setIsSyncing(true);
    await syncGitHubData(customRepoUrl.trim());
    setIsSyncing(false);
  };

  const repoUrl = project.githubRepoUrl || customRepoUrl;
  const parsedRepo = parseGitHubRepoUrl(repoUrl);
  const hasToken = !!getGitHubToken();

  const getTypeBadgeClass = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.startsWith('feat')) return 'tag-code';
    if (lower.startsWith('fix')) return 'badge-danger';
    if (lower.startsWith('refactor')) return 'badge-info';
    if (lower.startsWith('docs')) return 'tag-docs';
    if (lower.startsWith('test') || lower.startsWith('ci')) return 'tag-testing';
    if (lower.startsWith('chore')) return 'badge-neutral';
    return 'tag-code';
  };

  // Contributor Commit Calculation
  const contributorStats = members.map(member => {
    const handle = member.githubUsername || member.name.replace(/\s+/g, '').toLowerCase();
    const count = githubCommits.filter(c => 
      c.authorUsername?.toLowerCase() === handle.toLowerCase() || 
      c.authorName.toLowerCase().includes(member.name.toLowerCase())
    ).length;
    return {
      member,
      commitsCount: count,
      handle
    };
  });

  const totalCommitsCount = githubCommits.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>GitHub Developer Hub</h2>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>REST API v3 Live Sync</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time code commit logs, pull request lifecycle, contributor telemetry, and terminal tooling
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => setIsTokenDrawerOpen(prev => !prev)}
            className={`btn ${hasToken ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
            style={{ gap: '6px' }}
            title="Configure Personal Access Token for Private Repositories"
          >
            <Key size={13} style={{ color: hasToken ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>{hasToken ? 'PAT Active (5,000/hr)' : 'Add PAT Token'}</span>
          </button>

          <button 
            onClick={handleSync} 
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px' }}
            disabled={isSyncing}
            title="Fetch latest remote commits and PR updates from GitHub"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Git Activity'}</span>
          </button>

          <button 
            onClick={onOpenGitHubAuth} 
            className="btn btn-primary btn-sm"
            style={{ gap: '5px' }}
          >
            <GitHubIcon size={14} />
            <span>{isGitHubConnected ? `@${githubUser?.login}` : 'Login with GitHub'}</span>
          </button>
        </div>
      </div>

      {/* Private Repository & Personal Access Token Panel (Collapsible) */}
      {isTokenDrawerOpen && (
        <div 
          className="card" 
          style={{ 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border-card)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>GitHub Personal Access Token (PAT)</span>
              <span className={`badge ${hasToken ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.62rem' }}>
                {hasToken ? 'Authenticated' : 'Public Repos Only'}
              </span>
            </div>
            <a 
              href="https://github.com/settings/tokens/new?scopes=repo&description=CapStoneFlow" 
              target="_blank" 
              rel="noreferrer"
              style={{ fontSize: '0.74rem', color: 'var(--text-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Generate Free Token at GitHub</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Required if your repository is <strong>Private</strong>, or to increase rate limits from 60 to 5,000 requests/hour.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="password"
              value={patInput}
              onChange={(e) => setPatInput(e.target.value)}
              placeholder="Paste your GitHub Personal Access Token (ghp_...)"
              className="input-field"
              style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
            />
            <button 
              type="button"
              onClick={handleSaveToken}
              className="btn btn-primary btn-sm"
              style={{ minWidth: '100px' }}
              disabled={isSyncing}
            >
              <span>Save & Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Connected Account & Repository Banner */}
      <div 
        className="card" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '18px 22px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#24292f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <GitHubIcon size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {parsedRepo ? `${parsedRepo.owner}/${parsedRepo.repo}` : (githubUser ? `@${githubUser.login}` : 'GitHub Workspace')}
              </h3>
              <span className={`badge ${isGitHubConnected ? 'badge-success' : 'badge-neutral'}`}>
                {isGitHubConnected ? 'Connected' : 'Guest Mode'}
              </span>
              {hasToken ? (
                <span className="badge badge-success" style={{ fontSize: '0.62rem', gap: '4px' }}>
                  <Lock size={10} /> Private & Public Sync
                </span>
              ) : (
                <span className="badge badge-neutral" style={{ fontSize: '0.62rem', gap: '4px' }}>
                  <Unlock size={10} /> Public Sync
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Target Repository: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{repoUrl}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditingRepo ? (
            <form onSubmit={handleSaveRepoUrl} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input 
                type="text" 
                value={customRepoUrl}
                onChange={e => setCustomRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="input-field input-sm"
                style={{ width: '280px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                Save & Sync
              </button>
              <button type="button" onClick={() => setIsEditingRepo(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <button 
                onClick={() => setIsEditingRepo(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', height: '30px' }}
                title="Edit Target Repository URL"
              >
                <span>Edit Repo URL</span>
              </button>

              <a 
                href={repoUrl.startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '5px', height: '30px', fontSize: '0.74rem' }}
              >
                <span>Open Repository</span>
                <ExternalLink size={13} />
              </a>
            </>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Target Branch</span>
            <GitBranch size={15} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            main
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Trunk-based branch protection active
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Recent Commits</span>
            <GitCommit size={15} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {githubCommits.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Latest: <span className="mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>{githubCommits[0]?.shortSha || '7b2c9e1'}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Pull Requests</span>
            <GitPullRequest size={15} style={{ color: '#ec4899' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {githubPRs.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {githubPRs.filter(pr => pr.state === 'open').length} Open • {githubPRs.filter(pr => pr.state === 'merged').length} Merged
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Linked Tasks</span>
            <FolderGit2 size={15} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {tasks.filter(t => t.deliverableUrl || t.category === 'code' || t.category === 'backend' || t.category === 'frontend' || t.category === 'database').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Tasks mapped to code deliverables
          </div>
        </div>
      </div>

      {/* Git Terminal Quick Commands Matrix */}
      <div className="card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} style={{ color: 'var(--primary)' }} />
          <span>Quick Git Terminal Snippets</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          {[
            { id: 'c1', label: 'Push to Remote Repository', cmd: 'git push -u origin main' },
            { id: 'c2', label: 'Create & Checkout Feature Branch', cmd: 'git checkout -b feature/new-module' },
            { id: 'c3', label: 'Commit with Conventional Syntax', cmd: 'git commit -m "feat(core): implement workflow engine"' },
            { id: 'c4', label: 'Pull Latest Remote Changes', cmd: 'git pull origin main --rebase' }
          ].map(item => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                <code style={{ fontSize: '0.76rem', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>
                  {item.cmd}
                </code>
              </div>
              <button 
                onClick={(e) => handleCopy(item.cmd, item.id, e)}
                className="btn btn-ghost btn-icon"
                style={{ width: '28px', height: '28px' }}
                title="Copy Command"
              >
                {copiedCmd === item.id ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Stream Card with Tabs: Commits, PRs, Contributor Velocity */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Navigation Tabs Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 18px',
          background: 'var(--bg-elevated)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('commits')}
              className={`btn btn-sm ${activeTab === 'commits' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', height: '30px', gap: '6px' }}
            >
              <GitCommit size={14} />
              <span>Commit Activity Log ({githubCommits.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prs')}
              className={`btn btn-sm ${activeTab === 'prs' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', height: '30px', gap: '6px' }}
            >
              <GitPullRequest size={14} />
              <span>Pull Requests ({githubPRs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contributors')}
              className={`btn btn-sm ${activeTab === 'contributors' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', height: '30px', gap: '6px' }}
            >
              <Flame size={14} />
              <span>Team Code Velocity</span>
            </button>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            💡 Tip: Click any commit to view changed files & full diff details
          </span>
        </div>

        {/* TAB 1: COMMITS STREAM */}
        {activeTab === 'commits' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {githubCommits.map(commit => {
              const additions = commit.stats?.additions || 0;
              const deletions = commit.stats?.deletions || 0;
              const linked = commit.linkedTaskId ? tasks.find(t => t.id === commit.linkedTaskId) : null;

              return (
                <div 
                  key={commit.sha}
                  onClick={() => setSelectedCommit(commit)}
                  className="card stagger-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'transform 160ms var(--ease-out), border-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out)'
                  }}
                  title="Click to inspect commit details, author, and changed files"
                >
                  {/* Top Row: Author Info, Branch, Date, Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {commit.authorAvatar ? (
                        <img 
                          src={commit.authorAvatar} 
                          alt={commit.authorName} 
                          style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border-subtle)' }}
                        />
                      ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {commit.authorName.charAt(0)}
                        </div>
                      )}
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {commit.authorName}
                      </span>
                      {commit.authorUsername && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          @{commit.authorUsername.replace(/^@+/, '')}
                        </span>
                      )}
                      {commit.verified && (
                        <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '1px 4px', gap: '2px' }}>
                          <ShieldCheck size={9} />
                          Verified
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        <GitBranch size={11} style={{ color: 'var(--primary)' }} />
                        <span className="mono">{commit.branch || 'main'}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        <span>{formatRelativeTime(commit.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Message & Description */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span className={`badge ${getTypeBadgeClass(commit.message)}`} style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800 }}>
                        {commit.message.split(':')[0] || 'commit'}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {commit.message.includes(':') ? commit.message.substring(commit.message.indexOf(':') + 1).trim() : commit.message}
                      </span>
                    </div>
                    {commit.description && (
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        {commit.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Stats, Linked Task, SHA and External Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {commit.stats && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{commit.stats.totalFiles} files</span>
                          <span style={{ color: 'var(--success)' }}>+{additions}</span>
                          {deletions > 0 && <span style={{ color: 'var(--danger)' }}>-{deletions}</span>}
                        </div>
                      )}

                      {linked && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectTask) onSelectTask(linked.id);
                          }}
                          className={`badge tag-${linked.category}`} 
                          style={{ fontSize: '0.64rem', cursor: 'pointer' }}
                          title={`Click to view deliverable: ${linked.title}`}
                        >
                          #{linked.id.toUpperCase()}: {linked.title.slice(0, 24)}...
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(commit.sha, commit.sha, e)}
                        className="mono btn btn-ghost btn-sm"
                        style={{ fontSize: '0.72rem', color: 'var(--text-accent)', background: 'var(--primary-light)', padding: '2px 6px', height: '24px', gap: '4px' }}
                        title="Copy Commit SHA"
                      >
                        {copiedCmd === commit.sha ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Copy size={11} />}
                        <span>{commit.shortSha || commit.sha.slice(0, 7)}</span>
                      </button>

                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="btn btn-ghost btn-icon"
                        style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }}
                        title="Open Commit on GitHub"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: PULL REQUESTS */}
        {activeTab === 'prs' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {githubPRs.map(pr => {
              const isMerged = pr.state === 'merged';
              const isOpen = pr.state === 'open';

              return (
                <div
                  key={pr.number}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isMerged ? 'rgba(168, 85, 247, 0.15)' : isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isMerged ? '#c084fc' : isOpen ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isMerged ? <GitMerge size={16} /> : <GitPullRequest size={16} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {pr.title}
                        </span>
                        <span className={`badge ${isMerged ? 'badge-primary' : isOpen ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                          #{pr.number} {pr.state}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span>by @{pr.author.replace(/^@+/, '')}</span>
                        <span>•</span>
                        <span className="mono">{pr.branch} ➔ {pr.targetBranch}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', gap: '4px', height: '28px' }}
                  >
                    <span>Review on GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: TEAM CODE VELOCITY */}
        {activeTab === 'contributors' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Individual git commit distribution and delivery velocity across active capstone developers:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contributorStats.map(({ member, commitsCount, handle }) => {
                const pct = totalCommitsCount > 0 ? Math.round((commitsCount / totalCommitsCount) * 100) : 0;
                return (
                  <div 
                    key={member.id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--border-subtle)' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            @{handle} • {member.roleTitle}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                          {commitsCount} commits
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {pct}% of repository codebase
                        </div>
                      </div>
                    </div>

                    <div className="progress-bar-container" style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${pct}%`,
                          background: member.color || 'var(--primary)',
                          transition: 'width 240ms var(--ease-out)'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Commit Details Modal */}
      <CommitDetailsModal 
        commit={selectedCommit}
        isOpen={!!selectedCommit}
        onClose={() => setSelectedCommit(null)}
        onSelectTask={onSelectTask}
      />
    </div>
  );
};
