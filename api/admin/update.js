// PATCH /api/admin/update
// Updates payment status or adds notes on a registration.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, sanitise, send, log, getIp } = require('../_lib');
const { Resend } = require('resend');
const TAG = 'ADMIN_UPDATE';

function buildPaymentConfirmedEmail({ firstName, lastName, race, bibNumber, siteUrl }) {
  const raceName   = race === '5k' ? '5K Competitive Race' : '2K Fun Run';
  const raceNameAr = race === '5k' ? '5K تنافسي' : '2K مرح';
  const bibBlock   = bibNumber
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;width:40%;">Bib Number / رقم البطاقة</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:22px;font-weight:800;color:#0D2B5A;">#${bibNumber}</td>
       </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Payment Confirmed — Bikfaya Race 2026</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#2BAD6E;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Bikfaya Race 2026</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:800;">Payment Confirmed 🎉</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">تم تأكيد الدفع — مرحباً بك في السباق!</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="margin:0 0 24px;font-size:16px;color:#2d3748;">
              Hi <strong>${firstName} ${lastName}</strong> 👋<br/>
              <span style="font-size:14px;color:#718096;">Your spot is officially secured. We can't wait to see you on race day!</span><br/>
              <span style="font-size:13px;color:#718096;">مكانك محجوز رسمياً. نتطلع لرؤيتك يوم السباق!</span>
            </p>

            <!-- Race details -->
            <table width="100%" style="border-collapse:collapse;margin:0 0 28px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;width:40%;">Status / الحالة</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#2BAD6E;">✅ Payment Confirmed</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;">Race / السباق</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">${raceName} — ${raceNameAr}</td>
              </tr>
              ${bibBlock}
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;">Date / التاريخ</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">Sunday, September 20, 2026</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#718096;">Location / الموقع</td>
                <td style="padding:10px 0;font-size:14px;font-weight:600;color:#2d3748;">Bikfaya Square</td>
              </tr>
            </table>

            <!-- Welcome message -->
            <div style="background:#f0fff4;border:2px solid #2BAD6E;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#276749;">🏃 You're officially in!</p>
              <p style="margin:0 0 6px;font-size:14px;color:#2d3748;">Arrive at <strong>Bikfaya Square</strong> on September 20 — you will be able to collect your bib number on race day.</p>
              <p style="margin:0;font-size:13px;color:#718096;">احضر إلى ساحة بكفيا يوم 20 سبتمبر — ستتمكن من استلام رقم بطاقتك يوم السباق.</p>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f7f9fc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">Questions? <a href="mailto:bickfaya5krun@gmail.com" style="color:#1B5EA8;">bickfaya5krun@gmail.com</a></p>
            <p style="margin:6px 0 0;font-size:12px;color:#a0aec0;">© 2026 Bikfaya 5K Eco Race · <a href="${siteUrl}" style="color:#a0aec0;">bikfayarace.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
    .select('id, registration_code, payment_status, bib_number, notes, first_name, last_name, email, race')
    .single();

  if (error) {
    log(TAG,'ERROR','Update failed',{ip,id,err:error.message,code:error.code});
    return send(res, 500, { error: 'Database error.' });
  }

  log(TAG,'INFO','Registration updated',{ip,id,status:payment_status,bib:bib_number});

  // ── Send payment confirmed email ──────────────────────────────────────────
  if (payment_status === 'confirmed' && process.env.RESEND_API_KEY) {
    try {
      const resend   = new Resend(process.env.RESEND_API_KEY);
      const fromAddr = process.env.EMAIL_FROM || 'Bikfaya Race <noreply@bikfayarace.com>';
      const html     = buildPaymentConfirmedEmail({
        firstName: data.first_name,
        lastName:  data.last_name,
        race:      data.race,
        bibNumber: data.bib_number,
        siteUrl:   process.env.SITE_URL || 'https://bikfayarace.com',
      });
      const { error: emailErr } = await resend.emails.send({
        from:    fromAddr,
        to:      data.email,
        subject: '🎉 Payment Confirmed — See You at Bikfaya Race 2026!',
        html,
      });
      if (emailErr) log(TAG,'ERROR','Confirmation email failed',{reg:data.registration_code,err:JSON.stringify(emailErr)});
      else          log(TAG,'INFO','Confirmation email sent',{reg:data.registration_code,email:data.email});
    } catch (e) {
      log(TAG,'ERROR','Confirmation email exception',{reg:data.registration_code,err:e.message});
    }
  }

  return send(res, 200, { success: true, registration: data });
};
