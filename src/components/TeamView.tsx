import React from 'react';
import { useProject } from '../context/ProjectContext';
import { formatRelativeTime, formatExactTimestamp, useLiveTimeRefresh } from '../utils/time';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Mail, 
  UserCheck, 
  Send,
  GraduationCap,
  ShieldCheck,
  Crown,
  Shield,
  Radio,
  WifiOff,
  Share2,
  Link2
} from 'lucide-react';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';

interface TeamViewProps {
  onOpenStandupModal: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onOpenStandupModal }) => {
  const { members, tasks, standups, project, addMemberByGitHub, isOwner, isMemberOnline } = useProject();
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [newRoleTitle, setNewRoleTitle] = React.useState('Frontend & UI/UX Developer');
  const [isSubmittingMember, setIsSubmittingMember] = React.useState(false);
  useLiveTimeRefresh(15000);

  // Student Members
  const studentMembers = members.filter(m => m.role !== 'adviser');
  
  // 1 Capstone Adviser
  const adviserMember = members.find(m => m.role === 'adviser');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsSubmittingMember(true);
    await addMemberByGitHub(newUsername.trim(), newRoleTitle);
    setIsSubmittingMember(false);
    setNewUsername('');
    setIsAddMemberOpen(false);
  };

  const memberStats = studentMembers.map(member => {
    const memberTasks = tasks.filter(t => t.assigneeId === member.id);
    const completed = memberTasks.filter(t => t.status === 'done').length;
    const inProgress = memberTasks.filter(t => t.status === 'in_progress' || t.status === 'peer_review' || t.status === 'adviser_review').length;
    const storyPoints = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
    const loggedHours = memberTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
    const completionRate = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;

    return {
      member,
      total: memberTasks.length,
      completed,
      inProgress,
      storyPoints,
      loggedHours,
      completionRate
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">{studentMembers.length} Student {studentMembers.length === 1 ? 'Member' : 'Members'}</span>
            <span className="badge badge-info">{members.filter(m => m.role === 'adviser').length} Faculty Adviser</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Team Roster & Workload Transparency</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track individual member sprint contributions, effort logged, and asynchronous daily standups
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isOwner && (
            <>
              <button 
                onClick={() => setIsInviteModalOpen(true)} 
                className="btn btn-secondary btn-sm" 
                style={{ gap: '6px', color: 'var(--primary)' }}
              >
                <Share2 size={14} />
                <span>Invite Collaborators</span>
              </button>
              <button 
                onClick={() => setIsAddMemberOpen(true)} 
                className="btn btn-secondary btn-sm" 
                style={{ gap: '6px' }}
              >
                <Users size={14} />
                <span>Add Member (GitHub)</span>
              </button>
            </>
          )}
          <button onClick={onOpenStandupModal} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Post Daily Standup</span>
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMemberOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Add Member by GitHub Handle</h3>
              </div>
              <button onClick={() => setIsAddMemberOpen(false)} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">GitHub Username *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. octocat"
                  className="input-field"
                  required
                  autoFocus
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Profile picture and display name will be loaded automatically from GitHub.
                </span>
              </div>

              <div>
                <label className="input-label">Role Title in Capstone</label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={e => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Frontend & UI/UX Developer"
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingMember || !newUsername.trim()} className="btn btn-primary">
                  {isSubmittingMember ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Members Grid */}
      <div>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
          Active Capstone Team Roster ({studentMembers.length} Members)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
          {memberStats.map(({ member, completed, inProgress, loggedHours, completionRate }) => {
            const isOnline = isMemberOnline(member.id);

            return (
              <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={member.avatar || `https://github.com/${member.githubUsername || 'ghost'}.png`} 
                      alt={member.name} 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '8px', 
                        objectFit: 'cover', 
                        border: isOnline ? '2px solid #10b981' : `2px solid ${member.color}` 
                      }} 
                    />
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? '#10b981' : '#6b7280',
                        border: '2px solid var(--bg-surface)',
                        boxShadow: isOnline ? '0 0 6px #10b981' : 'none'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {member.roleTitle}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {/* Permission badge */}
                      {member.permissionLevel === 'owner' ? (
                        <span
                          className="badge badge-primary"
                          style={{ gap: '4px', letterSpacing: '0.07em' }}
                        >
                          <Crown size={9} />
                          Owner
                        </span>
                      ) : (
                        <span
                          className="badge badge-neutral"
                          style={{ gap: '4px', letterSpacing: '0.07em' }}
                        >
                          <Shield size={9} />
                          Member
                        </span>
                      )}

                      {/* Presence badge */}
                      {isOnline ? (
                        <span
                          className="badge badge-success"
                          style={{ gap: '4px', letterSpacing: '0.07em' }}
                        >
                          <Radio size={9} style={{ flexShrink: 0 }} />
                          Online
                        </span>
                      ) : (
                        <span
                          className="badge badge-neutral"
                          style={{ gap: '4px', letterSpacing: '0.07em', opacity: 0.7 }}
                        >
                          <WifiOff size={9} style={{ flexShrink: 0 }} />
                          Offline
                        </span>
                      )}

                      {/* GitHub handle chip */}
                      {member.githubUsername && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                          }}
                        >
                          @{member.githubUsername}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'var(--bg-elevated)', padding: '8px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Done</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)' }}>{completed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--warning)' }}>{inProgress}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Hours</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{loggedHours}h</div>
                </div>
              </div>

              {/* Completion Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Sprint Task Completion</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{completionRate}%</span>
                </div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 1 Capstone Adviser Supervision Card */}
      {adviserMember && (
        <div 
          className="card" 
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '20px',
            padding: '18px 24px'
          }}
        >
          <div style={{ position: 'relative' }}>
            <img 
              src={adviserMember.avatar} 
              alt={adviserMember.name} 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                objectFit: 'cover', 
                border: isMemberOnline(adviserMember.id) ? '2px solid #10b981' : '2px solid #8b5cf6' 
              }} 
            />
            <span 
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isMemberOnline(adviserMember.id) ? '#10b981' : '#6b7280',
                border: '2px solid var(--bg-surface)',
                boxShadow: isMemberOnline(adviserMember.id) ? '0 0 8px #10b981' : 'none'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {adviserMember.name}
              </span>
              <span className="badge badge-info" style={{ gap: '5px', letterSpacing: '0.07em' }}>
                <GraduationCap size={11} />
                <span>Capstone Faculty Adviser</span>
              </span>
              {isMemberOnline(adviserMember.id) ? (
                <span className="badge badge-success" style={{ gap: '4px', letterSpacing: '0.07em' }}>
                  <Radio size={9} />
                  Online
                </span>
              ) : (
                <span className="badge badge-neutral" style={{ gap: '4px', letterSpacing: '0.07em', opacity: 0.7 }}>
                  <WifiOff size={9} />
                  Offline
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {project?.adviser?.department || project?.organization || 'Academic Supervision'} • Official Academic Supervision
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a 
              href={`mailto:${adviserMember.email}`}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Mail size={14} />
              <span>Consultation Email</span>
            </a>
          </div>
        </div>
      )}

      {/* Daily Standups Log Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Daily Standup Feed</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Yesterday's progress, today's goals, and active project blockers</p>
          </div>

          <button onClick={onOpenStandupModal} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Send size={13} />
            <span>Submit Update</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {standups.map(entry => {
            const author = members.find(m => m.id === entry.memberId);
            return (
              <div 
                key={entry.id}
                style={{
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={author?.avatar || `https://github.com/${author?.githubUsername || 'ghost'}.png`} 
                      alt="" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {author?.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {author?.roleTitle}
                      </div>
                    </div>
                  </div>

                  <span 
                    title={formatExactTimestamp(entry.date)}
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'help' }}
                  >
                    {formatRelativeTime(entry.date)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.06)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      ✅ Yesterday's Accomplishments
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {entry.yesterdayAccomplished}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.06)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      🎯 Today's Focus
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {entry.todayPlan}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.06)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      ⚠️ Blockers / Dependencies
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {entry.blockers}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Collaborators Modal */}
      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        project={project}
      />
    </div>
  );
};
