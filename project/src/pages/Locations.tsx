import { useState, useEffect, useRef } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';

type Hotspot = {
  location: string;
  connectedEntities: number;
  mapped: boolean;
  lat: number;
  lng: number;
};

const HOTSPOTS: Hotspot[] = [
  { location: 'Delhi Railway Station', connectedEntities: 3, mapped: true, lat: 28.6414, lng: 77.2197 },
  { location: 'Sector 18 Warehouse', connectedEntities: 2, mapped: false, lat: 28.5733, lng: 77.3240 },
  { location: 'Connaught Place', connectedEntities: 1, mapped: true, lat: 28.6315, lng: 77.2167 },
];

export default function Locations() {
  const { caseData, entities, loading } = useCaseData();
  const [selectedLocation, setSelectedLocation] = useState<Hotspot | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as unknown as { L: unknown }).L;
    if (!L || typeof L !== 'object') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    } else {
      initMap();
    }

    function initMap() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Leaflet = (window as any).L;
      if (!mapRef.current || mapInstanceRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = Leaflet.map(mapRef.current, { zoomControl: false }).setView([28.62, 77.22], 12);
      Leaflet.control.zoom({ position: 'topright' }).addTo(map);
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      HOTSPOTS.forEach(h => {
        if (!h.mapped) return;
        const marker = Leaflet.circleMarker([h.lat, h.lng], {
          radius: 8, fillColor: '#4cd7f6', color: '#0a0f18', weight: 2, fillOpacity: 0.9,
        }).addTo(map);
        marker.bindTooltip(h.location, { permanent: false, className: 'bg-[#0d141d] text-white text-xs px-2 py-1 rounded-lg border border-white/10' });
        marker.on('click', () => setSelectedLocation(h));
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-4 sticky top-0 lg:top-0 z-30 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Locations</h1>
          <p className="text-xs text-gray-500">Map and hotspot analysis for case locations.</p>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Map</span>
                <span className="text-[10px] text-gray-500">{HOTSPOTS.filter(h => h.mapped).length} of {HOTSPOTS.length} locations mapped — OpenStreetMap</span>
              </div>
            </div>
            <div ref={mapRef} className="w-full h-[400px]" style={{ background: '#1a2332' }}></div>
            <div className="px-5 py-2 text-[10px] text-gray-500">
              Not shown on map (no known coordinates): {HOTSPOTS.filter(h => !h.mapped).map(h => h.location).join(', ') || 'None'}
            </div>
          </div>

          {/* Location Detail */}
          <div className="glass-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Location Detail</h2>
            {selectedLocation ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold">{selectedLocation.location}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">Connected Entities</span><span className="font-mono text-gray-300">{selectedLocation.connectedEntities}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Mapped</span><span className={`font-mono ${selectedLocation.mapped ? 'text-emerald-400' : 'text-gray-500'}`}>{selectedLocation.mapped ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Coordinates</span><span className="font-mono text-gray-300">{selectedLocation.lat}, {selectedLocation.lng}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-8">Click a marker to inspect a location.</p>
            )}
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Hotspots</h2>
            <span className="text-[10px] text-gray-500">ranked by connected entity count</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Location</th>
                <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Connected Entities</th>
                <th className="text-left px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mapped</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {[...HOTSPOTS].sort((a, b) => b.connectedEntities - a.connectedEntities).map((h, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedLocation(h)}>
                  <td className="px-5 py-3 text-xs font-medium text-gray-300">{h.location}</td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-400">{h.connectedEntities}</td>
                  <td className="px-5 py-3">
                    {h.mapped ? (
                      <span className="text-emerald-400 text-sm">&#10003;</span>
                    ) : (
                      <span className="text-gray-500 text-xs">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </Layout>
  );
}
