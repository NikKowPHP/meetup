import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/payments/stripe';
import { buffer } from 'micro';
import { env } from '../../../env.mjs';
import { processStripeRevenueEvent } from '../../../lib/analytics/revenue';
import { prisma } from '../../../lib/prisma';

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

  try {
    await processStripeRevenueEvent(event);

    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data.object;
      const eventId = checkoutSession.metadata?.eventId;
      
      if (eventId) {
        await prisma.$transaction([
          prisma.promotion.create({
            data: {
              eventId,
              stripeChargeId: typeof checkoutSession.payment_intent === 'string'
                ? checkoutSession.payment_intent
                : checkoutSession.payment_intent?.id || '',
              promotionTier: checkoutSession.metadata?.tier || 'STANDARD',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
          }),
          prisma.event.update({
            where: { id: eventId },
            data: { isFeatured: true }
          })
        ]);
      }
    }

    // Handle B2C subscription events
    if (event.type === 'invoice.paid' || event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || '';

      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: { subscriptionTier: 'PRO' }
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

      await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: { subscriptionTier: 'FREE' }
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}