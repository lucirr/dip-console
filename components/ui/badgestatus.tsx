import { Badge } from "@/components/ui/badge";

type Status = "install" | "deployed" | "healthy" | "error";

const statusVariants: Record<Status, "default" | "secondary" | "outline" | "destructive"> = {
  install: "outline",
  deployed: "default",
  healthy: "default",
  error: "destructive",
};

const statusLabels: Record<Status, string> = {
  install: "대기",
  deployed: "정상",
  healthy: "정상",
  error: "오류",
};

function StatusBadge({ status }: { status?: Status }) {
  if (!status) return null;
  
  return (
    <Badge variant={statusVariants[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

export { StatusBadge };
export type { Status };