import UnauthorizedDashboard from "@/components/UnauthorizedDashboard";

type BinPageProps = {
  params: {
    id: string;
  };
};

export default function BinPage({ params }: BinPageProps) {
  return <UnauthorizedDashboard binId={params.id} showLogout={false} />;
}
