export type UserType = 'user' | 'stylist';

export type OutfitRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';
export type MessageType = 'text' | 'image' | 'proposal';
export type Season = 'ilkbahar_yaz' | 'sonbahar_kis' | 'tum_sezonlar';
export type ClothingCategory = 'ust_giyim' | 'alt_giyim' | 'dis_giyim' | 'ayakkabi' | 'aksesuar';

export interface DbUser {
  id: string;
  email: string;
  user_type: UserType;
  name: string | null;
  phone: string | null;
  profile_photo: string | null;
  created_at: string;
}

export interface DbStylistProfile {
  id: string;
  user_id: string;
  bio: string | null;
  cv_text: string | null;
  instagram_url: string | null;
  price_per_outfit: number | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
}

export interface DbWardrobeItem {
  id: string;
  user_id: string;
  photo_path: string;
  category: ClothingCategory;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
  season: Season | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbClothingCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

export interface DbOutfitRequest {
  id: string;
  user_id: string;
  stylist_id: string;
  occasion: string | null;
  budget_range: string | null;
  message: string | null;
  status: OutfitRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface DbOutfitProposal {
  id: string;
  request_id: string;
  stylist_id: string;
  title: string | null;
  notes: string | null;
  proposal_photo_path: string | null;
  status: ProposalStatus;
  created_at: string;
}

export interface DbProposalItem {
  id: string;
  proposal_id: string;
  wardrobe_item_id: string;
}

export interface DbOutfitHistory {
  id: string;
  user_id: string;
  proposal_id: string;
  worn_date: string | null;
  rating: number | null;
  notes: string | null;
  photo_path: string | null;
  created_at: string;
}

export interface DbMessage {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
}

export interface DbPayment {
  id: string;
  request_id: string;
  user_id: string;
  stylist_id: string;
  total_amount: number;
  platform_commission: number;
  stylist_payout: number;
  currency: string;
  payment_provider: string | null;
  provider_payment_id: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface DbReview {
  id: string;
  user_id: string;
  stylist_id: string;
  request_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}
