import { Metadata } from "next";
import ForgotPasswoword from "./_components/forgot-password";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Forgot Password | Trace",
  description: "Reset your Trace account password. Enter your email to receive password recovery instructions.",
  keywords: ["forgot password", "reset password", "password recovery", "account help"],
};

export default function ForgotPasswowordPage() {
	return (
		<>
			<h3 className="text-center text-2xl font-semibold pt-3 pb-5 ">Forgot Password</h3>
			<Suspense fallback={<></>}>
				<ForgotPasswoword />
			</Suspense>
		</>
	);
}