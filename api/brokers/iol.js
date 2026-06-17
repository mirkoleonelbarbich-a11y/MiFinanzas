/**
 * MiFinanzas · Proxy IOL (InvertirOnLine)
 */

const IOL_BASE = 'https://api.invertironline.com';

const ALLOWED = [
  '/token',
  '/api/v2/portafolio/argentina',
  '/api/v2/estadocuenta',
];

module.exports = async (req, res) => {
  // CORS — siempre primero
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = req.query.path;

  if (!path) {
    return res.status(400).json({ error: 'Falta parámetro: path', broker: 'iol' });
  }

  const allowed = ALLOWED.some(p => path === p || path.startsWith(p + '?'));
  if (!allowed) {
    return res.status(403).json({ error: 'Endpoint no permitido', path });
  }

  // Parsear body de forma robusta
  let body = {};
  if (req.method === 'POST') {
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch {}
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }
  }

  try {
    const url     = IOL_BASE + path;
    const isLogin = path === '/token';
    const headers = {};
    const options = { method: req.method || 'GET', headers };

    if (isLogin) {
      // IOL token endpoint requiere application/x-www-form-urlencoded
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const params = new URLSearchParams();
      if (body.grant_type === 'refresh_token') {
        params.append('grant_type',    'refresh_token');
        params.append('refresh_token', body.refresh_token || '');
      } else {
        params.append('grant_type', 'password');
        params.append('username',   body.username || '');
        params.append('password',   body.password || '');
      }
      options.body = params.toString();
    } else {
      headers['Content-Type'] = 'application/json';
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
    }

    const iolRes = await fetch(url, options);
    const text   = await iolRes.text();

    let data;
    try { data = JSON.parse(text); }
    catch { data = { raw: text }; }

    return res.status(iolRes.status).json(data);

  } catch (err) {
    console.error('[IOL Proxy Error]', err.message);
    return res.status(500).json({ error: err.message, broker: 'iol' });
  }
};
