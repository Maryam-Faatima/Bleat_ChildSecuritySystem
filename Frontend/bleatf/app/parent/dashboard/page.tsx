'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ChildCard from '@/app/components/ChildCard';
import AlertCard from '@/app/components/AlertCard';
import DeviceStatus from '@/app/components/DeviceStatus';
import { mockChildren, mockAlerts, mockDevices } from '@/app/lib/mockData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ParentDashboard() {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'children' | 'messages' | 'reports' | 'locations' | 'sos'>('children');

  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);

  const handleAcknowledgeAlert = (alertId: number) => {
    setAcknowledgedAlerts([...acknowledgedAlerts, alertId]);
  };

  const unacknowledgedAlerts = mockAlerts.filter(
    (alert) => !acknowledgedAlerts.includes(alert.alertId) && !alert.isAcknowledged
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '1rem',
      }}
    >
      <div className="card shadow rounded-4 w-100" style={{ maxWidth: 1200, borderRadius: 18, padding: '1.5rem' }}>
        
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-3 mb-4">
          <div className="container-fluid">
            <span className="navbar-brand fw-bold">Parent Dashboard</span>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='children'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('children')}>Children</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='messages'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('messages')}>Messages</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='reports'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('reports')}>Reports</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='locations'?'btn-primary text-white':'btn-light'}`} onClick={() => setActiveTab('locations')}>Locations</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link btn ${activeTab==='sos'?'btn-danger text-white':'btn-outline-danger'}`} onClick={() => setActiveTab('sos')}>SOS</button>
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
          {activeTab === 'children' && (
            <>
              {mockChildren.map((child) => (
                <div key={child.childId} className="col-12 col-md-6 col-lg-4" data-aos="fade-up">
                  <ChildCard
                    name={child.name}
                    age={child.age}
                    status={child.status === 'active' ? 'Safe' : 'In Danger'}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === 'messages' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Messages</h5>
              {mockChildren.map((child) => (
                <div key={child.childId} className="card mb-2 p-3">
                  <strong>{child.name}</strong>: You have 2 unread messages
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Reports</h5>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {mockChildren.map((child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3">
                      <strong>{child.name}</strong>
                      <p className="mb-1">Last Report: Weekly Safety</p>
                      <button className="btn btn-sm btn-primary">View Report</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Child Locations</h5>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {mockChildren.map((child) => (
                  <div key={child.childId} className="col">
                    <div className="card p-3">
                      <strong>{child.name}</strong>
                      <p className="mb-1">Last Known Location:</p>
                      <p className="small text-muted">Lat: 24.8607, Lng: 67.0011</p>
                      <button className="btn btn-sm btn-secondary">Track on Map</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="col-12" data-aos="fade-up">
              <h5 className="fw-bold mb-3">Emergency SOS</h5>
              <button className="btn btn-danger btn-lg w-100">Send SOS Alert</button>
            </div>
          )}

          {/* Unacknowledged Alerts Panel (always visible below main content) */}
          <div className="col-12 mt-4" data-aos="fade-up">
            <h5 className="fw-bold mb-3">Recent Alerts</h5>
            {unacknowledgedAlerts.length === 0 && (
              <div className="alert alert-success text-center small mb-0">No unread alerts. All safe!</div>
            )}
            {unacknowledgedAlerts.map((alert) => (
              <div key={alert.alertId} className="mb-2">
                <AlertCard
                  type={alert.type}
                  description={`${alert.childName}: ${alert.description}`}
                  timestamp={new Date(alert.timestamp).toLocaleString()}
                  onAcknowledge={() => handleAcknowledgeAlert(alert.alertId)}
                />
              </div>
            ))}
            <Link href="/parent/alerts" className="btn btn-secondary btn-sm mt-2 w-100">View All Alerts</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
