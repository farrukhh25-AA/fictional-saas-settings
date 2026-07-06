import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55',
        variant === 'primary' &&
          'bg-stone-950 text-white shadow-sm shadow-stone-950/10 hover:bg-stone-800',
        variant === 'secondary' &&
          'border border-stone-200 bg-white text-stone-800 hover:bg-stone-50',
        variant === 'danger' &&
          'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50',
        variant === 'ghost' && 'text-stone-600 hover:bg-stone-100 hover:text-stone-950',
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200/70';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'blue';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'neutral' && 'bg-stone-100 text-stone-700',
        tone === 'green' && 'bg-emerald-50 text-emerald-700',
        tone === 'amber' && 'bg-amber-50 text-amber-700',
        tone === 'blue' && 'bg-sky-50 text-sky-700',
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-stone-200 bg-white shadow-sm shadow-stone-950/[0.03]',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-stone-200', className)} />;
}
