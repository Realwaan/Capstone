import React, { useEffect, useRef, useMemo } from 'react';
import { createTimeline, utils } from 'animejs';
import { useProject } from '../context/ProjectContext';
import { CountUp } from './reactbits';
import { Trophy, Zap, Target, Calendar } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LeaderboardEntry {
  memberId: string;
  name: string;
  avatar: string;
  roleTitle: string;
  color: string;
  doneTickets: number;
  storyPoints: number;
  standupCount: number;
  score: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// Leaderboard computation — pure function, no side effects
// ---------------------------------------------------------------------------
function computeLeaderboard(
  members: ReturnType<typeof useProject>['members'],
  tasks: ReturnType<typeof useProject>['tasks'],
  standups: ReturnType<typeof useProject>['standups']
): LeaderboardEntry[] {
  return members
    .filter((m) => m.role !== 'adviser')
    .map((m) => {
      const doneTasks = tasks.filter(
        (t) => t.status === 'done' && t.assigneeId === m.id
      );
      const doneTickets = doneTasks.length;
      const storyPoints = doneTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
      const standupCount = standups.filter((s) => s.memberId === m.id).length;
      // Composite score: tickets carry most weight, story points reward complexity, standups reward consistency
      const score = doneTickets * 3 + storyPoints * 1 + Math.min(standupCount, 30) * 0.5;
      return {
        memberId: m.id,
        name: m.name,
        avatar: m.avatar,
        roleTitle: m.roleTitle,
        color: m.color,
        doneTickets,
        storyPoints,
        standupCount,
        score,
        rank: 0,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

// ---------------------------------------------------------------------------
// Medal palette — muted, DESIGN.md-compliant (no neon)
// ---------------------------------------------------------------------------
const MEDALS: Record<number, { color: string; glow: string; label: string; height: number }> = {
  1: { color: '#D4A843', glow: 'rgba(212,168,67,0.35)', label: '1st', height: 168 },
  2: { color: '#8E99AA', glow: 'rgba(142,153,170,0.28)', label: '2nd', height: 120 },
  3: { color: '#A0714C', glow: 'rgba(160,113,76,0.28)', label: '3rd', height: 90 },
};

// ---------------------------------------------------------------------------
// PodiumColumn — top-3 elevated platform columns
// ---------------------------------------------------------------------------
interface PodiumColumnProps {
  entry: LeaderboardEntry;
  animClass: string;
  prefersReduced: boolean;
}

const PodiumColumn: React.FC<PodiumColumnProps> = ({ entry, animClass, prefersReduced }) => {
  const medal = MEDALS[entry.rank];
  const isFirst = entry.rank === 1;

  return (
    <div
      className={animClass}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        opacity: prefersReduced ? 1 : 0,
        transform: prefersReduced ? 'none' : 'translateY(40px)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Crown ring for 1st place */}
      {isFirst && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <Trophy
            size={18}
            style={{
              color: medal.color,
              filter: `drop-shadow(0 0 8px ${medal.glow})`,
              animation: prefersReduced ? 'none' : 'podiumTrophyPulse 2.4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Avatar with rotating conic halo */}
      <div style={{ position: 'relative', flexShrink: 0, marginTop: isFirst ? '14px' : '0' }}>
        <div
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '14px',
            background: `conic-gradient(from 0deg, ${medal.color}, transparent 60%, ${medal.color})`,
            opacity: isFirst ? 0.7 : 0.45,
            animation: prefersReduced ? 'none' : `spin ${isFirst ? '5s' : '8s'} linear infinite`,
          }}
        />
        <img
          src={entry.avatar}
          alt={entry.name}
          style={{
            width: isFirst ? '52px' : '44px',
            height: isFirst ? '52px' : '44px',
            borderRadius: '12px',
            objectFit: 'cover',
            border: '2px solid #0d1321',
            position: 'relative',
            zIndex: 1,
            display: 'block',
          }}
        />
        {/* Rank badge — precision glass chip */}
        <span
          style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            fontSize: '0.6rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            padding: '3px 7px',
            borderRadius: '7px',
            // Obsidian glass body
            background: 'rgba(8, 9, 12, 0.92)',
            // Hairline medal-tinted border + top specular edge
            border: `1px solid ${medal.color}55`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.13), 0 2px 8px rgba(0,0,0,0.55), 0 0 0 1px ${medal.color}18`,
            color: medal.color,
            zIndex: 2,
            lineHeight: 1.4,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {medal.label}
        </span>
      </div>

      {/* Name + role */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: isFirst ? '0.88rem' : '0.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100px',
          }}
        >
          {entry.name.split(' ')[0]}
        </div>
        <div
          style={{
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.roleTitle}
        </div>
      </div>

      {/* Score counter + platform */}
      <div
        style={{
          width: isFirst ? '110px' : '96px',
          height: `${medal.height}px`,
          borderRadius: '12px 12px 0 0',
          background: 'var(--bg-card)',
          border: `1px solid ${medal.color}35`,
          borderBottom: 'none',
          boxShadow: `0 -4px 32px ${medal.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle mesh grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${medal.color}08 1px, transparent 1px), linear-gradient(90deg, ${medal.color}08 1px, transparent 1px)`,
            backgroundSize: '18px 18px',
            pointerEvents: 'none',
          }}
        />
        {/* Ticket count — primary metric */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <CountUp
            to={entry.doneTickets}
            duration={1.4}
            style={{
              fontSize: isFirst ? '2rem' : '1.6rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              color: medal.color,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              filter: `drop-shadow(0 0 12px ${medal.glow})`,
            }}
          />
          <div
            style={{
              fontSize: '0.58rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '3px',
            }}
          >
            tickets
          </div>
        </div>

        {/* Stat pills row */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 6px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '5px',
              background: `${medal.color}15`,
              border: `1px solid ${medal.color}28`,
              color: medal.color,
              whiteSpace: 'nowrap',
            }}
          >
            {entry.storyPoints} pts
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '5px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.standupCount}d
          </span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// LeaderboardRow — 4th place and below
// ---------------------------------------------------------------------------
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  animClass: string;
  prefersReduced: boolean;
  index: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  animClass,
  prefersReduced,
  index,
}) => {
  return (
    <div
      className={animClass}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        opacity: prefersReduced ? 1 : 0,
        transform: prefersReduced ? 'none' : 'translateY(16px)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Rank chip — monospace glass badge */}
      <div
        style={{
          fontSize: '0.68rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 900,
          letterSpacing: '-0.01em',
          minWidth: '28px',
          textAlign: 'center',
          flexShrink: 0,
          padding: '3px 6px',
          borderRadius: '7px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 4px rgba(0,0,0,0.1)',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <img
        src={entry.avatar}
        alt={entry.name}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          objectFit: 'cover',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      />

      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.name}
        </div>
        <div
          style={{
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '1px',
          }}
        >
          {entry.roleTitle}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Target size={11} style={{ color: '#30D158', opacity: 0.8 }} />
          <CountUp
            to={entry.doneTickets}
            duration={1.2 + index * 0.08}
            style={{
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: '#30D158',
              letterSpacing: '-0.02em',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={11} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '-0.01em',
            }}
          >
            {entry.storyPoints}pt
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={11} style={{ color: 'var(--text-muted)', opacity: 0.8 }} />
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            {entry.standupCount}d
          </span>
        </div>
      </div>

      {/* Score chip */}
      <span
        style={{
          fontSize: '0.64rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 900,
          padding: '3px 8px',
          borderRadius: '6px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          flexShrink: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {Math.round(entry.score)}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main StandupPodium
// ---------------------------------------------------------------------------
export const StandupPodium: React.FC = () => {
  const { members, tasks, standups } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const leaderboard = useMemo(
    () => computeLeaderboard(members, tasks, standups),
    [members, tasks, standups]
  );

  const podiumOrder = useMemo(() => {
    // Podium visual order: 2nd | 1st | 3rd
    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) return [];
    if (top3.length === 1) return [top3[0]];
    if (top3.length === 2) return [top3[1], top3[0]];
    return [top3[1], top3[0], top3[2]];
  }, [leaderboard]);

  const restEntries = useMemo(() => leaderboard.slice(3), [leaderboard]);

  // ---------------------------------------------------------------------------
  // Anime.js entrance timeline
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (prefersReduced || hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const tl = createTimeline({});

    // Phase 1: backdrop shimmer fade
    tl.add('.podium-backdrop', {
      opacity: [0, 1],
      duration: 280,
      ease: 'outExpo',
    });

    // Phase 2: 2nd place rises (left)
    tl.add('.podium-col-2', {
      translateY: ['60px', '0px'],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 700,
    }, '-=100');

    // Phase 3: 1st place rises tallest (center) — dramatic emphasis
    tl.add('.podium-col-1', {
      translateY: ['80px', '0px'],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 800,
    }, '-=550');

    // Phase 4: 3rd place rises (right)
    tl.add('.podium-col-3', {
      translateY: ['50px', '0px'],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 640,
    }, '-=650');

    // Phase 5: stat legend fade in
    tl.add('.podium-legend', {
      opacity: [0, 1],
      translateY: ['8px', '0px'],
      duration: 360,
      ease: 'outExpo',
    }, '-=200');

    // Phase 6: leaderboard rows slide in with stagger
    tl.add('.lb-row', {
      translateY: ['20px', '0px'],
      opacity: [0, 1],
      duration: 420,
      ease: 'outExpo',
      delay: utils.stagger(55),
    }, '-=150');
  }, [prefersReduced]);

  // Empty state
  if (leaderboard.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          gap: '12px',
          color: '#575B63',
        }}
      >
        <Trophy size={36} style={{ opacity: 0.3 }} />
        <div
          style={{
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}
        >
          No team members yet. Rankings will appear once the team is set up.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div
        className="podium-backdrop"
        style={{
          opacity: prefersReduced ? 1 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Sprint Achievement Ranking
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
            }}
          >
            Score = (tickets × 3) + story points + standups
          </div>
        </div>
        <div
          style={{
            fontSize: '0.64rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '7px',
            background: 'rgba(48,209,88,0.10)',
            border: '1px solid rgba(48,209,88,0.22)',
            color: 'var(--success)',
            flexShrink: 0,
          }}
        >
          {leaderboard.length} members
        </div>
      </div>

      {/* Podium Stage */}
      {podiumOrder.length > 0 && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '8px',
            padding: '32px 0 0',
            borderRadius: '16px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow floor */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '40px',
              background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {podiumOrder.map((entry) => (
            <div
              key={entry.memberId}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <PodiumColumn
                entry={entry}
                animClass={`podium-col-${entry.rank}`}
                prefersReduced={prefersReduced}
              />
            </div>
          ))}
        </div>
      )}

      {/* Stat Legend */}
      <div
        className="podium-legend"
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: prefersReduced ? 1 : 0,
        }}
      >
        {[
          { icon: Target, color: 'var(--success)', label: 'Done Tickets ×3' },
          { icon: Zap, color: 'var(--info)', label: 'Story Points ×1' },
          { icon: Calendar, color: 'var(--text-muted)', label: 'Standups ×0.5' },
        ].map(({ icon: Icon, color, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.67rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Icon size={10} style={{ color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Remaining rows (4th+) */}
      {restEntries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: '4px',
              paddingLeft: '2px',
            }}
          >
            Full Rankings
          </div>
          {restEntries.map((entry, idx) => (
            <LeaderboardRow
              key={entry.memberId}
              entry={entry}
              animClass="lb-row"
              prefersReduced={prefersReduced}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};
