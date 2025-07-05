import axios from 'axios';
import { NormalizedEvent } from '../types/event';
import logger from '../utils/logger';

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const BASE_URL = 'https://www.eventbriteapi.com/v3';

interface EventbriteEvent {
  name: { text: string };
  start: { utc: string };
  end?: { utc: string };
  description?: { text: string };
  venue?: {
    address?: {
      localized_address_display?: string;
    };
    latitude?: number;
    longitude?: number;
  };
  logo?: { original?: { url: string } };
  url: string;
}

export async function scrapeEventbriteEvents(): Promise<NormalizedEvent[]> {
  if (!EVENTBRITE_API_KEY) {
    throw new Error('Eventbrite API key not configured');
  }

  try {
    const response = await axios.get(`${BASE_URL}/users/me/owned_events`, {
      headers: { Authorization: `Bearer ${EVENTBRITE_API_KEY}` },
      params: { expand: 'venue' },
    });

    return response.data.events.map((event: EventbriteEvent) => ({
      title: event.name.text,
      start: event.start.utc,
      end: event.end?.utc,
      description: event.description?.text || '',
      location: {
        address: event.venue?.address?.localized_address_display || '',
        coordinates: event.venue?.latitude && event.venue.longitude 
          ? { lat: event.venue.latitude, lng: event.venue.longitude }
          : null,
      },
      imageUrl: event.logo?.original?.url || '',
      sourceUrl: event.url,
    }));
  } catch (error) {
    logger.error('Failed to scrape Eventbrite events', error);
    throw error;
  }
}