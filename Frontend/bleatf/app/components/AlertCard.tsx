type AlertCardProps = {
  type: string;
  description: string;
  timestamp: string;
  onAcknowledge?: () => void;
};

export default function AlertCard({ type, description, timestamp, onAcknowledge }: AlertCardProps) {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title mb-1 text-danger">{type}</h6>
            <p className="mb-1">{description}</p>
            <p className="text-muted small mb-0">{timestamp}</p>
          </div>
          {onAcknowledge && (
            <div className="ms-3">
              <button onClick={onAcknowledge} className="btn btn-sm btn-outline-danger">Acknowledge</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
