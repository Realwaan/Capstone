import React from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Mail, 
  UserCheck, 
  Send,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface TeamViewProps {
  onOpenStandupModal: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onOpenStandupModal }) => {
  const { members, tasks, standups, project } = useProject();

  // 5 Student Members
  const studentMembers = members.filter(m => m.role !== 'adviser');
  
  // 1 Capstone Adviser
  const adviserMember = members.find(m => m.role === 'adviser');

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
            <span className="badge badge-primary">5 Student Members</span>
            <span className="badge badge-info">1 Faculty Adviser</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Team Roster & Workload Transparency</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track individual member sprint contributions, effort logged, and asynchronous daily standups
          </p>
        </div>

        <button onClick={onOpenStandupModal} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={15} />
          <span>Post Daily Standup</span>
        </button>
      </div>

      {/* 5 Student Members Grid */}
      <div>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
          Active Capstone Team Roster (5 Members)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
          {memberStats.map(({ member, completed, inProgress, loggedHours, completionRate }) => (
            <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: `2px solid ${member.color}` }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {member.roleTitle}
                  </div>
                  <span className={`badge ${member.permissionLevel === 'owner' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.55rem', padding: '1px 5px', marginTop: '2px' }}>
                    {member.permissionLevel === 'owner' ? '👑 Owner' : 'Member'}
                  </span>
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
          ))}
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
          <img 
            src={adviserMember.avatar} 
            alt={adviserMember.name} 
            style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #8b5cf6' }} 
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {adviserMember.name}
              </span>
              <span className="badge badge-info" style={{ gap: '4px' }}>
                <GraduationCap size={12} />
                <span>Capstone Faculty Adviser</span>
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {project.adviser.department} • Official Academic Supervision
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
                      src={author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
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

                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {entry.date}
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
    </div>
  );
};
