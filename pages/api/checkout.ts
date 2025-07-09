import { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession, stripe } from '../../lib/payments/stripe';
import { env } from '../../env.mjs';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });
    
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: 'User has no payment method configured' });
    }

    const { priceId, metadata } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const stripePrice = await stripe.prices.retrieve(priceId);
    if (stripePrice.product !== env.STRIPE_PROMOTION_PRODUCT_ID) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    const checkoutSession = await createCheckoutSession(
      user.stripeCustomerId,
      priceId,
      metadata
    );

    return res.status(200).json({ sessionId: checkoutSession.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}