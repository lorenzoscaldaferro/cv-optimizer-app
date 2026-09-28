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
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-b from-white/[0.06] to-transparent rounded-full blur-[80px] pointer-events-none" />

      <Link
        href={step === 1 ? "/" : "#"}
        onClick={(e) => {
          if (step !== 1) {
            e.preventDefault();
            setStep(step === 2 ? 1.5 : 1);
          }
        }}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{step === 1 ? "Volver al inicio" : "Volver atrás"}</span>
      </Link>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-2xl sm:text-3xl font-sans font-bold text-white mb-2 tracking-tight"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                {stepContent[step].title}
              </motion.h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-[340px] mx-auto">
                {stepContent[step].description}
              </p>
            </div>

            {stepContent[step].component}
          </motion.div>
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mt-10">
          {[1, 1.5, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                step === i ? "w-6 bg-white" : "w-1.5 bg-white/20"
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
