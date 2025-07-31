'use client';

import { ModeToggle } from './mode-toggle';
import SiteBrandCentered from './site-brand-centerd';
import { Button } from './ui/button';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LogOutIcon, Smartphone, Apple, Play } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useEffect, useRef, useState } from 'react';

export default function UnauthorizedDashboard({
  showLogout = true,
  binId,
}: {
  showLogout?: boolean;
  binId?: string;
}) {
  const router = useRouter();
  const [checkingApp, setCheckingApp] = useState(true);
  const [appOpened, setAppOpened] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedRedirect = useRef(false);

  const handleSignOut = async () => {
    toast.promise(authClient.signOut(), {
      loading: 'Signing out...',
      success: () => {
        router.push('/sign-in');
        return 'Signed out successfully';
      },
      error: (error) => {
        console.log(error);
        return 'Failed to sign out, please try again';
      },
    });
  };

  useEffect(() => {
    const deeplinkUrl = `gearforgreen://recycle/recycleScreen?binId=${binId}`;

    if (hasAttemptedRedirect.current) return;
    hasAttemptedRedirect.current = true;

    let userLeftPage = false;
    let redirectAttempted = false;

    const handleVisibilityChange = () => {
      if (document.hidden && !userLeftPage) {
        userLeftPage = true;
        setAppOpened(true);
        setCheckingApp(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    const handlePageBlur = () => {
      if (!userLeftPage) {
        userLeftPage = true;
        setAppOpened(true);
        setCheckingApp(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    const attemptDeepLinkRedirect = () => {
      if (redirectAttempted) return;
      redirectAttempted = true;

      try {
        window.location.href = deeplinkUrl;
      } catch (error) {
        console.error('Failed to redirect to app:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePageBlur);
    window.addEventListener('focus', () => {
      setTimeout(() => {
        if (!userLeftPage && !redirectAttempted) {
          attemptDeepLinkRedirect();
        }
      }, 100);
    });

    attemptDeepLinkRedirect();

    timeoutRef.current = setTimeout(() => {
      if (!userLeftPage) {
        setCheckingApp(false);
        setShowDownload(true);
      }
    }, 1200);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageBlur);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const Loader = () => (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-background dark:to-muted">
      <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed">
        <div className="mt-6 pr-4">
          <ModeToggle />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-pulse">
              <Smartphone className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-xl font-semibold text-green-700 dark:text-green-300">
              Opening Trace App...
            </div>
            <div className="text-sm text-muted-foreground max-w-xs">
              If the app doesn&apos;t open automatically, please allow your
              browser to open the Trace mobile app.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (appOpened) {
    return (
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-background dark:to-muted">
        <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed">
          <div className="mt-6 pr-4">
            <ModeToggle />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Smartphone className="h-16 w-16 text-green-600 dark:text-green-400" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                App Opened Successfully!
              </div>
              <div className="text-md text-muted-foreground">
                You can continue using the Trace mobile app.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkingApp) {
    return <Loader />;
  }

  if (showDownload) {
    return (
      <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-background dark:to-muted">
        <div className="absolute right-0 flex h-[60px] w-full items-center justify-end sm:fixed">
          <div className="mt-6 pr-4">
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-8 sm:items-center sm:p-8">
          <a href="#" className="flex justify-center">
            <SiteBrandCentered />
          </a>
          <div className="w-full max-w-md">
            <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader className="text-center ">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Smartphone className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">
                  Use Trace App Instead
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Download and use the Trace mobile app for recycling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 dark:bg-muted/80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        1
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Scan QR codes on recycling bins
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 dark:bg-muted/80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        2
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Earn points for recycling
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/80 p-3 dark:bg-muted/80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        3
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Redeem rewards and coupons
                    </span>
                  </div>
                </div>

                <div className="space-y-4 ">
                  {/* Futuristic Download Section */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-[1px] shadow-lg">
                    <div className="relative rounded-xl bg-card p-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          Download Trace App
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Available on all platforms
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* App Store Button */}
                        <Button
                          className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 group h-auto py-2 px-3"
                          onClick={() =>
                            window.open(
                              'https://apps.apple.com/us/app/gear-for-green/id6637931022',
                              '_blank'
                            )
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Apple className="h-5 w-5 text-white" />
                            <div className="text-left">
                              <div className="text-xs opacity-90">
                                Download on the
                              </div>
                              <div className="text-sm font-semibold">
                                App Store
                              </div>
                            </div>
                          </div>
                        </Button>

                        {/* Play Store Button */}
                        <Button
                          className="relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 group h-auto py-2 px-3"
                          onClick={() =>
                            window.open(
                              'https://play.google.com/store/apps/details?id=com.gearforgreen.mobile',
                              '_blank'
                            )
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Play className="h-5 w-5 text-white" />
                            <div className="text-left">
                              <div className="text-xs opacity-90">
                                Get it on
                              </div>
                              <div className="text-sm font-semibold">
                                Google Play
                              </div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {showLogout && (
              <div className="flex justify-center pt-4">
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
