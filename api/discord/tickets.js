import crypto from 'node:crypto';
import { readSession } from '../_lib/session.js';

const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json').json(body);
};

const BOT_TIMEOUT_MS = 15_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }

  if (!readSession(req)) {
    return json(res, 401, { error: 'Sign in with GitHub before linking Discord tickets.' });
  }

  const { CAPSTONE_BOT_URL, CAPSTONE_API_SECRET } = process.env;
  if (!CAPSTONE_BOT_URL || !CAPSTONE_API_SECRET) {
    return json(res, 503, { error: 'CapStoneFlow bot sync is not configured on the server.' });
  }

  const task = req.body?.task;
  if (!task?.id || !task?.title || typeof task.id !== 'string' || typeof task.title !== 'string') {
    return json(res, 400, { error: 'A task id and title are required.' });
  }
  if (task.id.length > 160 || task.title.length > 500) {
    return json(res, 400, { error: 'Task id or title is too long.' });
  }

  const idempotencyKey = req.headers['x-idempotency-key'] || `ticket:create:${task.id}`;
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);

  try {
    const response = await fetch(`${CAPSTONE_BOT_URL.replace(/\/$/, '')}/api/capstone/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Capstone-API-Key': CAPSTONE_API_SECRET,
        'X-Idempotency-Key': String(idempotencyKey).slice(0, 200),
        'X-Correlation-ID': String(correlationId).slice(0, 200)
      },
      body: JSON.stringify({ task }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(res, response.status >= 500 ? 502 : response.status, {
        error: payload.message || payload.error || 'The Discord bot rejected the ticket request.'
      });
    }

    const threadId = payload.threadId || payload.channelId;
    if (!threadId || !payload.channelUrl) {
      console.error('CapStoneFlow bot returned an incomplete ticket response:', payload);
      return json(res, 502, { error: 'The Discord bot returned an incomplete ticket link.' });
    }

    return json(res, payload.reused ? 200 : 201, {
      taskId: payload.taskId || task.id,
      guildId: payload.guildId,
      channelId: threadId,
      threadId,
      messageId: payload.messageId,
      channelUrl: payload.channelUrl,
      reused: Boolean(payload.reused),
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      correlationId: String(correlationId)
    });
  } catch (error) {
    console.error('CapStoneFlow bot ticket sync failed:', error);
    return json(res, 502, {
      error: error?.name === 'AbortError'
        ? 'The Discord bot took too long to respond.'
        : 'Unable to reach the Discord bot.'
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
