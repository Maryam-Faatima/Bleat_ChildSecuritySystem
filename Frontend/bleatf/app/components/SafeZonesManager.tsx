// components/SafeZonesManager.tsx
'use client';
import { useEffect, useState } from 'react';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService } from '@/lib/api';

// Define TypeScript interfaces
interface SafeZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  color?: string;
}

interface SafeZonesManagerProps {
  onSafeZonesUpdate: (zones: SafeZone[]) => void;
  existingZones?: SafeZone[];
}

const SafeZonesManager: React.FC<SafeZonesManagerProps> = ({ 
  onSafeZonesUpdate, 
  existingZones = [] 
}) => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>(existingZones);
  const [newZone, setNewZone] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 500
  });

  useEffect(() => {
    // Load zones from server if authenticated
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return;
    const parentId = (user as any).parentId ?? (user as any).userId ?? null;
    if (!parentId) return;

    // If logged in as a parent, fetch all children and aggregate safe zones
    const loadZones = async () => {
      try {
        const children = await ApiService.getChildren(parentId);
        const zonesByChildPromises = children.map((c: any) => ApiService.getSafeZones(parentId, c.id ?? c.childId));
        const zonesByChild = await Promise.all(zonesByChildPromises);
        // flatten and dedupe by lat/lon+radius+name
        const flat: any[] = ([] as any[]).concat(...zonesByChild.map((z: any) => z || []));
        const uniqKey = (z: any) => `${z.latitude}:${z.longitude}:${z.radius}:${z.name || ''}`;
        const seen = new Set<string>();
        const mapped: SafeZone[] = [];
        for (const z of flat) {
          const key = uniqKey(z);
          if (seen.has(key)) continue;
          seen.add(key);
          mapped.push({
            id: z.id || z.safeZoneId || Date.now(),
            name: z.name || z.zoneName || 'Zone',
            latitude: z.latitude,
            longitude: z.longitude,
            radius: z.radius || z.radiusMeters || 500,
            color: '#00ff00'
          });
        }
        setSafeZones(mapped);
        onSafeZonesUpdate(mapped);
      } catch (err) {
        console.error('Failed to load children or aggregate safe zones', err);
      }
    };

    loadZones();
  }, []);

  const addSafeZone = async () => {
    if (!newZone.name || !newZone.latitude || !newZone.longitude) {
      alert('Please fill all fields');
      return;
    }
    const lat = parseFloat(newZone.latitude);
    const lon = parseFloat(newZone.longitude);
    const rad = parseInt(newZone.radius.toString());

    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return alert('Please login as parent to add safe zone');
    const parentId = (user as any).parentId ?? (user as any).userId ?? null;
    if (!parentId) return alert('Parent not set');

    try {
      // Fetch children and apply the safe zone to each child so it's effectively 'global' for parent's children
      const children = await ApiService.getChildren(parentId);
      if (!children || children.length === 0) {
        alert('No children found for this parent. Add a child first.');
        return;
      }

      const addPromises = children.map((c: any) => ApiService.addSafeZone(parentId, c.id ?? c.childId, { name: newZone.name, latitude: lat, longitude: lon, radius: rad }));
      const results = await Promise.allSettled(addPromises);
      const successes = results.filter(r => r.status === 'fulfilled').length;
      if (successes === 0) {
        alert('Failed to add safe zone for any child');
        return;
      }

      // Show zone once in UI (even though added per-child on backend)
      const zone: SafeZone = {
        id: Date.now(),
        name: newZone.name,
        latitude: lat,
        longitude: lon,
        radius: rad,
        color: '#00ff00'
      };
      const updatedZones = [...safeZones, zone];
      setSafeZones(updatedZones);
      onSafeZonesUpdate(updatedZones);
      setNewZone({ name: '', latitude: '', longitude: '', radius: 500 });
      alert(`Safe zone added for ${successes}/${children.length} children`);
    } catch (err) {
      console.error('Add safe zone failed', err);
      alert('Failed to add safe zone');
    }
  };

  const removeSafeZone = async (zoneId: number) => {
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return alert('Please login as parent to delete safe zone');
    const parentId = (user as any).parentId ?? (user as any).userId ?? null;
    if (!parentId) return alert('Parent not set');
    // Delete zone for all children
    try {
      const children = await ApiService.getChildren(parentId);
      const delPromises = children.map((c: any) => ApiService.deleteSafeZone(parentId, c.id ?? c.childId, zoneId).catch(() => null));
      await Promise.all(delPromises);
    } catch (err) {
      console.warn('Failed deleting zone for some children', err);
    }
    const updatedZones = safeZones.filter(zone => zone.id !== zoneId);
    setSafeZones(updatedZones);
    onSafeZonesUpdate(updatedZones);
  };

  return (
    <div className="card p-3">
      <h6 className="fw-bold mb-3">🏠 Manage Safe Zones</h6>
      
      {/* Add New Zone Form */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Zone Name (e.g., Home, School)"
            value={newZone.name}
            onChange={(e) => setNewZone({...newZone, name: e.target.value})}
          />
        </div>
        <div className="col-12 col-md-3">
          <input
            type="number"
            step="any"
            className="form-control form-control-sm"
            placeholder="Latitude"
            value={newZone.latitude}
            onChange={(e) => setNewZone({...newZone, latitude: e.target.value})}
          />
        </div>
        <div className="col-12 col-md-3">
          <input
            type="number"
            step="any"
            className="form-control form-control-sm"
            placeholder="Longitude"
            value={newZone.longitude}
            onChange={(e) => setNewZone({...newZone, longitude: e.target.value})}
          />
        </div>
        <div className="col-12 col-md-2">
          <select 
            className="form-control form-control-sm"
            value={newZone.radius}
            onChange={(e) => setNewZone({...newZone, radius: parseInt(e.target.value)})}
          >
            <option value="100">100m</option>
            <option value="250">250m</option>
            <option value="500">500m</option>
            <option value="1000">1km</option>
            <option value="2000">2km</option>
          </select>
        </div>
      </div>
      
      <button 
        className="btn btn-success btn-sm w-100 mb-3"
        onClick={addSafeZone}
      >
        ➕ Add Safe Zone
      </button>

      {/* Existing Zones List */}
      <div className="safe-zones-list">
        {safeZones.map((zone) => (
          <div key={zone.id} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
            <div>
              <strong>{zone.name}</strong>
              <div className="small text-muted">
                📍 {zone.latitude.toFixed(6)}, {zone.longitude.toFixed(6)}
                <span className="ms-2">⭕ {zone.radius}m</span>
              </div>
            </div>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeSafeZone(zone.id)}
            >
              🗑️
            </button>
          </div>
        ))}
        
        {safeZones.length === 0 && (
          <div className="text-center text-muted small py-3">
            No safe zones defined. Add your first safe zone above.
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeZonesManager;