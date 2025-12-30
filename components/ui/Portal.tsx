"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  targetId?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, targetId }) => {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let portalTarget: HTMLElement | null = null;
    if (targetId) {
      portalTarget = document.getElementById(targetId);
      if (!portalTarget) {
        portalTarget = document.createElement("div");
        portalTarget.id = targetId;
        document.body.appendChild(portalTarget);
      }
    } else {
      portalTarget = document.body;
    }
    setContainer(portalTarget);
    return () => {
      if (targetId && portalTarget && portalTarget.parentElement === document.body) {
        document.body.removeChild(portalTarget);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || !container) return null;
  return createPortal(children, container);
};
