"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService, AddChildRequest } from '@/lib/api';
import { mockChildren } from '@/app/lib/mockData';
import EmergencyContact from '@/app/components/EmergencyContact';
import SafeZone from '@/app/components/SafeZone';
import { mockSafeZones } from '@/app/lib/mockData';

export default function ChildrenPage() {
  const [selectedChild, setSelectedChild] = useState<any>(
    mockChildren && mockChildren.length > 0
      ? mockChildren[0]
      : { childId: -1, name: '', age: 0, status: 'inactive', emergencyContacts: [] }
  );
  const [children, setChildren] = useState(mockChildren);
  const [showAddEmergencyContact, setShowAddEmergencyContact] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRelation, setAddRelation] = useState('');
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairMode, setPairMode] = useState<'pair' | 'replace'>('pair');
  const [deviceSerialInput, setDeviceSerialInput] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pendingChildForAction, setPendingChildForAction] = useState<any>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [newChild, setNewChild] = useState<{ name: string; age: number; username?: string; password?: string }>({ name: '', age: 6, username: '', password: '' });

  const handleAddChild = async () => {
  const user = AuthenticationManager.getLoggedInUser();
  if (!user) { alert('Please login as parent to add child'); return; }
  try {
    const payload: AddChildRequest = { 
      name: newChild.name, 
      age: newChild.age, 
      username: newChild.username, 
      password: newChild.password 
    };
    const resp = await ApiService.addChild(user.userId, payload);
    if (resp && resp.success) {
      // Remove the "pending admin approval" message
      alert('Child created successfully! (ID: ' + resp.childId + ')');
      setNewChild({ name: '', age: 6, username: '', password: '' });
      setShowAddChildForm(false);
      // Refresh the children list to show the new child immediately
      await refreshChildren();
    } else {
      alert('Failed to create child: ' + (resp?.message || 'unknown'));
    }
  } catch (error) {
    console.error('Add child error', error);
    alert('Failed to create child');
  }
};

  const refreshChildren = async () => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) return;
      const list = await ApiService.getChildren(user.userId);
      if (list) {
        // keep selection stable if possible
        setChildren(list as any[]);
        const selId = selectedChild ? (selectedChild.childId ?? (selectedChild as any).id) : null;
        if (selId) {
          const found = list.find((c: any) => (c.childId || c.id) === selId);
          if (found) setSelectedChild(found as any);
          if (found) loadEmergencyContacts(found as any).catch(()=>{});
          else if (list.length > 0) setSelectedChild(list[0] as any);
        } else if (list.length > 0) setSelectedChild(list[0]);
      }
    } catch (err) {
      console.error('refreshChildren failed', err);
    }
  };

  const loadEmergencyContacts = async (child: any) => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) return;
      const childId = child.childId ?? child.id;
      const contacts = await ApiService.getEmergencyContacts(user.userId, childId);
      // normalize backend field names (phone or phoneNumber)
      const normalized = (contacts || []).map((c: any) => ({
        contactId: c.contactId || c.contactID || c.id,
        name: c.name,
        phone: c.phone || c.phoneNumber,
        relation: c.relation || c.relationship || ''
      }));
      setSelectedChild({ ...child, emergencyContacts: normalized });
    } catch (err) {
      console.error('loadEmergencyContacts failed', err);
    }
  };

  // If URL contains ?addChild=true, open the add-child form automatically
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      if (searchParams?.get('addChild') === 'true') setShowAddChildForm(true);
    } catch (e) {
      // noop
    }
  }, [searchParams]);

  // load real children on mount
  useEffect(() => {
    refreshChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditProfile = async () => {
    try {
      if (!selectedChild) return alert('Select a child first');
      const name = window.prompt('New child name', selectedChild.name) || selectedChild.name;
      const ageStr = window.prompt('New age', String(selectedChild.age)) || String(selectedChild.age);
      const age = parseInt(ageStr || String(selectedChild.age)) || selectedChild.age;
      const user = AuthenticationManager.getLoggedInUser();
      if (!user) return alert('Not logged in');
      const childId = selectedChild.childId ?? (selectedChild as any).id;
      const res = await ApiService.updateChild(user.userId, childId, { name, age });
      if (res && res.success) {
        alert('Child updated');
        await refreshChildren();
      } else {
        alert('Failed to update child: ' + (res?.message || 'unknown'));
      }
    } catch (err) {
      console.error('Edit profile failed', err);
      alert('Edit failed');
    }
  };

  const handlePairDevice = async () => {
    if (!selectedChild) return setActionMessage('Select a child first');
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    setPendingChildForAction(selectedChild);
    setPairMode('pair');
    setDeviceSerialInput('');
    setPairingCode(null);
    try {
      const resp = await ApiService.generatePairingCode(user.userId);
      if (resp && resp.success) setPairingCode(resp.code || null);
    } catch (err) {
      console.warn('generatePairingCode failed', err);
    }
    setShowPairModal(true);
  };

  const handleReplaceDevice = async () => {
    if (!selectedChild) return setActionMessage('Select a child first');
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    setPendingChildForAction(selectedChild);
    setPairMode('replace');
    setDeviceSerialInput('');
    setShowPairModal(true);
  };

  const handleDeactivateDevice = async () => {
    if (!selectedChild) return setActionMessage('Select a child first');
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    setPendingChildForAction(selectedChild);
    setShowDeactivateModal(true);
  };

  const handleViewLocation = async () => {
    if (!selectedChild) return setActionMessage('Select a child first');
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    const childId = selectedChild.childId ?? (selectedChild as any).id;
    try {
      const loc = await ApiService.trackChildLocation(user.userId, childId);
      setLocationData(loc);
      setShowLocationModal(true);
    } catch (err) {
      console.error('View location failed', err);
      setActionMessage('Failed to get location');
    }
  };

  // submit handlers for modals
  const submitPair = async () => {
    if (!pendingChildForAction) return;
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    const childId = pendingChildForAction.childId ?? pendingChildForAction.id;
    try {
      const deviceIdToUse = deviceSerialInput || (pairingCode ? `SIM-${pairingCode}` : '');
      const r = await ApiService.pairDevice(user.userId, childId, deviceIdToUse);
      setActionMessage(r?.message || (pairMode === 'pair' ? 'Paired' : 'Replaced'));
      setShowPairModal(false);
      setPendingChildForAction(null);
      await refreshChildren();
    } catch (err) {
      console.error('Pair/Replace failed', err);
      setActionMessage('Pair/Replace failed');
    }
  };

  const confirmDeactivate = async () => {
    if (!pendingChildForAction) return;
    const user = AuthenticationManager.getLoggedInUser();
    if (!user) return setActionMessage('Not logged in');
    const childId = pendingChildForAction.childId ?? pendingChildForAction.id;
    try {
      const r = await ApiService.deactivateDevice(user.userId, childId, true);
      setActionMessage(r?.message || 'Device deactivated');
      setShowDeactivateModal(false);
      setPendingChildForAction(null);
      await refreshChildren();
    } catch (err) {
      console.error('Deactivate failed', err);
      setActionMessage('Deactivate failed');
    }
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
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Manage Children</h1>
            <p className="text-muted small mb-3">Edit profiles, emergency contacts, and safe zones</p>
            <div style={{display:'flex', gap:8, justifyContent:'center'}}>
              <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
            </div>
          </div>

          <div className="row g-2 w-100">
            {/* Children List */}
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title mb-0">Children</h6>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowAddChildForm(!showAddChildForm)}>{showAddChildForm ? 'Cancel' : '+ Add Child'}</button>
                  </div>
                  <div className="list-group list-group-flush">
                      {children.map((child, idx) => {
                      const childId = (child as any)?.childId ?? (child as any)?.id ?? idx;
                      const selId = selectedChild ? ((selectedChild as any).childId ?? (selectedChild as any).id) : null;
                      return (
                      <button
                        key={childId}
                        onClick={() => setSelectedChild(child)}
                        className={`list-group-item list-group-item-action py-2 px-1 small ${
                          selId === childId ? 'active' : ''
                        }`}
                      >
                        <div className="fw-semibold">{child.name}</div>
                        <div className="text-muted small">{child.age} years old</div>
                      </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Child Details */}
            <div className="col-12 col-md-8">
              {/* Profile */}
              <div className="card mb-2">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">{selectedChild?.name || 'No child selected'}</h6>
                  <div className="row">
                    <div className="col-6">
                      <div className="small text-muted">Age</div>
                      <div className="small fw-semibold">{selectedChild.age} years</div>
                    </div>
                    
                  </div>
                  {selectedChild?.deviceId && (
                    <div className="mt-2 small">
                      <div className="text-muted">Device ID: <span className="fw-semibold">{selectedChild.deviceId}</span></div>
                      <div className="text-muted">Device status: <span className="fw-semibold">{selectedChild.deviceStatus || 'UNKNOWN'}</span></div>
                    </div>
                  )}
                  <div className="d-grid gap-2 mt-2">
                    <button className="btn btn-secondary btn-sm" onClick={handleEditProfile}>Edit Profile</button>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary btn-sm flex-fill" onClick={handlePairDevice}>Pair Device</button>
                      <button className="btn btn-warning btn-sm flex-fill" onClick={handleReplaceDevice}>Replace Device</button>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-danger btn-sm flex-fill" onClick={handleDeactivateDevice}>Deactivate Device</button>
                      <button className="btn btn-outline-info btn-sm flex-fill" onClick={handleViewLocation}>View Location</button>
                    </div>
                  </div>
                </div>
              </div>

              {showAddChildForm && (
  <div className="card mb-3">
    <div className="card-body">
      {/* Remove "pending admin approval" from the heading */}
      <h6 className="mb-2">Create Child Account</h6>
      <div className="mb-2">
        <input className="form-control" placeholder="Child name" value={newChild.name} onChange={(e)=>setNewChild({...newChild, name: e.target.value})} />
      </div>
      <div className="mb-2">
        <input className="form-control" type="number" placeholder="Age" value={newChild.age} onChange={(e)=>setNewChild({...newChild, age: parseInt(e.target.value||'0')})} />
      </div>
      <div className="mb-2">
        <input className="form-control" placeholder="Username for child login" value={newChild.username} onChange={(e)=>setNewChild({...newChild, username: e.target.value})} />
      </div>
      <div className="mb-2">
        <input className="form-control" type="password" placeholder="Password" value={newChild.password} onChange={(e)=>setNewChild({...newChild, password: e.target.value})} />
      </div>
      <div className="d-grid">
        <button className="btn btn-primary" onClick={handleAddChild}>Create Child Account</button>
      </div>
    </div>
  </div>
)}
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
                      <form className="d-flex flex-column gap-1" onSubmit={async (e) => { e.preventDefault();
                        try {
                          const user = AuthenticationManager.getLoggedInUser();
                          if (!user) return alert('Not logged in');
                          if (!selectedChild) return alert('Select a child first');
                          const childId = selectedChild.childId ?? selectedChild.id;
                          if (!addName.trim() || !addPhone.trim()) return alert('Name and phone are required');
                          const resp = await ApiService.addEmergencyContact(user.userId, childId, { name: addName.trim(), phoneNumber: addPhone.trim(), relation: addRelation.trim() });
                          if (resp && resp.success) {
                            setAddName(''); setAddPhone(''); setAddRelation(''); setShowAddEmergencyContact(false);
                            await loadEmergencyContacts(selectedChild);
                          } else {
                            alert('Failed to add contact: ' + (resp?.message || 'unknown'));
                          }
                        } catch (err) {
                          console.error('Add contact failed', err); alert('Failed to add contact');
                        }
                      }}>
                        <input type="text" placeholder="Name" className="form-control form-control-sm" value={addName} onChange={(e)=>setAddName(e.target.value)} />
                        <input type="tel" placeholder="Phone" className="form-control form-control-sm" value={addPhone} onChange={(e)=>setAddPhone(e.target.value)} />
                        <input type="text" placeholder="Relation" className="form-control form-control-sm" value={addRelation} onChange={(e)=>setAddRelation(e.target.value)} />
                        <div className="d-flex gap-1">
                          <button type="submit" className="btn btn-primary btn-sm flex-grow-1">Add</button>
                          <button type="button" onClick={() => { setShowAddEmergencyContact(false); setAddName(''); setAddPhone(''); setAddRelation(''); }} className="btn btn-secondary btn-sm flex-grow-1">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="list-group list-group-flush">
                    {(selectedChild?.emergencyContacts || []).map((contact: any) => (
                      <div key={contact.contactId} className="list-group-item py-2 px-0">
                        {editingContactId === contact.contactId ? (
                          <div className="d-flex flex-column gap-1">
                            <input className="form-control form-control-sm" value={editName} onChange={(e)=>setEditName(e.target.value)} />
                            <input className="form-control form-control-sm" value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} />
                            <input className="form-control form-control-sm" value={editRelation} onChange={(e)=>setEditRelation(e.target.value)} />
                            <div className="d-flex gap-1">
                              <button className="btn btn-primary btn-sm" onClick={async ()=>{
                                try {
                                  const user = AuthenticationManager.getLoggedInUser(); if (!user) return alert('Not logged in');
                                  const childId = selectedChild.childId ?? selectedChild.id;
                                  if (!editName.trim() || !editPhone.trim()) return alert('Name and phone required');
                                  const resp = await ApiService.updateEmergencyContact(user.userId, childId, contact.contactId, { name: editName.trim(), phoneNumber: editPhone.trim(), relation: editRelation.trim() });
                                  if (resp && resp.success) {
                                    setEditingContactId(null); setEditName(''); setEditPhone(''); setEditRelation('');
                                    await loadEmergencyContacts(selectedChild);
                                  } else {
                                    alert('Failed to update: ' + (resp?.message || 'unknown'));
                                  }
                                } catch (err) { console.error('Save edit failed', err); alert('Save failed'); }
                              }}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>{ setEditingContactId(null); setEditName(''); setEditPhone(''); setEditRelation(''); }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <EmergencyContact
                            contactId={contact.contactId}
                            name={contact.name}
                            phone={contact.phone}
                            relation={contact.relation}
                            onEdit={() => { setEditingContactId(contact.contactId); setEditName(contact.name||''); setEditPhone(contact.phone||''); setEditRelation(contact.relation||''); }}
                            onDelete={async () => {
                              if (!confirm('Delete this contact?')) return;
                              try {
                                const user = AuthenticationManager.getLoggedInUser(); if (!user) return alert('Not logged in');
                                const childId = selectedChild.childId ?? selectedChild.id;
                                const resp = await ApiService.deleteEmergencyContact(user.userId, childId, contact.contactId);
                                if (resp && resp.success) {
                                  await loadEmergencyContacts(selectedChild);
                                } else {
                                  alert('Failed to delete contact');
                                }
                              } catch (err) { console.error('Delete contact failed', err); alert('Delete failed'); }
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {(selectedChild?.emergencyContacts || []).length === 0 && (
                      <div className="text-muted small text-center py-2">No emergency contacts added</div>
                    )}
                  </div>
                </div>
              </div>

            
                 
                
              
            </div>
          </div>

          {/* Modals / Overlays */}
          {showPairModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card p-3" style={{ width: 420 }}>
                <h6 className="mb-2">{pairMode === 'pair' ? 'Pair Device' : 'Replace Device'}</h6>
                <div className="mb-2">
                    <input className="form-control" placeholder="Device serial (leave blank to auto-generate)" value={deviceSerialInput} onChange={(e) => setDeviceSerialInput(e.target.value)} />
                    {pairingCode && (
                      <div className="mt-2 small text-muted">Pairing code: <strong>{pairingCode}</strong></div>
                    )}
                </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary flex-fill" onClick={submitPair}>Submit</button>
                    <button className="btn btn-outline-success flex-fill" onClick={submitPair} title="Simulate device scanned pairing code">Simulate device scan</button>
                    <button className="btn btn-secondary flex-fill" onClick={() => { setShowPairModal(false); setPendingChildForAction(null); }}>Cancel</button>
                  </div>
              </div>
            </div>
          )}

          {showDeactivateModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card p-3" style={{ width: 420 }}>
                <h6 className="mb-2">Deactivate Device</h6>
                <p>Are you sure you want to deactivate the device for <strong>{pendingChildForAction?.name}</strong>?</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-danger flex-fill" onClick={confirmDeactivate}>Deactivate</button>
                  <button className="btn btn-secondary flex-fill" onClick={() => { setShowDeactivateModal(false); setPendingChildForAction(null); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showLocationModal && (
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card p-3" style={{ width: 420 }}>
                <h6 className="mb-2">Last Known Location</h6>
                {locationData ? (
                  <div>
                    <div><strong>Latitude:</strong> {locationData.latitude}</div>
                    <div><strong>Longitude:</strong> {locationData.longitude}</div>
                    <div className="small text-muted">{locationData.timestamp}</div>
                  </div>
                ) : (
                  <div className="text-muted">No location available</div>
                )}
                <div className="d-grid mt-2">
                  <button className="btn btn-secondary" onClick={() => { setShowLocationModal(false); setLocationData(null); }}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
