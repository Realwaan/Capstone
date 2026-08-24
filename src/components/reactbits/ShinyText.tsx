import React, { CSSProperties } from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerColor?: string;
  textColor?: string;
  speed?: number; // duration in seconds
  style?: CSSProperties;
}

/**
 * React Bits - ShinyText
 * Elegant metallic/luminescent sheen moving across typography.
 * GPU-accelerated with pure CSS linear gradient & background-clip.
 */
export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = '',
  shimmerColor = '#ffffff',
  textColor = 'rgba(255, 255, 255, 0.75)',
  speed = 4,
  style
}) => {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        display: 'inline-block',
        backgroundImage: `linear-gradient(120deg, ${textColor} 0%, ${textColor} 35%, ${shimmerColor} 50%, ${textColor} 65%, ${textColor} 100%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shinyTextMove ${speed}s infinite linear`,
        ...style
      }}
    >
      {text}
    </span>
  );
};
