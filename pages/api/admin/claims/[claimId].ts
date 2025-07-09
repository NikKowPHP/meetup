import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const claimId = req.query.claimId as string;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const claim = await prisma.eventClaimRequest.findUnique({
      where: { id: claimId },
      include: { event: true }
    });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (status === 'APPROVED') {
      await prisma.$transaction([
        prisma.eventClaimRequest.update({
          where: { id: claimId },
          data: { status: 'APPROVED' }
        }),
        prisma.event.update({
          where: { id: claim.eventId },
          data: { 
            status: 'PUBLISHED',
            organizerId: claim.userId 
          }
        })
      ]);
    } else {
      await prisma.eventClaimRequest.update({
        where: { id: claimId },
        data: { status: 'REJECTED' }
      });
    }

    return res.status(200).json({ message: 'Claim updated successfully' });
  } catch (error) {
    console.error('Error updating claim:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}