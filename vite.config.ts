import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'github-oauth-proxy',
        configureServer(server) {
          server.middlewares.use('/api/auth/github', async (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { code } = JSON.parse(body || '{}');
                  const clientId = env.VITE_GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
                  const clientSecret = env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

                  if (!clientId || !clientSecret) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing VITE_GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in .env' }));
                    return;
                  }

                  // Exchange code for access token with GitHub
                  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
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

                  const tokenData = (await tokenRes.json()) as any;

                  if (tokenData && tokenData.access_token) {
                    // Fetch authenticated user profile
                    const userRes = await fetch('https://api.github.com/user', {
                      headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'CapStoneFlow-App'
                      }
                    });
                    const userData = (await userRes.json()) as any;

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      access_token: tokenData.access_token,
                      user: userData
                    }));
                  } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tokenData));
                  }
                } catch (err: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              res.writeHead(405, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            }
          });
        }
      }
    ]
  };
});
