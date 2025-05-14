import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
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
      className: "bg-gray-500 text-white",
    },
  },
}: StatusBadgeProps) {
  const statusConfig = statusMap[status] || {
    label: status,
    variant: "outline",
  };

  return (
    <Badge variant={statusConfig.variant} className={statusConfig.className}>
      {statusConfig.label}
    </Badge>
  );
}
