import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Delete all user data in a transaction
    await prisma.$transaction([
      prisma.profile.deleteMany({ where: { userId: session.user.id } }),
      prisma.subscription.deleteMany({ where: { userId: session.user.id } }),
      prisma.eventAttendance.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } })
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('User deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete user data' });
  }
}