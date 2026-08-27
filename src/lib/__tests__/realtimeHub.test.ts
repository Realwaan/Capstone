import { describe, it, expect, vi } from 'vitest';
import { realtimeHub } from '../realtimeHub';

describe('RealtimeHub multi-device synchronization', () => {
  it('instantiates and provides subscribe and broadcast methods', () => {
    expect(typeof realtimeHub.subscribe).toBe('function');
    expect(typeof realtimeHub.broadcast).toBe('function');
  });

  it('subscribes listeners and returns an unsubscribe cleanup function', () => {
    const onTaskChange = vi.fn();
    const onStandupChange = vi.fn();

    const unsubscribe = realtimeHub.subscribe({
      projectId: 'test-project-123',
      currentUser: null,
      onTaskChange,
      onStandupChange
    });

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });
});
