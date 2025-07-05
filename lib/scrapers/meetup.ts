import axios from 'axios';
import { NormalizedEvent } from '../types/event';
import logger from '../utils/logger';

const MEETUP_API_KEY = process.env.MEETUP_API_KEY;
const BASE_URL = 'https://api.meetup.com';

interface MeetupEvent {
  name: string;
  time: number;
  duration?: number;
  description?: string;
  venue?: {
    address_1?: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
  link: string;
  featured_photo?: {
    photo_link?: string;
  };
}

export async function scrapeMeetupEvents(): Promise<NormalizedEvent[]> {
  if (!MEETUP_API_KEY) {
    throw new Error('Meetup API key not configured');
  }

  try {
    const response = await axios.get(`${BASE_URL}/find/upcoming_events`, {
      params: {
        key: MEETUP_API_KEY,
        fields: 'featured_photo'
      }
    });

    return response.data.events.map((event: MeetupEvent) => ({
      title: event.name,
      start: new Date(event.time).toISOString(),
      end: event.duration 
        ? new Date(event.time + event.duration).toISOString()
        : undefined,
      description: event.description || '',
      location: {
        address: [event.venue?.address_1, event.venue?.city]
          .filter(Boolean).join(', '),
        coordinates: event.venue?.lat && event.venue.lon
          ? { lat: event.venue.lat, lng: event.venue.lon }
          : null
      },
      imageUrl: event.featured_photo?.photo_link || '',
      sourceUrl: event.link
    }));
  } catch (error) {
    logger.error('Failed to scrape Meetup events', error);
    throw error;
  }
}