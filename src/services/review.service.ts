import { supabase } from '../lib/supabase';
import type { ServiceResult } from '../types/auth.types';

export interface CreateReviewData {
  userId: string;
  stylistId: string;
  requestId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  async createReview(data: CreateReviewData): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: data.userId,
        stylist_id: data.stylistId,
        request_id: data.requestId,
        rating: data.rating,
        comment: data.comment || null,
      });

    if (error) {
      if (error.code === '23505') return { data: null, error: 'errors.already_reviewed' };
      return { data: null, error: 'errors.generic' };
    }

    // Update stylist's rating aggregate
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', data.stylistId);

    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + (r as { rating: number }).rating, 0) / reviews.length;
      await supabase
        .from('stylist_profiles')
        .update({
          rating: Math.round(avg * 10) / 10,
          total_reviews: reviews.length,
        })
        .eq('user_id', data.stylistId);
    }

    return { data: true, error: null };
  },

  async hasUserReviewed(userId: string, requestId: string): Promise<boolean> {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('request_id', requestId)
      .maybeSingle();
    return !!data;
  },
};
