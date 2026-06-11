-- Migration: Community stylist eligibility system

-- Track eligibility on users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS can_style BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS style_price NUMERIC(10,2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Allow anyone to read users who can_style (for request flow)
DROP POLICY IF EXISTS "Community stylists are publicly readable" ON public.users;
CREATE POLICY "Community stylists are publicly readable"
  ON public.users FOR SELECT
  USING (can_style = true);

-- Allow inserting outfit_requests where stylist_id is a can_style user (not just stylist_profiles)
-- The existing RLS on outfit_requests already allows insert with auth.uid() = user_id
-- so no changes needed there.

-- Payment trigger should also work for community stylists
-- Update create_payment_on_complete to check both stylist_profiles and users.style_price
CREATE OR REPLACE FUNCTION public.create_payment_on_complete()
RETURNS TRIGGER AS $$
DECLARE
  stylist_price NUMERIC(10,2);
  commission NUMERIC(10,2);
  payout NUMERIC(10,2);
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Try stylist_profiles price first, then users.style_price
  SELECT price_per_outfit INTO stylist_price
  FROM public.stylist_profiles
  WHERE user_id = NEW.stylist_id;

  IF stylist_price IS NULL THEN
    SELECT style_price INTO stylist_price
    FROM public.users
    WHERE id = NEW.stylist_id;
  END IF;

  IF stylist_price IS NULL OR stylist_price <= 0 THEN
    RETURN NEW;
  END IF;

  commission := ROUND(stylist_price * 0.10, 2);
  payout := stylist_price - commission;

  INSERT INTO public.payments (
    request_id, user_id, stylist_id,
    total_amount, platform_commission, stylist_payout,
    currency, status
  ) VALUES (
    NEW.id, NEW.user_id, NEW.stylist_id,
    stylist_price, commission, payout,
    'TRY', 'completed'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
