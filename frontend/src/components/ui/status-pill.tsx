import { cn } from "@/lib/cn";
import { TONE_CLASSES, type RailTone } from "@/lib/status-config";

export function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: RailTone;
  className?: string;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        t.bg,
        t.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {label}
    </span>
  );
}

/** Thin colored left border used on table rows / cards to encode lifecycle status. */
export function StatusRail({
  tone,
  className,
  children,
}: {
  tone: RailTone;
  className?: string;
  children: React.ReactNode;
}) {
  const t = TONE_CLASSES[tone];
  return <div className={cn("border-l-4 pl-4", t.rail, className)}>{children}</div>;
}
