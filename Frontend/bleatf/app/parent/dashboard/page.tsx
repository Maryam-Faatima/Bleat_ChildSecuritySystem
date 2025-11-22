"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ChildCard from "@/app/components/ChildCard";
import AlertCard from "@/app/components/AlertCard";
import DeviceStatus from "@/app/components/DeviceStatus";
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService } from '@/lib/api';
import { mockDevices } from "@/app/lib/mockData";
import SafeZonesManager from "@/app/components/SafeZonesManager"; // Import the Safe Zones component
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Mapbox
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

/* -------------------------
   Type Definitions
-------------------------- */
interface ChildLocation {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  status: "Safe" | "In Danger";
  inSafeZone: boolean;
  currentZone: string;
}

interface Child {
  childId: number;
  name: string;
  age: number;
  status: string;
}

interface Alert {
  alertId: number;
  childName: string;
  type: string;
  description: string;
  timestamp: string;
  isAcknowledged: boolean;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface SafeZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  color?: string;
}

/* -------------------------
   Component
-------------------------- */
export default function ParentDashboard() {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState<
    "children" | "messages" | "reports" | "locations" | "sos"
  >("children");

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 73.0479,
    latitude: 33.6844,
    zoom: 14,
  });

  const [selectedChild, setSelectedChild] = useState<ChildLocation | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [showSafeZonesManager, setShowSafeZonesManager] = useState(false);

  /* -------------------------
     Safe Zones State
  -------------------------- */
  const [safeZones, setSafeZones] = useState<SafeZone[]>([
    {
      id: 1,
      name: "Home",
      latitude: 33.6844,
      longitude: 73.0479,
      radius: 500,
      color: "#00ff00"
    },
    {
      id: 2,
      name: "School",
      latitude: 33.6944,
      longitude: 73.0579,
      radius: 300,
      color: "#008800"
    }
  ]);

  /* -------------------------
     Mock Live Child Locations with Safe Zone Status
  -------------------------- */
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([
    {
      id: 1,
      name: "Ali",
      longitude: 73.0479,
      latitude: 33.6844,
      status: "Safe",
      inSafeZone: true,
      currentZone: "Home"
    },
    {
      id: 2,
      name: "Sara",
      longitude: 73.0579,
      latitude: 33.6944,
      status: "Safe",
      inSafeZone: true,
      currentZone: "School"
    },
    {
      id: 3,
      name: "Omar",
      longitude: 73.0379,
      latitude: 33.6744,
      status: "In Danger",
      inSafeZone: false,
      currentZone: "Outside"
    },
  ]);

  /* -------------------------
     Effects
  -------------------------- */
  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);

  // Fetch real alerts for the logged-in parent
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const user = AuthenticationManager.getLoggedInUser();
        if (!user) return;
        const parentId = user.role === 'parent' ? user.userId : user.parentId;
        if (!parentId) return;

        const [serverAlerts, serverChildren] = await Promise.all([
          ApiService.getAlerts(parentId),
          ApiService.getChildren(parentId),
        ]);

        // Normalize children shape to match local `Child` interface
        const normalizedChildren: Child[] = serverChildren.map((c: any) => ({
          childId: c.id ?? c.childId ?? 0,
          name: c.name,
          age: c.age ?? 0,
          status: 'active',
        }));

        // Map server alerts to local Alert shape using normalized children
        const mappedAlerts: Alert[] = serverAlerts.map((a: any) => ({
          alertId: a.alertId ?? a.sosId ?? 0,
          childName: (() => {
            const child = normalizedChildren.find((c: any) => c.childId === (a.childId ?? a.child));
            return child ? child.name : `Child ${a.childId ?? ''}`;
          })(),
          type: a.type || 'SOS',
          description: a.message || a.description || '',
          timestamp: a.timestamp,
          isAcknowledged: false,
        }));

        setChildrenList(normalizedChildren);
        setAlerts(mappedAlerts);
      } catch (e) {
        console.error('Failed to load alerts/children', e);
      }
    };
    loadAlerts();
  }, []);

  // Poll server for child locations when live-tracking enabled
  useEffect(() => {
    let interval: any = null;
    const startPolling = () => {
      interval = setInterval(async () => {
        try {
          const user = AuthenticationManager.getLoggedInUser();
          if (!user) return;
          const parentId = user.role === 'parent' ? user.userId : user.parentId;
          if (!parentId) return;

          const updatedLocations: ChildLocation[] = [];
          for (const c of childrenList) {
            try {
              const loc = await ApiService.trackChildLocation(parentId, c.childId);
              if (loc) {
                const zoneStatus = isChildInSafeZone(loc.latitude, loc.longitude, safeZones);
                updatedLocations.push({
                  id: c.childId,
                  name: c.name,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  status: zoneStatus.inZone ? 'Safe' : 'In Danger',
                  inSafeZone: zoneStatus.inZone,
                  currentZone: zoneStatus.zoneName,
                });
              }
            } catch (e) {
              // ignore per-child errors
            }
          }
          if (updatedLocations.length > 0) setChildLocations(updatedLocations);
        } catch (e) {
          // ignore
        }
      }, 5000);
    };

    if (isLiveTracking && activeTab === 'locations') startPolling();
    return () => { if (interval) clearInterval(interval); };
  }, [childrenList, isLiveTracking, activeTab, safeZones]);

  const unacknowledgedAlerts = alerts.filter(
    (alert: Alert) => !acknowledgedAlerts.includes(alert.alertId) && !alert.isAcknowledged
  );

  const handleAcknowledgeAlert = (alertId: number) => {
    setAcknowledgedAlerts((prev) => [...prev, alertId]);
  };

  /* -------------------------
     Safe Zone Functions
  -------------------------- */
  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Check if child is in any safe zone
  const isChildInSafeZone = (childLat: number, childLng: number, zones: SafeZone[]) => {
    for (const zone of zones) {
      const distance = calculateDistance(
        childLat, childLng, 
        zone.latitude, zone.longitude
      );
      if (distance <= zone.radius) {
        return { inZone: true, zoneName: zone.name };
      }
    }
    return { inZone: false, zoneName: "Outside" };
  };

  // Update child locations with safe zone checking
  const updateChildLocations = () => {
    setChildLocations(prev => 
      prev.map(child => {
        // Simulate small random movement
        const newLng = child.longitude + (Math.random() * 0.002 - 0.001);
        const newLat = child.latitude + (Math.random() * 0.002 - 0.001);
        
        // Check if in safe zone
        const zoneStatus = isChildInSafeZone(newLat, newLng, safeZones);
        
        return {
          ...child,
          longitude: newLng,
          latitude: newLat,
          inSafeZone: zoneStatus.inZone,
          currentZone: zoneStatus.zoneName,
          status: zoneStatus.inZone ? "Safe" : "In Danger"
        };
      })
    );
  };

  useEffect(() => {
    if (isLiveTracking && activeTab === "locations") {
      const interval = setInterval(updateChildLocations, 5000);
      return () => clearInterval(interval);
    }
  }, [isLiveTracking, activeTab, safeZones]);

  const handleTrackChild = (child: ChildLocation) => {
    setViewState({
      longitude: child.longitude,
      latitude: child.latitude,
      zoom: 16,
    });
    setSelectedChild(child);
  };

  const handleSendSosToChild = async (childId: number) => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) { alert('Please login to send SOS'); return; }
      const parentId = user.role === 'parent' ? user.userId : user.parentId;
      if (!parentId) { alert('Parent not linked'); return; }
      const resp = await ApiService.triggerSos(parentId, childId);
      if (resp && resp.success) {
        alert('SOS sent successfully');
      } else {
        alert('Failed to send SOS: ' + (resp?.message || 'unknown'));
      }
    } catch (error) {
      console.error('Send SOS error', error);
      alert('Failed to send SOS');
    }
  };

  const handleSafeZonesUpdate = (zones: SafeZone[]) => {
    setSafeZones(zones);
    // Re-check all children against new safe zones
    updateChildLocations();
  };

  /* -------------------------
     JSX
  -------------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage:
          "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        padding: "1rem",
      }}
    >
      <div
        className="card shadow rounded-4 w-100"
        style={{ maxWidth: 1400, padding: "1.5rem" }}
      >
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-3 mb-4">
          <div className="container-fluid">
            <span className="navbar-brand fw-bold">Parent Dashboard</span>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "children"
                        ? "btn-primary text-white"
                        : "btn-light"
                    }`}
                    onClick={() => setActiveTab("children")}
                  >
                    Children
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "messages"
                        ? "btn-primary text-white"
                        : "btn-light"
                    }`}
                    onClick={() => setActiveTab("messages")}
                  >
                    Messages
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "reports"
                        ? "btn-primary text-white"
                        : "btn-light"
                    }`}
                    onClick={() => setActiveTab("reports")}
                  >
                    Reports
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "locations"
                        ? "btn-primary text-white"
                        : "btn-light"
                    }`}
                    onClick={() => setActiveTab("locations")}
                  >
                    Locations
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "sos"
                        ? "btn-danger text-white"
                        : "btn-outline-danger"
                    }`}
                    onClick={() => setActiveTab("sos")}
                  >
                    SOS
                  </button>
                </li>

                <li className="nav-item ms-2">
                  <Link href="/parent/children?addChild=true">
                    <button className="btn btn-sm btn-success">+ Add Child</button>
                  </Link>
                </li>

                <li className="nav-item ms-3">
                  <Link href="/login" className="btn btn-outline-secondary">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Dashboard Tabs */}
        <div className="row g-3">
          {/* ----------------------------------------
              CHILDREN TAB
          ---------------------------------------- */}
          {activeTab === "children" && (
            <>
              {childrenList.map((child: Child) => (
                <div
                  key={child.childId}
                  className="col-12 col-md-6 col-lg-4"
                  data-aos="fade-up"
                >
                  <ChildCard
                    name={child.name}
                    age={child.age}
                    status={child.status === "active" ? "Safe" : "In Danger"}
                  />
                </div>
              ))}
            </>
          )}

          {/* ----------------------------------------
              MESSAGES TAB
          ---------------------------------------- */}
          {activeTab === "messages" && (
            <div className="col-12">
              <h5 className="fw-bold mb-3">Messages</h5>

              {childrenList.map((child: Child) => (
                <div key={child.childId} className="card mb-2 p-3">
                  <strong>{child.name}</strong>: You have 2 unread messages
                </div>
              ))}
            </div>
          )}

          {/* ----------------------------------------
              REPORTS TAB
          ---------------------------------------- */}
          {activeTab === "reports" && (
            <div className="col-12">
              <h5 className="fw-bold mb-3">Reports</h5>

              <div className="row row-cols-1 row-cols-md-2 g-3">
                {childrenList.map((child: Child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3">
                      <strong>{child.name}</strong>
                      <p className="mb-1">Last Report: Weekly Safety</p>
                      <button className="btn btn-sm btn-primary">
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------
              LOCATIONS TAB (UPDATED WITH SAFE ZONES)
          ---------------------------------------- */}
          {activeTab === "locations" && (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Child Locations & Safe Zones</h5>

                <div className="d-flex gap-2">
                  <button
                    onClick={() => setIsLiveTracking(!isLiveTracking)}
                    className={`btn btn-sm ${
                      isLiveTracking ? "btn-success" : "btn-secondary"
                    }`}
                  >
                    {isLiveTracking ? "🟢 Live Tracking" : "⚪ Live Tracking"}
                  </button>

                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowSafeZonesManager(!showSafeZonesManager)}
                  >
                    {showSafeZonesManager ? "📋 Hide Zones" : "🗺️ Manage Safe Zones"}
                  </button>
                </div>
              </div>

              {/* Safe Zones Manager */}
              {showSafeZonesManager && (
                <div className="mb-4">
                  <SafeZonesManager 
                    onSafeZonesUpdate={handleSafeZonesUpdate}
                    existingZones={safeZones}
                  />
                </div>
              )}

              {/* Map */}
              <div
                className="card mb-4"
                style={{ height: "500px", overflow: "hidden" }}
              >
                <Map
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  mapboxAccessToken={
                    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                  }
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* Safe Zones Circles */}
                  {safeZones.map((zone: SafeZone) => (
                    <Marker
                      key={`zone-${zone.id}`}
                      longitude={zone.longitude}
                      latitude={zone.latitude}
                    >
                      <div
                        style={{
                          background: `${zone.color}33`, // 20% opacity
                          border: `2px solid ${zone.color}`,
                          borderRadius: "50%",
                          width: `${(zone.radius / 5)}px`, // Scale for visibility
                          height: `${(zone.radius / 5)}px`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: zone.color
                        }}
                      >
                        {zone.name}
                      </div>
                    </Marker>
                  ))}

                  {/* Child Markers */}
                  {childLocations.map((child: ChildLocation) => (
                    <Marker
                      key={child.id}
                      longitude={child.longitude}
                      latitude={child.latitude}
                      color={child.inSafeZone ? "green" : "red"}
                      onClick={() => setSelectedChild(child)}
                    />
                  ))}

                  {/* Popup */}
                  {selectedChild && (
                    <Popup
                      longitude={selectedChild.longitude}
                      latitude={selectedChild.latitude}
                      anchor="bottom"
                      onClose={() => setSelectedChild(null)}
                    >
                      <div className="p-2">
                        <h6 className="fw-bold">{selectedChild.name}</h6>

                        <p>
                          Status:
                          <span
                            className={`badge ms-1 ${
                              selectedChild.inSafeZone ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {selectedChild.inSafeZone ? "✅ In Safe Zone" : "🚨 Outside Safe Zone"}
                          </span>
                        </p>

                        <p className="small mb-1">
                          📍 Location: {selectedChild.currentZone}
                        </p>

                        <p className="small mb-1">
                          🕒 Last update: {new Date().toLocaleTimeString()}
                        </p>

                        <button
                          className="btn btn-sm btn-primary mt-2 w-100"
                          onClick={() => handleTrackChild(selectedChild)}
                        >
                          Focus on Map
                        </button>
                      </div>
                    </Popup>
                  )}
                </Map>
              </div>

              {/* Location Cards with Safe Zone Status */}
              <div className="row row-cols-1 row-cols-md-3 g-3">
                {childLocations.map((child: ChildLocation) => (
                  <div key={child.id} className="col">
                    <div
                      className={`card p-3 ${
                        selectedChild?.id === child.id
                          ? "border-primary border-2"
                          : ""
                      } ${
                        child.inSafeZone ? "border-success" : "border-danger"
                      }`}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{child.name}</strong>
                          <span
                            className={`badge ms-2 ${
                              child.inSafeZone ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {child.inSafeZone ? "✅ Safe" : "🚨 Alert"}
                          </span>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleTrackChild(child)}
                        >
                          🎯 Track
                        </button>
                      </div>

                      <div className="mt-2">
                        <p className="small mb-1">
                          <strong>Location Status:</strong> {child.inSafeZone ? "Inside Safe Zone" : "Outside Safe Zone"}
                        </p>
                        <p className="small mb-1">
                          <strong>Current Zone:</strong> {child.currentZone}
                        </p>
                        <p className="small text-muted mb-2">
                          📍 {child.latitude.toFixed(6)}, {child.longitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="d-flex gap-1 mt-2">
                        <button className="btn btn-sm btn-outline-secondary flex-fill">
                          📱 Call
                        </button>

                        <button className="btn btn-sm btn-outline-warning flex-fill">
                          📍 History
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Footer with Safe Zones Summary */}
              <div className="mt-3 p-3 bg-light rounded">
                <div className="row text-center">
                  <div className="col">
                    <small className="text-muted">
                      🗺️ {safeZones.length} Safe Zones Defined
                    </small>
                  </div>
                  <div className="col">
                    <small className="text-muted">
                      {childLocations.filter(c => c.inSafeZone).length} / {childLocations.length} Children Safe
                    </small>
                  </div>
                  <div className="col">
                    <small className="text-muted">
                      {isLiveTracking
                        ? "🟢 Live tracking active"
                        : "⚪ Live tracking paused"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------
              SOS TAB
          ---------------------------------------- */}
          {activeTab === "sos" && (
            <div className="col-12">
              <h5 className="fw-bold mb-3">Emergency SOS</h5>

              <button className="btn btn-danger btn-lg w-100 mb-3">
                🚨 Send SOS Alert to All Children
              </button>

              <div className="row row-cols-1 row-cols-md-2 g-3">
                {childrenList.map((child: Child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3 text-center">
                      <strong>{child.name}</strong>
                      <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => handleSendSosToChild(child.childId)}>
                        Send SOS to {child.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------
              ALERTS SECTION (Always visible)
          ---------------------------------------- */}
          <div className="col-12 mt-4">
            <h5 className="fw-bold mb-3">Recent Alerts</h5>

            {unacknowledgedAlerts.length === 0 && (
              <div className="alert alert-success text-center small">
                No unread alerts. All safe!
              </div>
            )}

            {unacknowledgedAlerts.map((alert: Alert) => (
              <div key={alert.alertId} className="mb-2">
                <AlertCard
                  type={alert.type}
                  description={`${alert.childName}: ${alert.description}`}
                  timestamp={new Date(alert.timestamp).toLocaleString()}
                  onAcknowledge={() => handleAcknowledgeAlert(alert.alertId)}
                />
              </div>
            ))}

            <Link
              href="/parent/alerts"
              className="btn btn-secondary btn-sm mt-2 w-100"
            >
              View All Alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}