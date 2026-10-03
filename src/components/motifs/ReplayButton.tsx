import { RotateCcwIcon } from "lucide-react";

/** Tlačítko „Přehrát znovu“ u jednorázových ukázek. Vzhled jako ovládání workflow. */
export function ReplayButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2 rounded-sm border border-field-border bg-sheet px-3 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
    >
      <RotateCcwIcon aria-hidden="true" strokeWidth={1.75} className="size-4" />
      {children}
    </button>
  );
}
