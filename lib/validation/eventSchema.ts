import { z } from 'zod';
import { NormalizedEvent } from '../types/event';

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number()
}).nullable();

const locationSchema = z.object({
  address: z.string(),
  coordinates: coordinatesSchema
});

export const eventSchema = z.object({
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
  description: z.string(),
  location: locationSchema,
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url()
}) satisfies z.ZodType<NormalizedEvent>;