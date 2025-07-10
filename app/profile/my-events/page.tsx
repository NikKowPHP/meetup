"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NormalizedEvent } from '@/types/event';
import Link from 'next/link';

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const [attendedEvents, setAttendedEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendedEvents = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/user/attended-events');
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setAttendedEvents(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setLoading(false);
        setError('Please log in to view your attended events.');
      }
    };

    fetchAttendedEvents();
  }, [status]);

  if (loading) {
    return <div>Loading your events...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (attendedEvents.length === 0) {
    return <div>You haven't joined any events yet.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Attended Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendedEvents.map((event) => (
          <div key={event.id} className="border p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-gray-600">{new Date(event.start).toLocaleDateString()}</p>
            <p className="text-gray-700 mt-2">{event.description.substring(0, 100)}...</p>
            <Link href={`/events/${event.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}