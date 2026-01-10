import React, { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, ...props }, ref) => (
    <div className="mb-6">
      {label && (
        <label className="block mb-2 font-semibold text-[var(--color-foreground)] ">{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border-2 rounded-lg text-base transition-colors bg-[var(--color-background)] text-[var(--color-foreground)] cursor-pointer",
          error
            ? "border-red-500"
            : "border-[var(--color-beige)] focus:border-primary focus:outline-none",
          className
        )}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <span className="text-red-600 text-sm mt-1">{error}</span>}
    </div>
  )
);

Select.displayName = "Select";

export default Select;
