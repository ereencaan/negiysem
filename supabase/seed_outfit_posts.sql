-- =============================================
-- 5 Stilist için 10'ar adet kombin görseli (toplam 50)
-- Picsum.photos unique seed URL'leri kullanılır (her biri farklı)
-- =============================================

-- Selin Aydın (Klasik / modern stil)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8903', 'Beyaz gömlek + yüksek bel pantolon kombinasyonu', 142 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=2176', 'Siyah blazer ile zarif iş kombini', 98 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8136', 'Bej trençkot ile sonbahar şıklığı', 156 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8776', 'Midi elbise + topuklu klasik stil', 203 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8313', 'Kaşmir kazak + jean kombini', 89 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=975', 'Çiçek desenli midi etek', 174 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3066', 'Oversize palto + yüksek bot', 132 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=9917', 'Beyaz gömlek + deri etek', 167 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6853', 'Akşam yemeği için şık kombin', 245 FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3750', 'Monokrom siyah kombinasyon', 118 FROM public.users WHERE email = 'stilist.selin@negiysem.com';

-- Deniz Korkmaz (Minimalist / kapsül gardırop)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=1215', 'Minimalist beyaz tişört + bej pantolon', 76 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=9541', 'Kapsül gardırop temel parçalar', 124 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=3041', 'Toprak tonları ile nötr kombin', 91 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=5424', 'Sürdürülebilir moda - keten gömlek', 108 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8739', 'Temiz çizgiler, sade renkler', 142 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8131', 'Slow fashion - organik kumaşlar', 67 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=3529', 'Oversize beyaz gömlek stili', 135 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8657', 'Vintage trench + modern detaylar', 89 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=5083', 'Haftanın 7 günü kombinleri', 201 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=9284', 'Az parça çok kombin', 156 FROM public.users WHERE email = 'stilist.deniz@negiysem.com';

-- Ece Şahin (Streetwear / genç stil)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=2200', 'Oversize hoodie + bisiklet şort', 287 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1761', 'Sneaker ile casual chic', 198 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=6010', 'Crop top + yüksek bel jean', 312 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=4734', 'Y2K tarzı retro kombin', 267 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=346', 'Grafikli tişört + kargo pantolon', 178 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1263', 'Üniversite kombinleri haftası', 221 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=2065', 'Deri ceket + mini etek', 254 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=6420', 'Festival için ootd', 189 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1966', 'Denim üzerine denim trendi', 145 FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=7207', 'Ekoseli etek + bot', 234 FROM public.users WHERE email = 'stilist.ece@negiysem.com';

-- Burcu Yılmaz (Özel gün / düğün)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2728', 'Düğün için kır eşarplı elbise', 356 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=314', 'Nişan töreni için pudra pembe tül', 412 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=120', 'Kokteyl partisi - siyah mini elbise', 287 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=1297', 'Gala gecesi için şampanya rengi tuval', 398 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=3607', 'Mezuniyet için zarif kombin', 245 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=18', 'Baloya özel payetli abiye', 321 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=8044', 'Nikah şahidi kombinasyonları', 198 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=9519', 'Kına gecesi lila elbise', 267 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2479', 'Sünnet töreni anne kombini', 189 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2077', 'Yılbaşı partisi parlak stil', 434 FROM public.users WHERE email = 'stilist.burcu@negiysem.com';

-- Ceren Özdemir (Ofis / iş hayatı)
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=25', 'İş görüşmesi için lacivert takım', 178 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=7141', 'Ofis için beyaz bluz + pantolon', 145 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6546', 'Power suit - güçlü iş kadını', 267 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=1396', 'Bej blazer ile profesyonel şıklık', 198 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3564', 'Sunum günü için etkili kombin', 156 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=740', 'Yapılandırılmış elbise - toplantı', 134 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6819', 'Kurumsal iş yemeği kıyafeti', 112 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6992', 'Midi kalem etek + gömlek', 189 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=7277', 'Office casual - cuma kombin', 165 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3671', 'Konferans günü profesyonel stil', 223 FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
