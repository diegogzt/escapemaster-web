import React, { ReactNode, HTMLAttributes } from "react";
import { cn } from "../utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: ReactNode;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <div
    className={cn(
      "bg-white border-2 border-light rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn("border-b border-beige pb-4 mb-4", className)}>
    {children}
  </div>
);

const CardTitle = ({ children, level = "h4", className }: CardTitleProps) => {
  const Component = level;
  return (
    <Component className={cn("text-primary text-xl mb-2", className)}>
      {children}
    </Component>
  );
};

export const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn("mt-6 pt-6 border-t border-beige", className)}>
    {children}
  </div>
);

export const CardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("", className)}>{children}</div>;

export { Card, CardHeader, CardTitle };
export default Card;
