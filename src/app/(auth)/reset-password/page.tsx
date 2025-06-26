import { Metadata } from "next";
import ResetPassword from "./_components/reset-password"
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password | Trace",
  description: "Reset your Trace account password. Enter your new password.",
  keywords: ["reset password", "password recovery", "account help"],
};

export default async function ForgotPasswowordPage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const token = (await searchParams).token;

  if (!token) {
    return redirect('/sign-in');
  }

	return (
		<>
      <h3 className="text-center text-2xl font-semibold pt-3 pb-6 ">Reset Password</h3>
			<ResetPassword token={token} />
		</>
	);
}