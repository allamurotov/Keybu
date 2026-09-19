import { create } from 'zustand';
import { baseAPI } from '@/app/lib/utils';

interface UserProfile {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  file: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await baseAPI.get('/profile');
      set({ profile: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Profil yuklanishida xatolik', 
        isLoading: false 
      });
    }
  },
}));
