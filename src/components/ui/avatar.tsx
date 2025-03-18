import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn, getNameInitials } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
  // Color pairs mapped to letters (A-Z) with more distinct combinations
  const letterColorMap: Record<string, [string, string]> = {
    A: ['bg-red-200', 'text-red-900'],
    B: ['bg-blue-200', 'text-blue-900'],
    C: ['bg-green-200', 'text-green-900'],
    D: ['bg-yellow-200', 'text-yellow-900'],
    E: ['bg-purple-200', 'text-purple-900'],
    F: ['bg-pink-200', 'text-pink-900'],
    G: ['bg-indigo-200', 'text-indigo-900'],
    H: ['bg-gray-200', 'text-gray-900'],
    I: ['bg-teal-200', 'text-teal-900'],
    J: ['bg-orange-200', 'text-orange-900'],
    K: ['bg-cyan-200', 'text-cyan-900'],
    L: ['bg-lime-200', 'text-lime-900'],
    M: ['bg-emerald-200', 'text-emerald-900'],
    N: ['bg-sky-200', 'text-sky-900'],
    O: ['bg-violet-200', 'text-violet-900'],
    P: ['bg-fuchsia-200', 'text-fuchsia-900'],
    Q: ['bg-rose-200', 'text-rose-900'],
    R: ['bg-amber-200', 'text-amber-900'],
    S: ['bg-slate-200', 'text-slate-900'],
    T: ['bg-zinc-200', 'text-zinc-900'],
    U: ['bg-blue-300', 'text-blue-900'],
    V: ['bg-green-300', 'text-green-900'],
    W: ['bg-red-300', 'text-red-900'],
    X: ['bg-purple-300', 'text-purple-900'],
    Y: ['bg-yellow-300', 'text-yellow-900'],
    Z: ['bg-pink-300', 'text-pink-900'],
  };

  // Get the first letter and convert to uppercase
  const firstLetter = (props.children?.toString()?.[0] || 'A').toUpperCase();
  const [bg, text] = letterColorMap[firstLetter] || letterColorMap['A'];
  const children = getNameInitials(props.children?.toString() ?? '', ) ?? '';

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full font-semibold',
        bg,
        text,
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
