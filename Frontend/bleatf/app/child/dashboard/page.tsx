"use client";
import Link from 'next/link';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { useState } from 'react';
import { ApiService } from '@/lib/api';

export default function ChildDashboard() {
  const user = AuthenticationManager.getLoggedInUser();
  const displayName = user ? user.email || user.userId : 'Child';
  const parentId = user && (user as any).parentId ? (user as any).parentId : null;
  const childId = user ? user.userId : null;
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);

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

          <Link href="/parent/children" className="btn btn-outline-secondary">View Child Profile</Link>
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
    </div>
  );
}
