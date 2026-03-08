export type SessionMode = "scratch" | "upload";
export type AIEngine = "gemini" | "chatgpt" | "openrouter" | "groq";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type SectionStatus = "pending" | "active" | "done";

export interface SectionState {
  id: string;
  label: string;
  status: SectionStatus;
}

export const SECTIONS: SectionState[] = [
  { id: "contact", label: "Información de contacto", status: "pending" },
  { id: "summary", label: "Resumen profesional", status: "pending" },
  { id: "education", label: "Educación", status: "pending" },
  { id: "projects", label: "Proyectos y experiencia", status: "pending" },
  { id: "skills", label: "Habilidades", status: "pending" },
  { id: "extracurricular", label: "Actividades extracurriculares", status: "pending" },
  { id: "certifications", label: "Certificaciones", status: "pending" },
];
