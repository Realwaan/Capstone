import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Clock, 
  UserCheck, 
  ChevronDown, 
  AlertCircle,
  LogOut,
  Menu,
  Database
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
  onOpenGitHubAuth: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewTask, 
  onOpenNewRevision, 
  onOpenGitHubAuth,
  onToggleMobileSidebar
}) => {
  const { 
    project, 
    members, 
    currentMember, 
    switchMember, 
    signOut,
    theme, 
    toggleTheme, 
    searchQuery, 
    setSearchQuery,
    githubUser,
    isGitHubConnected,
    isDatabaseConnected
  } = useProject();

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
      const defenseDate = new Date(project.targetDefenseDate).getTime();
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
  }, [project.targetDefenseDate]);

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
      {/* Left: Mobile Hamburger & Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '460px' }}>
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

        <div style={{ position: 'relative', width: '100%' }}>
          <Search 
            size={14} 
            style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input 
            type="text" 
            placeholder="Search tasks, docs, chapters..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field navbar-search-input"
            style={{ paddingLeft: '34px', paddingRight: '44px', height: '34px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)' }}
          />
          <div className="kbd-shortcut-pill" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <kbd style={{ fontSize: '0.62rem', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Center: Defense Countdown Ticker */}
      <div 
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
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 7px',
            borderRadius: 'var(--radius-sm)',
            background: isDatabaseConnected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
            border: `1px solid ${isDatabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
            fontSize: '0.7rem',
            color: isDatabaseConnected ? 'var(--success)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}
          title={isDatabaseConnected ? 'Connected to Supabase PostgreSQL Database (Realtime Sync Active)' : 'Local Storage Mode (Configure Supabase in Settings)'}
        >
          <Database size={12} style={{ color: isDatabaseConnected ? '#10b981' : 'var(--text-muted)' }} />
          <span className="navbar-btn-label" style={{ fontWeight: 700 }}>
            {isDatabaseConnected ? 'Cloud' : 'Local'}
          </span>
        </div>

        {/* GitHub Auth Pill Button */}
        <button 
          onClick={onOpenGitHubAuth}
          className={`btn ${isGitHubConnected ? 'btn-secondary' : 'btn-primary'} btn-sm navbar-github-btn`}
          style={{ gap: '5px', fontSize: '0.74rem', height: '32px' }}
          title="GitHub Integration"
        >
          <GitHubIcon size={14} />
          <span className="navbar-btn-label">{isGitHubConnected ? `@${githubUser?.login}` : 'GitHub'}</span>
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

        {/* User Switcher Dropdown */}
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
            title="Switch Active Persona"
          >
            {currentMember?.avatar ? (
              <img 
                src={currentMember.avatar} 
                alt={currentMember.name} 
                style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid var(--border-subtle)' }}
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
            <span className="navbar-member-name" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMember?.name.split(' ')[0]}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Member Dropdown Menu */}
          {showMemberMenu && (
            <div 
              className="dropdown-popover origin-right"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '240px',
                padding: '6px',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Persona
              </div>

              {members.map(member => (
                <div 
                  key={member.id}
                  onClick={() => {
                    switchMember(member.id);
                    setShowMemberMenu(false);
                  }}
                  className="dropdown-item"
                  style={{
                    justifyContent: 'space-between',
                    background: member.id === currentMember?.id ? 'var(--primary-light)' : 'transparent',
                    color: member.id === currentMember?.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: member.id === currentMember?.id ? 700 : 500
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: member.color, color: '#fff', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{member.roleTitle}</div>
                    </div>
                  </div>
                  {member.id === currentMember?.id && <UserCheck size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0', padding: '4px 0 0 0' }}>
                <div 
                  onClick={() => {
                    signOut();
                    setShowMemberMenu(false);
                  }}
                  className="dropdown-item"
                  style={{ color: 'var(--danger)', gap: '6px' }}
                >
                  <LogOut size={13} />
                  <span>Sign Out of Workspace</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
