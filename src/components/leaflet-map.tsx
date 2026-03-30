'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * Fix for default marker icons not showing up in Webpack/React environments.
 * We use unpkg CDN links for the default icons to ensure they load correctly.
 */
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

/**
 * Merge the default icon options with the fixed URLs.
 * This runs at the module level to ensure it only happens once.
 */
if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  popupText: string;
}

export function LeafletMap({ latitude, longitude, zoom, popupText }: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [containerKey, setContainerKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setContainerKey(k => k + 1);
    return () => setIsMounted(false);
  }, []);

  const position: [number, number] = useMemo(() => [latitude, longitude], [latitude, longitude]);

  // CartoDB Voyager tiles for a crisp light theme
  const lightTileLayer = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Return a placeholder while mounting to avoid Leaflet double-initialization in Strict Mode
  if (!isMounted) {
    return <div className="w-full h-full bg-zinc-50 animate-pulse rounded-lg" />;
  }

  return (
    <div key={`map-container-${containerKey}`} className="w-full h-full">
      <MapContainer 
        key={`leaflet-map-${containerKey}`}
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="w-full h-full rounded-lg z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={attribution}
          url={lightTileLayer}
        />
        <Marker position={position}>
          <Popup>{popupText}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}