// POST /api/admin/login
// Verifies admin password and returns a session token.

const { send, rateLimitCheck, log, getIp } = require('../_lib');
const TAG = 'ADMIN_LOGIN';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });

  const ip = getIp(req);

  // Rate limit: 5 attempts per IP per 10 minutes
  if (rateLimitCheck(`login:${ip}`, 5, 10 * 60 * 1000)) {
    log(TAG,'WARN','Rate limit hit',{ip});
    return send(res, 429, { error: 'Too many login attempts. Try again in 10 minutes.' });
  }

  const { password } = req.body || {};
  if (!password) { log(TAG,'WARN','No password provided',{ip}); return send(res, 400, { error: 'Password required.' }); }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken    = process.env.ADMIN_TOKEN;

  if (!adminPassword || !adminToken) {
    log(TAG,'ERROR','ADMIN_PASSWORD or ADMIN_TOKEN env var missing',{ip});
    return send(res, 500, { error: 'Admin credentials not configured on the server.' });
  }

  if (password !== adminPassword) {
    log(TAG,'WARN','Wrong password attempt',{ip});
    return send(res, 401, { error: 'Incorrect password.' });
  }

  log(TAG,'INFO','Admin login successful',{ip});
  return send(res, 200, { token: adminToken });
};
