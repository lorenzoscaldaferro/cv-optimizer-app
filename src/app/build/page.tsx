"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCVStore } from "@/store/cv-store";
import { SectionTracker } from "@/components/progress/SectionTracker";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { CVReadyModal } from "@/components/download/CVReadyModal";

export default function BuildPage() {
  const { sessionMode, reset } = useCVStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to finish reading sessionStorage before checking sessionMode.
  // Without this, the store briefly returns initialState (sessionMode: null) after
  // Fast Refresh, causing the page to flash blank or redirect incorrectly.
  useEffect(() => {
    if (useCVStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useCVStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionMode) router.replace("/onboarding");
  }, [hydrated, sessionMode, router]);

  if (!hydrated || !sessionMode) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop: left panel — section tracker */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <button
            onClick={() => {
              if (window.confirm("¿Seguro que quieres volver? Se perderá el progreso de esta sesión.")) {
                reset();
                router.replace("/onboarding");
              }
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-foreground font-sans tracking-wide">Creador de CV</span>
          </div>
        </div>
        <SectionTracker />
      </aside>

      {/* Right panel — chat */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile section tracker — lg:hidden so it doesn't fight with the left aside on desktop */}
        <div className="lg:hidden">
          <SectionTracker />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      <CVReadyModal />
    </div>
  );
}
