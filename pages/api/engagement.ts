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

  const { eventId, status } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  if (status && !['interested', 'attending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already attending
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: {
        userId: user.id,
        eventId,
      },
    });

    if (existingAttendance) {
      if (status) {
        // Update existing record with new status
        const updated = await prisma.eventAttendance.update({
          where: { id: existingAttendance.id },
          data: { status }
        });
        return res.status(200).json({ status: updated.status });
      } else {
        // Remove attendance if no status provided (backward compatibility)
        await prisma.eventAttendance.delete({
          where: { id: existingAttendance.id },
        });
        return res.status(200).json({ status: null });
      }
    }

    // Create new attendance record
    const newAttendance = await prisma.eventAttendance.create({
      data: {
        userId: user.id,
        eventId,
        status: status || 'interested' // Default to interested if no status provided
      },
    });

    return res.status(200).json({ status: newAttendance.status });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}