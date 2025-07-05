import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/auth/supabaseClient';
import { Profile } from '../lib/validation/profileSchema';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      
      fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ profile: null, loading: false });
            return;
          }

          const response = await fetch(`/api/profile?id=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch profile');
          
          const profile = await response.json();
          set({ profile, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      updateProfile: async (updates) => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`/api/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update profile');
          
          const updatedProfile = await response.json();
          set((state) => ({
            profile: { ...state.profile, ...updatedProfile },
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      }
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);