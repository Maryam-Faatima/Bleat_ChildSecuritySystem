'use client';
import Link from 'next/link';
import { useState } from 'react';
import LocationMap from '@/app/components/LocationMap';
import { mockReports, mockChildren, mockDevices } from '@/app/lib/mockData';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [reportType, setReportType] = useState<'location' | 'alert' | 'activity'>('location');
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);

  const handleGenerateReport = () => {
    const newReport = {
      reportId: Date.now(),
      generatedBy: 1,
      generatedOn: new Date().toISOString(),
      type: reportType === 'location' ? 'Location History' : reportType === 'alert' ? 'Alert Summary' : 'Activity Report',
      childId: selectedChild.childId,
      childName: selectedChild.name,
      timeframe: 'Last 7 days',
      locationCount: Math.floor(Math.random() * 20) + 5,
    };
    setSelectedReport(newReport);
  };

  const childDevice = mockDevices.find((d) => d.childId === selectedChild.childId);

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
                    <select className="form-select form-select-sm" value={selectedChild.childId} onChange={(e) => setSelectedChild(mockChildren.find((c) => c.childId === parseInt(e.target.value)) || selectedChild)}>
                      {mockChildren.map((child) => (
                        <option key={child.childId} value={child.childId}>{child.name}</option>
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
                  <button onClick={handleGenerateReport} className="btn btn-primary btn-sm w-100">Generate</button>
                </div>
              </div>

              <div className="card">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Previous Reports</h6>
                  <div className="list-group list-group-flush">
                    {mockReports.slice(0, 3).map((report) => (
                      <button key={report.reportId} onClick={() => setSelectedReport(report)} className="list-group-item list-group-item-action py-2 px-1 small">
                        <div className="fw-semibold">{report.type}</div>
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
                        <button className="btn btn-primary btn-sm flex-grow-1">PDF</button>
                        <button className="btn btn-secondary btn-sm flex-grow-1">CSV</button>
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
