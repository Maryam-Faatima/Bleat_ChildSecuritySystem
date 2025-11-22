// components/SafeZonesManager.tsx
'use client';
import { useState } from 'react';

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

  const addSafeZone = () => {
    if (!newZone.name || !newZone.latitude || !newZone.longitude) {
      alert('Please fill all fields');
      return;
    }

    const zone: SafeZone = {
      id: Date.now(),
      name: newZone.name,
      latitude: parseFloat(newZone.latitude),
      longitude: parseFloat(newZone.longitude),
      radius: parseInt(newZone.radius.toString()),
      color: '#00ff00'
    };

    const updatedZones = [...safeZones, zone];
    setSafeZones(updatedZones);
    onSafeZonesUpdate(updatedZones);
    
    // Reset form
    setNewZone({
      name: '',
      latitude: '',
      longitude: '',
      radius: 500
    });
  };

  const removeSafeZone = (zoneId: number) => {
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