// Shared utilities for all API functions
const { createClient } = require('@supabase/supabase-js');

// ── Structured logger ─────────────────────────────────────────────────────────
// All output goes to Vercel's log viewer (vercel.com → project → logs).
// Format: [TAG] LEVEL | key=value key=value …
// Levels: INFO (normal flow), WARN (unexpected but handled), ERROR (failure)
function log(tag, level, message, ctx = {}) {
  const pairs = Object.entries(ctx)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .join(' | ');
  const line = pairs ? `[${tag}] ${level} | ${message} | ${pairs}` : `[${tag}] ${level} | ${message}`;
  if (level === 'ERROR') console.error(line);
  else                   console.log(line);
}

// Partially mask email for privacy in logs: foo@bar.com → f**@bar.com
function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '?';
  const [local, domain] = email.split('@');
  return `${local[0]}**@${domain}`;
}

// Extract caller IP from Vercel request
function getIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
}
// ─────────────────────────────────────────────────────────────────────────────

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Serverless: each instance has its own map; this limits per-instance burst.
// Good enough to stop scripted attacks — full distributed limiting needs Redis.
const _rateBuckets = new Map();

function rateLimitCheck(key, maxHits, windowMs) {
  const now    = Date.now();
  const bucket = _rateBuckets.get(key) || { hits: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) { bucket.hits = 0; bucket.resetAt = now + windowMs; }
  bucket.hits++;
  _rateBuckets.set(key, bucket);
  return bucket.hits > maxHits; // true = blocked
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a Supabase client using the service role key (bypasses RLS).
 * Only ever used server-side in Vercel functions — never exposed to the browser.
 */
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-client-info': 'bikfaya-race-api' } },
  });
}

/**
 * Generates a unique registration code: BKF-XXXX-XXXX (alphanumeric, uppercase)
 */
function generateRegCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand  = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BKF-${rand(4)}-${rand(4)}`;
}

/**
 * Generates an 8-character OMT payment code: numeric only (typical OMT format).
 */
function generateOmtCode() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

/**
 * Auto-assigns an age category based on DOB and race day (Sep 20 2026).
 * NOTE: Full official category list pending from organiser — using provisional ranges.
 */
function assignAgeCategory(dobString) {
  if (!dobString) return null;
  const dob     = new Date(dobString);
  const raceDay = new Date('2026-09-20');
  const age = raceDay.getFullYear() - dob.getFullYear() -
    (raceDay < new Date(raceDay.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

  if (age < 16) return 'Under 16';
  if (age <= 19) return '16–19';
  if (age <= 29) return '20–29';
  if (age <= 39) return '30–39';
  if (age <= 49) return '40–49';
  if (age <= 59) return '50–59';
  return '60+';
}

/**
 * Validates that the admin token in the Authorization header matches ADMIN_TOKEN env var.
 */
function verifyAdmin(req) {
  const header = req.headers['authorization'] || '';
  const token  = header.replace(/^Bearer\s+/i, '').trim();
  const valid  = process.env.ADMIN_TOKEN;
  if (!valid) throw new Error('ADMIN_TOKEN not configured.');
  return token === valid;
}

/**
 * Sanitises a string — strips HTML/script-like characters.
 */
function sanitise(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[<>"'`\\]/g, '').slice(0, 500);
}

/**
 * Standard JSON response helper.
 */
function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = { getSupabase, generateRegCode, generateOmtCode, assignAgeCategory, verifyAdmin, sanitise, send, rateLimitCheck, log, maskEmail, getIp };
