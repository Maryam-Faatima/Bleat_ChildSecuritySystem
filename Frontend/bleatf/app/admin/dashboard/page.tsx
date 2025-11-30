'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ApiService } from '@/lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'parents' | 'audit'>('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingChildren, setPendingChildren] = useState<any[]>([]);
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
        
      try {
        const backendParents = await ApiService.getParents();
        setParents(backendParents || []);
      } catch (err) {
        console.warn('Failed to load parents from API, using mock data', err);
      }

      try {
        const logs = await ApiService.getAuditLogs();
        setAuditLogs(logs || []);

      } catch (err) {
        console.warn('Failed to load parents from Audit Logs', err);
      }
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
      const resp = await ApiService.addParent({ name: newParent.name, password: 'changeme', phoneNumber: newParent.phone });
      if (resp && resp.success) {
        alert('Parent added successfully');
        setNewParent({ name: '', email: '', phone: '' });
        setShowAddParentForm(false);
        await loadData();
      } else {
        alert('Failed to add parent: ' + (resp?.message || 'unknown'));
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
      const resp = await ApiService.deactivateParent(parentId);
      if (resp && resp.success) {
        alert('Parent removed successfully');
        await loadData();
      } else {
        alert('Failed to remove parent: ' + (resp?.message || 'unknown'));
      }
    } catch (error) {
      console.error('Error removing parent:', error);
      alert('Failed to remove parent');
    } finally {
      setLoading(false);
    }
  };

  const recentAuditLogs = auditLogs.slice(0, 5);


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
          <button 
            className="nav-link btn" 
            style={{ color: activeTab==='users' ? '#00e0c6' : '#000' }}
            onClick={() => setActiveTab('users')}
          >
            Authenticate Users
          </button>
        </li>

        <li className="nav-item">
          <button 
            className="nav-link btn"
            style={{ color: activeTab==='parents' ? '#00e0c6' : '#000' }}
            onClick={() => setActiveTab('parents')}
          >
            Manage Parents
          </button>
        </li>

        <li className="nav-item">
          <button 
            className="nav-link btn"
            style={{ color: activeTab==='audit' ? '#00e0c6' : '#000' }}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs
          </button>
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
                    <div key={parent.userId} className="col">
                      <div className="card p-3">
                        <h6 className="fw-bold">{parent.name}</h6>
                        <p className="small mb-1"><strong>Phone:</strong> {parent.phoneNumber || 'N/A'}</p>
                        <p className="small mb-2"><strong>Status:</strong> {parent.status || 'ACTIVE'}</p>
                        <button 
                          className="btn btn-sm btn-outline-danger w-100"
                          onClick={() => handleRemoveParent(parent.userId)}
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

        
          

        {activeTab === 'audit' && (
  <div className="col-12" data-aos="fade-up">
    <h5 className="fw-bold mb-3">Recent Audit Logs</h5>

    {recentAuditLogs.length === 0 && (
      <div className="alert alert-info">No audit logs found</div>
    )}

    {recentAuditLogs.length > 0 && (
      <>
        {recentAuditLogs.map((log: any, index: number) => {

          let parsed = log;
          
          // If backend accidentally sends as string, parse it
          if (typeof log === "string") {
            try {
              parsed = JSON.parse(log);
            } catch {
              return (
                <div key={index} className="card p-3 mb-2">
                  <div className="fw-semibold">{log}</div>
                </div>
              );
            }
          }

          return (
            <div 
              key={parsed.logId || index} 
              className="card p-3 mb-2 shadow-sm"
              style={{ borderLeft: "4px solid #0abdd6" }}
            >
              <div className="fw-bold text-dark">
                {parsed.actionText || "No description available"}
              </div>

              <div className="text-muted small mt-1">
                Admin: <span className="fw-semibold">{parsed.adminUserId || "-"}</span>
              </div>

              <div className="text-muted small">
                {parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : ""}
              </div>
            </div>
          );
        })}

        <Link
          href="/admin/auditlog"
          className="btn btn-outline-secondary btn-sm mt-3 w-100"
        >
          View All Logs
        </Link>
      </>
    )}
  </div>
)}



        </div>
      </div>
    </div>
  );
}
