import { CheckCircle2, X } from 'lucide-react';

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-lg border border-[#e4e9ef] bg-white px-4 py-3 text-sm text-[#334155] shadow-xl shadow-slate-950/10">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f2644b]" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-1 text-[#64748b] transition hover:bg-[#fff1ee] hover:text-[#c94d38]"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
