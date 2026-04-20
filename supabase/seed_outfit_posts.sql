-- =============================================
-- 5 Stilist için 10'ar adet kombin görseli (toplam 50)
-- Picsum.photos unique seed URL'leri kullanılır (her biri farklı)
-- =============================================

-- Selin Aydın (Klasik / modern stil)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-01/600/800', 'Beyaz gömlek + yüksek bel pantolon kombinasyonu', 142 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-02/600/800', 'Siyah blazer ile zarif iş kombini', 98 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-03/600/800', 'Bej trençkot ile sonbahar şıklığı', 156 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-04/600/800', 'Midi elbise + topuklu klasik stil', 203 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-05/600/800', 'Kaşmir kazak + jean kombini', 89 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-06/600/800', 'Çiçek desenli midi etek', 174 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-07/600/800', 'Oversize palto + yüksek bot', 132 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-08/600/800', 'Beyaz gömlek + deri etek', 167 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-09/600/800', 'Akşam yemeği için şık kombin', 245 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/selin-outfit-10/600/800', 'Monokrom siyah kombinasyon', 118 FROM public.users WHERE email = 'stilist.selin@negiysem.com';

-- Deniz Korkmaz (Minimalist / kapsül gardırop)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-01/600/800', 'Minimalist beyaz tişört + bej pantolon', 76 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-02/600/800', 'Kapsül gardırop temel parçalar', 124 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-03/600/800', 'Toprak tonları ile nötr kombin', 91 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-04/600/800', 'Sürdürülebilir moda - keten gömlek', 108 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-05/600/800', 'Temiz çizgiler, sade renkler', 142 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-06/600/800', 'Slow fashion - organik kumaşlar', 67 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-07/600/800', 'Oversize beyaz gömlek stili', 135 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-08/600/800', 'Vintage trench + modern detaylar', 89 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-09/600/800', 'Haftanın 7 günü kombinleri', 201 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/deniz-outfit-10/600/800', 'Az parça çok kombin', 156 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';

-- Ece Şahin (Streetwear / genç stil)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-01/600/800', 'Oversize hoodie + bisiklet şort', 287 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-02/600/800', 'Sneaker ile casual chic', 198 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-03/600/800', 'Crop top + yüksek bel jean', 312 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-04/600/800', 'Y2K tarzı retro kombin', 267 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-05/600/800', 'Grafikli tişört + kargo pantolon', 178 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-06/600/800', 'Üniversite kombinleri haftası', 221 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-07/600/800', 'Deri ceket + mini etek', 254 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-08/600/800', 'Festival için ootd', 189 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-09/600/800', 'Denim üzerine denim trendi', 145 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ece-outfit-10/600/800', 'Ekoseli etek + bot', 234 FROM public.users WHERE email = 'stilist.ece@negiysem.com';

-- Burcu Yılmaz (Özel gün / düğün)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-01/600/800', 'Düğün için kır eşarplı elbise', 356 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-02/600/800', 'Nişan töreni için pudra pembe tül', 412 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-03/600/800', 'Kokteyl partisi - siyah mini elbise', 287 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-04/600/800', 'Gala gecesi için şampanya rengi tuval', 398 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-05/600/800', 'Mezuniyet için zarif kombin', 245 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-06/600/800', 'Baloya özel payetli abiye', 321 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-07/600/800', 'Nikah şahidi kombinasyonları', 198 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-08/600/800', 'Kına gecesi lila elbise', 267 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-09/600/800', 'Sünnet töreni anne kombini', 189 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/burcu-outfit-10/600/800', 'Yılbaşı partisi parlak stil', 434 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';

-- Ceren Özdemir (Ofis / iş hayatı)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-01/600/800', 'İş görüşmesi için lacivert takım', 178 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-02/600/800', 'Ofis için beyaz bluz + pantolon', 145 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-03/600/800', 'Power suit - güçlü iş kadını', 267 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-04/600/800', 'Bej blazer ile profesyonel şıklık', 198 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-05/600/800', 'Sunum günü için etkili kombin', 156 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-06/600/800', 'Yapılandırılmış elbise - toplantı', 134 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-07/600/800', 'Kurumsal iş yemeği kıyafeti', 112 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-08/600/800', 'Midi kalem etek + gömlek', 189 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-09/600/800', 'Office casual - cuma kombin', 165 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://picsum.photos/seed/ceren-outfit-10/600/800', 'Konferans günü profesyonel stil', 223 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
