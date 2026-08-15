import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Clock, 
  UserCheck, 
  Layers, 
  ChevronDown, 
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenNewRevision: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTask, onOpenNewRevision }) => {
  const { 
    project, 
    members, 
    currentMember, 
    switchMember, 
    theme, 
    toggleTheme, 
    searchQuery, 
    setSearchQuery 
  } = useProject();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // Defense Countdown calculation
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
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    }}>
      {/* Left: Project Context & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '600px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search 
            size={16} 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input 
            type="text" 
            placeholder="Search tasks, manuscript chapters, adviser notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Center: Live Target Defense Countdown */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-full)',
        padding: '6px 16px',
        boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-accent)' }}>
          <Clock size={15} className="animate-pulse" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Final Defense:
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
            {timeLeft.days}d
          </span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: '#ec4899', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Right: Actions & User Persona Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Add Buttons */}
        <button 
          onClick={onOpenNewTask}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>

        <button 
          onClick={onOpenNewRevision}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
          title="Log new critique or revision requested by adviser"
        >
          <AlertCircle size={14} style={{ color: '#f59e0b' }} />
          <span>Log Feedback</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#6366f1' }} />}
        </button>

        {/* User Persona Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMemberMenu(!showMemberMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px 4px 5px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
          >
            <img 
              src={currentMember.avatar} 
              alt={currentMember.name} 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${currentMember.color}` }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{currentMember.name}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{currentMember.roleTitle}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Member Dropdown Menu */}
          {showMemberMenu && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '260px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 1000,
                animation: 'slideUp 0.15s ease'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Simulate Perspective:
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
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: m.id === currentMember.id ? 'var(--primary-light)' : 'transparent',
                    color: m.id === currentMember.id ? 'var(--text-accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img 
                    src={m.avatar} 
                    alt={m.name} 
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {m.roleTitle}
                    </div>
                  </div>
                  {m.id === currentMember.id && <UserCheck size={16} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
