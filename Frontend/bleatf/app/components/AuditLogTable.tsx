'use client';

type AuditLogTableProps = {
  logs: Array<{
    logId: number;
    adminId: number;
    action: string;
    details: string;
    timestamp: string;
  }>;
};

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Audit Log</h3>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Details</th>
              <th>Admin ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.logId}>
                <td className="text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="font-semibold">{log.action}</td>
                <td className="text-sm text-gray-600">{log.details}</td>
                <td className="text-sm">{log.adminId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
