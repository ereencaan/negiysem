-- Ne Giysem - Full Schema Setup
-- Run this once on a fresh Supabase database


-- ============================================================
-- 001_initial_schema.sql
-- ============================================================
-- =============================================
-- Ne Giysem - Stilist Marketplace
-- Initial Database Schema
-- =============================================

-- =============================================
-- 1. KULLANICILAR
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'stylist')),
  name TEXT,
  phone TEXT,
  profile_photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. STILIST PROFILLERI
-- =============================================
CREATE TABLE public.stylist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  cv_text TEXT,
  instagram_url TEXT,
  price_per_outfit NUMERIC(10, 2),
  rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. KIYAFET KATEGORILERI (Referans Tablosu)
-- =============================================
CREATE TABLE public.clothing_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subcategories JSONB DEFAULT '[]'::jsonb
);

-- Seed data
INSERT INTO public.clothing_categories (name, slug, subcategories) VALUES
  ('Üst Giyim', 'ust_giyim', '["tişört", "gömlek", "kazak", "sweatshirt", "bluz", "crop top"]'::jsonb),
  ('Alt Giyim', 'alt_giyim', '["pantolon", "jean", "etek", "şort", "tayt"]'::jsonb),
  ('Dış Giyim', 'dis_giyim', '["mont", "kaban", "ceket", "trençkot", "yelek", "blazer"]'::jsonb),
  ('Ayakkabı', 'ayakkabi', '["sneaker", "bot", "topuklu", "sandalet", "loafer", "spor"]'::jsonb),
  ('Aksesuar', 'aksesuar', '["çanta", "şal", "kemer", "şapka", "takı", "gözlük"]'::jsonb),
  ('Elbise', 'elbise', '["mini elbise", "midi elbise", "maxi elbise", "tulum"]'::jsonb);

-- =============================================
-- 4. DOLAP (Kullanici Kiyafetleri)
-- =============================================
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  color TEXT,
  brand TEXT,
  season TEXT CHECK (season IN ('ilkbahar_yaz', 'sonbahar_kis', 'tum_sezonlar')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5. KOMBIN TALEPLERI
-- =============================================
CREATE TABLE public.outfit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  occasion TEXT,
  budget_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. KOMBIN ONERILERI
-- =============================================
CREATE TABLE public.outfit_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.outfit_requests(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  notes TEXT,
  proposal_photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7. ONERI-KIYAFET ILISKISI
-- =============================================
CREATE TABLE public.proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.outfit_proposals(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE
);

-- =============================================
-- 8. GIYME GECMISI
-- =============================================
CREATE TABLE public.outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.outfit_proposals(id) ON DELETE CASCADE,
  worn_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photo_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 9. MESAJLAR
-- =============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.outfit_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'proposal')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 10. ODEMELER
-- =============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.outfit_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  platform_commission NUMERIC(10, 2) NOT NULL,
  stylist_payout NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  payment_provider TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 11. YORUMLAR
-- =============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.outfit_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, request_id)
);

-- =============================================
-- 12. BILDIRIMLER
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_wardrobe_user ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_category ON public.wardrobe_items(category);
CREATE INDEX idx_outfit_requests_user ON public.outfit_requests(user_id);
CREATE INDEX idx_outfit_requests_stylist ON public.outfit_requests(stylist_id);
CREATE INDEX idx_outfit_requests_status ON public.outfit_requests(status);
CREATE INDEX idx_messages_request ON public.messages(request_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_payments_request ON public.payments(request_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_outfit_history_user ON public.outfit_history(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own row"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Stylist Profiles
ALTER TABLE public.stylist_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylist profiles are publicly readable"
  ON public.stylist_profiles FOR SELECT
  USING (true);

CREATE POLICY "Stylists can update own profile"
  ON public.stylist_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Stylists can insert own profile"
  ON public.stylist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clothing Categories (public read, no write from client)
ALTER TABLE public.clothing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.clothing_categories FOR SELECT
  USING (true);

-- Wardrobe Items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wardrobe"
  ON public.wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON public.wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON public.wardrobe_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON public.wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);

-- Stylists can view wardrobe of users who requested them
CREATE POLICY "Stylists can view assigned user wardrobe"
  ON public.wardrobe_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfit_requests
      WHERE outfit_requests.user_id = wardrobe_items.user_id
        AND outfit_requests.stylist_id = auth.uid()
        AND outfit_requests.status IN ('accepted', 'in_progress')
    )
  );

-- Outfit Requests
ALTER TABLE public.outfit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own requests"
  ON public.outfit_requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = stylist_id);

