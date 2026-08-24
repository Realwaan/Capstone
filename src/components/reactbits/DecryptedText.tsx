import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number; // ms per iteration
  maxIterations?: number;
  characters?: string;
  className?: string;
  animateOn?: 'view' | 'hover';
  revealDirection?: 'start' | 'end' | 'center';
  style?: CSSProperties;
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * React Bits - DecryptedText
 * High-performance scramble/matrix text decryption effect.
 * Uses requestAnimationFrame with automatic cleanup.
 */
export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = DEFAULT_CHARS,
  className = '',
  animateOn = 'view',
  style
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const animRef = useRef<number | null>(null);

  const startAnimation = useCallback(() => {
    let iteration = 0;
    const totalChars = text.length;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= speed) {
        lastTime = currentTime;

        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < Math.floor((iteration / maxIterations) * totalChars)) {
                return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('');
        });

        iteration++;
      }

      if (iteration <= maxIterations) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [text, speed, maxIterations, characters]);

  useEffect(() => {
    if (animateOn === 'view') {
      startAnimation();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [text, animateOn, startAnimation]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover') {
      setIsHovering(true);
      startAnimation();
    }
  };

  return (
    <span
      className={`decrypted-text ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{
        fontFamily: 'inherit',
        display: 'inline-block',
        ...style
      }}
    >
      {displayText}
    </span>
  );
};
