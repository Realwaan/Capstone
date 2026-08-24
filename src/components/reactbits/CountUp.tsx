import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number; // duration in seconds
  separator?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * React Bits - CountUp
 * Eased number counter animation using requestAnimationFrame and easeOutExpo curve.
 */
export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 1.5,
  separator = ',',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  style
}) => {
  const [count, setCount] = useState(from);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const startVal = from;
    const endVal = to;
    const durationMs = duration * 1000;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const easedProgress = easeOutExpo(progress);

      const current = startVal + (endVal - startVal) * easedProgress;
      setCount(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [to, from, duration]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  };

  return (
    <span className={`count-up tabular-nums ${className}`} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};
