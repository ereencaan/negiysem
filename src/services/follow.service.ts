import { supabase } from '../lib/supabase';

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export const followService = {
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !!data;
  },

  async toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean): Promise<boolean> {
    if (currentlyFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      return false;
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
      return true;
    }
  },

  async getFollowStats(userId: string): Promise<FollowStats> {
    const [followers, following] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ]);
    return {
      followersCount: followers.count ?? 0,
      followingCount: following.count ?? 0,
    };
  },

  async getFollowingIds(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    if (!data) return [];
    return data.map(d => (d as { following_id: string }).following_id);
  },
};
