import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/payments/stripe';
import { buffer } from 'micro';
import { env } from '../../../env.mjs';
import { processStripeRevenueEvent } from '../../../lib/analytics/revenue';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const body = await buffer(req);

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  await processStripeRevenueEvent(event);

  return res.status(200).json({ received: true });
}