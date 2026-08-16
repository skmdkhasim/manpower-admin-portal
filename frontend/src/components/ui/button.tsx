import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-500 text-white shadow-[0_8px_20px_-8px_rgba(47,111,237,0.6)] hover:bg-blue-600 focus-visible:outline-blue-500 disabled:bg-graphite-400 disabled:shadow-none",
  secondary:
    "bg-white text-graphite-700 border border-mist-200 hover:border-graphite-400 disabled:opacity-50",
  ghost: "bg-transparent text-graphite-600 hover:bg-mist-100 disabled:opacity-50",
  danger: "bg-coral-500 text-white hover:brightness-95 disabled:opacity-50",
  "danger-outline":
    "bg-white text-coral-500 border border-coral-500 hover:bg-coral-100 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
