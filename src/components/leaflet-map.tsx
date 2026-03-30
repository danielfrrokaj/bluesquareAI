'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Custom hook to handle map animations and interactions
 */
function MapEffect({ latitude, longitude, zoom }: { latitude: number; longitude: number; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    // Smoothly fly to the location on initial mount or when coordinates change
    map.flyTo([latitude, longitude], zoom, {
      duration: 2.5,
      easeLinearity: 0.25
    });
  }, [map, latitude, longitude, zoom]);

  return null;
}

/**
 * Custom Zoom Controls with premium styling
 */
function CustomControls() {
  const map = useMap();

  return (
    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={() => map.setZoom(map.getZoom() + 1)}
        className="h-10 w-10 bg-white/90 backdrop-blur-md border border-black/5 rounded-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
        title="Zoom In"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button 
        onClick={() => map.setZoom(map.getZoom() - 1)}
        className="h-10 w-10 bg-white/90 backdrop-blur-md border border-black/5 rounded-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
        title="Zoom Out"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button 
        onClick={() => map.fitBounds(map.getBounds())}
        className="h-10 w-10 bg-white/90 backdrop-blur-md border border-black/5 rounded-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
        title="Reset View"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// Create custom pulsing marker icon
const createPulsingIcon = () => {
  if (typeof window === 'undefined') return null;
  
  return L.divIcon({
    className: 'custom-pulsing-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-black/10 rounded-full animate-ping opacity-75"></div>
        <div class="absolute w-8 h-8 bg-black/20 rounded-full animate-ping delay-700"></div>
        <div class="relative w-5 h-5 bg-black rounded-full border-2 border-white shadow-2xl flex items-center justify-center overflow-hidden">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  popupText: string;
}

export function LeafletMap({ latitude, longitude, zoom, popupText }: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Generate a fresh key on every mount to avoid container reuse issues
    setMapKey(`map-${Math.random().toString(36).substring(2, 9)}`);
    return () => {
      setIsMounted(false);
    };
  }, []); // Only mount once

  const position: [number, number] = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const customIcon = useMemo(() => createPulsingIcon(), []);

  // CartoDB Voyager tiles for a crisp light theme
  const lightTileLayer = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  if (!isMounted || !mapKey) {
    return <div className="w-full h-full bg-black/5 animate-pulse rounded-[2.5rem]" icon-id="map-placeholder" />;
  }

  return (
    <div className="w-full h-full relative group" id={mapKey}>
      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 1.5rem !important;
          padding: 8px !important;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .leaflet-popup-content {
          margin: 12px 16px !important;
          font-family: inherit !important;
          font-weight: 700 !important;
          letter-spacing: -0.01em !important;
          color: #000 !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1) !important;
        }
        .leaflet-bar {
          border: none !important;
        }
      `}</style>

      <MapContainer 
        key={mapKey}
        id={mapKey}
        center={[latitude - 0.01, longitude]} 
        zoom={zoom - 2} 
        scrollWheelZoom={false} 
        zoomControl={false}
        className="w-full h-full rounded-[2.5rem] z-0 overflow-hidden"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={attribution}
          url={lightTileLayer}
          className="opacity-90 grayscale-[0.2]"
        />
        
        <MapEffect latitude={latitude} longitude={longitude} zoom={zoom} />
        <CustomControls />

        <Marker 
          position={position} 
          icon={customIcon || undefined}
        >
          <Popup closeButton={false}>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-black animate-pulse" />
              {popupText}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10" />
    </div>
  );
}