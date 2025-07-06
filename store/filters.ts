import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  categories: string[];
  dateRange: { start: Date | null; end: Date | null };
  priceType: 'all' | 'free' | 'paid';
  searchQuery: string;
  setCategories: (categories: string[]) => void;
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  setPriceType: (type: 'all' | 'free' | 'paid') => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      categories: [],
      dateRange: { start: null, end: null },
      priceType: 'all',
      searchQuery: '',
      setCategories: (categories) => set({ categories }),
      setDateRange: (dateRange) => set({ dateRange }),
      setPriceType: (priceType) => set({ priceType }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      resetFilters: () => set({ 
        categories: [],
        dateRange: { start: null, end: null },
        priceType: 'all',
        searchQuery: ''
      })
    }),
    {
      name: 'event-filters-storage',
      getStorage: () => localStorage,
    }
  )
);