import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { env } from '../../env.mjs';
import { stripe } from '../../lib/payments/stripe';

export const STRIPE_PROMOTION_PRODUCT_ID = env.STRIPE_PROMOTION_PRODUCT_ID || 'prod_NEEDS_TO_BE_SET_IN_ENV';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res);
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    let session = (await getSession({ req })) as any; // Temporary cast - replace with proper NextAuth type if needed

    if (!session) throw new Error('Missing session');
    
    const userSubs = await prisma.subscription.findMany({
      where: { userId: session.user.id }
    });
    res.status(200).json(userSubs);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
}

async function handlePost(req, res) {
  const priceId = req.body.priceId;
  const session = await getSession({ req });

  if (!priceId) {
    return res.status(400).json({ error: 'Missing price ID' });
  }

  const stripePrice = await stripe.prices.retrieve(priceId);

  const customer = await stripe.customers.create({
    email: session.user?.email
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: priceId
      }
    ],
    expand: ['latest_invoice.payment_intent']
  });

  const newSub = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      stripeSubscriptionId: subscription.id,
      status: 'active',
      priceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });

  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: {
      promotionTier: stripePrice.nickname
    }
  });

  res.status(200).json(newSub);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    const subId = req.query.id;
    if (!subId) {
      return res.status(400).json({ error: 'Missing subscription ID' });
    }

    // Find subscription in database
    const sub = await prisma.subscription.findUnique({
      where: { id: subId as string }
    });
    if (!sub || sub.userId !== session.user.id) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.del(sub.stripeSubscriptionId);

    // Mark as cancelled in database
    await prisma.subscription.update({
      where: { id: subId as string },
      data: { status: 'cancelled' }
    });

    res.status(200).json({ message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}