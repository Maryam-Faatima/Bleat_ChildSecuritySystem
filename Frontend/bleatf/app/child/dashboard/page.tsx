"use client";
import Link from 'next/link';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api';
import MessageCard from '@/app/components/MessageCard';

export default function ChildDashboard() {
  const user = AuthenticationManager.getLoggedInUser();
  const displayName = user ? user.email || user.userId : 'Child';
  const parentId = user && (user as any).parentId ? (user as any).parentId : null;
  const childId = user ? user.userId : null;
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceStatusData, setDeviceStatusData] = useState<any | null>(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [sharingLocation, setSharingLocation] = useState<boolean>(true);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!childId) return;
      try {
        const msgs = await ApiService.getMessagesForChild(childId);
        setMessages(msgs || []);
        // Acknowledge all messages as received (best-effort)
        for (const m of (msgs || [])) {
          try { ApiService.acknowledgeMessageAsChild(childId, m.messageId); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        // ignore load errors
      }
    };
    loadMessages();
  }, [childId]);

  const handleViewDeviceStatus = async () => {
    if (!childId) { setStatusMsg('Not signed in as child'); return; }
    setShowDeviceModal(true);
    setDeviceLoading(true);
    try {
      const status = await ApiService.getDeviceStatus(parentId || 0, childId);
      setDeviceStatusData(status);
    } catch (err: any) {
      setStatusMsg('Failed to fetch device status: ' + (err?.message || err));
    } finally {
      setDeviceLoading(false);
    }
  };

  // Periodically share location to backend while sharingLocation is true
  useEffect(() => {
    let intervalId: any = null;
    if (!sharingLocation) return;

    const sendLocation = () => {
      if (!navigator.geolocation || !childId) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          await ApiService.childShareLocation(childId, lat, lon);
        } catch (e) {
          console.error('Failed to share location', e);
        }
      }, (err) => {
        console.warn('Geolocation error', err);
      }, { enableHighAccuracy: true, timeout: 10000 });
    };

    // send immediately and then poll
    sendLocation();
    intervalId = setInterval(sendLocation, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sharingLocation, childId]);

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
      <div className="card shadow rounded-4" style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
        <h3 className="mb-3">{displayName}'s Dashboard</h3>
        <p className="text-muted">This is the child dashboard. It mirrors the parent UI but is scoped to the child.</p>

        <div className="d-grid gap-2 mb-3">
          <button className="btn btn-danger" onClick={async () => {
            if (!childId) return setStatusMsg('Not signed in as child');
            setStatusMsg('Sending SOS...');
            try {
              const res = await ApiService.childTriggerSos(childId, 'Emergency SOS');
              setStatusMsg(res.message || 'SOS sent');
              setCurrentAlertId(res.alertId || null);
            } catch (e: any) {
              setStatusMsg('Failed to send SOS: ' + (e?.message || e));
            }
          }}>🚨 Send SOS</button>

          <button className="btn btn-primary" onClick={async () => {
            if (!childId) return setStatusMsg('Not signed in as child');
            setStatusMsg('Sharing location...');
            try {
              if (!navigator.geolocation) {
                setStatusMsg('Geolocation not available in this browser');
                return;
              }
              navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                  const lat = pos.coords.latitude;
                  const lon = pos.coords.longitude;
                  const res = await ApiService.childShareLocation(childId, lat, lon);
                  setStatusMsg(res.message || 'Location shared');
                } catch (e: any) {
                  setStatusMsg('Failed to share location: ' + (e?.message || e));
                }
              }, (err) => {
                setStatusMsg('Geolocation error: ' + err.message);
              }, { enableHighAccuracy: true, timeout: 10000 });
            } catch (e: any) {
              setStatusMsg('Failed to share location: ' + (e?.message || e));
            }
          }}>📍 Share Location</button>

          <button className="btn btn-outline-primary" onClick={handleViewDeviceStatus}>🔎 View Device Status</button>

          <div className="d-flex gap-2">
            <button className={"btn btn-sm " + (sharingLocation ? 'btn-success' : 'btn-outline-secondary')} onClick={() => setSharingLocation((s) => !s)}>
              {sharingLocation ? 'Sharing Location (On)' : 'Sharing Location (Off)'}
            </button>
            <button className="btn btn-sm btn-outline-info" onClick={async () => { setSharingLocation(false); setStatusMsg('Sending one-time location...'); try { if (!navigator.geolocation) return setStatusMsg('Geolocation not available'); navigator.geolocation.getCurrentPosition(async (pos) => { const lat = pos.coords.latitude; const lon = pos.coords.longitude; const res = await ApiService.childShareLocation(childId, lat, lon); setStatusMsg(res.message || 'Location shared'); }, (err)=> setStatusMsg('Geolocation error: ' + err.message)); } catch (e: any) { setStatusMsg('Failed to share location: ' + (e?.message || e)); } }}>Send Now</button>
          </div>

          </div>

        <div className="mt-3">
          <h5>Messages from Parent</h5>
          {messages.length === 0 ? (
            <div className="small text-muted">No messages</div>
          ) : (
            messages.map((m) => (
              <div key={m.messageId} className="mb-2">
                <MessageCard sender={'Parent'} content={m.content || m.message || ''} timestamp={new Date(m.sentAt || m.timestamp).toLocaleString()} />
              </div>
            ))
          )}
        </div>

        {currentAlertId && (
          <div className="mb-3">
            <div><strong>Active SOS ID:</strong> {currentAlertId}</div>
            <button className="btn btn-warning mt-2" onClick={async () => {
              if (!childId || !currentAlertId) return setStatusMsg('No active alert');
              setStatusMsg('Cancelling SOS...');
              try {
                const res = await ApiService.cancelSosAsChild(childId, currentAlertId);
                setStatusMsg(res.message || 'Cancelled');
                if (res.success) setCurrentAlertId(null);
              } catch (e: any) {
                setStatusMsg('Failed to cancel SOS: ' + (e?.message || e));
              }
            }}>Cancel SOS</button>
          </div>
        )}

        {statusMsg && <div className="alert alert-info mt-2">{statusMsg}</div>}

        <div>
          <strong>Linked Parent ID:</strong> {parentId ?? 'Not linked'}
        </div>
      </div>
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
    </div>
  );
}
