import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const BARS = Array(12).fill(0);

export const Spinner: React.FC<SpinnerProps> = ({
  size = 18,
  color = 'currentColor',
  className = ''
}) => {
  return (
    <div
      className={`emil-spinner-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      aria-label="Loading"
    >
      <div
        className="emil-spinner"
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        {BARS.map((_, i) => (
          <div
            key={`bar-${i}`}
            className="emil-spinner-bar"
            style={{
              position: 'absolute',
              width: '24%',
              height: '8%',
              left: '38%',
              top: '46%',
              background: color,
              borderRadius: '6px',
              transform: `rotate(${i * 30}deg) translate(146%)`,
              animation: 'emilSpin 1.2s linear infinite',
              animationDelay: `${-1.2 + i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
