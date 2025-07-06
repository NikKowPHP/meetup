import { NormalizedEvent } from '../types/event';
import { logger } from '../utils/logger';
import { scrapeEventbriteEvents } from '../scrapers/eventbrite';
import { scrapeMeetupEvents } from '../scrapers/meetup';
import { scrapeFacebookEvents } from '../scrapers/facebook';
import { scrapeBlogEvents } from '../scrapers/blogs';
import { scrapeForumEvents } from '../scrapers/forums';

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
        const normalized = events.map(event => ({
          ...event,
          // Add any additional normalization here
        }));
        allEvents.push(...normalized);
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