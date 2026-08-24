import React from 'react';
import {
  Flame,
  ChevronsUp,
  Equal,
  ArrowDown,
  Code2,
  Server,
  Layout,
  Database,
  FlaskConical,
  Rocket,
  Cpu,
  FileText,
  Sparkles,
  Layers,
  Tag
} from 'lucide-react';
import { TaskPriority, TaskCategory } from '../types';
import { DropdownOption } from './CustomDropdown';

export interface PriorityConfigItem {
  priority: TaskPriority;
  label: string;
  code: 'P0' | 'P1' | 'P2' | 'P3';
  color: string;
  lightColor: string;
  bgSubtle: string;
  borderColor: string;
  badgeClass: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfigItem> = {
  urgent: {
    priority: 'urgent',
    label: 'Urgent',
    code: 'P0',
    color: '#ef4444',
    lightColor: '#b91c1c',
    bgSubtle: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    badgeClass: 'badge-priority-urgent',
    description: 'Blocker / Critical defense deliverable',
    Icon: Flame
  },
  high: {
    priority: 'high',
    label: 'High',
    code: 'P1',
    color: '#f97316',
    lightColor: '#c2410c',
    bgSubtle: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    badgeClass: 'badge-priority-high',
    description: 'High impact / Core feature',
    Icon: ChevronsUp
  },
  medium: {
    priority: 'medium',
    label: 'Medium',
    code: 'P2',
    color: '#eab308',
    lightColor: '#a16207',
    bgSubtle: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.35)',
    badgeClass: 'badge-priority-medium',
    description: 'Standard sprint cadence deliverable',
    Icon: Equal
  },
  low: {
    priority: 'low',
    label: 'Low',
    code: 'P3',
    color: '#94a3b8',
    lightColor: '#475569',
    bgSubtle: 'rgba(148, 163, 184, 0.10)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    badgeClass: 'badge-priority-low',
    description: 'Minor polish / Nice-to-have task',
    Icon: ArrowDown
  }
};

export const PRIORITY_DROPDOWN_OPTIONS: DropdownOption<TaskPriority>[] = [
  {
    value: 'urgent',
    label: 'Urgent',
    icon: Flame,
    iconColor: '#ef4444',
    badge: 'P0',
    badgeClass: 'badge-danger'
  },
  {
    value: 'high',
    label: 'High',
    icon: ChevronsUp,
    iconColor: '#f97316',
    badge: 'P1',
    badgeClass: 'badge-warning'
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: Equal,
    iconColor: '#eab308',
    badge: 'P2',
    badgeClass: 'badge-neutral'
  },
  {
    value: 'low',
    label: 'Low',
    icon: ArrowDown,
    iconColor: '#94a3b8',
    badge: 'P3',
    badgeClass: 'badge-neutral'
  }
];

export const CATEGORY_DROPDOWN_OPTIONS: DropdownOption<TaskCategory>[] = [
  { value: 'code', label: 'Code', icon: Code2, iconColor: 'var(--primary)' },
  { value: 'backend', label: 'Backend', icon: Server, iconColor: '#38bdf8' },
  { value: 'frontend', label: 'Frontend', icon: Layout, iconColor: '#ec4899' },
  { value: 'database', label: 'Database', icon: Database, iconColor: '#a855f7' },
  { value: 'testing', label: 'Testing', icon: FlaskConical, iconColor: '#10b981' },
  { value: 'devops', label: 'DevOps', icon: Rocket, iconColor: '#f59e0b' },
  { value: 'architecture', label: 'Arch', icon: Cpu, iconColor: '#6366f1' },
  { value: 'docs', label: 'Docs', icon: FileText, iconColor: '#94a3b8' }
];

export const TASK_MODAL_CATEGORY_OPTIONS: DropdownOption<TaskCategory>[] = [
  { value: 'code', label: 'Core Implementation', icon: Code2, iconColor: 'var(--primary)' },
  { value: 'backend', label: 'Backend & API', icon: Server, iconColor: '#38bdf8' },
  { value: 'frontend', label: 'Frontend UI/UX', icon: Layout, iconColor: '#ec4899' },
  { value: 'database', label: 'Database & Schema', icon: Database, iconColor: '#a855f7' },
  { value: 'testing', label: 'Testing & QA', icon: FlaskConical, iconColor: '#10b981' },
  { value: 'devops', label: 'DevOps & Infra', icon: Rocket, iconColor: '#f59e0b' },
  { value: 'architecture', label: 'Architecture', icon: Cpu, iconColor: '#6366f1' },
  { value: 'docs', label: 'Tech Docs', icon: FileText, iconColor: '#94a3b8' }
];

export const FILTER_CATEGORY_DROPDOWN_OPTIONS: DropdownOption<string>[] = [
  { value: 'all', label: 'All Categories', icon: Tag, iconColor: 'var(--text-secondary)' },
  { value: 'code', label: 'Feature & Code', icon: Code2, iconColor: 'var(--primary)' },
  { value: 'backend', label: 'Backend & APIs', icon: Server, iconColor: '#38bdf8' },
  { value: 'frontend', label: 'Frontend UI/UX', icon: Layout, iconColor: '#ec4899' },
  { value: 'database', label: 'Database & Schema', icon: Database, iconColor: '#a855f7' },
  { value: 'testing', label: 'Testing & QA', icon: FlaskConical, iconColor: '#10b981' },
  { value: 'devops', label: 'DevOps & Infra', icon: Rocket, iconColor: '#f59e0b' },
  { value: 'architecture', label: 'Architecture', icon: Cpu, iconColor: '#6366f1' },
  { value: 'docs', label: 'Tech Docs', icon: FileText, iconColor: '#94a3b8' }
];

export interface PriorityIconProps {
  priority: TaskPriority;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PriorityIcon({
  priority,
  size = 14,
  className = '',
  style
}: PriorityIconProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.Icon;

  return (
    <Icon
      size={size}
      className={className}
      style={{
        color: config.color,
        flexShrink: 0,
        ...style
      }}
    />
  );
}

export interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'pill' | 'outline' | 'icon-only';
  showLabel?: boolean;
  showCode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PriorityBadge({
  priority,
  size = 'sm',
  variant = 'pill',
  showLabel = true,
  showCode = false,
  className = '',
  style
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.Icon;

  const iconSizes = {
    xs: 10,
    sm: 11,
    md: 13
  };

  const fontSizes = {
    xs: '0.58rem',
    sm: '0.62rem',
    md: '0.72rem'
  };

  const paddings = {
    xs: '1px 5px',
    sm: '1px 6px',
    md: '3px 8px'
  };

  if (variant === 'icon-only') {
    return (
      <span
        title={`${config.label} Priority (${config.code}) - ${config.description}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.color,
          ...style
        }}
        className={className}
      >
        <Icon size={iconSizes[size]} />
      </span>
    );
  }

  return (
    <span
      className={`badge ${config.badgeClass} ${className}`}
      style={{
        fontSize: fontSizes[size],
        padding: paddings[size],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 800,
        letterSpacing: '0.04em',
        flexShrink: 0,
        ...style
      }}
      title={`${config.label} Priority (${config.code}) - ${config.description}`}
    >
      <Icon size={iconSizes[size]} style={{ color: 'currentColor', flexShrink: 0 }} />
      {showCode && <span>{config.code}</span>}
      {showLabel && <span>{config.label.toUpperCase()}</span>}
    </span>
  );
}
