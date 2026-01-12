-- Migration: Refine repairs table for multiple parts
-- Created: 2026-01-12

-- 1. Remove previously added columns to start fresh or alter them
ALTER TABLE public.repairs DROP COLUMN IF EXISTS parts;

-- 2. Add parts column as JSONB for dynamic lists
-- Structure: [{ "name": "Part name", "price": 10.50 }, ...]
ALTER TABLE public.repairs ADD COLUMN parts JSONB DEFAULT '[]'::jsonb;
