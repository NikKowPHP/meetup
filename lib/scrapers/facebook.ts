import puppeteer from 'puppeteer';
import { NormalizedEvent } from '../types/event';
import logger from '../utils/logger';

interface FacebookEvent {
  name: string;
  startTime: string;
  endTime?: string;
  description?: string;
  location?: {
    name?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  imageUrl?: string;
  eventUrl: string;
}

export async function scrapeFacebookEvents(pageUrl: string): Promise<NormalizedEvent[]> {
  let browser: puppeteer.Browser | null = null;
  
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    // Extract events from the page
    const events: FacebookEvent[] = await page.evaluate(() => {
      const eventNodes = Array.from(document.querySelectorAll('[role="article"]'));
      return eventNodes.map(node => {
        // This selector logic would need to be adjusted based on actual Facebook markup
        const name = node.querySelector('[data-testid="event-permalink-event-name"]')?.textContent?.trim() || '';
        const time = node.querySelector('[data-testid="event-time-info"]')?.textContent?.trim() || '';
        const location = node.querySelector('[data-testid="event-permalink-details"]')?.textContent?.trim() || '';
        const image = node.querySelector('img')?.src;
        const eventUrl = node.querySelector('a')?.href || '';

        return {
          name,
          startTime: time, // Would need actual date parsing
          location: {
            name: location
          },
          imageUrl: image,
          eventUrl
        };
      });
    });

    return events.map(event => ({
      title: event.name,
      start: event.startTime,
      end: event.endTime,
      description: event.description || '',
      location: {
        address: [event.location?.name, event.location?.address].filter(Boolean).join(', '),
        coordinates: event.location?.coordinates || null
      },
      imageUrl: event.imageUrl || '',
      sourceUrl: event.eventUrl
    }));

  } catch (error) {
    logger.error('Failed to scrape Facebook events', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}