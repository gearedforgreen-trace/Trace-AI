import { Icon } from '@iconify/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input, type InputProps } from './input';
import { InputIcon } from './input-icon';

export type InputSearchProps = {
  icon?: string;
  onClear?: () => void;
} & InputProps;

export function InputSearch({ className, icon, onClear, ...props }: InputSearchProps) {
  const [inputValue, setInputValue] = React.useState(
      props.defaultValue || props.value || ''
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setInputValue('');
      onClear?.();

      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      props.onChange?.(syntheticEvent);
    };

    const hasValue = React.useMemo(() => {
      return inputValue !== undefined && inputValue !== '';
    }, [inputValue]);

    return (
      <div className="relative">
        {icon ? (
          <InputIcon
            className={cn('pr-9', className)}
            {...props}
            value={inputValue}
            onChange={handleChange}
            type="text"
            icon={icon}
          />
        ) : (
          <Input
            className={cn('pl-9 pr-9', className)}
            {...props}
            value={inputValue}
            onChange={handleChange}
            type="text"
          />
        )}

        {/* Search icon on the left */}
        {!icon && (
          <div
            className="absolute left-0 top-0 flex h-full w-10 items-center justify-center"
            aria-hidden="true"
          >
            <Icon className="size-5 text-muted-foreground" icon="mdi:magnify" />
          </div>
        )}

        {/* Clear button on the right */}
        {hasValue && onClear && (
          <div
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-md rounded-l-none"
            aria-invalid={props['aria-invalid']}
          >
            <button
              className="mr-1 flex size-full items-center justify-center rounded-l-none text-muted-foreground hover:text-foreground active:scale-90"
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <Icon className="size-5" icon="mdi:close" />
            </button>
          </div>
        )}
      </div>
  );
}
