"use client";
import { useRouter } from "next/navigation";

type ChildCardProps = {
  childId: number;
  name: string;
  age: number;
  status: string;
};

export default function ChildCard({ childId, name, age, status }: ChildCardProps) {
  const router = useRouter();

  const openDetails = () => {
    router.push(`/parent/children?childId=${childId}`);
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="card-title">{name}</h6>
          <p className="mb-1">Age: {age}</p>
          <p className="mb-0">
            Status:
            <span className={status === "Safe" ? "text-success" : "text-danger"}>
              {status}
            </span>
          </p>
        </div>
        <div className="mt-3">
          <button onClick={openDetails} className="btn btn-outline-primary btn-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
