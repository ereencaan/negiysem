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
