'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event, EventClaimRequest } from '@/types/db';
import { Button } from '@/components/Button';

export default function AdminCurationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [pendingClaims, setPendingClaims] = useState<EventClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, claimsRes] = await Promise.all([
          fetch('/api/admin/events?status=DRAFT'),
          fetch('/api/admin/claims?status=PENDING')
        ]);
        
        const eventsData = await eventsRes.json();
        const claimsData = await claimsRes.json();
        
        setDraftEvents(eventsData);
        setPendingClaims(claimsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const handleClaimAction = async (claimId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        setPendingClaims(pendingClaims.filter(claim => claim.id !== claimId));
      }
    } catch (error) {
      console.error('Error updating claim:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (session?.user?.role !== 'ADMIN') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Curation Dashboard</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Draft Events for Review</h2>
        {draftEvents.length > 0 ? (
          <ul className="space-y-4">
            {draftEvents.map(event => (
              <li key={event.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/events/${event.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status: 'PUBLISHED' }),
                      });
                      if (response.ok) {
                        setDraftEvents(draftEvents.filter(e => e.id !== event.id));
                      } else {
                        console.error('Failed to approve event:', await response.text());
                      }
                    } catch (error) {
                      console.error('Error approving event:', error);
                    }
                  }}
                >
                  Approve
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No draft events to review</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Pending Claims</h2>
        {pendingClaims.length > 0 ? (
          <ul className="space-y-4">
            {pendingClaims.map(claim => (
              <li key={claim.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Event: {claim.event.title}</h3>
                    <p className="text-sm text-gray-600">Claimed by: {claim.user.email}</p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="default" 
                      onClick={() => handleClaimAction(claim.id, 'APPROVE')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleClaimAction(claim.id, 'REJECT')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending claims to review</p>
        )}
      </section>
    </div>
  );
}