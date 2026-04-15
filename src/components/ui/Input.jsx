import { forwardRef } from 'react';
import { cn } from './Button';

export const Input = forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full relative">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-shadow',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1 absolute -bottom-5 left-0">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
