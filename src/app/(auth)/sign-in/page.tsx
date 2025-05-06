// import Link from 'next/link';

import SignInForm from './_components/sign-in-form';
// import OAuthButton from '../_components/oauth-button';
export default function SignInPage() {

  return (
    <>
      <h3 className="text-center text-2xl font-semibold pt-5 pb-10 ">Welcome back</h3>
      {/* <p className="mb-2 mt-4 text-center text-sm text-muted-foreground">
        Login with your Google or Github account
      </p> */}

      {/* <div className="mt-2 grid grid-cols-2 gap-6">
        <OAuthButton type="google" label={false} />
        <OAuthButton type="github" label={false} />
      </div> */}

      {/* <div className="mb-2 mt-4 flex items-center justify-between gap-2.5">
        <div className="h-px w-1/2 bg-border" />
        <div className="shrink-0 text-xs text-muted-foreground">
          OR CONTINUE WITH
        </div>
        <div className="h-px w-1/2 bg-border" />
      </div> */}

      <SignInForm />

      {/* <div className="mt-4 text-center text-muted-foreground">
        {`Don't`} have an account?{' '}
        <Link
          className="font-semibold underline hover:text-foreground"
          href="/sign-up"
        >
          {' '}
          Sign up
        </Link>
      </div> */}
    </>
  );
}
