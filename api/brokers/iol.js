/**
 * MiFinanzas · Proxy IOL (InvertirOnLine)
 * 
 * Endpoints habilitados:
 * POST /token                        → Login / Refresh token
 * GET  /api/v2/portafolio/argentina  → Posiciones del portafolio
 * GET  /api/v2/estadocuenta          → Saldo en efectivo
 */

const IOL_BASE = 'https://api.invertironline.com';

const ALLOWED = [
  '/token',
  '/api/v2/portafolio/argentina',
  '/api/v2/estadocuenta',
];

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path;
  if (!path) {
    return res.status(400).json({ error: 'Falta parámetro: path', broker: 'iol' });
  }

  const allowed = ALLOWED.some(p => path === p || path.startsWith(p + '?'));
  if (!allowed) {
    return res.status(403).json({ error: 'Endpoint no permitido', broker: 'iol', path });
  }

  try {
    const url = IOL_BASE + path;
    const isLogin = path === '/token';
    const headers = {};

    if (isLogin) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      headers['Content-Type'] = 'application/json';
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
    }

    const options = { method: req.method || 'GET', headers };

    if (req.method === 'POST') {
      const body = req.body || {};
      if (isLogin) {
        // Login normal o refresh token
        const params = new URLSearchParams();
        if (body.grant_type === 'refresh_token') {
          params.append('grant_type', 'refresh_token');
          params.append('refresh_token', body.refresh_token || '');
        } else {
          params.append('grant_type', 'password');
          params.append('username', body.username || '');
          params.append('password', body.password || '');
        }
        options.body = params.toString();
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const iolRes = await fetch(url, options);
    const contentType = iolRes.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await iolRes.json()
      : { raw: await iolRes.text() };

    return res.status(iolRes.status).json(data);

  } catch (err) {
    console.error('[IOL Proxy]', err.message);
    return res.status(500).json({ error: err.message, broker: 'iol' });
  }
};
