import React, { useRef, useState, useCallback, CSSProperties } from 'react';

interface MagnetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  magnetStrength?: number; // lower is stronger, e.g. 3 is subtle, 1.5 is strong
  activeDistance?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * React Bits - Magnet
 * Physics-based magnetic attraction effect for buttons & interactive elements.
 * Uses hardware transform with smooth spring curve release.
 */
export const Magnet: React.FC<MagnetProps> = ({
  children,
  magnetStrength = 3,
  activeDistance = 80,
  className = '',
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.hypot(distX, distY);

    if (distance < activeDistance) {
      setPosition({
        x: distX / magnetStrength,
        y: distY / magnetStrength
      });
    }
  }, [magnetStrength, activeDistance]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`magnet-wrapper ${className}`}
      style={{
        display: 'inline-block',
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered 
          ? 'transform 100ms cubic-bezier(0.25, 1, 0.5, 1)' 
          : 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
