// GET /api/get-upload-url?ext=jpg
// Returns a short-lived Supabase signed upload URL so the browser can PUT the file
// directly to Supabase Storage — bypassing Vercel's 4.5 MB body limit entirely.

const { randomBytes } = require('crypto');
const { getSupabase, send } = require('./_lib');

const CORS = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'pdf'];

module.exports = async (req, res) => {
  const origin = process.env.SITE_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET')    return send(res, 405, { error: 'Method not allowed.' });

  const rawExt = (req.query.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!ALLOWED_EXT.includes(rawExt)) return send(res, 400, { error: 'Invalid file type.' });

  const path = `${randomBytes(16).toString('hex')}.${rawExt}`;

  let supabase;
  try { supabase = getSupabase(); } catch (e) {
    return send(res, 500, { error: 'Server configuration error.' });
  }

  const { data, error } = await supabase.storage
    .from('id-documents')
    .createSignedUploadUrl(path);

  if (error) {
    console.error('createSignedUploadUrl error:', error);
    return send(res, 500, { error: 'Could not prepare upload. Please try again.' });
  }

  return send(res, 200, { signedUrl: data.signedUrl, path });
};
