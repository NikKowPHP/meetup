import { NextApiRequest, NextApiResponse } from 'next';
import { createEventFilter } from '../../lib/filters/combinators';
import { NormalizedEvent } from '../../types/event';

// Mock data - in a real app this would come from your database
const mockEvents: NormalizedEvent[] = [
  {
    id: '1',
    title: 'Tech Conference',
    start: '2025-07-15T09:00:00',
    description: 'Annual technology conference',
    location: {
      address: '123 Main St',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    imageUrl: '/images/tech-conf.jpg',
    sourceUrl: 'https://example.com/tech-conf',
    categories: ['technology', 'conference'],
    price: 100,
    source: 'eventbrite'
  },
  // More mock events...
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { q, categories, startDate, endDate, priceType } = req.query;

    // Create filter function based on query params
    const filter = createEventFilter({
      categories: categories ? String(categories).split(',') : undefined,
      dateRange: {
        start: startDate ? new Date(String(startDate)) : null,
        end: endDate ? new Date(String(endDate)) : null
      },
      priceType: priceType as 'free' | 'paid' | 'all' | undefined
    });

    // Filter events
    let results = mockEvents.filter(filter);

    // Text search if query present
    if (q) {
      const query = String(q).toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query)
      );
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}