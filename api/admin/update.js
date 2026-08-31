// PATCH /api/admin/update
// Updates payment status or adds notes on a registration.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, sanitise, send, log, getIp } = require('../_lib');
const TAG = 'ADMIN_UPDATE';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'PATCH') return send(res, 405, { error: 'Method not allowed.' });

  const ip = getIp(req);
  if (!verifyAdmin(req)) { log(TAG,'WARN','Unauthorised access attempt',{ip}); return send(res, 401, { error: 'Unauthorised.' }); }

  const { id, payment_status, bib_number, notes } = req.body || {};

  if (!id) return send(res, 400, { error: 'Registration ID required.' });

  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (payment_status && !allowed.includes(payment_status)) {
    return send(res, 400, { error: 'Invalid payment_status value.' });
  }

  const updates = {};
  if (payment_status !== undefined) {
    updates.payment_status = payment_status;
    if (payment_status === 'confirmed') updates.paid_at = new Date().toISOString();
    if (payment_status === 'pending')   updates.paid_at = null;
  }
  if (bib_number !== undefined) updates.bib_number = bib_number ? parseInt(bib_number, 10) : null;
  if (notes      !== undefined) updates.notes = sanitise(notes);

  if (Object.keys(updates).length === 0) return send(res, 400, { error: 'Nothing to update.' });

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('registrations')
    .update(updates)
    .eq('id', id)
    .select('id, registration_code, payment_status, bib_number, notes')
    .single();

  if (error) {
    log(TAG,'ERROR','Update failed',{ip,id,err:error.message,code:error.code});
    return send(res, 500, { error: 'Database error.' });
  }

  log(TAG,'INFO','Registration updated',{ip,id,status:payment_status,bib:bib_number});
  return send(res, 200, { success: true, registration: data });
};
