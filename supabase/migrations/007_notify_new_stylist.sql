-- Migration: Notify all users when a new verified stylist joins

CREATE OR REPLACE FUNCTION public.notify_on_new_stylist()
RETURNS TRIGGER AS $$
DECLARE
  stylist_name TEXT;
BEGIN
  -- Only notify when the stylist is (now) verified
  IF NEW.is_verified IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Skip if already verified before this update
  IF TG_OP = 'UPDATE' AND OLD.is_verified IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT name INTO stylist_name FROM public.users WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  SELECT
    u.id,
    'new_stylist',
    'Yeni stilist katıldı!',
    COALESCE(stylist_name, 'Bir stilist') || ' platforma katıldı. Profilini inceleyin.',
    jsonb_build_object('stylist_id', NEW.user_id)
  FROM public.users u
  WHERE u.id <> NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_stylist_insert ON public.stylist_profiles;
CREATE TRIGGER on_new_stylist_insert
  AFTER INSERT ON public.stylist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_stylist();

DROP TRIGGER IF EXISTS on_new_stylist_verify ON public.stylist_profiles;
CREATE TRIGGER on_new_stylist_verify
  AFTER UPDATE OF is_verified ON public.stylist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_stylist();
