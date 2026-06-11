import { supabase } from '../lib/supabase';

export interface EligibilityStatus {
  wardrobeCount: number;
  wardrobeRequired: number;
  postsCount: number;
  postsRequired: number;
  totalLikes: number;
  likesRequired: number;
  followingCount: number;
  followingRequired: number;
  hasProfilePhoto: boolean;
  hasBio: boolean;
  profileComplete: boolean;
  allMet: boolean;
  metCount: number;
  totalConditions: number;
}

const REQUIREMENTS = {
  wardrobe: 10,
  posts: 5,
  likes: 20,
  following: 3,
};

export const eligibilityService = {
  async checkEligibility(userId: string): Promise<EligibilityStatus> {
    const [wardrobeRes, postsRes, likesRes, followingRes, userRes] = await Promise.all([
      supabase.from('wardrobe_items').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
      supabase.from('feed_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('post_likes').select('id', { count: 'exact', head: true }).in(
        'post_id',
        supabase.from('feed_posts').select('id').eq('user_id', userId) as unknown as string[],
      ),
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('users').select('profile_photo, bio').eq('id', userId).single(),
    ]);

    // Likes count needs a different approach since .in with subquery doesn't work well
    let totalLikes = 0;
    const { data: userPosts } = await supabase.from('feed_posts').select('likes_count').eq('user_id', userId);
    if (userPosts) {
      totalLikes = userPosts.reduce((sum, p) => sum + ((p as { likes_count: number }).likes_count || 0), 0);
    }

    const wardrobeCount = wardrobeRes.count ?? 0;
    const postsCount = postsRes.count ?? 0;
    const followingCount = followingRes.count ?? 0;
    const userData = userRes.data as { profile_photo: string | null; bio: string | null } | null;
    const hasProfilePhoto = !!(userData?.profile_photo);
    const hasBio = !!(userData?.bio);
    const profileComplete = hasProfilePhoto && hasBio;

    const conditions = [
      wardrobeCount >= REQUIREMENTS.wardrobe,
      postsCount >= REQUIREMENTS.posts,
      totalLikes >= REQUIREMENTS.likes,
      followingCount >= REQUIREMENTS.following,
      profileComplete,
    ];
    const metCount = conditions.filter(Boolean).length;

    return {
      wardrobeCount,
      wardrobeRequired: REQUIREMENTS.wardrobe,
      postsCount,
      postsRequired: REQUIREMENTS.posts,
      totalLikes,
      likesRequired: REQUIREMENTS.likes,
      followingCount,
      followingRequired: REQUIREMENTS.following,
      hasProfilePhoto,
      hasBio,
      profileComplete,
      allMet: metCount === conditions.length,
      metCount,
      totalConditions: conditions.length,
    };
  },

  async activateStyling(userId: string, price: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ can_style: true, style_price: price })
      .eq('id', userId);
    return !error;
  },
};
