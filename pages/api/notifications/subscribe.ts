import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.method === 'POST') {
      const { endpoint, keys } = req.body;

      if (!endpoint || !keys) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint,
          keys
        }
      });

      return res.status(201).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint' });
      }

      const subscription = await prisma.pushSubscription.findFirst({
        where: {
          userId: user.id,
          endpoint
        }
      });

      if (subscription) {
        await prisma.pushSubscription.delete({
          where: { id: subscription.id }
        });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Push subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}