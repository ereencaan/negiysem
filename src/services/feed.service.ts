import { supabase, getStorageUrl } from '../lib/supabase';
import type { ServiceResult } from '../types/auth.types';

export interface FeedPost {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  createdAt: string;
  userName: string | null;
  userPhoto: string | null;
}

export const feedService = {
  async getFeedPosts(): Promise<FeedPost[]> {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        users!inner (
          name,
          profile_photo
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const user = item.users as Record<string, unknown>;
      return {
        id: item.id as string,
        userId: item.user_id as string,
        imageUrl: getStorageUrl(`feed/${item.image_path}`) ?? '',
        caption: item.caption as string | null,
        likesCount: item.likes_count as number,
        createdAt: item.created_at as string,
        userName: user.name as string | null,
        userPhoto: user.profile_photo as string | null,
      };
    });
  },

  async createFeedPost(
    userId: string,
    imageUri: string,
    caption?: string,
  ): Promise<ServiceResult<boolean>> {
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('feed')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) return { data: null, error: 'errors.generic' };

      const { error: dbError } = await supabase
        .from('feed_posts')
        .insert({
          user_id: userId,
          image_path: fileName,
          caption: caption || null,
        });

      if (dbError) return { data: null, error: 'errors.generic' };
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },
};
