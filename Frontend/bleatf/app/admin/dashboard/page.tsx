'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { mockChildren, mockParent, mockAlerts, mockDevices, mockAuditLogs } from '@/app/lib/mockData';
import { ApiService } from '@/lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'parents' | 'children' | 'devices' | 'alerts' | 'audit'>('overview');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddParentForm, setShowAddParentForm] = useState(false);
  const [newParent, setNewParent] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    AOS.init({ duration: 600 });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load pending users from backend
      const pending = await ApiService.getPendingUsers();
      setPendingUsers(pending || []);
      // Load parents - using mock for now
      setParents(mockParent || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticateUser = async (userId: number, approved: boolean) => {
    try {
      const resp = await ApiService.authenticateUser(userId, approved);
      if (resp && resp.success) {
        alert(resp.message || `User ${approved ? 'approved' : 'rejected'} successfully`);
        await loadData();
      } else {
        alert('Failed to process authentication');
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      alert('Failed to process authentication');
    }
  };

  const handleAddParent = async () => {
    if (!newParent.name || !newParent.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Call backend API to add parent
      const response = await ApiService.login(1, ''); // Placeholder
      if (response.success) {
        alert('Parent added successfully');
        setNewParent({ name: '', email: '', phone: '' });
        setShowAddParentForm(false);
        loadData();
      }
    } catch (error) {
      console.error('Error adding parent:', error);
      alert('Failed to add parent');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParent = async (parentId: number) => {
    if (!confirm('Are you sure you want to remove this parent?')) return;

    try {
      setLoading(true);
      // Call backend API to remove parent
      alert('Parent removed successfully');
      loadData();
    } catch (error) {
      console.error('Error removing parent:', error);
      alert('Failed to remove parent');
    } finally {
      setLoading(false);
    }
  };

  const activeDevices = mockDevices.filter((d) => d.isActive).length;
  const totalAlerts = mockAlerts.length;
  const recentAuditLogs = mockAuditLogs.slice(0, 5);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
       // padding: '1rem',
      }}
    >
      <div className="card shadow rounded-4 w-100" style={{ maxWidth: 1200, borderRadius: 18, padding: '1.5rem' }}>
        
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-3 mb-4">
          <div className="container-fluid">
            <span className="navbar-brand fw-bold">Admin Dashboard</span>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='overview'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('overview')}>Overview</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='users'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('users')}>Authenticate Users</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='parents'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('parents')}>Manage Parents</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='children'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('children')}>Children</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='devices'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('devices')}>Devices</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='alerts'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('alerts')}>Alerts</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='audit'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('audit')}>Audit Logs</button>
                </li>
                <li className="nav-item ms-3">
                  <Link href="/login" className="btn btn-outline-secondary">Logout</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="row g-3">
          
          {activeTab === 'overview' && (
            <>
              <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
                <div className="card text-center p-3 h-100">
                  <div className="fs-5 fw-bold">{mockParent.length || 1}</div>
                  <div className="small text-muted">Parents</div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
                <div className="card text-center p-3 h-100">
                  <div className="fs-5 fw-bold">{mockChildren.length}</div>
                  <div className="small text-muted">Children</div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
                <div className="card text-center p-3 h-100">
                  <div className="fs-5 fw-bold">{activeDevices}/{mockDevices.length}</div>
                  <div className="small text-muted">Active Devices</div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
                <div className="card text-center p-3 h-100">
                  <div className="fs-5 fw-bold">{totalAlerts}</div>
                  <div className="small text-muted">Total Alerts</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'parents' && (
            <div className="col-12" data-aos="fade-up">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Parent Accounts</h5>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowAddParentForm(!showAddParentForm)}
                >
                  {showAddParentForm ? 'Cancel' : '+ Add Parent'}
                </button>
              </div>

              {showAddParentForm && (
                <div className="card p-3 mb-3">
                  <h6>Add New Parent</h6>
                  <input
                    type="text"
                    placeholder="Parent Name"
                    value={newParent.name}
                    onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
                    className="form-control mb-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newParent.email}
                    onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                    className="form-control mb-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newParent.phone}
                    onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                    className="form-control mb-2"
                  />
                  <button 
                    className="btn btn-success w-100"
                    onClick={handleAddParent}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Parent'}
                  </button>
                </div>
              )}

              <div className="row row-cols-1 row-cols-md-2 g-3">
                {Array.isArray(parents) && parents.length > 0 ? (
                  parents.map((parent: any) => (
                    <div key={parent.id || Math.random()} className="col">
                      <div className="card p-3">
                        <h6 className="fw-bold">{parent.name}</h6>
                        <p className="small mb-1"><strong>Email:</strong> {parent.email}</p>
                        <p className="small mb-2"><strong>Phone:</strong> {parent.phoneNumber || 'N/A'}</p>
                        <button 
                          className="btn btn-sm btn-outline-danger w-100"
                          onClick={() => handleRemoveParent(parent.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-info">No parents registered yet</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Pending User Authentication</h5>
              
              {pendingUsers.length === 0 ? (
                <div className="alert alert-success">No users pending authentication</div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 g-3">
                  {pendingUsers.map((user: any) => (
                    <div key={user.userId} className="col">
                      <div className="card p-3">
                        <h6 className="fw-bold">{user.name}</h6>
                        <p className="small mb-1"><strong>Email:</strong> {user.email}</p>
                        <p className="small mb-2"><strong>Phone:</strong> {user.phone}</p>
                        <p className="small mb-3">
                          <span className="badge bg-warning text-dark">Status: {user.status}</span>
                        </p>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-success flex-fill"
                            onClick={() => handleAuthenticateUser(user.userId, true)}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-danger flex-fill"
                            onClick={() => handleAuthenticateUser(user.userId, false)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'children' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Children</h5>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {mockChildren.map((child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3">
                      <strong>{child.name}</strong>
                      <p>Status: {child.status === 'active' ? 'Safe' : 'In Danger'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Device Health</h5>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {mockDevices.map((device) => (
                  <div key={device.deviceId} className="col">
                    <div className="card p-3 d-flex justify-content-between">
                      <div>
                        <strong>Device {device.deviceId}</strong>
                        <p className="mb-1">{device.status}</p>
                      </div>
                      <span className={`fw-semibold ${device.batteryLevel > 50 ? 'text-success' : 'text-danger'}`}>
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Alerts</h5>
              {mockAlerts.map((alert) => (
                <div key={alert.alertId} className="card p-3 mb-2">
                  <strong>{alert.childName}</strong>: {alert.description}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Recent Audit Logs</h5>
              {recentAuditLogs.map((log) => (
                <div key={log.logId} className="card p-3 mb-2">
                  <div className="fw-semibold">{log.action}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              ))}
              <Link href="/admin/auditlog" className="btn btn-secondary btn-sm mt-2 w-100">View All Logs</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
