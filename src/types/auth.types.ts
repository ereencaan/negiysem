import type { Session } from '@supabase/supabase-js';

export type UserType = 'user' | 'stylist';

export interface AppUser {
  id: string;
  email: string;
  userType: UserType;
  name: string | null;
  phone: string | null;
  profilePhoto: string | null;
  createdAt: string;
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

export interface RegisterUserCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone?: string;
}

export interface RegisterStylistCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone?: string;
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
  signIn: (credentials: LoginCredentials) => Promise<ServiceResult<boolean>>;
  signUpUser: (credentials: RegisterUserCredentials) => Promise<ServiceResult<boolean>>;
  signUpStylist: (credentials: RegisterStylistCredentials) => Promise<ServiceResult<boolean>>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ServiceResult<null>>;
}
