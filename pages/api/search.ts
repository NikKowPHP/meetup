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
          categories ? { categoryId: { in: String(categories).split(',') } } : {},
          startDate ? { startTime: { gte: new Date(String(startDate)) } } : {},
          endDate ? { endTime: { lte: new Date(String(endDate)) } } : {},
          priceType === 'free' ? { isFree: true } :
            priceType === 'paid' ? { isFree: false } : {},
          q ? {
            OR: [
              { title: { contains: String(q), mode: 'insensitive' } },
              { description: { contains: String(q), mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      orderBy: [
        { isFeatured: 'desc' },
        { startTime: 'asc' }
      ],
      include: {
        category: true
      }
    });

    // Convert to NormalizedEvent format
    const results: NormalizedEvent[] = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime.toISOString(),
      end: event.endTime?.toISOString(),
      description: event.description,
      location: {
        address: event.address || '',
        coordinates: event.latitude && event.longitude
          ? { lat: event.latitude, lng: event.longitude }
          : null
      },
      imageUrl: event.imageUrl || '',
      sourceUrl: event.sourceUrl,
      categories: event.category ? [event.category.name] : [],
      price: event.isFree ? 0 : undefined,
      source: 'eventbrite', // Default source
      status: event.status as 'DRAFT' | 'PUBLISHED' | 'FLAGGED'
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}