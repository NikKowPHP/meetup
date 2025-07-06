import { NextApiRequest, NextApiResponse } from 'next';
import { createEventFilter } from '../../lib/filters/combinators';
import { NormalizedEvent } from '../../types/event';
import { prisma } from '../../lib/prisma';

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

    // Query events from database
    const events = await prisma.event.findMany({
      where: {
        AND: [
          categories ? { categories: { hasSome: String(categories).split(',') } } : {},
          startDate ? { start: { gte: new Date(String(startDate)) } } : {},
          endDate ? { end: { lte: new Date(String(endDate)) } } : {},
          priceType === 'free' ? { price: 0 } :
            priceType === 'paid' ? { price: { gt: 0 } } : {},
          q ? {
            OR: [
              { title: { contains: String(q), mode: 'insensitive' } },
              { description: { contains: String(q), mode: 'insensitive' } }
            ]
          } : {}
        ]
      }
    });

    // Convert to NormalizedEvent format
    const results: NormalizedEvent[] = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      description: event.description,
      location: event.location as { address: string; coordinates: { lat: number; lng: number } },
      imageUrl: event.imageUrl || '',
      sourceUrl: event.sourceUrl,
      categories: event.categories,
      price: event.price || undefined,
      source: event.source as 'eventbrite' | 'meetup' | 'facebook' | 'blog' | 'forum'
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}