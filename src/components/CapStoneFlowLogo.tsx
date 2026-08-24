import React, { useState } from 'react';

interface CapStoneFlowLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  onClick?: () => void;
}

export const CapStoneFlowLogo: React.FC<CapStoneFlowLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = false,
  badgeText = 'OS',
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size dimensions mapping
  const sizeMap = {
    xs: { icon: 20, text: '0.84rem', gap: 6, badge: '0.55rem', radius: 5 },
    sm: { icon: 26, text: '0.95rem', gap: 7, badge: '0.58rem', radius: 6 },
    md: { icon: 32, text: '1.1rem', gap: 8, badge: '0.62rem', radius: 8 },
    lg: { icon: 42, text: '1.38rem', gap: 10, badge: '0.68rem', radius: 10 },
    xl: { icon: 56, text: '1.85rem', gap: 12, badge: '0.74rem', radius: 14 }
  };

  const currentSize = sizeMap[size];
  const iconPixel = currentSize.icon;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`capstoneflow-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${currentSize.gap}px`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Official Terminal Squircle Logo with Emil Kowalski Lighting & Physics */}
      <div
        style={{
          width: `${iconPixel}px`,
          height: `${iconPixel}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {/* Ambient Neon Backlight Glow (Emil Kowalski Atmosphere) */}
        <div
          style={{
            position: 'absolute',
            inset: '-25%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(48, 209, 88, 0.5) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 70%)',
            filter: 'blur(8px)',
            opacity: isHovered ? 1 : 0.65,
            transform: isHovered ? 'scale(1.25)' : 'scale(1)',
            transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none'
          }}
        />

        {/* The Official User Logo Image with Emil Kowalski Glass & Specular Framing */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: `${currentSize.radius}px`,
            overflow: 'hidden',
            boxShadow: isHovered 
              ? '0 4px 20px rgba(48, 209, 88, 0.5), 0 0 0 1.5px rgba(48, 209, 88, 0.6)' 
              : '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            transform: isHovered ? 'scale(1.08) translateY(-1px)' : 'scale(1)',
            transition: 'all 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <img
            src="/logo.png"
            alt="CapStoneFlow"
            width={iconPixel}
            height={iconPixel}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Emil Kowalski Specular Highlight Overlay Sweep */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: isHovered ? 1 : 0.7,
              transition: 'opacity 200ms ease'
            }}
          />
        </div>
      </div>

      {/* Typography: CapStoneFlow with Emil Kowalski tracking and dual-tone sheen */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              fontWeight: 800,
              fontSize: currentSize.text,
              letterSpacing: '-0.035em',
              lineHeight: 1,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>CapStone</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #30d158 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginLeft: '1px'
              }}
            >
              Flow
            </span>
          </div>

          {showBadge && (
            <span
              style={{
                fontSize: currentSize.badge,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'rgba(48, 209, 88, 0.12)',
                color: 'var(--primary)',
                border: '1px solid rgba(48, 209, 88, 0.28)',
                letterSpacing: '0.04em',
                lineHeight: 1
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
