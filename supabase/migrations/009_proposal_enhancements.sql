-- Migration: Outfit proposals with multi-select wardrobe items + external product links

-- Add external products (url + name + image) as JSONB array on outfit_proposals
ALTER TABLE public.outfit_proposals
  ADD COLUMN IF NOT EXISTS external_products JSONB DEFAULT '[]'::jsonb;

-- Allow users (not just stylists) to see proposal_items via existing policies.
-- Extend proposal_items SELECT policy so all participants can view the linked items.
-- (already exists from initial schema as "Proposal items visible to participants")

-- Notify user when stylist creates a proposal
CREATE OR REPLACE FUNCTION public.notify_on_new_proposal()
RETURNS TRIGGER AS $$
DECLARE
  req_user UUID;
  stylist_name TEXT;
BEGIN
  SELECT user_id INTO req_user FROM public.outfit_requests WHERE id = NEW.request_id;
  SELECT name INTO stylist_name FROM public.users WHERE id = NEW.stylist_id;

  IF req_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      req_user,
      'new_proposal',
      'Kombin önerisi geldi!',
      COALESCE(stylist_name, 'Stilistiniz') || ' size bir kombin önerisi hazırladı',
      jsonb_build_object('request_id', NEW.request_id, 'proposal_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_proposal_created ON public.outfit_proposals;
CREATE TRIGGER on_proposal_created
  AFTER INSERT ON public.outfit_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_proposal();

-- Index for faster proposal lookups by request
CREATE INDEX IF NOT EXISTS idx_proposals_request ON public.outfit_proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal ON public.proposal_items(proposal_id);
