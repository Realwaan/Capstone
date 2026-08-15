import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Clock, 
  UserCheck, 
  ChevronDown, 
  AlertCircle
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
  onOpenGitHubAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTask, onOpenNewRevision, onOpenGitHubAuth }) => {
  const { 
    project, 
    members, 
    currentMember, 
    switchMember, 
    theme, 
    toggleTheme, 
    searchQuery, 
    setSearchQuery,
    githubUser,
    isGitHubConnected
  } = useProject();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showMemberMenu, setShowMemberMenu] = useState(false);

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
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-card)',
      padding: '10px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '480px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search 
            size={14} 
            style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input 
            type="text" 
            placeholder="Quick search tasks, chapters, directives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '34px', height: '34px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      </div>

      {/* Center: Defense Countdown Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 12px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>
          <Clock size={13} style={{ color: 'var(--primary)' }} />
          <span>TARGET:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-primary)' }}>{timeLeft.days}d</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--text-primary)' }}>{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--text-primary)' }}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--primary)' }}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* GitHub Auth Pill Button */}
        <button 
          onClick={onOpenGitHubAuth}
          className={`btn ${isGitHubConnected ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          style={{ gap: '6px', fontSize: '0.76rem' }}
          title="GitHub Integration"
        >
          <GitHubIcon size={14} />
          <span>{isGitHubConnected ? `@${githubUser?.login}` : 'Login with GitHub'}</span>
        </button>

        <button 
          onClick={onOpenNewTask}
          className="btn btn-secondary btn-sm"
          style={{ gap: '5px' }}
        >
          <Plus size={14} />
          <span>Task</span>
        </button>

        <button 
          onClick={onOpenNewRevision}
          className="btn btn-secondary btn-sm"
          style={{ gap: '5px' }}
          title="Log feedback from adviser"
        >
          <AlertCircle size={13} style={{ color: 'var(--warning)' }} />
          <span>Feedback</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          style={{ width: '32px', height: '32px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} style={{ color: 'var(--primary)' }} />}
        </button>

        {/* Member Switcher */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMemberMenu(!showMemberMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px 3px 4px',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <img 
              src={currentMember.avatar} 
              alt={currentMember.name} 
              style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{currentMember.name}</span>
                <span className={`badge ${currentMember.permissionLevel === 'owner' ? 'badge-primary' : currentMember.permissionLevel === 'adviser' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.52rem', padding: '0px 4px' }}>
                  {currentMember.permissionLevel === 'owner' ? '👑 Owner' : currentMember.permissionLevel === 'adviser' ? 'Adviser' : 'Member'}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{currentMember.roleTitle}</div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showMemberMenu && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '280px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Active Profile & Permissions:
              </div>
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    switchMember(m.id);
                    setShowMemberMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: m.id === currentMember.id ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                    background: m.id === currentMember.id ? 'var(--primary-light)' : 'transparent',
                    color: m.id === currentMember.id ? 'var(--text-accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '2px'
                  }}
                >
                  <img 
                    src={m.avatar} 
                    alt={m.name} 
                    style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{m.name}</span>
                      <span className={`badge ${m.permissionLevel === 'owner' ? 'badge-primary' : m.permissionLevel === 'adviser' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.52rem', padding: '0px 4px' }}>
                        {m.permissionLevel === 'owner' ? '👑 Owner' : m.permissionLevel === 'adviser' ? 'Adviser' : 'Member'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{m.roleTitle}</div>
                  </div>
                  {m.id === currentMember.id && <UserCheck size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
