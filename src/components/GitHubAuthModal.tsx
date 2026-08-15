import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, Check, ExternalLink, AlertCircle, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({ isOpen, onClose }) => {
  const { githubUser, loginWithGitHub, logoutGitHub, project, setGitHubRepo } = useProject();

  const [username, setUsername] = useState(githubUser?.login || '');
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState(project.githubRepoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  if (!isOpen) return null;

  const handleOAuthRedirect = () => {
    if (!clientId) {
      setError('Please add VITE_GITHUB_CLIENT_ID to your .env file to use 1-Click OAuth redirect.');
      return;
    }
    const customRedirect = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = encodeURIComponent('read:user user:email repo');
    
    // If custom redirect is provided, include it; otherwise omit so GitHub uses the exact registered Callback URL
    const authUrl = customRedirect 
      ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(customRedirect)}&scope=${scope}`
      : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;

    window.location.href = authUrl;
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your GitHub username or organization handle.');
      return;
    }

    setLoading(true);
    setError(null);

    const ok = await loginWithGitHub(username, token);
    setLoading(false);

    if (ok) {
      if (repoUrl.trim()) {
        setGitHubRepo(repoUrl.trim());
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } else {
      setError('Could not verify GitHub profile. Please check the username.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#24292f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitHubIcon size={16} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>GitHub Authentication & Sync</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {githubUser ? (
            /* Connected Profile State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login} 
                  style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {githubUser.name}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>Connected</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    @{githubUser.login}
                  </div>
                  {githubUser.bio && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {githubUser.bio}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Repo Config */}
              <div>
                <label className="input-label">Linked Repository URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="url" 
                    value={repoUrl} 
                    onChange={(e) => setRepoUrl(e.target.value)} 
                    placeholder="https://github.com/username/capstone" 
                    className="input-field" 
                  />
                  <button 
                    onClick={() => {
                      if (repoUrl.trim()) setGitHubRepo(repoUrl.trim());
                    }} 
                    className="btn btn-secondary btn-sm"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '4px' }}>
                <a 
                  href={githubUser.html_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ fontSize: '0.78rem', color: 'var(--text-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                  <span>View GitHub Profile</span>
                </a>
                <button 
                  onClick={() => {
                    logoutGitHub();
                    onClose();
                  }} 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: 'var(--danger)' }}
                >
                  Disconnect Account
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option A: 1-Click OAuth Redirect */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Official OAuth 2.0 Authorization
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Redirects to GitHub.com to authenticate with your registered OAuth Application (Client ID stored in <code className="mono">.env</code>).
                </p>
                <button 
                  type="button"
                  onClick={handleOAuthRedirect}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '8px', padding: '10px 16px', fontWeight: 700 }}
                >
                  <GitHubIcon size={16} />
                  <span>Continue with GitHub OAuth</span>
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Or Direct Connect
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              {/* Option B: Direct Username / PAT form */}
              <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {error && (
                  <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.78rem' }}>
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.78rem' }}>
                    <Check size={15} />
                    <span>GitHub account connected successfully!</span>
                  </div>
                )}

                <div>
                  <label className="input-label">GitHub Username / Handle *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      @
                    </span>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="e.g. your-github-handle" 
                      className="input-field" 
                      style={{ paddingLeft: '28px' }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Capstone Repository URL (Optional)</label>
                  <input 
                    type="url" 
                    value={repoUrl} 
                    onChange={(e) => setRepoUrl(e.target.value)} 
                    placeholder="https://github.com/your-username/capstone" 
                    className="input-field" 
                  />
                </div>

                <div>
                  <label className="input-label">Personal Access Token (Optional)</label>
                  <input 
                    type="password" 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)} 
                    placeholder="ghp_xxxxxxxxxxxx (for private repo access)" 
                    className="input-field" 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button type="button" onClick={onClose} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-secondary" 
                    disabled={loading}
                    style={{ gap: '6px' }}
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <GitHubIcon size={15} />}
                    <span>{loading ? 'Connecting...' : 'Connect Handle'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
