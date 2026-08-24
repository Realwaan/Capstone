import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export const ActiveTeammatesPresence: React.FC = () => {
  const { members, isMemberOnline, currentMember } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeMembers = members.filter(m => isMemberOnline(m.id));
  const activeCount = Math.max(activeMembers.length, 1);

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="btn btn-ghost"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '0 10px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          transition: 'all 140ms ease'
        }}
        title="Active Teammates in Workspace"
      >
        {activeMembers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {activeMembers.slice(0, 3).map((m, idx) => (
              <img
                key={m.id}
                src={m.avatar || `https://github.com/${m.githubUsername || 'ghost'}.png`}
                alt={m.name}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--bg-surface)',
                  marginLeft: idx > 0 ? '-5px' : '0',
                  zIndex: 3 - idx,
                  position: 'relative',
                  display: 'block'
                }}
              />
            ))}
          </div>
        )}

        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px rgba(16,185,129,0.75)',
            flexShrink: 0,
            display: 'inline-block',
            animation: 'pulse-presence-ring 2s infinite ease-in-out'
          }} />
          {activeCount} Online
        </span>
      </button>

      {isOpen && (
        <div
          className="dropdown-popover origin-right"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '272px',
            padding: '12px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px rgba(16,185,129,0.6)',
                display: 'inline-block',
                animation: 'pulse-presence-ring 2s infinite ease-in-out',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Active in Workspace ({activeCount})
              </span>
            </div>
            <span style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: '9999px',
              background: 'rgba(16,185,129,0.15)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)'
            }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '240px', overflowY: 'auto' }}>
            {members.map(member => {
              const online = isMemberOnline(member.id);
              const isCurrent = member.id === currentMember?.id;

              return (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 9px',
                    borderRadius: 'var(--radius-sm)',
                    background: online ? 'var(--bg-elevated)' : 'transparent',
                    opacity: online ? 1 : 0.5,
                    transition: 'opacity 160ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={member.avatar || `https://github.com/${member.githubUsername || 'ghost'}.png`}
                        alt={member.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: online ? '1.5px solid rgba(16,185,129,0.6)' : '1px solid var(--border-subtle)',
                          display: 'block'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: online ? '#10b981' : '#6b7280',
                        border: '1.5px solid var(--bg-card)',
                        display: 'block'
                      }} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.77rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '128px' }}>
                          {member.name}
                        </span>
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.54rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '9999px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-glow)',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            flexShrink: 0
                          }}>YOU</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.64rem', fontWeight: 700, color: online ? '#10b981' : 'var(--text-muted)', flexShrink: 0 }}>
                    {online ? 'Active' : 'Offline'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};