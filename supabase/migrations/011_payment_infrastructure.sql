-- Migration: Payment infrastructure

-- Stylist IBAN
ALTER TABLE public.stylist_profiles ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.stylist_profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.stylist_profiles ADD COLUMN IF NOT EXISTS account_holder TEXT;

-- User payment card (display info only - never store full card numbers)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS card_last_four TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS card_holder_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS card_brand TEXT;

-- Auto-create payment when request is completed
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

  SELECT price_per_outfit INTO stylist_price
  FROM public.stylist_profiles
  WHERE user_id = NEW.stylist_id;

  IF stylist_price IS NULL OR stylist_price <= 0 THEN
    stylist_price := 0;
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

DROP TRIGGER IF EXISTS on_request_completed_payment ON public.outfit_requests;
CREATE TRIGGER on_request_completed_payment
  AFTER UPDATE OF status ON public.outfit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payment_on_complete();
