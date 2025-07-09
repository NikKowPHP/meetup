import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const eventId = req.query.id as string;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const claimRequest = await prisma.eventClaimRequest.create({
      data: {
        status: 'PENDING',
        verificationToken,
        event: { connect: { id: eventId } },
        user: { connect: { id: user.id } }
      },
      include: {
        event: true,
        user: true
      }
    });

    // Log verification URL for development
    console.log(`Verification URL: /api/claims/verify?token=${verificationToken}`);

    return res.status(201).json(claimRequest);
  } catch (error) {
    console.error('Error creating claim request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}