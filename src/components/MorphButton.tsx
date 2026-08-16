import React from 'react';
import { Spinner } from './Spinner';
import { Check } from 'lucide-react';

export type ButtonState = 'idle' | 'loading' | 'success';

interface MorphButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: ButtonState;
  loadingText?: string;
  successText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  children: React.ReactNode;
}

export const MorphButton: React.FC<MorphButtonProps> = ({
  state = 'idle',
  loadingText = 'Saving...',
  successText = 'Done!',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const btnClass = variant === 'primary' 
    ? 'btn-primary' 
    : variant === 'danger' 
    ? 'btn-danger' 
    : variant === 'success'
    ? 'btn-primary'
    : variant === 'ghost'
    ? 'btn-ghost'
    : 'btn-secondary';

  const sizeStyle: React.CSSProperties = size === 'sm' 
    ? { height: '30px', padding: '0 12px', fontSize: '0.78rem' }
    : size === 'lg'
    ? { height: '40px', padding: '0 18px', fontSize: '0.9rem' }
    : { height: '34px', padding: '0 14px', fontSize: '0.82rem' };

  return (
    <button
      {...props}
      disabled={disabled || state === 'loading'}
      className={`btn ${btnClass} emil-morph-button ${className}`}
      style={{
        ...sizeStyle,
        ...props.style,
        position: 'relative',
        cursor: state === 'loading' ? 'wait' : disabled ? 'not-allowed' : 'pointer',
        transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'opacity 140ms cubic-bezier(0.23, 1, 0.32, 1), transform 140ms cubic-bezier(0.23, 1, 0.32, 1)',
          opacity: 1,
          transform: 'scale(1)'
        }}
      >
        {state === 'loading' ? (
          <>
            <Spinner size={size === 'sm' ? 14 : 16} color="currentColor" />
            <span>{loadingText}</span>
          </>
        ) : state === 'success' ? (
          <>
            <Check size={size === 'sm' ? 14 : 16} style={{ color: 'var(--success)' }} />
            <span>{successText}</span>
          </>
        ) : (
          <>
            {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
            <span>{children}</span>
          </>
        )}
      </div>
    </button>
  );
};
