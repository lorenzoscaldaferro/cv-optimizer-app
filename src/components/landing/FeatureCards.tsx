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
    <section className="px-4 pb-20 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="card flex flex-col items-start bg-card/50 hover:bg-card border-white/5 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="mb-4 p-2.5 bg-background rounded-lg border border-white/5 shadow-sm group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-1 tracking-wide">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
