'use client';

type DeviceStatusProps = {
  deviceId: number;
  status: string;
  batteryLevel: number;
  isActive: boolean;
  lastLocation?: { latitude: number; longitude: number; timestamp: string };
};

export default function DeviceStatus({
  deviceId,
  status,
  batteryLevel,
  isActive,
  lastLocation,
}: DeviceStatusProps) {
  const statusColor = status === 'active' ? 'text-green-600' : 'text-red-600';
  const batteryColor =
    batteryLevel > 50 ? 'text-green-600' : batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="card h-100">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <h6 className="card-title mb-2">Device {deviceId}</h6>
          <div className="small text-muted mb-2">
            <div>Status: <span className={`fw-semibold ${status === 'active' ? 'text-success' : 'text-danger'}`}>{status.toUpperCase()}</span></div>
            <div>Battery: <span className={`fw-semibold ${batteryLevel > 50 ? 'text-success' : batteryLevel > 20 ? 'text-warning' : 'text-danger'}`}>{batteryLevel}%</span></div>
            <div>Active: {isActive ? '✓ Yes' : '✗ No'}</div>
          </div>
          {lastLocation && (
            <div className="small text-muted">
              Last Location: {lastLocation.latitude}, {lastLocation.longitude}
              <br />
              {new Date(lastLocation.timestamp).toLocaleString()}
            </div>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style={{ width: 64, height: 64 }}>
          <span className="fw-bold">{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
}
