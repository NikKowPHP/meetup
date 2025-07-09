import { NormalizedEvent } from '../../types/event';
import logger from '../utils/logger';
import { scrapeEventbriteEvents } from '../scrapers/eventbrite';
import { scrapeMeetupEvents } from '../scrapers/meetup';
import { scrapeFacebookEvents } from '../scrapers/facebook';
import { scrapeBlogEvents } from '../scrapers/blogs';
import { scrapeForumEvents } from '../scrapers/forums';
import { prisma } from '../prisma';

export async function normalizeAllEvents(): Promise<NormalizedEvent[]> {
  try {
    const eventSources = [
      { name: 'Eventbrite', scraper: scrapeEventbriteEvents },
      { name: 'Meetup', scraper: scrapeMeetupEvents },
      { name: 'Facebook', scraper: scrapeFacebookEvents },
      { name: 'Blogs', scraper: scrapeBlogEvents },
      { name: 'Forums', scraper: scrapeForumEvents }
    ];

    const allEvents: NormalizedEvent[] = [];
    
    for (const source of eventSources) {
      try {
        const events = await source.scraper();
        const normalized = await Promise.all(events.map(async event => {
          // Check for existing event with same sourceUrl
          const existing = await prisma.event.findFirst({
            where: { sourceUrl: event.sourceUrl }
          });
          
          if (existing) {
            logger.debug(`Skipping duplicate event: ${event.sourceUrl}`);
            return null;
          }
          
          return {
            ...event,
            // Add any additional normalization here
          };
        }));
        
        // Filter out nulls (duplicates) before adding to allEvents
        allEvents.push(...normalized.filter(Boolean) as NormalizedEvent[]);
      } catch (error) {
        logger.error(`Failed to normalize ${source.name} events`, error);
      }
    }

    return allEvents;
  } catch (error) {
    logger.error('Event normalization pipeline failed', error);
    throw error;
  }
}