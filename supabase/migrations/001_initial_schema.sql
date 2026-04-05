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
