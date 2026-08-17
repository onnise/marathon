-- =====================================================
-- BIKFAYA 5K ECO RACE 2026 — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- =====================================================

-- 1. REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS registrations (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         TIMESTAMPTZ DEFAULT NOW(),

  -- Race
  registration_code  TEXT        UNIQUE NOT NULL,
  race               TEXT        NOT NULL CHECK (race IN ('5k', '2k')),
  bib_number         INTEGER,

  -- Personal
  first_name         TEXT        NOT NULL,
  last_name          TEXT        NOT NULL,
  dob                DATE        NOT NULL,
  gender             TEXT        NOT NULL CHECK (gender IN ('male', 'female')),
  age_category       TEXT,           -- auto-assigned from DOB (5K only)

  -- Contact
  email              TEXT        NOT NULL,
  country            TEXT        NOT NULL,

  -- 5K-specific
  blood_type         TEXT,
  club               TEXT,
  club_name          TEXT,
  elite_status       TEXT,
  best_5k_time       TEXT,
  expected_time      TEXT,
  id_upload_url      TEXT,           -- Supabase Storage URL

  -- Common
  first_race         BOOLEAN     NOT NULL DEFAULT FALSE,
  emergency_name     TEXT        NOT NULL,
  emergency_phone    TEXT        NOT NULL,

  -- Payment
  pay_method         TEXT        NOT NULL DEFAULT 'omt',
  payment_status     TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending', 'confirmed', 'cancelled')),
  omt_payment_code   TEXT,           -- 8-char code sent to runner
  paid_at            TIMESTAMPTZ,

  -- Admin
  notes              TEXT
);

-- 2. INDEXES (for fast filtering in admin panel)
-- =====================================================
CREATE INDEX idx_reg_race            ON registrations (race);
CREATE INDEX idx_reg_payment_status  ON registrations (payment_status);
CREATE INDEX idx_reg_gender          ON registrations (gender);
CREATE INDEX idx_reg_country         ON registrations (country);
CREATE INDEX idx_reg_email           ON registrations (email);
CREATE INDEX idx_reg_created_at      ON registrations (created_at DESC);

-- 3. ROW LEVEL SECURITY
-- All operations go through the Vercel API using the service_role key.
-- No direct public access to this table.
-- =====================================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- No policies = no public access. Service role bypasses RLS entirely.

-- 4. CAPACITY VIEW (live count for the 500-spot limit)
-- =====================================================
CREATE OR REPLACE VIEW capacity AS
SELECT
  COUNT(*)                                                AS total_registered,
  500                                                     AS max_capacity,
  500 - COUNT(*)                                          AS spots_remaining,
  COUNT(*) FILTER (WHERE race = '5k')                    AS total_5k,
  COUNT(*) FILTER (WHERE race = '2k')                    AS total_2k,
  COUNT(*) FILTER (WHERE payment_status = 'confirmed')   AS confirmed,
  COUNT(*) FILTER (WHERE payment_status = 'pending')     AS pending,
  COUNT(*) FILTER (WHERE payment_status = 'cancelled')   AS cancelled
FROM registrations
WHERE payment_status != 'cancelled';

-- 5. HELPFUL QUERIES (reference — not executed on setup)
-- =====================================================
-- View all registrations:
--   SELECT * FROM registrations ORDER BY created_at DESC;
--
-- ─── PERMISSIONS ────────────────────────────────────────────────────────────
-- Run once after creating the table if the service_role gets permission denied:
--   GRANT ALL PRIVILEGES ON TABLE public.registrations TO service_role;
--   GRANT ALL PRIVILEGES ON TABLE public.registrations TO authenticated;
--   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- ─────────────────────────────────────────────────────────────────────────────

-- Check capacity:
--   SELECT * FROM capacity;
--
-- Pending payments older than 48h:
--   SELECT * FROM registrations
--   WHERE payment_status = 'pending'
--     AND created_at < NOW() - INTERVAL '48 hours';
--
-- Confirm a payment (replace UUID):
--   UPDATE registrations SET payment_status = 'confirmed', paid_at = NOW()
--   WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
