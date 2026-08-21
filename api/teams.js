// GET /api/teams
// Returns a list of existing team/club names for the registration autocomplete.
// Public endpoint — no auth required (names only, no personal data).

const { getSupabase, send } = require('./_lib');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('registrations')
      .select('club_name')
      .eq('club', 'other')
      .not('club_name', 'is', null)
      .neq('club_name', '')
      .neq('payment_status', 'cancelled');

    if (error) {
      console.error('Teams fetch error:', error);
      return send(res, 500, { error: 'Could not fetch teams.' });
    }

    // Deduplicate, sort, return max 100
    const names = [...new Set(
      (data || [])
        .map(r => (r.club_name || '').trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b)).slice(0, 100);

    return send(res, 200, { teams: names });
  } catch (e) {
    console.error('Teams exception:', e.message);
    return send(res, 500, { error: 'Server error.' });
  }
};
