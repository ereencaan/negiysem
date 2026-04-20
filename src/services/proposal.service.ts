import { supabase, getStorageUrl } from '../lib/supabase';
import type { ServiceResult } from '../types/auth.types';
import type { DbOutfitProposal, DbWardrobeItem } from '../types/database.types';

export interface ExternalProduct {
  name: string;
  url: string;
  store?: string;
}

export interface ProposalWardrobeItem {
  id: string;
  photoUrl: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
}

export interface OutfitProposal {
  id: string;
  requestId: string;
  stylistId: string;
  title: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  items: ProposalWardrobeItem[];
  externalProducts: ExternalProduct[];
}

export interface CreateProposalData {
  requestId: string;
  stylistId: string;
  title: string;
  notes?: string;
  wardrobeItemIds: string[];
  externalProducts?: ExternalProduct[];
}

function mapWardrobe(db: DbWardrobeItem): ProposalWardrobeItem {
  return {
    id: db.id,
    photoUrl: db.photo_path
      ? (db.photo_path.startsWith('http')
          ? db.photo_path
          : (getStorageUrl(`wardrobe/${db.photo_path}`) ?? ''))
      : '',
    category: db.category,
    subcategory: db.subcategory,
    color: db.color,
    brand: db.brand,
  };
}

export const proposalService = {
  async createProposal(data: CreateProposalData): Promise<ServiceResult<string>> {
    try {
      const { data: proposal, error } = await supabase
        .from('outfit_proposals')
        .insert({
          request_id: data.requestId,
          stylist_id: data.stylistId,
          title: data.title,
          notes: data.notes || null,
          external_products: data.externalProducts || [],
          status: 'pending',
        })
        .select('id')
        .single();

      if (error || !proposal) return { data: null, error: 'errors.generic' };

      const proposalId = (proposal as { id: string }).id;

      if (data.wardrobeItemIds.length > 0) {
        const { error: itemsError } = await supabase
          .from('proposal_items')
          .insert(
            data.wardrobeItemIds.map(wid => ({
              proposal_id: proposalId,
              wardrobe_item_id: wid,
            })),
          );
        if (itemsError) return { data: null, error: 'errors.generic' };
      }

      return { data: proposalId, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async getProposalsForRequest(requestId: string): Promise<OutfitProposal[]> {
    const { data, error } = await supabase
      .from('outfit_proposals')
      .select(`
        *,
        proposal_items (
          wardrobe_item_id,
          wardrobe_items (*)
        )
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: Record<string, unknown>) => {
      const db = p as unknown as DbOutfitProposal;
      const rawItems = (p.proposal_items ?? []) as Array<Record<string, unknown>>;
      const items = rawItems
        .map(pi => pi.wardrobe_items as DbWardrobeItem | null)
        .filter((w): w is DbWardrobeItem => !!w)
        .map(mapWardrobe);

      return {
        id: db.id,
        requestId: db.request_id,
        stylistId: db.stylist_id,
        title: db.title,
        notes: db.notes,
        status: db.status,
        createdAt: db.created_at,
        items,
        externalProducts: ((p.external_products as ExternalProduct[]) ?? []),
      };
    });
  },
};
