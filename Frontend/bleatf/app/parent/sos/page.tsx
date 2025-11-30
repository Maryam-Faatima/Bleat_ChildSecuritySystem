'use client';
import Link from 'next/link';
import { useState } from 'react';
import { mockChildren, mockSOSHistory } from '@/app/lib/mockData';
import { SOSService } from '@/app/lib/SOSService';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService } from '@/lib/api';

export default function SOSPage() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  const [sosStatus, setSosStatus] = useState<'idle' | 'triggered' | 'resolved'>('idle');
  const [sosHistory, setSosHistory] = useState(mockSOSHistory);

  const handleTriggerSOS = async () => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) return alert('Please login as a parent to trigger SOS');
      setSosStatus('triggered');

      // Call backend to notify emergency services
      try {
        const childId = selectedChild.childId ?? selectedChild.id;
        const resp = await ApiService.triggerSos(user.userId, childId);
        console.debug('triggerSos response', resp);
      } catch (err) {
        console.error('Failed to send SOS to emergency services', err);
      }

      // Notify emergency contacts on the client side (best-effort)
      try {
        const contacts = selectedChild?.emergencyContacts || [];
        for (const contact of contacts) {
          SOSService.notifyEmergencyServices(contact);
        }
      } catch (err) {
        console.warn('Failed to notify emergency contacts locally', err);
      }

      // Auto-resolve after demo
      setTimeout(() => setSosStatus('resolved'), 3000);
    } catch (e) {
      console.error('handleTriggerSOS error', e);
      alert('Failed to trigger SOS');
    }
  };

  const handleCancelSOS = () => {
    setSosStatus('idle');
    SOSService.cancelSOS(selectedChild.childId);
  };

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
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Emergency SOS</h1>
            <p className="text-muted small mb-3">Trigger emergency alert for your child</p>
            <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          <div className="row g-2 w-100">
            {/* SOS Trigger */}
            <div className="col-12 col-md-8">
              <div className="card mb-2">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Select Child</h6>
                  <select
                    value={selectedChild.childId}
                    onChange={(e) => 
                      setSelectedChild(mockChildren.find((c) => c.childId === parseInt(e.target.value)) || selectedChild)
                    }
                    className="form-select form-select-sm"
                  >
                    {mockChildren.map((child) => (
                      <option key={child.childId} value={child.childId}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Display */}
              <div
                className="card text-center mb-2 p-3"
                style={{
                  backgroundColor:
                    sosStatus === 'triggered' ? 'var(--color-alert)' :
                    sosStatus === 'resolved' ? 'var(--color-success)' :
                    '#f0f0f0',
                  color: sosStatus === 'triggered' || sosStatus === 'resolved' ? '#fff' : '#000',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {sosStatus === 'idle' ? '🔔' : sosStatus === 'triggered' ? '🆘' : '✅'}
                </div>
                <div className="fw-bold">
                  {sosStatus === 'idle' && 'No Active SOS'}
                  {sosStatus === 'triggered' && 'SOS ACTIVE!'}
                  {sosStatus === 'resolved' && 'SOS Resolved'}
                </div>
                <div className="small">
                  {sosStatus === 'idle' && 'Emergency alert ready'}
                  {sosStatus === 'triggered' && 'Contacts have been notified'}
                  {sosStatus === 'resolved' && 'Alert has been handled'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {sosStatus === 'idle' && (
                  <>
                    <button onClick={handleTriggerSOS} className="btn btn-lg" style={{ background: 'var(--color-alert)', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                      🆘 TRIGGER SOS
                    </button>
                    <div className="text-center">
                      <small className="text-muted">This will immediately notify all emergency contacts</small>
                    </div>
                  </>
                )}
                {sosStatus === 'triggered' && (
                  <button onClick={handleCancelSOS} className="btn btn-secondary btn-lg">
                    Cancel SOS
                  </button>
                )}
                {sosStatus === 'resolved' && (
                  <button
                    onClick={() => setSosStatus('idle')}
                    className="btn btn-primary btn-lg"
                  >
                    Clear Status
                  </button>
                )}
              </div>
            </div>

            {/* Emergency Contacts & History */}
            <div className="col-12 col-md-4">
              {/* Contacts */}
              <div className="card mb-2">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Emergency Contacts</h6>
                  <div className="list-group list-group-flush">
                    {selectedChild.emergencyContacts.length === 0 ? (
                      <div className="small text-muted">No contacts added</div>
                    ) : (
                      selectedChild.emergencyContacts.map((contact) => (
                        <div key={contact.contactId} className="list-group-item py-2 px-0">
                          <div className="fw-semibold small">{contact.name}</div>
                          <div className="small text-muted">{contact.relation}</div>
                          <div className="small">{contact.phone}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* SOS History */}
              <div className="card">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Recent SOS</h6>
                  <div className="list-group list-group-flush">
                    {sosHistory.slice(0, 3).map((event) => (
                      <div key={event.sosId} className="list-group-item py-2 px-0 small">
                        <div className="fw-semibold">{event.childName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                        <div className={`fw-semibold small ${event.status === 'resolved' ? 'text-success' : 'text-danger'}`}>
                          {event.status.toUpperCase()}
                        </div>
                      </div>
                    ))}
                    {sosHistory.length === 0 && (
                      <div className="small text-muted">No SOS history</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
