import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  X, 
  ExternalLink, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Key, 
  User, 
  Check, 
  FolderGit2,
  Sparkles
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { setGitHubToken, getGitHubToken, DEFAULT_GITHUB_REPO_URL } from '../lib/github';
import { toast } from 'sonner';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    githubUser, 
    logoutGitHub, 
    loginWithGitHub, 
    project, 
    setGitHubRepo, 
    syncGitHubData,
    members 
  } = useProject();

  const [authMode, setAuthMode] = useState<'username' | 'oauth'>('username');
  const [handleInput, setHandleInput] = useState('');
  const [patToken, setPatToken] = useState(getGitHubToken());
  const [repoUrl, setRepoUrl] = useState(project.githubRepoUrl || DEFAULT_GITHUB_REPO_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  // Lock body scroll while modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectByUsername = async (e?: React.FormEvent, customHandle?: string) => {
    if (e) e.preventDefault();
    const targetHandle = (customHandle || handleInput).trim().replace(/^@/, '');
    if (!targetHandle) {
      setError('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (patToken.trim()) {
        setGitHubToken(patToken.trim());
      }

      const success = await loginWithGitHub(targetHandle, patToken.trim() || undefined);
      if (success) {
        toast.success('GitHub Connected', {
          description: `Logged in as @${targetHandle}`
        });
        await syncGitHubData();
        onClose();
      } else {
        setError(`Could not resolve @${targetHandle} on GitHub. Check username spelling.`);
      }
    } catch {
      setError('An error occurred while connecting to GitHub.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRedirect = () => {
    if (!clientId) {
      setError('Missing VITE_GITHUB_CLIENT_ID in .env file.');
      return;
    }
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = encodeURIComponent('read:user user:email repo');
    
    const authUrl = redirectUri 
      ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
      : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;

    window.location.href = authUrl;
  };

  const handleSaveRepo = async () => {
    if (!repoUrl.trim()) return;
    setGitHubRepo(repoUrl.trim());
    await syncGitHubData();
    toast.success('Repository Linked', {
      description: `Target repository updated to ${repoUrl.trim()}`
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ 
          padding: '18px 24px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
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
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)'
            }}>
              <GitHubIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>GitHub Developer Hub</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Connect your account for live commits, PRs, and team telemetry
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{ 
              background: 'var(--danger-bg)', 
              border: '1px solid rgba(255, 69, 58, 0.3)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--danger)', 
              fontSize: '0.78rem' 
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {githubUser ? (
            /* Connected State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login} 
                  style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1.5px solid var(--primary)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {githubUser.name || githubUser.login}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                      🟢 Connected
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>
                    @{githubUser.login}
                  </div>
                  {githubUser.bio && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {githubUser.bio}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Repo URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FolderGit2 size={14} style={{ color: 'var(--primary)' }} />
                  <span>Linked GitHub Repository</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={repoUrl} 
                    onChange={(e) => setRepoUrl(e.target.value)} 
                    placeholder="e.g. owner/repo or https://github.com/owner/repo" 
                    className="input-field"
                    style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                  />
                  <button 
                    type="button"
                    onClick={handleSaveRepo} 
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '90px' }}
                  >
                    <span>Save Repo</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Accepts <code style={{ fontFamily: 'var(--font-mono)' }}>owner/repo</code>, HTTPS, or SSH Git URLs.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                borderTop: '1px solid var(--border-subtle)', 
                paddingTop: '16px' 
              }}>
                <a 
                  href={githubUser.html_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    fontSize: '0.78rem', 
                    color: 'var(--text-accent)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open GitHub Profile</span>
                </a>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await syncGitHubData();
                      toast.success('Git Feeds Refreshed');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <RefreshCw size={13} />
                    <span>Sync Feeds</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      logoutGitHub();
                      toast.info('Disconnected from GitHub');
                    }} 
                    className="btn btn-ghost btn-sm" 
                    style={{ color: 'var(--danger)' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Unconnected State with Multi-Mode Auth */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Tab Selector */}
              <div style={{ 
                display: 'flex', 
                background: 'var(--bg-elevated)', 
                padding: '3px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)' 
              }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('username')}
                  className="btn btn-ghost btn-sm"
                  style={{
                    flex: 1,
                    borderRadius: 'var(--radius-sm)',
                    background: authMode === 'username' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: authMode === 'username' ? 'var(--shadow-sm)' : 'none',
                    fontWeight: authMode === 'username' ? 700 : 500,
                    color: authMode === 'username' ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  Quick Username / Handle
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('oauth')}
                  className="btn btn-ghost btn-sm"
                  style={{
                    flex: 1,
                    borderRadius: 'var(--radius-sm)',
                    background: authMode === 'oauth' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: authMode === 'oauth' ? 'var(--shadow-sm)' : 'none',
                    fontWeight: authMode === 'oauth' ? 700 : 500,
                    color: authMode === 'oauth' ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  OAuth 2.0 Web Flow
                </button>
              </div>

              {authMode === 'username' ? (
                /* Mode 1: Quick Username & Token */
                <form onSubmit={(e) => handleConnectByUsername(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Quick Select Team Members if any exist */}
                  {members.filter(m => m.githubUsername).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        Quick 1-Click Connect Team Handle:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                        {members.filter(m => m.githubUsername).map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleConnectByUsername(undefined, m.githubUsername)}
                            disabled={loading}
                            className="btn btn-secondary btn-sm"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              justifyContent: 'flex-start'
                            }}
                          >
                            <img 
                              src={m.avatar || `https://github.com/${m.githubUsername}.png`} 
                              alt={m.name} 
                              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '0.76rem', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                @{m.githubUsername}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                {m.name.split(' ')[0]}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Or Custom Username */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Or Enter Custom GitHub Username</label>
                    <input 
                      type="text"
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      placeholder="e.g. your-github-handle"
                      className="input-field"
                      style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  {/* Optional PAT */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Key size={12} />
                        <span>Personal Access Token (Optional — 5,000 req/hr)</span>
                      </label>
                    </div>
                    <input 
                      type="password"
                      value={patToken}
                      onChange={(e) => setPatToken(e.target.value)}
                      placeholder="ghp_... (Optional for private repos)"
                      className="input-field"
                      style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontWeight: 800, marginTop: '4px' }}
                  >
                    <GitHubIcon size={16} />
                    <span>{loading ? 'Authenticating with GitHub...' : 'Connect GitHub Profile'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                /* Mode 2: OAuth 2.0 Flow */
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Standard OAuth 2.0 Web Flow
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Redirects to GitHub to grant full read access to repositories, branches, and collaborator telemetry.
                  </p>

                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    Client ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{clientId || 'Not configured in .env'}</code>
                  </div>

                  <button 
                    type="button"
                    onClick={handleOAuthRedirect}
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '8px', padding: '12px 16px', fontWeight: 800, marginTop: '4px' }}
                  >
                    <GitHubIcon size={16} />
                    <span>Authenticate via GitHub OAuth</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
