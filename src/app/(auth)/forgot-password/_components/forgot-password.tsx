'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Alert from '@/components/Alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputIcon } from '@/components/ui/input-icon';
import { SiteButton } from '@/components/ui/site-button';
import { authClient } from '@/lib/auth-client';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .email({ message: 'Enter a valid email address' }),
});

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<{
    title: string;
    description: string;
    type: 'error' | 'info' | 'warning' | 'success';
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackUrl') || '/dashboard';

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    shouldFocusError: true,
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setLoading(true);
    setError(null);

    try {
      await authClient.forgetPassword({
        email: values.email,
        redirectTo: `/reset-password?callbackUrl=${encodeURIComponent(
          callbackURL
        )}`,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError({
        title: 'Something went wrong',
        description: err?.message || 'Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to your email.
          </p>
        </div>
        
        <Alert
          title="Email sent"
          message="If you don't see the email, check your spam folder."
          type="success"
        />

        <div className="mt-3 flex flex-col sm:mt-4">
          <SiteButton
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitted(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to reset password
          </SiteButton>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputIcon
                    icon="mdi:email"
                    placeholder="example@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <Alert
            close={true}
            handleClose={() => {
              setError(null);
            }}
            title={error?.title}
            message={error?.description}
            type={error?.type}
          />
        )}

        <div className="flex flex-col ">
          <SiteButton
            type="submit"
            color="gradient"
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Send reset link'}
          </SiteButton>
          
          <div className="mt-3 text-center">
            <Link
              href={`/sign-in`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
