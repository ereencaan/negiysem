import { supabase } from '../lib/supabase';
import type { DbOutfitRequest, OutfitRequestStatus } from '../types/database.types';
import type { ServiceResult } from '../types/auth.types';

export interface OutfitRequestWithDetails extends DbOutfitRequest {
  stylistName?: string | null;
  userName?: string | null;
}

export interface CreateRequestData {
  userId: string;
  stylistId: string;
  occasion?: string;
  budgetRange?: string;
  message?: string;
}

export const requestService = {
  async getUserRequests(userId: string): Promise<OutfitRequestWithDetails[]> {
    const { data, error } = await supabase
      .from('outfit_requests')
      .select(`
        *,
        stylist:users!outfit_requests_stylist_id_fkey (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const stylist = item.stylist as Record<string, unknown> | null;
      return {
        ...(item as unknown as DbOutfitRequest),
        stylistName: stylist?.name as string | null,
      };
    });
  },

  async getStylistRequests(stylistId: string): Promise<OutfitRequestWithDetails[]> {
    const { data, error } = await supabase
      .from('outfit_requests')
      .select(`
        *,
        user:users!outfit_requests_user_id_fkey (name)
      `)
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => {
      const user = item.user as Record<string, unknown> | null;
      return {
        ...(item as unknown as DbOutfitRequest),
        userName: user?.name as string | null,
      };
    });
  },

  async createOutfitRequest(data: CreateRequestData): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('outfit_requests')
        .insert({
          user_id: data.userId,
          stylist_id: data.stylistId,
          occasion: data.occasion || null,
          budget_range: data.budgetRange || null,
          message: data.message || null,
          status: 'pending',
        });

      if (error) return { data: null, error: 'errors.generic' };
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async updateRequestStatus(
    requestId: string,
    status: OutfitRequestStatus,
  ): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('outfit_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
  },
};
