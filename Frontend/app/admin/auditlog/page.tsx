'use client';
import Link from 'next/link';
import { useState } from 'react';
import AuditLogTable from '@/app/components/AuditLogTable';
import { mockAuditLogs } from '@/app/lib/mockData';

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(mockAuditLogs.map((log) => log.action)));

  // Filter logs
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    const csv = [
      ['Time', 'Action', 'Details', 'Admin ID'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.details,
        log.adminId,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Audit Logs</h1>
            <p className="text-muted small mb-3">System activity and admin actions</p>
            <Link href="/admin/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          {/* Filters */}
          <div className="card w-100 mb-3">
            <div className="card-body p-3">
              <h6 className="card-title mb-2">Filters</h6>
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <select className="form-select form-select-sm" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                    <option value="all">All Actions</option>
                    {uniqueActions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <button onClick={handleExport} className="btn btn-primary btn-sm w-100">
                    📥 Export
                  </button>
                </div>
              </div>
              <p className="small text-muted mb-0">
                Showing <strong>{filteredLogs.length}</strong> of <strong>{mockAuditLogs.length}</strong> logs
              </p>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="w-100 mb-3">
            <AuditLogTable logs={filteredLogs} />
          </div>

          {/* Summary Stats */}
          <div className="row row-cols-2 row-cols-md-4 g-2 w-100">
            <div className="col">
              <div className="card text-center p-2 h-100">
                <div className="fs-5 fw-bold" style={{ color: 'var(--color-primary)' }}>
                  {mockAuditLogs.filter((l) => l.action.includes('login')).length}
                </div>
                <div className="small text-muted">Logins</div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center p-2 h-100">
                <div className="fs-5 fw-bold" style={{ color: 'var(--color-secondary)' }}>
                  {mockAuditLogs.filter((l) => l.action.includes('created')).length}
                </div>
                <div className="small text-muted">Created</div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center p-2 h-100">
                <div className="fs-5 fw-bold" style={{ color: 'var(--color-primary)' }}>
                  {mockAuditLogs.filter((l) => l.action.includes('device')).length}
                </div>
                <div className="small text-muted">Device Changes</div>
              </div>
            </div>
            <div className="col">
              <div className="card text-center p-2 h-100">
                <div className="fs-5 fw-bold" style={{ color: 'var(--color-secondary)' }}>
                  {mockAuditLogs.filter((l) => l.action.includes('SOS')).length}
                </div>
                <div className="small text-muted">SOS Events</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
