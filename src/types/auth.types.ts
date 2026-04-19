import type { Session } from '@supabase/supabase-js';

export type ActiveRole = 'user' | 'stylist';

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profilePhoto: string | null;
  instagramUrl: string | null;
  createdAt: string;
  stylistProfile: StylistProfile | null;
}

export interface StylistProfile {
  id: string;
  userId: string;
  bio: string | null;
  cvText: string | null;
  instagramUrl: string | null;
  pricePerOutfit: number | null;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone?: string;
}

export interface CreateStylistProfileData {
  bio: string;
  cvText?: string;
  instagramUrl?: string;
  pricePerOutfit: number;
}

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: ActiveRole;
  isStylist: boolean;
  signIn: (credentials: LoginCredentials) => Promise<ServiceResult<boolean>>;
  signUp: (credentials: RegisterCredentials) => Promise<ServiceResult<boolean>>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ServiceResult<null>>;
  setActiveRole: (role: ActiveRole) => void;
  createStylistProfile: (data: CreateStylistProfileData) => Promise<ServiceResult<boolean>>;
}
