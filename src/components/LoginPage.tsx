import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Terminal, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Milestone,
  AlertCircle,
  Sun,
  Moon,
  KeyRound,
  Layers,
  Sparkles
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

export const LoginPage: React.FC = () => {
  const { 
    project, 
    theme, 
    toggleTheme,
    loginUser,
    loginWithGitHub,
    members
  } = useProject();

  const [loading, setLoading] = useState(false);
  const [handleLoading, setHandleLoading] = useState(false);
  const [githubHandle, setGithubHandle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  // Check for error parameters in URL (e.g. access_denied)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error_description') || urlParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  const handleOAuthRedirect = () => {
    if (!clientId) {
      setError('Missing VITE_GITHUB_CLIENT_ID in your .env file. Please check your configuration.');
      return;
    }
    setLoading(true);
    setError(null);

    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = encodeURIComponent('read:user user:email repo');
    
    // If VITE_GITHUB_REDIRECT_URI is set, include it; otherwise omit redirect_uri so GitHub uses the exact registered callback URL
    const authUrl = redirectUri 
      ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
      : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;
    
    window.location.href = authUrl;
  };

  const handleDirectGitHubLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubHandle.trim()) return;
    setHandleLoading(true);
    setError(null);
    try {
      const success = await loginWithGitHub(githubHandle.trim());
      if (!success) {
        setError('Failed to authenticate with GitHub. Please check the username.');
      }
    } catch {
      setError('An error occurred during GitHub authentication.');
    } finally {
      setHandleLoading(false);
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
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          minHeight: '560px'
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
                width: '36px',
                height: '36px',
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
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="badge badge-primary">2nd Year BSCS</span>
                <span className="badge badge-neutral">GitHub OAuth 2.0</span>
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.3 }}>
                {project.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                {project.subtitle}
              </div>
            </div>

            {/* Live Telemetry List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                <span><strong>Live Team Profiles:</strong> Fetched dynamically from GitHub</span>
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
            padding: '12px 14px',
            marginTop: '24px'
          }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
              CAPSTONE ADVISER
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {project.adviser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {project.adviser.department}
            </div>
          </div>
        </div>

        {/* Right Side: GitHub OAuth 2.0 Gateway */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                SINGLE SIGN-ON GATEWAY
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Sign in with GitHub
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Authenticate with your personal GitHub account to join the capstone workspace with your live profile picture.
            </p>
          </div>

          {error && (
            <div style={{ 
              background: 'var(--danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              color: 'var(--danger)', 
              fontSize: '0.78rem', 
              marginBottom: '16px' 
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Dedicated GitHub Login Card */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Primary Action Button */}
            <button
              onClick={handleOAuthRedirect}
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <GitHubIcon size={18} />
              <span>{loading ? 'Connecting to GitHub...' : 'Continue with GitHub OAuth'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Direct GitHub Username Form */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>or sign in with handle</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            <form onSubmit={handleDirectGitHubLogin} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={githubHandle}
                onChange={e => setGithubHandle(e.target.value)}
                placeholder="Your GitHub username (e.g. octocat)"
                className="input-field"
                style={{ flex: 1, fontSize: '0.82rem', height: '36px' }}
              />
              <button
                type="submit"
                disabled={handleLoading || !githubHandle.trim()}
                className="btn btn-secondary"
                style={{ height: '36px', padding: '0 14px', fontSize: '0.8rem', fontWeight: 700, gap: '6px' }}
              >
                {handleLoading ? 'Fetching...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Member Selector */}
            {members.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Switch Active Member Profile:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {members.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => loginUser(m.id)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <img 
                        src={m.avatar || `https://github.com/${m.githubUsername || 'ghost'}.png`} 
                        alt={m.name} 
                        style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: `1.5px solid ${m.color}` }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {m.githubUsername ? `@${m.githubUsername}` : m.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security & Verification Footer */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Lock size={12} />
            <span>Encrypted GitHub single sign-on authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
