/**
 * Send payment reminder emails to pending registrations.
 *
 * Usage:
 *   node send-payment-reminders.js            → dry run (preview only, no emails sent)
 *   node send-payment-reminders.js --send      → actually send
 *   node send-payment-reminders.js --send --limit 30   → send to first 30 only
 *
 * Requires .env.local with:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend }       = require('resend');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const FROM_ADDR    = process.env.EMAIL_FROM || 'Bikfaya Race <noreply@bikfayarace.com>';

// ── CLI args ──────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const DRY_RUN   = !args.includes('--send');
const limitArg  = args.indexOf('--limit');
const LIMIT     = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : 50;

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY) {
  console.error('❌  Missing env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const resend = new Resend(RESEND_KEY);

// ── Email template ────────────────────────────────────────────────────────────
function buildReminderEmail(firstName, lastName) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Payment Confirmation Required — Bikfaya Race 2026</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#0D2B5A;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#2BAD6E;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Bikfaya 5K Eco Race 2026</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:800;">⏳ Payment Confirmation Required</h1>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px;font-size:15px;color:#2d3748;line-height:1.7;">

            <p style="margin:0 0 16px;">Dear <strong>${firstName} ${lastName}</strong>,</p>

            <p style="margin:0 0 16px;">We hope you're excited for race day on <strong>September 20, 2026</strong>!</p>

            <p style="margin:0 0 16px;">We noticed that your registration payment has not yet been confirmed in our system.</p>

            <!-- Already paid box -->
            <div style="background:#e8f4fd;border:2px solid #1B5EA8;border-radius:12px;padding:20px 24px;margin:0 0 16px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0D2B5A;">✅ Already paid?</p>
              <p style="margin:0;font-size:14px;color:#2d3748;">Please send us a copy of your payment receipt to:<br/>
              <a href="mailto:bickfaya5krun@gmail.com" style="color:#1B5EA8;font-weight:600;">bickfaya5krun@gmail.com</a></p>
            </div>

            <!-- Not yet paid box -->
            <div style="background:#fff8e1;border:2px solid #e53e3e;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#c53030;">⚠️ Haven't paid yet?</p>
              <p style="margin:0;font-size:14px;color:#2d3748;">Please note that your registration will only be confirmed upon receipt of payment.<br/>
              <strong>Registration closes September 15</strong> — please complete your payment as soon as possible to secure your place.</p>
            </div>

            <p style="margin:0 0 24px;font-size:14px;color:#718096;">
              <strong>OMT Wallet Holder:</strong> JOSEPH BOU KARAM &nbsp;·&nbsp; Tel. +961 76 892 927<br/>
              When paying at any OMT office, clearly state the registered runner's name: <strong>${firstName} ${lastName}</strong>
            </p>

            <p style="margin:0 0 4px;">Thank you and see you on the start line!</p>
            <p style="margin:0 0 24px;">Best regards,</p>

            <p style="margin:0;font-size:14px;color:#2d3748;">
              <strong>Joe Bou Onk</strong><br/>
              Event Coordinator — Bikfaya 5K Eco Race 2026<br/>
              Tel: 03.235470<br/>
              <a href="mailto:bickfaya5krun@gmail.com" style="color:#1B5EA8;">bickfaya5krun@gmail.com</a> &nbsp;·&nbsp;
              <a href="https://bikfayarace.com" style="color:#1B5EA8;">bikfayarace.com</a>
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f7f9fc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">© 2026 Bikfaya 5K Eco Race · <a href="https://bikfayarace.com" style="color:#a0aec0;">bikfayarace.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n📧  Bikfaya — Payment Reminder Emails');
  console.log(`    Mode  : ${DRY_RUN ? '🔍 DRY RUN (no emails sent)' : '🚀 LIVE SEND'}`);
  console.log(`    Limit : ${LIMIT} emails\n`);

  // Fetch pending registrations that haven't received a reminder yet, oldest first
  const { data, error } = await supabase
    .from('registrations')
    .select('id, first_name, last_name, email, race, created_at')
    .eq('payment_status', 'pending')
    .is('reminder_sent_at', null)
    .order('created_at', { ascending: true })
    .limit(LIMIT);

  if (error) { console.error('❌  DB error:', error.message); process.exit(1); }
  if (!data.length) { console.log('✅  No pending registrations found.'); return; }

  console.log(`   Found ${data.length} pending registrations to process:\n`);

  // Preview table
  data.forEach((r, i) => {
    const num  = String(i + 1).padStart(3, ' ');
    const name = `${r.first_name} ${r.last_name}`.padEnd(30, ' ');
    const date = new Date(r.created_at).toLocaleDateString('en-GB');
    console.log(`  [${num}] ${name}  ${r.email}  (registered ${date})`);
  });

  if (DRY_RUN) {
    // Also show total pending (without limit) so you know how many batches remain
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending')
      .is('reminder_sent_at', null);

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  🔍 DRY RUN — ${data.length} would be sent in this batch.`);
    console.log(`  📊 Total pending (no reminder yet): ${count}`);
    console.log(`  Run with --send to actually send them.`);
    console.log(`${'─'.repeat(60)}\n`);
    return;
  }

  // ── Live send (one by one to track per-email errors) ──────────────────────
  console.log('\n  Sending...\n');
  let sent = 0, failed = 0;

  for (const r of data) {
    try {
      const { error: emailErr } = await resend.emails.send({
        from:    FROM_ADDR,
        to:      r.email,
        subject: 'Bikfaya 5K Eco Race 2026 — Payment Confirmation Required',
        html:    buildReminderEmail(r.first_name, r.last_name),
      });

      if (emailErr) {
        console.log(`  ❌  ${r.first_name} ${r.last_name} <${r.email}> — ${JSON.stringify(emailErr)}`);
        failed++;
      } else {
        // Stamp the timestamp so we never resend to this person
        await supabase
          .from('registrations')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', r.id);
        console.log(`  ✅  ${r.first_name} ${r.last_name} <${r.email}>`);
        sent++;
      }
    } catch (e) {
      console.log(`  💥  ${r.first_name} ${r.last_name} <${r.email}> — ${e.message}`);
      failed++;
    }

    // Small pause between sends to avoid rate-limit bursts
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ✅ Sent   : ${sent}`);
  console.log(`  ❌ Failed : ${failed}`);
  console.log(`  📬 Total  : ${data.length}`);
  console.log(`${'─'.repeat(60)}\n`);
}

run().catch(console.error);
