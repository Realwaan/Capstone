import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  iconColor?: string;
  badge?: string;
  badgeClass?: string;
}

interface CustomDropdownProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  prefixIcon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  align?: 'left' | 'right';
  minWidth?: string;
  size?: 'sm' | 'md';
}

export function CustomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  prefixIcon: PrefixIcon,
  align = 'left',
  minWidth = '160px',
  size = 'md'
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const height = size === 'sm' ? '30px' : '34px';
  const fontSize = size === 'sm' ? '0.78rem' : '0.82rem';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="custom-dropdown-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          height,
          padding: '0 10px',
          minWidth,
          cursor: 'pointer',
          fontSize,
          userSelect: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-primary)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
          transition: 'all 140ms var(--ease-out)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          {selectedOption?.icon ? (
            <selectedOption.icon
              size={13}
              style={{
                color: selectedOption.iconColor || 'var(--primary)',
                flexShrink: 0
              }}
            />
          ) : PrefixIcon ? (
            <PrefixIcon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          ) : null}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedOption ? selectedOption.label : placeholder || 'Select...'}
          </span>
        </div>

        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms var(--ease-out)'
          }}
        />
      </button>

      {/* Origin-Aware Dropdown Menu */}
      {isOpen && (
        <div
          className={`dropdown-popover ${align === 'left' ? 'origin-left' : ''}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'left' ? 'left' : 'right']: 0,
            minWidth: 'max(100%, ' + minWidth + ')',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1050
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value;
            const OptIcon = opt.icon;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  transition: 'background 120ms var(--ease-out)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {OptIcon && (
                    <OptIcon
                      size={14}
                      style={{
                        color: opt.iconColor || (isSelected ? 'var(--primary)' : 'var(--text-muted)'),
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {opt.badge && (
                    <span className={`badge ${opt.badgeClass || 'badge-neutral'}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