CREATE POLICY "Users can create requests"
  ON public.outfit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update requests"
  ON public.outfit_requests FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = stylist_id);

-- Outfit Proposals
ALTER TABLE public.outfit_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read proposals"
  ON public.outfit_proposals FOR SELECT
  USING (
    auth.uid() = stylist_id OR
    EXISTS (
      SELECT 1 FROM public.outfit_requests
      WHERE outfit_requests.id = outfit_proposals.request_id
        AND outfit_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can create proposals"
  ON public.outfit_proposals FOR INSERT
  WITH CHECK (auth.uid() = stylist_id);

CREATE POLICY "Stylists can update own proposals"
  ON public.outfit_proposals FOR UPDATE
  USING (auth.uid() = stylist_id);

-- Proposal Items
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposal items visible to participants"
  ON public.proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfit_proposals p
      JOIN public.outfit_requests r ON r.id = p.request_id
      WHERE p.id = proposal_items.proposal_id
        AND (r.user_id = auth.uid() OR r.stylist_id = auth.uid())
    )
  );

CREATE POLICY "Stylists can manage proposal items"
  ON public.proposal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfit_proposals
      WHERE outfit_proposals.id = proposal_items.proposal_id
        AND outfit_proposals.stylist_id = auth.uid()
    )
  );

-- Outfit History
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history"
  ON public.outfit_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.outfit_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.outfit_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfit_requests
      WHERE outfit_requests.id = messages.request_id
        AND (outfit_requests.user_id = auth.uid() OR outfit_requests.stylist_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.outfit_requests
      WHERE outfit_requests.id = messages.request_id
        AND (outfit_requests.user_id = auth.uid() OR outfit_requests.stylist_id = auth.uid())
    )
  );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = stylist_id);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create public.users row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'user'),
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on outfit_requests
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outfit_requests_updated_at
  BEFORE UPDATE ON public.outfit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 002_dual_role.sql
-- ============================================================
-- Migration: Dual Role Support
-- Remove user_type column - role is now determined by stylist_profiles existence

-- Drop user_type column from users
ALTER TABLE public.users DROP COLUMN user_type;

-- Update trigger to not reference user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 003_feed_and_instagram.sql
-- ============================================================
-- Migration: Feed posts + Instagram for users

-- Add instagram_url to users table
ALTER TABLE public.users ADD COLUMN instagram_url TEXT;

-- Create feed_posts table
CREATE TABLE public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for feed queries
CREATE INDEX idx_feed_posts_user ON public.feed_posts(user_id);
CREATE INDEX idx_feed_posts_created ON public.feed_posts(created_at DESC);

-- RLS for feed_posts
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed posts"
  ON public.feed_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create own feed posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feed posts"
  ON public.feed_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create feed storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('feed', 'feed', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for feed bucket
CREATE POLICY "Anyone can view feed images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feed');

CREATE POLICY "Authenticated users can upload feed images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feed' AND auth.role() = 'authenticated');


-- ============================================================
-- 004_wardrobe_bucket.sql
-- ============================================================
-- Migration: Create wardrobe storage bucket

INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe', 'wardrobe', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for wardrobe bucket
DROP POLICY IF EXISTS "Anyone can view wardrobe images" ON storage.objects;
CREATE POLICY "Anyone can view wardrobe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wardrobe');

DROP POLICY IF EXISTS "Users can upload own wardrobe images" ON storage.objects;
CREATE POLICY "Users can upload own wardrobe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wardrobe'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own wardrobe images" ON storage.objects;
CREATE POLICY "Users can delete own wardrobe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wardrobe'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 005_stylist_public_read.sql
-- ============================================================
-- Migration: Allow public read access to users who are stylists
-- Needed for the inner join in getStylistList() to work

DROP POLICY IF EXISTS "Stylist users are publicly readable" ON public.users;
CREATE POLICY "Stylist users are publicly readable"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE stylist_profiles.user_id = users.id
    )
  );

-- Feed posts also need readable user info for the author
-- (already handled by the above since authors of feed posts from stylists are readable)


-- ============================================================
-- 006_event_date_and_triggers.sql
-- ============================================================
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
-- Enable realtime for notifications and messages (idempotent)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

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


-- ============================================================
-- 007_notify_new_stylist.sql
-- ============================================================
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


-- ============================================================
-- 008_likes_comments.sql
-- ============================================================
-- Migration: Post likes and comments for Instagram-like feed

-- Likes table (unique per user+post)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes" ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: update likes_count on feed_posts when like is added/removed
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.feed_posts
  SET likes_count = (SELECT count(*) FROM public.post_likes WHERE post_id = target_post_id)
  WHERE id = target_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON public.post_likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();

