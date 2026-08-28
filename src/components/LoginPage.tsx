import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  Milestone,
  AlertCircle,
  Sun,
  Moon,
  Loader2,
  UserCheck,
  GraduationCap,
  RefreshCw,
  XCircle,
  Compass
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { CapStoneFlowLogo } from './CapStoneFlowLogo';
import { AuthModal } from './AuthModal';
import { Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    project, 
    phases,
    theme, 
    toggleTheme,
    loginUser
  } = useProject();

  const [loading, setLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeElapsed, setExchangeElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const isLocalDev = typeof window !== 'undefined' && (
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );

  // Active milestone phase & readiness
  const activePhase = phases.find(p => p.status === 'in_progress') || phases[0];
  const readinessPercent = activePhase ? activePhase.progressPercentage : 0;
  const deliverables = activePhase?.keyDeliverables || [];

  // Check for OAuth callback code or errors in URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error_description') || urlParams.get('error');

    if (code) {
      setIsExchanging(true);
      setLoading(true);
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  // Listen for OAuth failure events from ProjectContext
  useEffect(() => {
    const handleOAuthError = (event: any) => {
      setIsExchanging(false);
      setLoading(false);
      setError(event.detail?.message || 'GitHub Authentication Failed. Please try again.');
    };
    window.addEventListener('capstone:oauth_error', handleOAuthError);
    return () => window.removeEventListener('capstone:oauth_error', handleOAuthError);
  }, []);

  // Watchdog timer when OAuth token exchange is active
  useEffect(() => {
    if (!isExchanging) {
      setExchangeElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setExchangeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isExchanging]);

  const handleCancelExchange = () => {
    setIsExchanging(false);
    setLoading(false);
    setError(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleOAuthRedirect = async () => {
    if (!clientId) {
      setError('Missing VITE_GITHUB_CLIENT_ID in your configuration. Please check your GitHub OAuth App settings.');
      return;
    }
    setLoading(true);
    setError(null);

    let state: string;
    try {
      const stateResponse = await fetch('/api/auth/github', {
        method: 'GET',
        credentials: 'same-origin'
      });
      const statePayload = await stateResponse.json().catch(() => ({}));
      if (!stateResponse.ok || typeof statePayload.state !== 'string') {
        throw new Error('Could not initialize a secure GitHub sign-in request.');
      }
      state = statePayload.state;
      sessionStorage.setItem('capstone_oauth_state', state);
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Could not initialize GitHub sign-in.');
      return;
    }

    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = encodeURIComponent('read:user');
    
    // Build GitHub OAuth 2.0 authorization URL
    const authUrl = redirectUri 
      ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}`
      : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${encodeURIComponent(state)}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="login-split-container">
      <section className="login-left-pane animate-emil-card">

        {/* Brand Header */}
        <header className="emil-pill-fade" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
          <CapStoneFlowLogo size="lg" showBadge={true} badgeText="PRECISION OS" />
        </header>

        {/* Main Telemetry & Milestone Centerpiece */}
        <div style={{ margin: 'auto 0', maxWidth: '580px', zIndex: 2, padding: '24px 0', position: 'relative' }}>
          <div 
            className="emil-pill-fade"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}
          >
            <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px' }}>
              <GraduationCap size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              {project.teamName || 'Capstone Research Group'}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px' }}>
              {project.adviser?.department || 'Academic Defense Governance'}
            </span>
          </div>

          <h1 
            className="emil-title-lead"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '10px'
            }}
          >
            {project.title}
          </h1>
          <p 
            className="emil-content-follow"
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '26px',
              maxWidth: '520px'
            }}
          >
            {project.subtitle}
          </p>

          <div
            className="emil-support-enter"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '18px 20px',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Milestone size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  {activePhase ? activePhase.title : 'Milestone Gate Verification'}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {readinessPercent}% readiness
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ width: `${Math.max(readinessPercent, 5)}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px', transition: 'width 200ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
            </div>

            {/* Dynamic Deliverables Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deliverables.length > 0 ? (
                deliverables.slice(0, 3).map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: d.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {d.completed ? (
                      <CheckCircle2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />
                      </div>
                    )}
                    <span style={{ fontWeight: d.completed ? 400 : 600 }}>{d.title}</span>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>Proposal Defense & Title Defense Passed</span>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Bento: Scheduled Defense & Faculty Adviser */}
          <div 
            className="emil-support-enter"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <Calendar size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>TARGET DEFENSE</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{project.targetDefenseDate || 'Scheduled'}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>FACULTY SUPERVISOR</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{project.adviser?.name || 'Faculty Adviser'}</div>
                </div>
                <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Left Pane Footer Status */}
        <footer className="emil-footer-enter" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', zIndex: 2, position: 'relative' }}>
          <span className="telemetry-beacon emerald" />
          <span>Operational • Academic Defense Governance Active</span>
        </footer>
      </section>

      {/* RIGHT PANE: GitHub OAuth 2.0 Authentication Gateway */}
      <section className="login-right-pane">
        {/* Top Right Actions */}
        <header style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
          <button 
              onClick={toggleTheme} 
              className="btn btn-secondary btn-icon btn-emil-interactive"
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-card)'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} style={{ color: 'var(--primary)' }} />}
          </button>
        </header>

        {/* Center Auth Box */}
        <div className="login-auth-box">
          <div>
            <div 
              className="emil-pill-fade"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '12px' }}
            >
              <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                GitHub authorization
              </span>
            </div>

            <h2 
              className="emil-title-lead"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary)',
                marginBottom: '6px'
              }}
            >
              Sign in with GitHub
            </h2>
            <p 
              className="emil-content-follow"
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}
            >
              Authenticate with your GitHub account to access milestone deliverables, sprint commits, and defense analytics.
            </p>

            {/* Error Message Alert */}
            {error && (
              <div 
                className="emil-content-follow"
                style={{ 
                  background: 'var(--danger-bg)', 
                  border: '1px solid rgba(239, 68, 68, 0.35)', 
                  padding: '14px 16px', 
                  borderRadius: 'var(--radius-lg)', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  color: 'var(--danger)', 
                  fontSize: '0.82rem', 
                  marginBottom: '18px',
                  lineHeight: 1.45,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Authentication Notice</div>
                  <div style={{ marginTop: '3px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{error}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        handleOAuthRedirect();
                      }}
                      className="btn btn-sm"
                      style={{
                        height: '28px',
                        fontSize: '0.74rem',
                        background: 'var(--danger)',
                        color: '#fff',
                        borderRadius: 'var(--radius-md)',
                        padding: '0 12px',
                        fontWeight: 700,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>Retry GitHub Sign-in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="btn btn-ghost btn-sm"
                      style={{ height: '28px', fontSize: '0.74rem', padding: '0 10px' }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="emil-cta-enter" style={{ marginBottom: '20px' }}>
              {isExchanging ? (
                /* Dynamic Emil Kowalski Token Exchange Card */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px 20px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-lg)',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle animated ambient glow */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Loader2 size={20} className="spin" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {exchangeElapsed < 2 ? 'Connecting to GitHub...' : exchangeElapsed < 5 ? 'Verifying Student Identity...' : 'Establishing Secure Session...'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {exchangeElapsed < 2 ? 'Exchanging OAuth 2.0 authorization code' : exchangeElapsed < 5 ? 'Matching workspace role & student credentials' : 'Issuing cryptographic session token'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-card)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0
                    }}>
                      {exchangeElapsed}s
                    </div>
                  </div>

                  {/* Fallback / Recovery Toolbar */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        onClick={handleOAuthRedirect}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, height: '32px', fontSize: '0.76rem', gap: '6px', fontWeight: 700 }}
                      >
                        <RefreshCw size={13} />
                        <span>Retry Handshake</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelExchange}
                        className="btn btn-ghost btn-sm"
                        style={{ height: '32px', fontSize: '0.76rem', color: 'var(--text-muted)' }}
                      >
                        Cancel
                      </button>
                    </div>

                    {isLocalDev && (
                      <button
                        type="button"
                        onClick={() => loginUser('m_lead')}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '100%',
                          fontSize: '0.74rem',
                          color: 'var(--primary)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px dashed rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '8px'
                        }}
                        title="Local development bypass"
                      >
                        <span className="badge badge-neutral" style={{ fontSize: '0.56rem', padding: '0 4px' }}>DEV ONLY</span>
                        <span>Enter Local Workspace</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    id="github-oauth-login-btn"
                    onClick={handleOAuthRedirect}
                    disabled={loading}
                    className="btn-github-oauth btn-emil-interactive"
                    style={{ padding: '14px 20px', fontSize: '0.94rem', width: '100%', marginBottom: '10px' }}
                  >
                    <GitHubIcon size={20} />
                    <span>{loading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
                    {loading ? (
                      <Loader2 size={17} className="spin" style={{ marginLeft: 'auto' }} />
                    ) : (
                      <ArrowRight size={17} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
                    className="btn btn-secondary btn-sm"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-card)',
                      background: 'var(--bg-elevated)'
                    }}
                  >
                    <Mail size={15} style={{ color: 'var(--primary)' }} />
                    <span>Sign in with Email or Create Account</span>
                  </button>

                  {/* Local Development Only Bypass — Hidden in Deployed Production */}
                  {isLocalDev && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        id="dev-local-login-btn"
                        onClick={() => loginUser('m_lead')}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '100%',
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          border: '1px dashed var(--border-card)',
                          background: 'var(--bg-elevated)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 160ms var(--ease-out)'
                        }}
                        title="Local development only: bypass GitHub OAuth on localhost"
                      >
                        <span className="badge badge-neutral" style={{ fontSize: '0.58rem', padding: '0 4px', color: 'var(--primary)' }}>DEV ONLY</span>
                        <span>Explore Sample Workspace (Local Dev)</span>
                      </button>
                      <div style={{ textAlign: 'center', fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Visible on localhost only · Stripped from deployed production
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="emil-support-enter" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Requested permission
              </div>

              {/* Scope 1: read:user */}
              <div className="scope-item-card">
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', padding: '1px 5px' }}>read:user</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Student Profile Identity</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Used to identify your GitHub account. Repository access is requested only when you connect a repository.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <footer 
          className="emil-footer-enter"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            paddingTop: '16px',
            width: '100%',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <Lock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span>You’ll be redirected to GitHub to authorize access.</span>
        </footer>
      </section>

      {/* Direct Supabase Email/Password & Username Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(profile) => {
          loginUser(profile.id);
        }}
      />
    </div>
  );
};
