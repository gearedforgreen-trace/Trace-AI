import { Icon } from '@iconify/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input, type InputProps } from './input';

export type InputIconProps = {
  icon: string;
} & InputProps;

export function InputIcon({ className, icon, ...props }: InputIconProps) {
  return (
    <div className="relative">
      <div
        className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-md rounded-r-none border border-input  bg-muted text-muted-foreground"
        aria-invalid={props['aria-invalid']}
      >
        <Icon className="size-5" icon={icon} />
      </div>
      <Input className={cn('pl-12', className)} {...props} />
    </div>
  );
}

