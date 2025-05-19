import Users from "./_components/users";

export default function UsersPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage users, view their profiles, and modify their roles or status
        </p>
      </div>
      <Users />
    </div>
  );
}