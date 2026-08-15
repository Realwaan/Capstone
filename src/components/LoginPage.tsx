import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Terminal, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Milestone,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

export const LoginPage: React.FC = () => {
  const { 
    project, 
    members, 
    loginUser, 
    loginWithGitHub, 
    theme, 
    toggleTheme 
  } = useProject();

  const [authTab, setAuthTab] = useState<'roster' | 'github'>('roster');
  const [githubHandle, setGithubHandle] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  const handleOAuthRedirect = () => {
    if (!clientId) {
      setError('Please configure VITE_GITHUB_CLIENT_ID in your .env file or use Direct Handle Connect.');
      return;
    }
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    const scope = encodeURIComponent('read:user user:email repo');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  };

  const handleDirectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubHandle.trim()) {
      setError('Please enter your GitHub username or organization handle.');
      return;
    }
    setLoading(true);
    setError(null);

    const ok = await loginWithGitHub(githubHandle, githubToken);
    setLoading(false);
    if (ok) {
      // loginWithGitHub automatically authenticates
    } else {
      setError('Could not verify GitHub profile.');
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        background: 'var(--bg-app)'
      }}
    >
      {/* Top Bar Theme Toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '24px', zIndex: 10 }}>
        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary btn-icon"
          style={{ width: '36px', height: '36px' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Moon size={16} style={{ color: 'var(--primary)' }} />}
        </button>
      </div>

      {/* Main Authentication Card */}
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          minHeight: '620px'
        }}
      >
        {/* Left Side: System Telemetry & Mission Brand */}
        <div 
          style={{
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Brand & Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#061109',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                <Terminal size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  CAPSTONE<span style={{ color: 'var(--primary)' }}>FLOW</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.06em' }}>
                  PRECISION WORK OS v2.0
                </div>
              </div>
            </div>

            {/* Academic Context Badge */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="badge badge-primary">2nd Year BSCS</span>
                <span className="badge badge-neutral">Group Workspace</span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {project.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                {project.subtitle}
              </div>
            </div>

            {/* Live Telemetry List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span><strong>Role-Based Access Control:</strong> Owner & Member Permissions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Milestone size={14} style={{ color: '#38bdf8' }} />
                <span><strong>Milestone Lifecycle:</strong> Phase 1 Proposal Gates Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ color: '#fbbf24' }} />
                <span><strong>Target Defense:</strong> {project.targetDefenseDate}</span>
              </div>
            </div>
          </div>

          {/* Footer: Faculty Supervision */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
              CAPSTONE ADVISER
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {project.adviser.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {project.adviser.department}
            </div>
          </div>
        </div>

        {/* Right Side: Auth Command Gateway */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Lock size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                SECURE AUTHENTICATION GATE
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Sign in to CapStoneFlow
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Choose your team member identity or authenticate via GitHub
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginBottom: '18px'
          }}>
            <button
              onClick={() => setAuthTab('roster')}
              className={`btn btn-sm ${authTab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '6px', gap: '6px', fontWeight: 700 }}
            >
              <Users size={14} />
              <span>Team Roster (5 Members + 1 Adviser)</span>
            </button>
            <button
              onClick={() => setAuthTab('github')}
              className={`btn btn-sm ${authTab === 'github' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '6px', gap: '6px', fontWeight: 700 }}
            >
              <GitHubIcon size={14} />
              <span>GitHub OAuth</span>
            </button>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.78rem', marginBottom: '14px' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Team Roster Selection */}
          {authTab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                Select Your Profile to Continue:
              </div>

              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => loginUser(m.id)}
                  className="stagger-item card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-elevated)',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 160ms var(--ease-out)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={m.avatar} 
                      alt={m.name} 
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {m.name}
                        </span>
                        <span className={`badge ${m.permissionLevel === 'owner' ? 'badge-primary' : m.permissionLevel === 'adviser' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                          {m.permissionLevel === 'owner' ? '👑 Owner' : m.permissionLevel === 'adviser' ? 'Adviser' : 'Member'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {m.roleTitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Enter</span>
                    <ChevronRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tab 2: GitHub OAuth Form */}
          {authTab === 'github' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1-Click OAuth Button */}
              <button
                onClick={handleOAuthRedirect}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', gap: '8px', fontSize: '0.88rem' }}
              >
                <GitHubIcon size={18} />
                <span>Continue with GitHub OAuth 2.0</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  Or Direct Connect
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              {/* Direct Username Input */}
              <form onSubmit={handleDirectGitHub} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="input-label">GitHub Username / Handle</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      @
                    </span>
                    <input 
                      type="text" 
                      value={githubHandle} 
                      onChange={(e) => setGithubHandle(e.target.value)} 
                      placeholder="e.g. your-github-handle" 
                      className="input-field" 
                      style={{ paddingLeft: '28px' }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Personal Access Token (Optional)</label>
                  <input 
                    type="password" 
                    value={githubToken} 
                    onChange={(e) => setGithubToken(e.target.value)} 
                    placeholder="ghp_xxxxxxxxxxxx" 
                    className="input-field" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  disabled={loading}
                  style={{ width: '100%', padding: '10px', gap: '6px' }}
                >
                  <GitHubIcon size={15} />
                  <span>{loading ? 'Connecting...' : 'Sign in with GitHub Handle'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
