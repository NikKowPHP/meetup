export interface NormalizedEvent {
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
}