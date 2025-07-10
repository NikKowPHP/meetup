import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Not an admin' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { status } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Bad Request: Event ID is missing or invalid' });
    }

    if (!status || !['DRAFT', 'PUBLISHED', 'FLAGGED'].includes(status)) {
      return res.status(400).json({ message: 'Bad Request: Invalid status provided' });
    }

    try {
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: { status },
      });
      res.status(200).json(updatedEvent);
    } catch (error) {
      console.error('Error updating event status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}