'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { mockChildren, mockParent, mockAlerts, mockDevices, mockAuditLogs } from '@/app/lib/mockData';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'parents' | 'children' | 'devices' | 'alerts' | 'audit'>('overview');

  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);

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
                  <button className={`nav-link btn ${activeTab==='parents'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('parents')}>Parents</button>
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
              <h5 className="fw-bold mb-3">Parent Accounts</h5>
              <div className="card p-3 mb-2">
                <strong>{mockParent.name}</strong> | {mockParent.email} | {mockParent.phoneNumber}
              </div>
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
