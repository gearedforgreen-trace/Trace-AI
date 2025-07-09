import { ForgetPasswordEmail } from "@/components/email/forget-password-email";
import { resend } from "./resend";
import { render } from "@react-email/render";
import { transporter } from "./mail";

export async function sendResetPasswordEmail(
  email: string,
  resetPasswordLink: string,
  userName: string,
  expiresIn: string
) {
  try {
    const info = await transporter.sendMail({
      from: `Trace <noreplay@trace.dev>`,
      to: email,
      subject: "Reset your password",
      html: await render(
        <ForgetPasswordEmail
          resetLink={resetPasswordLink}
          userName={userName}
          expiresIn={expiresIn}
        />
      ),
      text: `
        Your reset password link ${ resetPasswordLink}
      `
    });
    return info;
  } catch (error) {
    console.log("Error sending reset password email", error);
  }
}
