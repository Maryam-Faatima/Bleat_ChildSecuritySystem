"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ChildCard from "@/app/components/ChildCard";
import AlertCard from "@/app/components/AlertCard";
import DeviceStatus from "@/app/components/DeviceStatus";
import MessageCard from '@/app/components/MessageCard';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService } from '@/lib/api';
import SafeZonesManager from "@/app/components/SafeZonesManager"; // Import the Safe Zones component
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Mapbox
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { SOSService } from "@/app/lib/SOSService";

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

// Small helper component to manage messages per child inside the parent dashboard
function ChildMessagesRow({ child, parentId }: { child: Child; parentId?: number }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    if (!parentId) return;
    setLoading(true);
    try {
      const msgs = await ApiService.getMessagesWithChild(parentId, child.childId);
      setMessages(msgs || []);
      setExpanded(true);
    } catch (e) {
      console.error('Failed to load messages for child', e);
      alert('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!parentId) { alert('Parent not identified'); return; }
    const text = window.prompt(`Message to ${child.name}`);
    if (!text || text.trim().length === 0) return;

    // Optimistic UI: add a temporary message card
    const tempId = `temp-${Date.now()}`;
    const tempMsg: any = {
      messageId: tempId,
      content: text.trim(),
      sentAt: new Date().toISOString(),
      _status: 'sending',
    };

    setMessages((prev) => [tempMsg, ...prev]);

    try {
      const res = await ApiService.sendMessage(parentId, child.childId, text.trim());
      if (res && res.success) {
        // Replace temporary message with server-provided message info
        setMessages((prev) => prev.map((m) => {
          if (m.messageId === tempId) {
            return {
              messageId: res.messageId,
              content: text.trim(),
              sentAt: res.sentAt || new Date().toISOString(),
              _status: 'sent',
            };
          }
          return m;
        }));
      } else {
        // mark as failed
        setMessages((prev) => prev.map((m) => m.messageId === tempId ? { ...m, _status: 'failed' } : m));
      }
    } catch (e) {
      console.error('Send message failed', e);
      setMessages((prev) => prev.map((m) => m.messageId === tempId ? { ...m, _status: 'failed' } : m));
    }
  };

  const handleAcknowledge = async (msgId: number) => {
    if (!parentId) return;
    try {
      await ApiService.acknowledgeMessageAsParent(parentId, child.childId, msgId);
      setMessages((prev) => prev.filter((m) => m.messageId !== msgId));
    } catch (e) {
      console.error('Ack failed', e);
    }
  };

  return (
    <div className="card mb-2 p-3">
      <div className="d-flex justify-content-between align-items-center">
        <div><strong>{child.name}</strong></div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={handleSend}>Send Message</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => (expanded ? setExpanded(false) : loadMessages())}>
            {expanded ? 'Hide' : (loading ? 'Loading...' : 'View Messages')}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3">
          {messages.length === 0 ? (
            <div className="small text-muted">No messages</div>
          ) : (
            messages.map((m: any) => (
              <div key={m.messageId} className="mb-2">
                <MessageCard sender={child.name} content={m.content || m.message || ''} timestamp={new Date(m.sentAt || m.timestamp).toLocaleString()} />
                <div className="d-flex gap-2 align-items-center">
                  <button className="btn btn-sm btn-outline-success" onClick={() => handleAcknowledge(m.messageId)}>Acknowledge</button>
                  {m._status === 'sending' && (
                    <span className="text-muted small">Sending...</span>
                  )}
                  {m._status === 'failed' && (
                    <>
                      <span className="text-danger small">Failed</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={async () => {
                        // retry logic: try sending again
                        const retryTempId = m.messageId;
                        setMessages((prev) => prev.map(x => x.messageId === retryTempId ? { ...x, _status: 'sending' } : x));
                        try {
                          const r = await ApiService.sendMessage(parentId, child.childId, m.content || m.message || '');
                          if (r && r.success) {
                            setMessages((prev) => prev.map(x => x.messageId === retryTempId ? { messageId: r.messageId, content: m.content, sentAt: r.sentAt || new Date().toISOString(), _status: 'sent' } : x));
                          } else {
                            setMessages((prev) => prev.map(x => x.messageId === retryTempId ? { ...x, _status: 'failed' } : x));
                          }
                        } catch (err) {
                          console.error('Retry send failed', err);
                          setMessages((prev) => prev.map(x => x.messageId === retryTempId ? { ...x, _status: 'failed' } : x));
                        }
                      }}>Retry</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
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
  const router = useRouter();
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [showSafeZonesManager, setShowSafeZonesManager] = useState(false);

  /* -------------------------
     Safe Zones State
  -------------------------- */


  /* -------------------------
     Mock Live Child Locations with Safe Zone Status
  -------------------------- */


  /* -------------------------
     Safe Zones State (from DB)
  -------------------------- */
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);

  /* -------------------------
     Child Live Location State (from DB)
  -------------------------- */
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([]);

  /* -------------------------
     Load Safe Zones from DB
  -------------------------- */
  const loadSafeZones = async (parentId: number, children: Child[]) => {
    try {
      const zones: SafeZone[] = [];

      for (const child of children) {
        const z = await ApiService.getSafeZones(parentId, child.childId);
        if (z && Array.isArray(z)) zones.push(...z);
      }

      setSafeZones(zones);
    } catch (err) {
      console.error("Failed to load safe zones", err);
    }
  };

  /* -------------------------
     Load Child Locations (DB)
  -------------------------- */
  const loadChildLocations = async (parentId: number, children: Child[]) => {
  try {
    // Use a plain object instead of Map
    const existingLocationsLookup: { [key: number]: ChildLocation } = {};
    childLocations.forEach(loc => {
      existingLocationsLookup[loc.id] = loc;
    });
    
    const updatedLocations: ChildLocation[] = [];

    for (const c of children) {
      let loc = null;

      try {
        loc = await ApiService.trackChildLocation(parentId, c.childId);
      } catch (e) {
        console.warn("Location API error for child:", c.childId, e);
      }

      // If we have new location data for this child, use it
      if (loc && loc.latitude != null && loc.longitude != null && 
          loc.latitude !== 0 && loc.longitude !== 0) {
        const zoneStatus = isChildInSafeZone(loc.latitude, loc.longitude, safeZones);
        
        updatedLocations.push({
          id: c.childId,
          name: c.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          status: zoneStatus.inZone ? "Safe" : "In Danger",
          inSafeZone: zoneStatus.inZone,
          currentZone: zoneStatus.zoneName,
        });
      } else {
        // If no new location data, use the existing data or create a default
        const existingLocation = existingLocationsLookup[c.childId];
        
        if (existingLocation) {
          // Keep the existing location data
          updatedLocations.push(existingLocation);
        } else {
          // Create a default location for new children
          updatedLocations.push({
            id: c.childId,
            name: c.name,
            latitude: 0,
            longitude: 0,
            status: "In Danger",
            inSafeZone: false,
            currentZone: "No Device / Device Inactive"
          });
        }
      }
    }

    setChildLocations(updatedLocations);
  } catch (err) {
    console.error("Failed to load child locations", err);
  }
};
  /* -------------------------
     Polling for Live Tracking
  -------------------------- */
  useEffect(() => {
  let interval: any = null;
  
  const startPolling = () => {
    interval = setInterval(async () => {
      try {
        const user = AuthenticationManager.getLoggedInUser();
        if (!user) return;
        const parentId = user.role === 'parent' ? user.userId : user.parentId;
        if (!parentId || childrenList.length === 0) return;

        const updatedLocations: ChildLocation[] = [];
        
        for (const c of childrenList) {
          try {
            const raw: any = await ApiService.trackChildLocation(parentId, c.childId);

            // Handle missing/invalid location data
            if (!raw || raw.latitude == null || raw.longitude == null) {
              updatedLocations.push({
                id: c.childId,
                name: c.name,
                latitude: 0,
                longitude: 0,
                status: "In Danger",
                inSafeZone: false,
                currentZone: "No Device / Device Inactive"
              });
              continue;
            }

            const loc = {
              latitude: raw.latitude ?? 0,
              longitude: raw.longitude ?? 0,
            };

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
          } catch (e) {
            // If API call fails, still show the child with inactive status
            updatedLocations.push({
              id: c.childId,
              name: c.name,
              latitude: 0,
              longitude: 0,
              status: "In Danger",
              inSafeZone: false,
              currentZone: "No Device / Device Inactive"
            });
          }
        }
        
        // Always update with all children, even if some have no location
        setChildLocations(updatedLocations);
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 5000);
  };

  if (isLiveTracking && activeTab === 'locations') startPolling();
  return () => { if (interval) clearInterval(interval); };
}, [childrenList, isLiveTracking, activeTab, safeZones]);

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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

  const handleSendSosToChildContacts = async (childId: number) => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) { alert('Please login to send SOS'); return; }
      const parentId = user.role === 'parent' ? user.userId : user.parentId;
      if (!parentId) { alert('Parent not linked'); return; }

      const contacts = await ApiService.getEmergencyContacts(parentId, childId);
      if (!contacts || contacts.length === 0) { alert('No emergency contacts found for child'); return; }
      for (const c of contacts) {
        try {
          SOSService.notifyEmergencyServices(c);
        } catch (e) {
          console.warn('Failed notify contact', c, e);
        }
      }
      alert('Notified emergency contacts for child');
    } catch (error) {
      console.error('Send SOS to child contacts error', error);
      alert('Failed to notify emergency contacts');
    }
  };

  const handleSendSosToAllChildren = async () => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) { alert('Please login to send SOS'); return; }
      const parentId = user.role === 'parent' ? user.userId : user.parentId;
      if (!parentId) { alert('Parent not linked'); return; }

      const results = await Promise.allSettled(childrenList.map(c => ApiService.triggerSos(parentId, c.childId)));
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      alert(`SOS sent to ${successCount} / ${childrenList.length} children`);
    } catch (error) {
      console.error('Send SOS to all children error', error);
      alert('Failed to send SOS to all children');
    }
  };

  const handleSendSosToAllContacts = async () => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) { alert('Please login to send SOS'); return; }
      const parentId = user.role === 'parent' ? user.userId : user.parentId;
      if (!parentId) { alert('Parent not linked'); return; }

      let notified = 0;
      for (const child of childrenList) {
        const contacts = await ApiService.getEmergencyContacts(parentId, child.childId);
        for (const c of (contacts || [])) {
          try { SOSService.notifyEmergencyServices(c); notified++; } catch (e) { console.warn('notify failed', e); }
        }
      }
      alert(`Notified ${notified} emergency contacts`);
    } catch (error) {
      console.error('Send SOS to all contacts error', error);
      alert('Failed to notify emergency contacts');
    }
  };
  // Update child locations with safe zone checking
  const updateChildLocations = () => {
    setChildLocations(prev =>
      prev.map(child => {
        const newLng = child.longitude + (Math.random() * 0.002 - 0.001);
        const newLat = child.latitude + (Math.random() * 0.002 - 0.001);

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

  const handleSafeZonesUpdate = (zones: SafeZone[]) => {
    setSafeZones(zones);
    // Re-check all children against new safe zones
    updateChildLocations();
  };

  // Device status modal state and handler
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceStatusData, setDeviceStatusData] = useState<any>(null);
  const [deviceLoading, setDeviceLoading] = useState(false);

  const handleViewDeviceStatus = async (childId: number) => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) { alert('Please login to view device status'); return; }
      const parentId = user.role === 'parent' ? user.userId : user.parentId;
      if (!parentId) { alert('Parent not linked'); return; }
      setDeviceLoading(true);
      const status = await ApiService.getDeviceStatus(parentId, childId);
      setDeviceStatusData(status);
      setShowDeviceModal(true);
    } catch (err) {
      console.error('View device status failed', err);
      alert('Failed to fetch device status');
    } finally {
      setDeviceLoading(false);
    }
  };

  /* -------------------------
     JSX
  -------------------------- */
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        backgroundImage:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
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
                    className={`nav-link btn ${activeTab === "children"
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
                    className={`nav-link btn ${activeTab === "messages"
                      ? "btn-primary text-white"
                      : "btn-light"
                      }`}
                    onClick={() => setActiveTab("messages")}
                  >
                    Messages
                  </button>
                </li>



                <li className="nav-item">
                  <Link href="/parent/reports">
                    <button className={`nav-link btn ${activeTab === "reports"
                      ? "btn-primary text-white"
                      : "btn-light"
                      }`}>Open Reports Page</button>
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link btn ${activeTab === "locations"
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
                    className={`nav-link btn ${activeTab === "sos"
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
                    childId={child.childId}
                    name={child.name}
                    age={child.age}
                    status={child.status}
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
                <ChildMessagesRow
                  key={child.childId}
                  child={child}
                  parentId={(AuthenticationManager.getLoggedInUser() as any)?.userId}
                />
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
                    className={`btn btn-sm ${isLiveTracking ? "btn-success" : "btn-secondary"
                      }`}
                  >
                    {isLiveTracking ? "🟢 Live Tracking" : "⚪ Live Tracking"}
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowSafeZonesManager(!showSafeZonesManager)}
                  >
                    {showSafeZonesManager ? "Hide Zones" : "Manage Safe Zones"}
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
                            className={`badge ms-1 ${selectedChild.inSafeZone ? "bg-success" : "bg-danger"
                              }`}
                          >
                            {selectedChild.inSafeZone ? "In Safe Zone" : "🚨 Outside Safe Zone"}
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
                      className={`card p-3 ${selectedChild?.id === child.id
                        ? "border-primary border-2"
                        : ""
                        } ${child.inSafeZone ? "border-success" : "border-danger"
                        }`}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{child.name}</strong>
                          <span
                            className={`badge ms-2 ${child.inSafeZone ? "bg-success" : "bg-danger"
                              }`}
                          >
                            {child.inSafeZone ? "Safe" : "🚨 Alert"}
                          </span>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleTrackChild(child)}
                        >
                          Track
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
                          {child.currentZone === "No Device / No Location"
                            ? <span className="text-danger small">No device active</span>
                            : <span className="small">📍 {child.latitude.toFixed(6)}, {child.longitude.toFixed(6)}</span>
                          }
                        </p>
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

              <div className="d-flex gap-2 mb-3">

                <button className="btn btn-outline-danger btn-lg flex-fill" onClick={handleSendSosToAllContacts}>
                  Send SOS To All Emergency Contacts
                </button>
              </div>

              <div className="row row-cols-1 row-cols-md-2 g-3">
                {childrenList.map((child: Child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3 text-center">
                      <strong>{child.name}</strong>
                      <div className="d-flex gap-2 mt-2 justify-content-center">
                      
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleSendSosToChildContacts(child.childId)}>
                          Send SOS To Emergency Contacts
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewDeviceStatus(child.childId)}>
                          View Device Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device Status Modal */}
          {showDeviceModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card p-3" style={{ width: 420 }}>
                <h6 className="mb-2">Device Status</h6>
                {deviceLoading ? (
                  <div>Loading...</div>
                ) : deviceStatusData ? (
                  <div>
                    <div><strong>Device ID:</strong> {deviceStatusData.deviceId}</div>
                    <div><strong>Status:</strong> {deviceStatusData.status}</div>
                    <div><strong>Battery:</strong> {deviceStatusData.batteryLevel}</div>
                    <div><strong>Active:</strong> {String(deviceStatusData.active)}</div>
                    <div className="small text-muted">Checked: {deviceStatusData.checkedAt}</div>
                  </div>
                ) : (
                  <div className="text-muted">No device information available</div>
                )}
                <div className="d-grid mt-3">
                  <button className="btn btn-secondary" onClick={() => { setShowDeviceModal(false); setDeviceStatusData(null); }}>Close</button>
                </div>
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