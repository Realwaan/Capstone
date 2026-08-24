import { readSession } from '../_lib/session.js';

const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json').json(body);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed' });
  }
  if (!readSession(req)) {
    return json(res, 401, { error: 'Sign in before sending Discord notifications.' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return json(res, 503, { error: 'Discord notifications are not configured on the server.' });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json(res, 400, { error: 'A JSON notification payload is required.' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok && response.status !== 204) {
      return json(res, response.status === 429 ? 429 : 502, { error: 'Discord rejected the notification.' });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Discord notification proxy failed:', error);
    return json(res, 502, { error: 'Unable to reach Discord.' });
  }
}
