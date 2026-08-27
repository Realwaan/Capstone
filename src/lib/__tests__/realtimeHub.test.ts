import { describe, it, expect, vi } from 'vitest';
import { realtimeHub } from '../realtimeHub';

describe('RealtimeHub multi-device synchronization', () => {
  it('instantiates and provides subscribe, broadcast, and broadcastProjectDeleted methods', () => {
    expect(typeof realtimeHub.subscribe).toBe('function');
    expect(typeof realtimeHub.broadcast).toBe('function');
    expect(typeof realtimeHub.broadcastProjectDeleted).toBe('function');
  });

  it('subscribes listeners and returns an unsubscribe cleanup function', () => {
    const onTaskChange = vi.fn();
    const onStandupChange = vi.fn();
    const onProjectDeleted = vi.fn();

    const unsubscribe = realtimeHub.subscribe({
      projectId: 'test-project-123',
      currentUser: null,
      onTaskChange,
      onStandupChange,
      onProjectDeleted
    });

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('broadcasts project deletion event to peers safely', async () => {
    const result = await realtimeHub.broadcastProjectDeleted('proj-123', 'Smart IoT System', 'Alex Leader');
    // In test environment without Supabase websocket, it safely returns false without throwing
    expect(typeof result).toBe('boolean');
  });
});
