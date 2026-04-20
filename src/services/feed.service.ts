import { supabase, getStorageUrl } from '../lib/supabase';
import type { ServiceResult } from '../types/auth.types';

export interface FeedPost {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  userName: string | null;
  userPhoto: string | null;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string | null;
  content: string;
  createdAt: string;
}

export const feedService = {
  async getFeedPosts(currentUserId?: string): Promise<FeedPost[]> {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        users!inner (name, profile_photo),
        post_comments (id),
        post_likes (user_id)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const user = item.users as Record<string, unknown>;
      const imagePath = item.image_path as string;
      const imageUrl = imagePath.startsWith('http')
        ? imagePath
        : (getStorageUrl(`feed/${imagePath}`) ?? '');
      const likes = (item.post_likes ?? []) as Array<Record<string, unknown>>;
      const comments = (item.post_comments ?? []) as Array<Record<string, unknown>>;
      return {
        id: item.id as string,
        userId: item.user_id as string,
        imageUrl,
        caption: item.caption as string | null,
        likesCount: item.likes_count as number,
        commentsCount: comments.length,
        isLiked: currentUserId ? likes.some(l => l.user_id === currentUserId) : false,
        createdAt: item.created_at as string,
        userName: user.name as string | null,
        userPhoto: user.profile_photo as string | null,
      };
    });
  },

  async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<boolean> {
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      return false;
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      return true;
    }
  },

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`*, users!inner (name)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((c: Record<string, unknown>) => {
      const u = c.users as Record<string, unknown>;
      return {
        id: c.id as string,
        userId: c.user_id as string,
        userName: u.name as string | null,
        content: c.content as string,
        createdAt: c.created_at as string,
      };
    });
  },

  async addComment(postId: string, userId: string, content: string): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content });
    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
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
