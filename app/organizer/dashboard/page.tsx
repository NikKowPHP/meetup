'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event } from '../../../types/db';
import Link from 'next/link';

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/organizer/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Events</h1>
      
      {events.length > 0 ? (
        <div className="grid gap-4">
          {events.map(event => (
            <div key={event.id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {new Date(event.startTime).toLocaleDateString()}
                </span>
                <Link 
                  href={`/organizer/promote/${event.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Promote Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't claimed any events yet</p>
      )}
    </div>
  );
}