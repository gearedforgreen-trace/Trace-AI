import { ForgetPasswordEmail } from '@/components/email/forget-password-email';
import { render } from '@react-email/render';
export default async function EmailPreviewPage() {
  // Sample data for the email template
  const emailData = {
    resetLink: 'https://gearforgreen.com/reset-password?token=abc123def456',
    userName: 'John Doe',
    expiresIn: '60 minutes',
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="text-center text-foreground">
          <h3>Email Templates</h3>
        </div>
        <div
          className="email-preview"
          dangerouslySetInnerHTML={{
            __html: await render(
              <ForgetPasswordEmail
                resetLink={emailData.resetLink}
                userName={emailData.userName}
                expiresIn={emailData.expiresIn}
              />
            ),
          }}
        />
      </div>
    </div>
  );
}
