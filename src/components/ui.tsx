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
          'bg-[#f2644b] text-white shadow-sm shadow-[#f2644b]/25 hover:bg-[#df563f]',
        variant === 'secondary' &&
          'border border-[#e4e9ef] bg-white text-[#334155] shadow-sm shadow-slate-950/[0.04] hover:border-[#f7b4a8] hover:bg-[#fff7f4] hover:text-[#c94d38]',
        variant === 'danger' &&
          'border border-[#f7b4a8] bg-white text-[#c94d38] hover:bg-[#fff1ee]',
        variant === 'ghost' && 'text-[#64748b] hover:bg-[#fff1ee] hover:text-[#c94d38]',
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
      <span className="text-sm font-medium text-[#334155]">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm text-[#c94d38]">{error}</p> : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-[#e4e9ef] bg-white px-3 py-2.5 text-sm text-[#172033] shadow-sm shadow-slate-950/[0.03] outline-none transition placeholder:text-[#94a3b8] focus:border-[#f2644b] focus:ring-4 focus:ring-[#f2644b]/15';

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
        tone === 'neutral' && 'bg-[#f4f7fb] text-[#475569]',
        tone === 'green' && 'bg-[#edf9f3] text-[#17835b]',
        tone === 'amber' && 'bg-[#fff5df] text-[#a86707]',
        tone === 'blue' && 'bg-[#eff6ff] text-[#2f6fad]',
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
        'rounded-lg border border-[#e4e9ef] bg-white shadow-sm shadow-slate-950/[0.06]',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-[#e4e9ef]', className)} />;
}
