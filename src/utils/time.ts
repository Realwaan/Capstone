import { useState, useEffect } from 'react';

/**
 * Parses any date format (ISO string, timestamp, legacy format) safely
 */
export function parseDateSafe(input: string | number | Date | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Direct ISO / parseable string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // Check if timestamp was serialized as milliseconds string
    const num = Number(trimmed);
    if (!isNaN(num) && num > 0) {
      const nd = new Date(num);
      if (!isNaN(nd.getTime())) return nd;
    }
  }

  return null;
}

/**
 * Formats a timestamp into human-friendly relative time (e.g., "Just now", "2m ago", "3h ago", "Yesterday at 4:15 PM")
 */
export function formatRelativeTime(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return 'Just now';

  // If it's a legacy static string like "Just now" without date info, check if it contains a timestamp
  if (typeof dateInput === 'string' && dateInput === 'Just now') {
    return 'Just now';
  }

  const date = parseDateSafe(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : 'Just now';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If date is slightly in future due to clock drift (e.g. within 30s)
  if (diffMs < 0 && diffMs > -30000) {
    return 'Just now';
  }

  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 15) {
    return 'Just now';
  }
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `Yesterday at ${timeStr}`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Format as "MMM d, h:mm a"
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
    ' at ' + 
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Formats full exact date and time for tooltips and detail embeds
 */
export function formatExactTimestamp(dateInput: string | number | Date | undefined | null): string {
  const date = parseDateSafe(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formats date for display like "Aug 15, 2026"
 */
export function formatDisplayDate(dateInput: string | number | Date | undefined | null): string {
  const date = parseDateSafe(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : '';
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * React hook that triggers a refresh tick every interval (default 15s) so relative timestamps update live
 */
export function useLiveTimeRefresh(intervalMs = 15000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
