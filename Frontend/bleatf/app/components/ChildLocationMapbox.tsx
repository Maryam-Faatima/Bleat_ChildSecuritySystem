// components/ChildLocationMapbox.js - COMPLETE WORKING CODE FOR v8.x
'use client';
import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';

// Default location (Islamabad)
const defaultLocation = {
  longitude: 73.0479,
  latitude: 33.6844
};

export default function ChildLocationMapbox() {
  // State for map view - NEW SYNTAX for v8.x
  const [viewState, setViewState] = useState({
    longitude: defaultLocation.longitude,
    latitude: defaultLocation.latitude,
    zoom: 14
  });

  // State for child location
  const [childLocation, setChildLocation] = useState(defaultLocation);
  const [showPopup, setShowPopup] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLive, setIsLive] = useState(true);

  // Function to simulate live location updates
  const updateChildLocation = () => {
    const newLocation = {
      longitude: 73.0479 + (Math.random() * 0.02 - 0.01),
      latitude: 33.6844 + (Math.random() * 0.02 - 0.01),
    };
    
    setChildLocation(newLocation);
    setLastUpdate(new Date().toLocaleTimeString());
    
    if (isLive) {
      setViewState(prev => ({
        ...prev,
        longitude: newLocation.longitude,
        latitude: newLocation.latitude
      }));
    }
  };

  // Load initial location and set up updates
  useEffect(() => {
    updateChildLocation();
    
    if (isLive) {
      const interval = setInterval(updateChildLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="map-container">
      {/* Live Tracking Controls */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-3 py-1 text-sm rounded ${
            isLive ? 'bg-green-500' : 'bg-gray-500'
          } text-white`}
        >
          {isLive ? '🟢 Live Tracking' : '⚪ Live Tracking'}
        </button>
        <button
          onClick={updateChildLocation}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
        >
          🔄 Update Now
        </button>
      </div>

      {/* The Map - UPDATED SYNTAX for v8.x */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: 400, borderRadius: '10px' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {/* Child Location Marker */}
        <Marker
          longitude={childLocation.longitude}
          latitude={childLocation.latitude}
          color="red"
          onClick={() => setShowPopup(true)}
        />
        
        {/* Popup when clicking marker */}
        {showPopup && (
          <Popup
            longitude={childLocation.longitude}
            latitude={childLocation.latitude}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-red-600 text-lg">👶 Your Child</h3>
              <div className="mt-2 space-y-1">
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Current Location</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>Updated: {lastUpdate}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📏</span>
                  <span>Lat: {childLocation.latitude.toFixed(6)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📏</span>
                  <span>Lng: {childLocation.longitude.toFixed(6)}</span>
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Status bar */}
      <div className="mt-2 text-sm text-gray-600 flex justify-between">
        <span>
          {isLive ? '🟢 Live tracking active' : '⚪ Live tracking paused'}
        </span>
        <span>Last update: {lastUpdate}</span>
      </div>
    </div>
  );
}