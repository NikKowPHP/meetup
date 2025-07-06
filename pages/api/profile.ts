import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query;
  
  // Get user session
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const profile = await prisma.profile.findUnique({
          where: { userId: id as string || userId }
        });
        return res.status(200).json(profile);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

    case 'PUT':
      try {
        const updatedProfile = await prisma.profile.update({
          where: { userId },
          data: {
            ...req.body,
            updated_at: new Date()
          }
        });
        return res.status(200).json(updatedProfile);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}