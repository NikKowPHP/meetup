
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    content: string;
  }>;
  className?: string;
  onMarkerClick?: (event: any) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center = [52.2297, 21.0122], // Default to Warsaw coordinates
  zoom = 13,
  markers = [],
  className = 'h-full w-full'
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // This callback is used to get the Leaflet map instance.
  const setMap = (mapInstance: L.Map | null) => {
    mapRef.current = mapInstance;
  };

  useEffect(() => {
    // This effect's cleanup function will run when the component unmounts.
    // This is crucial for handling React 18+ Strict Mode's behavior
    // of mounting, unmounting, and re-mounting components in development.
    return () => {
      mapRef.current?.remove();
    };
  }, []); // The empty dependency array ensures this runs only once on mount and unmount.

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className={className}
      ref={setMap}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.content}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
