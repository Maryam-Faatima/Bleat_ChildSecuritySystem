'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AlertCard from '@/app/components/AlertCard';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService } from '@/lib/api';

interface ServerAlert {
  alertId: number;
  childId?: number;
  type: string;
  message: string;
  timestamp: string;
  childName?: string;
}

export default function AlertsPage() {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [alerts, setAlerts] = useState<ServerAlert[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const user = AuthenticationManager.getLoggedInUser();
        if (!user) return;
        const parentId = user.role === 'parent' ? user.userId : user.parentId;
        if (!parentId) return;

        const [serverAlerts, children] = await Promise.all([
          ApiService.getAlerts(parentId),
          ApiService.getChildren(parentId),
        ]);

        const nameMap = new Map<number, string>();
        (children || []).forEach((c: any) => nameMap.set(c.id ?? c.childId, c.name));

        const mapped = (serverAlerts || []).map((a: any) => ({
          alertId: a.alertId ?? a.sosId ?? 0,
          childId: a.childId ?? null,
          type: a.type ?? 'SOS',
          message: a.message ?? a.description ?? '',
          timestamp: a.timestamp,
          childName: nameMap.get(a.childId ?? a.child) ?? `Child ${a.childId ?? ''}`,
        }));

        setAlerts(mapped as any);
      } catch (e) {
        console.error('Failed to load alerts', e);
      }
    };
    load();
  }, []);

  const handleAcknowledgeAlert = (alertId: number) => {
    setAcknowledgedAlerts([...acknowledgedAlerts, alertId]);
  };

  const filteredAlerts = alerts.filter((alert: any) => {
    if (filterType === 'unread') return !acknowledgedAlerts.includes(alert.alertId) && !alert.isAcknowledged;
    if (filterType === 'acknowledged') return acknowledgedAlerts.includes(alert.alertId) || alert.isAcknowledged;
    return true;
  });

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
        style={{ maxWidth: 900, borderRadius: 18, padding: '1.5rem', maxHeight: '95vh', overflowY: 'auto' }}
      >
        <div className="d-flex flex-column align-items-center w-100">
          {/* Header */}
          <div className="text-center mb-4 w-100">
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Alerts</h1>
            <p className="text-muted small mb-3">Review and manage all alerts</p>
            <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          {/* Filter Controls */}
          <div className="w-100 mb-4">
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <button
                onClick={() => setFilterType('all')}
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`btn btn-sm ${filterType === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                Unread ({alerts.filter((a) => !acknowledgedAlerts.includes(a.alertId)).length})
              </button>
              <button
                onClick={() => setFilterType('acknowledged')}
                className={`btn btn-sm ${filterType === 'acknowledged' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                Acknowledged ({alerts.filter((a) => acknowledgedAlerts.includes(a.alertId)).length})
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="w-100">
            {filteredAlerts.length === 0 ? (
              <div className="alert alert-info text-center small mb-0">No alerts to display</div>
            ) : (
              <div className="list-group list-group-flush">
                {filteredAlerts.map((alert: any) => (
                  <div key={alert.alertId} className="list-group-item py-2 px-0">
                    <AlertCard
                      type={alert.type}
                      description={`${(alert as any).childName || ''}: ${alert.message}`}
                      timestamp={new Date(alert.timestamp).toLocaleString()}
                      onAcknowledge={() => handleAcknowledgeAlert(alert.alertId)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
