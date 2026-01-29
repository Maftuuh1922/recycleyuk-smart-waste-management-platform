import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Home, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
interface MapDisplayProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    label: string;
    type: 'COLLECTOR' | 'DESTINATION' | 'DEFAULT';
  }>;
  className?: string;
}
const createIcon = (IconComponent: any, color: string) => {
  const html = renderToStaticMarkup(
    <div className={`p-2 rounded-full bg-white border-2 border-${color}-500 text-${color}-600 shadow-md`}>
      <IconComponent size={20} />
    </div>
  );
  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};
const RecenterMap = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};
export function MapDisplay({ center, zoom = 15, markers = [], className }: MapDisplayProps) {
  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border bg-muted ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} zoom={zoom} />
        {markers.map((marker, idx) => {
          let icon;
          if (marker.type === 'COLLECTOR') icon = createIcon(Truck, 'emerald');
          else if (marker.type === 'DESTINATION') icon = createIcon(Home, 'blue');
          else icon = createIcon(MapPin, 'zinc');
          return (
            <Marker key={idx} position={marker.position} icon={icon}>
              <Popup>{marker.label}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}