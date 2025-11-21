type ChildCardProps = {
  name: string;
  age: number;
  status: string;
  onViewDetails?: () => void;
};

export default function ChildCard({ name, age, status, onViewDetails }: ChildCardProps) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="card-title">{name}</h6>
          <p className="mb-1">Age: {age}</p>
          <p className="mb-0">Status: <span className={status === 'Safe' ? 'text-success' : 'text-danger'}>{status}</span></p>
        </div>
        <div className="mt-3">
          <button onClick={onViewDetails} className="btn btn-outline-primary btn-sm">View Details</button>
        </div>
      </div>
    </div>
  );
}
