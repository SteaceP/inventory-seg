-- Migration: Add `language` column to `user_settings`
-- Created: 2026-01-06
-- Purpose: store user's preferred UI language ('fr' or 'en')

BEGIN;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS language varchar(2) DEFAULT 'fr';

-- Ensure existing rows have a value
UPDATE user_settings
  SET language = 'fr'
  WHERE language IS NULL;

COMMIT;

-- Rollback (if needed):
-- ALTER TABLE user_settings DROP COLUMN IF EXISTS language;

-- Run via psql or Supabase SQL editor/CLI:
-- psql -h <host> -U <user> -d <db> -c "\
--   ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language varchar(2) DEFAULT 'fr';\
-- "
