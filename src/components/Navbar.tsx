import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Clock, 
  ChevronDown, 
  AlertCircle,
  LogOut,
  Menu,
  Database,
  ShieldCheck,
  ExternalLink,
  User,
  Sparkles,
  Compass
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { ActiveTeammatesPresence } from './ActiveTeammatesPresence';
import { ProjectSwitcherDropdown } from './ProjectSwitcherDropdown';
import { startWorkspaceTour } from '../lib/tour';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
  onOpenGitHubAuth: () => void;
  onOpenCreateProject?: () => void;
  onOpenProjectsOverview?: () => void;
  onNavigateToProjects?: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewTask, 
  onOpenNewRevision, 
  onOpenGitHubAuth,
  onOpenCreateProject,
  onOpenProjectsOverview,
  onNavigateToProjects,
  onToggleMobileSidebar,
  onOpenCommandPalette
}) => {
  const { 
    project, 
    currentMember, 
    members,
    signOut,
    theme, 
    toggleTheme, 
    githubUser,
    isGitHubConnected,
    isDatabaseConnected,
    syncToSupabase
  } = useProject();

  const [isSyncing, setIsSyncing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMemberMenu(false);
      }
    };
    if (showMemberMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemberMenu]);

  useEffect(() => {
    const calculateTime = () => {
      const defenseDate = new Date(project?.targetDefenseDate || '2026-11-30').getTime();
      const now = new Date().getTime();
      const difference = defenseDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [project?.targetDefenseDate]);

  return (
    <header 
      className="navbar-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px) saturate(190%)',
        WebkitBackdropFilter: 'blur(20px) saturate(190%)',
        borderBottom: '1px solid var(--border-card)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      {/* Left: Mobile Hamburger, Org Breadcrumb, Project Switcher & Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '640px' }}>
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="btn btn-secondary btn-icon mobile-hamburger-btn"
            style={{ width: '36px', height: '36px', flexShrink: 0, padding: 0 }}
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Organization Breadcrumb Pill */}
        {onNavigateToProjects && (
          <button
            type="button"
            onClick={onOpenProjectsOverview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              height: '34px',
              cursor: 'pointer',
              flexShrink: 0
            }}
            title="Return to All Projects Hub"
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#238636', display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentMember?.name || 'Keshie'}
            </span>
          </button>
        )}

        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>/</span>

        {/* Supabase-style Project Switcher */}
        {onOpenCreateProject && (
          <ProjectSwitcherDropdown 
            onOpenCreateProject={onOpenCreateProject}
            onOpenProjectsOverview={onOpenProjectsOverview}
          />
        )}

        <div 
          id="navbar-search" 
          onClick={onOpenCommandPalette}
          className="navbar-search-btn"
          style={{ 
            position: 'relative', 
            width: '100%', 
            cursor: 'pointer', 
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            height: '34px',
            paddingLeft: '11px',
            paddingRight: '8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 160ms var(--ease-out)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="Open Command Palette & Global Search (⌘K / Ctrl+K)"
        >
          <Search 
            size={14} 
            style={{ color: 'var(--primary)', flexShrink: 0, marginRight: '8px' }} 
          />
          <span 
            className="navbar-search-placeholder"
            style={{ 
              fontSize: '0.82rem', 
              color: 'var(--text-secondary)',
              fontWeight: 500,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            Search workspace...
          </span>
          <div className="kbd-shortcut-pill" style={{ marginLeft: '6px', pointerEvents: 'none' }}>
            <kbd style={{ 
              fontSize: '0.64rem', 
              fontWeight: 700,
              padding: '2px 5px', 
              borderRadius: '4px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-card)', 
              color: 'var(--text-primary)', 
              fontFamily: 'var(--font-mono)' 
            }}>
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Center: Defense Countdown Ticker */}
      <div 
        id="navbar-countdown-ticker"
        className="navbar-countdown-ticker"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 10px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>
          <Clock size={12} style={{ color: 'var(--primary)' }} />
          <span className="ticker-label">TARGET:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '0.76rem' }}>
          <span style={{ color: 'var(--text-primary)' }}>{timeLeft.days}d</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--text-primary)' }}>{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span className="ticker-seconds" style={{ color: 'var(--text-muted)' }}>:</span>
          <span className="ticker-seconds" style={{ color: 'var(--text-primary)' }}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span className="ticker-seconds" style={{ color: 'var(--text-muted)' }}>:</span>
          <span className="ticker-seconds" style={{ color: 'var(--primary)' }}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Database Cloud Sync Status Badge */}
        {/* Real-time Cloud Status Badge (Auto-Synced in Background) */}
        <div 
          id="navbar-cloud-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.7rem',
            color: 'var(--success)',
            fontFamily: 'var(--font-mono)',
            userSelect: 'none'
          }}
          title="Supabase PostgreSQL Cloud Active • Auto-synced in real-time"
        >
          <span 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: '#10b981', 
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.7)' 
            }} 
          />
          <Database size={11} className={isSyncing ? 'spin' : ''} style={{ color: '#10b981' }} />
          <span className="navbar-btn-label" style={{ fontWeight: 700 }}>
            {isSyncing ? 'Syncing...' : 'Cloud Live'}
          </span>
        </div>

        {/* GitHub Auth Pill Button */}
        <button 
          id="navbar-github"
          onClick={onOpenGitHubAuth}
          className={`btn ${isGitHubConnected ? 'btn-secondary' : 'btn-primary'} btn-sm navbar-github-btn`}
          style={{ gap: '5px', fontSize: '0.74rem', height: '32px' }}
          title="GitHub Integration"
        >
          <GitHubIcon size={14} />
          <span className="navbar-btn-label">{isGitHubConnected ? `@${githubUser?.login}` : 'GitHub'}</span>
        </button>

        {/* Interactive Tour Button */}
        <button
          onClick={() => startWorkspaceTour()}
          className="btn btn-secondary btn-icon"
          style={{ width: '32px', height: '32px', minWidth: '32px' }}
          title="Start Interactive Workspace Tour (Driver.js)"
        >
          <Compass size={14} style={{ color: 'var(--primary)' }} />
        </button>

        {/* Quick New Task Button (Desktop only, mobile has bottom bar) */}
        <button 
          onClick={onOpenNewTask}
          className="btn btn-secondary btn-sm desktop-only-btn"
          style={{ gap: '4px', height: '32px', fontSize: '0.74rem' }}
        >
          <Plus size={13} />
          <span>Task</span>
        </button>

        {/* Quick Revision Button (Desktop only) */}
        <button 
          onClick={onOpenNewRevision}
          className="btn btn-secondary btn-sm desktop-only-btn"
          style={{ gap: '4px', height: '32px', fontSize: '0.74rem' }}
          title="Log feedback from adviser"
        >
          <AlertCircle size={13} style={{ color: 'var(--warning)' }} />
          <span>Feedback</span>
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          style={{ width: '32px', height: '32px', minWidth: '32px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} style={{ color: 'var(--primary)' }} />}
        </button>

        {/* Live Multiplayer Active Teammates Presence */}
        <div id="navbar-presence">
          <ActiveTeammatesPresence />
        </div>

        {/* Authenticated User Profile Menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setShowMemberMenu(prev => !prev)}
            className="btn btn-ghost user-avatar-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              height: '34px'
            }}
            title="Account Profile & Session"
          >
            {currentMember?.avatar ? (
              <img 
                src={currentMember.avatar} 
                alt={currentMember.name} 
                style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid var(--border-subtle)', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: currentMember?.color || 'var(--primary)',
                color: '#fff',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {currentMember?.name.charAt(0)}
              </div>
            )}
            <span className="navbar-member-name" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMember?.name.split(' ')[0]}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Authenticated Profile Popover */}
          {showMemberMenu && (
            <div 
              className="dropdown-popover origin-right"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '260px',
                padding: '12px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Authenticated User Header Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={currentMember?.avatar || `https://github.com/${githubUser?.login || 'ghost'}.png`} 
                  alt={currentMember?.name || 'User'} 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover', flexShrink: 0 }} 
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentMember?.name || githubUser?.name || 'Verified Member'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentMember?.email || githubUser?.email || 'Authenticated Session'}
                  </div>
                </div>
              </div>

              {/* Badges Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Role Title:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>{currentMember?.roleTitle || 'Developer'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Access Level:</span>
                  <span className={`badge ${currentMember?.permissionLevel === 'owner' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                    {currentMember?.permissionLevel === 'owner' ? '👑 Lead (Owner)' : currentMember?.permissionLevel === 'adviser' ? '👨‍🏫 Adviser' : '👤 Team Member'}
                  </span>
                </div>
                {githubUser?.login && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GitHub Handle:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>@{githubUser.login}</span>
                  </div>
                )}
              </div>

              {/* GitHub Profile Link */}
              {githubUser?.login && (
                <a
                  href={`https://github.com/${githubUser.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropdown-item"
                  style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', gap: '8px', padding: '6px 8px', borderRadius: '4px', textDecoration: 'none' }}
                >
                  <GitHubIcon size={14} />
                  <span style={{ flex: 1 }}>View GitHub Profile</span>
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </a>
              )}

              {/* Interactive Tour Action */}
              <button
                type="button"
                onClick={() => {
                  startWorkspaceTour();
                  setShowMemberMenu(false);
                }}
                className="dropdown-item"
                style={{ width: '100%', fontSize: '0.76rem', color: 'var(--text-secondary)', gap: '8px', padding: '6px 8px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <Compass size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ flex: 1 }}>Interactive Product Tour</span>
              </button>

              {/* Sign Out Action */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    signOut();
                    setShowMemberMenu(false);
                  }}
                  className="dropdown-item"
                  style={{ width: '100%', color: 'var(--danger)', gap: '8px', padding: '6px 8px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <LogOut size={14} />
                  <span style={{ fontWeight: 600 }}>Sign Out of Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
