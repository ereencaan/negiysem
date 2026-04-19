import { supabase } from '../lib/supabase';
import type { ServiceResult } from '../types/auth.types';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  instagramUrl?: string;
}

export interface UpdateStylistProfileData {
  bio?: string;
  cvText?: string;
  instagramUrl?: string;
  pricePerOutfit?: number;
}

export const profileService = {
  async updateUserProfile(userId: string, data: UpdateProfileData): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        phone: data.phone || null,
        instagram_url: data.instagramUrl || null,
      })
      .eq('id', userId);

    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
  },

  async updateStylistProfile(userId: string, data: UpdateStylistProfileData): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('stylist_profiles')
      .update({
        bio: data.bio,
        cv_text: data.cvText || null,
        instagram_url: data.instagramUrl || null,
        price_per_outfit: data.pricePerOutfit,
      })
      .eq('user_id', userId);

    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
  },
};
