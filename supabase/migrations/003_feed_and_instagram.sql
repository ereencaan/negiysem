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
