'use client';

type EmergencyContactProps = {
  contactId: number;
  name: string;
  phone: string;
  relation: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function EmergencyContact({
  contactId,
  name,
  phone,
  relation,
  onEdit,
  onDelete,
}: EmergencyContactProps) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <h6 className="card-title mb-1">{name}</h6>
          <div className="small text-muted">{relation}</div>
          <div className="small mt-2">{phone}</div>
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
