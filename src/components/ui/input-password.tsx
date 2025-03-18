import { Icon } from '@iconify/react';
import * as React from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Input, type InputProps } from './input';
import { InputIcon } from './input-icon';

export type InputPasswordProps = {
  icon?: string;
} & InputProps;

export function InputPassword({ className, icon, ...props }: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const type = !showPassword ? 'password' : 'text';
  return (
      <div className="relative">
        {icon ? (
          <InputIcon
            className={cn('pr-9', className)}
            {...props}
            type={type}
            icon={icon}
          />
        ) : (
          <Input
            className={cn('pr-9', className)}
            {...props}
            type={type}
          />
        )}

        <div
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-md rounded-l-none"
          aria-invalid={props['aria-invalid']}
        >
          <button
            className="mr-1 flex size-full items-center justify-center rounded-l-none text-muted-foreground hover:text-foreground active:scale-90"
            type="button"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {!showPassword ? (
              <Icon
                className={cn('w-5 h-5', className)}
                icon="mdi:eye-outline"
              />
            ) : (
              <Icon
                className={cn('w-5 h-5', className)}
                icon="mdi:eye-off-outline"
              />
            )}
          </button>
        </div>
      </div>
  );
}
