"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, FileDown, Search } from "lucide-react";

const features = [
  {
    icon: <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />,
    title: "Formato ATS-First",
    description:
      "Diseño de una columna, fuentes estándar, sin tablas ni gráficos — construido para superar los sistemas de selección.",
  },
  {
    icon: <Zap className="h-5 w-5 text-foreground" strokeWidth={1.5} />,
    title: "Entrevista Guiada",
    description:
      "La IA te guía a través de 7 secciones, hace las preguntas correctas y redacta con la fórmula de Verbo de Acción + Resultado.",
  },
  {
    icon: <FileDown className="h-5 w-5 text-foreground" strokeWidth={1.5} />,
    title: "Descarga Instantánea .docx",
    description:
      "Descarga un documento de Word con formato profesional. Ábrelo en Word o Google Docs, expórtalo a PDF en un clic.",
  },
  {
    icon: <Search className="h-5 w-5 text-foreground" strokeWidth={1.5} />,
    title: "Modo Auditoría de CV",
    description:
      "Sube tu CV actual y obtén una auditoría puntuada: problemas críticos, correcciones y una versión reconstruida.",
  },
];

export function FeatureCards() {
  return (
    <section className="px-4 pb-28 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="flex flex-col items-start p-6 rounded-xl bg-zinc-950/40 border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
          >
            <div className="mb-4 p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 group-hover:text-white transition-colors">
              {feature.icon}
            </div>
            <h3 className="font-sans font-semibold text-sm text-zinc-100 mb-1.5 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
