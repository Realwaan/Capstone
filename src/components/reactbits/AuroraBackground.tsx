import React, { CSSProperties } from 'react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'vibrant';
  style?: CSSProperties;
}

/**
 * React Bits - AuroraBackground
 * Atmospheric moving aurora borealis mesh gradient.
 * Pure CSS with GPU transform composition and hardware layer isolation.
 */
export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = '',
  intensity = 'subtle',
  style
}) => {
  const opacity = intensity === 'vibrant' ? 0.35 : 0.18;

  return (
    <div
      className={`aurora-bg-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Dynamic Aurora Layers */}
      <div
        className="aurora-layer"
        style={{
          position: 'absolute',
          inset: '-50%',
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(48, 209, 88, ${opacity}) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(10, 132, 255, ${opacity}) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, ${opacity * 0.8}) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(6, 182, 212, ${opacity}) 0%, transparent 50%)
          `,
          filter: 'blur(60px)',
          animation: 'auroraRotate 24s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'transform'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
