import { ForgetPasswordEmail } from '@/components/email/forget-password-email';
import { resend } from './resend';

export async function sendResetPasswordEmail(
  email: string,
  resetPasswordLink: string,
  userName: string,
  expiresIn: string
) {
  try {
    const res = await resend.emails.send({
      from: `Trace <onboarding@resend.dev>`,
      to: email,
      subject: 'Reset your password',
      react: (
        <ForgetPasswordEmail
          resetLink={resetPasswordLink}
          userName={userName}
          expiresIn={expiresIn}
        />
      ),
    });
    return res;
  } catch (error) {
    console.log('Error sending reset password email', error);
  }
}
