export interface NormalizedEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
  };
  imageUrl: string;
  sourceUrl: string;
  categories: string[];
  price?: number;
  source: 'eventbrite' | 'meetup' | 'facebook' | 'blog' | 'forum';
  status: 'DRAFT' | 'PUBLISHED' | 'FLAGGED';
}