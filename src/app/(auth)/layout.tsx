import { ModeToggle } from '@/components/mode-toggle';
import SiteBrandCentered from '@/components/site-brand-centerd';
import { getSession } from '@/lib/servers/sessions';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already authenticated
  const session = await getSession();
  
  if (session) {
    redirect('/');
  }
  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-50 dark:bg-background">
      <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed">
        <div className="mt-6 pr-4">
          <ModeToggle />
        </div>
      </div>
      <div className="mt-16 flex flex-1 flex-col justify-center gap-6 sm:items-center sm:p-8">
        <a href="#" className="flex justify-center">
          <SiteBrandCentered />
        </a>
        <div className="flex flex-1 flex-col gap-5  max-sm:justify-between sm:max-w-[400px]">
          <div className="overflow-x-hidden rounded-xl px-6 pb-10 dark:border-border sm:border sm:bg-card sm:pt-6 sm:shadow-sm dark:sm:bg-muted/15">
            {children}
          </div>

          <div className="px-5 pb-10 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <a className="underline hover:text-foreground" href="/terms">
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              className="underline hover:text-foreground"
              href="/privacy-policy"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
