type MessageCardProps = {
  sender: string;
  content: string;
  timestamp: string;
};

export default function MessageCard({ sender, content, timestamp }: MessageCardProps) {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <p className="fw-semibold mb-1">{sender}</p>
        <p className="mb-1">{content}</p>
        <p className="text-muted small mb-0">{timestamp}</p>
      </div>
    </div>
  );
}
