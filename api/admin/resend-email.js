// POST /api/admin/resend-email
// Resends either the registration confirmation or the payment confirmed email.
// Protected: requires Authorization: Bearer <ADMIN_TOKEN>

const { getSupabase, verifyAdmin, send, log, getIp, sendEmail } = require('../_lib');
const TAG = 'ADMIN_RESEND';

// ── Registration confirmation email (same template as api/register.js) ────────
function buildRegistrationEmail({ firstName, lastName, race }) {
  const raceName   = race === '5k' ? '5K Competitive' : '2K Fun Run';
  const raceNameAr = race === '5k' ? '5K تنافسي' : '2K مرح';
  const price      = race === '5k' ? '$17 + $3 LAF fee = $20 total' : '$10';
  const siteUrl    = process.env.SITE_URL || 'https://bikfayarace.com';

  const omtBlock = `
    <div style="background:#fff8e1;border:2px solid #e53e3e;border-radius:12px;padding:16px 24px;margin:24px 0 8px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#c53030;">⏳ You have <u>3 days</u> to complete payment to secure your spot.</p>
      <p style="margin:6px 0 0;font-size:13px;color:#744210;">لديك <u>3 أيام</u> لإتمام الدفع وتأكيد مكانك.</p>
    </div>
    <div style="background:#e8f4fd;border:2px solid #1B5EA8;border-radius:12px;padding:24px;margin:8px 0 24px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0D2B5A;">💳 How to Pay / كيفية الدفع</p>
      <p style="margin:0 0 6px;font-size:14px;color:#2d3748;">Visit any <strong>OMT office</strong> and pay using the registered runner's full name.</p>
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#c53030;">⚠️ You must clearly state the registered runner's name: <strong>${firstName} ${lastName}</strong></p>
      <p style="margin:0 0 10px;font-size:14px;color:#2d3748;">توجّه لأي مكتب <strong>OMT</strong> وعند الدفع يجب ذكر اسم المتسابق المسجّل بوضوح: <strong>${firstName} ${lastName}</strong></p>
      <p style="margin:0 0 4px;font-size:13px;color:#2d3748;"><strong>OMT Wallet Holder:</strong> JOSEPH BOU KARAM &nbsp;·&nbsp; Tel. +961 76 892 927</p>
      <p style="margin:0;font-size:13px;color:#718096;">Online payment via OMT coming soon / الدفع الإلكتروني عبر OMT قريباً</p>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Registration Confirmed — Bikfaya Race 2026</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#0D2B5A;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#2BAD6E;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Bikfaya 5K Eco Race 2026</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:800;">Registration Confirmed ✅</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.6);font-size:14px;">تم تأكيد التسجيل</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#2d3748;">
              Hi <strong>${firstName} ${lastName}</strong> 👋<br/>
              <span style="font-size:14px;color:#718096;">مرحباً بك في سباق بكفيا 2026!</span>
            </p>
            <table width="100%" style="border-collapse:collapse;margin:0 0 24px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;width:40%;">Race / السباق</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">${raceName} — ${raceNameAr}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;">Date / التاريخ</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">Sunday, September 20, 2026</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;">Location / الموقع</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">Bikfaya Square</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#718096;">Assembly / التجمّع</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">7:00 AM</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#718096;">Fee / الرسوم</td>
                <td style="padding:10px 0;font-size:14px;font-weight:600;color:#2d3748;">${price}</td>
              </tr>
            </table>
            ${omtBlock}
          </td>
        </tr>
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

// ── Payment confirmed email (same template as api/admin/update.js) ────────────
function buildPaymentEmail({ firstName, lastName, race, bibNumber }) {
  const raceName   = race === '5k' ? '5K Competitive Race' : '2K Fun Run';
  const raceNameAr = race === '5k' ? '5K تنافسي' : '2K مرح';
  const siteUrl    = process.env.SITE_URL || 'https://bikfayarace.com';
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
        <tr>
          <td style="background:#2BAD6E;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Bikfaya Race 2026</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:800;">Payment Confirmed 🎉</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">تم تأكيد الدفع — مرحباً بك في السباق!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#2d3748;">
              Hi <strong>${firstName} ${lastName}</strong> 👋<br/>
              <span style="font-size:14px;color:#718096;">Your spot is officially secured. We can't wait to see you on race day!</span><br/>
              <span style="font-size:13px;color:#718096;">مكانك محجوز رسمياً. نتطلع لرؤيتك يوم السباق!</span>
            </p>
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
            <div style="background:#f0fff4;border:2px solid #2BAD6E;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#276749;">🏃 You're officially in!</p>
              <p style="margin:0 0 6px;font-size:14px;color:#2d3748;">Arrive at <strong>Bikfaya Square</strong> on September 20 — you will be able to collect your bib number on race day.</p>
              <p style="margin:0;font-size:13px;color:#718096;">احضر إلى ساحة بكفيا يوم 20 سبتمبر — ستتمكن من استلام رقم بطاقتك يوم السباق.</p>
            </div>
          </td>
        </tr>
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

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });

  const ip = getIp(req);
  if (!verifyAdmin(req)) {
    log(TAG, 'WARN', 'Unauthorised access attempt', { ip });
    return send(res, 401, { error: 'Unauthorised.' });
  }

  const { id, type } = req.body || {};

  if (!id)   return send(res, 400, { error: 'Registration ID required.' });
  if (!type || !['registration', 'payment'].includes(type)) {
    return send(res, 400, { error: 'type must be "registration" or "payment".' });
  }

  if (!process.env.RESEND_API_KEY) {
    return send(res, 500, { error: 'Email service not configured.' });
  }

  // Fetch registration
  const supabase = getSupabase();
  const { data: r, error: dbErr } = await supabase
    .from('registrations')
    .select('id, first_name, last_name, email, race, bib_number, payment_status, registration_code')
    .eq('id', id)
    .single();

  if (dbErr || !r) {
    log(TAG, 'ERROR', 'Registration not found', { ip, id });
    return send(res, 404, { error: 'Registration not found.' });
  }

  // Guard: payment email only makes sense for confirmed registrations
  if (type === 'payment' && r.payment_status !== 'confirmed') {
    return send(res, 400, { error: 'Payment email can only be sent for confirmed registrations.' });
  }

  let subject, html;
  if (type === 'registration') {
    subject = '✅ Registration Confirmed — Bikfaya Race 2026';
    html    = buildRegistrationEmail({ firstName: r.first_name, lastName: r.last_name, race: r.race });
  } else {
    subject = '🎉 Payment Confirmed — See You at Bikfaya Race 2026!';
    html    = buildPaymentEmail({ firstName: r.first_name, lastName: r.last_name, race: r.race, bibNumber: r.bib_number });
  }

  try {
    await sendEmail({ to: r.email, subject, html });
    log(TAG, 'INFO', 'Email resent', { ip, id, type, email: r.email, reg: r.registration_code });
    return send(res, 200, { success: true });
  } catch (e) {
    log(TAG, 'ERROR', 'Email exception', { ip, id, type, err: e.message });
    return send(res, 500, { error: 'Server error sending email.' });
  }
};
