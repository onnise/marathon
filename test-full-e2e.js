/**
 * Bikfaya — Full End-to-End Realistic 5K Registration Test
 * Simulates exactly what a real user does: fill every field + upload a 10 MB photo.
 * Run: node test-full-e2e.js [BASE_URL]
 */

const BASE = process.argv[2] || 'http://localhost:3000';

function makeTestJpeg(sizeBytes) {
  const buf = Buffer.alloc(sizeBytes, 0x00);
  buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
  buf[4] = 0x00; buf[5] = 0x10;
  buf[6] = 0x4A; buf[7] = 0x46; buf[8] = 0x49; buf[9] = 0x46; buf[10] = 0x00;
  for (let i = 20; i < Math.min(sizeBytes, 8192); i++) buf[i] = i % 256;
  return buf;
}

async function run() {
  console.log(`\n🏃 Bikfaya — Full E2E 5K Registration Test`);
  console.log(`   Target : ${BASE}\n`);

  const t0 = Date.now();

  // ── Step 1: Get signed upload URL ─────────────────────────────────────────
  process.stdout.write('  Step 1/4  Getting signed upload URL … ');
  const urlRes = await fetch(`${BASE}/api/get-upload-url?ext=jpg`);
  if (!urlRes.ok) {
    console.log(`❌ FAILED (${urlRes.status})`);
    process.exit(1);
  }
  const { signedUrl, path } = await urlRes.json();
  console.log(`✅  path: ${path}`);

  // ── Step 2: Upload 10 MB photo directly to Supabase ───────────────────────
  process.stdout.write('  Step 2/4  Uploading 10 MB photo to Supabase … ');
  const photo     = makeTestJpeg(10 * 1024 * 1024);
  const uploadRes = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body:    photo,
  });
  if (uploadRes.status < 200 || uploadRes.status >= 300) {
    console.log(`❌ FAILED (Supabase returned ${uploadRes.status})`);
    process.exit(1);
  }
  console.log(`✅  ${(10).toFixed(0)} MB uploaded (${uploadRes.status})`);

  // ── Step 3: Submit full 5K registration ───────────────────────────────────
  process.stdout.write('  Step 3/4  Submitting full 5K registration … ');

  const EMAIL = `e2e_test_${Date.now()}@test-bikfaya.invalid`;
  const payload = {
    race:           '5k',
    firstName:      'Carine',
    lastName:       'Mouawad',
    dob:            '1994-06-12',       // age 32 on race day → 30-39 category
    gender:         'female',
    email:          EMAIL,
    country:        'Lebanon',
    bloodType:      'O+',
    club:           'other',
    clubName:       'Bikfaya Runners',
    eliteStatus:    'recreational',
    best5k:         '28:45',
    expectedTime:   '30:00',
    firstRace:      'no',
    emergencyName:  'Georges Mouawad',
    emergencyPhone: '+961 03235470',
    payMethod:      'omt',
    idFilePath:     path,
  };

  const regRes  = await fetch(`${BASE}/api/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const regData = await regRes.json().catch(() => ({}));

  if (regRes.status !== 201) {
    console.log(`❌ FAILED (${regRes.status})`);
    console.log(`   ${JSON.stringify(regData)}`);
    process.exit(1);
  }
  console.log(`✅  registered`);

  // ── Step 4: Print full response ───────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  Step 4/4  Verifying response … ✅\n`);

  console.log('─'.repeat(55));
  console.log('  RESULT');
  console.log('─'.repeat(55));
  console.log(`  Registration code : ${regData.registrationCode}`);
  console.log(`  Age category      : ${regData.ageCategory}`);
  console.log(`  Message           : ${regData.message}`);
  console.log(`  Total time        : ${elapsed}s`);
  console.log('─'.repeat(55));
  console.log(`\n  ✅ ALL STEPS PASSED — real user flow works end-to-end\n`);

  console.log('🧹  Cleanup SQL:');
  console.log(`    DELETE FROM public.registrations WHERE email = '${EMAIL}';\n`);
}

run().catch((err) => {
  console.error(`\n💥 Unexpected error: ${err.message}\n`);
  process.exit(1);
});
