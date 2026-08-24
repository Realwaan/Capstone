import { DiscordTicketLink, Task } from '../types';

export const isDiscordTicketSyncEnabled = (): boolean =>
  import.meta.env.VITE_DISCORD_TICKET_SYNC === 'true';

const REQUEST_TIMEOUT_MS = 5_000;
const MAX_ATTEMPTS = 2;
const CIRCUIT_FAILURE_THRESHOLD = 2;
const CIRCUIT_COOLDOWN_MS = 60_000;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

const wait = (milliseconds: number): Promise<void> =>
  new Promise(resolve => window.setTimeout(resolve, milliseconds));

const waitBeforeRetry = (attempt: number): Promise<void> => {
  const exponentialDelay = Math.min(8_000, 500 * (2 ** (attempt - 1)));
  const jitter = Math.floor(Math.random() * 350);
  return wait(exponentialDelay + jitter);
};

const ensureCircuitClosed = () => {
  if (Date.now() < circuitOpenUntil) {
    throw new Error('Discord sync is temporarily paused after repeated failures. Try again shortly.');
  }
  if (circuitOpenUntil && Date.now() >= circuitOpenUntil) {
    circuitOpenUntil = 0;
    consecutiveFailures = 0;
  }
};

const recordSuccess = () => {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
};

const recordFailure = () => {
  consecutiveFailures += 1;
  if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
};

const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

export const createDiscordTicket = async (task: Task): Promise<DiscordTicketLink | null> => {
  if (!isDiscordTicketSyncEnabled()) return null;
  ensureCircuitClosed();

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/discord/tickets', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `ticket:create:${task.id}`,
          'X-Correlation-ID': crypto.randomUUID()
        },
        body: JSON.stringify({ task }),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(getErrorMessage(payload, 'The Discord ticket could not be created.'));
        if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) throw error;
        lastError = error;
        await waitBeforeRetry(attempt);
        continue;
      }

      const link = payload as DiscordTicketLink;
      if (!link.channelId || !link.channelUrl) {
        throw new Error('The Discord bot returned an incomplete ticket link.');
      }
      recordSuccess();
      return link;
    } catch (error) {
      const normalizedError = error instanceof DOMException && error.name === 'AbortError'
        ? new Error('The Discord bot took too long to respond.')
        : error instanceof Error
          ? error
          : new Error('Unable to reach the Discord bot.');
      lastError = normalizedError;

      const shouldRetry = attempt < MAX_ATTEMPTS && (
        normalizedError.message.includes('too long') ||
        normalizedError.message.includes('Unable to reach')
      );
      if (!shouldRetry) throw normalizedError;
      await waitBeforeRetry(attempt);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  recordFailure();
  throw lastError || new Error('Discord ticket creation failed.');
};

export const syncDiscordTicketStatus = async (
  task: Task,
  actor?: string,
): Promise<{ syncStatus: 'synced'; lastSyncedAt: string; correlationId?: string } | null> => {
  if (!isDiscordTicketSyncEnabled() || !task.discordTicket?.channelId) return null;
  ensureCircuitClosed();

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    // Include the task's updatedAt timestamp in the key so a task that
    // legitimately re-enters the same status later (e.g. reopened ->
    // in_progress again) gets a fresh key instead of being deduplicated
    // against a stale delivery record. Retries of THIS transition still share
    // the key because updatedAt does not change between attempts.
    const idempotencyKey = `ticket:status:${task.id}:${task.status}:${task.updatedAt || 'v0'}`;

    try {
      const response = await fetch('/api/discord/status', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'X-Correlation-ID': crypto.randomUUID()
        },
        body: JSON.stringify({ taskId: task.id, status: task.status, actor, taskVersion: task.updatedAt || '' }),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(getErrorMessage(payload, 'The Discord ticket status could not be updated.'));
        if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) throw error;
        lastError = error;
        await waitBeforeRetry(attempt);
        continue;
      }

      recordSuccess();
      return payload as { syncStatus: 'synced'; lastSyncedAt: string; correlationId?: string };
    } catch (error) {
      const normalizedError = error instanceof DOMException && error.name === 'AbortError'
        ? new Error('The Discord bot took too long to update the ticket.')
        : error instanceof Error
          ? error
          : new Error('Unable to reach the Discord bot.');
      lastError = normalizedError;
      const shouldRetry = attempt < MAX_ATTEMPTS && (
        normalizedError.message.includes('too long') ||
        normalizedError.message.includes('Unable to reach')
      );
      if (!shouldRetry) throw normalizedError;
      await waitBeforeRetry(attempt);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  recordFailure();
  throw lastError || new Error('Discord ticket status sync failed.');
};
