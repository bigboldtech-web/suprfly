import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400',
            error && 'border-red-400 focus:ring-red-400/20 focus:border-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
