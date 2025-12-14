import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      block = false,
      loading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "font-semibold cursor-pointer transition-all rounded-lg border-none flex items-center justify-center";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-accent hover:-translate-y-0.5",
      secondary: "bg-secondary text-white hover:bg-dark",
      accent: "bg-accent text-dark hover:bg-primary hover:text-white",
      outline:
        "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white",
      ghost: "bg-transparent text-secondary hover:bg-primary/10 hover:text-primary",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const disabledStyles =
      disabled || loading ? "opacity-50 cursor-not-allowed" : "";
    const blockStyles = block ? "w-full flex" : "inline-flex";

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          disabledStyles,
          blockStyles,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
