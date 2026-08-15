import React from 'react';
import { useProject } from '../context/ProjectContext';
import confetti from 'canvas-confetti';
import { 
  Milestone, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Check, 
  FileCheck2, 
  ArrowRight,
  Layers,
  Award
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { project, phases, toggleDeliverable, signOffPhase, currentRole } = useProject();

  const handleSignOff = (phaseId: number) => {
    signOffPhase(phaseId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Academic Milestones & Gantt Roadmap</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Sequential defense gates, deliverable checklists, and institutional adviser sign-offs
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <Award size={14} />
            Target Final Defense: {project.targetDefenseDate}
          </span>
        </div>
      </div>

      {/* Visual Phase Flow Bar (Gantt Progress) */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '16px' }}>
          Capstone Phased Lifecycle
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {phases.map(phase => {
            const isCurrent = phase.id === project.currentPhaseId;
            return (
              <div 
                key={phase.id}
                style={{
                  background: isCurrent ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  border: '1px solid',
                  borderColor: isCurrent ? 'var(--primary)' : 'var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCurrent ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                    PHASE {phase.id}
                  </span>
                  <span className={`badge ${phase.status === 'completed' ? 'badge-success' : isCurrent ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.62rem' }}>
                    {phase.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', minHeight: '38px', lineHeight: 1.25 }}>
                  {phase.title.split(':')[1]?.trim() || phase.title}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Target: {phase.targetDate}
                </div>

                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${phase.progressPercentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Phase Cards & Deliverables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {phases.map(phase => {
          const isCurrent = phase.id === project.currentPhaseId;
          const completedDeliverables = phase.keyDeliverables.filter(d => d.completed).length;
          const totalDeliverables = phase.keyDeliverables.length;

          return (
            <div 
              key={phase.id} 
              className="card"
              style={{
                borderColor: isCurrent ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-card)',
                background: isCurrent ? 'linear-gradient(180deg, rgba(30, 27, 75, 0.25) 0%, var(--bg-card) 100%)' : 'var(--bg-card)'
              }}
            >
              {/* Phase Top Banner */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: phase.status === 'completed' ? '#10b981' : isCurrent ? 'var(--primary)' : 'rgba(148, 163, 184, 0.2)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {phase.status === 'completed' ? <Check size={20} /> : phase.id}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{phase.title}</h3>
                      <span className={`badge ${phase.status === 'completed' ? 'badge-success' : isCurrent ? 'badge-primary' : 'badge-neutral'}`}>
                        {phase.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {phase.description}
                    </p>
                  </div>
                </div>

                {/* Adviser Formal Sign-Off Button / Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {phase.adviserSignOff ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 14px',
                      color: 'var(--success)'
                    }}>
                      <ShieldCheck size={18} />
                      <div style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 800 }}>Adviser Endorsement Signed</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{phase.signedOffDate}</div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSignOff(phase.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                      title="Grant formal approval sign-off for this phase"
                    >
                      <ShieldCheck size={15} style={{ color: 'var(--primary)' }} />
                      <span>Grant Sign-Off</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Deliverable Checklist Grid */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Gate Deliverables Checklist ({completedDeliverables}/{totalDeliverables} Verified)
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                    {phase.progressPercentage}% Complete
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {phase.keyDeliverables.map(item => (
                    <label 
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => toggleDeliverable(phase.id, item.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                          {item.title}
                        </div>
                      </div>
                      {item.requiredForDefense && (
                        <span className="badge badge-warning" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                          Defense Gate
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
