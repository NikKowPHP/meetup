import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already attending
    const existingAttendance = await prisma.userAttendingEvent.findFirst({
      where: {
        userId: user.id,
        eventId,
      },
    });

    if (existingAttendance) {
      // Remove attendance
      await prisma.userAttendingEvent.delete({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId
          }
        },
      });
      return res.status(200).json({ attending: false });
    }

    // Create new attendance record
    await prisma.userAttendingEvent.create({
      data: {
        userId: user.id,
        eventId,
      },
    });

    return res.status(200).json({ attending: true });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}