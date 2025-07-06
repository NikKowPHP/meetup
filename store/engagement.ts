import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EngagementState {
  joinedEvents: string[];
  loading: boolean;
  error: string | null;
  toggleAttendance: (eventId: string) => Promise<void>;
  isJoined: (eventId: string) => boolean;
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      joinedEvents: [],
      loading: false,
      error: null,
      
      toggleAttendance: async (eventId: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/engagement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventId }),
          });

          if (!response.ok) {
            throw new Error('Failed to update attendance');
          }

          const { attending } = await response.json();
          set((state) => ({
            joinedEvents: attending
              ? [...state.joinedEvents, eventId]
              : state.joinedEvents.filter(id => id !== eventId),
            loading: false
          }));
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Unknown error',
            loading: false 
          });
        }
      },
      
      isJoined: (eventId: string) => {
        return get().joinedEvents.includes(eventId);
      }
    }),
    {
      name: 'engagement-storage',
      partialize: (state) => ({ joinedEvents: state.joinedEvents })
    }
  )
);