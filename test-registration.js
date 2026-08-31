/**
 * Bikfaya Registration API — Simulation Test Suite
 * Run: node test-registration.js [BASE_URL]
 *
 * Defaults to http://localhost:3000 (vercel dev).
 * For production:  node test-registration.js https://www.bikfayarace.com
 *
 * Creates real DB rows tagged with TEST_ prefix — clean up with the SQL at the end.
 */

const BASE = process.argv[2] || 'http://localhost:3000';
const TAG  = 'TEST_' + Date.now(); // unique tag so we can delete rows after

// Minimal valid 1×1 white JPEG (real parseable file, tiny)
const TINY_JPEG =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH' +
  'BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAAR' +
  'CAABAAEDASIA AhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/' +
  'xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwD' +
  'AQACEQMRAD8AJQAB/9k=';

async function post(path, body) {
  const res  = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── Base payloads ─────────────────────────────────────────────────────────────
function mk2k(n, overrides = {}) {
  return {
    race:           '2k',
    firstName:      `Sim${TAG}`,
    lastName:       `User${n}`,
    dob:            '1992-04-10',
    gender:         'male',
    email:          `sim_${TAG}_${n}@test-bikfaya.invalid`,
    country:        'Lebanon',
    emergencyName:  'Test Contact',
    emergencyPhone: '+961 76000000',
    payMethod:      'omt',
    ...overrides,
  };
}

function mk5k(n, overrides = {}) {
  return {
    race:           '5k',
    firstName:      `Sim${TAG}`,
    lastName:       `Run${n}`,
    dob:            '1990-06-15',
    gender:         'female',
    email:          `sim_${TAG}_5k_${n}@test-bikfaya.invalid`,
    country:        'Lebanon',
    emergencyName:  'Test Contact',
    emergencyPhone: '+961 03235470',
    payMethod:      'omt',
    bloodType:      'O+',
    eliteStatus:    'recreational',
    expectedTime:   '35:00',
    firstRace:      'no',
    ...overrides,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const tests = [
  // ─── 2K happy-path ──────────────────────────────────────────────────────────
  {
    name: '2K · male · Lebanon',
    payload: () => mk2k(1),
    expect: s => s === 201,
  },
  {
    name: '2K · female · UAE',
    payload: () => mk2k(2, { gender: 'female', country: 'United Arab Emirates' }),
    expect: s => s === 201,
  },
  {
    name: '2K · older participant (born 1960)',
    payload: () => mk2k(3, { dob: '1960-11-20', country: 'United States' }),
    expect: s => s === 201,
  },
  {
    name: '2K · minor (born 2012)',
    payload: () => mk2k(4, { dob: '2012-03-05' }),
    expect: s => s === 201,
  },
  {
    name: '2K · Jordan phone prefix',
    payload: () => mk2k(5, { emergencyPhone: '+962 791234567', country: 'Jordan' }),
    expect: s => s === 201,
  },

  // ─── 5K happy-path ──────────────────────────────────────────────────────────
  {
    name: '5K · no ID file (file is client-only required)',
    payload: () => mk5k(1),
    expect: s => s === 201,
  },
  {
    name: '5K · with tiny JPEG idFilePath (mocked path)',
    payload: () => mk5k(2, {
      // Simulating a path that was already uploaded
      idFilePath: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.jpg',
    }),
    expect: s => s === 201,
  },
  {
    name: '5K · firstRace=yes (first-timer)',
    payload: () => mk5k(3, { firstRace: 'yes' }),
    expect: s => s === 201,
  },
  {
    name: '5K · with club name',
    payload: () => mk5k(4, { club: 'other', clubName: 'Bikfaya Runners Club' }),
    expect: s => s === 201,
  },
  {
    name: '5K · elite status',
    payload: () => mk5k(5, { eliteStatus: 'elite', best5k: '18:30', expectedTime: '20:00' }),
    expect: s => s === 201,
  },

  // ─── Duplicate detection ────────────────────────────────────────────────────
  {
    name: 'DUPLICATE · same name + email → 409',
    payload: () => mk2k(1), // exact clone of test 1
    expect: s => s === 409,
  },
  {
    name: 'FAMILY · same email, different name (siblings) → 201',
    payload: () => mk2k(6, {
      lastName:  `Family${TAG}`,
      email:     `sim_${TAG}_1@test-bikfaya.invalid`, // same email as test 1
    }),
    expect: s => s === 201,
  },

  // ─── Validation errors ──────────────────────────────────────────────────────
  {
    name: 'INVALID · empty firstName → 400',
    payload: () => mk2k(7, { firstName: '' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · bad email format → 400',
    payload: () => mk2k(8, { email: 'not-an-email' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · unknown race value → 400',
    payload: () => mk2k(9, { race: '10k' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · missing emergencyPhone → 400',
    payload: () => mk2k(10, { emergencyPhone: '' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · 5K missing bloodType → 400',
    payload: () => mk5k(6, { bloodType: '' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · 5K missing eliteStatus → 400',
    payload: () => mk5k(7, { eliteStatus: '' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · 5K bad idFilePath (path traversal attempt) → 400',
    payload: () => mk5k(8, { idFilePath: '../secrets/env.txt' }),
    expect: s => s === 400,
  },
  {
    name: 'INVALID · completely empty body → 400',
    payload: () => ({}),
    expect: s => s === 400,
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🏃 Bikfaya Race — ${tests.length} API simulations`);
  console.log(`   Target : ${BASE}`);
  console.log(`   Tag    : ${TAG}\n`);

  let passed = 0, failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const num = String(i + 1).padStart(2, ' ');
    try {
      const { status, data } = await post('/api/register', t.payload());
      const ok = t.expect(status);
      if (ok) {
        passed++;
        console.log(`  ✅ [${num}/${tests.length}] ${t.name}`);
      } else {
        failed++;
        console.log(`  ❌ [${num}/${tests.length}] ${t.name}`);
        console.log(`       got ${status}: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      failed++;
      console.log(`  💥 [${num}/${tests.length}] ${t.name} — ${err.message}`);
    }
    // Small delay between requests to avoid hammering
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  ${passed} passed  |  ${failed} failed  |  ${tests.length} total`);
  console.log(`${'─'.repeat(55)}\n`);

  console.log('🧹 Run this in Supabase SQL Editor to delete test rows:');
  console.log(`   DELETE FROM public.registrations`);
  console.log(`   WHERE email LIKE '%test-bikfaya.invalid%';\n`);
}

run().catch(console.error);
