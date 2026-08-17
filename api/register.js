// POST /api/register
// Validates form data, stores in Supabase, returns registration code.
// Email sending will be added once email credentials are provided.

const { getSupabase, generateRegCode, generateOmtCode, assignAgeCategory, sanitise, send } = require('./_lib');

const PRICES     = { '5k': 25, '2k': 10 };
const MAX_CAP    = 500;
const REG_OPEN   = new Date('2026-08-17T00:00:00+03:00'); // TESTING — change back to Aug 20
const REG_CLOSE  = new Date('2026-09-15T23:59:59+03:00');

module.exports = async function handler(req, res) {
  // CORS — only allow same origin in production
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });

  // Registration window check
  const now = Date.now();
  if (now < REG_OPEN.getTime())  return send(res, 400, { error: 'Registration is not open yet.' });
  if (now > REG_CLOSE.getTime()) return send(res, 400, { error: 'Registration has closed.' });

  const b = req.body;
  if (!b) return send(res, 400, { error: 'Empty request body.' });

  // ── Validate required fields ──────────────────────────
  const required = ['race','firstName','lastName','dob','gender','email','country','firstRace','emergencyName','emergencyPhone','payMethod'];
  for (const f of required) {
    if (!b[f] || String(b[f]).trim() === '') {
      return send(res, 400, { error: `Missing required field: ${f}` });
    }
  }

  const race = b.race;
  if (!['5k', '2k'].includes(race)) return send(res, 400, { error: 'Invalid race selection.' });

  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    return send(res, 400, { error: 'Invalid email address.' });
  }

  // 5K-specific required fields
  if (race === '5k') {
    const r5k = ['bloodType','eliteStatus','expectedTime'];
    for (const f of r5k) {
      if (!b[f] || String(b[f]).trim() === '') {
        return send(res, 400, { error: `Missing required 5K field: ${f}` });
      }
    }
  }

  const supabase = getSupabase();

  // ── Capacity check ────────────────────────────────────
  const { count, error: countErr } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .neq('payment_status', 'cancelled');

  if (countErr) {
    console.error('Capacity check error:', countErr.message);
    return send(res, 500, { error: 'Database error. Please try again.' });
  }
  if (count >= MAX_CAP) return send(res, 409, { error: 'Sorry, the event is now full. You have been added to the waitlist.', waitlist: true });

  // ── Duplicate email check ─────────────────────────────
  const { data: existing } = await supabase
    .from('registrations')
    .select('id')
    .eq('email', b.email.toLowerCase().trim())
    .neq('payment_status', 'cancelled')
    .limit(1);

  if (existing && existing.length > 0) {
    return send(res, 409, { error: 'This email is already registered. Check your inbox for your registration code.' });
  }

  // ── Generate codes ────────────────────────────────────
  let regCode, omtCode;
  let attempts = 0;
  while (attempts < 10) {
    regCode = generateRegCode();
    const { data: clash } = await supabase.from('registrations').select('id').eq('registration_code', regCode).limit(1);
    if (!clash || clash.length === 0) break;
    attempts++;
  }
  omtCode = generateOmtCode();

  // ── Age category (5K only) ────────────────────────────
  const ageCategory = race === '5k' ? assignAgeCategory(b.dob) : null;

  // ── Build record ──────────────────────────────────────
  const record = {
    registration_code:  regCode,
    race,
    first_name:         sanitise(b.firstName),
    last_name:          sanitise(b.lastName),
    dob:                b.dob,
    gender:             b.gender,
    age_category:       ageCategory,
    email:              b.email.toLowerCase().trim(),
    country:            sanitise(b.country),
    first_race:         b.firstRace === 'yes',
    emergency_name:     sanitise(b.emergencyName),
    emergency_phone:    sanitise(b.emergencyPhone),
    pay_method:         b.payMethod || 'omt',
    payment_status:     'pending',
    omt_payment_code:   omtCode,
  };

  if (race === '5k') {
    record.blood_type    = b.bloodType    || null;
    record.club          = b.club         || null;
    record.club_name     = sanitise(b.clubName || '');
    record.elite_status  = b.eliteStatus  || null;
    record.best_5k_time  = b.best5k       || null;
    record.expected_time = b.expectedTime || null;

    // Upload ID file to Supabase Storage
    if (b.idFile && b.idFile.data && b.idFile.name) {
      try {
        const ext      = b.idFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
        const path     = `${regCode}.${ext}`;
        const buffer   = Buffer.from(b.idFile.data, 'base64');
        const { error: uploadErr } = await supabase.storage
          .from('id-documents')
          .upload(path, buffer, { contentType: b.idFile.type, upsert: false });
        if (!uploadErr) {
          record.id_upload_url = path;
        } else {
          console.error('Storage upload error:', uploadErr.message);
        }
      } catch (fileErr) {
        console.error('File processing error:', fileErr.message);
      }
    }
  }

  // ── Insert ────────────────────────────────────────────
  const { data: inserted, error: insertErr } = await supabase
    .from('registrations')
    .insert([record])
    .select('id, registration_code, omt_payment_code, age_category')
    .single();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    return send(res, 500, { error: 'Could not save registration. Please try again.' });
  }

  // ── TODO: Send confirmation emails ───────────────────
  // Email 1: registration confirmation + regCode (needs email service credentials)
  // Email 2: OMT payment code + instructions
  // These will be wired in once RESEND_API_KEY is provided.

  return send(res, 201, {
    success:          true,
    registrationCode: inserted.registration_code,
    omtPaymentCode:   inserted.omt_payment_code,
    ageCategory:      inserted.age_category,
    message:          'Registration successful. Check your email for your OMT payment code.',
  });
};
