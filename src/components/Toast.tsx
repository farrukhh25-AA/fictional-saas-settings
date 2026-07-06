import { CheckCircle2, X } from 'lucide-react';

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-xl shadow-stone-950/10">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
