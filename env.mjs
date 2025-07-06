import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
      STRIPE_PROMOTION_PRODUCT_ID: z.string().uuid(),
      STRIPE_SECRET_KEY: z.string().min(1),
      STRIPE_WEBHOOK_SECRET: z.string().min(1),
      DATABASE_URL: z.string().url(),
      EVENTBRITE_API_KEY: z.string().min(1),
      MEETUP_API_KEY: z.string().min(1),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
      NEXTAUTH_SECRET: z.string().min(1),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      EVENTBRITE_API_KEY: process.env.EVENTBRITE_API_KEY,
      MEETUP_API_KEY: process.env.MEETUP_API_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});