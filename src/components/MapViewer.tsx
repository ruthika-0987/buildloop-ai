import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'batch' | 'demand' | 'truck';
}

interface MapViewerProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  markers,
  center = [17.4319, 78.4073], // Default Hyderabad (Jubilee Hills)
  zoom = 12,
  height = '360px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet default icon issue in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom marker icons
    const batchIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#059669; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 2px 4px rgba(0,0,0,0.3);">📦</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const demandIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#2563eb; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 2px 4px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const truckIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color:#7c3aed; width:32px; height:32px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:16px; box-shadow:0 3px 6px rgba(0,0,0,0.4);">🚚</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const bounds = L.latLngBounds([]);

    markers.forEach(m => {
      if (isNaN(m.lat) || isNaN(m.lng)) return;
      const icon = m.type === 'truck' ? truckIcon : m.type === 'demand' ? demandIcon : batchIcon;
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <strong style="font-size:13px; color:#1e293b;">${m.title}</strong>
          ${m.subtitle ? `<p style="font-size:11px; margin:3px 0 0; color:#64748b;">${m.subtitle}</p>` : ''}
          <div style="font-size:10px; margin-top:4px; font-weight:bold; color:${
            m.type === 'batch' ? '#059669' : m.type === 'demand' ? '#2563eb' : '#7c3aed'
          }">${m.type.toUpperCase()}</div>
        </div>
      `);
      bounds.extend([m.lat, m.lng]);
    });

    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      // Keep map instance alive or clean up on unmount
    };
  }, [markers, center, zoom]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner z-0">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-medium border border-stone-300 dark:border-stone-700 flex items-center gap-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"/> Batch</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block"/> Demand</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block"/> Truck</span>
      </div>
    </div>
  );
};
