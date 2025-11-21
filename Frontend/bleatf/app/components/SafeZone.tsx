'use client';

type SafeZoneProps = {
  zoneId: number;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  isActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function SafeZone({
  zoneId,
  name,
  centerLatitude,
  centerLongitude,
  radiusMeters,
  isActive,
  onEdit,
  onDelete,
}: SafeZoneProps) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h6 className="mb-0">{name}</h6>
            <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="small text-muted">
            <div>Location: {centerLatitude}, {centerLongitude}</div>
            <div>Radius: {radiusMeters}m</div>
          </div>
        </div>
        <div className="d-flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="btn btn-outline-secondary btn-sm">Edit</button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="btn btn-danger btn-sm">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
