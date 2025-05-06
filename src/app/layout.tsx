import type { Metadata } from 'next';
import { Nunito, Mulish } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from '@/providers/theme-provider';
import ProgressLoader from '@/providers/progress-loader';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'latin-ext', 'vietnamese', 'cyrillic', 'cyrillic-ext'],
  fallback: ['system-ui', 'arial', 'sans-serif'],
  weight: ['400', '500', '600', '700', '800', '900', '1000'],
});

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin', 'latin-ext', 'vietnamese', 'cyrillic', 'cyrillic-ext'],
  fallback: ['system-ui', 'helvetica', 'sans-serif'],
  weight: ['400', '500', '600', '700', '800', '900', '1000'],
});

export const metadata: Metadata = {
  title: 'TRACE',
  description:
    'Trace is a platform for tracking the carbon footprint of products and services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${mulish.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressLoader>
            {children}
          </ProgressLoader>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
