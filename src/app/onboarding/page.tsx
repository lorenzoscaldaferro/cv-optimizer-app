"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ModeSelector } from "@/components/onboarding/ModeSelector";
import { AIEngineSelector } from "@/components/onboarding/AIEngineSelector";
import { KeyConfigStep } from "@/components/onboarding/KeyConfigStep";
import { useCVStore } from "@/store/cv-store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { AIEngine } from "@/types/chat";

function OnboardingContent() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 1.5 | 2>(1);
  const { setAIEngine, aiEngine } = useCVStore();

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) return null;

  function handleEngineSelect(engine: AIEngine) {
    setAIEngine(engine);
    // Smooth transition to next step (Key Config)
    setTimeout(() => setStep(1.5), 300);
  }

  function handleKeySuccess() {
    setStep(2);
  }

  const stepContent = {
    1: {
      title: "Elige tu motor de IA",
      description: "Selecciona cómo quieres potenciar la creación de tu CV.",
      component: <AIEngineSelector onSelect={handleEngineSelect} />,
    },
    1.5: {
      title: "Configuración de Acceso",
      description: "Ingresá tu API Key para habilitar el motor seleccionado.",
      component: aiEngine ? (
        <KeyConfigStep
          engine={aiEngine}
          onSuccess={handleKeySuccess}
          onBack={() => setStep(1)}
        />
      ) : null,
    },
    2: {
      title: "¿Cómo te gustaría empezar?",
      description: "Elige tu punto de partida — siempre puedes subir uno más tarde.",
      component: <ModeSelector />,
    },
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <Link
        href={step === 1 ? "/" : "#"}
        onClick={(e) => {
          if (step !== 1) {
            e.preventDefault();
            setStep(step === 2 ? 1.5 : 1);
          }
        }}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 1 ? "Volver al inicio" : "Volver atrás"}
      </Link>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-3xl font-heading font-bold text-foreground mb-3 tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {stepContent[step].title}
              </motion.h1>
              <p className="text-sm text-muted-foreground font-sans max-w-[320px] mx-auto">
                {stepContent[step].description}
              </p>
            </div>

            {stepContent[step].component}
          </motion.div>
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-12">
          {[1, 1.5, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-primary" : "w-2 bg-white/10"
                }`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
