"use client";
import React, { useEffect, useCallback } from "react";
import { Portal } from "./Portal";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollLock?: boolean;
}

export const ModalShell: React.FC<ModalShellProps> = ({ isOpen, onClose, children, scrollLock = true }) => {
  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    if (scrollLock) {
      const prevStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevStyle;
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown, scrollLock]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-200"
          onClick={onClose}
        />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {children}
        </div>
      </div>
    </Portal>
  );
};
