'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons not showing up in Webpack/React environments
// We use unpkg CDN links for the default icons to ensure they load correctly.
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Merge the default icon options with the fixed URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  popupText: string;
}

export function LeafletMap({ latitude, longitude, zoom, popupText }: LeafletMapProps) {
  const position: [number, number] = [latitude, longitude];

  // CartoDB Dark Matter tiles for a dark theme
  const darkTileLayer = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <MapContainer 
      center={position} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      className="w-full h-full rounded-lg z-0"
    >
      <TileLayer
        attribution={attribution}
        url={darkTileLayer}
      />
      <Marker position={position}>
        <Popup>{popupText}</Popup>
      </Marker>
    </MapContainer>
  );
}