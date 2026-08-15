import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  GitBranch, 
  GitCommit, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Copy, 
  Terminal,
  FolderGit2
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

interface GitHubViewProps {
  onOpenGitHubAuth: () => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({ onOpenGitHubAuth }) => {
  const { 
    githubUser, 
    project, 
    githubCommits, 
    syncGitHubData, 
    isGitHubConnected,
    tasks 
  } = useProject();

  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncGitHubData();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const repoUrl = project.githubRepoUrl || (githubUser ? `https://github.com/${githubUser.login}/capstone` : 'https://github.com/your-team/capstone');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>GitHub Developer Hub</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Connected repository status, commit activity, pull requests, and Git workflows
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleSync} 
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px' }}
            disabled={isSyncing}
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
            <span>{isGitHubConnected ? 'Manage Account' : 'Login with GitHub'}</span>
          </button>
        </div>
      </div>

      {/* Connected Account & Repository Banner */}
      <div 
        className="card" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#24292f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <GitHubIcon size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isGitHubConnected ? `@${githubUser?.login}` : 'GitHub Not Connected'}
              </h3>
              <span className={`badge ${isGitHubConnected ? 'badge-success' : 'badge-neutral'}`}>
                {isGitHubConnected ? 'Active' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {isGitHubConnected ? `Authenticated as ${githubUser?.name} (${githubUser?.email})` : 'Connect your GitHub profile to link commits and issues'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a 
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px' }}
          >
            <ExternalLink size={13} />
            <span>Open Repository</span>
          </a>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid-cols-3">
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
            {githubCommits.length + 1}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Latest SHA: <span className="mono">{githubCommits[0]?.sha || '33ebe86'}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Linked Tasks</span>
            <FolderGit2 size={15} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {tasks.filter(t => t.deliverableUrl || t.category === 'code').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Tasks referencing git deliverables
          </div>
        </div>
      </div>

      {/* Git Terminal Quick Commands Matrix */}
      <div className="card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px' }}>
          Quick Git Terminal Snippets
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
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
                onClick={() => handleCopy(item.cmd, item.id)}
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

      {/* Commits Stream */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Commit Activity Log</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Recent code pushes and repository sync history</p>
          </div>
          <button onClick={handleSync} className="btn btn-ghost btn-sm" style={{ gap: '4px', color: 'var(--primary)' }}>
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Initial Git Commit Record */}
          <div 
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  feat(init): initialize Capstone repository with CapStoneFlow platform and documentation framework
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Committed on main branch • 47 files changed
                </div>
              </div>
            </div>

            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-accent)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
              33ebe86
            </span>
          </div>

          {githubCommits.map(commit => (
            <div 
              key={commit.sha}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {commit.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    By {commit.authorName} on {commit.date}
                  </div>
                </div>
              </div>

              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                {commit.sha}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
