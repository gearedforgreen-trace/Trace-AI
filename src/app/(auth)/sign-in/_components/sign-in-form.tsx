'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { SiteButton } from "@/components/ui/site-button";
import { useRouter } from 'next/navigation';
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
  const [invalidCred, setInvalidCred] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter()

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

    router.push('/')
    setLoading(false);
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
        {invalidCred && (
          <Alert
            close={true}
            handleClose={() => {
              setInvalidCred(null);
            }}
            title="Invalid credentials"
            message={invalidCred}
            type="error"
          />
        )}

        <div className="mt-3 flex flex-col sm:mt-4">
          <SiteButton type="submit" color="gradient" size="sm" disabled={loading}>
            Login
          </SiteButton>
        </div>
      </form>
    </Form>
  );
}
