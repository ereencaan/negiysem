import { supabase, getStorageUrl } from '../lib/supabase';
import type { DbWardrobeItem, DbClothingCategory } from '../types/database.types';
import type { ServiceResult } from '../types/auth.types';

export interface WardrobeItem extends Omit<DbWardrobeItem, 'photo_path'> {
  photoUrl: string;
}

export interface AddWardrobeItemData {
  userId: string;
  photoUri: string;
  category: string;
  subcategory?: string;
  color?: string;
  brand?: string;
  season?: string;
  description?: string;
}

function mapItem(db: DbWardrobeItem): WardrobeItem {
  const { photo_path, ...rest } = db;
  return {
    ...rest,
    photoUrl: photo_path
      ? (photo_path.startsWith('http://') || photo_path.startsWith('https://')
          ? photo_path
          : (getStorageUrl(`wardrobe/${photo_path}`) ?? ''))
      : '',
  };
}

export const wardrobeService = {
  async getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(item => mapItem(item as DbWardrobeItem));
  },

  async addWardrobeItem(item: AddWardrobeItemData): Promise<ServiceResult<boolean>> {
    try {
      let photoPath = '';

      // Upload photo if provided
      if (item.photoUri) {
        const fileName = `${item.userId}/${Date.now()}.jpg`;

        // Convert URI to uploadable format
        const response = await fetch(item.photoUri);
        const blob = await response.blob();

        // Use File object for web compatibility
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const { error: uploadError } = await supabase.storage
          .from('wardrobe')
          .upload(fileName, file, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return { data: null, error: 'errors.generic' };
        }
        photoPath = fileName;
      }

      // Insert DB record
      const { error: dbError } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: item.userId,
          photo_path: photoPath || 'placeholder',
          category: item.category,
          subcategory: item.subcategory || null,
          color: item.color || null,
          brand: item.brand || null,
          season: item.season || null,
          description: item.description || null,
        });

      if (dbError) return { data: null, error: 'errors.generic' };
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async deleteWardrobeItem(id: string): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('wardrobe_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
  },

  async getCategories(): Promise<DbClothingCategory[]> {
    const { data } = await supabase
      .from('clothing_categories')
      .select('*')
      .order('name');

    return (data as DbClothingCategory[]) || [];
  },
};
