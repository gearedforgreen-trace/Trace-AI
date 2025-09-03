'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

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

import { InputPassword } from '@/components/ui/input-password';
import { SiteButton } from '@/components/ui/site-button';
import { authClient } from '@/lib/auth-client';
const loginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

export default function SignInForm() {
  const [error, setError] = useState<{
    title: string;
    description: string;
    type: 'error' | 'info' | 'warning' | 'success';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    shouldFocusError: true,
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    setLoading(true);

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
      callbackURL: '/',
    });

    setLoading(false);

    if (error) {
      setError({
        title: error.statusText ?? 'Something went wrong',
        description: error.message ?? 'Please try again.',
        type: 'error',
      });
      return;
    }

    // Better Auth should handle the redirect automatically
    // If for some reason it doesn't, we can add manual redirect here
    if (data) {
      // Force a hard refresh to ensure session is properly set
      window.location.href = '/';
    }
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

        <div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputPassword
                    icon="mdi:lock"
                    placeholder="•••••••••••••••••••"
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

        <div className="mt-3 flex flex-col sm:mt-4">
          <SiteButton
            type="submit"
            color="gradient"
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Login'}
          </SiteButton>
          
          <div className="mt-3 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
