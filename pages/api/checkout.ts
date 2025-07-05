import { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession } from '../../lib/payments/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const email = session?.user?.email;
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { priceId, metadata } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const checkoutSession = await createCheckoutSession(
      email,
      priceId,
      metadata
    );

    return res.status(200).json({ sessionId: checkoutSession.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}