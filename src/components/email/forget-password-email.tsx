import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface ForgetPasswordEmailProps {
  resetLink: string;
  userName?: string;
  expiresIn?: string;
}

export const ForgetPasswordEmail: React.FC<ForgetPasswordEmailProps> = ({
  resetLink,
  userName = 'there',
  expiresIn = '24 hours'
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Trace password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Container style={headerContent}>
              <Img
                src="https://gear-for-green.vercel.app/imgs/Logo_Wordmark_Center_Color.svg"
                alt="Trace"
                style={logo}
              />
            </Container>
          </Section>

          <Section style={content}>
            <Container style={contentWrapper}>
              <Heading style={greeting}>Hello {userName}!</Heading>
              
              <Text style={message}>
                We received a request to reset your password for your Trace account. 
                If you didn&apos;t make this request, you can safely ignore this email.
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={resetLink}>
                  Reset Password
                </Button>
              </Section>

              <Text style={note}>
                This link will expire in <strong>{expiresIn}</strong>.
              </Text>

              <Hr style={divider} />

              <Text style={fallbackText}>
                If the button doesn&apos;t work, copy this link into your browser:
              </Text>

              <Text style={linkText}>
                {resetLink}
              </Text>
            </Container>
          </Section>

          <Section style={footer}>
            <Container style={footerContent}>
              <Text style={footerText}>
                © 2024 Trace. All rights reserved.
              </Text>
            </Container>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Clean, simple styles following your design system
const main = {
  fontFamily: 'Mulish, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: 1.6,
  color: '#252525',
  backgroundColor: '#f5f5f5',
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  marginBottom: '24px',
};

const headerContent = {
  maxWidth: '560px',
  margin: '32px auto 0 auto',
  textAlign: 'center' as const,
};

const logo = {
  width: '120px',
  height: 'auto',
  margin: '0 auto',
  display: 'block',
};

const content = {
  marginBottom: '24px',
};

const contentWrapper = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0 20px',
};

const greeting = {
  fontFamily: 'Nunito, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const message = {
  fontSize: '16px',
  color: '#4b5563',
  margin: '0 0 24px 0',
  lineHeight: 1.6,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#22c55e',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  textAlign: 'center' as const,
};

const note = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const divider = {
  height: '1px',
  backgroundColor: '#e5e7eb',
  margin: '24px 0',
};

const fallbackText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
};

const linkText = {
  wordBreak: 'break-all' as const,
  fontSize: '12px',
  color: '#9ca3af',
  backgroundColor: '#f3f4f6',
  padding: '12px',
  borderRadius: '4px',
  margin: '8px 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  marginTop: '24px',
};

const footerContent = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '24px 20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
};

export default ForgetPasswordEmail;
