-- Migration: Follow-up tracking for completed requests

ALTER TABLE public.outfit_requests ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT false;
ALTER TABLE public.outfit_requests ADD COLUMN IF NOT EXISTS follow_up_response JSONB;

-- Trigger: schedule follow-up notification 3 days after completion
-- Since Supabase doesn't have cron on free tier, we use a check-on-load approach.
-- The app checks for completed requests older than 3 days without follow-up
-- and creates notifications on demand.

-- Add already_reviewed error key support
-- (already handled in review service)
