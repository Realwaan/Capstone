import crypto from 'node:crypto';

const SESSION_COOKIE = 'capstone_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const base64Url = value => Buffer.from(value).toString('base64url');

const getSessionSecret = () => process.env.CAPSTONE_SESSION_SECRET || '';

const sign = value => crypto
  .createHmac('sha256', getSessionSecret())
  .update(value)
  .digest('base64url');

export const issueSessionCookie = user => {
  const secret = getSessionSecret();
  if (!secret || secret.length < 32) {
    throw new Error('CAPSTONE_SESSION_SECRET must be at least 32 characters.');
  }

  const payload = base64Url(JSON.stringify({
    sub: String(user.id),
    login: String(user.login),
    name: String(user.name || user.login),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  }));
  return `${payload}.${sign(payload)}`;
};

export const parseCookies = header => Object.fromEntries(
  String(header || '')
    .split(';')
    .map(part => part.trim().split('='))
    .filter(parts => parts.length >= 2 && parts[0])
    .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
);

export const readSession = req => {
  const secret = getSessionSecret();
  if (!secret || secret.length < 32) return null;

  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature) return null;

  const expectedSignature = sign(payload);
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.sub || !session.login || Number(session.exp) <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
};

export const sessionCookieHeader = token => [
  `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
  'Path=/',
  `Max-Age=${SESSION_TTL_SECONDS}`,
  'HttpOnly',
  'Secure',
  'SameSite=Lax'
].join('; ');

export const clearSessionCookieHeader = () => [
  `${SESSION_COOKIE}=`,
  'Path=/',
  'Max-Age=0',
  'HttpOnly',
  'Secure',
  'SameSite=Lax'
].join('; ');
