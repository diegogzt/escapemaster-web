"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
