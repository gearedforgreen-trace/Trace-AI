import type { MouseEvent } from 'react';

import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';

type AlertType = 'error' | 'info' | 'warning' | 'success';

interface AlertProps {
  type: AlertType;
  message: string;
  title?: string;
  close?: boolean;
  className?: string;
  handleClose?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export default function Alert({
  type,
  message,
  title,
  close = false,
  className,
  handleClose,
}: AlertProps) {
  const alertStyles: Record<
    AlertType,
    { color: string; icon: string; border: string; bg: string }
  > = {
    error: {
      icon: 'mdi:error-outline',
      color: 'text-red-600/90 dark:text-red-400',
      border: 'border-red-100 dark:border-red-500/20',
      bg: 'bg-red-50/50 dark:bg-red-500/10',
    },
    info: {
      icon: 'mdi:information-outline',
      color: 'text-blue-600/90 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-500/20',
      bg: 'bg-blue-50/50 dark:bg-blue-500/10',
    },
    warning: {
      icon: 'mdi:alert-outline',
      color: 'text-yellow-600/90 dark:text-yellow-400',
      border: 'border-yellow-100 dark:border-yellow-500/20',
      bg: 'bg-yellow-50/50 dark:bg-yellow-500/10',
    },
    success: {
      icon: 'mdi:check-circle-outline',
      color: 'text-green-600/90 dark:text-green-400',
      border: 'border-green-100 dark:border-green-500/20',
      bg: 'bg-green-50/50 dark:bg-green-500/10',
    },
  };

  const { color, icon, border, bg } = alertStyles[type];

  return (
    <div
      className={cn(
        'relative my-2 rounded-md border p-3',
        bg,
        color,
        border,
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2">
          <Icon className="size-5" icon={icon} />
          <h3 className="font-medium">{title}</h3>
        </div>
      )}
      {title ? (
        <div className="ml-7 mt-1 text-sm">{message}</div>
      ) : (
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 size-5 shrink-0" icon={icon} />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {close && (
        <button
          className={cn(
            'absolute right-2 top-2 rounded-md p-0.5',
            'transition-transform hover:bg-black/5 active:scale-95',
            'dark:hover:bg-white/5',
            color
          )}
          onClick={handleClose}
        >
          <Icon icon="mdi:close" className="size-4" />
        </button>
      )}
    </div>
  );
}
