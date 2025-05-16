import { Badge } from "@/components/ui/badge";

interface IStatusBadgeProps {
  status: string;
  statusMap?: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
  >;
}

export function StatusBadge({
  status,
  statusMap = {
    active: {
      label: "Active",
      variant: "default",
      className: "bg-green-500",
    },
    inactive: {
      label: "Inactive",
      variant: "secondary",
      className: "bg-gray-500",
    },
  },
}: IStatusBadgeProps) {
  // Convert status to lowercase for consistent mapping
  const normalizedStatus = status?.toLowerCase() || "inactive";

  const statusConfig = statusMap[normalizedStatus] || {
    label: status || "Unknown",
    variant: "outline",
  };

  return (
    <Badge variant={statusConfig.variant} className={statusConfig.className}>
      {statusConfig.label}
    </Badge>
  );
}
