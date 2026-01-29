import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Home, MapPin, Leaf, Package, AlertTriangle, Trash2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WasteType } from '@shared/types';
interface MapDisplayProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    label: string;
    type?: 'COLLECTOR' | 'DESTINATION' | 'DEFAULT';
    wasteType?: WasteType;
    onClick?: () => void;
  }>;
  onClick?: (latlng: { lat: number, lng: number }) => void;
  className?: string;
  interactive?: boolean;
}
const createIcon = (IconComponent: any, colorClass: string) => {
  const html = renderToStaticMarkup(
    <div className={`p-2 rounded-full bg-white border-2 shadow-md flex items-center justify-center`} style={{ borderColor: colorClass, color: colorClass }}>
      <IconComponent size={20} />
    </div>
  );
  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }) as L.DivIcon;
};
const getWasteColor = (type?: WasteType) => {
  switch (type) {
    case 'ORGANIC': return '#10b981';
    case 'NON_ORGANIC': return '#3b82f6';
    case 'B3': return '#ef4444';
    case 'RESIDUE': return '#71717a';
    default: return '#10b981';
  }
};
const getWasteIcon = (type?: WasteType) => {
  switch (type) {
    case 'ORGANIC': return Leaf;
    case 'NON_ORGANIC': return Package;
    case 'B3': return AlertTriangle;
    case 'RESIDUE': return Trash2;
    default: return MapPin;
  }
};
const RecenterMap = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};
const MapClickHandler = ({ onClick }: { onClick?: (latlng: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng);
    },
  });
  return null;
};
export function MapDisplay({ center, zoom = 15, markers = [], onClick, className, interactive = true }: MapDisplayProps) {
  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border bg-muted ${className}`}>
      <MapContainer
        {...({
          center,
          zoom,
          scrollWheelZoom: interactive,
          dragging: interactive,
          className: "h-full w-full",
        } as any)}
      >
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          } as any)}
        />
        <RecenterMap center={center} zoom={zoom} />
        <MapClickHandler onClick={onClick} />
        {markers.map((marker, idx) => {
          let icon;
          if (marker.type === 'COLLECTOR') icon = createIcon(Truck, '#10b981');
          else if (marker.type === 'DESTINATION') icon = createIcon(Home, '#3b82f6');
          else {
            const wasteIcon = getWasteIcon(marker.wasteType);
            const wasteColor = getWasteColor(marker.wasteType);
            icon = createIcon(wasteIcon, wasteColor);
          }
          return (
            <Marker
              {...({
                key: `${idx}-${marker.position[0]}`,
                position: marker.position,
                icon: icon,
                eventHandlers: {
                  click: () => marker.onClick?.()
                }
              } as any)}
            >
              <Popup>{marker.label}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}