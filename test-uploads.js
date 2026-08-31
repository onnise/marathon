/**
 * Bikfaya — Direct Upload Size Tests
 * Tests the full 3-step flow: get signed URL → PUT file to Supabase → register
 * Run: node test-uploads.js [BASE_URL]
 *
 * Requires Node 18+ (built-in fetch).
 */

const BASE = process.argv[2] || 'http://localhost:3000';
const TAG  = 'UPLOAD_' + Date.now();

// Build a test buffer of a specific size with a JPEG header so it looks real
function makeTestJpeg(sizeBytes) {
  const buf = Buffer.alloc(sizeBytes, 0x00);
  // JPEG SOI + APP0 marker
  buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
  buf[4] = 0x00; buf[5] = 0x10; // length
  buf[6] = 0x4A; buf[7] = 0x46; buf[8] = 0x49; buf[9] = 0x46; buf[10] = 0x00; // JFIF\0
  // Fill body with varied bytes so it's not all zeros
  for (let i = 20; i < Math.min(sizeBytes, 4096); i++) buf[i] = i % 256;
  return buf;
}

async function getSignedUrl(ext = 'jpg') {
  const res = await fetch(`${BASE}/api/get-upload-url?ext=${ext}`);
  if (!res.ok) {
    const body = await res.text().catch(() => res.status);
    throw new Error(`get-upload-url → ${res.status}: ${body}`);
  }
  return res.json(); // { signedUrl, path }
}

async function putToSupabase(signedUrl, buffer, contentType = 'image/jpeg') {
  const res = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': contentType },
    body:    buffer,
  });
  return res.status;
}

async function register5k(idFilePath, n) {
  const res = await fetch(`${BASE}/api/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      race:           '5k',
      firstName:      `Upload${TAG}`,
      lastName:       `File${n}`,
      dob:            '1988-03-22',
      gender:         'male',
      email:          `upload_${TAG}_${n}@test-bikfaya.invalid`,
      country:        'Lebanon',
      emergencyName:  'Upload Test',
      emergencyPhone: '+961 76000001',
      payMethod:      'omt',
      bloodType:      'B+',
      eliteStatus:    'recreational',
      expectedTime:   '40:00',
      firstRace:      'no',
      idFilePath,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── Test matrix ───────────────────────────────────────────────────────────────
const SIZES = [
  {  mb: 1,   label: ' 1 MB  — small phone photo'     },
  {  mb: 3,   label: ' 3 MB  — typical Android photo' },
  {  mb: 5,   label: ' 5 MB  — typical iPhone photo'  },
  {  mb: 8,   label: ' 8 MB  — high-res iPhone photo' },
  {  mb: 12,  label: '12 MB  — RAW / max iPhone 15'   },
  {  mb: 20,  label: '20 MB  — extreme stress test'   },
];

async function run() {
  console.log(`\n📸  Bikfaya Direct Upload — ${SIZES.length} size tests`);
  console.log(`    Target : ${BASE}\n`);

  let passed = 0, failed = 0;

  for (let i = 0; i < SIZES.length; i++) {
    const { mb, label } = SIZES[i];
    const n   = i + 1;
    const num = String(n).padStart(2, ' ');

    process.stdout.write(`  ⏳ [${num}/${SIZES.length}] ${label} …`);

    try {
      const t0 = Date.now();

      // 1 — get signed URL from our API
      const { signedUrl, path } = await getSignedUrl('jpg');

      // 2 — PUT raw file directly to Supabase Storage
      const buf          = makeTestJpeg(mb * 1024 * 1024);
      const uploadStatus = await putToSupabase(signedUrl, buf);
      if (uploadStatus < 200 || uploadStatus >= 300) {
        throw new Error(`Supabase PUT returned ${uploadStatus}`);
      }

      // 3 — Register with the storage path
      const { status, data } = await register5k(path, n);
      if (status !== 201) {
        throw new Error(`Registration returned ${status}: ${JSON.stringify(data)}`);
      }

      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      passed++;
      process.stdout.write(`\r  ✅ [${num}/${SIZES.length}] ${label}  (${elapsed}s)\n`);

    } catch (err) {
      failed++;
      process.stdout.write(`\r  ❌ [${num}/${SIZES.length}] ${label}\n`);
      console.log(`       ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${passed} passed  |  ${failed} failed  |  ${SIZES.length} total`);
  console.log(`${'─'.repeat(60)}\n`);

  console.log('🧹  Cleanup — run in Supabase SQL Editor:');
  console.log(`    DELETE FROM public.registrations`);
  console.log(`    WHERE email LIKE '%test-bikfaya.invalid%';\n`);
}

run().catch(console.error);
