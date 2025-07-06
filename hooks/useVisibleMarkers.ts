import { useState, useEffect, useCallback } from 'react';
import { NormalizedEvent } from '../types/event';

interface Viewport {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

interface UseVisibleMarkersOptions {
  debounceTime?: number;
}

export default function useVisibleMarkers(
  events: NormalizedEvent[],
  viewport: Viewport,
  options: UseVisibleMarkersOptions = {}
) {
  const { debounceTime = 100 } = options;
  const [visibleMarkers, setVisibleMarkers] = useState<NormalizedEvent[]>([]);

  const isInViewport = useCallback((event: NormalizedEvent) => {
    if (!event.location.coordinates) return false;
    
    const { lat, lng } = event.location.coordinates;
    return (
      lat <= viewport.northEast.lat &&
      lat >= viewport.southWest.lat &&
      lng <= viewport.northEast.lng &&
      lng >= viewport.southWest.lng
    );
  }, [viewport]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = events.filter(isInViewport);
      setVisibleMarkers(filtered);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [events, viewport, isInViewport, debounceTime]);

  return visibleMarkers;
}