import crypto from 'node:crypto';
import { readSession } from '../_lib/session.js';

const BOT_TIMEOUT_MS = 15_000;
const ALLOWED_STATUSES = new Set(['backlog', 'todo', 'in_progress', 'peer_review', 'adviser_review', 'done']);

const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json').json(body);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  if (!readSession(req)) {
    return json(res, 401, { error: 'Sign in with GitHub before syncing Discord tickets.' });
  }

  const { CAPSTONE_BOT_URL, CAPSTONE_API_SECRET } = process.env;
  if (!CAPSTONE_BOT_URL || !CAPSTONE_API_SECRET) {
    return json(res, 503, { error: 'CapStoneFlow bot sync is not configured on the server.' });
  }

  const taskId = typeof req.body?.taskId === 'string' ? req.body.taskId.trim() : '';
  const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';
  const actor = typeof req.body?.actor === 'string' ? req.body.actor.trim().slice(0, 100) : 'CapStoneFlow';
  const taskVersion = typeof req.body?.taskVersion === 'string' ? req.body.taskVersion.trim().slice(0, 100) : '';
  if (!taskId || taskId.length > 160 || !ALLOWED_STATUSES.has(status)) {
    return json(res, 400, { error: 'A valid taskId and workflow status are required.' });
  }

  // Default key includes the task version (updatedAt) when available so a task
  // that re-enters the same status later is not deduplicated against a stale
  // delivery record. Retries of one transition keep the same key.
  const idempotencyKey = req.headers['x-idempotency-key']
    || `ticket:status:${taskId}:${status}:${taskVersion || 'v0'}`;
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

  try {
    const response = await fetch(`${CAPSTONE_BOT_URL.replace(/\/$/, '')}/api/capstone/tickets/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Capstone-API-Key': CAPSTONE_API_SECRET,
        'X-Idempotency-Key': String(idempotencyKey).slice(0, 200),
        'X-Correlation-ID': String(correlationId).slice(0, 200)
      },
      body: JSON.stringify({ taskId, status, actor }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(res, response.status >= 500 ? 502 : response.status, {
        error: payload.message || payload.error || 'The Discord ticket status could not be updated.'
      });
    }

    return json(res, 200, {
      ...payload,
      taskId,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      correlationId: String(correlationId)
    });
  } catch (error) {
    console.error('CapStoneFlow Discord status sync failed:', error);
    return json(res, 502, {
      error: error?.name === 'AbortError'
        ? 'The Discord bot took too long to update the ticket.'
        : 'Unable to reach the Discord bot.'
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
