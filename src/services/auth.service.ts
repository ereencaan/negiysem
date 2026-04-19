import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  AppUser,
  StylistProfile,
  LoginCredentials,
  RegisterCredentials,
  CreateStylistProfileData,
  ServiceResult,
} from '../types/auth.types';
import type { DbUser, DbStylistProfile } from '../types/database.types';

function mapDbUserToAppUser(dbUser: DbUser, stylistProfile: StylistProfile | null): AppUser {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    phone: dbUser.phone,
    profilePhoto: dbUser.profile_photo,
    instagramUrl: dbUser.instagram_url,
    createdAt: dbUser.created_at,
    stylistProfile,
  };
}

function mapDbStylistProfile(db: DbStylistProfile): StylistProfile {
  return {
    id: db.id,
    userId: db.user_id,
    bio: db.bio,
    cvText: db.cv_text,
    instagramUrl: db.instagram_url,
    pricePerOutfit: db.price_per_outfit,
    rating: db.rating,
    totalReviews: db.total_reviews,
    isVerified: db.is_verified,
    createdAt: db.created_at,
  };
}

function mapAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'errors.invalid_credentials';
  if (msg.includes('user already registered')) return 'errors.email_taken';
  if (msg.includes('email already')) return 'errors.email_taken';
  return 'errors.generic';
}

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) return { data: null, error: mapAuthError(error) };
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async signUp(credentials: RegisterCredentials): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            phone: credentials.phone || null,
          },
        },
      });
      if (error) return { data: null, error: mapAuthError(error) };
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { data: null, error: mapAuthError(error) };
      return { data: null, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getStylistProfile(userId: string): Promise<StylistProfile | null> {
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return mapDbStylistProfile(data as DbStylistProfile);
    return null;
  },

  async createStylistProfile(
    userId: string,
    profileData: CreateStylistProfileData,
  ): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .insert({
          user_id: userId,
          bio: profileData.bio,
          cv_text: profileData.cvText || null,
          instagram_url: profileData.instagramUrl || null,
          price_per_outfit: profileData.pricePerOutfit,
          is_verified: false,
        });
      if (error) {
        if (error.code === '23505') return { data: null, error: 'errors.already_stylist' };
        return { data: null, error: 'errors.generic' };
      }
      return { data: true, error: null };
    } catch {
      return { data: null, error: 'errors.generic' };
    }
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const session = await this.getSession();
    if (!session) return null;

    // Retry logic for race condition with trigger
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        const stylistProfile = await this.getStylistProfile(session.user.id);
        return mapDbUserToAppUser(data as DbUser, stylistProfile);
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return null;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
