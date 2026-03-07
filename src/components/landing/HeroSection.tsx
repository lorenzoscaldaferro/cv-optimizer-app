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
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section className="relative flex flex-col items-center text-center px-4 py-32 max-w-4xl mx-auto overflow-hidden">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] bg-[length:200%_100%] animate-bg-pan pointer-events-none" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />


      <div className="flex flex-col items-center justify-center w-full">
        <motion.h1
          className="text-5xl sm:text-7xl font-sans font-bold text-foreground leading-[1.1] tracking-tight mb-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="mb-2">Crea un CV que logra</span>
          <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.2em] pb-2">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute font-semibold text-primary drop-shadow-sm"
                initial={{ opacity: 0, y: "-100%" }}
                transition={{ type: "spring", stiffness: 50 }}
                animate={
                  titleNumber === index
                    ? { y: 0, opacity: 1 }
                    : {
                      y: titleNumber > index ? "-150%" : "150%",
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
        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-sans"
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
          className="btn-primary group"
        >
          Comenzar Gratis
          <ArrowRight className="h-4 w-4 ml-2 inline-block transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      <motion.div
        className="mt-12 flex items-center gap-6 text-sm text-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {["Optimizado para ATS", "Creación guiada", "Descarga instantánea"].map(
          (item) => (
            <span key={item} className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              {item}
            </span>
          )
        )}
      </motion.div>
    </section>
  );
}
