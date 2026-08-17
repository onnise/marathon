// GET /api/admin/export
// Returns a CSV of all registrations.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, send } = require('../_lib');

const CSV_COLUMNS = [
  { key: 'bib_number',        label: 'Bib #' },
  { key: 'registration_code', label: 'Registration Code' },
  { key: 'created_at',        label: 'Registered At' },
  { key: 'race',              label: 'Race' },
  { key: 'payment_status',    label: 'Payment Status' },
  { key: 'first_name',        label: 'First Name' },
  { key: 'last_name',         label: 'Last Name' },
  { key: 'dob',               label: 'Date of Birth' },
  { key: 'gender',            label: 'Gender' },
  { key: 'age_category',      label: 'Age Category' },
  { key: 'email',             label: 'Email' },
  { key: 'country',           label: 'Country' },
  { key: 'blood_type',        label: 'Blood Type' },
  { key: 'club',              label: 'Club/Team' },
  { key: 'club_name',         label: 'Team Name' },
  { key: 'elite_status',      label: 'Elite Status' },
  { key: 'best_5k_time',      label: 'Best 5K Time' },
  { key: 'expected_time',     label: 'Expected Finish Time' },
  { key: 'first_race',        label: 'First Race?' },
  { key: 'emergency_name',    label: 'Emergency Contact' },
  { key: 'emergency_phone',   label: 'Emergency Phone' },
  { key: 'pay_method',        label: 'Payment Method' },
  { key: 'omt_payment_code',  label: 'OMT Payment Code' },
  { key: 'paid_at',           label: 'Paid At' },
  { key: 'id_upload_url',     label: 'ID Upload' },
  { key: 'notes',             label: 'Notes' },
];

function formatValue(key, v) {
  if (v === null || v === undefined) return '';
  if (key === 'created_at' || key === 'paid_at') {
    // Format as YYYY-MM-DD HH:MM for Excel
    const d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  if (key === 'first_race') return v === true || v === 'true' ? 'Yes' : 'No';
  if (key === 'gender') return String(v).charAt(0).toUpperCase() + String(v).slice(1);
  if (key === 'race') return v === '5k' ? '5K Competitive' : '2K Fun Run';
  if (key === 'payment_status') return String(v).charAt(0).toUpperCase() + String(v).slice(1);
  return String(v);
}

function toCsv(rows) {
  const escape = (v) => {
    if (v === '') return '';
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const header = CSV_COLUMNS.map((c) => c.label).join(',');
  const lines  = rows.map((r) =>
    CSV_COLUMNS.map((c) => escape(formatValue(c.key, r[c.key]))).join(',')
  );
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
