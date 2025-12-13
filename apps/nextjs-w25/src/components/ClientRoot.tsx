"use client";
import { GodNavProvider } from "./GodNavContext";
import { GodSidebarMarginProvider } from "./GodSidebarMarginContext";
import { CollectionProvider } from "../context/CollectionContext";
import { IntroProvider } from "../context/IntroContext";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <GodSidebarMarginProvider>
      <GodNavProvider>
        <CollectionProvider>
          <IntroProvider>
            {children}
          </IntroProvider>
        </CollectionProvider>
      </GodNavProvider>
    </GodSidebarMarginProvider>
  );
}
