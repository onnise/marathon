// Temporary diagnostic endpoint — REMOVE BEFORE LAUNCH
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  const url = process.env.SUPABASE_URL || 'MISSING';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING';

  const info = {
    url_length: url.length,
    url_prefix: url.slice(0, 35),
    key_length: key.length,
    key_prefix: key.slice(0, 12),
  };

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { count, error } = await sb
      .from('registrations')
      .select('id', { count: 'exact', head: true });

    res.status(200).json({
      info,
      supabase_error: error ? { message: error.message, code: error.code, details: error.details, status: error.status } : null,
      count: count ?? null,
      success: !error,
    });
  } catch (e) {
    res.status(200).json({ info, thrown: e.message });
  }
};
