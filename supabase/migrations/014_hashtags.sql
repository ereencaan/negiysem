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
