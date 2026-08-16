import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Role } from '../types';
import { 
  X, 
  Wrench, 
  Code, 
  Search, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface RolesPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesPermissionsModal: React.FC<RolesPermissionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentMember, updateMemberRole, isOwner } = useProject();

  if (!isOpen) return null;

  const handleSetRole = (role: Role, title: string) => {
    updateMemberRole(currentMember.id, role, title);
    toast.success(`Role updated! You are now: ${title}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          padding: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.75)',
          overflow: 'hidden'
        }}
      >
        {/* Discord Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Roles & Permissions
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px' }}>
              What each role can do
            </div>

            {/* 3 Columns Matrix matching Discord Embed */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {/* Project Manager Column */}
              <div style={{
                background: 'var(--bg-card)',
                border: currentMember.role === 'leader' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <span>🔧</span>
                    <span>Project Manager (Admin)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/load-tickets</code>
                    <span>- Load tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/rebuild-db</code>
                    <span>- Rebuild DB</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/claim</code>
                    <span>- Claim tickets (like Dev)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/resolved</code>
                    <span>- Submit for review</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/reviewed</code>
                    <span>- Approve tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/closed</code>
                    <span>- Close tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>Can do EVERYTHING</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>Gets Project Manager role</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetRole('leader', 'Project Lead & PM')}
                  disabled={currentMember.role === 'leader'}
                  className={`btn ${currentMember.role === 'leader' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ marginTop: 'auto', width: '100%', fontSize: '0.72rem', height: '28px' }}
                >
                  {currentMember.role === 'leader' ? 'Active Role' : 'Switch to PM'}
                </button>
              </div>

              {/* Developer Column */}
              <div style={{
                background: 'var(--bg-card)',
                border: currentMember.role === 'developer' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <span>🧑‍💻</span>
                    <span>Developer</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/claim</code>
                    <span>- Claim tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/resolved</code>
                    <span>- Submit for review</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/unclaim</code>
                    <span>- Unclaim ticket</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/closed</code>
                    <span>- Close tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>View dev leaderboard</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>Gets Developer role</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetRole('developer', 'Backend / Full-Stack Developer')}
                  disabled={currentMember.role === 'developer'}
                  className={`btn ${currentMember.role === 'developer' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ marginTop: 'auto', width: '100%', fontSize: '0.72rem', height: '28px' }}
                >
                  {currentMember.role === 'developer' ? 'Active Role' : 'Switch to Developer'}
                </button>
              </div>

              {/* QA Column */}
              <div style={{
                background: 'var(--bg-card)',
                border: currentMember.role === 'qa' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <span>🔍</span>
                    <span>QA / Reviewer</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/reviewed</code>
                    <span>- Approve tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <code>/closed</code>
                    <span>- Close tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>View QA leaderboard</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                    <span>Gets QA role</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetRole('qa', 'QA & Test Engineer')}
                  disabled={currentMember.role === 'qa'}
                  className={`btn ${currentMember.role === 'qa' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ marginTop: 'auto', width: '100%', fontSize: '0.72rem', height: '28px' }}
                >
                  {currentMember.role === 'qa' ? 'Active Role' : 'Switch to QA'}
                </button>
              </div>
            </div>
          </div>

          {/* Role System Explanatory Callout Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>📝</span>
              <span>Role System</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700 }}>
              <AlertTriangle size={14} />
              <span>ONE role per user only</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              When you set a new role, your old role is replaced automatically. Project Managers (Admins) inherit all permissions across Developer and QA command pipelines.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
