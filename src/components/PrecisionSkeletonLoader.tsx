import React from 'react';
import { ViewType } from './Sidebar';

interface PrecisionSkeletonLoaderProps {
  view?: ViewType | string;
}

export const PrecisionSkeletonLoader: React.FC<PrecisionSkeletonLoaderProps> = ({ view = 'dashboard' }) => {
  return (
    <div 
      className="precision-skeleton-container"
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        minHeight: '82vh',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Skeleton Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div 
            className="skeleton-shimmer" 
            style={{ 
              width: '260px', 
              height: '28px', 
              borderRadius: '8px' 
            }} 
          />
          <div 
            className="skeleton-shimmer stagger-1" 
            style={{ 
              width: '380px', 
              height: '14px', 
              borderRadius: '6px' 
            }} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            className="skeleton-shimmer stagger-1" 
            style={{ 
              width: '110px', 
              height: '34px', 
              borderRadius: '8px' 
            }} 
          />
          <div 
            className="skeleton-shimmer stagger-2" 
            style={{ 
              width: '130px', 
              height: '34px', 
              borderRadius: '8px' 
            }} 
          />
        </div>
      </div>

      {/* 2. View-Specific Precision Geometries */}
      {view === 'kanban' ? (
        /* KANBAN SKELETON: 4 Swimlanes with task card geometry */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', flex: 1 }}>
          {[
            { titleWidth: '100px', badgeWidth: '24px', count: 3, delay: 'stagger-1' },
            { titleWidth: '120px', badgeWidth: '24px', count: 4, delay: 'stagger-2' },
            { titleWidth: '110px', badgeWidth: '24px', count: 2, delay: 'stagger-3' },
            { titleWidth: '80px', badgeWidth: '24px', count: 3, delay: 'stagger-4' }
          ].map((col, cIdx) => (
            <div 
              key={cIdx} 
              className="card" 
              style={{ 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Lane Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className={`skeleton-shimmer ${col.delay}`} style={{ width: col.titleWidth, height: '16px', borderRadius: '4px' }} />
                <div className={`skeleton-shimmer ${col.delay}`} style={{ width: col.badgeWidth, height: '16px', borderRadius: '9999px' }} />
              </div>

              {/* Task Cards Inside Lane */}
              {Array.from({ length: col.count }).map((_, tIdx) => (
                <div 
                  key={tIdx} 
                  className={`skeleton-shimmer stagger-${(tIdx % 4) + 1}`} 
                  style={{ 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    minHeight: '110px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '45px', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--skeleton-border)' }} />
                  </div>
                  <div style={{ width: '85%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                  <div style={{ width: '60%', height: '10px', borderRadius: '4px', background: 'var(--skeleton-border)', opacity: 0.7 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
                    <div style={{ width: '50px', height: '12px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                    <div style={{ width: '60px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : view === 'timeline' ? (
        /* TIMELINE / GANTT SKELETON */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[1, 2, 3, 4].map(p => (
              <div 
                key={p} 
                className={`skeleton-shimmer stagger-${p}`} 
                style={{ height: '110px', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ width: '70px', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '90%', height: '16px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '50%', height: '12px', borderRadius: '4px', background: 'var(--skeleton-border)', marginTop: 'auto' }} />
              </div>
            ))}
          </div>

          {/* Gantt Chart Matrix Rows */}
          <div className="skeleton-shimmer stagger-2" style={{ height: '380px', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '200px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
            {[1, 2, 3, 4, 5].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '42px', borderBottom: '1px solid var(--skeleton-border)' }}>
                <div style={{ width: '140px', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ flex: 1, position: 'relative', height: '18px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', left: `${r * 15}%`, width: `${30 + r * 5}%`, height: '100%', background: 'var(--skeleton-border)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'manuscript' ? (
        /* MANUSCRIPT SUITE SKELETON */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chapter Selector Strip */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[1, 2, 3, 4, 5].map(ch => (
              <div 
                key={ch} 
                className={`skeleton-shimmer stagger-${ch}`} 
                style={{ width: '160px', height: '62px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} 
              />
            ))}
          </div>

          {/* Dual Split Panes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '520px' }}>
            <div className="skeleton-shimmer stagger-2" style={{ borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', height: '36px', borderRadius: '6px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '100%', height: '400px', borderRadius: '6px', background: 'var(--skeleton-border)' }} />
            </div>
            <div className="skeleton-shimmer stagger-3" style={{ borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '60%', height: '24px', borderRadius: '6px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '90%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '85%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '75%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '40%', height: '20px', borderRadius: '6px', background: 'var(--skeleton-border)', marginTop: '16px' }} />
              <div style={{ width: '95%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              <div style={{ width: '90%', height: '14px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
            </div>
          </div>
        </div>
      ) : view === 'projects' ? (
        /* PROJECTS PORTAL SKELETON */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top 4 Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`skeleton-shimmer stagger-${i}`} 
                style={{ height: '96px', borderRadius: 'var(--radius-md)' }} 
              />
            ))}
          </div>

          {/* Project Workspaces Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {[1, 2, 3].map(card => (
              <div 
                key={card} 
                className={`skeleton-shimmer stagger-${card}`} 
                style={{ 
                  height: '240px', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }} 
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '140px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                  <div style={{ width: '50px', height: '18px', borderRadius: '9999px', background: 'var(--skeleton-border)' }} />
                </div>
                <div style={{ width: '85%', height: '12px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--skeleton-border)', marginTop: 'auto' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--skeleton-border)' }} />
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--skeleton-border)' }} />
                  </div>
                  <div style={{ width: '90px', height: '24px', borderRadius: '6px', background: 'var(--skeleton-border)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DEFAULT BENTO DASHBOARD SKELETON */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 4 Metric Bento Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`skeleton-shimmer stagger-${s}`} 
                style={{ 
                  height: '115px', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }} 
              >
                <div style={{ width: '80px', height: '12px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '120px', height: '26px', borderRadius: '6px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '95px', height: '10px', borderRadius: '4px', background: 'var(--skeleton-border)', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
          
          {/* Main Content Split: 2fr Burndown / 1fr Live Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div 
              className="skeleton-shimmer stagger-2" 
              style={{ 
                height: '380px', 
                borderRadius: 'var(--radius-md)', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }} 
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '180px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
                <div style={{ width: '100px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              </div>
              <div style={{ flex: 1, borderRadius: '8px', background: 'var(--skeleton-border)', opacity: 0.4 }} />
            </div>

            <div 
              className="skeleton-shimmer stagger-3" 
              style={{ 
                height: '380px', 
                borderRadius: 'var(--radius-md)', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }} 
            >
              <div style={{ width: '120px', height: '18px', borderRadius: '4px', background: 'var(--skeleton-border)' }} />
              {[1, 2, 3, 4].map(a => (
                <div key={a} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--skeleton-border)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--skeleton-border)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ width: '80%', height: '12px', borderRadius: '3px', background: 'var(--skeleton-border)' }} />
                    <div style={{ width: '40%', height: '9px', borderRadius: '3px', background: 'var(--skeleton-border)', opacity: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
