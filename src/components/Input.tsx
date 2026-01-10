import React, { InputHTMLAttributes } from "react";
import { cn } from "../utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      className,
      labelClassName,
      wrapperClassName,
      icon,
      ...props
    },
    ref
  ) => (
    <div className={cn("mb-6", wrapperClassName)}>
      {label && (
        <label
          className={cn("block mb-2 font-semibold text-dark ", labelClassName)}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border-2 rounded-lg text-base transition-colors bg-[var(--color-background)] text-[var(--color-foreground)]",
            icon && "pl-10",
            error ? "border-red-500" : "border-[var(--color-beige)] focus:border-primary",
            props.disabled && "bg-[var(--color-background-soft)] cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-red-600 text-sm mt-1">{error}</span>}
      {helpText && <span className="text-dark text-sm mt-1">{helpText}</span>}
    </div>
  )
);

Input.displayName = "Input";

export default Input;
