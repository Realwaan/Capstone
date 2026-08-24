import crypto from 'node:crypto';
import { issueSessionCookie, sessionCookieHeader } from '../_lib/session.js';
import { parseCookies } from '../_lib/session.js';

const oauthStateCookie = state => [
  `capstone_oauth_state=${state}`,
  'Path=/',
  'Max-Age=600',
  'HttpOnly',
  'Secure',
  'SameSite=Lax'
].join('; ');

const clearOauthStateCookie = () => [
  'capstone_oauth_state=',
  'Path=/',
  'Max-Age=0',
  'HttpOnly',
  'Secure',
  'SameSite=Lax'
].join('; ');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const state = crypto.randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', oauthStateCookie(state));
    res.status(200).json({ state });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { code, state } = req.body || {};
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.status(400).json({ 
        error: 'Missing VITE_GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in Vercel Environment Variables' 
      });
      return;
    }

    if (!code) {
      res.status(400).json({ error: 'Missing authorization code parameter' });
      return;
    }
    const storedState = parseCookies(req.headers.cookie).capstone_oauth_state || '';
    if (!state || !storedState || state.length !== storedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(storedState))) {
      res.status(400).json({ error: 'Invalid or expired OAuth state.' });
      return;
    }

    // 1. Exchange authorization code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData || !tokenData.access_token) {
      res.status(400).json(tokenData || { error: 'Failed to obtain access token from GitHub' });
      return;
    }

    // 2. Fetch user profile from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CapStoneFlow-App'
      }
    });

    const userData = await userResponse.json();
    if (!userResponse.ok || !userData?.id || !userData?.login) {
      res.status(502).json({ error: 'GitHub did not return a valid user profile.' });
      return;
    }

    // If email is null (due to GitHub privacy settings), fetch primary email from /user/emails
    if (!userData.email) {
      try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CapStoneFlow-App'
          }
        });
        const emails = await emailsResponse.json();
        if (Array.isArray(emails)) {
          const primaryEmail = emails.find(e => e.primary && e.verified) || emails.find(e => e.primary) || emails[0];
          if (primaryEmail?.email) {
            userData.email = primaryEmail.email;
          }
        }
      } catch (emailErr) {
        console.warn('Could not fetch user emails:', emailErr);
      }
    }

    const sessionToken = issueSessionCookie(userData);
    res.setHeader('Set-Cookie', [sessionCookieHeader(sessionToken), clearOauthStateCookie()]);
    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Vercel GitHub OAuth Serverless Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
