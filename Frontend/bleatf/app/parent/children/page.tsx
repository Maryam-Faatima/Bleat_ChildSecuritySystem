'use client';
import Link from 'next/link';
import { useState } from 'react';
import { mockChildren } from '@/app/lib/mockData';
import EmergencyContact from '@/app/components/EmergencyContact';
import SafeZone from '@/app/components/SafeZone';
import { mockSafeZones } from '@/app/lib/mockData';

export default function ChildrenPage() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  const [showAddEmergencyContact, setShowAddEmergencyContact] = useState(false);

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
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Manage Children</h1>
            <p className="text-muted small mb-3">Edit profiles, emergency contacts, and safe zones</p>
            <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          <div className="row g-2 w-100">
            {/* Children List */}
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Children</h6>
                  <div className="list-group list-group-flush">
                    {mockChildren.map((child) => (
                      <button
                        key={child.childId}
                        onClick={() => setSelectedChild(child)}
                        className={`list-group-item list-group-item-action py-2 px-1 small ${
                          selectedChild.childId === child.childId ? 'active' : ''
                        }`}
                      >
                        <div className="fw-semibold">{child.name}</div>
                        <div className="text-muted small">{child.age} years old</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Child Details */}
            <div className="col-12 col-md-8">
              {/* Profile */}
              <div className="card mb-2">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">{selectedChild.name}</h6>
                  <div className="row">
                    <div className="col-6">
                      <div className="small text-muted">Age</div>
                      <div className="small fw-semibold">{selectedChild.age} years</div>
                    </div>
                    <div className="col-6">
                      <div className="small text-muted">Status</div>
                      <div className={`small fw-semibold ${selectedChild.status === 'active' ? 'text-success' : 'text-danger'}`}>
                        {selectedChild.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm w-100 mt-2">Edit Profile</button>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="card mb-2">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title mb-0">Emergency Contacts</h6>
                    <button onClick={() => setShowAddEmergencyContact(!showAddEmergencyContact)} className="btn btn-primary btn-sm">+ Add</button>
                  </div>

                  {showAddEmergencyContact && (
                    <div className="border rounded p-2 mb-2">
                      <h6 className="small mb-2">Add Contact</h6>
                      <form className="d-flex flex-column gap-1">
                        <input type="text" placeholder="Name" className="form-control form-control-sm" />
                        <input type="tel" placeholder="Phone" className="form-control form-control-sm" />
                        <input type="text" placeholder="Relation" className="form-control form-control-sm" />
                        <div className="d-flex gap-1">
                          <button type="submit" className="btn btn-primary btn-sm flex-grow-1">Add</button>
                          <button type="button" onClick={() => setShowAddEmergencyContact(false)} className="btn btn-secondary btn-sm flex-grow-1">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="list-group list-group-flush">
                    {selectedChild.emergencyContacts.map((contact) => (
                      <div key={contact.contactId} className="list-group-item py-2 px-0">
                        <EmergencyContact
                          contactId={contact.contactId}
                          name={contact.name}
                          phone={contact.phone}
                          relation={contact.relation}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      </div>
                    ))}
                    {selectedChild.emergencyContacts.length === 0 && (
                      <div className="text-muted small text-center py-2">No emergency contacts added</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Safe Zones */}
              <div className="card">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title mb-0">Safe Zones</h6>
                    <button className="btn btn-primary btn-sm">+ Create</button>
                  </div>
                  <div className="list-group list-group-flush">
                    {mockSafeZones.map((zone) => (
                      <div key={zone.zoneId} className="list-group-item py-2 px-0">
                        <SafeZone
                          zoneId={zone.zoneId}
                          name={zone.name}
                          centerLatitude={zone.centerLatitude}
                          centerLongitude={zone.centerLongitude}
                          radiusMeters={zone.radiusMeters}
                          isActive={zone.isActive}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      </div>
                    ))}
                    {mockSafeZones.length === 0 && (
                      <div className="text-muted small text-center py-2">No safe zones created</div>
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
