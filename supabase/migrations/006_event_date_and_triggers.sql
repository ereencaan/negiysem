-- Migration: event_date + notification triggers for requests and messages

-- Add event_date to outfit_requests (optional)
ALTER TABLE public.outfit_requests ADD COLUMN IF NOT EXISTS event_date DATE;

-- =============================================
-- Trigger: notify stylist when a new request arrives
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_on_new_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
BEGIN
  SELECT name INTO requester_name FROM public.users WHERE id = NEW.user_id;

  -- Notify stylist
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.stylist_id,
    'new_request',
    'Yeni kombin talebi',
    COALESCE(requester_name, 'Bir kullanıcı') || ' sizden kombin talep etti',
    jsonb_build_object('request_id', NEW.id, 'user_id', NEW.user_id)
  );

  -- Confirmation to user
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user_id,
    'request_sent',
    'Talebiniz gönderildi',
    'Kombin talebiniz stiliste iletildi. En kısa sürede yanıt bekleyin.',
    jsonb_build_object('request_id', NEW.id, 'stylist_id', NEW.stylist_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_outfit_request_created ON public.outfit_requests;
CREATE TRIGGER on_outfit_request_created
  AFTER INSERT ON public.outfit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_request();

-- =============================================
-- Trigger: notify the other side when a message arrives
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  req RECORD;
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  SELECT user_id, stylist_id INTO req FROM public.outfit_requests WHERE id = NEW.request_id;
  IF req IS NULL THEN RETURN NEW; END IF;

  recipient_id := CASE WHEN NEW.sender_id = req.user_id THEN req.stylist_id ELSE req.user_id END;

  SELECT name INTO sender_name FROM public.users WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    recipient_id,
    'new_message',
    'Yeni mesaj',
    COALESCE(sender_name, 'Biri') || ': ' || LEFT(NEW.content, 80),
    jsonb_build_object('request_id', NEW.request_id, 'sender_id', NEW.sender_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_message();

-- =============================================
-- Trigger: notify user when request status changes
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_on_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  stylist_name TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT name INTO stylist_name FROM public.users WHERE id = NEW.stylist_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user_id,
    'request_status_change',
    'Talep durumu güncellendi',
    COALESCE(stylist_name, 'Stilist') || ' talebinizi: ' ||
      CASE NEW.status
        WHEN 'accepted' THEN 'kabul etti'
        WHEN 'in_progress' THEN 'işleme aldı'
        WHEN 'completed' THEN 'tamamladı'
        WHEN 'cancelled' THEN 'iptal etti'
        ELSE NEW.status
      END,
    jsonb_build_object('request_id', NEW.id, 'new_status', NEW.status)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_request_status_change ON public.outfit_requests;
CREATE TRIGGER on_request_status_change
  AFTER UPDATE OF status ON public.outfit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_request_status_change();

-- =============================================
-- Enable realtime for notifications and messages
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =============================================
-- Allow participants to read each other's name via users table
-- (for chat header, request details, etc.)
-- =============================================
DROP POLICY IF EXISTS "Request participants can read each other" ON public.users;
CREATE POLICY "Request participants can read each other"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfit_requests
      WHERE (
        (outfit_requests.user_id = users.id AND outfit_requests.stylist_id = auth.uid())
        OR (outfit_requests.stylist_id = users.id AND outfit_requests.user_id = auth.uid())
      )
    )
  );
