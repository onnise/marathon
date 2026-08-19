// POST /api/register
// Validates form data, stores in Supabase, sends confirmation email via Resend.

const { getSupabase, generateRegCode, generateOmtCode, assignAgeCategory, sanitise, send } = require('./_lib');
const { Resend } = require('resend');

function buildConfirmationEmail({ firstName, lastName, regCode, omtCode, race, payMethod }) {
  const raceName    = race === '5k' ? '5K Competitive' : '2K Fun Run';
  const raceNameAr  = race === '5k' ? '5K تنافسي' : '2K مرح';
  const price       = race === '5k' ? '$17 + $3 LAF fee = $20 total' : '$10';
  const siteUrl     = process.env.SITE_URL || 'https://bikfayarace.com';

  const omtBlock = `
    <div style="background:#e8f4fd;border:2px solid #1B5EA8;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0D2B5A;">💳 How to Pay / كيفية الدفع</p>
      <p style="margin:0 0 8px;font-size:14px;color:#2d3748;">Visit any <strong>OMT office</strong> and pay using your full name as shown on your registration.</p>
      <p style="margin:0;font-size:14px;color:#2d3748;">توجّه لأي مكتب <strong>OMT</strong> وادفع باستخدام اسمك الكامل كما هو مسجّل.</p>
      <p style="margin:12px 0 0;font-size:13px;color:#718096;">Online payment via OMT coming soon / الدفع الإلكتروني عبر OMT قريباً</p>
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

        <!-- HEADER -->
        <tr>
          <td style="background:#0D2B5A;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#2BAD6E;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Bikfaya 5K Eco Race 2026</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:800;">Registration Confirmed ✅</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.6);font-size:14px;">تم تأكيد التسجيل</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="margin:0 0 20px;font-size:16px;color:#2d3748;">
              Hi <strong>${firstName} ${lastName}</strong> 👋<br/>
              <span style="font-size:14px;color:#718096;">مرحباً بك في سباق بكفيا 2026!</span>
            </p>

            <!-- Registration code -->
            <div style="background:#f7f9fc;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;border:1.5px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:13px;color:#718096;">Your Registration Code / رقم تسجيلك</p>
              <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:3px;color:#1B5EA8;">${regCode}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#a0aec0;">Keep this code — you'll need it on race day</p>
            </div>

            <!-- Race details -->
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
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#2d3748;">Alfa Store, Bikfaya</td>
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

            <!-- OMT Payment -->
            <div style="background:#fff3f3;border-left:4px solid #1B5EA8;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 8px;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#1B5EA8;">⚠️ Payment Required — الدفع مطلوب</p>
              <p style="margin:6px 0 0;font-size:13px;color:#666;">Please complete your OMT payment to confirm your spot.</p>
              <p style="margin:4px 0 0;font-size:13px;color:#666;">يرجى إتمام الدفع عبر OMT لتأكيد مكانك.</p>
            </div>

            ${omtBlock}

            <!-- Race day checklist -->
            <div style="background:#f0fff4;border-radius:12px;padding:20px;margin:24px 0 0;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#276749;">📋 Race Day Checklist / ما تحضره يوم السباق</p>
              <ul style="margin:0;padding:0 0 0 20px;font-size:13px;color:#2d3748;line-height:1.8;">
                <li>This email or your registration code <span style="color:#718096">/ هذا الإيميل أو رقم تسجيلك</span></li>
                <li>Valid ID / هوية سارية</li>
                <li>Comfortable running gear / ملابس رياضية مريحة</li>
                <li>Arrive by <strong>7:00 AM</strong> for kit collection / احضر قبل الساعة 7</li>
              </ul>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f7f9fc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">Questions? Email us at <a href="mailto:bickfaya5krun@gmail.com" style="color:#1B5EA8;">bickfaya5krun@gmail.com</a></p>
            <p style="margin:6px 0 0;font-size:12px;color:#a0aec0;">© 2026 Bikfaya 5K Eco Race · <a href="${siteUrl}" style="color:#a0aec0;">bikfayarace.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const PRICES     = { '5k': 20, '2k': 10 }; // 5K: $17 race fee + $3 LAF fee = $20 total
const MAX_CAP    = 500;
const REG_OPEN   = new Date('2026-08-19T00:00:00+03:00'); // TESTING — change back to Aug 20
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
      console.log('ID file received:', b.idFile.name, 'size ~', Math.round(b.idFile.data.length * 0.75 / 1024), 'KB');
      try {
        const ext      = b.idFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
        const path     = `${regCode}.${ext}`;
        const buffer   = Buffer.from(b.idFile.data, 'base64');
        const { error: uploadErr } = await supabase.storage
          .from('id-documents')
          .upload(path, buffer, { contentType: b.idFile.type, upsert: false });
        if (!uploadErr) {
          record.id_upload_url = path;
          console.log('ID uploaded to storage:', path);
        } else {
          console.error('Storage upload error:', uploadErr.message, '| code:', uploadErr.statusCode);
        }
      } catch (fileErr) {
        console.error('File processing error:', fileErr.message);
      }
    } else {
      console.log('No ID file in payload. idFile present:', !!b.idFile);
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

  // ── Send confirmation email ───────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend    = new Resend(process.env.RESEND_API_KEY);
      const fromAddr  = process.env.EMAIL_FROM || 'Bikfaya Race <noreply@bikfayarace.com>';
      const html      = buildConfirmationEmail({
        firstName: record.first_name,
        lastName:  record.last_name,
        regCode:   inserted.registration_code,
        omtCode:   inserted.omt_payment_code,
        race:      record.race,
        payMethod: record.pay_method,
      });
      const { error: emailErr } = await resend.emails.send({
        from:    fromAddr,
        to:      record.email,
        subject: `✅ Registration Confirmed — Bikfaya Race 2026 | ${inserted.registration_code}`,
        html,
      });
      if (emailErr) console.error('Email send error:', JSON.stringify(emailErr));
      else console.log('Confirmation email sent to', record.email);
    } catch (e) {
      console.error('Email exception:', e.message);
      // Non-fatal — registration already saved, just log and continue
    }
  } else {
    console.warn('RESEND_API_KEY not set — skipping confirmation email');
  }

  return send(res, 201, {
    success:          true,
    registrationCode: inserted.registration_code,
    omtPaymentCode:   inserted.omt_payment_code,
    ageCategory:      inserted.age_category,
    message:          'Registration successful. Check your email for your confirmation.',
  });
};
