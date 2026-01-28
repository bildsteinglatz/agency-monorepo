'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps {
  selector: string;
  children: React.ReactNode;
}

export default function ClientPortal({ selector, children }: ClientPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setElement(document.getElementById(selector));
    
    return () => setMounted(false);
  }, [selector]);

  // If selector is explicitly for footer, retry finding it slightly later if not found immediately
  // This helps when footer renders later in the tree
  useEffect(() => {
      if (!element && mounted) {
          const timer = setTimeout(() => {
              setElement(document.getElementById(selector));
          }, 100);
          return () => clearTimeout(timer);
      }
  }, [element, mounted, selector]);

  if (mounted && element) {
    return createPortal(children, element);
  }

  return null;
}
