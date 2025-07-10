import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { NormalizedEvent } from '../types/event';

// Dynamically import map components with SSR disabled
const MapView = dynamic(
  () => import('../components/MapView'),
  { ssr: false }
);

const EventPopup = dynamic(
  () => import('../components/EventPopup'),
  { ssr: false }
);

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);

  const handleMarkerClick = useCallback((event: any) => {
    setSelectedEvent(event);
  }, []);

  return (
    <>
      <Head>
        <title>Event Discovery Map</title>
        <meta name="description" content="Discover local events near you" />
      </Head>

      <main className="min-h-screen">
        <div className="h-screen w-full">
          <MapView 
            onMarkerClick={handleMarkerClick}
          />
          
          {selectedEvent && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <EventPopup 
                event={selectedEvent}
                onJoin={() => console.log('Join event')}
                onSave={() => console.log('Save event')}
                onShare={() => console.log('Share event')}
                onClose={() => setSelectedEvent(null)}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}