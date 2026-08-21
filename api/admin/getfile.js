// GET /api/admin/getfile?path=<storage_path>
// Returns a short-lived signed URL for downloading a participant's ID file.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, send } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  if (!verifyAdmin(req)) return send(res, 401, { error: 'Unauthorised.' });

  const filePath = req.query.path;
  if (!filePath) return send(res, 400, { error: 'Missing path parameter.' });
  // Reject path traversal attempts — only allow safe filename characters
  if (!/^[A-Za-z0-9_\-]+\.[a-z0-9]{2,5}$/.test(filePath)) {
    return send(res, 400, { error: 'Invalid file path.' });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('id-documents')
    .createSignedUrl(filePath, 60 * 10); // 10 minutes

  if (error) return send(res, 500, { error: 'Could not generate download URL.', detail: error.message });

  send(res, 200, { url: data.signedUrl });
};
