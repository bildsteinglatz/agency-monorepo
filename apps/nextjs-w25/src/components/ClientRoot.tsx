"use client";
import { GodNavProvider } from "./GodNavContext";
import { GodSidebarMarginProvider } from "./GodSidebarMarginContext";
import { CollectionProvider } from "../context/CollectionContext";
import { IntroProvider } from "../context/IntroContext";
import { RetractionProvider } from "./RetractionContext";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <GodSidebarMarginProvider>
      <GodNavProvider>
        <CollectionProvider>
          <RetractionProvider>
            <IntroProvider>
              {children}
            </IntroProvider>
          </RetractionProvider>
        </CollectionProvider>
      </GodNavProvider>
    </GodSidebarMarginProvider>
  );
}
