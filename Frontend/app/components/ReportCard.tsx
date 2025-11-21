type ReportCardProps = {
  title: string;
  generatedOn: string;
  type: string;
};

export default function ReportCard({ title, generatedOn, type }: ReportCardProps) {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <p className="mb-1">Type: {type}</p>
        <p className="small text-muted mb-0">Generated: {generatedOn}</p>
      </div>
    </div>
  );
}
