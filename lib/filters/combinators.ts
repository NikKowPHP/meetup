import { NormalizedEvent } from '../../types/event';

type FilterCriteria = {
  categories?: string[];
  dateRange?: { start: Date | null; end: Date | null };
  priceType?: 'free' | 'paid' | 'all';
};

export function createEventFilter(criteria: FilterCriteria) {
  return (event: NormalizedEvent): boolean => {
    // Category filter
    if (criteria.categories && criteria.categories.length > 0) {
      const hasMatchingCategory = event.categories.some(category =>
        criteria.categories?.includes(category)
      );
      if (!hasMatchingCategory) return false;
    }

    // Date range filter
    if (criteria.dateRange?.start || criteria.dateRange?.end) {
      const eventDate = new Date(event.start);
      if (criteria.dateRange.start && eventDate < criteria.dateRange.start) {
        return false;
      }
      if (criteria.dateRange.end && eventDate > criteria.dateRange.end) {
        return false;
      }
    }

    // Price filter
    if (criteria.priceType && criteria.priceType !== 'all') {
      const isFree = event.price === undefined || event.price === 0;
      if (criteria.priceType === 'free' && !isFree) return false;
      if (criteria.priceType === 'paid' && isFree) return false;
    }

    return true;
  };
}