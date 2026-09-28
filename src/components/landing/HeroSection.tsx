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
    <section className="relative flex flex-col items-center text-center px-4 py-28 max-w-4xl mx-auto overflow-hidden">
      {/* Background Animated Pan and Cyan Ambient Glow */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.03)_50%,transparent_100%)] bg-[length:200%_100%] animate-bg-pan pointer-events-none" />
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-cyan-500/10 via-cyan-500/3 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col items-center justify-center w-full">
        <motion.h1
          className="text-5xl sm:text-7xl font-sans font-bold text-foreground leading-[1.1] tracking-tight mb-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="mb-2 text-zinc-100">Crea un CV que logra</span>
          <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.25em] pb-2">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-200 drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]"
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
        className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-sans"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Una entrevista guiada por IA que convierte tu experiencia en un CV .docx optimizado
        para ATS — sección por sección, punto por punto. Pensado para estudiantes y
        profesionales junior.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/onboarding"
          className="btn-primary group h-12 px-7 text-base font-medium shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] transition-all"
        >
          Comenzar Gratis
          <ArrowRight className="h-4 w-4 ml-2 inline-block transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      <motion.div
        className="mt-14 flex flex-wrap justify-center items-center gap-6 text-sm text-zinc-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {["Optimizado para ATS", "Creación guiada", "Descarga instantánea .docx", "BYOK seguro"].map(
          (item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
              <span>{item}</span>
            </span>
          )
        )}
      </motion.div>
    </section>
  );
}
