export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { code } = req.body || {};
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

    res.status(200).json({
      access_token: tokenData.access_token,
      user: userData
    });
  } catch (error) {
    console.error('Vercel GitHub OAuth Serverless Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
