'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
          checked ? 'bg-cyan-500' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-slate-700">{label}</div>}
          {description && <div className="text-xs text-slate-500">{description}</div>}
        </div>
      )}
    </label>
  );
}
