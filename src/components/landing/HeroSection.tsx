"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["entrevistas", "impacto", "atención", "respuestas", "ofertas"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2400);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section className="relative flex flex-col items-center text-center px-4 pt-32 pb-24 max-w-4xl mx-auto">
      {/* Vercel-style subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/[0.07] via-white/[0.01] to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top subtle announcement badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.1] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini 2.5 / 3.1 & OpenAI • Modelos 2026</span>
        </span>
      </motion.div>

      <div className="flex flex-col items-center justify-center w-full">
        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold text-foreground leading-[1.1] tracking-tight mb-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span className="text-zinc-100">Crea un CV que logra</span>
          <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.25em] text-white">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400"
                initial={{ opacity: 0, y: "-100%" }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                animate={
                  titleNumber === index
                    ? { y: 0, opacity: 1 }
                    : {
                      y: titleNumber > index ? "-120%" : "120%",
                      opacity: 0,
                    }
                }
              >
                {title}
              </motion.span>
            ))}
          </span>
        </motion.h1>
      </div>

      <motion.p
        className="text-base sm:text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed font-sans"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Una entrevista guiada por IA que estructura tu experiencia punto por punto y genera un archivo .docx profesional optimizado para superar los filtros ATS.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Link
          href="/onboarding"
          className="btn-primary group h-11 px-6 text-sm font-medium"
        >
          Comenzar Gratis
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      <motion.div
        className="mt-14 flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {["Formato ATS de una columna", "Entrevista paso a paso", "Exportación instantánea .docx", "BYOK seguro"].map(
          (item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
              <span>{item}</span>
            </span>
          )
        )}
      </motion.div>
    </section>
  );
}
