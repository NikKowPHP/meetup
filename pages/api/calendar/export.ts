import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateICS } from '../../../lib/calendar/icsGenerator';
import { prisma } from '../../../lib/prisma';

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

  const { eventIds } = req.body;

  if (!eventIds || !Array.isArray(eventIds)) {
    return res.status(400).json({ error: 'Event IDs array is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const events = await prisma.normalizedEvent.findMany({
      where: {
        id: { in: eventIds },
      },
    });

    if (events.length === 0) {
      return res.status(404).json({ error: 'No events found' });
    }

    // Generate combined ICS file
    const icsContent = events.map(event => generateICS(event)).join('\n');

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader(
      'Content-Disposition', 
      'attachment; filename="meetup_events.ics"'
    );
    return res.status(200).send(icsContent);
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}