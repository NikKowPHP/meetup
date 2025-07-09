import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token is required' });
    }

    const claimRequest = await prisma.eventClaimRequest.findUnique({
      where: { verificationToken: token },
      include: { event: true }
    });

    if (!claimRequest) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    await prisma.$transaction([
      prisma.eventClaimRequest.update({
        where: { id: claimRequest.id },
        data: { status: 'APPROVED' }
      }),
      prisma.event.update({
        where: { id: claimRequest.event.id },
        data: { 
          status: 'PUBLISHED',
          organizerId: claimRequest.userId 
        }
      })
    ]);

    return res.redirect(302, '/organizer/dashboard');
  } catch (error) {
    console.error('Error verifying claim:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}