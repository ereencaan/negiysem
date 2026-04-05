import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  AppUser,
  LoginCredentials,
  RegisterUserCredentials,
  RegisterStylistCredentials,
  ServiceResult,
} from '../types/auth.types';
import type { DbUser } from '../types/database.types';

function mapDbUserToAppUser(dbUser: DbUser): AppUser {
  return {
    id: dbUser.id,
    email: dbUser.email,
    userType: dbUser.user_type,
    name: dbUser.name,
    phone: dbUser.phone,
    profilePhoto: dbUser.profile_photo,
    createdAt: dbUser.created_at,
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

  async signUpUser(credentials: RegisterUserCredentials): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            user_type: 'user',
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

  async signUpStylist(credentials: RegisterStylistCredentials): Promise<ServiceResult<boolean>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            user_type: 'stylist',
            name: credentials.name,
            phone: credentials.phone || null,
          },
        },
      });
      if (authError) return { data: null, error: mapAuthError(authError) };

      // Create stylist profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('stylist_profiles')
          .insert({
            user_id: authData.user.id,
            bio: credentials.bio,
            cv_text: credentials.cvText || null,
            instagram_url: credentials.instagramUrl || null,
            price_per_outfit: credentials.pricePerOutfit,
            is_verified: false,
          });
        if (profileError) {
          // Log error - orphaned auth user may need manual cleanup
          // admin.deleteUser is not available on client side
          console.error('Stylist profile creation failed:', profileError);
          return { data: null, error: 'errors.generic' };
        }
      }

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

      if (data && !error) return mapDbUserToAppUser(data as DbUser);

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
