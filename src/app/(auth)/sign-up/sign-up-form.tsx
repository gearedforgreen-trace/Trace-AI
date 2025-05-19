'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputPassword } from '@/components/ui/input-password';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputIcon } from '@/components/ui/input-icon';
import { passwordRegex } from "@/lib/password";
import { authClient } from '@/lib/auth-client';


const SignupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(70, { message: 'Name cannot exceed 70 characters' })
    .regex(/^[A-Za-z]+([ '-][A-Za-z]+)*$/, {
      message:
        'Name can only contain letters, spaces, hyphens, or apostrophes and must not start or end with special characters.',
    })
    .trim(),
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .max(250, { message: 'Email cannot exceed 250 characters' })
    .email({ message: 'Enter a valid email address' })
    .trim(),
  password: z
    .string()
    .min(1, {
      message: 'Password is required',
    })
    .max(30, {
      message: 'Password cannot exceed 30 characters',
    })
    .refine(
      (value) => passwordRegex.test(value),
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    ),
});

export default function SingupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    shouldFocusError: true,
  });

  async function onSubmit(values: z.infer<typeof SignupSchema>) {
    try {
      setIsLoading(true);
      
      const response = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (response.error) {
        toast.error(response.error.message ?? 'Failed to create account');
        return;
      }

      toast.success('Account created successfully!');
      router.push('/sign-in');
    } catch (error) {
      toast.error('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <InputIcon
                    icon="mdi:rename"
                    placeholder="John Doe"
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
        <div className="mt-5 flex flex-col sm:mt-4">
          <Button type="submit" color="gradient" size="sm" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Signup'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
