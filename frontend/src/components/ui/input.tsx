import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-mist-200 bg-white px-3 text-sm text-graphite-900 placeholder:text-graphite-400",
        "focus:border-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500",
        "disabled:bg-mist-100 disabled:text-graphite-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-graphite-900 placeholder:text-graphite-400",
      "focus:border-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-mist-200 bg-white px-3 text-sm text-graphite-900",
        "focus:border-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-600", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-coral-500">{children}</p>;
}
