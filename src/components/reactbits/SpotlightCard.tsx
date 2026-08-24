import React, { useRef, useState, useCallback, CSSProperties } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  borderRadius?: string;
  style?: CSSProperties;
}

/**
 * React Bits - SpotlightCard
 * Highly optimized, GPU-accelerated cursor spotlight card.
 * Uses direct CSS custom properties to avoid React re-renders on mousemove.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(48, 209, 88, 0.16)',
  borderColor = 'rgba(48, 209, 88, 0.35)',
  borderRadius = '16px',
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card-container ${className}`}
      style={{
        position: 'relative',
        borderRadius,
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        className="spotlight-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          background: `radial-gradient(420px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 80%)`,
          zIndex: 1
        }}
      />

      {/* Dynamic Border Spotlight Glow */}
      <div
        className="spotlight-border-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius,
          border: `1px solid transparent`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          maskImage: `radial-gradient(280px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), black, transparent)`,
          WebkitMaskImage: `radial-gradient(280px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), black, transparent)`,
          borderColor: borderColor,
          zIndex: 2
        }}
      />

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
