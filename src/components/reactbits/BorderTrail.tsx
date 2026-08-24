import React, { CSSProperties } from 'react';

interface BorderTrailProps {
  className?: string;
  size?: number; // size of the moving light beam
  duration?: number; // duration of full loop in seconds
  trailColor?: string;
  style?: CSSProperties;
}

/**
 * React Bits - BorderTrail
 * Continuous luminous tracer orbiting around card edges.
 * Pure CSS animated offset path / conic gradient.
 */
export const BorderTrail: React.FC<BorderTrailProps> = ({
  className = '',
  size = 80,
  duration = 6,
  trailColor = '#30d158',
  style
}) => {
  return (
    <div
      className={`border-trail-wrapper ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        overflow: 'hidden',
        zIndex: 0,
        ...style
      }}
    >
      <div
        className="border-trail-beam"
        style={{
          position: 'absolute',
          aspectRatio: '1',
          width: `${size}px`,
          offsetPath: 'rect(0 auto auto 0 round inherit)',
          offsetAnchor: '50% 50%',
          background: `radial-gradient(circle, ${trailColor} 0%, transparent 70%)`,
          animation: `borderTrailLoop ${duration}s linear infinite`,
          filter: 'blur(3px)',
          opacity: 0.8
        }}
      />
    </div>
  );
};
