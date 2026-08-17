// GET /api/admin/registrations
// Returns all registrations (with optional filters).
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, send } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });

  if (!verifyAdmin(req)) return send(res, 401, { error: 'Unauthorised.' });

  const { race, gender, payment_status, country, search, page = 1, per_page = 100 } = req.query;

  const supabase = getSupabase();

  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1);

  if (race           && race !== 'all')           query = query.eq('race', race);
  if (gender         && gender !== 'all')         query = query.eq('gender', gender);
  if (payment_status && payment_status !== 'all') query = query.eq('payment_status', payment_status);
  if (country        && country !== 'all')        query = query.eq('country', country);

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,registration_code.ilike.%${s}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Query error:', error);
    return send(res, 500, { error: 'Database error.' });
  }

  // Get summary stats
  const { data: stats } = await supabase.from('capacity').select('*').single();

  return send(res, 200, { registrations: data || [], total: count, stats: stats || {} });
};
