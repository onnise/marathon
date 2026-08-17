// GET /api/admin/export
// Returns a CSV of all registrations.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, send } = require('../_lib');

const CSV_COLUMNS = [
  'registration_code','created_at','race','first_name','last_name','dob','gender','age_category',
  'email','country','blood_type','club','club_name','elite_status','best_5k_time','expected_time',
  'first_race','emergency_name','emergency_phone','pay_method','payment_status','omt_payment_code',
  'paid_at','bib_number','notes',
];

function toCsv(rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = CSV_COLUMNS.join(',');
  const lines  = rows.map((r) => CSV_COLUMNS.map((c) => escape(r[c])).join(','));
  return [header, ...lines].join('\r\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });

  if (!verifyAdmin(req)) return send(res, 401, { error: 'Unauthorised.' });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return send(res, 500, { error: 'Database error.' });

  const csv = toCsv(data || []);
  const filename = `bikfaya-race-registrations-${new Date().toISOString().slice(0,10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send('\ufeff' + csv); // BOM for Excel compatibility
};