-- Allow anyone to read feed post authors (for comments, etc.)
DROP POLICY IF EXISTS "Feed post authors are publicly readable" ON public.users;
CREATE POLICY "Feed post authors are publicly readable"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feed_posts WHERE feed_posts.user_id = users.id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.post_comments WHERE post_comments.user_id = users.id
    )
  );


-- ============================================================
-- 009_proposal_enhancements.sql
-- ============================================================
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


-- ============================================================
-- 010_follow_up.sql
-- ============================================================
-- Migration: Follow-up tracking for completed requests

ALTER TABLE public.outfit_requests ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT false;
ALTER TABLE public.outfit_requests ADD COLUMN IF NOT EXISTS follow_up_response JSONB;

-- Trigger: schedule follow-up notification 3 days after completion
-- Since Supabase doesn't have cron on free tier, we use a check-on-load approach.
-- The app checks for completed requests older than 3 days without follow-up
-- and creates notifications on demand.

-- Add already_reviewed error key support
-- (already handled in review service)


-- ============================================================
-- 011_payment_infrastructure.sql
-- ============================================================
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


-- ============================================================
-- 012_feed_categories.sql
-- ============================================================
-- Migration: Add category to feed_posts for filtering

ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'gunluk';

CREATE INDEX IF NOT EXISTS idx_feed_posts_category ON public.feed_posts(category);

-- Assign categories to existing seed posts based on stylist specialty
UPDATE public.feed_posts SET category = 'ofis'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.ceren@negiysem.com');

UPDATE public.feed_posts SET category = 'davet'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.burcu@negiysem.com');

UPDATE public.feed_posts SET category = 'sokak'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.ece@negiysem.com');

UPDATE public.feed_posts SET category = 'gunluk'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.deniz@negiysem.com');

UPDATE public.feed_posts SET category = 'ofis'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.selin@negiysem.com')
AND id IN (SELECT id FROM public.feed_posts WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.selin@negiysem.com') LIMIT 5);

UPDATE public.feed_posts SET category = 'davet'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.selin@negiysem.com')
AND category = 'gunluk';


-- ============================================================
-- 013_follows.sql
-- ============================================================
-- Migration: Follow system

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows" ON public.follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow" ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Notify user when someone follows them
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT name INTO follower_name FROM public.users WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.following_id,
    'new_follower',
    'Yeni takipçi!',
    COALESCE(follower_name, 'Biri') || ' sizi takip etmeye başladı',
    jsonb_build_object('follower_id', NEW.follower_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_follow ON public.follows;
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_follow();


-- ============================================================
-- 014_hashtags.sql
-- ============================================================
-- Migration: Hashtags for feed posts

CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON public.hashtags(name);

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hashtags" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "Authenticated can create hashtags" ON public.hashtags FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read post_hashtags" ON public.post_hashtags FOR SELECT USING (true);
CREATE POLICY "Authenticated can link hashtags" ON public.post_hashtags FOR INSERT WITH CHECK (true);

-- Update post_count on hashtags when posts are linked/unlinked
CREATE OR REPLACE FUNCTION public.update_hashtag_count()
RETURNS TRIGGER AS $$
DECLARE target_id UUID;
BEGIN
  target_id := COALESCE(NEW.hashtag_id, OLD.hashtag_id);
  UPDATE public.hashtags SET post_count = (
    SELECT count(*) FROM public.post_hashtags WHERE hashtag_id = target_id
  ) WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_hashtag_change ON public.post_hashtags;
CREATE TRIGGER on_post_hashtag_change
  AFTER INSERT OR DELETE ON public.post_hashtags
  FOR EACH ROW EXECUTE FUNCTION public.update_hashtag_count();

-- Seed popular hashtags
INSERT INTO public.hashtags (name) VALUES
  ('ofistarzı'), ('günlük'), ('davet'), ('spor'), ('sokaktarzı'),
  ('minimalist'), ('vintage'), ('bütçedostu'), ('yazkombin'), ('kışkombin'),
  ('capsulewardrobe'), ('trendyol'), ('kombinönerisi'), ('stilipuçları'),
  ('aksesuar'), ('ayakkabı'), ('elbise'), ('casual'), ('şık'), ('streetwear')
ON CONFLICT (name) DO NOTHING;

-- Assign hashtags to existing seed posts
INSERT INTO public.post_hashtags (post_id, hashtag_id)
SELECT fp.id, h.id FROM public.feed_posts fp
CROSS JOIN public.hashtags h
WHERE h.name = fp.category AND fp.category IS NOT NULL
ON CONFLICT DO NOTHING;


-- ============================================================
-- 015_community_stylist.sql
-- ============================================================
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

