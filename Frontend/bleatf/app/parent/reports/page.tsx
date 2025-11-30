'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LocationMap from '@/app/components/LocationMap';
import { mockDevices } from '@/app/lib/mockData';
import AuthenticationManager from '@/app/lib/AuthenticationManager';
import { ApiService, GenerateReportRequest, ReportDto } from '@/lib/api';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [reportType, setReportType] = useState<'location' | 'alert' | 'activity'>('location');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [reports, setReports] = useState<ReportDto[]>([]);

  const loadChildrenAndReports = async () => {
    try {
      const user = AuthenticationManager.getLoggedInUser();
      const parentId = user ? (user.role === 'parent' ? user.userId : user.parentId) : 1;
      const ch = await ApiService.getChildren(parentId);
      setChildren(ch || []);
      if (!selectedChild && ch && ch.length > 0) setSelectedChild(ch[0]);
      const rlist = await ApiService.listReports(parentId);
      setReports(rlist || []);
    } catch (err) {
      console.warn('Failed to load children/reports', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!selectedChild || !(selectedChild?.childId ?? selectedChild?.id)) {
        alert('Please select a child before generating a report');
        return;
      }
      const user = AuthenticationManager.getLoggedInUser();
      const parentId = user ? (user.role === 'parent' ? user.userId : user.parentId) : 1;
      const payload: GenerateReportRequest = { reportType: reportType };
      const resp = await ApiService.generateReport(parentId, payload);
      if (resp && resp.success) {
        // fetch fresh list and select the newly created report (do not rely on stale state)
        const fresh = await ApiService.listReports(parentId);
        setReports(fresh || []);
        const created = (fresh || []).find(r => r.reportId === resp.reportId) || null;
        if (created) {
          // attempt to fetch the report content immediately so View/Download work without an extra click
          try {
            const full = await ApiService.downloadReport(parentId, created.reportId);
            if (full) created.data = full.data ?? full.data; // ensure data prop exists
          } catch (e) {
            // ignore; content may be available later
          }
          setSelectedReport(created);
        }
      } else {
        alert('Failed to generate report: ' + (resp?.message || 'unknown'));
      }
    } catch (err) {
      console.error('Generate report failed', err);
      alert('Failed to generate report');
    }
  };

  const childDevice = mockDevices.find((d) => d.childId === (selectedChild?.childId ?? selectedChild?.id));

  useEffect(() => {
    loadChildrenAndReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Reports</h1>
            <p className="text-muted small mb-3">Generate and view activity reports</p>
            <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          <div className="row g-2 w-100">
            {/* Report Generator */}
            <div className="col-12 col-md-4">
              <div className="card mb-2">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Generate Report</h6>
                  <div className="mb-2">
                    <label className="form-label small">Select Child</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedChild?.childId ?? selectedChild?.id ?? ''}
                      onChange={(e) => {
                        const id = parseInt(e.target.value || '0');
                        const found = children.find((c: any) => (c.childId ?? c.id) === id);
                        if (found) setSelectedChild(found);
                      }}
                    >
                      <option value="">-- select --</option>
                      {children.map((child) => (
                        <option key={(child.childId ?? child.id)} value={child.childId ?? child.id}>{child.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Type</label>
                    <div className="form-check small">
                      <input className="form-check-input" type="radio" name="reportType" id="r-location" checked={reportType === 'location'} onChange={() => setReportType('location')} />
                      <label className="form-check-label" htmlFor="r-location">Location History</label>
                    </div>
                    <div className="form-check small">
                      <input className="form-check-input" type="radio" name="reportType" id="r-alert" checked={reportType === 'alert'} onChange={() => setReportType('alert')} />
                      <label className="form-check-label" htmlFor="r-alert">Alert Summary</label>
                    </div>
                    <div className="form-check small">
                      <input className="form-check-input" type="radio" name="reportType" id="r-activity" checked={reportType === 'activity'} onChange={() => setReportType('activity')} />
                      <label className="form-check-label" htmlFor="r-activity">Activity Report</label>
                    </div>
                  </div>
                  <button onClick={handleGenerateReport} className="btn btn-primary btn-sm w-100" disabled={!selectedChild?.childId && !selectedChild?.id}>Generate</button>
                </div>
              </div>

              <div className="card">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Previous Reports</h6>
                  <div className="list-group list-group-flush">
                    {reports.slice(0, 10).map((report) => (
                      <button key={report.reportId} onClick={() => setSelectedReport(report)} className="list-group-item list-group-item-action py-2 px-1 small">
                        <div className="fw-semibold">{report.reportType || 'Report'}</div>
                        <div className="text-muted small">{new Date(report.generatedOn).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Display */}
            <div className="col-12 col-md-8">
              {selectedReport ? (
                <div>
                  <div className="card mb-2">
                    <div className="card-body p-3">
                      <h6 className="card-title mb-2">{selectedReport.type}</h6>
                      <div className="row mb-2">
                        <div className="col-6 small">
                          <div className="text-muted">Child</div>
                          <div className="fw-semibold">{selectedReport.childName}</div>
                        </div>
                        <div className="col-6 small">
                          <div className="text-muted">Generated</div>
                          <div className="fw-semibold">{new Date(selectedReport.generatedOn).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-primary btn-sm flex-grow-1" onClick={async () => {
                          try {
                            if (!selectedReport) return;
                            // Use cached data if available
                            if (selectedReport.data) {
                              const w = window.open();
                              if (w) w.document.write('<pre>' + selectedReport.data.replace(/</g,'&lt;') + '</pre>');
                              return;
                            }
                            const user = AuthenticationManager.getLoggedInUser();
                            const parentId = user ? (user.role === 'parent' ? user.userId : user.parentId) : 1;
                            const r = await ApiService.downloadReport(parentId, selectedReport.reportId);
                            if (r && r.data) {
                              // cache locally
                              selectedReport.data = r.data;
                              setSelectedReport({ ...selectedReport });
                              const w = window.open();
                              if (w) w.document.write('<pre>' + r.data.replace(/</g,'&lt;') + '</pre>');
                            } else alert('No report data');
                          } catch (err) { console.error(err); alert('Download failed'); }
                        }}>View</button>
                        <button className="btn btn-secondary btn-sm flex-grow-1" onClick={async () => {
                          try {
                            if (!selectedReport) return;
                            // Use cached data if available
                            let data = selectedReport.data;
                            if (!data) {
                              const user = AuthenticationManager.getLoggedInUser();
                              const parentId = user ? (user.role === 'parent' ? user.userId : user.parentId) : 1;
                              const r = await ApiService.downloadReport(parentId, selectedReport.reportId);
                              data = r?.data ?? null;
                              if (data) {
                                selectedReport.data = data;
                                setSelectedReport({ ...selectedReport });
                              }
                            }
                            if (data) {
                              const blob = new Blob([data], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `report_${selectedReport.reportId}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            } else alert('No report data');
                          } catch (err) { console.error(err); alert('Download failed'); }
                        }}>Download</button>
                      </div>
                    </div>
                  </div>

                  {reportType === 'location' && childDevice && (
                    <>
                      <LocationMap latitude={childDevice.location.latitude} longitude={childDevice.location.longitude} title="Current Location" />
                      <div className="card mt-2">
                        <div className="card-body p-3">
                          <h6 className="card-title mb-2">Location History</h6>
                          <div className="list-group list-group-flush">
                            {childDevice.locations.slice(0, 3).map((loc, idx) => (
                              <div key={idx} className="list-group-item py-2 px-0">
                                <div className="small font-monospace">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</div>
                                <div className="small text-muted">{new Date(loc.timestamp).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {reportType === 'alert' && (
                    <div className="card">
                      <div className="card-body p-3">
                        <h6 className="card-title mb-2">Alert Summary</h6>
                        <div className="small mb-2"><span className="fw-semibold">{selectedReport.locationCount || 0}</span> alerts in last 7 days</div>
                        <div className="list-group list-group-flush">
                          <div className="list-group-item d-flex justify-content-between py-2 px-0 small">
                            <div>SafeZone Violations</div>
                            <div className="fw-semibold">3</div>
                          </div>
                          <div className="list-group-item d-flex justify-content-between py-2 px-0 small">
                            <div>Battery Low</div>
                            <div className="fw-semibold">2</div>
                          </div>
                          <div className="list-group-item d-flex justify-content-between py-2 px-0 small">
                            <div>Device Offline</div>
                            <div className="fw-semibold">0</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {reportType === 'activity' && (
                    <div className="card">
                      <div className="card-body p-3">
                        <h6 className="card-title mb-2">Activity Report</h6>
                        <div className="small mb-2 p-2 bg-light rounded">
                          <div className="fw-semibold">Device Status: Active</div>
                          <div className="text-muted">Online 98% of last 7 days</div>
                        </div>
                        <div className="small mb-2 p-2 bg-light rounded">
                          <div className="fw-semibold">Location Pings: 156</div>
                          <div className="text-muted">Average 22 per day</div>
                        </div>
                        <div className="small p-2 bg-light rounded">
                          <div className="fw-semibold">Messages Sent: 12</div>
                          <div className="text-muted">From parent to child</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card text-center">
                  <div className="card-body">
                    <p className="text-muted small mb-0">Select or generate a report to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
