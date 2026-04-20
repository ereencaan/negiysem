import { supabase, getStorageUrl } from '../lib/supabase';

export interface StylistListItem {
  id: string;
  name: string | null;
  email: string;
  profilePhoto: string | null;
  bio: string | null;
  pricePerOutfit: number | null;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface StylistPortfolioItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  createdAt: string;
}

export const stylistService = {
  async getStylistList(): Promise<StylistListItem[]> {
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select(`
        id,
        bio,
        price_per_outfit,
        rating,
        total_reviews,
        is_verified,
        user_id,
        users!inner (
          id,
          name,
          email,
          profile_photo
        )
      `)
      .eq('is_verified', true)
      .order('rating', { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const user = item.users as Record<string, unknown>;
      return {
        id: item.user_id as string,
        name: user.name as string | null,
        email: user.email as string,
        profilePhoto: user.profile_photo as string | null,
        bio: item.bio as string | null,
        pricePerOutfit: item.price_per_outfit as number | null,
        rating: item.rating as number,
        totalReviews: item.total_reviews as number,
        isVerified: item.is_verified as boolean,
      };
    });
  },

  async getStylistById(userId: string): Promise<StylistListItem | null> {
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select(`
        id,
        bio,
        price_per_outfit,
        rating,
        total_reviews,
        is_verified,
        user_id,
        users!inner (
          id,
          name,
          email,
          profile_photo
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    const user = (data as Record<string, unknown>).users as Record<string, unknown>;
    return {
      id: (data as Record<string, unknown>).user_id as string,
      name: user.name as string | null,
      email: user.email as string,
      profilePhoto: user.profile_photo as string | null,
      bio: (data as Record<string, unknown>).bio as string | null,
      pricePerOutfit: (data as Record<string, unknown>).price_per_outfit as number | null,
      rating: (data as Record<string, unknown>).rating as number,
      totalReviews: (data as Record<string, unknown>).total_reviews as number,
      isVerified: (data as Record<string, unknown>).is_verified as boolean,
    };
  },

  async getStylistPortfolio(userId: string): Promise<StylistPortfolioItem[]> {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('id, image_path, caption, likes_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const imagePath = item.image_path as string;
      const imageUrl = imagePath.startsWith('http')
        ? imagePath
        : (getStorageUrl(`feed/${imagePath}`) ?? '');
      return {
        id: item.id as string,
        imageUrl,
        caption: item.caption as string | null,
        likesCount: item.likes_count as number,
        createdAt: item.created_at as string,
      };
    });
  },
};
