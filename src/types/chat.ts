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
  { id: "contact", label: "Contact Info", status: "pending" },
  { id: "summary", label: "Professional Summary", status: "pending" },
  { id: "education", label: "Education", status: "pending" },
  { id: "projects", label: "Projects", status: "pending" },
  { id: "skills", label: "Skills", status: "pending" },
  { id: "extracurricular", label: "Extracurricular", status: "pending" },
  { id: "certifications", label: "Certifications", status: "pending" },
];
