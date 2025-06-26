'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React from 'react';

import Alert from '@/components/Alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputPassword } from '@/components/ui/input-password';
import { SiteButton } from '@/components/ui/site-button';
import { authClient } from '@/lib/auth-client';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters',
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  confirmPassword: z.string().min(1, {
    message: 'Please confirm your password',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword({ token }: { token: string }) {
  const [error, setError] = useState<{
    title: string;
    description: string;
    type: 'error' | 'info' | 'warning' | 'success';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    shouldFocusError: true,
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setLoading(true);
    setError(null);

    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      router.push('/sign-in');
      return;
    }

    try {
      const res = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (res.error) {
        setError({
          title: 'Reset failed',
          description: res.error.message || 'Failed to reset password. Please try again.',
          type: 'error',
        });
        toast.error(res.error.message || 'Failed to reset password. Please try again.');
      } else {
        toast.success('Password reset successfully', {
          description: 'You can now log in with your new password.',
        });
        router.push('/sign-in');
      }
    } catch (err: any) {
      setError({
        title: 'Something went wrong',
        description: err?.message || 'Failed to reset password. Please try again.',
        type: 'error',
      });
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  if (!token) {
    return null;
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <InputPassword
                    icon="mdi:lock"
                    placeholder="•••••••••••••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <InputPassword
                    icon="mdi:lock-check"
                    placeholder="•••••••••••••••••••"
                    autoComplete="new-password"
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

        <div className="flex flex-col">
          <SiteButton
            type="submit"
            color="gradient"
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Reset password'}
          </SiteButton>
        </div>
      </form>
    </Form>
  );
}
