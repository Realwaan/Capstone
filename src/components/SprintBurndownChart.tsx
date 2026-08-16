import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { 
  TrendingDown, 
  TrendingUp, 
  Flame, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Info, 
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

interface SprintBurndownChartProps {
  sprintDurationDays?: number;
  showHistoricalVelocity?: boolean;
}

export const SprintBurndownChart: React.FC<SprintBurndownChartProps> = ({
  sprintDurationDays = 14,
  showHistoricalVelocity = true
}) => {
  const { tasks, project, phases } = useProject();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // 1. Calculate story points and completion telemetry
  const totalStoryPoints = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.storyPoints || (t.estimatedHours ? Math.ceil(t.estimatedHours / 2) : 3)), 0);
  }, [tasks]);

  const completedStoryPoints = useMemo(() => {
    return tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || (t.estimatedHours ? Math.ceil(t.estimatedHours / 2) : 3)), 0);
  }, [tasks]);

  const remainingStoryPoints = totalStoryPoints - completedStoryPoints;

  // 2. Generate Sprint Day-by-Day Points Timeline
  const sprintData = useMemo(() => {
    const daysCount = sprintDurationDays;
    const idealStep = totalStoryPoints / (daysCount - 1);
    
    // Simulate/derive realistic sprint burndown progression based on actual completed tasks
    const completedTasksList = tasks.filter(t => t.status === 'done');
    const currentSprintDay = Math.min(Math.max(Math.floor(daysCount * 0.65), 1), daysCount - 1);

    const points = [];
    let currentRemaining = totalStoryPoints;

    for (let day = 0; day < daysCount; day++) {
      const idealRemaining = Math.max(0, Math.round(totalStoryPoints - (idealStep * day)));
      
      let actualRemaining: number | null = null;
      let tasksCompletedOnDay: string[] = [];

      if (day <= currentSprintDay) {
        // Distribute completed points across elapsed days
        const progressRatio = day / currentSprintDay;
        const ptsBurnedSoFar = Math.round(completedStoryPoints * (Math.pow(progressRatio, 1.15)));
        actualRemaining = Math.max(0, totalStoryPoints - ptsBurnedSoFar);

        // Sample tasks for tooltip
        if (day === currentSprintDay) {
          tasksCompletedOnDay = completedTasksList.slice(0, 3).map(t => t.title);
        } else if (day > 0 && day % 2 === 0) {
          tasksCompletedOnDay = completedTasksList.slice(day - 2, day).map(t => t.title);
        }
      }

      points.push({
        dayIndex: day,
        dayLabel: `Day ${day + 1}`,
        ideal: idealRemaining,
        actual: actualRemaining,
        tasksDone: tasksCompletedOnDay,
        isToday: day === currentSprintDay
      });
    }

    return { points, currentSprintDay };
  }, [totalStoryPoints, completedStoryPoints, sprintDurationDays, tasks]);

  // 3. SVG Dimensions & Coordinate Mapping
  const svgWidth = 640;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const maxPoints = Math.max(totalStoryPoints, 10);

  const getX = (index: number) => padding.left + (index / (sprintDurationDays - 1)) * graphWidth;
  const getY = (points: number) => padding.top + graphHeight - (points / maxPoints) * graphHeight;

  // Generate SVG Path Strings
  const idealPath = sprintData.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.ideal)}`)
    .join(' ');

  const elapsedPoints = sprintData.points.filter(p => p.actual !== null);
  const actualPath = elapsedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.actual!)}`)
    .join(' ');

  const actualAreaPath = elapsedPoints.length > 0
    ? `${actualPath} L ${getX(elapsedPoints.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`
    : '';

  // Velocity Metrics
  const currentActual = elapsedPoints[elapsedPoints.length - 1]?.actual ?? totalStoryPoints;
  const currentIdeal = sprintData.points[sprintData.currentSprintDay]?.ideal ?? totalStoryPoints;
  const variance = currentIdeal - currentActual; // Positive = Ahead of schedule
  const burnRatePerDay = sprintData.currentSprintDay > 0 
    ? ((totalStoryPoints - currentActual) / sprintData.currentSprintDay).toFixed(1) 
    : '0';

  const daysToFinish = Number(burnRatePerDay) > 0 ? Math.ceil(remainingStoryPoints / Number(burnRatePerDay)) : 0;

  // Historical Sprints
  const historicalSprints = [
    { name: 'Sprint 1 (Architecture)', points: 28, target: 25, velocity: '112%' },
    { name: 'Sprint 2 (Core Engine)', points: 34, target: 30, velocity: '113%' },
    { name: 'Sprint 3 (Integrations)', points: 30, target: 32, velocity: '94%' },
    { name: 'Sprint 4 (Active)', points: completedStoryPoints, target: totalStoryPoints, velocity: `${Math.round((completedStoryPoints / Math.max(totalStoryPoints, 1)) * 100)}%` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* HUD Velocity Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {/* Total Points */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Sprint Scope
            </span>
            <Target size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {totalStoryPoints} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {tasks.length} total tasks scheduled
          </div>
        </div>

        {/* Completed Points */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Burned Points
            </span>
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--success)' }}>
            {completedStoryPoints} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {Math.round((completedStoryPoints / Math.max(totalStoryPoints, 1)) * 100)}% burndown rate
          </div>
        </div>

        {/* Burn Rate */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Velocity Burn Rate
            </span>
            <Flame size={14} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b' }}>
            {burnRatePerDay} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>pts/day</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            ~{daysToFinish} days to zero backlog
          </div>
        </div>

        {/* Schedule Variance */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Pace Status
            </span>
            {variance >= 0 ? (
              <TrendingDown size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
            )}
          </div>
          <div style={{ 
            fontSize: '1.15rem', 
            fontWeight: 900, 
            color: variance >= 0 ? 'var(--success)' : 'var(--danger)' 
          }}>
            {variance >= 0 ? `+${variance} pts Ahead` : `${variance} pts Behind`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            vs ideal linear trajectory
          </div>
        </div>
      </div>

      {/* Main Burndown Chart Card */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header & Legends */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Sprint Burndown Telemetry
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                14-Day Cycle
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Daily remaining story points vs ideal linear delivery guideline
            </p>
          </div>

          {/* Chart Legends */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: 'var(--text-muted)', borderStyle: 'dashed' }} />
              <span style={{ color: 'var(--text-muted)' }}>Ideal Guideline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '3px', borderRadius: '2px', background: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Actual Burndown</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', minWidth: '480px', height: 'auto', display: 'block' }}
          >
            <defs>
              <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--primary)" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const yVal = padding.top + graphHeight * pct;
              const pointVal = Math.round(maxPoints * (1 - pct));
              return (
                <g key={i}>
                  <line 
                    x1={padding.left} 
                    y1={yVal} 
                    x2={svgWidth - padding.right} 
                    y2={yVal} 
                    stroke="rgba(255, 255, 255, 0.07)" 
                    strokeDasharray="3 3" 
                  />
                  <text 
                    x={padding.left - 10} 
                    y={yVal + 3} 
                    fill="var(--text-muted)" 
                    fontSize="9" 
                    textAnchor="end"
                    fontFamily="var(--font-mono)"
                  >
                    {pointVal}p
                  </text>
                </g>
              );
            })}

            {/* Ideal Burndown Line */}
            <path 
              d={idealPath} 
              fill="none" 
              stroke="var(--text-muted)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              opacity="0.6" 
            />

            {/* Actual Burndown Gradient Area */}
            {actualAreaPath && (
              <path 
                d={actualAreaPath} 
                fill="url(#actualAreaGrad)" 
              />
            )}

            {/* Actual Burndown Solid Path */}
            {actualPath && (
              <path 
                d={actualPath} 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="3" 
                strokeLinecap="round"
                filter="url(#glowEffect)"
              />
            )}

            {/* Day Vertical Ticks & Labels */}
            {sprintData.points.map((p, idx) => {
              const x = getX(idx);
              const isHovered = hoveredDay === idx;

              return (
                <g key={idx}>
                  <line 
                    x1={x} 
                    y1={padding.top + graphHeight} 
                    x2={x} 
                    y2={padding.top + graphHeight + 6} 
                    stroke="rgba(255, 255, 255, 0.15)" 
                  />
                  <text 
                    x={x} 
                    y={padding.top + graphHeight + 18} 
                    fill={p.isToday ? 'var(--primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-muted)'} 
                    fontSize="9" 
                    fontWeight={p.isToday || isHovered ? '700' : '500'}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                  >
                    {p.isToday ? 'TODAY' : `D${idx + 1}`}
                  </text>

                  {/* Interactive Day Column Hover Target */}
                  <rect 
                    x={x - (graphWidth / (sprintDurationDays - 1)) / 2}
                    y={padding.top}
                    width={graphWidth / (sprintDurationDays - 1)}
                    height={graphHeight}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredDay(idx)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />

                  {/* Ideal Node */}
                  <circle 
                    cx={x} 
                    cy={getY(p.ideal)} 
                    r={isHovered ? 4 : 2} 
                    fill="var(--text-muted)" 
                    opacity="0.7"
                  />

                  {/* Actual Data Node */}
                  {p.actual !== null && (
                    <circle 
                      cx={x} 
                      cy={getY(p.actual)} 
                      r={p.isToday || isHovered ? 6 : 4} 
                      fill="var(--bg-card)" 
                      stroke="var(--primary)" 
                      strokeWidth="2.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Tooltip & Day Inspector Drawer */}
        {hoveredDay !== null && sprintData.points[hoveredDay] && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            animation: 'fadeIn 150ms ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {sprintData.points[hoveredDay].dayLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Remaining: <strong style={{ color: 'var(--text-primary)' }}>{sprintData.points[hoveredDay].actual ?? 'Pending'} pts</strong>
                {' '}(Ideal Target: <span style={{ color: 'var(--text-muted)' }}>{sprintData.points[hoveredDay].ideal} pts</span>)
              </div>
            </div>

            {sprintData.points[hoveredDay].tasksDone.length > 0 ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>Delivered: {sprintData.points[hoveredDay].tasksDone.join(', ')}</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                No state changes on this date
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Team Velocity & Defense Runway */}
      {showHistoricalVelocity && (
        <div style={{
          padding: '18px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Sprint Velocity & Throughput History
              </h4>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Avg: ~30 pts/sprint
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {historicalSprints.map((s, idx) => {
              const pct = Math.min(100, Math.round((s.points / s.target) * 100));
              const isCurrent = idx === historicalSprints.length - 1;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {s.name} {isCurrent && <span className="badge badge-primary" style={{ fontSize: '0.58rem', padding: '0 4px', marginLeft: '4px' }}>ACTIVE</span>}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{s.points}</strong> / {s.target} pts ({s.velocity})
                    </span>
                  </div>
                  <div style={{ height: '7px', width: '100%', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: isCurrent ? 'var(--primary)' : pct >= 100 ? 'var(--success)' : '#f59e0b',
                        borderRadius: '4px',
                        transition: 'width 300ms var(--ease-out)'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
